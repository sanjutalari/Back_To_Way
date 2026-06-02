import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Search, ShieldCheck, Clock, Hash, QrCode, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

const emptyForm = {
  imei: "",
  serialNumber: "",
  modelNumber: "",
  productId: "",
};

const searchFields = [
  { name: "imei", label: "IMEI Number", placeholder: "356938035643809", icon: Hash },
  { name: "serialNumber", label: "Serial Number", placeholder: "C02ZN1ABC123", icon: QrCode },
  { name: "modelNumber", label: "Model Number", placeholder: "A2485", icon: Cpu },
  { name: "productId", label: "Product ID", placeholder: "Asset tag or product ID", icon: Hash },
];

const recentSearches = typeof window !== "undefined"
  ? JSON.parse(localStorage.getItem("recentVerifications") || "[]")
  : [];

export default function Verify() {
  const [formData, setFormData] = useState(emptyForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [recent, setRecent] = useState(recentSearches);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        if (value.trim()) params.append(key, value.trim());
      });

      const response = await api.get(`/verify?${params.toString()}`);
      setResult(response.data);

      const searchEntry = {
        query: Object.entries(formData).filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v}`).join(", "),
        status: response.data.status,
        timestamp: new Date().toISOString(),
      };
      const updated = [searchEntry, ...recent.slice(0, 9)];
      setRecent(updated);
      localStorage.setItem("recentVerifications", JSON.stringify(updated));
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isReported = result?.status === "REPORTED LOST/STOLEN";
  const hasInput = Object.values(formData).some((v) => v.trim());

  const clearForm = () => {
    setFormData(emptyForm);
    setResult(null);
    setError("");
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 max-w-3xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
            <ShieldCheck size={16} />
            Device history check
          </div>
          <h1 className="text-4xl font-bold md:text-6xl">
            Verify before you buy a used device.
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Search active lost and stolen reports by IMEI, serial number, model number, or product ID.
            Owner contact details stay private. Results are instant and free.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold">Enter device details</h2>
                {hasSearched && (
                  <button type="button" onClick={clearForm} className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold">
                    New search
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {searchFields.map(({ name, label, placeholder, icon: Icon }) => (
                  <label key={name} className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <Icon size={14} />
                      {label}
                    </span>
                    <input
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                  </label>
                ))}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || !hasInput}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 font-semibold text-white transition-all hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Checking database...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Verify Device
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
          >
            {!result ? (
              <div className="flex h-full min-h-[300px] flex-col justify-center">
                <ShieldCheck className="mb-4 text-cyan-300" size={40} />
                <h2 className="text-xl font-bold">Verification result</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Enter at least one device identifier to check whether matching lost or stolen reports exist in our database.
                </p>

                {recent.length > 0 && (
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Clock size={12} />
                      Recent searches
                    </div>
                    <div className="space-y-2">
                      {recent.slice(0, 3).map((entry, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                          <span className="max-w-[200px] truncate text-slate-400">{entry.query}</span>
                          <span className={`font-semibold ${entry.status === "SAFE" ? "text-emerald-400" : "text-red-400"}`}>
                            {entry.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div
                  className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                    isReported
                      ? "bg-red-500/15 text-red-200"
                      : "bg-emerald-400/15 text-emerald-200"
                  }`}
                >
                  {isReported ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                  {result.status}
                </div>
                <h2
                  className={`text-xl font-bold ${
                    isReported ? "text-red-200" : "text-emerald-200"
                  }`}
                >
                  {result.message}
                </h2>

                {isReported && result.reports && (
                  <div className="mt-5 space-y-3">
                    <p className="text-sm font-semibold text-slate-400">Matching reports:</p>
                    {result.reports.map((report) => (
                      <motion.div
                        key={report.trackingId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-white/10 bg-slate-900/80 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm text-cyan-200">
                            {report.trackingId}
                          </span>
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-300">
                            {report.type}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-400">
                          <div>
                            <span className="text-slate-500">Product Type:</span>{" "}
                            <span className="font-medium text-white">{report.productType}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Status:</span>{" "}
                            <span className="font-medium text-white">{report.reportStatus}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Brand:</span>{" "}
                            <span className="font-medium text-white">{report.brand || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Model:</span>{" "}
                            <span className="font-medium text-white">{report.model || "N/A"}</span>
                          </div>
                          {report.reportDate && (
                            <div className="col-span-2">
                              <span className="text-slate-500">Reported:</span>{" "}
                              <span className="font-medium text-white">
                                {new Date(report.reportDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {!isReported && (
                  <div className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-sm text-emerald-200">
                      This device appears to be safe to purchase. No lost or stolen reports match the provided identifiers.
                    </p>
                  </div>
                )}

                <button
                  onClick={clearForm}
                  className="mt-5 w-full rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Verify another device
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid gap-6 border-t border-white/10 pt-10 sm:grid-cols-3"
        >
          {[
            { icon: ShieldCheck, title: "Private & Secure", desc: "Owner contact details are never exposed during verification." },
            { icon: Clock, title: "Instant Results", desc: "Our database returns results within seconds of your search." },
            { icon: Search, title: "Multiple Identifiers", desc: "Search by IMEI, serial number, model number, or product ID." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <Icon className="mt-0.5 shrink-0 text-cyan-300" size={18} />
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
