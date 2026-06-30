import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const templates = await prisma.invoiceTemplate.findMany({
    orderBy: { name: "asc" },
  });
  return Response.json(templates);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const template = await prisma.invoiceTemplate.create({ data: body });
  return Response.json(template);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...data } = body;
  const template = await prisma.invoiceTemplate.update({
    where: { id },
    data,
  });
  return Response.json(template);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });
  await prisma.invoiceTemplate.delete({ where: { id } });
  return Response.json({ success: true });
}
