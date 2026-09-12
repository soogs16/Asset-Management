import React, { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", revenue: 4000, users: 2400 },
  { name: "Feb", revenue: 3000, users: 1398 },
  { name: "Mar", revenue: 5000, users: 3800 },
  { name: "Apr", revenue: 4780, users: 3908 },
  { name: "May", revenue: 5890, users: 4800 },
  { name: "Jun", revenue: 6390, users: 3800 },
  { name: "Jul", revenue: 7490, users: 4300 },
  { name: "Aug", revenue: 6490, users: 4100 },
  { name: "Sep", revenue: 7200, users: 4600 },
  { name: "Oct", revenue: 8100, users: 5200 },
  { name: "Nov", revenue: 7600, users: 4900 },
  { name: "Dec", revenue: 9200, users: 5800 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          {label}
        </p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ChartSection = ({ fullWidth }) => {
  const [chartType, setChartType] = useState("area");

  const types = ["area", "line", "bar"];

  const renderChart = () => {
    const common = { data, margin: { top: 5, right: 20, left: 0, bottom: 5 } };
    const grid = <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />;
    const xAxis = <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />;
    const yAxis = <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />;
    const tooltip = <Tooltip content={<CustomTooltip />} />;

    switch (chartType) {
      case "line":
        return (
          <LineChart {...common}>
            {grid}{xAxis}{yAxis}{tooltip}
            <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2.5} dot={false} />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart {...common}>
            {grid}{xAxis}{yAxis}{tooltip}
            <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            <Bar dataKey="users" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        );
      default:
        return (
          <AreaChart {...common}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gUsr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            {grid}{xAxis}{yAxis}{tooltip}
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#gRev)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="users" stroke="#10b981" fill="url(#gUsr)" strokeWidth={2.5} />
          </AreaChart>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Revenue & Users
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monthly performance overview
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${
                  chartType === t
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 px-5 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Users</span>
        </div>
      </div>

      <div className="p-5">
        <ResponsiveContainer width="100%" height={320}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartSection;