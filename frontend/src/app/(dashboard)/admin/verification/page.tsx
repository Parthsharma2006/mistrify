"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, ShieldAlert, ChevronRight, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function AdminVerificationList() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/verification")
      .then(res => res.json())
      .then(data => {
        if (data.success) setWorkers(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
          <ShieldAlert className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pending Verifications</h1>
          <p className="text-sm text-gray-400">Review worker profiles, certificates, and test results.</p>
        </div>
      </div>

      {workers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-white/5">
          <CheckCircle className="w-16 h-16 text-green-400/50 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">All caught up!</h2>
          <p className="text-gray-400">There are no pending verifications at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {workers.map((worker: any) => {
            const hasCert = !!worker.certificate;
            const hasTest = worker.testAttempts?.length > 0;
            const testPassed = hasTest && worker.testAttempts[0].passed;

            return (
              <motion.div key={worker.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl glass-panel group hover:bg-white/5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
                      {worker.user?.name?.charAt(0) || "W"}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{worker.user?.name}</h3>
                      <p className="text-sm text-violet-400">{worker.category?.name || "Uncategorized"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs text-gray-500 uppercase font-semibold">Evidence Provided</span>
                      {hasCert ? (
                        <span className="flex items-center gap-1.5 text-sm text-indigo-300 mt-1"><FileText className="w-4 h-4" /> Certificate</span>
                      ) : hasTest ? (
                        <span className={`flex items-center gap-1.5 text-sm mt-1 ${testPassed ? "text-green-300" : "text-red-300"}`}>
                          <CheckCircle className="w-4 h-4" /> Skill Test ({worker.testAttempts[0].score})
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 mt-1">None yet</span>
                      )}
                    </div>
                    
                    <Link href={`/admin/verification/${worker.id}`} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-violet-500 group-hover:text-black transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}