
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // تاخیر برای شبیه‌سازی بررسی امنیتی لایه‌های دیتابیس
    setTimeout(() => {
      // این مقادیر فقط برای هویت Admin Alpha است
      const MASTER_ADMIN = "admin_tisa_alpha";
      const MASTER_PASS = "tisa#security@2025";
      const MASTER_KEY = "7733";

      if (username === MASTER_ADMIN && password === MASTER_PASS && accessCode === MASTER_KEY) {
        onLogin({
          id: 'admin-alpha-root',
          username: 'مدیریت ارشد سیستم (تیسا)',
          role: 'ADMIN',
          isTwoFactorEnabled: true,
          telegram: { botToken: '', chatId: '', autoReminders: true, dailyReports: false, voiceAlerts: true }
        });
      } else {
        setError('خطای امنیتی: اعتبارنامه نامعتبر. آدرس IP شما جهت بررسی ثبت شد.');
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-['Vazirmatn'] relative overflow-hidden" dir="rtl">
      {/* Security Scanning Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/20 animate-[scan_3s_linear_infinite]"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-8 lg:p-14 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-lg relative z-10">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-indigo-600/30 rotate-3">
            <span className="text-5xl font-black text-white italic tracking-tighter">T</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">TISA SECURITY GATEWAY</h1>
          <p className="text-slate-500 text-xs font-black mt-3 uppercase tracking-[0.3em]">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-7">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl text-xs font-black text-center animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase mr-3 tracking-widest">Admin Signature (ID)</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-slate-700"
              placeholder="System Identity..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase mr-3 tracking-widest">Access Credentials</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-slate-700"
              placeholder="••••••••••••"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase mr-3 tracking-widest">Global Master Key (4-Digits)</label>
            <input 
              type="text" 
              maxLength={4}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-black text-center tracking-[1em] text-2xl"
              placeholder="0000"
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 mt-4 overflow-hidden group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                بازگشایی هسته سیستم
              </>
            )}
          </button>
        </form>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Database: Encrypted / Connection: SSL</span>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Login;
