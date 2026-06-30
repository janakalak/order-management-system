"use client";

import { useState, useEffect, useRef } from "react";
import type { Order, Settings } from "@/lib/types";

interface Props {
  orderId: string;
  onClose: () => void;
}

export default function ReceiptModal({ orderId, onClose }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([orders, s]) => {
      const found = orders.find((o: Order) => o.id === orderId);
      setOrder(found || null);
      setSettings(s);
    });
  }, [orderId]);

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Receipt #${order?.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { font-weight: bold; }
        .text-right { text-align: right; }
        .total-row { font-weight: bold; font-size: 1.1em; }
        h2 { margin: 0; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
      </style></head><body>
      ${content.innerHTML}
      <script>window.print();window.close();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  if (!order || !settings) {
    return (
      <div className="modal-overlay">
        <div className="modal-content w-[600px] p-8 text-center">
          Loading...
        </div>
      </div>
    );
  }

  const cost = order.items.reduce(
    (sum, i) => sum + i.cost * i.quantity,
    0
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-[600px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-bold">Order #{order.orderNumber}</h3>
          <button onClick={onClose} className="text-gray-500 text-xl">
            &times;
          </button>
        </div>

        <div ref={receiptRef} className="p-6">
          <div className="flex justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">{settings.companyName}</h2>
              <p className="text-sm text-gray-600">{settings.companyAddress}</p>
              <p className="text-sm text-gray-600">{settings.companyPhone}</p>
              <p className="text-sm text-gray-600">{settings.companyEmail}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-700">RECEIPT</h2>
            </div>
          </div>

          <div className="flex justify-between mb-4 text-sm">
            <div>
              <p className="font-bold">CUSTOMER</p>
              <p>{order.customer?.name || "Walk-in"}</p>
              {order.customer?.address && <p>{order.customer.address}</p>}
              {order.customer?.contact1 && (
                <p>
                  Phone: {order.customer.contact1}
                  {order.customer.contact2
                    ? ` | ${order.customer.contact2}`
                    : ""}
                </p>
              )}
              {order.customer?.email && <p>Email: {order.customer.email}</p>}
            </div>
            <div className="text-right">
              <p className="font-bold">RECEIPT DETAILS</p>
              <p>Order # {order.orderNumber}</p>
              <p>Date: {new Date(order.date).toLocaleString()}</p>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="py-2 text-left">DESCRIPTION</th>
                <th className="py-2 text-center">QTY</th>
                <th className="py-2 text-right">UNIT PRICE</th>
                <th className="py-2 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2">
                    {item.product?.description}
                    <br />
                    <span className="text-xs text-gray-500">
                      ID: {item.product?.productId}
                    </span>
                  </td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">
                    Rs.{item.unitPrice.toLocaleString()}
                  </td>
                  <td className="py-2 text-right">
                    Rs.{item.total.toLocaleString()}
                  </td>
                </tr>
              ))}
              {order.deliveryCharge > 0 && (
                <tr className="border-b border-gray-100">
                  <td className="py-2">
                    Delivery Charge
                    <br />
                    <span className="text-xs text-gray-500">
                      {order.deliveryService}
                    </span>
                  </td>
                  <td className="py-2 text-center">-</td>
                  <td className="py-2 text-right">
                    Rs.{order.deliveryCharge.toLocaleString()}
                  </td>
                  <td className="py-2 text-right">
                    Rs.{order.deliveryCharge.toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Sub Total:</span>
              <span>Rs.{order.subTotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>- Rs.{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>TOTAL:</span>
              <span>Rs.{order.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid:</span>
              <span>Rs.{order.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Balance Due:</span>
              <span>
                Rs.{(order.total - order.paidAmount).toLocaleString()}
              </span>
            </div>
            {cost > 0 && (
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Cost:</span>
                <span>Rs.{cost.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Thank you for choosing us!</p>
            <p className="text-xs">SYSTEM BY OMS</p>
          </div>
        </div>

        <div className="flex justify-center gap-3 p-4 border-t">
          <button className="btn-primary" onClick={handlePrint}>
            Print
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
