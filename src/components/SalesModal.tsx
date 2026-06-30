"use client";

import { useState, useEffect, useCallback } from "react";
import type { SalesData } from "@/lib/types";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  onClose: () => void;
}

const COLORS = [
  "#00C49F",
  "#FFBB28",
  "#4169E1",
  "#FF6384",
  "#36A2EB",
  "#FF9F40",
  "#9966FF",
  "#FF6633",
  "#4BC0C0",
  "#FF99CC",
];

type ChartType = "Items Sold" | "Revenue" | "Cost" | "Profit";

export default function SalesModal({ onClose }: Props) {
  const [data, setData] = useState<SalesData | null>(null);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [chartType, setChartType] = useState<ChartType>("Revenue");

  const loadData = useCallback(() => {
    fetch(`/api/sales?month=${month}`)
      .then((res) => res.json())
      .then(setData);
  }, [month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!data) {
    return (
      <div className="modal-overlay">
        <div className="modal-content w-[900px] p-8 text-center">
          Loading...
        </div>
      </div>
    );
  }

  const [year, m] = month.split("-");
  const monthName = new Date(Number(year), Number(m) - 1).toLocaleString(
    "default",
    { month: "long", year: "numeric" }
  );

  const getPieData = () => {
    return data.topProducts.map((p) => ({
      name: p.productId,
      value:
        chartType === "Items Sold"
          ? p.quantity
          : chartType === "Revenue"
            ? p.revenue
            : chartType === "Cost"
              ? p.cost
              : p.profit,
    }));
  };

  const getBarData = () => {
    return data.topProducts.map((p) => ({
      name: p.productId,
      Quantity: p.quantity,
      Revenue: p.revenue,
      Profit: p.profit,
    }));
  };

  const totalValue = getPieData().reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-[1000px] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Charts - {monthName}</h3>
          <div className="flex items-center gap-3">
            <input
              type="month"
              className="input-field w-40"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <button onClick={onClose} className="text-gray-500 text-xl px-2">
              &times;
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Period: {monthName}</h2>
            <p className="text-sm text-gray-600">
              Orders: {data.totalOrders} | Items Sold: {data.totalItems} |
              Revenue: Rs.{data.totalRevenue.toLocaleString()} | Profit:
              Rs.{data.totalProfit.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium">Charts:</span>
            <select
              className="input-field w-40"
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
            >
              <option>Items Sold</option>
              <option>Revenue</option>
              <option>Cost</option>
              <option>Profit</option>
            </select>
          </div>

          {data.topProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={getPieData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) =>
                        `${name} ${((value / totalValue) * 100).toFixed(1)}%`
                      }
                    >
                      {getPieData().map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="font-bold text-center mb-2">
                  Multi-Metric Comparison - Top 10
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getBarData()}>
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Quantity" fill="#36A2EB" />
                    <Bar dataKey="Revenue" fill="#4BC0C0" />
                    <Bar dataKey="Profit" fill="#9966FF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-10">
              No sales data for this period
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
