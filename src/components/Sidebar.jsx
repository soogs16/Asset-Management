import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Package,
  Bell,
  Activity,
  Settings,
  HelpCircle,
  LogOut,
  Zap,
} from "lucide-react";
import { API_URL } from "../config";

const Sidebar = ({ isOpen, user, canAccess, onLogout }) => {
  const location = useLocation();

  const mainNav = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { id: "assets", label: "Assets", path: "/assets", icon: Package },
    { id: "users", label: "Users", path: "/users", icon: Users },
  ];

  const supportNav = [
    { id: "settings", label: "Settings", path: "/settings", icon: Settings },
    { id: "help", label: "Help Center", path: "/help", icon: HelpCircle },
  ];

  const canShow = (id) => (typeof canAccess === "function" ? canAccess(id) : true);

  const visibleMainNav = mainNav.filter((item) => canShow(item.id));

  const roleColors = {
    admin: "bg-red-500/15 text-red-400 border-red-500/20",
    manager: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    staff: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  };

  const roleClass =
    roleColors[(user?.role || "").toLowerCase()] ||
    "bg-indigo-500/15 text-indigo-400 border-indigo-500/20";

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white
        transition-transform duration-300 flex flex-col border-r border-slate-800
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Zap size={22} />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight block leading-none">
            Dashify
          </span>
          <span className="text-[11px] text-slate-400">Asset Management</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pt-2 pb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Main Menu
        </p>

        {visibleMainNav.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200 group
                ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
            >
              <Icon size={20} />
              <span className="flex-1 text-left">{item.label}</span>

              {item.badge ? (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}

        <p className="px-3 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Support
        </p>

        {supportNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/60">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
            {(user?.name || "User")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user?.name || "User"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${roleClass}`}
              >
                {user?.role || "staff"}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;