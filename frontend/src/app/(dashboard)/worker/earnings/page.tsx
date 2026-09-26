"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Calendar, CheckCircle, Clock, Loader2 } from "lucide-react";

export default function WorkerEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workers/earnings")
      .then(res => res.json())
      .then(res => { if (res.success) setData(res.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-500" /></div>;

  const stats = [
    { icon: DollarSign, label: "Today", value: data?.todayEarnings || 0, bg: "bg-green-500/10" },
    { icon: TrendingUp, label: "This Week", value: data?.weekEarnings || 0, bg: "bg-teal-500/10" },
    { icon: Calendar, label: "This Month", value: data?.monthEarnings || 0, bg: "bg-blue-500/10" },
    { icon: DollarSign, label: "Total Earnings", value: data?.totalEarnings || 0, bg: "bg-purple-500/10" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-2">Earnings</h1>
        <p className="text-gray-400 mb-8">Track your income from completed services.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl border border-white/10 bg-white/5"
            >
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white/80" />
              </div>
              <p className="text-2xl font-bold text-white">{`\u20B9${s.value}`}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl glass-panel flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{data?.completedPaidJobs || 0}</p>
              <p className="text-xs text-gray-400">Completed Paid Jobs</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl glass-panel flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{data?.pendingPayments || 0}</p>
              <p className="text-xs text-gray-400">Pending Payments</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-panel">
          <h2 className="text-lg font-bold text-white mb-4">Recent Paid Services</h2>
          {data?.recentPaid?.length > 0 ? (
            <div className="space-y-3">
              {data.recentPaid.map((b: any) => (
                <div key={b.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-white font-medium">{b.subcategory?.name || "Service"}</p>
                    <p className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-green-400 font-bold text-lg">{`\u20B9${b.payment?.amount || b.finalAmount || b.price}`}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-green-500/30 mx-auto mb-4" />
              <p className="text-gray-400">No paid services yet. Complete a service and receive payment to see your earnings here.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
