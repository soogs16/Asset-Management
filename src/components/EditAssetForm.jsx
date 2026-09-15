import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { API_URL } from "../config";

export default function EditAssetForm({ asset, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({ ...asset });
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);

  // Fetch users for the assignee dropdown
  useEffect(() => {
    fetch(`${API_URL}/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
      
    // Format date for the input field
    if (asset.purchase_date) {
      setFormData(prev => ({...prev, purchase_date: asset.purchase_date.split('T')[0]}));
    }
  }, [asset]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/assets/${asset.asset_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update");
      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Edit Asset & Reassign</h2>
          <p className="text-sm text-gray-500">Update details or transfer to a new user.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Asset Name</label>
            <input type="text" name="asset_name" value={formData.asset_name || ""} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none" required />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Price (₦)</label>
            <input type="number" name="price" value={formData.price || ""} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Assign To (User)</label>
            <select name="assignee" value={formData.assignee || ""} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none">
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.full_name}>{u.full_name} ({u.unit})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Location</label>
            <input type="text" name="location" value={formData.location || ""} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none" />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
            <select name="status" value={formData.status || "Active"} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none">
              <option value="Active">Active</option>
              <option value="In Maintenance">In Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Condition</label>
            <select name="asset_condition" value={formData.asset_condition || "Good"} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none">
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Needs Repair">Needs Repair</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg">{saving ? "Saving..." : "Save Changes"}</button>
        </div>
      </form>
    </div>
  );
}