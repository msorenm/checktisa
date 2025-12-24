
import React, { useState } from 'react';
import { Check, User } from '../types';
import { getStrategicRoadmap, generateSpeechReport, createWavBlob } from '../services/geminiService';
import { sendTelegramVoice } from '../services/telegramService';

interface ForecasterProps {
  checks: Check[];
}

const Forecaster: React.FC<ForecasterProps> = ({ checks }) => {
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [sendingVoice, setSendingVoice] = useState(false);

  const user: User | null = JSON.parse(localStorage.getItem('tisa_user') || 'null');

  const generateRoadmap = async () => {
    if (checks.length === 0) {
      alert('ابتدا چند چک در سامانه ثبت کنید.');
      return;
    }
    setLoading(true);
    try {
      const data = checks.map(c => `چک شماره ${c.checkNumber} مبلغ ${c.amount} تاریخ سررسید ${c.dueDate}`).join(' | ');
      const result = await getStrategicRoadmap(data);
      setRoadmap(result);
    } catch (e) {
      console.error(e);
      alert('خطا در تحلیل استراتژیک نقدینگی. لطفا دوباره تلاش کنید.');
    }
    setLoading(false);
  };

  const handleSendVoiceSummary = async () => {
    if (!roadmap || !user?.telegram?.botToken || !user?.telegram?.chatId) {
      alert('لطفا تنظیمات ربات تلگرام را در بخش تنظیمات تکمیل کنید.');
      return;
    }
    setSendingVoice(true);
    try {
      // تولید صوت با هوش مصنوعی
      const pcmBase64 = await generateSpeechReport(roadmap.summary);
      if (pcmBase64) {
        // تبدیل به فایل معتبر صوتی
        const audioBlob = createWavBlob(pcmBase64);
        // ارسال به تلگرام
        const res = await sendTelegramVoice(user.telegram.botToken, user.telegram.chatId, audioBlob);
        
        if (res.ok) {
          alert('🚀 پادکست استراتژیک نقدینگی با موفقیت برای مدیریت ارسال شد.');
        } else {
          alert('خطا در ارتباط با تلگرام. توکن یا Chat ID را بررسی کنید.');
        }
      } else {
        alert('هوش مصنوعی در حال حاضر قادر به تولید صوت نیست.');
      }
    } catch (e) {
      console.error(e);
      alert('خطای غیرمنتظره در تولید یا ارسال صوت.');
    }
    setSendingVoice(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* هدر پیشرفته رادار */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full -mr-64 -mt-64 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-black uppercase tracking-widest mb-6">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></span>
              Strategic Prediction Engine
            </div>
            <h2 className="text-5xl font-black mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-100">
              رادار پیش‌گو: <br/>مهندسی نقدینگی آینده
            </h2>
            <p className="text-indigo-200/60 leading-loose text-lg font-medium">
              این بخش با استفاده از <span className="text-white font-bold">Gemini 3 Pro</span> و الگوریتم‌های مدیریت مالی ارشد، ترافیک نقدینگی ۳۰ روزه شما را شبیه‌سازی کرده و نقاط انسداد مالی را پیش‌بینی می‌کند.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
             <button 
              onClick={generateRoadmap}
              disabled={loading}
              className={`group relative overflow-hidden px-14 py-6 bg-white text-slate-900 rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
             >
               <span className="relative z-10">{loading ? 'در حال شبیه‌سازی...' : 'فعال‌سازی رادار هوشمند'}</span>
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </button>
             {loading && (
               <div className="flex gap-1.5">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>

      {roadmap ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom duration-700">
          {/* پنل اصلی گزارش */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-1 h-full bg-indigo-600"></div>
               <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                      📊
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">گزارش استراتژیک نقدینگی</h3>
                      <p className="text-slate-400 text-sm font-medium">تحلیل ۳۰ روزه بر اساس چک‌های ثبت شده</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSendVoiceSummary}
                    disabled={sendingVoice}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-sm transition-all ${
                      sendingVoice ? 'bg-slate-100 text-slate-400' : 'bg-sky-50 text-sky-600 hover:bg-sky-100 shadow-sm shadow-sky-100'
                    }`}
                  >
                    {sendingVoice ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                        در حال ارسال پادکست...
                      </span>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                        ارسال گزارش صوتی به تلگرام
                      </>
                    )}
                  </button>
               </div>

               <div className="relative mb-10">
                 <div className="absolute inset-0 bg-indigo-600/5 blur-3xl rounded-full"></div>
                 <blockquote className="relative p-10 bg-slate-900 text-white rounded-[2rem] text-xl font-medium leading-loose italic text-center border border-white/5 shadow-2xl">
                    "{roadmap.summary}"
                    <div className="mt-6 flex justify-center gap-1">
                      {[1,2,3,4,5,6,7].map(i => (
                        <div key={i} className="w-1 h-4 bg-indigo-400/30 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                      ))}
                    </div>
                 </blockquote>
               </div>

               <div className="space-y-6">
                 <h4 className="font-black text-slate-800 text-lg flex items-center gap-2">
                   <span className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-sm">✅</span>
                   گام‌های پیشنهادی برای عبور از بحران
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {roadmap.actionPlan.map((step: string, i: number) => (
                     <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-white transition-all group">
                       <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 leading-relaxed">
                         <span className="text-indigo-300 ml-2">#{i+1}</span>
                         {step}
                       </p>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>

          {/* نوار کناری بحران‌ها */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                نقاط اصطکاک مالی
              </h3>
              
              <div className="space-y-4">
                {roadmap.criticalDates.map((cd: any, i: number) => (
                  <div key={i} className={`p-6 rounded-3xl border transition-all hover:scale-[1.02] ${
                    cd.severity === 'HIGH' 
                      ? 'bg-red-50/50 border-red-100 border-r-8 border-r-red-600' 
                      : 'bg-amber-50/50 border-amber-100 border-r-8 border-r-amber-500'
                  }`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-black text-slate-800">{cd.date}</span>
                      <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                        cd.severity === 'HIGH' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {cd.severity === 'HIGH' ? 'Critical' : 'Alert'}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed">{cd.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-xl">
               <h4 className="font-black mb-4">امنیت رادار</h4>
               <p className="text-xs text-indigo-100/70 leading-relaxed mb-6">
                 تمامی تحلیل‌ها به صورت محلی و با استفاده از رمزنگاری بانکی انجام می‌شود. داده‌های شما صرفاً جهت تحلیل به سرورهای ایمن Gemini ارسال می‌گردد.
               </p>
               <div className="flex items-center gap-3 text-[10px] font-black opacity-50 uppercase tracking-widest">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                 Trusted by Tisa Enterprise
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[500px] bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center p-20 text-center animate-pulse">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
             <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </div>
           <h3 className="text-2xl font-black text-slate-300 mb-4">سیستم در انتظار فرمان فعال‌سازی</h3>
           <p className="text-slate-200 max-w-md mx-auto leading-relaxed">
             دکمه «فعال‌سازی رادار هوشمند» را کلیک کنید تا موتور پیش‌بینی تیسا بر اساس داده‌های موجود، نقشه راه مالی شما را ترسیم کند.
           </p>
        </div>
      )}
    </div>
  );
};

export default Forecaster;
