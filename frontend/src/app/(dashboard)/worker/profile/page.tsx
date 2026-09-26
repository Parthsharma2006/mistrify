"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, Mail, Globe, MapPin, Briefcase,
  Clock, Building2, Shield, Edit3, Save, X, Loader2, Image as ImageIcon, Video, Plus, LogOut, ArrowRight
} from "lucide-react";

const verificationColors: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  VERIFIED: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  REJECTED: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
};

export default function WorkerProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ bio: "", yearsOfExperience: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({ title: "", description: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = () => {
    fetch("/api/workers/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.data);
          setEditData({
            bio: (data.data.bio as string) || "",
            yearsOfExperience: data.data.yearsOfExperience || 0,
          });
          const skillIds = data.data.skills?.map((s: any) => s.subcategoryId) || [];
          setSelectedSkills(skillIds);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => { if (data.success) setCategories(data.data); })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/workers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      await fetch("/api/workers/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subcategoryIds: selectedSkills }),
      });
      fetchProfile();
      setEditing(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    if (!newPortfolio.title) { alert("Please enter a title."); return; }
    const file = e.target.files[0];
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "portfolio");
    try {
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        const res = await fetch("/api/workers/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newPortfolio.title,
            description: newPortfolio.description,
            fileUrl: uploadData.data.url,
            fileType: file.type.startsWith("video") ? "VIDEO" : "IMAGE",
          })
        });
        if ((await res.json()).success) {
          setNewPortfolio({ title: "", description: "" });
          fetchProfile();
        }
      }
    } catch (err) { console.error(err); alert("Upload failed"); } 
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const toggleSkill = (id: string) => {
    setSelectedSkills(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  const vStatus = (profile?.verificationStatus as string) || "PENDING";
  const vColors = verificationColors[vStatus] || verificationColors.PENDING;
  const category = profile?.category as Record<string, unknown> | null;
  const cooperative = profile?.cooperative as Record<string, unknown> | null;

  const activeCategory = categories.find(c => c.id === category?.id);
  const availableSubcategories = activeCategory?.subcategories || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* Header Glass Card */}
        <div className="relative p-6 sm:p-8 rounded-3xl glass-panel overflow-hidden border-t border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px] -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[80px] -z-10" />
          
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <motion.div whileHover={{ scale: 1.05 }} className="shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_25px_rgba(139,92,246,0.4)] border border-white/20">
              {user?.name?.charAt(0)?.toUpperCase() || "W"}
            </motion.div>
            <div className="flex-1 w-full">
              <h1 className="text-3xl font-bold text-white tracking-tight">{user?.name}</h1>
              <p className="text-amber-400 font-medium mt-1">{String(category?.name || "Worker")}</p>
              
              <div className="mt-5 w-full bg-black/20 rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[13px] font-bold ${vColors.bg} ${vColors.text} border ${vColors.border} uppercase tracking-widest`}>
                    <Shield className="w-4 h-4" />
                    {vStatus}
                  </span>
                  <p className="text-sm text-gray-400 hidden sm:block">
                    {vStatus === "PENDING" ? "Action required to unlock bookings." : "Your profile is verified."}
                  </p>
                </div>
                {vStatus === "PENDING" && (
                  <a href="/worker/verification" className="w-full sm:w-auto text-center inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    Complete Verification <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6 md:col-span-1">
            {/* Contact Info */}
            <div className="p-6 rounded-3xl glass-panel">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                Contact
              </h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20"><Phone className="w-4 h-4 text-violet-400" /></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Mobile</p><p className="text-sm font-medium text-white">{user?.mobile}</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center shrink-0 border border-fuchsia-500/20"><Mail className="w-4 h-4 text-fuchsia-400" /></div>
                  <div><p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Email</p><p className="text-sm font-medium text-white">{user?.email || "N/A"}</p></div>
                </div>
              </div>
            </div>

            {/* Cooperative Info */}
            <div className="p-6 rounded-3xl glass-panel">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Cooperative
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20"><Building2 className="w-4 h-4 text-amber-400" /></div>
                <div>
                  <p className="text-sm font-medium text-white">{String(cooperative?.name || "Independent Worker")}</p>
                </div>
              </div>
            </div>
            {/* Workload Info */}
            <div className="p-6 rounded-3xl glass-panel">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                Current Workload
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{profile?.bookings?.length || 0} recent jobs</p>
                  <p className="text-xs text-gray-400">Last 7 days</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  (profile?.bookings?.length || 0) > 10 ? 'text-red-400 border-red-500/20 bg-red-500/10' : 
                  (profile?.bookings?.length || 0) > 3 ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10' : 
                  'text-green-400 border-green-500/20 bg-green-500/10'
                }`}>
                  { (profile?.bookings?.length || 0) > 10 ? "HIGH" : (profile?.bookings?.length || 0) > 3 ? "MEDIUM" : "LOW" }
                </div>
              </div>
            </div>

          </div>
          {/* Right Column */}
          <div className="space-y-6 md:col-span-2">
            {/* Professional Details */}
            <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Professional Details
                </h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 transition-all border border-violet-500/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"><X className="w-4 h-4" /> Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-black bg-violet-400 hover:bg-violet-300 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 block">Bio</label>
                  {editing ? (
                    <textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      rows={3} placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 resize-none transition-all" />
                  ) : (
                    <p className="text-sm text-gray-300 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">{String(profile?.bio || "No bio provided.")}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 block">Years of Experience</label>
                  {editing ? (
                    <input type="number" min="0" max="50" value={editData.yearsOfExperience}
                      onChange={(e) => setEditData({ ...editData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                      className="w-32 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" />
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/20 border border-white/5 text-sm text-white">
                      <Clock className="w-4 h-4 text-purple-400" /> {Number(profile?.yearsOfExperience || 0)} Years
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 block">Skills / Subcategories</label>
                  {editing ? (
                    <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-black/20 border border-white/5">
                      {availableSubcategories.map((sub: any) => {
                        const isSelected = selectedSkills.includes(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => toggleSkill(sub.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                              isSelected 
                                ? "bg-violet-500/20 text-violet-300 border-violet-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]" 
                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                      {availableSubcategories.length === 0 && <p className="text-sm text-gray-500 italic">No skills available for this category.</p>}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill: any) => (
                          <span key={skill.id} className="px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20 text-xs font-semibold shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                            {skill.subcategory.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic bg-black/20 px-4 py-2 rounded-xl">No skills added yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Worker Welfare & Benefits Section */}
            <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                Worker Welfare & Benefits
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Health Insurance</h3>
                    <p className="text-xs text-green-400 font-medium mt-0.5">Active (Cooperative Covered)</p>
                    <p className="text-[10px] text-gray-500 mt-1">Valid until Dec 2026</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Welfare Scheme</h3>
                    <p className="text-xs text-purple-400 font-medium mt-0.5">Registered</p>
                    <p className="text-[10px] text-gray-500 mt-1">Provident Fund & Pension</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3 sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                    <Briefcase className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Skill Training Status</h3>
                    <p className="text-xs text-yellow-400 font-medium mt-0.5">Level 2 Certified</p>
                    <p className="text-[10px] text-gray-500 mt-1">Eligible for advanced tasks and higher base rates.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 p-4 mt-6 rounded-2xl border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 font-bold tracking-wide transition-all active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          LOG OUT
        </button>
      </motion.div>
    </div>
  );
}
