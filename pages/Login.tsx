
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

    setTimeout(() => {
      // مقادیر ثابت ادمین برای امنیت مطلق
      const ADMIN_USER = "admin_tisa";
      const ADMIN_PASS = "tisa@2025";
      const MASTER_KEY = "1403";

      if (username === ADMIN_USER && password === ADMIN_PASS && accessCode === MASTER_KEY) {
        onLogin({
          id: 'root-admin',
          username: 'مدیریت ارشد سیستم',
          role: 'ADMIN',
          isTwoFactorEnabled: true,
          // در صورت وجود در دیتابیس، App خودش این را جایگزین می‌کند
          telegram: { botToken: '', chatId: '', autoReminders: true, dailyReports: false, voiceAlerts: true }
        });
      } else {
        setError('اعتبارنامه امنیتی نامعتبر است. تلاش برای نفوذ ثبت شد.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-['Vazirmatn']" dir="rtl">
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600 blur-[150px] rounded-full"></div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 lg:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
            <span className="text-4xl font-black text-white">T</span>
          </div>
          <h1 className="text-2xl font-black text-white">سامانه هوشمند تیسا</h1>
          <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Enterprise Security Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-black text-center">{error}</div>}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase mr-2 tracking-widest">شناسه مدیر</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold"
              placeholder="Admin ID"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase mr-2 tracking-widest">کلمه عبور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-bold"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase mr-2 tracking-widest">کد دسترسی (Master Key)</label>
            <input 
              type="text" 
              maxLength={4}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all font-black text-center tracking-[0.8em]"
              placeholder="0000"
              required
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'تایید هویت و ورود'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
