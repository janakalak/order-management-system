"use client";

import { useState } from "react";
import OrderPage from "@/components/OrderPage";
import ProductsModal from "@/components/ProductsModal";
import OrdersListModal from "@/components/OrdersListModal";
import CustomersModal from "@/components/CustomersModal";
import SalesModal from "@/components/SalesModal";
import CashModal from "@/components/CashModal";
import SettingsModal from "@/components/SettingsModal";

type ModalType =
  | "products"
  | "orders"
  | "invoices"
  | "quotations"
  | "drafts"
  | "sales"
  | "customers"
  | "cash"
  | "settings"
  | null;

export default function Home() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [restrictedMode, setRestrictedMode] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-blue-600">OMS</h1>
            <button
              onClick={() => setRestrictedMode(!restrictedMode)}
              className={`text-xs px-3 py-1 rounded border ${
                restrictedMode
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "bg-gray-50 border-gray-300 text-gray-600"
              }`}
            >
              Restricted Mode : {restrictedMode ? "ON" : "OFF"}
            </button>
          </div>
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveModal("products")}
              className="nav-tab"
            >
              Products
            </button>
            <button
              onClick={() => setActiveModal("orders")}
              className="nav-tab"
            >
              Orders
            </button>
            <button
              onClick={() => setActiveModal("invoices")}
              className="nav-tab"
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveModal("quotations")}
              className="nav-tab"
            >
              Quotations
            </button>
            <button
              onClick={() => setActiveModal("drafts")}
              className="nav-tab"
            >
              Drafts
            </button>
            <button
              onClick={() => setActiveModal("sales")}
              className="nav-tab"
            >
              Sales
            </button>
            <button
              onClick={() => setActiveModal("customers")}
              className="nav-tab"
            >
              Customers
            </button>
            <button
              onClick={() => setActiveModal("cash")}
              className="nav-tab"
            >
              Cash
            </button>
          </nav>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveModal("settings")}
              className="nav-tab"
            >
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <OrderPage restrictedMode={restrictedMode} />
      </main>

      {activeModal === "products" && (
        <ProductsModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "orders" && (
        <OrdersListModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "invoices" && (
        <OrdersListModal
          onClose={() => setActiveModal(null)}
          filterType="invoices"
        />
      )}
      {activeModal === "quotations" && (
        <OrdersListModal
          onClose={() => setActiveModal(null)}
          filterType="quotations"
        />
      )}
      {activeModal === "drafts" && (
        <OrdersListModal
          onClose={() => setActiveModal(null)}
          filterType="drafts"
        />
      )}
      {activeModal === "sales" && (
        <SalesModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "customers" && (
        <CustomersModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "cash" && (
        <CashModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "settings" && (
        <SettingsModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
