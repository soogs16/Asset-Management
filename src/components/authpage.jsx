import React, { useState } from "react";
import { Mail, Lock, User, ArrowRight, Zap, Building2 } from "lucide-react";
import { API_URL } from "../config";
const UNITS = [
  "MarketMonie",
  "Finventory",
  "Business Intelligence",
  "IT",
  "Human Resources",
  "Trailblazers",
  "Customer Service",
  "Operations",
  "Administration",
];

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    unit: "IT", // default selected unit
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin
        ? `${API_URL}/api/auth/login`
        : `${API_URL}/api/auth/register`;

      const body = isLogin
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            full_name: formData.name,
            email: formData.email,
            password: formData.password,
            unit: formData.unit, // role is NOT sent; backend forces staff
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`Server returned ${res.status}. Is backend running on port 5000?`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        alert("Account created as Staff. Please sign in.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 text-center border-b border-gray-100 dark:border-gray-700">
          <div className="w-14 h-14 mx-auto bg-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <Zap size={30} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isLogin
              ? "Sign in to access AMS"
              : "New users are registered as Staff by default"}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name - signup only */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Unit - signup only */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit
                </label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3 top-3 text-gray-400" />
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-500/25"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="font-semibold text-indigo-500 hover:text-indigo-600"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}