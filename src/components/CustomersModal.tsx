"use client";

import { useState, useEffect, useCallback } from "react";
import type { Customer } from "@/lib/types";

interface Props {
  onClose: () => void;
}

export default function CustomersModal({ onClose }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("orders");

  const loadCustomers = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("sort", sort);
    fetch(`/api/customers?${params}`)
      .then((res) => res.json())
      .then(setCustomers);
  }, [search, sort]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleExport = () => {
    const header =
      "Customer Name,Contacts,Orders,Items,Total Spent,Total Cost,Total Profit,Profit Margin\n";
    const rows = customers
      .map(
        (c) =>
          `"${c.name}","${c.contact1}${c.contact2 ? ` | ${c.contact2}` : ""}",${c.totalOrders || 0},${c.totalItems || 0},Rs.${(c.totalSpent || 0).toLocaleString()},Rs.${(c.totalCost || 0).toLocaleString()},Rs.${(c.totalProfit || 0).toLocaleString()},${(c.profitMargin || 0).toFixed(2)}%`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-[1100px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Customers</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm">Sort:</span>
            <select
              className="input-field w-48"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="orders">Orders Count (High to Low)</option>
              <option value="spent">Total Spent (High to Low)</option>
              <option value="name">Name (A-Z)</option>
            </select>

            <span className="text-sm">Search:</span>
            <input
              className="input-field w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />

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
                <th className="table-header">Customer Name</th>
                <th className="table-header">Contacts</th>
                <th className="table-header">Orders</th>
                <th className="table-header">Items</th>
                <th className="table-header">Total Spent</th>
                <th className="table-header">Total Cost</th>
                <th className="table-header">Total Profit</th>
                <th className="table-header">Profit Mar...</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{c.name}</td>
                  <td className="table-cell text-sm">
                    {c.contact1}
                    {c.contact2 ? ` | ${c.contact2}` : ""}
                  </td>
                  <td className="table-cell">{c.totalOrders || 0}</td>
                  <td className="table-cell">{c.totalItems || 0}</td>
                  <td className="table-cell">
                    Rs. {(c.totalSpent || 0).toLocaleString()}
                  </td>
                  <td className="table-cell">
                    Rs. {(c.totalCost || 0).toLocaleString()}
                  </td>
                  <td className="table-cell">
                    Rs. {(c.totalProfit || 0).toLocaleString()}
                  </td>
                  <td className="table-cell">
                    {(c.profitMargin || 0).toFixed(2)}%
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-gray-400"
                  >
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
