"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Customer, OrderItem, InvoiceTemplate } from "@/lib/types";

interface Props {
  orderItems: OrderItem[];
  customer: Customer | null;
  total: number;
  subTotal: number;
  discount: number;
  deliveryCharge: number;
  onClose: () => void;
}

export default function InvoiceGenerateModal({
  orderItems,
  customer,
  total,
  subTotal,
  discount,
  deliveryCharge,
  onClose,
}: Props) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch("/api/invoice-templates")
      .then((res) => res.json())
      .then((data: InvoiceTemplate[]) => {
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(data[0].name);
          setNote(data[0].content);
        }
      });
  }, []);

  const handleTemplateChange = (name: string) => {
    setSelectedTemplate(name);
    const tmpl = templates.find((t) => t.name === name);
    if (tmpl) setNote(tmpl.content);
  };

  const handleInsertData = () => {
    let text = note;
    text = text.replace(
      "{customer}",
      customer?.name || "Walk-in"
    );
    text = text.replace("{total}", `Rs.${total.toLocaleString()}`);
    text = text.replace("{subtotal}", `Rs.${subTotal.toLocaleString()}`);
    setNote(text);
  };

  const handleSaveAndGenerate = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const itemsHtml = orderItems
      .map(
        (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${item.product?.description || ""}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">Rs.${item.unitPrice.toLocaleString()}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">Rs.${item.total.toLocaleString()}</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
      <html><head><title>Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 700px; margin: 0 auto; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .note { white-space: pre-wrap; margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
      </style></head><body>
      <div class="header">
        <div><h2>INVOICE</h2></div>
        <div style="text-align:right;">
          <p>Date: ${new Date().toLocaleDateString()}</p>
          ${customer ? `<p>Customer: ${customer.name}</p>` : ""}
        </div>
      </div>
      <table>
        <thead><tr>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #333;">Description</th>
          <th style="text-align:center;padding:8px;border-bottom:2px solid #333;">Qty</th>
          <th style="text-align:right;padding:8px;border-bottom:2px solid #333;">Unit Price</th>
          <th style="text-align:right;padding:8px;border-bottom:2px solid #333;">Total</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="text-align:right;margin-top:10px;">
        <p>Sub Total: Rs.${subTotal.toLocaleString()}</p>
        ${discount > 0 ? `<p>Discount: -Rs.${discount.toLocaleString()}</p>` : ""}
        ${deliveryCharge > 0 ? `<p>Delivery: Rs.${deliveryCharge.toLocaleString()}</p>` : ""}
        <p style="font-size:1.2em;font-weight:bold;">TOTAL: Rs.${total.toLocaleString()}</p>
      </div>
      <div class="note">${note.replace(/\n/g, "<br>")}</div>
      <script>window.print();</script>
      </body></html>
    `);
    printWindow.document.close();
    toast.success("Invoice generated!");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-[600px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Generate Invoice</h3>
          <button onClick={onClose} className="text-gray-500 text-xl">
            &times;
          </button>
        </div>

        <div className="p-6">
          <p className="font-medium mb-2">Note:</p>
          <textarea
            className="input-field h-40 resize-none mb-4"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex items-center gap-3">
            <button
              className="btn-secondary text-sm"
              onClick={handleInsertData}
            >
              Insert Data
            </button>
            <span className="text-sm text-gray-500">Templates:</span>
            <select
              className="input-field w-48"
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSaveAndGenerate}>
            Save &amp; Generate Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
