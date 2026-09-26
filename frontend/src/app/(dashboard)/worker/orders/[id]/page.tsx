"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, MapPin, Calendar, Clock, Crosshair, Navigation, Camera, Upload, Star, DollarSign, CheckCircle } from "lucide-react";

export default function WorkerOrderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [evidence, setEvidence] = useState<any[]>([]);
  const [finalAmount, setFinalAmount] = useState<string>("");
  const [uploading, setUploading] = useState<string | null>(null);

  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  const [payment, setPayment] = useState<any>(null);
  const [rating, setRating] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchOrder();
      fetchEvidence();
    }
  }, [id]);

  useEffect(() => {
    if (order && (order.status === "COMPLETED" || order.status === "PAID")) {
      fetchPaymentAndRating();
    }
  }, [order?.status]);

  const fetchOrder = () => {
    fetch(`/api/bookings/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder(data.data);
          if (data.data.finalAmount) setFinalAmount(data.data.finalAmount.toString());
        }
      })
      .finally(() => setLoading(false));
  };

  const fetchEvidence = () => {
    fetch(`/api/bookings/${id}/evidence`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setEvidence(data.data);
      });
  };

  const fetchPaymentAndRating = async () => {
    try {
      const pRes = await fetch(`/api/bookings/${id}/payment`);
      const pData = await pRes.json();
      if (pData.success) setPayment(pData.data);

      const rRes = await fetch(`/api/bookings/${id}/rating`);
      const rData = await rRes.json();
      if (rData.success) setRating(rData.data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (status: string) => {
    if (status === "COMPLETED" && !finalAmount) {
      alert("Please enter the final amount before completing the job.");
      return;
    }
    
    setUpdating(true);
    try {
      const payload: any = { status };
      if (status === "COMPLETED") {
        payload.finalAmount = parseFloat(finalAmount);
      }

      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else alert(data.error);
    } catch (err) {
      alert("Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const updateLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await fetch("/api/workers/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        });
        alert("Location updated and sent to customer!");
      }, () => alert("GPS failed"));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "evidence");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const uploadData = await uploadRes.json();

      if (uploadData.success) {
        const evRes = await fetch(`/api/bookings/${id}/evidence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, fileUrl: uploadData.url, description: `${type} uploaded by worker` })
        });
        const evData = await evRes.json();
        if (evData.success) {
          fetchEvidence();
        } else {
          alert("Failed to save evidence record");
        }
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      alert("Error uploading file");
    } finally {
      setUploading(null);
      if (e.target) e.target.value = '';
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>;
  if (!order) return <div className="text-center py-20 text-white">Order not found</div>;

  const d = new Date(order.scheduledDate);
  const flow = ["ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETED"];
  const currentIdx = flow.indexOf(order.status);
  const nextStatus = currentIdx >= 0 && currentIdx < flow.length - 1 ? flow[currentIdx + 1] : null;

  const beforeEvidence = evidence.find(e => e.type === "BEFORE_PHOTO");
  const afterEvidence = evidence.find(e => e.type === "AFTER_PHOTO");

  const isCompletedOrPaid = order.status === "COMPLETED" || order.status === "PAID";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => router.push("/worker/orders")} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl glass-panel">
            <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{order.subcategory?.name}</h1>
                <p className="text-sm text-gray-400">Order ID: #{order.id.slice(0,8).toUpperCase()}</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400 font-bold text-sm tracking-wider uppercase">
                {order.status.replace(/_/g, " ")}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block"><Calendar className="inline w-3 h-3 mr-1" /> Date</label>
                <p className="text-white font-medium">{d.toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block"><Clock className="inline w-3 h-3 mr-1" /> Time</label>
                <p className="text-white font-medium">{d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block"><MapPin className="inline w-3 h-3 mr-1" /> Customer Address</label>
              <p className="text-white font-medium bg-black/30 p-4 rounded-xl border border-white/5">{order.address}</p>
            </div>
          </div>

          {/* Evidence Upload Section (Visible IN_PROGRESS and later) */}
          {(currentIdx >= flow.indexOf("IN_PROGRESS") || isCompletedOrPaid) && (
            <div className="p-8 rounded-3xl glass-panel">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Camera className="w-5 h-5 text-cyan-400" /> Work Evidence</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Before Photo */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <h4 className="text-white font-medium mb-3">Before Photo</h4>
                  {beforeEvidence ? (
                    <img src={beforeEvidence.fileUrl} alt="Before" className="w-full h-32 object-cover rounded-xl mb-2" />
                  ) : (
                    <div className="h-32 bg-black/30 rounded-xl mb-3 flex flex-col items-center justify-center border border-dashed border-white/20">
                      <Camera className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-xs text-gray-500">No photo uploaded</span>
                    </div>
                  )}
                  {!isCompletedOrPaid && (
                    <>
                      <input type="file" ref={beforeRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "BEFORE_PHOTO")} />
                      <button 
                        onClick={() => beforeRef.current?.click()}
                        disabled={uploading === "BEFORE_PHOTO"}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        {uploading === "BEFORE_PHOTO" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Upload Before</>}
                      </button>
                    </>
                  )}
                </div>

                {/* After Photo */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <h4 className="text-white font-medium mb-3">After Photo</h4>
                  {afterEvidence ? (
                    <img src={afterEvidence.fileUrl} alt="After" className="w-full h-32 object-cover rounded-xl mb-2" />
                  ) : (
                    <div className="h-32 bg-black/30 rounded-xl mb-3 flex flex-col items-center justify-center border border-dashed border-white/20">
                      <Camera className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-xs text-gray-500">No photo uploaded</span>
                    </div>
                  )}
                  {!isCompletedOrPaid && (
                    <>
                      <input type="file" ref={afterRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "AFTER_PHOTO")} />
                      <button 
                        onClick={() => afterRef.current?.click()}
                        disabled={uploading === "AFTER_PHOTO"}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        {uploading === "AFTER_PHOTO" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Upload After</>}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Controller */}
          {!isCompletedOrPaid && currentIdx >= 0 && (
            <div className="p-8 rounded-3xl glass-panel border border-cyan-500/30">
              <h3 className="text-lg font-bold text-white mb-6">Job Progress</h3>
              
              <div className="space-y-4 mb-8">
                {flow.map((step, idx) => {
                  const isPast = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step} className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isPast ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-500'}`}>
                        {idx + 1}
                      </div>
                      <p className={`font-bold ${isCurrent ? 'text-cyan-400' : isPast ? 'text-white' : 'text-gray-500'}`}>{step.replace(/_/g, " ")}</p>
                    </div>
                  );
                })}
              </div>

              {order.status === "IN_PROGRESS" && (
                <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <label className="block text-sm text-gray-300 font-medium mb-2">Final Amount ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      type="number"
                      value={finalAmount}
                      onChange={(e) => setFinalAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {nextStatus && (
                <button 
                  onClick={() => updateStatus(nextStatus)}
                  disabled={updating}
                  className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  {updating ? <Loader2 className="w-6 h-6 animate-spin" /> : `Mark as ${nextStatus.replace(/_/g, " ")}`}
                </button>
              )}
            </div>
          )}
          
          {/* Completed Info Panel */}
          {isCompletedOrPaid && (
            <div className="p-8 rounded-3xl glass-panel border border-green-500/30">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Job Completed</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Final Amount</p>
                  <p className="text-2xl font-bold text-white">${order.finalAmount || 0}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Payment Status</p>
                  <p className={`text-lg font-bold ${payment?.status === "COMPLETED" ? 'text-green-400' : 'text-yellow-400'}`}>
                    {payment?.status || order.status}
                  </p>
                </div>
              </div>

              {rating && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Customer Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < rating.score ? 'fill-current' : 'opacity-30'}`} />
                      ))}
                    </div>
                    <span className="text-white font-bold ml-2">{rating.score}/5</span>
                  </div>
                  {rating.review && <p className="text-gray-300 text-sm mt-2 italic">"{rating.review}"</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customer & GPS Panel */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              {order.customer?.user?.name?.charAt(0) || "C"}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{order.customer?.user?.name}</h3>
            <p className="text-sm text-gray-400 mb-4">Customer</p>
            <a href={`tel:${order.customer?.user?.mobile}`} className="inline-block w-full py-2 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors text-sm mb-2">
              Call Customer
            </a>
            <button className="w-full py-2 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors text-sm flex items-center justify-center gap-2">
              <Navigation className="w-4 h-4" /> Navigate
            </button>
          </div>

          {order.status === "ON_THE_WAY" && (
            <div className="p-6 rounded-3xl glass-panel bg-cyan-500/10 border border-cyan-500/20 text-center">
              <Crosshair className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h4 className="text-white font-bold mb-2">Share Location</h4>
              <p className="text-xs text-gray-400 mb-4">Update your GPS so the customer can track you.</p>
              <button onClick={updateLocation} className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm">
                Ping Location
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}