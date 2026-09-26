'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Clock, XCircle, ClipboardList, Wallet, 
  History, Star, IndianRupee, Briefcase, ChevronRight, MapPin, CheckCircle, X, Truck, Wrench
, Loader2 } from "lucide-react";

type WorkerProfile = {
  id: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  availabilityStatus: 'ONLINE' | 'OFFLINE' | 'BUSY';
  rating: number | null;
  totalEarnings: number;
  completedJobs: number;
  category: { name: string };
  cooperative: { name: string } | null;
};

type Order = {
  id: string;
  customerName: string;
  customerMobile?: string;
  serviceType: string;
  status: string;
  amount: number;
  date: string;
  address?: string;
  paymentStatus?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function WorkerDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [tasks, setTasks] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, tasksRes] = await Promise.all([
        fetch('/api/workers/profile').catch(() => null),
        fetch('/api/workers/tasks').catch(() => null)
      ]);

      if (profileRes?.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setProfile(profileData.data);
          setIsOnline(profileData.data.availabilityStatus === 'ONLINE');
        }
      }

      if (tasksRes?.ok) {
        const tasksData = await tasksRes.json();
        if (tasksData.success) {
          setTasks(tasksData.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchData();
      const interval = setInterval(fetchData, 5000); // Live sync for payments
      
      const handleVis = () => { if (document.visibilityState === 'visible') fetchData(); };
      document.addEventListener('visibilitychange', handleVis);
      return () => { clearInterval(interval); document.removeEventListener('visibilitychange', handleVis); };
    } else if (sessionStatus === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [sessionStatus]);

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] bg-[#07070f]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const firstName = session?.user?.name?.split(' ')[0] || 'Worker';
  const activeTask = tasks.find(t => !['COMPLETED', 'CANCELLED'].includes(t.status));

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await fetch('/api/workers/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, status: newStatus })
    });
    fetchData(); // resync
  };

  return (
    <div className="min-h-screen bg-[#07070f] px-5 pt-safe pb-24 overflow-x-hidden">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-md mx-auto space-y-8 mt-6">
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{firstName}</span> 👋
            </h1>
            <p className="text-sm text-gray-400 mt-1">{profile?.category?.name || 'Service Professional'}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-700'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-xs font-bold ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </motion.div>

        {/* ACTIVE TASK CONTROL PANEL */}
        {activeTask && (
          <motion.div variants={itemVariants} className="relative rounded-3xl p-[1px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 animate-[rotateGlow_4s_linear_infinite] opacity-50" />
            <div className="relative bg-[#07070f]/95 backdrop-blur-2xl p-5 rounded-[23px]">
              <div className="flex justify-between items-center mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {activeTask.status}
                </span>
                <span className="text-xl font-black text-white">₹{activeTask.amount}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{activeTask.customerName}</h3>
              <div className="flex items-start gap-2 mt-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{activeTask.address || 'Address not provided'}</span>
              </div>
              
              <div className="mt-6 space-y-3">
                {activeTask.status === 'PENDING' || activeTask.status === 'ASSIGNED' ? (
                  <button onClick={() => updateTaskStatus(activeTask.id, 'TRAVELLING')} className="w-full bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2">
                    <Truck className="w-5 h-5" /> Accept & Start Journey
                  </button>
                ) : activeTask.status === 'TRAVELLING' ? (
                  <button onClick={() => updateTaskStatus(activeTask.id, 'ARRIVED')} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5" /> Mark Arrived
                  </button>
                ) : activeTask.status === 'ARRIVED' ? (
                  <button onClick={() => updateTaskStatus(activeTask.id, 'WORKING')} className="w-full bg-amber-600 hover:bg-amber-500 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2">
                    <Wrench className="w-5 h-5" /> Start Work
                  </button>
                ) : activeTask.status === 'WORKING' ? (
                  <button onClick={() => updateTaskStatus(activeTask.id, 'COMPLETED')} className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Work Finished (Request Payment)
                  </button>
                ) : activeTask.status === 'COMPLETED' && activeTask.paymentStatus === 'PENDING' ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-amber-400 font-bold">Waiting for Customer to Pay...</p>
                    <p className="text-xs text-gray-400 mt-1">Do not leave until payment is confirmed</p>
                  </div>
                ) : activeTask.paymentStatus === 'SUCCESS' ? (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-green-400 font-bold">Payment Received! Job Complete.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 glass-panel">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-violet-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">{profile?.completedJobs || 0}</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Total Jobs</p>
          </div>
          <Link href="/worker/earnings" className="bg-white/5 border border-white/10 rounded-2xl p-4 glass-panel hover:bg-white/10 transition-colors block">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-fuchsia-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">₹{profile?.totalEarnings || 0}</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Total Earnings (Click for Details)</p>
          </Link>
        </motion.div>

        {/* Recent Jobs */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-violet-400" />
            Recent Jobs
          </h2>
          <div className="space-y-3">
            {tasks.filter(t => ['COMPLETED', 'CANCELLED'].includes(t.status)).length === 0 ? (
              <p className="text-sm text-gray-500">No recent jobs found.</p>
            ) : (
              tasks.filter(t => ['COMPLETED', 'CANCELLED'].includes(t.status)).slice(0, 5).map(task => (
                <div key={task.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 glass-panel flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-white">{task.customerName}</h4>
                    <p className="text-xs text-gray-400">{task.serviceType}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{new Date(task.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-white block">₹{task.amount}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 inline-block ${
                      task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
