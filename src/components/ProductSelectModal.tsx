"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/lib/types";

interface Props {
  onSelect: (product: Product) => void;
  onClose: () => void;
}

export default function ProductSelectModal({ onSelect, onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const filtered = products.filter(
    (p) =>
      p.productId.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-[700px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Products</h3>
          <button onClick={onClose} className="text-gray-500 text-xl">
            &times;
          </button>
        </div>

        <div className="p-4">
          <input
            className="input-field mb-4"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          <div className="max-h-[400px] overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th className="table-header">Product ID</th>
                  <th className="table-header">Description</th>
                  <th className="table-header">Price</th>
                  <th className="table-header">Stock</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => onSelect(p)}
                  >
                    <td className="table-cell">{p.productId}</td>
                    <td className="table-cell">{p.description}</td>
                    <td className="table-cell">
                      Rs. {p.sellingPrice.toLocaleString()}
                    </td>
                    <td className="table-cell">{p.stock}</td>
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
