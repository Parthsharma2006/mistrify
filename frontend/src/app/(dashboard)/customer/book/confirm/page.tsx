"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, CheckCircle, MapPin, Calendar, Clock, User, ShieldCheck } from "lucide-react";

export default function ConfirmBookingPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const dataStr = sessionStorage.getItem("bookingData");
    if (!dataStr) {
      router.push("/customer");
      return;
    }
    setData(JSON.parse(dataStr));
    setLoading(false);
  }, [router]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success) {
        setSuccess(true);
        sessionStorage.removeItem("bookingData");
        setTimeout(() => {
          router.push(`/customer/bookings/${resData.data.id}`);
        }, 2000);
      } else {
        alert(resData.error || "Failed to create booking");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to confirm booking.");
      setSubmitting(false);
    }
  };

  if (loading || !data) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 rounded-3xl glass-panel">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
          <p className="text-gray-400 mb-6">Your request has been sent to the worker. Redirecting to tracking page...</p>
          <Loader2 className="w-6 h-6 animate-spin text-violet-500 mx-auto" />
        </motion.div>
      </div>
    );
  }

  const d = new Date(data.scheduledDate);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Selection
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Review & Confirm</h1>
        <p className="text-gray-400">Please review your service request details before confirming.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl glass-panel space-y-8">
        
        {/* Worker Info */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold">
            {data.workerName?.charAt(0) || "W"}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{data.workerName}</h3>
            <p className="text-sm text-violet-400 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Verified {data.categoryName}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Service</label>
            <p className="text-white font-medium">{data.subcategoryName}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 block">Estimated Price Breakdown</label>
            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Base Rate</span>
                <span className="text-white font-medium">₹{data.basePrice || 500}</span>
              </div>
              {data.workloadAdjustment !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Workload Adjustment</span>
                  <span className={data.workloadAdjustment > 0 ? "text-yellow-400 font-medium" : "text-green-400 font-medium"}>
                    {data.workloadAdjustment > 0 ? "+" : ""}₹{data.workloadAdjustment}
                  </span>
                </div>
              )}
              {data.isEmergency && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">Emergency Surcharge</span>
                  <span className="text-red-400 font-medium">+₹{data.emergencySurcharge || 150}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-bold">
                <span className="text-white">Final Estimated Price</span>
                <span className={data.isEmergency ? "text-red-400 text-lg" : "text-violet-400 text-lg"}>₹{data.price} <span className="text-xs font-normal">/hr</span></span>
              </div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block"><MapPin className="inline w-3 h-3 mr-1" /> Address</label>
            <p className="text-white font-medium bg-black/30 p-3 rounded-xl border border-white/5">{data.address}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block"><Calendar className="inline w-3 h-3 mr-1" /> Date</label>
            <p className="text-white font-medium">{d.toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block"><Clock className="inline w-3 h-3 mr-1" /> Time</label>
            <p className="text-white font-medium">{d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </div>

        <button 
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-violet-500 hover:bg-violet-400 text-black font-bold text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm & Send Request"}
        </button>

      </motion.div>
    </div>
  );
}