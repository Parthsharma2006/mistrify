"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  User, Briefcase, IndianRupee, Clock, AlertTriangle,
  Phone, Mail, MapPin, Globe, Edit3, Save, X, Loader2, LogOut
} from "lucide-react";

interface CustomerProfileData {
  id: string;
  userId: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  user: {
    id: string;
    name: string;
    mobile: string;
    email: string | null;
    profilePhoto: string | null;
    preferredLanguage: string;
    createdAt: string;
  };
}

export default function CustomerProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const [profile, setProfile] = useState<CustomerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ address: "", city: "", state: "", pincode: "" });

  useEffect(() => {
    fetch("/api/customers/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.data);
          setEditData({
            address: data.data.address || "",
            city: data.data.city || "",
            state: data.data.state || "",
            pincode: data.data.pincode || "",
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/customers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev) => prev ? { ...prev, ...editData } : prev);
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Header */}
        <div className="relative p-6 sm:p-8 rounded-3xl glass-panel mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-violet-500/5" />
          <div className="relative flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-amber-500/20">
              {(user?.name as string)?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name as string}</h1>
              <p className="text-sm text-gray-400 mt-1">Customer Account</p>
              <p className="text-xs text-gray-500 mt-1">
                Member since {profile?.user?.createdAt ? new Date(profile.user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-6 rounded-2xl glass-panel mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Mobile</p>
                <p className="text-sm text-white">{user?.mobile as string}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-white">{(user?.email as string) || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Preferred Language</p>
                <p className="text-sm text-white">{(user?.preferredLanguage as string) === "hi" ? "हिन्दी" : "English"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="p-6 rounded-2xl glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Address</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-amber-400 hover:bg-amber-500/10 transition-all">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 transition-all">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm text-white shimmer-btn transition-all">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                </button>
              </div>
            )}
          </div>

          {!editing ? (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-white">{profile?.address || "No address added"}</p>
                <p className="text-sm text-gray-400">
                  {[profile?.city, profile?.state, profile?.pincode].filter(Boolean).join(", ") || ""}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                placeholder="Address" rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all resize-none text-sm" />
              <div className="grid grid-cols-3 gap-3">
                <input type="text" value={editData.city} onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                  placeholder="City" className="px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all text-sm" />
                <input type="text" value={editData.state} onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                  placeholder="State" className="px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all text-sm" />
                <input type="text" value={editData.pincode} onChange={(e) => setEditData({ ...editData, pincode: e.target.value })}
                  placeholder="Pincode" maxLength={6} className="px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-all text-sm" />
              </div>
            </div>
          )}
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
