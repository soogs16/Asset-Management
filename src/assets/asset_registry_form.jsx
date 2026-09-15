import { useState } from "react";
import CategoryDropdown from "./categorydropdown.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import QRCodeInput from "./QRCodeInput.jsx";
import { ArrowLeft } from "lucide-react";
import { API_URL } from "../config";

export default function AssetRegistryForm({ onCancel, onSuccess }) {
  const [purchaseDate, setPurchaseDate] = useState(null);
  const [formData, setFormData] = useState({
    asset_name: "",
    category: "General",
    price: "",
    location: "",
    vendor: "",
    assignee: "",
    status: "Active",
    asset_condition: "Good",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Safely format date to YYYY-MM-DD or null
    let formattedDate = null;
    if (purchaseDate && !isNaN(new Date(purchaseDate))) {
      formattedDate = new Date(purchaseDate).toISOString().split("T")[0];
    }

    const payload = {
      ...formData,
      purchase_date: formattedDate,
    };

    fetch(`${API_URL}/api/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.error || "Failed to create asset");
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("Success:", data);
        if (onSuccess) onSuccess(); // Closes form & reloads table
      })
      .catch((err) => {
        console.error("Error saving asset:", err);
        alert(`Error: ${err.message}`);
      });
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Register Asset</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter the asset details below.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {/* Asset Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Asset Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="asset_name"
            value={formData.asset_name}
            onChange={handleChange}
            placeholder="e.g. Dell Monitor"
            className="w-full px-3 py-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category */}
        <div className="flex flex-col w-full gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Category <span className="text-red-500">*</span>
          </label>
          <CategoryDropdown
            value={formData.category}
            onChange={(cat) => setFormData((prev) => ({ ...prev, category: cat }))}
            className="w-full"
          />
        </div>

        {/* Purchase Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Purchase Price (in Naira)
          </label>
          <input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g. 1000.00"
            className="w-full px-3 py-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Purchase Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Purchase Date
          </label>
          <DatePicker
            selected={purchaseDate}
            onChange={(date) => setPurchaseDate(date)}
            placeholderText="Select purchase date"
            dateFormat="dd/MM/yyyy"
            className="w-full px-3 py-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Business Intelligence"
            className="w-full px-3 py-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Vendor */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Vendor
          </label>
          <input
            type="text"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            placeholder="e.g. Tech Solutions Ltd"
            className="w-full px-3 py-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Assignee */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Assignee Name
          </label>
          <input
            type="text"
            name="assignee"
            value={formData.assignee}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="w-full px-3 py-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
          >
            Save Asset
          </button>
        </div>
      </form>
    </div>
  );
}