import React, { useEffect, useState } from "react";
import { ArrowLeft, Package, Calendar, DollarSign, MapPin, Store, User, Tag, Pencil, Wrench, AlertTriangle, CheckCircle2 } from "lucide-react";
import EditAssetForm from "./EditAssetForm";
import { API_URL } from "../config";

export default function AssetDetails({ assetId, onBack, user, onDeleteSuccess }) {
  const [asset, setAsset] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  const role = (user?.role || "staff").toLowerCase();
  const isAdmin = role === "admin";
  const isManager = role === "manager" || isAdmin;

  const loadData = () => {
    fetch(`${API_URL}/api/assets/${assetId}`)
      .then(res => res.json())
      .then(data => setAsset(data));

    fetch(`${API_URL}/api/assets/${assetId}/maintenance`)
      .then(res => res.json())
      .then(data => setTickets(data));
  };

  useEffect(() => { loadData(); }, [assetId]);

  const handleReportIssue = async () => {
    const issue = window.prompt("Describe the issue with this asset:");
    if (!issue) return;

    await fetch(`${API_URL}/api/maintenance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asset_id: assetId, reported_by: user.name, issue })
    });
    loadData(); // Refresh UI
  };

  const handleResolveTicket = async (ticketId) => {
    if (!isManager) return alert("Only Managers/Admins can resolve tickets.");
    await fetch(`${API_URL}/api/maintenance/${ticketId}/resolve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asset_id: assetId })
    });
    loadData(); // Refresh UI
  };

  if (!asset) return <div className="p-8 text-center">Loading...</div>;

  if (isEditing) {
    return <EditAssetForm asset={asset} onCancel={() => setIsEditing(false)} onSuccess={() => { setIsEditing(false); loadData(); }} />;
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Top Bar */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-500">
          <ArrowLeft size={18} /> Back to Assets
        </button>

        <div className="flex gap-2">
          {/* Feature D: Report Issue Button */}
          <button onClick={handleReportIssue} className="px-3 py-1.5 text-sm bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg flex items-center gap-2 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertTriangle size={16} /> Report Issue
          </button>
          
          {/* Feature A & B: Edit Button */}
          {isManager && (
            <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg flex items-center gap-2 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Pencil size={16} /> Edit / Reassign
            </button>
          )}
        </div>
      </div>

      {/* Asset Info Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-3 flex gap-4 items-center mb-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white"><Package size={28}/></div>
          <div>
            <h1 className="text-xl font-bold dark:text-white">{asset.asset_name}</h1>
            <p className="text-sm text-gray-500">ID: {asset.asset_id} • Status: <span className="font-bold text-emerald-500">{asset.status}</span></p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700"><User size={16} className="text-indigo-500 mb-1"/> Assigned To: <b className="dark:text-white block">{asset.assignee || "Unassigned"}</b></div>
        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700"><MapPin size={16} className="text-indigo-500 mb-1"/> Location: <b className="dark:text-white block">{asset.location || "N/A"}</b></div>
        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700"><Tag size={16} className="text-indigo-500 mb-1"/> Condition: <b className="dark:text-white block">{asset.asset_condition}</b></div>
      </div>

      {/* Maintenance History */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
        <h3 className="text-md font-bold mb-4 flex items-center gap-2 dark:text-white"><Wrench size={18} className="text-amber-500"/> Maintenance History</h3>
        {tickets.length === 0 ? <p className="text-sm text-gray-500">No issues reported for this asset.</p> : (
          <div className="space-y-3">
            {tickets.map(t => (
              <div key={t.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold dark:text-white">{t.issue}</p>
                  <p className="text-xs text-gray-500">Reported by {t.reported_by} • {t.status}</p>
                </div>
                {t.status === 'Open' ? (
                  isManager && <button onClick={() => handleResolveTicket(t.id)} className="px-3 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600">Mark Resolved</button>
                ) : (
                  <CheckCircle2 className="text-emerald-500" size={20} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}