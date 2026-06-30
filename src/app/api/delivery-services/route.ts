import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const services = await prisma.deliveryService.findMany({
    orderBy: { name: "asc" },
  });
  return Response.json(services);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const service = await prisma.deliveryService.create({
    data: {
      name: body.name,
      ratePerKg: body.ratePerKg ?? 0,
    },
  });
  return Response.json(service);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...data } = body;
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });
  const service = await prisma.deliveryService.update({
    where: { id },
    data,
  });
  return Response.json(service);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });
  await prisma.deliveryService.delete({ where: { id } });
  return Response.json({ success: true });
}
