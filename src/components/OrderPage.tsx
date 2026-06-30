"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import type { Product, Customer, OrderItem } from "@/lib/types";
import ProductSelectModal from "./ProductSelectModal";
import CustomerDetailsModal from "./CustomerDetailsModal";
import CustomerSelectModal from "./CustomerSelectModal";
import DeliveryModal from "./DeliveryModal";
import ReceiptModal from "./ReceiptModal";
import InvoiceGenerateModal from "./InvoiceGenerateModal";

interface OrderPageProps {
  restrictedMode: boolean;
}

export default function OrderPage({ restrictedMode }: OrderPageProps) {
  const [productId, setProductId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [cost, setCost] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [itemDiscount, setItemDiscount] = useState<number>(0);
  const [itemDiscountType, setItemDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliveryService, setDeliveryService] = useState("");
  const [packageWeight, setPackageWeight] = useState(0);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [status, setStatus] = useState("Pending");
  const [paidAmount, setPaidAmount] = useState(0);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const [showProductSelect, setShowProductSelect] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const loadProductById = useCallback(async (pid: string) => {
    try {
      const res = await fetch("/api/products");
      const products: Product[] = await res.json();
      const found = products.find(
        (p) => p.productId.toLowerCase() === pid.toLowerCase()
      );
      if (found) {
        setCurrentProduct(found);
        setDescription(found.description);
        setCost(found.cost);
        setSellingPrice(found.sellingPrice);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (productId.length >= 3) {
      const timer = setTimeout(() => loadProductById(productId), 300);
      return () => clearTimeout(timer);
    }
  }, [productId, loadProductById]);

  const totalItems = orderItems.reduce((sum, i) => sum + i.quantity, 0);
  const subTotal = orderItems.reduce((sum, i) => sum + i.total, 0);
  const effectiveDelivery = freeDelivery ? 0 : deliveryCharge;
  const orderDiscount = orderItems.reduce((sum, i) => {
    if (i.discountType === "percentage") {
      return sum + (i.unitPrice * i.quantity * i.discount) / 100;
    }
    return sum + i.discount * i.quantity;
  }, 0);
  const discountPercentage =
    subTotal + orderDiscount > 0
      ? (orderDiscount / (subTotal + orderDiscount)) * 100
      : 0;
  const total = subTotal + effectiveDelivery;
  const balance = total - paidAmount;

  const handleSelectProduct = (product: Product) => {
    setCurrentProduct(product);
    setProductId(product.productId);
    setDescription(product.description);
    setCost(product.cost);
    setSellingPrice(product.sellingPrice);
    setQuantity(1);
    setItemDiscount(0);
    setShowProductSelect(false);
  };

  const handleInsertItem = () => {
    if (!currentProduct) {
      toast.error("Please select a product first");
      return;
    }
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    let itemTotal = sellingPrice * quantity;
    if (itemDiscountType === "percentage") {
      itemTotal = itemTotal * (1 - itemDiscount / 100);
    } else {
      itemTotal = itemTotal - itemDiscount * quantity;
    }

    const newItem: OrderItem = {
      productId: currentProduct.id,
      product: currentProduct,
      quantity,
      unitPrice: sellingPrice,
      cost,
      discount: itemDiscount,
      discountType: itemDiscountType,
      total: Math.max(0, itemTotal),
    };

    if (selectedItemIndex !== null) {
      const updated = [...orderItems];
      updated[selectedItemIndex] = newItem;
      setOrderItems(updated);
      setSelectedItemIndex(null);
    } else {
      setOrderItems([...orderItems, newItem]);
    }

    resetProductForm();
  };

  const handleDeleteItem = () => {
    if (selectedItemIndex !== null) {
      setOrderItems(orderItems.filter((_, i) => i !== selectedItemIndex));
      setSelectedItemIndex(null);
      resetProductForm();
    }
  };

  const resetProductForm = () => {
    setProductId("");
    setDescription("");
    setQuantity(1);
    setCost(0);
    setSellingPrice(0);
    setItemDiscount(0);
    setItemDiscountType("percentage");
    setCurrentProduct(null);
  };

  const resetAll = () => {
    resetProductForm();
    setOrderItems([]);
    setCustomer(null);
    setDeliveryCharge(0);
    setDeliveryService("");
    setPackageWeight(0);
    setFreeDelivery(false);
    setStatus("Pending");
    setPaidAmount(0);
    setSelectedItemIndex(null);
  };

  const handleSelectItemRow = (index: number) => {
    const item = orderItems[index];
    setSelectedItemIndex(index);
    setProductId(item.product?.productId || "");
    setDescription(item.product?.description || "");
    setQuantity(item.quantity);
    setCost(item.cost);
    setSellingPrice(item.unitPrice);
    setItemDiscount(item.discount);
    setItemDiscountType(item.discountType as "percentage" | "fixed");
    setCurrentProduct(item.product || null);
  };

  const submitOrder = async (isDraft: boolean) => {
    if (orderItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    try {
      const body = {
        status: isDraft ? "Draft" : status,
        deliveryService,
        packageWeight,
        deliveryCharge: effectiveDelivery,
        freeDelivery,
        discount: orderDiscount,
        discountType: "mixed",
        subTotal: subTotal + effectiveDelivery,
        total,
        paidAmount,
        isDraft,
        customerId: customer?.id || null,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          cost: item.cost,
          discount: item.discount,
          discountType: item.discountType,
          total: item.total,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create order");

      const order = await res.json();
      setLastOrderId(order.id);
      toast.success(
        isDraft
          ? "Draft saved!"
          : `Order #${order.orderNumber} created!`
      );

      if (!isDraft) {
        setShowReceipt(true);
      } else {
        resetAll();
      }
    } catch {
      toast.error("Failed to create order");
    }
  };

  return (
    <div className="flex gap-4 p-4 h-[calc(100vh-56px)]">
      {/* Left: Product Details */}
      <div className="w-[380px] flex-shrink-0 flex flex-col">
        <h2 className="text-lg font-bold mb-3">Product Details</h2>

        <div className="space-y-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <label className="w-28 text-sm font-medium">Product ID:</label>
            <input
              className="input-field flex-1"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
            <button
              className="btn-secondary text-sm"
              onClick={() => setShowProductSelect(true)}
            >
              Select
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description:</label>
            <textarea
              className="input-field h-16 resize-none"
              value={description}
              readOnly
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="w-28 text-sm font-medium">Quantity:</label>
            <input
              type="number"
              className="input-field flex-1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
            />
          </div>

          {!restrictedMode && (
            <div className="flex items-center gap-2">
              <label className="w-28 text-sm font-medium">Cost:</label>
              <input
                type="number"
                className="input-field flex-1"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="w-28 text-sm font-medium">Selling Price:</label>
            <input
              type="number"
              className="input-field flex-1"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="w-28 text-sm font-medium">Discount:</label>
            <input
              type="number"
              className="input-field flex-1"
              value={itemDiscount}
              onChange={(e) => setItemDiscount(Number(e.target.value))}
            />
            <button
              className={`px-3 py-2 rounded text-sm font-medium border ${
                itemDiscountType === "percentage"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
              onClick={() =>
                setItemDiscountType(
                  itemDiscountType === "percentage" ? "fixed" : "percentage"
                )
              }
            >
              {itemDiscountType === "percentage" ? "%" : "Fixed"}
            </button>
          </div>

          <div className="flex gap-2">
            <button className="btn-primary flex-1" onClick={handleInsertItem}>
              {selectedItemIndex !== null ? "Update" : "Insert"}
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={handleDeleteItem}
              disabled={selectedItemIndex === null}
            >
              Delete
            </button>
          </div>
        </div>

        <hr className="my-4" />

        {/* Customer & Totals Section */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold">Customer:</span>
            <span>{customer?.name || "---"}</span>
            <button
              className="btn-secondary text-xs px-2 py-1"
              onClick={() => setShowCustomerDetails(true)}
            >
              Enter Details
            </button>
            <button
              className="btn-secondary text-xs px-2 py-1"
              onClick={() => setShowCustomerSelect(true)}
            >
              Select
            </button>
          </div>

          <p>Total Items: {totalItems}</p>

          <div className="flex items-center gap-2">
            <span>Delivery Charge: Rs.{effectiveDelivery.toLocaleString()}</span>
            <button
              className="btn-secondary text-xs px-2 py-1"
              onClick={() => setShowDelivery(true)}
            >
              Set
            </button>
          </div>

          <p>Sub Total: Rs.{(subTotal + effectiveDelivery).toLocaleString()}</p>
          <p>
            Discount: Rs.{orderDiscount.toLocaleString()} (
            {discountPercentage.toFixed(2)}%)
          </p>
          <p className="font-bold text-base">
            Total: Rs.{total.toLocaleString()}
          </p>

          <div className="flex items-center gap-2">
            <span>Status: {status}</span>
            {["Pending", "Paid", "Partial Paid"].map((s) => (
              <button
                key={s}
                className={`text-xs px-2 py-1 rounded border ${
                  status === s
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
                onClick={() => {
                  setStatus(s);
                  if (s === "Paid") setPaidAmount(total);
                  if (s === "Pending") setPaidAmount(0);
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {status === "Partial Paid" && (
            <div className="flex items-center gap-2">
              <label className="text-sm">Paid Amount:</label>
              <input
                type="number"
                className="input-field w-32"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
              />
            </div>
          )}

          <p className="font-bold text-xl text-blue-700">
            Balance: Rs.{balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Right: Order Items Table */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-lg font-bold mb-3">Order Items</h2>

        <div className="flex-1 border rounded-lg overflow-auto bg-white">
          <table className="w-full">
            <thead className="sticky top-0">
              <tr>
                <th className="table-header">Product ID</th>
                <th className="table-header">Description</th>
                <th className="table-header">Quantity</th>
                <th className="table-header">Unit Price</th>
                <th className="table-header">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-gray-400">
                    No content in table
                  </td>
                </tr>
              ) : (
                orderItems.map((item, index) => (
                  <tr
                    key={index}
                    className={`cursor-pointer hover:bg-blue-50 ${
                      selectedItemIndex === index ? "bg-blue-100" : ""
                    }`}
                    onClick={() => handleSelectItemRow(index)}
                  >
                    <td className="table-cell">
                      {item.product?.productId}
                    </td>
                    <td className="table-cell">
                      {item.product?.description}
                    </td>
                    <td className="table-cell">{item.quantity}</td>
                    <td className="table-cell">
                      Rs. {item.unitPrice.toLocaleString()}
                      {item.discount > 0 && (
                        <span className="text-red-500 text-xs ml-1">
                          (-{item.discount}
                          {item.discountType === "percentage" ? "%" : ""})
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      Rs. {item.total.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-center gap-3 mt-4 py-2">
          <button className="btn-secondary" onClick={resetAll}>
            Reset
          </button>
          <button
            className="btn-secondary"
            onClick={() => submitOrder(true)}
          >
            Save Draft
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowInvoice(true)}
            disabled={orderItems.length === 0}
          >
            Generate Invoice
          </button>
          <button
            className="btn-secondary"
            disabled={orderItems.length === 0}
            onClick={() => {
              toast.success("Quotation feature - use Generate Invoice with quotation template");
            }}
          >
            Generate Quotation
          </button>
          <button
            className="btn-success text-sm px-6"
            onClick={() => submitOrder(false)}
            disabled={orderItems.length === 0}
          >
            Confirm &amp; Generate Receipt
          </button>
        </div>
      </div>

      {/* Modals */}
      {showProductSelect && (
        <ProductSelectModal
          onSelect={handleSelectProduct}
          onClose={() => setShowProductSelect(false)}
        />
      )}
      {showCustomerDetails && (
        <CustomerDetailsModal
          customer={customer}
          onSave={(c) => {
            setCustomer(c);
            setShowCustomerDetails(false);
          }}
          onClose={() => setShowCustomerDetails(false)}
        />
      )}
      {showCustomerSelect && (
        <CustomerSelectModal
          onSelect={(c) => {
            setCustomer(c);
            setShowCustomerSelect(false);
          }}
          onClose={() => setShowCustomerSelect(false)}
        />
      )}
      {showDelivery && (
        <DeliveryModal
          deliveryService={deliveryService}
          packageWeight={packageWeight}
          deliveryCharge={deliveryCharge}
          freeDelivery={freeDelivery}
          onSave={(data) => {
            setDeliveryService(data.deliveryService);
            setPackageWeight(data.packageWeight);
            setDeliveryCharge(data.deliveryCharge);
            setFreeDelivery(data.freeDelivery);
            setShowDelivery(false);
          }}
          onClose={() => setShowDelivery(false)}
        />
      )}
      {showReceipt && lastOrderId && (
        <ReceiptModal
          orderId={lastOrderId}
          onClose={() => {
            setShowReceipt(false);
            resetAll();
          }}
        />
      )}
      {showInvoice && (
        <InvoiceGenerateModal
          orderItems={orderItems}
          customer={customer}
          total={total}
          subTotal={subTotal + effectiveDelivery}
          discount={orderDiscount}
          deliveryCharge={effectiveDelivery}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
}
