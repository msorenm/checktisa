
import React, { useState } from 'react';
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
    alert('تنظیمات با موفقیت در سیستم ذخیره و پایدار شد.');
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

  const handleDownloadBackup = () => {
    const data = {
        checks: JSON.parse(localStorage.getItem('tisa_checks') || '[]'),
        notifs: JSON.parse(localStorage.getItem('tisa_notifs') || '[]'),
        user: JSON.parse(localStorage.getItem('tisa_user') || 'null')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tisa_backup_${new Date().toLocaleDateString('fa-IR')}.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <h2 className="text-2xl lg:text-3xl font-black text-slate-900">تنظیمات و امنیت</h2>

      <div className="grid grid-cols-1 gap-6 lg:gap-8">
        {/* Profile Card */}
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl lg:text-3xl font-bold">
            {user?.username.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">{user?.username}</h3>
            <p className="text-slate-500 text-sm font-medium">نقش کاربری: {user?.role === 'ADMIN' ? 'مدیر ارشد' : 'اپراتور'}</p>
          </div>
        </div>

        {/* Telegram Integration Card */}
        <div className="bg-white p-6 lg:p-10 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.441-.168.571-.532 1.398-.928 1.442-.86.096-1.513-.518-2.348-1.064-.827-.54-1.294-.875-2.094-1.4-.925-.608-.325-.942.202-1.488.138-.144 2.535-2.324 2.582-2.522.006-.025.011-.119-.045-.168-.056-.05-.138-.033-.198-.019-.084.019-1.433.911-4.045 2.673-.383.262-.73.39-1.04.381-.343-.01-.703-.197-1.047-.308-.423-.137-.758-.209-.728-.442.015-.121.182-.245.499-.372 1.948-.848 3.248-1.408 3.9-1.679 3.71-1.538 4.478-1.805 4.981-1.815.111-.002.359.025.521.157.136.111.173.261.182.378.009.117.001.24-.002.359z"/></svg>
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-800">اتصال به تلگرام</h4>
                <p className="text-slate-500 text-sm">ارسال لحظه‌ای وضعیت چک‌ها به ربات شخصی</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 mr-2 uppercase">Bot Token</label>
                <input 
                  type="password"
                  value={tgConfig.botToken}
                  onChange={e => setTgConfig({...tgConfig, botToken: e.target.value})}
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-sky-500 transition-all font-mono text-sm"
                  placeholder="توکن ربات را وارد کنید"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 mr-2 uppercase">Chat ID</label>
                <input 
                  type="text"
                  value={tgConfig.chatId}
                  onChange={e => setTgConfig({...tgConfig, chatId: e.target.value})}
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-sky-500 transition-all font-mono text-sm"
                  placeholder="آیدی عددی چت یا گروه"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleSave} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all">
                ذخیره تنظیمات
              </button>
              <button onClick={handleTestConnection} disabled={testStatus === 'loading'} className="px-8 py-4 bg-sky-50 text-sky-600 rounded-2xl font-black text-sm hover:bg-sky-100 transition-all">
                {testStatus === 'loading' ? 'در حال تست...' : 'تست اتصال'}
              </button>
            </div>
          </div>
        </div>

        {/* Backup Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                پشتیبان‌گیری از داده‌ها (Manual Backup)
            </h4>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-md">
                  تمامی داده‌های شما در حافظه محلی مرورگر (LocalStorage) ذخیره می‌شوند. برای جلوگیری از پاک شدن ناگهانی، پیشنهاد می‌شود نسخه پشتیبان را دانلود کنید.
                </p>
                <button onClick={handleDownloadBackup} className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all">
                  دانلود فایل پشتیبان (JSON)
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
