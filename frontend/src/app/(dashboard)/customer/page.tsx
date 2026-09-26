"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search, Mic, Zap, Droplets, Hammer, Paintbrush, Home,
  Heart, Car, Flower2, Sparkles, Wrench,
  Calendar, AlertTriangle, Clock, BookOpen
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Droplets, Hammer, Paintbrush, Home, Heart, Car, Flower2, Sparkles, Wrench,
};

const colorMap: Record<string, string> = {
  "Electrician": "from-yellow-400 to-orange-500",
  "Plumber": "from-blue-400 to-violet-500",
  "Carpenter": "from-amber-500 to-yellow-600",
  "Painter": "from-purple-400 to-pink-500",
  "Domestic Helper": "from-green-400 to-green-500",
  "Caregiver": "from-red-400 to-rose-500",
  "Driver": "from-slate-400 to-gray-600",
  "Gardener": "from-lime-400 to-green-500",
  "Cleaner": "from-violet-400 to-amber-500",
  "Technician": "from-fuchsia-400 to-blue-600",
};

interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  _count?: { workers: number };
}

export default function CustomerDashboard() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const firstName = user?.name ? (user.name as string).split(' ')[0] : 'Guest';

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window as any) && !('SpeechRecognition' in window as any)) {
      alert('Voice search is not supported in your browser.');
      return;
    }
    setIsListening(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      console.error(event);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(console.error);
  }, []);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const quickActions = [
    { id: 'book', icon: Calendar, label: "Book Now", color: "from-amber-400 to-amber-500", href: "#services-grid", pulse: false },
    { id: 'complaints', icon: AlertTriangle, label: "Complaints", color: "from-orange-400 to-orange-500", href: "/customer/complaints", pulse: false },
    { id: 'bookings', icon: Clock, label: "My Bookings", color: "from-purple-400 to-fuchsia-500", href: "/customer/bookings", pulse: false },
    { id: 'history', icon: BookOpen, label: "History", color: "from-fuchsia-400 to-rose-500", href: "/customer/bookings", pulse: false },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen px-5 pt-safe pb-24 overflow-x-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-md mx-auto pt-8"
      >
        {/* Top Section */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1 mb-6">
          <h1 className="text-[24px] font-bold text-white tracking-tight">
            Hey, <span className="text-gradient">{firstName}</span>! 👋
          </h1>
          <p className="text-[14px] text-gray-200">
            What service do you need today?
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="mb-8 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-violet-400/40" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search electrician, plumber..."
            className="w-full h-[52px] pl-12 pr-12 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.07] text-white placeholder-white/25 focus:outline-none focus:border-violet-400/30 focus:ring-1 focus:ring-violet-400/15 focus:shadow-[0_0_20px_rgba(139,92,246,0.08)] text-[15px] transition-all"
          />
          <button onClick={startListening} className={`absolute inset-y-0 right-2 flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isListening ? 'bg-red-500/10 text-red-500' : 'text-violet-400/40 hover:bg-white/5'}`}>
              {isListening ? (
                <span className="flex gap-[2px]">
                  <motion.span animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-red-500 rounded-full" />
                  <motion.span animate={{ height: [12, 20, 12] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }} className="w-1 bg-red-500 rounded-full" />
                  <motion.span animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-red-500 rounded-full" />
                </span>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
        </motion.div>

        {/* Quick Actions Row */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-5 px-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {quickActions.map((action) => {
              const content = (
                <div className="w-[72px] flex flex-col items-center gap-2 group">
                  <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-shadow duration-300 ${action.pulse ? 'animate-pulse' : ''}`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-gray-200 text-center leading-tight whitespace-pre-wrap px-1 group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                </div>
              );

              if (action.href.startsWith('#')) {
                return (
                  <button 
                    key={action.id} 
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector(action.href)?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="flex-shrink-0 text-left outline-none"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link key={action.id} href={action.href} className="flex-shrink-0">
                  {content}
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Featured Actions */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 mb-8">
          <Link href="/customer/community">
            <div className="glass-panel rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-[15px] mb-1">Community Services</h3>
                <p className="text-gray-300 text-[12px] leading-tight">Book multiple workers for a group requirement or event.</p>
              </div>
            </div>
          </Link>

          <Link href="/customer/emergency">
            <div className="glass-panel rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group border border-red-500/30">
              <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-red-400 font-bold text-[15px] mb-1">Emergency Service</h3>
                <p className="text-gray-300 text-[12px] leading-tight">Need immediate assistance? Book an emergency worker now.</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Service Categories Grid */}
        <motion.div variants={itemVariants} id="services-grid" className="scroll-mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-white tracking-tight">Services</h2>
            <Link href="/customer/categories" className="text-[13px] text-violet-400 hover:text-violet-300 transition-colors font-medium">View All</Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {filteredCategories.map((category) => {
              const Icon = iconMap[category.icon || ""] || Wrench;
              const gradient = colorMap[category.name] || "from-gray-500 to-gray-600";
              
              return (
                <motion.div key={category.id} variants={itemVariants} className="h-full">
                  <Link href={`/customer/category/${category.id}`}>
                    <div className="relative group glass-panel glass-card-hover rounded-[20px] p-5 flex flex-col items-center text-center overflow-hidden transition-all duration-300">
                      
                      {/* Gradient Border Circle */}
                      <div className={`w-[48px] h-[48px] rounded-full bg-gradient-to-br ${gradient} p-[1px] mb-3 shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-shadow duration-300`}>
                        <div className="w-full h-full bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-white text-[14px] font-bold tracking-wide mb-1.5">{category.name}</h3>
                      {category._count?.workers !== undefined && (
                         <span className="text-[10px] text-gray-200 font-medium px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20">
                           {category._count.workers} Pros
                         </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && searchQuery && (
            <motion.div variants={itemVariants} className="text-center py-12 rounded-[20px] glass-panel mt-2">
              <Search className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-[16px] font-bold text-white mb-1">No services found</h3>
              <p className="text-[13px] text-gray-300 px-4">We couldn&apos;t find any matches for &ldquo;<span className="text-white">{searchQuery}</span>&rdquo;</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
