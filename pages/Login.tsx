
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState('');

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      setShow2FA(true);
    }
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456' || otp.length === 6) {
      onLogin({
        id: 'user-1',
        username: username || 'مدیر سیستم',
        role: 'ADMIN',
        isTwoFactorEnabled: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-indigo-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4 backdrop-blur-md">
            <span className="text-3xl font-bold">T</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">ورود به سامانه تیسا</h1>
          <p className="text-indigo-100 text-sm opacity-80">مدیریت فوق‌پیشرفته زنجیره چک</p>
        </div>

        <div className="p-8">
          {!show2FA ? (
            <form onSubmit={handleInitialSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">نام کاربری</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="user@tisa.ir"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">رمز عبور</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95">
                ورود امن
              </button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-6 text-center">
              <div className="mb-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800">تایید دو مرحله‌ای</h2>
                <p className="text-slate-500 text-sm mt-2">کد ۶ رقمی ارسال شده به پیامک خود را وارد کنید</p>
              </div>
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center text-3xl tracking-[1em] px-4 py-4 rounded-xl border-2 border-dashed border-slate-200 focus:border-indigo-500 focus:ring-0 transition-all outline-none"
                placeholder="000000"
                autoFocus
                required
              />
              <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95">
                تایید و ادامه
              </button>
              <button 
                type="button" 
                onClick={() => setShow2FA(false)}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                بازگشت به صفحه قبل
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
