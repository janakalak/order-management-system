import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  let settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: "default" } });
  }
  return Response.json(settings);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const settings = await prisma.settings.upsert({
    where: { id: "default" },
    update: body,
    create: { id: "default", ...body },
  });
  return Response.json(settings);
}
