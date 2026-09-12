import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import ChartSection from "./components/ChartSection";
import RecentActivity from "./components/RecentActivity";
import UserTable from "./components/users";
import Notifications from "./components/Notifications";
import Assets from "./components/Assets";
import Auth from "./components/authpage";

function App() {
  // 💡 PERSISTENT AUTH: Initializing synchronously from localStorage prevents logout on refresh
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    if (token) localStorage.setItem("token", token);
    setUser(userData);
    navigate("/dashboard"); // Reroute to dashboard after login
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Helper for Role Checks
  const canAccess = (path) => {
    if (!user) return false;
    const role = (user.role || "staff").toLowerCase();

    if (path === "dashboard" || path === "help") return true;
    if (role === "admin") return true;

    if (role === "manager") {
      return ["assets", "analytics", "activity", "notifications", "todos", "settings"].includes(path);
    }

    if (role === "staff") {
      return ["assets", "notifications", "todos"].includes(path);
    }

    return false;
  };

  // 1. If not logged in, force user to /login route
  if (!user) {
    return (
      <div className={darkMode ? "dark" : ""}>
        <Routes>
          <Route path="/login" element={<Auth onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // 2. Protected Layout for Authenticated Users
  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          isOpen={sidebarOpen}
          user={user}
          canAccess={canAccess}
          onLogout={handleLogout}
        />

        <div
          className={`min-h-screen w-full transition-all duration-300 ${
            sidebarOpen ? "lg:pl-64" : "lg:pl-0"
          }`}
        >
          <Header
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            darkMode={darkMode}
            toggleDarkMode={() => setDarkMode(!darkMode)}
            user={user}
          />

          <main className="w-full p-4 md:p-6">
            <div className="w-full max-w-none">
              <Routes>
                {/* Redirect root / to /dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard Route */}
                <Route
                  path="/dashboard"
                  element={
                    canAccess("dashboard") ? (
                      <div className="w-full space-y-6">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Dashboard Overview
                          </h1>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Welcome back, {user?.name || "User"}.
                          </p>
                        </div>
                        <StatsCards />
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
                          <div className="xl:col-span-2 w-full">
                            <ChartSection />
                          </div>
                          <div className="w-full">
                            <RecentActivity />
                          </div>
                        </div>
                        <UserTable />
                      </div>
                    ) : (
                      <Navigate to="/assets" replace />
                    )
                  }
                />

                {/* Assets Route */}
                <Route
                  path="/assets"
                  element={
                    canAccess("assets") ? (
                      <div className="w-full">
                        <Assets user={user} />
                      </div>
                    ) : (
                      <div className="p-6 text-red-500 font-semibold">Access Denied</div>
                    )
                  }
                />

                {/* Analytics Route */}
                <Route
                  path="/analytics"
                  element={
                    canAccess("analytics") ? (
                      <div className="w-full">
                        <ChartSection fullWidth />
                      </div>
                    ) : (
                      <div className="p-6 text-red-500 font-semibold">Access Denied</div>
                    )
                  }
                />

                {/* Users Route */}

                // inside 
                <Route
                  path="/users"
                  element={
                    canAccess("users") ? (
                      <div className="w-full">
                        <UserTable user={user} /> {/* 👈 Make sure user={user} is passed here! */}
                      </div>
                    ) : (
                      <div className="p-6 text-red-500 font-semibold">Access Denied</div>
                    )
                  }
                />

                {/* Notifications Route */}
                <Route
                  path="/notifications"
                  element={
                    canAccess("notifications") ? (
                      <div className="w-full">
                        <Notifications />
                      </div>
                    ) : (
                      <div className="p-6 text-red-500 font-semibold">Access Denied</div>
                    )
                  }
                />

                {/* Activity Route */}
                <Route
                  path="/activity"
                  element={
                    canAccess("activity") ? (
                      <div className="w-full">
                        <RecentActivity fullWidth />
                      </div>
                    ) : (
                      <div className="p-6 text-red-500 font-semibold">Access Denied</div>
                    )
                  }
                />

                {/* Catch all unknown routes */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;