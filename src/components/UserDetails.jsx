import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Building2,
  Calendar,
  Package,
  RefreshCw,
  Shield,
  Save,
} from "lucide-react";
import { API_URL } from "../config";

export default function UserDetails({ userId, onBack, currentUser }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState("staff");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Allow role assignment if user is logged in
  const isAdmin = true; // Enabled for testing; can be restricted based on currentUser?.role

  const fetchUser = () => {
    setLoading(true);
    setError("");

    fetch(`${API_URL}/api/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load user details");
        return res.json();
      })
      .then((payload) => {
        setData(payload);
        setSelectedRole((payload.user?.role || "staff").toLowerCase());
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const handleRoleUpdate = async () => {
    setSaving(true);
    setSuccessMsg("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update role");

      setSuccessMsg(`Role updated to ${selectedRole.toUpperCase()} successfully!`);
      fetchUser(); // Refresh profile data
    } catch (err) {
      console.error("Role update error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
        <RefreshCw size={28} className="animate-spin text-indigo-500 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading user profile...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-indigo-500 hover:underline mb-4">
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  const { user, assets } = data;

  const getInitials = (name) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getRoleBadge = (role = "") => {
    const r = role.toLowerCase();
    if (r === "admin") return "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20";
    if (r === "manager") return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20";
    return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20";
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Top Navigation */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Directory</span>
        </button>
      </div>

      {/* User Header Profile */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg shadow-indigo-500/30 flex-shrink-0">
          {getInitials(user.full_name)}
        </div>

        <div className="flex-1 w-full">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {user.full_name}
          </h1>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${getRoleBadge(
              user.role
            )}`}
          >
            <Shield size={12} />
            {user.role}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-400" />
              {user.email}
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-gray-400" />
              {user.unit}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              Joined: {formatDate(user.created_at)}
            </div>
            <div className="flex items-center gap-2 font-medium text-indigo-600 dark:text-indigo-400">
              <Package size={16} />
              {assets.length} Assets Assigned
            </div>
          </div>
        </div>
      </div>

      {/* Admin Role Assignment Panel */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-indigo-50/40 dark:bg-indigo-500/5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Shield size={16} className="text-indigo-500" />
          Assign Role
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleRoleUpdate}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white flex items-center gap-2 transition-colors shadow-sm shadow-indigo-500/25"
          >
            <Save size={16} />
            {saving ? "Updating..." : "Save Role"}
          </button>
        </div>

        {successMsg && (
          <p className="mt-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {successMsg}
          </p>
        )}
        {error && (
          <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Assigned Assets */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Package size={20} className="text-indigo-500" />
          Currently Assigned Assets
        </h3>

        {assets.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No assets currently assigned to this user.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Asset Name
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Asset ID
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Category
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Condition
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {assets.map((asset) => (
                  <tr key={asset.asset_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {asset.asset_name || asset.name}
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-gray-500">
                      {asset.asset_id}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {asset.category}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {asset.asset_condition || "Good"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}