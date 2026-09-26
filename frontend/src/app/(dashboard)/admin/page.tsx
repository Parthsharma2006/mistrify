"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  Users, Briefcase, Building2, ShieldAlert, Clock,
  MapPin, Activity, Sparkles, ChevronDown, CheckCircle, Loader2, LogOut
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalWorkers: number;
  totalCustomers: number;
  totalCooperatives: number;
  pendingVerifications: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const handleReassign = async () => {
    try {
      const res = await fetch('/api/admin/reassign-expired', { method: 'POST', body: JSON.stringify({ maxDelayMinutes: 30 }) });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert('Failed: ' + data.error);
      }
    } catch (e) {
      alert('Error running reassignment workflow');
    }
  };

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch("/api/admin/ai-insights")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAiInsights(data.data.insights);
      })
      .catch(console.error)
      .finally(() => setAiLoading(false));
  }, []);

  const statCards = [
    {
      icon: Briefcase,
      label: "Workers",
      value: stats?.totalWorkers ?? 0,
      color: "from-violet-500 to-blue-600",
    },
    {
      icon: Users,
      label: "Customers",
      value: stats?.totalCustomers ?? 0,
      color: "from-amber-500 to-green-500",
    },
    {
      icon: Building2,
      label: "Cooperatives",
      value: stats?.totalCooperatives ?? 0,
      color: "from-purple-500 to-fuchsia-500",
    },
    {
      icon: ShieldAlert,
      label: "Pending",
      value: stats?.pendingVerifications ?? 0,
      color: "from-amber-500 to-orange-500",
      alert: (stats?.pendingVerifications ?? 0) > 0,
    },
  ];

  const quickActions = [
    { icon: CheckCircle, label: "Verify Workers", color: "text-amber-400", bg: "bg-amber-400/10" },
    { icon: MapPin, label: "Manage Zones", color: "text-violet-400", bg: "bg-violet-400/10" },
    { icon: Activity, label: "Transactions", color: "text-green-400", bg: "bg-green-400/10" },
    { icon: Clock, label: "Reassign Delays", color: "text-red-400", bg: "bg-red-400/10", onClick: handleReassign },
    { icon: Sparkles, label: "AI Insights", color: "text-fuchsia-400", bg: "bg-fuchsia-400/10", onClick: () => setIsAiExpanded(true) },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#07070f]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070f] px-5 pt-safe pb-24 overflow-x-hidden">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-md mx-auto space-y-8 mt-6">
        
        {/* Top Section */}
        <motion.div variants={itemVariants} className="flex justify-between items-start">
          <div>
            <h1 className="text-[24px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 tracking-tight">
              Admin Panel
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 font-bold tracking-wide transition-all active:scale-[0.98] text-xs"
          >
            <LogOut className="w-4 h-4" />
            LOGOUT
          </button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md">
              <div className={`absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-bl ${stat.color} rounded-full blur-[30px] opacity-20`} />
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                {stat.alert && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-0.5">{stat.value}</h3>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
          <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar -mx-5 px-5">
            {quickActions.map((action, idx) => (
              <button 
                key={idx}
                onClick={action.onClick}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-3 whitespace-nowrap min-w-max active:bg-white/10 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full ${action.bg} flex items-center justify-center`}>
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-200 pr-2">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* AI Insights Panel */}
        <motion.div variants={itemVariants} className="relative rounded-3xl p-[1px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 animate-[rotateGlow_4s_linear_infinite] opacity-50" />
          <div className="relative bg-[#07070f]/95 backdrop-blur-2xl rounded-[23px] overflow-hidden">
            <button 
              onClick={() => setIsAiExpanded(!isAiExpanded)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">AI Analysis</h3>
                  <p className="text-xs text-gray-400">Platform intelligence</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isAiExpanded ? "rotate-180" : ""}`} />
            </button>
            
            <AnimatePresence>
              {isAiExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="px-5 pb-5"
                >
                  <div className="pt-4 border-t border-white/10">
                    {aiLoading ? (
                      <div className="flex flex-col items-center justify-center py-6 space-y-3">
                        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                        <span className="text-xs text-gray-400">Analyzing data...</span>
                      </div>
                    ) : aiInsights ? (
                      <div className="space-y-3">
                        {aiInsights.split('\n').map((line, i) => {
                          const cleanLine = line.replace(/^[-*]\s*/, '').trim();
                          if (!cleanLine) return null;
                          return (
                            <div key={i} className="flex items-start gap-2.5">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-500 shrink-0" />
                              <p className="text-sm text-gray-300 leading-relaxed">{cleanLine}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">AI Service unavailable.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Zone Management Section */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Zone Management</h2>
            <Link href="/admin/zones" className="text-xs text-violet-400 hover:text-cyan-300">View All</Link>
          </div>
          <ZoneList />
        </motion.div>

      </motion.div>
    </div>
  );
}

function ZoneList() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/zones")
      .then(res => res.json())
      .then(data => {
        if (data.success) setZones(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-4 text-xs text-gray-500">Loading zones...</div>;
  if (!zones.length) return <div className="text-center py-4 text-xs text-gray-500">No zones found.</div>;

  return (
    <div className="space-y-3">
      {zones.map((zone: any) => (
        <div key={zone.id} className="p-4 rounded-2xl glass-panel bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-white">{zone.name}</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${zone.demand === 'HIGH' ? 'bg-red-500/20 text-red-400' : zone.demand === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
              {zone.demand} DEMAND
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Workers: <strong className="text-white">{zone.workerCount}</strong></span>
            <span>Active Bookings: <strong className="text-white">{zone.activeBookings}</strong></span>
          </div>
        </div>
      ))}
    </div>
  );
}
