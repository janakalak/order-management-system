import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const isDraft = searchParams.get("isDraft") === "true";
  const sort = searchParams.get("sort") || "newest";

  const where: Record<string, unknown> = { isDraft };
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: true,
      items: { include: { product: true } },
    },
    orderBy:
      sort === "newest"
        ? { orderNumber: "desc" }
        : { orderNumber: "asc" },
  });

  const enriched = orders.map((o) => {
    const cost = o.items.reduce((sum, i) => sum + i.cost * i.quantity, 0);
    const profit = o.total - cost;
    const profitMargin = o.total > 0 ? (profit / o.total) * 100 : 0;
    return { ...o, cost, profit, profitMargin };
  });

  return Response.json(enriched);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const maxOrder = await prisma.order.findFirst({
    orderBy: { orderNumber: "desc" },
  });
  const nextOrderNumber = (maxOrder?.orderNumber || 1000) + 1;

  const order = await prisma.order.create({
    data: {
      orderNumber: nextOrderNumber,
      status: body.status || "Pending",
      trackingNumber: body.trackingNumber || "",
      deliveryService: body.deliveryService || "",
      packageWeight: body.packageWeight || 0,
      deliveryCharge: body.deliveryCharge || 0,
      freeDelivery: body.freeDelivery || false,
      discount: body.discount || 0,
      discountType: body.discountType || "percentage",
      subTotal: body.subTotal || 0,
      total: body.total || 0,
      paidAmount: body.paidAmount || 0,
      note: body.note || "",
      isDraft: body.isDraft || false,
      customerId: body.customerId || null,
      items: {
        create: body.items.map(
          (item: {
            productId: string;
            quantity: number;
            unitPrice: number;
            cost: number;
            discount: number;
            discountType: string;
            total: number;
          }) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            cost: item.cost,
            discount: item.discount || 0,
            discountType: item.discountType || "percentage",
            total: item.total,
          })
        ),
      },
    },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });

  if (!body.isDraft) {
    for (const item of body.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  return Response.json(order);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, items, ...data } = body;

  if (items) {
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    for (const item of items) {
      await prisma.orderItem.create({
        data: { ...item, orderId: id },
      });
    }
  }

  const order = await prisma.order.update({
    where: { id },
    data,
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });

  return Response.json(order);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID required" }, { status: 400 });
  await prisma.order.delete({ where: { id } });
  return Response.json({ success: true });
}
