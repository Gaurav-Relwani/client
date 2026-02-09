"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Loader2, Lock, User, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isRegister ? '/register' : '/login';
    
    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
      if (!isRegister) {
        localStorage.setItem('token', res.data.token);
        if (res.data.role === 'admin') router.push('/sys-mainframe-root'); 
        else router.push('/dashboard');
      } else {
        alert("Identity Verified. Please Log In.");
        setIsRegister(false);
        setLoading(false);
      }
    } catch (err: any) {
      alert(`ACCESS DENIED: ${err.response?.data?.message || "Error"}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05070a] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* --- THE HONEYPOT BAIT --- */}
      {/* This link is hidden visually but visible in 'Inspect Element' */}
      <a href="/system-recovery-tool" className="opacity-0 absolute bottom-0 left-0 text-[1px] pointer-events-auto cursor-default" tabIndex={-1}>
        Debug: Administrator System Recovery Console
      </a>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[450px] p-6"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <ShieldCheck size={32} className="text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1 uppercase">
              {isRegister ? 'New Agent' : 'Secure Login'}
            </h1>
            <p className="text-slate-400 text-xs tracking-widest uppercase">Identity Verification Protocol</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
               <div className="relative group">
                   <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                   <input type="text" required placeholder="Full Legal Name" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all" onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
               </div>
            )}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="text" required placeholder="Corporate ID" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all" onChange={(e) => setFormData({...formData, username: e.target.value})} />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="password" required placeholder="Passcode" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all" onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
            <button disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" size={22}/> : <>{isRegister ? 'Register' : 'Authenticate'} <ArrowRight size={18} /></>}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => setIsRegister(!isRegister)} className="text-slate-500 text-xs hover:text-white transition-colors uppercase tracking-wider">
              {isRegister ? "Login" : "Register ID" }
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}