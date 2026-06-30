"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import type { CashEntry } from "@/lib/types";

interface Props {
  onClose: () => void;
}

export default function CashModal({ onClose }: Props) {
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [sort, setSort] = useState("newest");
  const [showForm, setShowForm] = useState<"in" | "out" | null>(null);
  const [formAmount, setFormAmount] = useState(0);
  const [formNote, setFormNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadEntries = useCallback(() => {
    const params = new URLSearchParams();
    params.set("month", month);
    params.set("sort", sort);
    fetch(`/api/cash?${params}`)
      .then((res) => res.json())
      .then(setEntries);
  }, [month, sort]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = async () => {
    if (formAmount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      if (editingId) {
        await fetch("/api/cash", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            amount: formAmount,
            note: formNote,
          }),
        });
        toast.success("Entry updated!");
      } else {
        await fetch("/api/cash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: showForm === "in" ? "IN" : "OUT",
            amount: formAmount,
            note: formNote,
          }),
        });
        toast.success("Entry added!");
      }
      setShowForm(null);
      setEditingId(null);
      setFormAmount(0);
      setFormNote("");
      loadEntries();
    } catch {
      toast.error("Failed to save entry");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await fetch(`/api/cash?id=${id}`, { method: "DELETE" });
      toast.success("Entry deleted!");
      loadEntries();
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  const totalIn = entries
    .filter((e) => e.type === "IN")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalOut = entries
    .filter((e) => e.type === "OUT")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-[800px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Cash</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm">Filter:</span>
            <input
              type="month"
              className="input-field w-40"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <span className="text-sm">Sort:</span>
            <select
              className="input-field w-36"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <button
              className="btn-success text-sm"
              onClick={() => {
                setShowForm("in");
                setEditingId(null);
                setFormAmount(0);
                setFormNote("");
              }}
            >
              Cash In
            </button>
            <button
              className="btn-danger text-sm"
              onClick={() => {
                setShowForm("out");
                setEditingId(null);
                setFormAmount(0);
                setFormNote("");
              }}
            >
              Cash Out
            </button>
            <button onClick={onClose} className="text-gray-500 text-xl px-2">
              &times;
            </button>
          </div>
        </div>

        {showForm && (
          <div className="p-4 bg-blue-50 border-b space-y-3">
            <h4 className="font-medium">
              {editingId
                ? "Update Entry"
                : showForm === "in"
                  ? "Cash In"
                  : "Cash Out"}
            </h4>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium">Amount</label>
                <input
                  type="number"
                  className="input-field"
                  value={formAmount}
                  onChange={(e) => setFormAmount(Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Note</label>
                <input
                  className="input-field"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary text-sm" onClick={handleSave}>
                {editingId ? "Update" : "Save"}
              </button>
              <button
                className="btn-secondary text-sm"
                onClick={() => {
                  setShowForm(null);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="max-h-[400px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Type</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Note</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="table-cell text-sm">
                    {new Date(e.date).toLocaleString()}
                  </td>
                  <td className="table-cell">
                    <span
                      className={`font-bold ${
                        e.type === "IN" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {e.type}
                    </span>
                  </td>
                  <td className="table-cell">
                    Rs. {e.amount.toLocaleString()}
                  </td>
                  <td className="table-cell">{e.note}</td>
                  <td className="table-cell">
                    <button
                      className="text-blue-500 text-sm mr-2 hover:underline"
                      onClick={() => {
                        setEditingId(e.id);
                        setFormAmount(e.amount);
                        setFormNote(e.note);
                        setShowForm(e.type === "IN" ? "in" : "out");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 text-sm hover:underline"
                      onClick={() => handleDelete(e.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-gray-400"
                  >
                    No entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between p-4 border-t bg-gray-50">
          <p className="font-bold text-green-600">
            Total In: Rs. {totalIn.toLocaleString()}
          </p>
          <p className="font-bold text-red-600">
            Total Out: Rs. {totalOut.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
