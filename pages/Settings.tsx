
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

  useEffect(() => {
    if (user?.telegram) {
      setTgConfig(user.telegram);
    }
  }, [user]);

  const handleSave = () => {
    if (!tgConfig.botToken || !tgConfig.chatId) {
      alert('خطا: فیلدهای الزامی توکن و چت‌آیدی نباید خالی باشند.');
      return;
    }
    onUpdateTelegram(tgConfig);
    alert('✅ سیستم تایید شد: تنظیمات در هسته دیتابیس رمزنگاری شده تثبیت گردید.');
  };

  const handleTestConnection = async () => {
    if (!tgConfig.botToken || !tgConfig.chatId) {
      alert('ابتدا فیلدها را پر کنید.');
      return;
    }
    setTestStatus('loading');
    try {
      const res = await sendTelegramMessage(
        tgConfig.botToken,
        tgConfig.chatId,
        "<b>⚡ تست پایداری تیسا</b>\nدیتابیس رمزنگاری شده با موفقیت به تلگرام متصل شد."
      );
      setTestStatus(res.ok ? 'success' : 'error');
      if (res.ok) alert('پیام تست ارسال شد. بات شما فعال است.');
    } catch (e) {
      setTestStatus('error');
    }
  };

  const handleFactoryReset = () => {
    if (confirm("🚨 هشدار بسیار جدی: این عمل کل دیتابیس رمزنگاری شده (چک‌ها و بات) را برای همیشه پاک می‌کند. آیا مطمئن هستید؟")) {
      SecureDB.factoryReset();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 font-['Vazirmatn']">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">مرکز کنترل و امنیت</h2>
          <p className="text-slate-500 font-medium mt-1">مدیریت لایه رمزنگاری و ارتباطات بات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Connection Status Card */}
        <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-200">
              {user?.username.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">{user?.username}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-600 uppercase">دیتابیس در وضعیت پایداری مطلق (Vault Protected)</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleFactoryReset}
            className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black hover:bg-red-600 hover:text-white transition-all border border-red-100 uppercase tracking-widest"
          >
            پاکسازی کل دیتابیس (Factory Reset)
          </button>
        </div>

        {/* Telegram Config Panel */}
        <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
            <div>
               <h4 className="text-xl font-black text-slate-800">هسته هوشمند تلگرام</h4>
               <p className="text-slate-400 text-sm font-medium">تنظیمات ربات برای ارسال آنی اعلانات به مدیریت</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase mr-3 tracking-widest">Telegram Bot Token</label>
              <input 
                type="password"
                value={tgConfig.botToken}
                onChange={e => setTgConfig({...tgConfig, botToken: e.target.value})}
                className="w-full px-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-mono text-sm"
                placeholder="Ex: 782910..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase mr-3 tracking-widest">Chat ID (Main Admin)</label>
              <input 
                type="text"
                value={tgConfig.chatId}
                onChange={e => setTgConfig({...tgConfig, chatId: e.target.value})}
                className="w-full px-6 py-5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-mono text-sm"
                placeholder="Ex: 12345678"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button 
              onClick={handleSave} 
              className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              ذخیره و تثبیت نهایی در دیتابیس
            </button>
            <button 
              onClick={handleTestConnection} 
              disabled={testStatus === 'loading'} 
              className="px-10 py-5 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all border border-slate-200 flex items-center justify-center gap-2"
            >
              {testStatus === 'loading' ? (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : 'تست اتصال زنده'}
            </button>
          </div>
        </div>

        {/* Persistence Confirmation */}
        <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] flex items-start gap-6">
           <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">🔒</div>
           <div>
              <h4 className="font-black text-indigo-900 text-lg mb-1">تضمین پایداری داده‌ها</h4>
              <p className="text-sm text-indigo-800/70 leading-relaxed font-medium">
                تمامی اطلاعات شما اکنون در لایه <b>Vault</b> ذخیره می‌شوند. بر خلاف نسخه‌های قبلی، خروج از سیستم (Logout) اطلاعات تلگرام یا چک‌های شما را پاک نمی‌کند. اطلاعات فقط با استفاده از دکمه «پاکسازی کل دیتابیس» یا پاک کردن دستی کش مرورگر از بین می‌رود.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
