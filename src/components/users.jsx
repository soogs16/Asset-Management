import { useEffect, useState } from "react";
import { Users as UsersIcon, Mail, Building2, Package, RefreshCw, Search, ChevronRight, Shield } from "lucide-react";
import UserDetails from "./UserDetails";

const Users = ({ user: loggedInUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const canViewDetails = true; // All authenticated users can view user profiles

  const fetchUsers = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/users")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setUsers([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by search term and role filter
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.unit?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q);

    const matchesRole =
      roleFilter === "all" || u.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "US";

  const getRoleBadge = (role = "") => {
    const r = role.toLowerCase();
    if (r === "admin")
      return "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20";
    if (r === "manager")
      return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20";
    return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20";
  };

  // Render Details view if a user is selected
  if (selectedUserId) {
    return (
      <UserDetails
        userId={selectedUserId}
        onBack={() => setSelectedUserId(null)}
        currentUser={loggedInUser}  // 👈 pass logged-in admin
      />
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UsersIcon size={20} className="text-indigo-500" />
            User Directory
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredUsers.length} total user{filteredUsers.length !== 1 ? "s" : ""} registered
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search & Role Filter Tabs */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, unit, or role..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-700 p-1 border border-gray-200 dark:border-gray-600 rounded-lg w-full sm:w-auto">
          {["all", "admin", "manager", "staff"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize flex-1 sm:flex-none ${
                roleFilter === r
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-500 py-10 text-sm">Loading users from database...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm">No users found.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {["User", "Role", "Unit", "Email", "Assigned Items", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className="cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  {/* Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                        {getInitials(u.full_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {u.full_name}
                          <span className="text-[10px] font-normal text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            View details →
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getRoleBadge(u.role)}`}>
                      <Shield size={12} />
                      {u.role || "staff"}
                    </span>
                  </td>

                  {/* Unit */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Building2 size={14} className="text-gray-400" />
                      {u.unit || "General"}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Mail size={14} className="text-gray-400" />
                      {u.email}
                    </div>
                  </td>

                  {/* Assigned items count */}
                  <td className="px-5 py-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
                      <Package size={14} />
                      {u.assigned_items || 0}
                    </div>
                  </td>

                  {/* Chevron Arrow */}
                  <td className="px-5 py-4 text-right">
                    <ChevronRight size={18} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;