import React, { useState } from "react";
import {
  Check,
  X,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

const initial = [
  { id: 1, type: "info", icon: Info, title: "System Update", msg: "Version 2.1.0 is available with performance improvements and bug fixes.", time: "5 min ago", read: false },
  { id: 2, type: "success", icon: CheckCircle, title: "Payment Processed", msg: "Payment of $1,250.00 from Alex Thompson has been successfully processed.", time: "15 min ago", read: false },
  { id: 3, type: "warning", icon: AlertTriangle, title: "Storage Almost Full", msg: "Your storage usage is at 89%. Consider upgrading your plan.", time: "1 hr ago", read: false },
  { id: 4, type: "error", icon: AlertCircle, title: "Login Attempt Failed", msg: "Multiple failed login attempts from IP 192.168.1.105. Account locked.", time: "2 hrs ago", read: true },
  { id: 5, type: "info", icon: Info, title: "New Team Member", msg: "Lisa Chen has joined the Marketing team.", time: "3 hrs ago", read: true },
  { id: 6, type: "success", icon: CheckCircle, title: "Backup Completed", msg: "Daily database backup completed. 2.4 GB backed up.", time: "5 hrs ago", read: true },
  { id: 7, type: "warning", icon: AlertTriangle, title: "SSL Expiring", msg: "Your SSL certificate expires in 14 days. Renew to avoid interruption.", time: "1 day ago", read: true },
];

const typeStyles = {
  info: "from-blue-500 to-cyan-500",
  success: "from-emerald-500 to-teal-500",
  warning: "from-amber-500 to-orange-500",
  error: "from-red-500 to-rose-500",
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(initial);

  const markRead = (id) =>
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const dismiss = (id) =>
    setNotifications(notifications.filter((n) => n.id !== id));

  const markAllRead = () =>
    setNotifications(notifications.map((n) => ({ ...n, read: true })));

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          {unread > 0 && (
            <span className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {unread} new
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            className={`flex items-start gap-4 p-5 cursor-pointer transition-colors
              hover:bg-gray-50 dark:hover:bg-gray-700/30
              ${!n.read ? "bg-indigo-50/50 dark:bg-indigo-500/5 border-l-4 border-l-indigo-500" : "border-l-4 border-l-transparent"}`}
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeStyles[n.type]}
                flex items-center justify-center text-white flex-shrink-0 shadow-lg`}
            >
              <n.icon size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {n.title}
                    {!n.read && (
                      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full ml-2" />
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {n.msg}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {n.time}
                  </p>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  {!n.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              All caught up!
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No new notifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;