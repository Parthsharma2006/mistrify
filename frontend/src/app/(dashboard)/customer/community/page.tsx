"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Users, MapPin, Calendar as CalendarIcon, Clock, 
  FileText, Plus, Minus, ArrowRight, CheckCircle, ArrowLeft, Navigation
} from "lucide-react";
import Link from "next/link";
import { Geolocation } from '@capacitor/geolocation';

interface Category {
  id: string;
  name: string;
}

interface SelectedItem {
  categoryId: string;
  count: number;
}

export default function CommunityServicesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(console.error);
  }, []);

  const updateCount = (categoryId: string, delta: number) => {
    setSelectedItems((prev) => {
      const existing = prev.find(item => item.categoryId === categoryId);
      if (!existing) {
        if (delta > 0) return [...prev, { categoryId, count: 1 }];
        return prev;
      }
      const newCount = existing.count + delta;
      if (newCount <= 0) return prev.filter(item => item.categoryId !== categoryId);
      return prev.map(item => item.categoryId === categoryId ? { ...item, count: newCount } : item);
    });
  };

  const getCount = (categoryId: string) => {
    return selectedItems.find(item => item.categoryId === categoryId)?.count || 0;
  };

  const handleGetLocation = async () => {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress(`₹{latitude}, ${longitude}`);
        }
      } catch (e) {
        setAddress(`₹{latitude}, ${longitude}`);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Could not get location. Please ensure location services are enabled.");
    }
  };

  const handleSubmit = async () => {
    if (!address || !date || !time || selectedItems.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const scheduledDate = new Date(`₹{date}T${time}`).toISOString();
      const res = await fetch("/api/customers/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          scheduledDate,
          description,
          items: selectedItems
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setStep(3); // Success step
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen px-5 pt-safe pb-24 overflow-x-hidden">
      <div className="w-full max-w-md mx-auto pt-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/customer" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-[20px] font-bold text-white tracking-tight">Community Services</h1>
        </div>

        {step === 1 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <div className="glass-panel rounded-[20px] p-6 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 blur-[50px] rounded-full" />
              <Users className="w-8 h-8 text-fuchsia-400 mb-3" />
              <h2 className="text-[18px] font-bold text-white mb-2">Build Your Team</h2>
              <p className="text-sm text-gray-300">Select the type and number of professionals you need for your group requirement.</p>
            </div>

            <div className="space-y-3 mb-8">
              {categories.map((cat) => {
                const count = getCount(cat.id);
                const isSelected = count > 0;
                return (
                  <div key={cat.id} className={`glass-panel rounded-2xl p-4 flex items-center justify-between transition-all duration-300 ${isSelected ? 'border-fuchsia-500/50 bg-white/10' : 'border-white/10'}`}>
                    <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateCount(cat.id, -1)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${count > 0 ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/30'}`}
                        disabled={count === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-4 text-center font-bold text-white">{count}</span>
                      <button 
                        onClick={() => updateCount(cat.id, 1)}
                        className="w-8 h-8 rounded-full bg-fuchsia-500/20 text-fuchsia-300 flex items-center justify-center hover:bg-fuchsia-500/30 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={selectedItems.length === 0}
              className="w-full h-[56px] rounded-2xl shimmer-btn text-white font-bold text-[16px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <div className="space-y-4 mb-8">
              {/* Location */}
              <div className="glass-panel rounded-2xl p-4">
                <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-violet-400" /> Location
                  </div>
                  <button 
                    onClick={handleGetLocation} 
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
                  >
                    <Navigation className="w-3 h-3" /> Get Current Location
                  </button>
                </label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel rounded-2xl p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <CalendarIcon className="w-4 h-4 text-fuchsia-400" /> Date
                  </label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-fuchsia-500/50 [color-scheme:dark]"
                  />
                </div>
                <div className="glass-panel rounded-2xl p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Clock className="w-4 h-4 text-fuchsia-400" /> Time
                  </label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-fuchsia-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="glass-panel rounded-2xl p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4 text-fuchsia-400" /> Description
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your requirement (optional)"
                  rows={3}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="w-14 h-[56px] rounded-2xl glass-panel flex items-center justify-center shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!address || !date || !time || isSubmitting}
                className="flex-1 h-[56px] rounded-2xl shimmer-btn text-white font-bold text-[16px] flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="text-center pt-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-[24px] font-bold text-white mb-3 tracking-tight">Request Submitted!</h2>
            <p className="text-gray-300 mb-8 max-w-[280px] mx-auto">
              We are assembling your team. We will notify you once professionals are assigned to your requirement.
            </p>
            <Link href="/customer" className="w-full h-[56px] rounded-2xl glass-panel text-white font-bold text-[16px] flex items-center justify-center hover:bg-white/10 transition-colors">
              Back to Home
            </Link>
          </motion.div>
        )}

      </div>
    </div>
  );
}

