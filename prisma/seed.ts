import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "Cotton Craft",
      companyAddress: "Colombo, Sri Lanka",
      companyPhone: "0111111111",
      companyEmail: "cottoncraft@demo.mail",
      enableLowStockWarning: true,
      lowStockLimit: 5,
      enableDeliveryOptions: true,
      defaultStatus: "Pending",
    },
  });

  const deliveryServices = [
    { name: "Trans Express", ratePerKg: 400 },
    { name: "DHL", ratePerKg: 550 },
    { name: "FedEx", ratePerKg: 500 },
  ];
  for (const svc of deliveryServices) {
    const existing = await prisma.deliveryService.findFirst({ where: { name: svc.name } });
    if (existing) {
      await prisma.deliveryService.update({ where: { id: existing.id }, data: { ratePerKg: svc.ratePerKg } });
    } else {
      await prisma.deliveryService.create({ data: svc });
    }
  }

  const templateName = "Delivery Time";
  const existingTemplate = await prisma.invoiceTemplate.findFirst({ where: { name: templateName } });
  if (!existingTemplate) {
    await prisma.invoiceTemplate.create({
      data: {
        name: templateName,
        content:
          "Delivery Time: Orders will be completed within 5-7 working days after confirmation.\n\nPayment Terms: A {60%} advance payment is required to begin production.\nThe remaining {40%} balance should be paid before delivery or collection.\n\nThank you for your order.",
      },
    });
  }

  const products = [
    { productId: "CL001", description: "Men's Cotton T-Shirt", cost: 450, sellingPrice: 890, stock: 198 },
    { productId: "CL002", description: "Men's Formal Shirt", cost: 850, sellingPrice: 1690, stock: 368 },
    { productId: "CL003", description: "Men's Denim Jeans", cost: 1200, sellingPrice: 2490, stock: 70 },
    { productId: "CL004", description: "Men's Cotton Trousers", cost: 950, sellingPrice: 1890, stock: 99 },
    { productId: "CL005", description: "Men's Polo Shirt", cost: 650, sellingPrice: 1290, stock: 107 },
    { productId: "CL006", description: "Men's Short Sleeve Shirt", cost: 550, sellingPrice: 1090, stock: 130 },
    { productId: "CL007", description: "Women's Cotton Dress", cost: 700, sellingPrice: 1490, stock: 85 },
    { productId: "CL008", description: "Women's Blouse", cost: 500, sellingPrice: 990, stock: 150 },
    { productId: "CL009", description: "Kids T-Shirt", cost: 250, sellingPrice: 490, stock: 200 },
    { productId: "CL010", description: "Kids Shorts", cost: 300, sellingPrice: 590, stock: 180 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { productId: p.productId },
      update: {},
      create: p,
    });
  }

  const customers = [
    { name: "Saman Silva", address: "123/5, Temple Road, Colombo", contact1: "0715603408", contact2: "0772424455", email: "saman.silva@gmail.com" },
    { name: "Visula", address: "423/15, Temple Road, Kurunegala", contact1: "0766488065", contact2: "0772424272", email: "saman.silva92@gmail.com" },
    { name: "Dinesh Silva", address: "78, Main Street, Kandy", contact1: "0771234567", contact2: "", email: "dinesh@gmail.com" },
    { name: "Amila Perera", address: "55, Galle Road, Galle", contact1: "0777895133", contact2: "", email: "amila.perera@gmail.com" },
    { name: "Chathurika Silva", address: "90, Station Road, Negombo", contact1: "0715937783", contact2: "0718055123", email: "chathuri@gmail.com" },
  ];

  for (const c of customers) {
    const existing = await prisma.customer.findFirst({ where: { name: c.name } });
    if (!existing) {
      await prisma.customer.create({ data: c });
    }
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
