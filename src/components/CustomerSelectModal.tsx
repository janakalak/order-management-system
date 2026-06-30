"use client";

import { useState, useEffect } from "react";
import type { Customer } from "@/lib/types";

interface Props {
  onSelect: (customer: Customer) => void;
  onClose: () => void;
}

export default function CustomerSelectModal({ onSelect, onClose }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then(setCustomers);
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact1.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-[600px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Select Customer</h3>
          <button onClick={onClose} className="text-gray-500 text-xl">
            &times;
          </button>
        </div>

        <div className="p-4">
          <input
            className="input-field mb-4"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          <div className="max-h-[400px] overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Email</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => onSelect(c)}
                  >
                    <td className="table-cell">{c.name}</td>
                    <td className="table-cell">{c.contact1}</td>
                    <td className="table-cell">{c.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
