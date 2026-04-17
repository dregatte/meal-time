import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(params.id) } });
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const body = await req.json();
  const { name, description, ingredients, method, prepMins, cookMins, servings, photoBase64, tags } = body;

  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      name: name?.trim(),
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
  return NextResponse.json(recipe);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.recipe.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({ ok: true });
}
