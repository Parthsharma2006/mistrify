"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, MapPin, Calendar, Clock, Crosshair } from "lucide-react";
import Link from "next/link";
import { Geolocation } from '@capacitor/geolocation';

export default function BookingStep1Page() {
  const { id } = useParams();
  const router = useRouter();
  
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [subcategoryId, setSubcategoryId] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        const cat = data.data?.find((c: any) => c.id === id);
        if (cat) setCategory(cat);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleGetLocation = async () => {
    setLocating(true);
    try {
      // Use capacitor native geolocation if available (bypasses HTTPS web view requirement)
      const position = await Geolocation.getCurrentPosition();
      setLat(position.coords.latitude);
      setLng(position.coords.longitude);
      setAddress(`GPS Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
    } catch (error) {
      console.error(error);
      alert("Failed to get location. Please ensure location permissions are granted.");
    } finally {
      setLocating(false);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const hasSubcategories = category?.subcategories && category.subcategories.length > 0;
    if ((hasSubcategories && !subcategoryId) || !address || !date || !time) {
      alert("Please fill all required fields.");
      return;
    }
    
    // Store in session storage for the next step
    const bookingData = {
      categoryId: id,
      subcategoryId: hasSubcategories ? subcategoryId : null,
      address,
      customerLat: lat,
      customerLng: lng,
      scheduledDate: new Date(`${date}T${time}`).toISOString(),
      categoryName: category?.name,
      subcategoryName: category?.subcategories?.find((s:any) => s.id === subcategoryId)?.name
    };
    
    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
    router.push(`/customer/category/${id}/match`);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/customer" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Book a {category?.name}</h1>
        <p className="text-gray-400">Fill in the details below to find the best verified professionals near you.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl glass-panel">
        <form onSubmit={handleNext} className="space-y-6">
          
          {category?.subcategories && category.subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Specific Service Needed</label>
              <select 
                value={subcategoryId}
                onChange={e => setSubcategoryId(e.target.value)}
                className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                required
              >
                <option value="">Select a specific service...</option>
                {category?.subcategories?.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <label className="block text-sm font-bold text-gray-300 mb-2">Service Location (Address)</label>
            <div className="flex flex-col gap-3">
              <input 
                type="text"
                placeholder="Enter exact address or landmark..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                required
              />
              <button 
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="w-full py-3.5 rounded-xl bg-violet-500/10 text-violet-400 font-bold border border-violet-500/30 hover:bg-violet-500/20 transition-colors flex items-center justify-center"
              >
                {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Crosshair className="w-5 h-5 mr-2" /> Auto-Detect via GPS</>}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 whitespace-nowrap"><Calendar className="inline w-4 h-4 mr-1" /> Preferred Date</label>
              <input 
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 whitespace-nowrap"><Clock className="inline w-4 h-4 mr-1" /> Preferred Time</label>
              <input 
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-8">
            <button type="submit" className="w-full py-4 rounded-xl bg-violet-500 hover:bg-violet-400 text-black font-bold text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all">
              Find Nearby Workers
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}