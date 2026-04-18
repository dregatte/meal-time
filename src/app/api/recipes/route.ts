import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      prepMins: true,
      cookMins: true,
      servings: true,
      tags: true,
      photoBase64: true,
      ingredients: true,
      method: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(recipes);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, description, ingredients, method, prepMins, cookMins, servings, photoBase64, tags } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const recipe = await prisma.recipe.create({
    data: {
      name: name.trim(),
      description: description || null,
      ingredients: typeof ingredients === "string" ? ingredients : JSON.stringify(ingredients ?? []),
      method: typeof method === "string" ? method : JSON.stringify(method ?? []),
      prepMins: prepMins ?? 0,
      cookMins: cookMins ?? 0,
      servings: servings ?? 2,
      photoBase64: photoBase64 || null,
      tags: Array.isArray(tags) ? tags.join(",") : (tags || null),
    },
  });
  return NextResponse.json(recipe, { status: 201 });
}
