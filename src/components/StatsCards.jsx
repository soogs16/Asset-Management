import React, { useEffect, useState } from "react";
import { Package, CheckCircle2, Wrench, Wallet, RefreshCw } from "lucide-react";
import { API_URL } from "../config";
const StatsCards = () => {
  const [stats, setStats] = useState({
    total_assets: 0,
    active_assets: 0,
    maintenance_assets: 0,
    total_value: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    fetch(`${API_URL}/api/dashboard/stats`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard stats:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatNaira = (val) => {
    const num = parseFloat(val) || 0;
    return `₦${num.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const cards = [
    {
      title: "Total Assets",
      value: loading ? "..." : stats.total_assets || 0,
      subtext: "Items registered in AMS",
      icon: Package,
      gradient: "from-indigo-500 to-purple-500",
      badge: "Inventory",
      badgeColor: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400",
    },
    {
      title: "Active Assets",
      value: loading ? "..." : stats.active_assets || 0,
      subtext: "Currently in active use",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-500",
      badge: "Operational",
      badgeColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      title: "In Maintenance",
      value: loading ? "..." : stats.maintenance_assets || 0,
      subtext: "Damaged or under repair",
      icon: Wrench,
      gradient: "from-amber-500 to-orange-500",
      badge: "Attention Req.",
      badgeColor: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
    },
    {
      title: "Total Asset Value",
      value: loading ? "..." : formatNaira(stats.total_value),
      subtext: "Cumulative valuation",
      icon: Wallet,
      gradient: "from-rose-500 to-pink-500",
      badge: "Valuation",
      badgeColor: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 w-full">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
            p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient}
                flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
            >
              <card.icon size={22} />
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${card.badgeColor}`}>
              {card.badge}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {card.value}
          </h3>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
            {card.title}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {card.subtext}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;