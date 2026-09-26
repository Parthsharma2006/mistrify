"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Send, AlertTriangle, MessageSquare, 
  CheckCircle, Loader2 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomerComplaintsPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;
    
    setIsSubmitting(true);
    
    // Simulate API call for now (can be hooked up to admin panel later)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen px-5 pt-safe pb-24 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 border border-green-500/30"
        >
          <CheckCircle className="w-10 h-10" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Complaint Submitted</h2>
        <p className="text-gray-400 mb-8 max-w-sm">
          Your complaint has been forwarded directly to the admin panel. We will look into it immediately.
        </p>
        <button 
          onClick={() => router.push("/customer")}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors border border-white/10"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pt-safe pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 mt-2">
        <Link href="/customer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Submit Complaint</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="glass-panel p-5 rounded-3xl border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)] mb-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Direct to Admin</h3>
              <p className="text-sm text-gray-400">
                Your complaint goes directly to the administrative team for immediate review and action.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <input 
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="E.g. Issue with recent service"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={5}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !subject || !description}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Complaint
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
