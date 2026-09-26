"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap, Droplets, Hammer, Paintbrush, Home, Heart,
  Car, Flower2, Sparkles, Wrench, Shield, Users,
  Clock, Star, ArrowRight, CheckCircle2, Crown
} from "lucide-react";

const categories = [
  { name: "Electrician", icon: Zap, color: "from-yellow-400 to-orange-500" },
  { name: "Plumber", icon: Droplets, color: "from-blue-400 to-fuchsia-500" },
  { name: "Carpenter", icon: Hammer, color: "from-amber-500 to-yellow-600" },
  { name: "Painter", icon: Paintbrush, color: "from-purple-400 to-pink-500" },
  { name: "Domestic Helper", icon: Home, color: "from-green-400 to-emerald-500" },
  { name: "Caregiver", icon: Heart, color: "from-red-400 to-rose-500" },
  { name: "Driver", icon: Car, color: "from-slate-400 to-gray-600" },
  { name: "Gardener", icon: Flower2, color: "from-lime-400 to-green-500" },
  { name: "Cleaner", icon: Sparkles, color: "from-fuchsia-400 to-violet-500" },
  { name: "Technician", icon: Wrench, color: "from-amber-400 to-blue-600" },
];

const features = [
  { icon: Shield, title: "Verified Workers", desc: "All workers are verified through cooperative societies" },
  { icon: Users, title: "Cooperative-Owned", desc: "Fair wages, community-driven, transparent pricing" },
  { icon: Clock, title: "Quick Service", desc: "Get matched with skilled workers in minutes" },
  { icon: Star, title: "Quality Assured", desc: "Rated and reviewed by your community" },
];

export default function LandingPage() {
  return (
    <div className="h-[100dvh] overflow-y-auto overflow-x-hidden bg-gradient-to-br from-[#07070f] via-[#0f0a1e] to-[#130d24] w-full custom-scrollbar">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-violet-500/10 bg-[#07070f]/80 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <img src="/logo-icon.jpg" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-[0_0_20px_rgba(139,92,246,0.4)] object-cover" alt="Mistrify Logo" />
              <span className="text-lg sm:text-xl font-black text-white">Mistr<span className="text-amber-400">ify</span></span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 sm:gap-3"
            >
              <Link
                href="/login"
                className="px-2 sm:px-4 py-2 text-[13px] sm:text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register/customer"
                className="px-4 py-2 sm:px-5 sm:py-2.5 text-[13px] sm:text-sm font-semibold text-white rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 whitespace-nowrap"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-[calc(8rem+env(safe-area-inset-top))] pb-20 px-4 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-60 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
              <CheckCircle2 className="w-4 h-4" />
              Cooperative-Powered Platform
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
              Community Services,
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
                Cooperative Powered
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Connect with verified skilled workers from cooperative societies.
              Fair wages, quality service, community trust.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/register/customer"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 transition-all shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02]"
            >
              Book a Service
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/register/worker"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all hover:scale-[1.02]"
            >
              Join as Worker
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[{ num: "10+", label: "Service Types" }, { num: "100%", label: "Cooperative" }, { num: "24/7", label: "Support" }].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.num}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Our Services</h2>
            <p className="mt-4 text-gray-400 max-w-lg mx-auto">
              From electricians to caregivers — find trusted professionals for every need
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer text-center"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${cat.color} mb-3`}>
                  <cat.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4">
                  <feat.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-violet-100 mb-8 max-w-lg mx-auto">
                Join the cooperative revolution. Better services, fair wages, stronger communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register/customer"
                  className="px-8 py-3.5 text-base font-semibold rounded-2xl bg-white text-violet-700 hover:bg-gray-100 transition-all shadow-xl"
                >
                  I Need a Service
                </Link>
                <Link
                  href="/register/worker"
                  className="px-8 py-3.5 text-base font-semibold rounded-2xl border-2 border-white text-white hover:bg-white/10 transition-all"
                >
                  I Am a Worker
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.jpg" className="w-7 h-7 rounded-md object-cover" alt="Mistrify Logo" />
            <span className="font-semibold text-white">Mistrify</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2024 Mistrify. Services Redefined.
          </p>
        </div>
      </footer>
    </div>
  );
}
