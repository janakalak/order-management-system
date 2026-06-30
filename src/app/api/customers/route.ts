import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "name";

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { contact1: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {};

  const customers = await prisma.customer.findMany({
    where,
    include: {
      orders: {
        where: { isDraft: false },
        include: { items: true },
      },
    },
    orderBy: sort === "name" ? { name: "asc" } : { createdAt: "desc" },
  });

  const enriched = customers.map((c) => {
    const orders = c.orders;
    const totalOrders = orders.length;
    const totalItems = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
    const totalCost = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.cost * i.quantity, 0),
      0
    );
    const totalProfit = totalSpent - totalCost;
    const profitMargin = totalSpent > 0 ? (totalProfit / totalSpent) * 100 : 0;

    return {
      id: c.id,
      name: c.name,
      address: c.address,
      contact1: c.contact1,
      contact2: c.contact2,
      email: c.email,
      totalOrders,
      totalItems,
      totalSpent,
      totalCost,
      totalProfit,
      profitMargin,
    };
  });

  if (sort === "orders") {
    enriched.sort((a, b) => b.totalOrders - a.totalOrders);
  } else if (sort === "spent") {
    enriched.sort((a, b) => b.totalSpent - a.totalSpent);
  }

  return Response.json(enriched);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const customer = await prisma.customer.create({ data: body });
  return Response.json(customer);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...data } = body;
  const customer = await prisma.customer.update({ where: { id }, data });
  return Response.json(customer);
}
