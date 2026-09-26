"use client";

import { motion } from "framer-motion";
import { 
  CheckCircle, User, Truck, MapPin, Wrench, ShieldCheck, ArrowLeft, Phone, MessageSquare, Loader2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const ALL_STATUSES = [
  { id: "PENDING", label: "Booking Confirmed", icon: CheckCircle, description: "Your request has been received." },
  { id: "ASSIGNED", label: "Professional Assigned", icon: User, description: "Worker is assigned to your job." },
  { id: "TRAVELLING", label: "On The Way", icon: Truck, description: "Worker is heading to your location." },
  { id: "ARRIVED", label: "Arrived", icon: MapPin, description: "Worker has reached the destination." },
  { id: "WORKING", label: "Work Started", icon: Wrench, description: "The service is currently in progress." },
  { id: "COMPLETED", label: "Completed", icon: ShieldCheck, description: "Job done. Please complete payment." }
];

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paying, setPaying] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handlePayment = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/payment', { method: 'POST', body: JSON.stringify({ bookingId: booking.id, amount: booking.price || booking.basePrice || 500, customerId: booking.customerId, workerId: booking.workerId }) });
      if (res.ok) {
        alert('Payment Successful! Admin has been notified and invoice generated.');
        setShowPayment(false);
        fetchBooking();
      } else {
        alert('Payment failed');
      }
    } catch(e) {
      alert('Payment error');
    } finally {
      setPaying(false);
    }
  };
  
  const fetchBooking = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        // If ID provided, find it. Else find most recent active booking.
        let target = data.data.find((b: any) => b.id === bookingId);
        if (!target) {
          target = data.data.find((b: any) => !['COMPLETED', 'CANCELLED'].includes(b.status)) || data.data[0];
        }
        setBooking(target);
      }
    } catch (e) {
      console.error('Failed to fetch booking', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // Real-time polling every 5 seconds
    const interval = setInterval(fetchBooking, 5000);
    const handleVisibilityChange = () => { if (document.visibilityState === 'visible') fetchBooking(); };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [bookingId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen p-5 pt-safe text-center">
        <Link href="/customer" className="inline-block mb-4 p-2 bg-white/5 rounded-full">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <p className="text-gray-400">No active bookings found.</p>
      </div>
    );
  }

  const currentStatusIndex = ALL_STATUSES.findIndex(s => s.id === booking.status);
  const displayIndex = currentStatusIndex === -1 ? 0 : currentStatusIndex; // Default PENDING if not found

  const workerName = booking.worker?.user?.name || "Assigning...";
  const workerCategory = booking.category?.name || "Service";
  const shortId = booking.id.substring(booking.id.length - 6).toUpperCase();

  // Update dynamic descriptions based on actual data
  const statuses = ALL_STATUSES.map(s => {
    if (s.id === 'ASSIGNED') return { ...s, description: `${workerName} (${workerCategory}) is assigned.` };
    if (s.id === 'TRAVELLING') return { ...s, description: `${workerName} is heading to your location.` };
    return s;
  });

  return (
    <div className="min-h-screen px-5 pt-safe pb-24 overflow-x-hidden">
      <div className="w-full max-w-md mx-auto pt-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/customer" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <h1 className="text-[20px] font-bold text-white tracking-tight">Live Track</h1>
          </div>
          <span className="text-[12px] font-medium text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1 rounded-full">#{shortId}</span>
        </div>

        {/* Worker Info Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-bold text-white">{workerName}</h3>
              <p className="text-[13px] text-fuchsia-300 font-medium">{workerCategory}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[11px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-md">Verification: Safe</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex-1 bg-white/10 hover:bg-white/15 transition-colors py-2.5 rounded-xl flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-300" />
              <span className="text-[13px] font-semibold text-white">Chat</span>
            </button>
            <button className="flex-1 bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-400 hover:to-violet-400 transition-colors py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-500/20">
              <Phone className="w-4 h-4 text-white" />
              <span className="text-[13px] font-semibold text-white">Call</span>
            </button>
          </div>
        </motion.div>

        {booking.status === 'COMPLETED' && !booking.payment && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-5 mb-8 border-green-500/30">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-[18px] font-bold text-white">Payment Required</h3>
                <p className="text-[13px] text-gray-400">Total Amount: ₹{booking.price || booking.basePrice || 500}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <button onClick={() => setShowPayment(true)} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 transition-colors py-3.5 rounded-xl font-bold text-white shadow-lg shadow-green-500/20">
              Pay Online Now
            </button>
          </motion.div>
        )}
        
        {showPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#07070f] border border-white/10 p-6 rounded-3xl w-full max-w-sm">
              <h2 className="text-xl font-bold text-white mb-2">Select Payment Method</h2>
              <p className="text-sm text-gray-400 mb-6">Amount to pay: ₹{booking.price || booking.basePrice || 500}</p>
              <div className="space-y-3 mb-6">
                <button className="w-full p-4 rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20"></div>
                  <span className="text-white font-medium">UPI (GPay, PhonePe)</span>
                </button>
                <button className="w-full p-4 rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20"></div>
                  <span className="text-white font-medium">Credit / Debit Card</span>
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPayment(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium">Cancel</button>
                <button onClick={handlePayment} disabled={paying} className="flex-1 py-3 rounded-xl bg-violet-500 text-white font-medium flex items-center justify-center gap-2">
                  {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {booking.payment && booking.payment.status === 'SUCCESS' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-5 mb-8 border-violet-500/30">
            <h3 className="text-[18px] font-bold text-white mb-2">Payment Successful!</h3>
            <p className="text-[13px] text-gray-400 mb-4">Thank you for using Mistrify. Your transaction of ₹{booking.payment.amount} was successful.</p>
            
            <div className="flex gap-3 mb-4">
              <a href={`/api/invoice/download?id=${booking.payment.id}`} download className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-3 rounded-xl font-bold text-white text-center text-sm flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Download Invoice
              </a>
            </div>

            <div className="border-t border-white/10 pt-4 mt-2">
              <h4 className="text-[14px] font-bold text-white mb-3">Rate {workerName}</h4>
              {reviewSubmitted ? <p className="text-green-400 text-sm text-center">Thanks for your feedback!</p> : <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={async () => {
                    try {
                      await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: booking.id, rating: star, comment: 'Great job!' }) });
                      setReviewSubmitted(true);
                      alert('Review submitted! Thank you.');
                    } catch(e) {}
                  }} className="text-amber-500 hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  </button>
                ))}
              </div>}
            </div>
          </motion.div>
        )}
        
        {/* Timeline */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative pl-6">
          {/* Vertical Track Line */}
          <div className="absolute left-[33px] top-6 bottom-6 w-0.5 bg-white/10" />
          
          {/* Active Track Line (Progress) */}
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${(displayIndex / (statuses.length - 1)) * 100}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute left-[33px] top-6 w-0.5 bg-gradient-to-b from-fuchsia-500 to-violet-500" 
          />

          <div className="space-y-8">
            {statuses.map((status, idx) => {
              const isActive = idx === displayIndex;
              const isPast = idx < displayIndex;
              const Icon = status.icon;

              return (
                <motion.div key={idx} variants={itemVariants} className="relative flex gap-5">
                  {/* Timeline Dot */}
                  <div className={`relative z-10 w-5 h-5 rounded-full border-4 flex-shrink-0 mt-1 ${
                    isActive ? 'bg-fuchsia-500 border-[#07070f] shadow-[0_0_15px_rgba(217,70,239,0.5)]' :
                    isPast ? 'bg-violet-500 border-[#07070f]' :
                    'bg-white/20 border-[#07070f]'
                  }`}>
                    {isActive && (
                      <span className="absolute inset-[-4px] rounded-full border border-fuchsia-500/50 animate-ping" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ${!isPast && !isActive ? 'opacity-40' : ''}`}>
                    <h4 className={`text-[15px] font-bold ${isActive ? 'text-fuchsia-400' : 'text-white'}`}>
                      {status.label}
                    </h4>
                    <p className="text-[13px] text-gray-400 mt-1 leading-relaxed">
                      {status.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
