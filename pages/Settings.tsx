
import React, { useState, useEffect } from 'react';
import { User, TelegramConfig } from '../types';
import { sendTelegramMessage } from '../services/telegramService';

interface SettingsProps {
  user: User | null;
  onUpdateTelegram: (config: TelegramConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateTelegram }) => {
  const [tgConfig, setTgConfig] = useState<TelegramConfig>(
    user?.telegram || {
      botToken: '',
      chatId: '',
      autoReminders: true,
      dailyReports: false,
      voiceAlerts: true
    }
  );
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSave = () => {
    onUpdateTelegram(tgConfig);
    alert('تنظیمات با موفقیت ذخیره شد.');
  };

  const handleTestConnection = async () => {
    if (!tgConfig.botToken || !tgConfig.chatId) {
      alert('لطفا توکن و Chat ID را وارد کنید.');
      return;
    }
    setTestStatus('loading');
    const res = await sendTelegramMessage(
      tgConfig.botToken,
      tgConfig.chatId,
      "<b>🔔 تست اتصال تیسا</b>\nارتباط با موفقیت برقرار شد. از این پس اعلانات بانکی را اینجا دریافت خواهید کرد."
    );
    setTestStatus(res.ok ? 'success' : 'error');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <h2 className="text-3xl font-black text-slate-900">تنظیمات سیستم</h2>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-100">
            {user?.username.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">{user?.username}</h3>
            <p className="text-slate-500 font-medium">نقش: {user?.role === 'ADMIN' ? 'مدیر ارشد امنیت' : 'اپراتور سامانه'}</p>
          </div>
        </div>

        {/* Telegram Integration Card */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-sky-500/5 blur-[60px] rounded-full -ml-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.441-.168.571-.532 1.398-.928 1.442-.86.096-1.513-.518-2.348-1.064-.827-.54-1.294-.875-2.094-1.4-.925-.608-.325-.942.202-1.488.138-.144 2.535-2.324 2.582-2.522.006-.025.011-.119-.045-.168-.056-.05-.138-.033-.198-.019-.084.019-1.433.911-4.045 2.673-.383.262-.73.39-1.04.381-.343-.01-.703-.197-1.047-.308-.423-.137-.758-.209-.728-.442.015-.121.182-.245.499-.372 1.948-.848 3.248-1.408 3.9-1.679 3.71-1.538 4.478-1.805 4.981-1.815.111-.002.359.025.521.157.136.111.173.261.182.378.009.117.001.24-.002.359z"/></svg>
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-800">اتصال به ربات تلگرام</h4>
                <p className="text-slate-500 text-sm">ارسال هوشمند اعلانات و گزارش‌های صوتی به گروه</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 mr-2">توکن ربات (Bot Token)</label>
                <input 
                  type="password"
                  value={tgConfig.botToken}
                  onChange={e => setTgConfig({...tgConfig, botToken: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none font-mono text-sm"
                  placeholder="123456:ABC-DEF..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 mr-2">شناسه چت (Chat ID)</label>
                <input 
                  type="text"
                  value={tgConfig.chatId}
                  onChange={e => setTgConfig({...tgConfig, chatId: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none font-mono text-sm"
                  placeholder="-100123456789"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <ToggleCard 
                label="یادآوری خودکار سررسید" 
                active={tgConfig.autoReminders} 
                onClick={() => setTgConfig({...tgConfig, autoReminders: !tgConfig.autoReminders})} 
              />
              <ToggleCard 
                label="گزارش‌های روزانه خودکار" 
                active={tgConfig.dailyReports} 
                onClick={() => setTgConfig({...tgConfig, dailyReports: !tgConfig.dailyReports})} 
              />
              <ToggleCard 
                label="هشدارهای صوتی (Voice)" 
                active={tgConfig.voiceAlerts} 
                onClick={() => setTgConfig({...tgConfig, voiceAlerts: !tgConfig.voiceAlerts})} 
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                ذخیره تنظیمات تلگرام
              </button>
              <button 
                onClick={handleTestConnection}
                disabled={testStatus === 'loading'}
                className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${
                  testStatus === 'success' ? 'bg-emerald-100 text-emerald-700' : 
                  testStatus === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-sky-50 text-sky-600 hover:bg-sky-100'
                }`}
              >
                {testStatus === 'loading' ? 'در حال تست...' : testStatus === 'success' ? 'اتصال برقرار است ✓' : 'تست اتصال'}
              </button>
            </div>
          </div>
        </div>

        {/* Security and Backup Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3">
                    <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                    امنیت و دسترسی
                </h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-600">تایید دو مرحله‌ای (2FA)</span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-600">تغییر رمز عبور</span>
                        <button className="text-indigo-600 text-xs font-black">ویرایش</button>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                    پشتیبان‌گیری
                </h4>
                <div className="flex flex-col items-center text-center p-4">
                    <p className="text-xs text-slate-400 font-medium mb-4">آخرین نسخه پشتیبان: امروز ساعت ۱۰:۳۰ صبح</p>
                    <button className="w-full py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all">دریافت فایل JSON داده‌ها</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const ToggleCard: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-5 rounded-3xl border-2 transition-all text-right flex flex-col gap-3 ${
      active ? 'bg-sky-50 border-sky-500 shadow-inner' : 'bg-white border-slate-100 hover:border-slate-200'
    }`}
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${active ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
    </div>
    <span className={`text-sm font-black ${active ? 'text-sky-900' : 'text-slate-500'}`}>{label}</span>
  </button>
);

export default Settings;
