import Anthropic from "@anthropic-ai/sdk";
import type { ParsedRecipe } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-haiku-4-5-20251001";

const RECIPE_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          quantity: { type: "string" },
          unit: { type: "string" },
        },
        required: ["name", "quantity", "unit"],
      },
    },
    method: { type: "array", items: { type: "string" } },
    prepMins: { type: "number" },
    cookMins: { type: "number" },
    servings: { type: "number" },
    tags: { type: "array", items: { type: "string" } },
  },
  required: ["name", "description", "ingredients", "method", "prepMins", "cookMins", "servings", "tags"],
};

export async function parseRecipe(params: {
  imageBase64?: string;
  text?: string;
}): Promise<ParsedRecipe> {
  const content: Anthropic.MessageParam["content"] = [];

  if (params.imageBase64) {
    const match = params.imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: match[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: match[2],
        },
      });
    }
  }

  const textPrompt = params.text
    ? `Here is the recipe text:\n${params.text}\n\n`
    : "";

  content.push({
    type: "text",
    text: `${textPrompt}Extract this recipe and return it as JSON matching the required schema. For missing times use 0. For missing description use an empty string.`,
  });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: "You are a recipe parser. Extract recipe details and return only valid JSON.",
    messages: [{ role: "user", content }],
    tools: [
      {
        name: "save_recipe",
        description: "Save the parsed recipe",
        input_schema: RECIPE_SCHEMA as Anthropic.Tool["input_schema"],
      },
    ],
    tool_choice: { type: "any" },
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured recipe");
  }

  return toolUse.input as ParsedRecipe;
}

export async function suggestMeals(params: {
  inventoryItems: { name: string; quantity?: string | null }[];
  filledSlots: { day: string; meal: string; recipeName: string }[];
  emptySlots: { day: string; meal: string }[];
}): Promise<string> {
  const inventoryList = params.inventoryItems
    .map((i) => `- ${i.name}${i.quantity ? ` (${i.quantity})` : ""}`)
    .join("\n");

  const filledList = params.filledSlots
    .map((s) => `- ${s.day} ${s.meal}: ${s.recipeName}`)
    .join("\n");

  const emptyList = params.emptySlots
    .map((s) => `- ${s.day} ${s.meal}`)
    .join("\n");

  const userMessage = `
Available in my pantry/fridge:
${inventoryList || "Nothing listed yet"}

Already planned this week:
${filledList || "Nothing planned yet"}

Empty slots to fill:
${emptyList || "None"}

Please suggest budget-friendly meals for the empty slots using what I have at home.
At the end, add 1-2 "✨ Culinary/Premium" suggestions that are a bit more special.
Keep it practical and personal.
`.trim();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: "You are a friendly personal meal planning assistant. Give concise, practical suggestions.",
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content.find((b) => b.type === "text");
  return text?.type === "text" ? text.text : "No suggestions available.";
}
