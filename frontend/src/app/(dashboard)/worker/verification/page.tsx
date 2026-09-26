'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Upload, FileCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  experienceYears: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

export default function VerificationPage() {
  const { status } = useSession();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    experienceYears: '',
    fileUrl: '', // In a real app, we'd handle file upload to S3/Cloudinary and get a URL
  });

  useEffect(() => {
    fetchItems();
  }, [status]);

  const fetchItems = async () => {
    if (status !== 'authenticated') return;
    try {
      const res = await fetch('/api/workers/verification');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching verification items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Mocking a file URL if not provided for demo purposes
      const submitData = {
        title: formData.title,
        description: formData.description,
        fileUrl: formData.fileUrl || 'https://via.placeholder.com/800x600.png?text=Work+Proof',
        fileType: 'IMAGE',
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : 0,
      };

      const res = await fetch('/api/workers/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Work proof submitted successfully. Pending review.' });
        setFormData({ title: '', description: '', experienceYears: '', fileUrl: '' });
        fetchItems();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+96px)] px-5">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold">Work Verification</h1>
      </div>

      <p className="text-zinc-300 mb-6 text-sm">
        Submit proof of your previous work experience. This helps verify your skills and builds trust with customers.
      </p>

      {message && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-panel p-5 mb-8 space-y-4"
      >
        <h2 className="text-lg font-semibold border-b border-white/10 pb-3 mb-4">Submit New Proof</h2>
        
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Job Title / Role</label>
          <input 
            type="text" 
            required
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500 transition-colors"
            placeholder="e.g. Senior Plumber"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Years of Experience</label>
          <input 
            type="number" 
            min="0"
            required
            value={formData.experienceYears}
            onChange={e => setFormData({...formData, experienceYears: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500 transition-colors"
            placeholder="e.g. 5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Description (Optional)</label>
          <textarea 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500 transition-colors min-h-[100px] resize-none"
            placeholder="Describe the work done..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Photo / Document</label>
          <div className="w-full border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-zinc-400 hover:border-fuchsia-500 hover:text-fuchsia-400 transition-colors cursor-pointer bg-white/5">
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Tap to upload proof</span>
            <span className="text-xs mt-1 opacity-70">JPG, PNG, PDF (Max 5MB)</span>
          </div>
          {/* Mock hidden input since we fake upload in this demo */}
          <input type="hidden" value={formData.fileUrl} />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full mt-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl py-3.5 shadow-[0_0_20px_rgba(217,70,239,0.3)] disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5" />}
          {isSubmitting ? 'Submitting...' : 'Submit Proof'}
        </button>
      </motion.form>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center justify-between">
          Submitted Proofs
          <span className="text-sm font-normal text-zinc-400">{items.length} items</span>
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-10 glass-panel">
            <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-3 opacity-50" />
            <p className="text-zinc-400 font-medium">No proofs submitted yet</p>
          </div>
        ) : (
          items.map(item => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-4 flex gap-4 relative overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                item.status === 'APPROVED' ? 'bg-green-500' : 
                item.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <div className="w-16 h-16 rounded-lg bg-white/10 shrink-0 overflow-hidden flex items-center justify-center border border-white/5">
                {item.fileUrl.startsWith('http') ? (
                  <img src={item.fileUrl} alt="proof" className="w-full h-full object-cover opacity-80" />
                ) : (
                  <FileCheck className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 
                    item.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-2">{item.experienceYears} years experience</p>
                {item.description && (
                  <p className="text-sm text-zinc-300 line-clamp-2">{item.description}</p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
