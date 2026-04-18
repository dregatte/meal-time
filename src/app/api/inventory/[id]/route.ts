import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const body = await req.json();

  const item = await prisma.inventoryItem.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(item);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  await prisma.inventoryItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
