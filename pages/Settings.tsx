
import React, { useState, useEffect } from 'react';
import { User, TelegramConfig } from '../types';
import { sendTelegramMessage } from '../services/telegramService';
import { SecureDB } from '../services/storageService';

interface SettingsProps {
  user: User | null;
  onUpdateTelegram: (config: TelegramConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateTelegram }) => {
  const [tgConfig, setTgConfig] = useState<TelegramConfig>({
    botToken: user?.telegram?.botToken || '',
    chatId: user?.telegram?.chatId || '',
    autoReminders: user?.telegram?.autoReminders ?? true,
    dailyReports: user?.telegram?.dailyReports ?? false,
    voiceAlerts: user?.telegram?.voiceAlerts ?? true
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // اطمینان از سینک بودن با یوزر در هر تغییر
  useEffect(() => {
    if (user?.telegram) {
      setTgConfig(user.telegram);
    }
  }, [user]);

  const handleSave = () => {
    if (!tgConfig.botToken || !tgConfig.chatId) {
      alert('لطفا فیلدهای ضروری را پر کنید.');
      return;
    }
    onUpdateTelegram(tgConfig);
    alert('✅ تمامی تنظیمات رمزنگاری و در دیتابیس تثبیت شدند.');
  };

  const handleTestConnection = async () => {
    if (!tgConfig.botToken || !tgConfig.chatId) {
      alert('لطفا ابتدا توکن و Chat ID را وارد کنید.');
      return;
    }
    setTestStatus('loading');
    try {
      const res = await sendTelegramMessage(
        tgConfig.botToken,
        tgConfig.chatId,
        "<b>🛡️ سیستم امنیتی تیسا</b>\nارتباط با دیتابیس رمزنگاری شده برقرار است."
      );
      setTestStatus(res.ok ? 'success' : 'error');
    } catch (e) {
      setTestStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 font-['Vazirmatn']">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">پیکربندی سیستم</h2>
          <p className="text-slate-500 font-medium">مدیریت زیرساخت و امنیت داده‌ها</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black">
              {user?.username.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">{user?.username}</h3>
              <p className="text-emerald-600 text-xs font-black uppercase">وضعیت: رمزنگاری شده (AES-Mode)</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
             <span className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">🤖</span>
             تنظیمات هسته تلگرام
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase mr-2 tracking-widest">Bot Token</label>
              <input 
                type="password"
                value={tgConfig.botToken}
                onChange={e => setTgConfig({...tgConfig, botToken: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                placeholder="748392..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase mr-2 tracking-widest">Chat ID</label>
              <input 
                type="text"
                value={tgConfig.chatId}
                onChange={e => setTgConfig({...tgConfig, chatId: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                placeholder="12345678"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleSave} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
              تثبیت و ذخیره نهایی
            </button>
            <button onClick={handleTestConnection} disabled={testStatus === 'loading'} className="px-10 py-5 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all border border-slate-100">
              تست اتصال زنده
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
