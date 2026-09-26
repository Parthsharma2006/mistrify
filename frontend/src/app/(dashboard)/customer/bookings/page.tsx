"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Calendar, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then(res => res.json())
      .then(data => {
        if (data.success) setBookings(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "ACCEPTED": 
      case "ON_THE_WAY":
      case "ARRIVED":
      case "IN_PROGRESS": return "text-violet-400 bg-violet-400/10 border-violet-400/20";
      case "COMPLETED": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "REJECTED":
      case "CANCELLED": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">My Bookings</h1>
        <p className="text-gray-400">View and track your service requests.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-white/5">
          <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">You haven't made any bookings yet.</p>
          <Link href="/customer" className="mt-4 inline-block px-6 py-2 rounded-xl bg-violet-500/20 text-violet-300 font-bold hover:bg-violet-500/30 transition-colors">
            Book a Service
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking, i) => {
            const d = new Date(booking.scheduledDate);
            return (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/customer/bookings/${booking.id}`} className="block p-5 rounded-3xl glass-panel border border-white/5 hover:border-violet-500/30 transition-all group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-lg font-bold">
                        {booking.worker?.user?.name?.charAt(0) || "W"}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{booking.subcategory?.name}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <span className="text-violet-400">{booking.worker?.user?.name}</span> • {d.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-white/10 sm:border-0 pt-4 sm:pt-0">
                      <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(booking.status)}`}>
                        {booking.status.replace(/_/g, " ")}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}