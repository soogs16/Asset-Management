import React from "react";
import {
  UserPlus,
  CreditCard,
  Truck,
  AlertTriangle,
  Rocket,
  Database,
  FileText,
  Calendar,
} from "lucide-react";

const activities = [
  { icon: UserPlus, color: "text-blue-500 bg-blue-100 dark:bg-blue-500/20", title: "New user registered", desc: "Sarah Johnson created an account", time: "2 min ago" },
  { icon: CreditCard, color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20", title: "Payment received", desc: "$1,250 from Alex Thompson", time: "15 min ago" },
  { icon: Truck, color: "text-amber-500 bg-amber-100 dark:bg-amber-500/20", title: "Order shipped", desc: "Order #12345 shipped via FedEx", time: "1 hr ago" },
  { icon: AlertTriangle, color: "text-red-500 bg-red-100 dark:bg-red-500/20", title: "Server alert", desc: "CPU usage exceeded 90%", time: "2 hrs ago" },
  { icon: Rocket, color: "text-purple-500 bg-purple-100 dark:bg-purple-500/20", title: "Feature deployed", desc: "Dashboard v2.1.0 is now live", time: "3 hrs ago" },
  { icon: Database, color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20", title: "Backup completed", desc: "Database backup successful", time: "5 hrs ago" },
  { icon: FileText, color: "text-blue-500 bg-blue-100 dark:bg-blue-500/20", title: "Report generated", desc: "Monthly analytics report ready", time: "6 hrs ago" },
  { icon: Calendar, color: "text-amber-500 bg-amber-100 dark:bg-amber-500/20", title: "Meeting scheduled", desc: "Team standup at 10:00 AM", time: "8 hrs ago" },
];

const RecentActivity = ({ fullWidth }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors">
          View All
        </button>
      </div>

      <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
        {activities.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 group cursor-pointer"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                ${item.color} transition-transform group-hover:scale-110`}
            >
              <item.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {item.desc}
              </p>
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;