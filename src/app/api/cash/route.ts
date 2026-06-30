import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const sort = searchParams.get("sort") || "newest";

  let where = {};
  if (month) {
    const [year, m] = month.split("-").map(Number);
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 1);
    where = { date: { gte: start, lt: end } };
  }

  const entries = await prisma.cashEntry.findMany({
    where,
    orderBy: sort === "newest" ? { date: "desc" } : { date: "asc" },
  });

  return Response.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const entry = await prisma.cashEntry.create({
    data: {
      type: body.type,
      amount: body.amount,
      note: body.note || "",
      date: body.date ? new Date(body.date) : new Date(),
    },
  });
  return Response.json(entry);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...data } = body;
  if (data.date) data.date = new Date(data.date);
  const entry = await prisma.cashEntry.update({ where: { id }, data });
  return Response.json(entry);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });
  await prisma.cashEntry.delete({ where: { id } });
  return Response.json({ success: true });
}
