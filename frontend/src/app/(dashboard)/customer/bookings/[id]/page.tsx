"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, MapPin, Calendar, Clock, Navigation, Star, CreditCard, FileText, AlertTriangle, CheckCircle, MessageSquare, Camera } from "lucide-react";

export default function CustomerBookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  
  const [evidence, setEvidence] = useState<any[]>([]);
  const [payment, setPayment] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [rating, setRating] = useState<any>(null);
  const [complaint, setComplaint] = useState<any>(null);

  const [paying, setPaying] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [complainting, setComplainting] = useState(false);

  const [ratingForm, setRatingForm] = useState({ rating: 0, quality: 0, professionalism: 0, timeliness: 0, feedback: '' });
  const [complaintForm, setComplaintForm] = useState({ category: '', description: '' });
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, eRes, pRes, iRes, rRes] = await Promise.all([
        fetch(`/api/bookings/${id}`).then(r => r.json().catch(() => ({}))),
        fetch(`/api/bookings/${id}/evidence`).then(r => r.json().catch(() => ({}))),
        fetch(`/api/bookings/${id}/payment`).then(r => r.json().catch(() => ({}))),
        fetch(`/api/bookings/${id}/invoice`).then(r => r.json().catch(() => ({}))),
        fetch(`/api/bookings/${id}/rating`).then(r => r.json().catch(() => ({}))),
      ]);
      
      if (bRes.success) setBooking(bRes.data);
      if (eRes.success) setEvidence(eRes.data || []);
      if (pRes.success) setPayment(pRes.data);
      if (iRes.success) setInvoice(iRes.data);
      if (rRes.success) setRating(rRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" })
      });
      const data = await res.json();
      if (data.success) {
        setBooking(data.data);
        fetchData();
      } else alert(data.error);
    } catch (err) {
      alert("Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/bookings/${id}/payment`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("Payment successful");
        fetchData();
      } else {
        alert(data.error || "Payment failed");
      }
    } catch (err) {
      alert("Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const handleRatingSubmit = async () => {
    setRatingSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${id}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratingForm)
      });
      const data = await res.json();
      if (data.success) {
        setRating(data.data);
      } else {
        alert(data.error || "Failed to submit rating");
      }
    } catch (err) {
      alert("Failed to submit rating");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleComplaintSubmit = async () => {
    setComplainting(true);
    try {
      const res = await fetch(`/api/bookings/${id}/complaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintForm)
      });
      const data = await res.json();
      if (data.success) {
        setComplaint(data.data);
        setShowComplaintForm(false);
        alert("Issue reported successfully");
      } else {
        alert(data.error || "Failed to report issue");
      }
    } catch (err) {
      alert("Failed to report issue");
    } finally {
      setComplainting(false);
    }
  };

  const renderStars = (value: number, onChange?: (val: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-6 h-6 ${onChange ? 'cursor-pointer' : ''} ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
            onClick={() => onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  const renderSmallStars = (value: number, onChange?: (val: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${onChange ? 'cursor-pointer' : ''} ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
            onClick={() => onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;
  if (!booking) return <div className="text-center py-20 text-white">Booking not found</div>;

  const d = new Date(booking.scheduledDate);
  const isPendingOrAccepted = ["PENDING", "ACCEPTED"].includes(booking.status);
  const isActive = ["ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"].includes(booking.status);
  const isCompleted = booking.status === "COMPLETED";
  const isPaid = booking.status === "PAID";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => router.push("/customer/bookings")} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to My Bookings
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl glass-panel">
            <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{booking.subcategory?.name}</h1>
                <p className="text-sm text-gray-400">Order ID: #{booking.id.slice(0,8).toUpperCase()}</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-violet-400 font-bold text-sm tracking-wider uppercase">
                {booking.status.replace(/_/g, " ")}
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
              <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block"><MapPin className="inline w-3 h-3 mr-1" /> Service Address</label>
              <p className="text-white font-medium bg-black/30 p-4 rounded-xl border border-white/5">{booking.address}</p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
               <span className="text-gray-400 font-medium">Estimated Price</span>
               <span className="text-2xl font-bold text-white">₹{booking.price}</span>
            </div>
          </div>

          {/* Tracking */}
          {isActive && (
            <div className="p-8 rounded-3xl glass-panel border border-violet-500/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Navigation className="w-5 h-5 text-violet-400" /> Live Tracking</h3>
              <p className="text-sm text-gray-300 mb-6">Your worker is updating their status. Wait here for updates.</p>
              
              <div className="space-y-4">
                {["ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETED"].map((step) => {
                  const historyStep = booking.statusHistory?.find((h:any) => h.status === step);
                  const isPast = !!historyStep;
                  const isCurrent = booking.status === step;
                  return (
                    <div key={step} className={`flex items-center gap-4 p-3 rounded-xl ${isCurrent ? 'bg-violet-500/20 border border-violet-500/30' : ''}`}>
                      <div className={`w-4 h-4 rounded-full ${isCurrent ? 'bg-violet-400 shadow-[0_0_10px_#22d3ee]' : isPast ? 'bg-green-400' : 'bg-white/10 border border-white/20'}`} />
                      <div>
                        <p className={`font-bold ${isCurrent ? 'text-violet-400' : isPast ? 'text-white' : 'text-gray-500'}`}>{step.replace(/_/g, " ")}</p>
                        {isPast && <p className="text-xs text-gray-400">{new Date(historyStep.timestamp).toLocaleTimeString()}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {booking.status === "ON_THE_WAY" && booking.worker?.latitude && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <span className="text-sm text-gray-300">Worker's Latest GPS Pin</span>
                  <span className="text-xs font-mono text-violet-400">{booking.worker.latitude.toFixed(4)}, {booking.worker.longitude.toFixed(4)}</span>
                </div>
              )}
            </div>
          )}

          {/* COMPLETED or PAID section */}
          {(isCompleted || isPaid) && (
            <div className="space-y-6">
              
              {/* Service Evidence */}
              {evidence.length > 0 && (
                <div className="p-8 rounded-3xl glass-panel">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Camera className="w-5 h-5 text-violet-400" /> Service Evidence</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {evidence.map((ev, i) => (
                      <div key={i} className="space-y-2">
                        <img src={ev.url} alt={ev.description} className="w-full h-32 object-cover rounded-xl border border-white/10" />
                        <p className="text-xs text-gray-400">{ev.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="p-8 rounded-3xl glass-panel">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-violet-400" /> Price Breakdown</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Base Price</span>
                    <span>₹{booking.finalPrice || booking.price}</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between text-white font-bold text-lg">
                    <span>Final Amount</span>
                    <span className="text-violet-400">₹{booking.finalPrice || booking.price}</span>
                  </div>
                </div>

                {isCompleted && (
                  <button 
                    onClick={handlePay}
                    disabled={paying}
                    className="w-full mt-6 py-3 rounded-xl bg-violet-500 text-white font-bold hover:bg-violet-600 transition-colors flex justify-center items-center shadow-lg shadow-violet-500/20"
                  >
                    {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Now"}
                  </button>
                )}
              </div>

              {/* Payment Confirmation & Invoice */}
              {isPaid && (
                <div className="p-8 rounded-3xl glass-panel bg-green-500/5 border border-green-500/20">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-400 mb-1">Payment Successful</h3>
                      {payment && <p className="text-sm text-gray-400 mb-4">Ref: {payment.id}</p>}
                      {invoice ? (
                        <a href={invoice.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors border border-white/10">
                          <FileText className="w-4 h-4" /> Download Invoice
                        </a>
                      ) : (
                        <button className="inline-flex items-center gap-2 text-sm text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors border border-white/10" disabled>
                          <FileText className="w-4 h-4" /> Invoice Generating...
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Rating System */}
              {isPaid && (
                <div className="p-8 rounded-3xl glass-panel">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400" /> Rate Your Experience</h3>
                  
                  {rating ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold text-white">{rating.rating.toFixed(1)}</span>
                        {renderStars(rating.rating)}
                      </div>
                      <p className="text-sm text-gray-300 italic">"{rating.feedback}"</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">Overall Rating</label>
                        {renderStars(ratingForm.rating, (v) => setRatingForm({...ratingForm, rating: v}))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Quality</label>
                          {renderSmallStars(ratingForm.quality, (v) => setRatingForm({...ratingForm, quality: v}))}
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Professionalism</label>
                          {renderSmallStars(ratingForm.professionalism, (v) => setRatingForm({...ratingForm, professionalism: v}))}
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Timeliness</label>
                          {renderSmallStars(ratingForm.timeliness, (v) => setRatingForm({...ratingForm, timeliness: v}))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">Feedback</label>
                        <textarea
                          value={ratingForm.feedback}
                          onChange={(e) => setRatingForm({...ratingForm, feedback: e.target.value})}
                          className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/50"
                          rows={3}
                          placeholder="How was the service?"
                        />
                      </div>
                      <button 
                        onClick={handleRatingSubmit}
                        disabled={ratingSubmitting || ratingForm.rating === 0}
                        className="w-full py-3 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-600 transition-colors flex justify-center items-center disabled:opacity-50"
                      >
                        {ratingSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Rating"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Worker & Actions */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-xl shadow-violet-500/20 mb-4">
              {booking.worker?.user?.name?.charAt(0) || "W"}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{booking.worker?.user?.name}</h3>
            <p className="text-sm text-violet-400 mb-4">{booking.category?.name} Professional</p>
            <a href={`tel:${booking.worker?.user?.mobile}`} className="inline-block w-full py-2 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors text-sm">
              Call Worker
            </a>
          </div>

          {isPendingOrAccepted && (
            <button 
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-bold border border-red-500/30 hover:bg-red-500/30 transition-colors flex justify-center items-center"
            >
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Booking"}
            </button>
          )}

          {isPaid && !showComplaintForm && !complaint && (
            <button 
              onClick={() => setShowComplaintForm(true)}
              className="w-full py-3 rounded-xl bg-white/5 text-gray-300 font-medium border border-white/10 hover:bg-white/10 transition-colors flex justify-center items-center gap-2 text-sm"
            >
              <AlertTriangle className="w-4 h-4" /> Report an Issue
            </button>
          )}

          {isPaid && showComplaintForm && (
            <div className="p-6 rounded-3xl glass-panel space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> Report Issue</h3>
              <select
                value={complaintForm.category}
                onChange={e => setComplaintForm({...complaintForm, category: e.target.value})}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-500/50"
              >
                <option value="">Select Category</option>
                <option value="Service Quality">Service Quality</option>
                <option value="Worker Behavior">Worker Behavior</option>
                <option value="Pricing Issue">Pricing Issue</option>
                <option value="Safety Concern">Safety Concern</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                value={complaintForm.description}
                onChange={e => setComplaintForm({...complaintForm, description: e.target.value})}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50"
                rows={3}
                placeholder="Describe the issue..."
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowComplaintForm(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleComplaintSubmit}
                  disabled={complainting || !complaintForm.category || !complaintForm.description}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors flex justify-center items-center text-sm disabled:opacity-50"
                >
                  {complainting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                </button>
              </div>
            </div>
          )}

          {isPaid && complaint && (
            <div className="p-6 rounded-3xl glass-panel border border-red-500/20 bg-red-500/5">
              <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Issue Reported</h3>
              <p className="text-sm text-gray-300">We have received your report and will contact you shortly.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}