import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle, BarChart3, CheckCircle2, Clock, Cpu, Download,
  FileText, Filter, Hash, MapPin, PieChart, RefreshCw, Search,
  ShieldCheck, TrendingUp, Trash2, Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "lost", label: "Lost Reports", icon: AlertTriangle },
  { id: "found", label: "Found Reports", icon: CheckCircle2 },
  { id: "verifications", label: "Verifications", icon: ShieldCheck },
  { id: "registry", label: "Device Registry", icon: Cpu },
  { id: "users", label: "Users", icon: Users },
  { id: "recovery", label: "Recovery Stats", icon: TrendingUp },
];

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [recoveryStats, setRecoveryStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let url;
      switch (activeTab) {
        case "overview":
          const [statsRes, recoveryRes] = await Promise.all([
            api.get("/admin/stats"),
            api.get("/admin/recovery-stats"),
          ]);
          setStats(statsRes.data.stats);
          setRecoveryStats(recoveryRes.data.stats);
          break;
        case "lost":
          url = `/admin/reports/lost?page=${page}&per_page=15`;
          if (statusFilter) url += `&status=${statusFilter}`;
          const lostRes = await api.get(url);
          setReports(lostRes.data.reports);
          setTotalPages(lostRes.data.pages);
          break;
        case "found":
          url = `/admin/reports/found?page=${page}&per_page=15`;
          if (statusFilter) url += `&status=${statusFilter}`;
          const foundRes = await api.get(url);
          setReports(foundRes.data.reports);
          setTotalPages(foundRes.data.pages);
          break;
        case "verifications":
          const verRes = await api.get(`/admin/verifications?page=${page}&per_page=15`);
          setVerifications(verRes.data.verifications);
          setTotalPages(verRes.data.pages);
          break;
        case "registry":
          let regUrl = `/admin/device-registry?page=${page}&per_page=15`;
          if (searchQuery) regUrl += `&search=${encodeURIComponent(searchQuery)}`;
          const regRes = await api.get(regUrl);
          setDevices(regRes.data.devices);
          setTotalPages(regRes.data.pages);
          break;
        case "users":
          const usersRes = await api.get(`/admin/users?page=${page}&per_page=15`);
          setUsers(usersRes.data.users);
          setTotalPages(usersRes.data.pages);
          break;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, statusFilter, searchQuery]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, activeTab, page, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, statusFilter, searchQuery]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">Access Denied</h2>
          <p className="mb-6 text-slate-400">Admin login required</p>
          <Link to="/login" className="rounded-lg bg-cyan-600 px-6 py-2 font-semibold text-white hover:bg-cyan-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-300/30 bg-purple-300/10 px-4 py-2 text-sm text-purple-200">
            <ShieldCheck size={14} />
            Admin Dashboard
          </div>
          <h1 className="text-3xl font-bold">Back To Way Administration</h1>
          <p className="mt-2 text-slate-400">Manage reports, verifications, and platform analytics</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setStatusFilter(""); setSearchQuery(""); }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === id
                  ? "bg-purple-600 text-white"
                  : "border border-white/10 text-slate-300 hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
          </div>
        ) : (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Overview */}
            {activeTab === "overview" && stats && (
              <div>
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Total Reports", value: stats.totalReports, icon: FileText, color: "cyan" },
                    { label: "Active Lost", value: stats.activeLost, icon: AlertTriangle, color: "red" },
                    { label: "Active Found", value: stats.activeFound, icon: CheckCircle2, color: "green" },
                    { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "emerald" },
                    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "blue" },
                    { label: "Verifications", value: stats.totalVerifications, icon: ShieldCheck, color: "purple" },
                    { label: "Safe Checks", value: stats.safeVerifications, icon: CheckCircle2, color: "emerald" },
                    { label: "Reports Today", value: stats.reportsToday, icon: Clock, color: "yellow" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm text-slate-400">{label}</span>
                        <Icon size={18} className={`text-${color}-400`} />
                      </div>
                      <div className={`text-3xl font-bold text-${color}-200`}>{value}</div>
                    </div>
                  ))}
                </div>

                {recoveryStats && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                      <span className="text-sm text-slate-400">Recovery Rate</span>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-bold text-emerald-300">{recoveryStats.recoveryRate}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${recoveryStats.recoveryRate}%` }} />
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                      <span className="text-sm text-slate-400">Total Recovered</span>
                      <div className="mt-2 text-3xl font-bold text-green-300">{recoveryStats.totalRecovered}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                      <span className="text-sm text-slate-400">Active Lost Reports</span>
                      <div className="mt-2 text-3xl font-bold text-red-300">{recoveryStats.totalActiveLost}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                      <span className="text-sm text-slate-400">Recoveries (30 days)</span>
                      <div className="mt-2 text-3xl font-bold text-cyan-300">{recoveryStats.recentRecoveries}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lost Reports */}
            {activeTab === "lost" && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <Filter size={16} className="text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-sm text-white"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                {renderTable(reports, ["Title", "Category", "Brand", "Status", "User", "Date"], ["title", "category", "brand", "status", "userName", "createdAt"])}
                {renderPagination()}
              </div>
            )}

            {/* Found Reports */}
            {activeTab === "found" && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <Filter size={16} className="text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-sm text-white"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                {renderTable(reports, ["Title", "Category", "Brand", "Status", "User", "Date"], ["title", "category", "brand", "status", "userName", "createdAt"])}
                {renderPagination()}
              </div>
            )}

            {/* Verifications */}
            {activeTab === "verifications" && (
              <div>
                {renderTable(verifications, ["IMEI", "Serial", "Model", "Product ID", "Result", "Date"], ["imei", "serialNumber", "modelNumber", "productId", "resultStatus", "createdAt"])}
                {renderPagination()}
              </div>
            )}

            {/* Device Registry */}
            {activeTab === "registry" && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by brand, model, serial, IMEI..."
                      className="w-full rounded-lg border border-white/10 bg-slate-900 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500"
                    />
                  </div>
                </div>
                {renderTable(devices, ["Title", "Brand", "Model", "Serial", "IMEI", "Type", "Status"], ["title", "brand", "modelNumber", "serialNumber", "imei", "type", "status"])}
                {renderPagination()}
              </div>
            )}

            {/* Users */}
            {activeTab === "users" && (
              <div>
                {renderTable(users, ["Name", "Email", "Phone", "Reports", "Joined"], ["name", "email", "phone", "reportCount", "createdAt"])}
                {renderPagination()}
              </div>
            )}

            {/* Recovery Stats */}
            {activeTab === "recovery" && recoveryStats && (
              <div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                    <h3 className="mb-4 text-lg font-bold">Recovery Overview</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Recovered</span>
                        <span className="font-bold text-emerald-300">{recoveryStats.totalRecovered}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Lost Reports</span>
                        <span className="font-bold text-red-300">{recoveryStats.totalActiveLost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Recovery Rate</span>
                        <span className="font-bold text-cyan-300">{recoveryStats.recoveryRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Recent (30 days)</span>
                        <span className="font-bold text-blue-300">{recoveryStats.recentRecoveries}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                    <h3 className="mb-4 text-lg font-bold">Top Recovered Categories</h3>
                    {recoveryStats.topCategories && recoveryStats.topCategories.length > 0 ? (
                      <div className="space-y-3">
                        {recoveryStats.topCategories.map((cat, i) => (
                          <div key={cat.category} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-400">{i + 1}.</span>
                              <span className="font-medium">{cat.category}</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-300">{cat.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No recovery data available yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );

  function renderTable(data, headers, fields) {
    if (!data || data.length === 0) {
      return (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-12 text-center">
          <p className="text-slate-400">No data available</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-slate-300">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id || i} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                {fields.map((field) => (
                  <td key={field} className="px-4 py-3 text-slate-400">
                    {field === "status" ? (
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row[field] === "Active" ? "bg-blue-500/15 text-blue-300" :
                        row[field] === "Resolved" ? "bg-emerald-500/15 text-emerald-300" :
                        row[field] === "SAFE" ? "bg-emerald-500/15 text-emerald-300" :
                        row[field] === "REPORTED LOST/STOLEN" ? "bg-red-500/15 text-red-300" :
                        "bg-slate-500/15 text-slate-300"
                      }`}>
                        {row[field]}
                      </span>
                    ) : field === "createdAt" || field === "date" ? (
                      row[field] ? new Date(row[field]).toLocaleDateString() : "N/A"
                    ) : (
                      row[field] || "—"
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderPagination() {
    if (totalPages <= 1) return null;
    return (
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm disabled:opacity-30"
        >
          Previous
        </button>
        <span className="px-3 text-sm text-slate-400">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm disabled:opacity-30"
        >
          Next
        </button>
      </div>
    );
  }
}
