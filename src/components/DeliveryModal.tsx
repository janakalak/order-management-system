"use client";

import { useState, useEffect, useCallback } from "react";
import type { DeliveryService } from "@/lib/types";

interface Props {
  deliveryService: string;
  packageWeight: number;
  deliveryCharge: number;
  freeDelivery: boolean;
  onSave: (data: {
    deliveryService: string;
    packageWeight: number;
    deliveryCharge: number;
    freeDelivery: boolean;
  }) => void;
  onClose: () => void;
}

export default function DeliveryModal({
  deliveryService: initService,
  packageWeight: initWeight,
  deliveryCharge: initCharge,
  freeDelivery: initFree,
  onSave,
  onClose,
}: Props) {
  const [services, setServices] = useState<DeliveryService[]>([]);
  const [service, setService] = useState(initService);
  const [weight, setWeight] = useState(initWeight);
  const [charge, setCharge] = useState(initCharge);
  const [free, setFree] = useState(initFree);

  const calcCharge = useCallback(
    (serviceName: string, kg: number) => {
      const svc = services.find((s) => s.name === serviceName);
      if (!svc) return 0;
      return Math.round(kg * svc.ratePerKg * 100) / 100;
    },
    [services]
  );

  useEffect(() => {
    fetch("/api/delivery-services")
      .then((res) => res.json())
      .then(setServices);
  }, []);

  const handleServiceChange = (name: string) => {
    setService(name);
    if (!free) setCharge(calcCharge(name, weight));
  };

  const handleWeightChange = (kg: number) => {
    setWeight(kg);
    if (!free) setCharge(calcCharge(service, kg));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-[450px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Delivery Details</h3>
          <button onClick={onClose} className="text-gray-500 text-xl">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-medium">Delivery Service:</label>
            <select
              className="input-field flex-1"
              value={service}
              onChange={(e) => handleServiceChange(e.target.value)}
            >
              <option value="">Select...</option>
              {services.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-medium">
              Package Weight (KG):
            </label>
            <input
              type="number"
              className="input-field flex-1"
              value={weight}
              onChange={(e) => handleWeightChange(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-40 text-sm font-medium">Delivery Charge:</label>
            <input
              type="number"
              className="input-field flex-1 bg-gray-50"
              value={charge}
              readOnly
              disabled={free}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={free}
              onChange={(e) => {
                const isFree = e.target.checked;
                setFree(isFree);
                if (isFree) setCharge(0);
                else setCharge(calcCharge(service, weight));
              }}
              className="w-4 h-4"
            />
            <span className="text-sm">Free Delivery Charge</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() =>
              onSave({
                deliveryService: service,
                packageWeight: weight,
                deliveryCharge: charge,
                freeDelivery: free,
              })
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
