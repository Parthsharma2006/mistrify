"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Star, ShieldCheck, MapPin } from "lucide-react";

export default function MatchWorkersPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    const dataStr = sessionStorage.getItem("bookingData");
    if (!dataStr) {
      router.push(`/customer/category/${id}`);
      return;
    }
    const data = JSON.parse(dataStr);
    setBookingData(data);

    fetch("/api/customers/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        latitude: data.customerLat || 0,
        longitude: data.customerLng || 0,
        isEmergency: !!data.isEmergency
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) setWorkers(res.data);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const selectWorker = (worker: any) => {
    const basePrice = 500;
    const emergencySurcharge = bookingData.isEmergency ? 150 : 0;
    const workloadAdjustment = worker.workloadAdjustment || 0;
    const price = basePrice + emergencySurcharge + workloadAdjustment;
    
    sessionStorage.setItem("bookingData", JSON.stringify({
      ...bookingData,
      workerId: worker.id,
      workerName: worker.user?.name,
      workerDistance: worker.distance,
      basePrice,
      workloadAdjustment,
      emergencySurcharge,
      price
    }));
    router.push("/customer/book/confirm");
  };

  if (loading || !bookingData) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Edit Details
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Available {bookingData.categoryName}s</h1>
        <p className="text-gray-400">Found {workers.length} verified professionals for {bookingData.subcategoryName} near your location.</p>
      </div>

      {workers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-white/5">
          <p className="text-gray-400">No verified workers available right now. Please try a different time or area.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker, i) => (
            <motion.div key={worker.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => selectWorker(worker)}
              className="block p-6 rounded-3xl glass-panel border border-white/10 hover:border-violet-500/50 hover:bg-white/5 transition-all cursor-pointer group h-full relative"
            >
              <div className={`absolute top-4 right-4 font-bold text-lg ${bookingData.isEmergency ? 'text-red-400' : 'text-violet-400'}`}>
                ₹{500 + (worker.workloadAdjustment || 0) + (bookingData.isEmergency ? 150 : 0)} 
                <span className="text-xs text-gray-500 font-normal">/hr</span>
              </div>

              <div className="flex items-start mb-4 mt-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold mr-4">
                  {worker.user?.name?.charAt(0) || "W"}
                </div>
                <div className="flex flex-col">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 font-bold border border-green-500/20 w-fit mb-1">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                  <span className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                    <Star className="w-4 h-4 fill-current" /> 4.9 <span className="text-gray-500 text-xs font-normal">(12)</span>
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{worker.user?.name}</h3>
              <p className="text-sm text-violet-400 mb-4">{worker.yearsOfExperience} Years Experience</p>

              <div className="space-y-2 mb-6">
                <div className="flex flex-wrap gap-1.5">
                  {worker.skills?.slice(0, 3).map((s: any) => (
                    <span key={s.id} className="px-2 py-1 rounded bg-white/5 text-[10px] uppercase tracking-wider text-gray-300">
                      {s.subcategory.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Why recommended?</p>
                  {worker.matchReasons?.map((reason: string, idx: number) => (
                    <p key={idx} className="text-xs text-green-400 flex items-center">{reason}</p>
                  ))}
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-300 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-violet-500" /> 
                    {worker.distance !== null ? `${worker.distance.toFixed(1)} km away` : "Unknown distance"}
                  </span>
                  <span className="text-sm font-bold text-violet-400 group-hover:text-violet-300 transition-colors">Select &rarr;</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}