'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Truck, Wrench, CheckCircle, Clock, Loader2, Package } from 'lucide-react';

type ActiveOrder = {
  id: string;
  customerName: string;
  address: string;
  serviceType: string;
  amount: number;
  status: string;
  paymentStatus?: string;
};

const statusFlow = [
  { key: 'ASSIGNED',   label: 'Order Accepted',    icon: Package,      color: 'violet' },
  { key: 'TRAVELLING', label: 'On the Way',         icon: Truck,        color: 'blue'   },
  { key: 'ARRIVED',    label: 'Arrived at Location',icon: MapPin,       color: 'fuchsia'},
  { key: 'WORKING',    label: 'Work in Progress',   icon: Wrench,       color: 'amber'  },
  { key: 'COMPLETED',  label: 'Work Done',          icon: CheckCircle,  color: 'green'  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  violet:  { bg: 'bg-violet-500/20',  border: 'border-violet-500',  text: 'text-violet-300',  ring: 'ring-violet-500'  },
  blue:    { bg: 'bg-blue-500/20',    border: 'border-blue-500',    text: 'text-blue-300',    ring: 'ring-blue-500'    },
  fuchsia: { bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500', text: 'text-fuchsia-300', ring: 'ring-fuchsia-500' },
  amber:   { bg: 'bg-amber-500/20',   border: 'border-amber-500',   text: 'text-amber-300',   ring: 'ring-amber-500'   },
  green:   { bg: 'bg-green-500/20',   border: 'border-green-500',   text: 'text-green-300',   ring: 'ring-green-500'   },
};

export default function WorkerTrackPage() {
  const [order, setOrder] = useState<ActiveOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActive = async () => {
    try {
      const res = await fetch('/api/workers/tasks');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const active = data.data.find((t: ActiveOrder) =>
          !['COMPLETED', 'CANCELLED'].includes(t.status)
        );
        setOrder(active || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 5000);
    const handleVis = () => { if (document.visibilityState === 'visible') fetchActive(); };
    document.addEventListener('visibilitychange', handleVis);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', handleVis); };
  }, []);

  const currentStepIndex = order ? statusFlow.findIndex(s => s.key === order.status) : -1;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  /* ─── No active order ─── */
  if (!order) {
    return (
      <div className="min-h-screen bg-[#07070f] flex flex-col items-center justify-center px-6 text-center pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <MapPin className="w-9 h-9 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-white">No Active Orders</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            When a customer books you, your active job will appear here with the full journey flow.
          </p>
        </motion.div>
      </div>
    );
  }

  /* ─── Active order flow ─── */
  return (
    <div className="min-h-screen bg-[#07070f] px-5 pt-6 pb-28 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-6"
      >
        {/* Order Card */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Active Order</p>
              <h2 className="text-xl font-bold text-white mt-1">{order.customerName}</h2>
              <p className="text-sm text-gray-400">{order.serviceType}</p>
            </div>
            <span className="text-2xl font-black text-white">₹{order.amount}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-400 mt-3 pt-3 border-t border-white/10">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-violet-400" />
            <span>{order.address || 'Address not provided'}</span>
          </div>
        </div>

        {/* Status Flow Timeline */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-5 uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-400" /> Job Progress
          </h3>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-white/10" />

            <div className="space-y-6">
              {statusFlow.map((step, i) => {
                const isDone    = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const isPending = i > currentStepIndex;
                const c = colorMap[step.color];
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 relative"
                  >
                    {/* Circle */}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2
                      ${isCurrent ? `${c.bg} ${c.border} ring-4 ring-offset-0 ${c.ring}/20` : ''}
                      ${isDone    ? 'bg-green-500/20 border-green-500' : ''}
                      ${isPending ? 'bg-white/5 border-white/10' : ''}
                    `}>
                      {isDone ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isCurrent ? c.text : 'text-gray-600'}`} />
                      )}
                      {isCurrent && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-violet-400 rounded-full animate-ping" />
                      )}
                    </div>

                    {/* Label */}
                    <div>
                      <p className={`text-sm font-bold ${isCurrent ? 'text-white' : isDone ? 'text-gray-400' : 'text-gray-600'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className={`text-xs mt-0.5 ${c.text}`}>● Current Status</p>
                      )}
                      {isDone && (
                        <p className="text-xs mt-0.5 text-green-500">✓ Done</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {order.status === 'COMPLETED' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-4 text-center border ${
              order.paymentStatus === 'SUCCESS'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            {order.paymentStatus === 'SUCCESS' ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-green-300">Payment Received! Job Complete.</p>
              </>
            ) : (
              <>
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
                <p className="text-sm font-bold text-amber-300">Waiting for Customer Payment…</p>
                <p className="text-xs text-gray-500 mt-1">This updates automatically</p>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
