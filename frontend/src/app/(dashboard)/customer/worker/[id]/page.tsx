"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Star, ShieldCheck, MapPin, Building2, CheckCircle, Video } from "lucide-react";
import Link from "next/link";

export default function CustomerWorkerProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/workers/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setWorker(data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;
  
  if (!worker) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Worker Not Found</h2>
      <p className="text-gray-400 mb-8">This worker profile is either invalid or not verified yet.</p>
      <button onClick={() => router.back()} className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">Go Back</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Info */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl glass-panel relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-[50px] -z-10" />
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-xl shadow-violet-500/20 mb-4 border border-white/20">
              {worker.user?.name?.charAt(0) || "W"}
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">{worker.user?.name}</h1>
            <p className="text-violet-400 font-medium text-lg mb-4">{worker.category?.name}</p>
            
            <div className="flex justify-center gap-3 mb-6">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                <ShieldCheck className="w-4 h-4" /> VERIFIED
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-yellow-400 text-xs font-bold border border-white/10">
                <Star className="w-4 h-4 fill-current" /> 4.9 (12 reviews)
              </span>
            </div>

            <button disabled className="w-full py-4 rounded-xl bg-violet-500/50 text-black font-bold shadow-[0_0_20px_rgba(34,211,238,0.2)] cursor-not-allowed opacity-80">
              Book Service (Coming Soon)
            </button>
            <p className="text-xs text-gray-500 mt-3">Booking and payment will be available in Phase 3.</p>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20"><MapPin className="w-4 h-4 text-fuchsia-400" /></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Location</p><p className="text-sm font-medium text-white">Local Area Zone</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20"><Building2 className="w-4 h-4 text-purple-400" /></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cooperative</p><p className="text-sm font-medium text-white">{worker.cooperative?.name || "Independent"}</p></div>
            </div>
            {worker.certificate && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20"><CheckCircle className="w-4 h-4 text-green-400" /></div>
                <div><p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Certification</p><p className="text-sm font-medium text-white">{worker.certificate.name}</p></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl glass-panel relative">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-400" /> About</h2>
            <p className="text-gray-300 leading-relaxed mb-8">{worker.bio || `Hi, I am ${worker.user?.name}, a professional ${worker.category?.name} with ${worker.yearsOfExperience} years of experience. I take pride in my work and ensure 100% customer satisfaction.`}</p>
            
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-t border-white/10 pt-6">Specialized Skills</h3>
            <div className="flex flex-wrap gap-2">
              {worker.skills?.map((s: any) => (
                <span key={s.id} className="px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium">
                  {s.subcategory.name}
                </span>
              ))}
              {!worker.skills?.length && <p className="text-sm text-gray-500">General service provider.</p>}
            </div>
          </div>

          <div className="p-8 rounded-3xl glass-panel relative">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-pink-400" /> Work Portfolio</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {worker.portfolio?.map((item: any) => (
                <motion.div whileHover={{ y: -5 }} key={item.id} className="rounded-2xl overflow-hidden bg-black/40 border border-white/10 group">
                  <div className="aspect-video w-full bg-gray-900 relative">
                    {item.fileType === "IMAGE" ? (
                      <img src={item.fileUrl} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800"><Video className="w-8 h-8 text-gray-500" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  <div className="p-4 relative -mt-6">
                    <h4 className="text-sm font-bold text-white drop-shadow-lg">{item.title}</h4>
                    {item.description && <p className="text-xs text-gray-400 mt-1">{item.description}</p>}
                  </div>
                </motion.div>
              ))}
              {!worker.portfolio?.length && (
                <div className="sm:col-span-2 p-8 text-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-gray-500 text-sm">No portfolio items provided yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}