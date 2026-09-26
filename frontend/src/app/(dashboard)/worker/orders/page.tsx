"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Calendar, MapPin, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function WorkerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch("/api/bookings")
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.data);
      })
      .finally(() => setLoading(false));
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders(); // refresh list
      } else alert(data.error);
    } catch(err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "ACCEPTED": 
      case "ON_THE_WAY":
      case "ARRIVED":
      case "IN_PROGRESS": return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
      case "COMPLETED": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "REJECTED":
      case "CANCELLED": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const newRequests = orders.filter(o => o.status === "PENDING").sort((a, b) => b.isEmergency - a.isEmergency);
  const otherOrders = orders.filter(o => o.status !== "PENDING");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">My Orders</h1>
        <p className="text-gray-400">Manage your new service requests and active jobs.</p>
      </div>

      {newRequests.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4">New Requests ({newRequests.length})</h2>
          <div className="grid gap-4">
            {newRequests.map((order, i) => {
              const d = new Date(order.scheduledDate);
              const isEm = order.isEmergency;
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`p-6 rounded-3xl glass-panel border relative overflow-hidden ${isEm ? 'border-red-500/50 bg-red-500/10' : 'border-cyan-500/30 bg-cyan-500/5'}`}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {isEm ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-500 text-white font-bold uppercase flex items-center gap-1">🚨 Emergency</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-400 font-bold border border-yellow-500/20 uppercase">New Request</span>
                        )}
                        <span className="text-sm text-gray-400">#{order.id.slice(0,8).toUpperCase()}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{order.subcategory?.name}</h3>
                      <p className="text-sm text-gray-300 flex items-center gap-2 mb-1">
                        <Calendar className={`w-4 h-4 ${isEm ? 'text-red-400' : 'text-cyan-400'}`} /> {d.toLocaleDateString()} at {d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </p>
                      <p className="text-sm text-gray-300 flex items-center gap-2 mb-1">
                        <MapPin className={`w-4 h-4 ${isEm ? 'text-red-400' : 'text-cyan-400'}`} /> {order.address}
                      </p>
                      <p className={`text-sm font-bold mt-2 flex items-center gap-2 ${isEm ? 'text-red-400' : 'text-cyan-400'}`}>Estimated Earnings: ₹{order.price}</p>
                    </div>

                    <div className="flex sm:flex-col gap-3 justify-center">
                      <button onClick={() => updateStatus(order.id, "ACCEPTED")} className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-2 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Accept
                      </button>
                      <button onClick={() => updateStatus(order.id, "REJECTED")} className="px-6 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 font-bold flex items-center gap-2 transition-colors">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Active & Past Orders</h2>
        {otherOrders.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel border border-white/5">
            <p className="text-gray-400">No active or past orders found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {otherOrders.map((order, i) => {
              const d = new Date(order.scheduledDate);
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/worker/orders/${order.id}`} className="block p-5 rounded-3xl glass-panel border border-white/5 hover:border-cyan-500/30 transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{order.subcategory?.name}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <span className="text-cyan-400">{order.customer?.user?.name}</span> • {d.toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-white/10 sm:border-0 pt-4 sm:pt-0">
                        <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, " ")}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}