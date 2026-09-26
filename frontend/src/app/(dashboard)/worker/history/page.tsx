"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function WorkerHistoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-6">Order History</h1>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-purple-500/50" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Order History</h2>
          <p className="text-gray-400 max-w-sm">
            Your completed, cancelled, and past orders will be recorded here for reference.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
