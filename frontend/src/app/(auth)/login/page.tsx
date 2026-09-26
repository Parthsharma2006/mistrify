"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Lock, Eye, EyeOff, AlertCircle, Loader2, Shield, Zap, Users, Crown } from "lucide-react";

const roles = [
  { value: "CUSTOMER", label: "Customer", icon: Users, desc: "Book services" },
  { value: "WORKER", label: "Worker", icon: Zap, desc: "Provide skills" },
  { value: "ADMIN", label: "Admin", icon: Shield, desc: "Manage all" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { y: 25, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ mobile: "", password: "", role: "CUSTOMER" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        mobile: formData.mobile,
        password: formData.password,
        role: formData.role,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please verify your details.");
      } else {
        const redirectMap: Record<string, string> = {
          CUSTOMER: "/customer",
          WORKER: "/worker",
          ADMIN: "/admin",
        };
        router.push(redirectMap[formData.role] || "/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative overflow-y-auto overflow-x-hidden flex flex-col justify-center px-6 py-12">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[0%] left-[-5%] w-[55vw] h-[55vw] rounded-full bg-violet-600/25 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -35, 0], y: [0, 35, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[-5%] w-[60vw] h-[60vw] rounded-full bg-pink-500/15 blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-amber-400/10 blur-[90px]"
        />
      </div>

      <motion.div
        className="w-full max-w-sm mx-auto relative z-10 flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ===== LOGO & BRAND ===== */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
          {/* Icon */}
          <motion.div 
            whileHover={{ rotate: [0, -5, 5, 0] }}
            className="relative mb-5"
          >
            <img src="/logo-icon.jpg" className="w-[72px] h-[72px] rounded-[22px] object-cover shadow-[0_0_40px_rgba(139,92,246,0.5)] border border-violet-400/30 relative overflow-hidden z-10" alt="Logo" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-[#07070f] pulse-dot" />
          </motion.div>

          {/* Brand Name */}
          <div className="flex items-baseline gap-0">
            <span className="text-[40px] font-black tracking-tight brand-text">
              Mistr
            </span>
            <span className="text-[40px] font-black tracking-tight brand-accent">
              ify
            </span>
          </div>
          
          <p className="text-[13px] text-violet-300/70 font-medium tracking-[0.2em] uppercase mt-2">
            Services Redefined
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm backdrop-blur-md font-medium mb-5"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Role Selection */}
          <motion.div variants={itemVariants} className="w-full">
            <p className="text-[11px] text-violet-300/50 font-semibold tracking-widest uppercase mb-3 ml-1">I am a</p>
            <div className="flex gap-2.5 w-full">
              {roles.map((role) => {
                const Icon = role.icon;
                const isActive = formData.role === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.value })}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? "bg-violet-500/15 border border-violet-400/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                        : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeRole"
                        className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent"
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      />
                    )}
                    <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-violet-300' : 'text-white/25'}`} />
                    <span className={`text-[11px] font-bold tracking-wider relative z-10 ${isActive ? 'text-violet-200' : 'text-white/30'}`}>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Input Fields */}
          <motion.div variants={itemVariants} className="space-y-3 w-full">
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/20 group-focus-within:text-violet-400 transition-colors duration-300" />
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Mobile Number"
                className="w-full pl-12 pr-4 h-[54px] rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white placeholder:text-white/25 focus:outline-none focus:border-violet-400/40 focus:bg-white/[0.06] focus:shadow-[0_0_25px_rgba(139,92,246,0.1)] transition-all font-medium text-[15px]"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/20 group-focus-within:text-violet-400 transition-colors duration-300" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password"
                className="w-full pl-12 pr-14 h-[54px] rounded-2xl bg-white/[0.04] border border-white/[0.07] text-white placeholder:text-white/25 focus:outline-none focus:border-violet-400/40 focus:bg-white/[0.06] focus:shadow-[0_0_25px_rgba(139,92,246,0.1)] transition-all font-medium text-[15px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors h-[44px] w-[44px] flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </motion.div>

          {/* Sign In Button */}
          <motion.div variants={itemVariants} className="w-full pt-3">
            <button
              type="submit"
              disabled={loading}
              className="shimmer-btn w-full h-[54px] rounded-2xl text-[#07070f] font-extrabold text-[16px] tracking-wide shadow-[0_4px_30px_rgba(139,92,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 active:scale-[0.97] transition-transform"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>Sign In</>
              )}
            </button>
          </motion.div>
        </form>

        {/* Bottom Links */}
        <motion.div variants={itemVariants} className="mt-10 w-full text-center space-y-4">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/15 to-transparent" />
          <p className="text-white/30 text-[13px]">New here?</p>
          <div className="flex justify-center gap-8">
            <Link href="/register/customer" className="text-[13px] text-violet-300 font-bold hover:text-violet-200 min-h-[44px] flex items-center transition-colors">
              Join as Customer
            </Link>
            <Link href="/register/worker" className="text-[13px] text-amber-400 font-bold hover:text-amber-300 min-h-[44px] flex items-center transition-colors">
              Join as Worker
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
