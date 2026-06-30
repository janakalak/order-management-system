---
name: testing-oms
description: Test the Order Management System end-to-end. Use when verifying OMS UI, order creation, or API changes.
---

# Testing the Order Management System

## Setup

1. Ensure dependencies are installed: `npm install`
2. Generate Prisma client: `npx prisma generate`
3. Run migrations: `npx prisma migrate dev`
4. Seed database: `npx tsx prisma/seed.ts`
5. Start dev server: `npm run dev` (runs on localhost:3000)

## Key Architecture

- **Framework**: Next.js 16 with App Router, React 19, TypeScript
- **Database**: Prisma 7 with SQLite via `@prisma/adapter-better-sqlite3` at `prisma/dev.db`
- **Styling**: Tailwind CSS with custom CSS classes in `globals.css`
- **Charts**: Recharts for sales analytics
- **Notifications**: react-hot-toast

## App Structure

- **Main view**: `OrderPage` component is always visible as the primary content
- **Navigation**: Top nav bar has 8 module buttons (Products, Orders, Invoices, Quotations, Drafts, Sales, Customers, Cash) + Settings - each opens a full-screen modal overlay
- **Modals**: All modules open as modals on top of the OrderPage; close via X button or close callback

## Primary Test Flow: Order Creation

1. Navigate to `http://localhost:3000`
2. Click "Select" next to Product ID to open ProductSelectModal
3. Click a product row to select it (auto-populates form fields)
4. Set quantity and optional discount, click "Insert" to add to order
5. Click "Select" next to Customer to open CustomerSelectModal
6. Click a customer row to assign them
7. Set payment status (Pending/Paid/Partial Paid)
8. Click "Confirm & Generate Receipt" to submit the order
9. Receipt modal appears with company branding and order details
10. Close receipt, then verify in Orders modal and Customers modal

## Seed Data (for assertions)

- **Products**: CL001-CL010, e.g. CL001 "Men's Cotton T-Shirt" cost Rs.450, price Rs.890, stock 198
- **Customers**: Saman Silva, Visula, Dinesh Silva, Amila Perera, Chathurika Silva
- **Company**: Cotton Craft, Colombo, Sri Lanka
- **Delivery services**: Trans Express, DHL, FedEx
- **Currency**: Sri Lankan Rupees (Rs.)

## Calculation Verification

- Item total (percentage discount): `unitPrice * qty * (1 - discount/100)`
- Item total (fixed discount): `unitPrice * qty - discount * qty`
- Sub Total: sum of all item totals
- Total: Sub Total + delivery charge
- Balance: Total - paid amount
- Order discount: sum of per-item discounts
- Profit: Total - Cost (where cost = sum of `item.cost * item.quantity`)
- Profit Margin: `(profit / total) * 100`

## Common Issues

- Prisma 7 requires the adapter pattern (`PrismaBetterSqlite3`), not a connection string
- The generated Prisma client is at `src/generated/prisma/client` (not `src/generated/prisma`)
- SQLite database is at `prisma/dev.db` - ensure migrations have been run before seeding
- Receipt/Invoice generation opens a new browser window for printing - popup blockers may interfere
- Next.js 16 has breaking changes from standard Next.js - check `node_modules/next/dist/docs/` for docs

## Devin Secrets Needed

None - this app runs fully locally with SQLite, no external services required.
