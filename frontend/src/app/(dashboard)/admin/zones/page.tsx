"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, MapPin, Users, Activity, AlertTriangle, ArrowRightLeft } from "lucide-react";

export default function AdminZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/zones")
      .then(res => res.json())
      .then(data => {
        if (data.success) setZones(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Service Zones</h1>
        <p className="text-gray-400">Track demand, worker availability, and cross-zone support.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {zones.map((zone, i) => (
          <motion.div key={zone.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-3xl glass-panel border ${zone.demand === 'HIGH' ? 'border-red-500/30' : 'border-white/10'}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-violet-500" /> {zone.name}
                </h2>
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-sm text-gray-400 flex items-center gap-1"><Users className="w-4 h-4" /> {zone.workerCount} Workers</span>
                  <span className="text-sm text-gray-400 flex items-center gap-1"><Activity className="w-4 h-4" /> {zone.activeBookings} Active Jobs</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                zone.demand === 'HIGH' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                zone.demand === 'MEDIUM' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                'text-green-400 border-green-500/30 bg-green-500/10'
              }`}>
                {zone.demand} DEMAND
              </div>
            </div>

            {zone.demand === 'HIGH' && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">Worker Shortage Detected</p>
                  <p className="text-red-300 mt-1">This zone has significantly more active jobs than available workers.</p>
                  <button className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-red-600 transition-colors">
                    <ArrowRightLeft className="w-4 h-4" /> Request Cross-Zone Support
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-white/10 pt-4 mt-auto">
              <h3 className="text-sm font-bold text-gray-300 mb-3">Workload Distribution</h3>
              <div className="space-y-2">
                {zone.workers.slice(0, 5).map((w: any) => (
                  <div key={w.id} className="flex justify-between items-center text-sm">
                    <span className="text-white">{w.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{w.recentJobs} jobs</span>
                      <span className={`w-16 text-center text-xs font-bold ${
                        w.workload === 'HIGH' ? 'text-red-400' :
                        w.workload === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                      }`}>{w.workload}</span>
                    </div>
                  </div>
                ))}
                {zone.workers.length > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-2">+ {zone.workers.length - 5} more workers</p>
                )}
                {zone.workers.length === 0 && (
                  <p className="text-xs text-gray-500">No workers assigned to this zone.</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
