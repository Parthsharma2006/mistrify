"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, ShieldCheck, XCircle, FileText, CheckCircle, Video, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function WorkerReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/verification/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setWorker(data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (status: "VERIFIED" | "REJECTED") => {
    if (status === "REJECTED" && !rejectReason) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setActioning(true);
    try {
      const res = await fetch(`/api/admin/verification/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY_WORKER", status, reason: rejectReason })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Worker successfully ${status.toLowerCase()}!`);
        router.push("/admin/verification");
      }
    } catch (err) {
      console.error(err);
      alert("Action failed.");
    } finally {
      setActioning(false);
    }
  };

  const handlePortfolioAction = async (portfolioItemId: string, status: "APPROVED" | "REJECTED") => {
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/verification/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY_PORTFOLIO", status, portfolioItemId })
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setWorker((prev: any) => ({
          ...prev,
          portfolio: prev.portfolio.map((item: any) => 
            item.id === portfolioItemId ? { ...item, status } : item
          )
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Portfolio action failed.");
    } finally {
      setActioning(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;
  if (!worker) return <div className="text-center py-20 text-white">Worker not found</div>;

  const hasCert = !!worker.certificate;
  const testAttempt = worker.testAttempts?.[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Link href="/admin/verification" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Pending
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Profile summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-xl shadow-violet-500/20 mb-4">
              {worker.user?.name?.charAt(0) || "W"}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{worker.user?.name}</h1>
            <p className="text-violet-400 font-medium">{worker.category?.name}</p>
            <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              {worker.yearsOfExperience} Years Experience
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel">
            <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {worker.skills?.map((s: any) => (
                <span key={s.id} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                  {s.subcategory.name}
                </span>
              ))}
              {!worker.skills?.length && <p className="text-sm text-gray-500">No skills added.</p>}
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <button onClick={() => handleAction("VERIFIED")} disabled={actioning} className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold flex items-center justify-center gap-2 transition-colors">
              {actioning ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />} Approve Worker
            </button>
            <button onClick={() => setShowRejectModal(true)} disabled={actioning} className="w-full py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold flex items-center justify-center gap-2 border border-red-500/30 transition-colors">
              <XCircle className="w-5 h-5" /> Reject Worker
            </button>
          </div>
        </div>

        {/* Right Col: Evidence */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white">Verification Evidence</h2>

          {hasCert ? (
            <div className="p-6 rounded-3xl glass-panel bg-fuchsia-500/5 border-fuchsia-500/20">
              <div className="flex items-center gap-4 mb-6">
                <FileText className="w-8 h-8 text-fuchsia-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Certificate Provided</h3>
                  <p className="text-sm text-indigo-300">{worker.certificate.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-black/40"><p className="text-xs text-gray-500">Number</p><p className="text-sm text-white font-medium">{worker.certificate.number}</p></div>
                <div className="p-4 rounded-xl bg-black/40"><p className="text-xs text-gray-500">Issuer</p><p className="text-sm text-white font-medium">{worker.certificate.issuer}</p></div>
                <div className="p-4 rounded-xl bg-black/40"><p className="text-xs text-gray-500">Year</p><p className="text-sm text-white font-medium">{worker.certificate.year}</p></div>
              </div>
              <a href={worker.certificate.fileUrl} target="_blank" rel="noreferrer" className="inline-flex px-4 py-2 rounded-xl bg-fuchsia-500/20 text-indigo-300 font-bold border border-fuchsia-500/30 hover:bg-fuchsia-500/30 transition-colors">
                View Certificate Document
              </a>
            </div>
          ) : testAttempt ? (
            <div className={`p-6 rounded-3xl glass-panel ${testAttempt.passed ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-center gap-4 mb-4">
                <CheckCircle className={`w-8 h-8 ${testAttempt.passed ? 'text-green-400' : 'text-red-400'}`} />
                <div>
                  <h3 className="text-lg font-bold text-white">Skill Test Result</h3>
                  <p className={`text-sm ${testAttempt.passed ? 'text-green-300' : 'text-red-300'}`}>{testAttempt.passed ? 'Passed' : 'Failed'}</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">Score: {testAttempt.score}</div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl glass-panel text-center text-gray-500 py-12">
              No certificate or skill test found.
            </div>
          )}

          <h2 className="text-xl font-bold text-white mt-8">Work Portfolio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {worker.portfolio?.map((item: any) => (
              <div key={item.id} className="rounded-2xl overflow-hidden bg-black/40 border border-white/10 group flex flex-col">
                <div className="aspect-video w-full bg-gray-900 relative">
                  {item.fileType === "IMAGE" ? (
                    <img src={item.fileUrl} alt={item.title} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800"><Video className="w-8 h-8 text-gray-500" /></div>
                  )}
                  {item.status !== "PENDING" && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${item.status === "APPROVED" ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"}`}>
                      {item.status}
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 flex-1">{item.description}</p>
                  
                  {item.status === "PENDING" && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                      <button 
                        onClick={() => handlePortfolioAction(item.id, "APPROVED")}
                        disabled={actioning}
                        className="flex-1 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handlePortfolioAction(item.id, "REJECTED")}
                        disabled={actioning}
                        className="flex-1 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!worker.portfolio?.length && <div className="sm:col-span-2 p-6 text-center text-gray-500">No portfolio items provided.</div>}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-3xl glass-panel bg-[#1a1a1a] border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Reject Worker</h3>
            <textarea 
              placeholder="Reason for rejection (e.g. Invalid certificate)..." 
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 mb-6 resize-none focus:outline-none focus:border-red-500/50"
              rows={4}
            />
            <div className="flex gap-4">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">Cancel</button>
              <button onClick={() => handleAction("REJECTED")} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}