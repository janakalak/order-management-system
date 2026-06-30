"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Settings, DeliveryService } from "@/lib/types";

interface Props {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: Props) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [deliveryServices, setDeliveryServices] = useState<DeliveryService[]>([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceRate, setNewServiceRate] = useState(0);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings);
    fetch("/api/delivery-services")
      .then((res) => res.json())
      .then((data: DeliveryService[]) => {
        setDeliveryServices(data);
        if (data.length > 0) setSelectedServiceId(data[0].id);
      });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    try {
      const { id, ...data } = settings;
      void id;
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("Settings saved!");
      onClose();
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const refreshServices = async () => {
    const res = await fetch("/api/delivery-services");
    const data: DeliveryService[] = await res.json();
    setDeliveryServices(data);
    return data;
  };

  const handleAddService = async () => {
    if (!newServiceName.trim()) return;
    try {
      await fetch("/api/delivery-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newServiceName, ratePerKg: newServiceRate }),
      });
      setNewServiceName("");
      setNewServiceRate(0);
      const data = await refreshServices();
      if (data.length > 0) setSelectedServiceId(data[data.length - 1].id);
      toast.success("Service added!");
    } catch {
      toast.error("Failed to add service");
    }
  };

  const handleUpdateService = async () => {
    const svc = deliveryServices.find((s) => s.id === selectedServiceId);
    if (!svc) return;
    try {
      await fetch("/api/delivery-services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: svc.id,
          name: newServiceName || svc.name,
          ratePerKg: newServiceRate,
        }),
      });
      await refreshServices();
      toast.success("Service updated!");
    } catch {
      toast.error("Failed to update service");
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await fetch(`/api/delivery-services?id=${id}`, { method: "DELETE" });
      const data = await refreshServices();
      if (data.length > 0) setSelectedServiceId(data[0].id);
      else setSelectedServiceId("");
      toast.success("Service deleted!");
    } catch {
      toast.error("Failed to delete service");
    }
  };

  const handleSelectService = (id: string) => {
    setSelectedServiceId(id);
    const svc = deliveryServices.find((s) => s.id === id);
    if (svc) {
      setNewServiceName(svc.name);
      setNewServiceRate(svc.ratePerKg);
    }
  };

  if (!settings) {
    return (
      <div className="modal-overlay">
        <div className="modal-content w-[600px] p-8 text-center">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-[600px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Settings</h3>
          <button onClick={onClose} className="text-gray-500 text-xl">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
          <div>
            <h4 className="font-bold mb-3">Company Details</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm">Company Name:</label>
                <input
                  className="input-field flex-1"
                  value={settings.companyName}
                  onChange={(e) =>
                    setSettings({ ...settings, companyName: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm">Address:</label>
                <input
                  className="input-field flex-1"
                  value={settings.companyAddress}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      companyAddress: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm">Phone:</label>
                <input
                  className="input-field flex-1"
                  value={settings.companyPhone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      companyPhone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm">Email:</label>
                <input
                  className="input-field flex-1"
                  value={settings.companyEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      companyEmail: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-3">General</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.resetOnConfirm}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      resetOnConfirm: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Reset on Confirm Order</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.directPrintOnConfirm}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      directPrintOnConfirm: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Direct Print on Confirm Order</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enableLowStockWarning}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enableLowStockWarning: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Enable Low Stock Warnings</span>
              </label>

              {settings.enableLowStockWarning && (
                <div className="flex items-center gap-4 ml-6">
                  <label className="text-sm">Set Limit:</label>
                  <input
                    type="number"
                    className="input-field w-24"
                    value={settings.lowStockLimit}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        lowStockLimit: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.enableDeliveryOptions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enableDeliveryOptions: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">Enable Delivery Options</span>
              </label>
            </div>
          </div>

          {settings.enableDeliveryOptions && (
            <div>
              <h4 className="font-bold mb-3">Delivery Services</h4>
              <div className="flex gap-2 mb-3">
                <select
                  className="input-field flex-1"
                  value={selectedServiceId}
                  onChange={(e) => handleSelectService(e.target.value)}
                >
                  {deliveryServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Rs.{s.ratePerKg}/KG)
                    </option>
                  ))}
                </select>
                <button
                  className="btn-primary text-sm"
                  onClick={handleAddService}
                >
                  Insert
                </button>
                <button
                  className="btn-secondary text-sm"
                  onClick={handleUpdateService}
                >
                  Update
                </button>
                <button
                  className="btn-danger text-sm"
                  onClick={() => {
                    if (selectedServiceId) handleDeleteService(selectedServiceId);
                  }}
                >
                  Delete
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="Service name"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                />
                <input
                  type="number"
                  className="input-field w-32"
                  placeholder="Rate/KG"
                  value={newServiceRate}
                  onChange={(e) => setNewServiceRate(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          <div>
            <h4 className="font-bold mb-3">Default Status</h4>
            <div className="flex gap-4">
              {["Pending", "Paid", "Partial Paid"].map((s) => (
                <label key={s} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="defaultStatus"
                    checked={settings.defaultStatus === s}
                    onChange={() =>
                      setSettings({ ...settings, defaultStatus: s })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
