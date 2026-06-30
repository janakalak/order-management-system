"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Product } from "@/lib/types";

interface Props {
  onClose: () => void;
}

export default function ProductsModal({ onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    description: "",
    cost: 0,
    sellingPrice: 0,
    stock: 0,
  });

  const loadProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.productId.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    try {
      if (editing) {
        await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        toast.success("Product updated!");
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Product added!");
      }
      setShowForm(false);
      setEditing(null);
      loadProducts();
    } catch {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      toast.success("Product deleted!");
      loadProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setForm({
      productId: product.productId,
      description: product.description,
      cost: product.cost,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
    });
    setShowForm(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-[900px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Products</h3>
          <div className="flex gap-2">
            <input
              className="input-field w-60"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="btn-primary text-sm"
              onClick={() => {
                setEditing(null);
                setForm({
                  productId: "",
                  description: "",
                  cost: 0,
                  sellingPrice: 0,
                  stock: 0,
                });
                setShowForm(true);
              }}
            >
              Add Product
            </button>
            <button onClick={onClose} className="text-gray-500 text-xl px-2">
              &times;
            </button>
          </div>
        </div>

        {showForm && (
          <div className="p-4 bg-blue-50 border-b space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Product ID</label>
                <input
                  className="input-field"
                  value={form.productId}
                  onChange={(e) =>
                    setForm({ ...form, productId: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <input
                  className="input-field"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cost</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.cost}
                  onChange={(e) =>
                    setForm({ ...form, cost: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Selling Price</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm({ ...form, sellingPrice: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary text-sm" onClick={handleSave}>
                {editing ? "Update" : "Add"}
              </button>
              <button
                className="btn-secondary text-sm"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="max-h-[500px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr>
                <th className="table-header">Product ID</th>
                <th className="table-header">Description</th>
                <th className="table-header">Cost</th>
                <th className="table-header">Selling Price</th>
                <th className="table-header">Stock</th>
                <th className="table-header">Margin</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-cell">{p.productId}</td>
                  <td className="table-cell">{p.description}</td>
                  <td className="table-cell">
                    Rs. {p.cost.toLocaleString()}
                  </td>
                  <td className="table-cell">
                    Rs. {p.sellingPrice.toLocaleString()}
                  </td>
                  <td
                    className={`table-cell ${
                      p.stock < 10 ? "text-red-500 font-bold" : ""
                    }`}
                  >
                    {p.stock}
                  </td>
                  <td className="table-cell">
                    {(
                      ((p.sellingPrice - p.cost) / p.sellingPrice) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                  <td className="table-cell">
                    <button
                      className="text-blue-500 text-sm mr-2 hover:underline"
                      onClick={() => handleEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 text-sm hover:underline"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
