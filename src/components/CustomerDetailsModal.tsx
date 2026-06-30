"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { Customer } from "@/lib/types";

interface Props {
  customer: Customer | null;
  onSave: (customer: Customer) => void;
  onClose: () => void;
}

export default function CustomerDetailsModal({
  customer,
  onSave,
  onClose,
}: Props) {
  const [name, setName] = useState(customer?.name || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [contact1, setContact1] = useState(customer?.contact1 || "");
  const [contact2, setContact2] = useState(customer?.contact2 || "");
  const [email, setEmail] = useState(customer?.email || "");

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    try {
      const body = { name, address, contact1, contact2, email };
      let res;

      if (customer?.id) {
        res = await fetch("/api/customers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: customer.id, ...body }),
        });
      } else {
        res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const saved = await res.json();
      toast.success("Customer saved!");
      onSave(saved);
    } catch {
      toast.error("Failed to save customer");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-[500px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Customer Details</h3>
          <button onClick={onClose} className="text-gray-500 text-xl">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <label className="w-36 text-sm font-medium">Customer Name:</label>
            <input
              className="input-field flex-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-4">
            <label className="w-36 text-sm font-medium mt-2">
              Customer Address:
            </label>
            <textarea
              className="input-field flex-1 h-20 resize-none"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-36 text-sm font-medium">Contact Number 1:</label>
            <input
              className="input-field flex-1"
              value={contact1}
              onChange={(e) => setContact1(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-36 text-sm font-medium">Contact Number 2:</label>
            <input
              className="input-field flex-1"
              value={contact2}
              onChange={(e) => setContact2(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-36 text-sm font-medium">Email:</label>
            <input
              type="email"
              className="input-field flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
