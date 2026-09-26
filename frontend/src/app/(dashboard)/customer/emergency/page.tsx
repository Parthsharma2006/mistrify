"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, MapPin, Search } from "lucide-react";

export default function EmergencyBookingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSub, setSelectedSub] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGPS = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAddress("GPS Location Captured ✅");
        setLocating(false);
      },
      () => {
        alert("GPS failed. Please enter address manually.");
        setLocating(false);
      }
    );
  };

  const handleSearch = () => {
    if (!selectedSub || !address) return alert("Please fill all fields.");
    
    // Save to session storage and redirect to match page (reusing standard flow but flagged)
    const bookingData = {
      categoryId: selectedCat,
      subcategoryId: selectedSub,
      address,
      customerLat: lat,
      customerLng: lng,
      scheduledDate: new Date().toISOString(), // Immediate
      isEmergency: true
    };
    
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
    router.push(`/customer/category/${selectedCat}/match`);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-4 animate-pulse">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Emergency Service</h1>
        <p className="text-red-400 font-medium">Fast-tracked priority matching with an emergency surcharge.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl glass-panel border border-red-500/30 bg-red-500/5">
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-white mb-2 block">What do you need immediately?</label>
            <select 
              value={selectedSub}
              onChange={(e) => {
                const opt = e.target.selectedOptions[0];
                setSelectedSub(e.target.value);
                setSelectedCat(opt.dataset.cat || "");
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-500"
            >
              <option value="" className="text-black">Select an emergency service...</option>
              {categories.map(c => (
                <optgroup label={c.name} key={c.id} className="text-black">
                  {c.subcategories?.map((s: any) => (
                    <option key={s.id} value={s.id} data-cat={c.id}>{s.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-white mb-2 block">Your Current Location</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter address..." 
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-500"
              />
              <button 
                onClick={handleGPS}
                disabled={locating}
                className="px-4 py-3 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition-colors flex items-center justify-center border border-red-500/30"
              >
                {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            onClick={handleSearch}
            className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-lg shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Search className="w-5 h-5" /> Find Help Now
          </button>
        </div>

      </motion.div>
    </div>
  );
}
