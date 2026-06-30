import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  let start: Date;
  let end: Date;

  if (month) {
    const [year, m] = month.split("-").map(Number);
    start = new Date(year, m - 1, 1);
    end = new Date(year, m, 1);
  } else {
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const orders = await prisma.order.findMany({
    where: {
      isDraft: false,
      date: { gte: start, lt: end },
    },
    include: {
      items: { include: { product: true } },
    },
  });

  const totalOrders = orders.length;
  const totalItems = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCost = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.cost * i.quantity, 0),
    0
  );
  const totalProfit = totalRevenue - totalCost;

  const productStats: Record<
    string,
    {
      productId: string;
      description: string;
      quantity: number;
      revenue: number;
      cost: number;
      profit: number;
    }
  > = {};

  for (const order of orders) {
    for (const item of order.items) {
      const key = item.product.productId;
      if (!productStats[key]) {
        productStats[key] = {
          productId: key,
          description: item.product.description,
          quantity: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
        };
      }
      productStats[key].quantity += item.quantity;
      productStats[key].revenue += item.total;
      productStats[key].cost += item.cost * item.quantity;
      productStats[key].profit += item.total - item.cost * item.quantity;
    }
  }

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return Response.json({
    totalOrders,
    totalItems,
    totalRevenue,
    totalCost,
    totalProfit,
    topProducts,
  });
}
