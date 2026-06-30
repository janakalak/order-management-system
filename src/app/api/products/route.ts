import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { productId: "asc" },
  });
  return Response.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = await prisma.product.create({ data: body });
  return Response.json(product);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...data } = body;
  const product = await prisma.product.update({ where: { id }, data });
  return Response.json(product);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });
  await prisma.product.delete({ where: { id } });
  return Response.json({ success: true });
}
