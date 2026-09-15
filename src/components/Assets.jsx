import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import Assetregistryform from "../assets/asset_registry_form.jsx";
import AssetDetails from "./AssetDetails.jsx"; // 👈 1. Import AssetDetails
import { API_URL } from "../config";

const Assets = ({ user }) => {
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null); // 👈 2. Track selected asset for details view
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState(null);

  // Role permissions
  const role = (user?.role || "staff").toLowerCase();
  const canAdd = role === "admin" || role === "manager";
  const canDelete = role === "admin";
  const canViewDetails = role === "admin" || role === "manager"; // 👈 3. Admin & Manager can click to view details

  // Fetch assets from XAMPP backend
  const fetchAssets = () => {
    setLoading(true);
    fetch(`${API_URL}/api/assets`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch assets");
        return res.json();
      })
      .then((data) => {
        setAssets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching assets:", err);
        setAssets([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDelete = async (assetId) => {
    if (!canDelete) return;
    if (!window.confirm("Are you sure you want to delete this asset?")) return;

    try {
      const res = await fetch(`${API_URL}/api/assets/${assetId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete asset");
      setOpenMenuId(null);
      fetchAssets();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredAssets = (assets || []).filter((item) => {
    if (filter === "all") return true;
    return item.status?.toLowerCase() === filter.toLowerCase();
  });

  const activeCount = (assets || []).filter(
    (a) => a.status?.toLowerCase() === "active"
  ).length;

  const getConditionBadge = (condition) => {
    const value = condition ? condition.toLowerCase() : "good";
    if (value === "new") return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
    if (value === "good") return "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400";
    if (value === "fair") return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
    return "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400";
  };

  const getStatusBadge = (status) => {
    const value = status ? status.toLowerCase() : "active";
    if (value === "active") return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
    if (value === "inactive" || value === "retired") return "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400";
    return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
  };

  const getInitials = (name) => {
    if (!name || name === "Unnamed Asset") return "AS";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  // 👈 4. If an asset is selected, show the Details View
  if (selectedAssetId) {
    return (
      <AssetDetails
        assetId={selectedAssetId}
        user={user}
        onBack={() => setSelectedAssetId(null)}
        onDeleteSuccess={() => {
          setSelectedAssetId(null);
          fetchAssets();
        }}
      />
    );
  }

  // If showForm is true, show Asset Creation Form
  if (showForm) {
    return (
      <Assetregistryform
        onCancel={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          fetchAssets();
        }}
      />
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Assets Management
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activeCount}/{assets.length} active assets
            {user?.role ? ` • Logged in as: ${user.role}` : ""}
          </span>
        </div>

        {canAdd ? (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-sm shadow-indigo-500/25 flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Asset</span>
          </button>
        ) : (
          <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
            View only
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex gap-1 bg-gray-100 p-1 dark:bg-gray-700 rounded-lg w-fit">
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                filter === f
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="px-2 pb-4">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-8 text-sm">Loading assets from database...</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {["Asset", "Category", "Status", "Condition", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-sm text-gray-500">
                      No assets found.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset, i) => {
                    const name = asset.asset_name || asset.name || "Unnamed Asset";
                    const idDisplay = asset.asset_id || asset.serial_number || `AST-${i + 1}`;
                    const rowId = asset.asset_id || asset.id || i;

                    return (
                      <tr
                        key={rowId}
                        onClick={() => {
                          // 👈 5. Only Admins and Managers can click row to view details
                          if (canViewDetails) {
                            setSelectedAssetId(rowId);
                          }
                        }}
                        className={`transition-colors ${
                          canViewDetails
                            ? "cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-gray-700/50"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        }`}
                      >
                        {/* Asset Name & ID Column */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                              {getInitials(name)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                {name}
                                {canViewDetails && (
                                  <span className="text-[10px] font-normal text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click to view →
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                                ID: {idDisplay}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                          {asset.category || "General"}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusBadge(asset.status)}`}>
                            {asset.status || "Active"}
                          </span>
                        </td>

                        {/* Condition */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getConditionBadge(asset.asset_condition)}`}>
                            {asset.asset_condition || "Good"}
                          </span>
                        </td>

                        {/* Actions Dropdown */}
                        <td className="px-5 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                          {canDelete ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === rowId ? null : rowId);
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-colors"
                              >
                                <MoreHorizontal size={16} />
                              </button>

                              {openMenuId === rowId && (
                                <div className="absolute right-5 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(rowId);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assets;