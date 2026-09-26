"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, CreditCard, FileText, Star, AlertTriangle, IndianRupee } from "lucide-react";

export default function AdminTransactionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/transactions")
      .then(res => res.json())
      .then(res => { if (res.success) setData(res.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  const summaryCards = [
    { icon: CreditCard, label: "Total Payments", value: data?.counts?.payments || 0, color: "text-green-400", bg: "bg-green-500/10" },
    { icon: FileText, label: "Invoices", value: data?.counts?.invoices || 0, color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: Star, label: "Ratings", value: data?.counts?.ratings || 0, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { icon: AlertTriangle, label: "Open Complaints", value: data?.counts?.complaints || 0, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
        <p className="text-gray-400">Payments, invoices, ratings, and complaints overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl border border-white/10 bg-white/5"
          >
            <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Payments Table */}
      <div className="p-6 rounded-3xl glass-panel mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-green-400" /> Recent Payments
        </h2>
        {data?.payments?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-3 text-gray-400 font-medium">Booking</th>
                  <th className="pb-3 text-gray-400 font-medium">Customer</th>
                  <th className="pb-3 text-gray-400 font-medium">Worker</th>
                  <th className="pb-3 text-gray-400 font-medium">Amount</th>
                  <th className="pb-3 text-gray-400 font-medium">Status</th>
                  <th className="pb-3 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="py-3 text-white font-mono text-xs">#{p.bookingId?.slice(0, 8).toUpperCase()}</td>
                    <td className="py-3 text-white">{p.booking?.customer?.user?.name || "—"}</td>
                    <td className="py-3 text-white">{p.booking?.worker?.user?.name || "—"}</td>
                    <td className="py-3 text-green-400 font-bold">{`\u20B9${p.amount}`}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === "SUCCESS" ? "bg-green-500/10 text-green-400" :
                        p.status === "FAILED" ? "bg-red-500/10 text-red-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No payments recorded yet.</p>
        )}
      </div>

      {/* Complaints */}
      <div className="p-6 rounded-3xl glass-panel">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" /> Open Complaints
        </h2>
        {data?.complaints?.length > 0 ? (
          <div className="space-y-3">
            {data.complaints.map((c: any) => (
              <div key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-red-400 uppercase">{c.category}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === "OPEN" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                  }`}>{c.status}</span>
                </div>
                <p className="text-white text-sm mb-1">{c.description}</p>
                <p className="text-xs text-gray-500">Booking #{c.bookingId?.slice(0, 8).toUpperCase()} | {new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No open complaints.</p>
        )}
      </div>
    </div>
  );
}
