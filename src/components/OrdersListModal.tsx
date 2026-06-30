"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import type { Order } from "@/lib/types";
import ReceiptModal from "./ReceiptModal";

interface Props {
  onClose: () => void;
  filterType?: "invoices" | "quotations" | "drafts";
}

export default function OrdersListModal({ onClose, filterType }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sort, setSort] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    const params = new URLSearchParams();
    params.set("sort", sort);
    if (statusFilter) params.set("status", statusFilter);
    if (filterType === "drafts") params.set("isDraft", "true");

    fetch(`/api/orders?${params}`)
      .then((res) => res.json())
      .then(setOrders);
  }, [sort, statusFilter, filterType]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
          paidAmount:
            newStatus === "Paid"
              ? orders.find((o) => o.id === orderId)?.total || 0
              : 0,
        }),
      });
      toast.success(`Status updated to ${newStatus}`);
      loadOrders();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Delete this order?")) return;
    try {
      await fetch(`/api/orders?id=${orderId}`, { method: "DELETE" });
      toast.success("Order deleted!");
      loadOrders();
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const handleExport = () => {
    const header = "No,Date,Customer,Status,Cost,Discount,Total,Profit,Profit Margin\n";
    const rows = orders
      .map(
        (o) =>
          `${o.orderNumber},${new Date(o.date).toLocaleDateString()},${o.customer?.name || ""},${o.status},${o.cost || 0},${o.discount},${o.total},${o.profit || 0},${(o.profitMargin || 0).toFixed(2)}%`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "status-badge status-pending";
      case "Paid":
        return "status-badge status-paid";
      case "Partial Paid":
        return "status-badge status-partial";
      default:
        return "status-badge bg-gray-100 text-gray-700";
    }
  };

  const title =
    filterType === "drafts"
      ? "Drafts"
      : filterType === "invoices"
        ? "Invoices"
        : filterType === "quotations"
          ? "Quotations"
          : "Orders";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-[1100px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">{title}</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm">Sort:</span>
            <select
              className="input-field w-40"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            {!filterType && (
              <select
                className="input-field w-36"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Partial Paid">Partial Paid</option>
              </select>
            )}

            {selectedOrder && (
              <>
                <button
                  className="btn-danger text-xs"
                  onClick={() => handleDelete(selectedOrder)}
                >
                  Delete
                </button>
                <button
                  className="btn-secondary text-xs"
                  onClick={() =>
                    handleUpdateStatus(selectedOrder, "Paid")
                  }
                >
                  Update Status
                </button>
                <button
                  className="btn-secondary text-xs"
                  onClick={() => {
                    setReceiptOrderId(selectedOrder);
                    setShowReceipt(true);
                  }}
                >
                  Generate Receipt
                </button>
              </>
            )}

            <button
              className="btn-secondary text-xs"
              onClick={handleExport}
            >
              Export
            </button>
            <button onClick={onClose} className="text-gray-500 text-xl px-2">
              &times;
            </button>
          </div>
        </div>

        <div className="max-h-[500px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="table-header">No.</th>
                <th className="table-header">Date</th>
                <th className="table-header">Customer Name</th>
                <th className="table-header">Status</th>
                <th className="table-header">Tracking...</th>
                <th className="table-header">Cost</th>
                <th className="table-header">Discount</th>
                <th className="table-header">Total</th>
                <th className="table-header">Profit</th>
                <th className="table-header">Profit Mar...</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className={`cursor-pointer hover:bg-blue-50 ${
                    selectedOrder === o.id ? "bg-blue-100" : ""
                  }`}
                  onClick={() => setSelectedOrder(o.id)}
                  onDoubleClick={() => {
                    setReceiptOrderId(o.id);
                    setShowReceipt(true);
                  }}
                >
                  <td className="table-cell">{o.orderNumber}</td>
                  <td className="table-cell text-sm">
                    {new Date(o.date).toLocaleString().substring(0, 17)}
                  </td>
                  <td className="table-cell">
                    {o.customer?.name || "-"}
                  </td>
                  <td className="table-cell">
                    <span className={getStatusBadge(o.status)}>
                      {o.status}
                    </span>
                  </td>
                  <td className="table-cell text-sm">
                    {o.trackingNumber || "-"}
                  </td>
                  <td className="table-cell">
                    Rs. {(o.cost || 0).toLocaleString()}
                  </td>
                  <td className="table-cell">
                    Rs. {o.discount.toLocaleString()}
                  </td>
                  <td className="table-cell font-medium">
                    Rs. {o.total.toLocaleString()}
                  </td>
                  <td className="table-cell">
                    Rs. {(o.profit || 0).toLocaleString()}
                  </td>
                  <td className="table-cell">
                    {(o.profitMargin || 0).toFixed(2)}%
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center py-10 text-gray-400"
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showReceipt && receiptOrderId && (
          <ReceiptModal
            orderId={receiptOrderId}
            onClose={() => {
              setShowReceipt(false);
              setReceiptOrderId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
