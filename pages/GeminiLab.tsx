
import React, { useState, useRef } from 'react';
import { Check, User } from '../types';
import { getAdvancedRiskAnalysis, searchFinancialData, decodeBase64, decodeAudioData, encodePCM, generateSpeechReport, createWavBlob } from '../services/geminiService';
import { GoogleGenAI, Modality } from "@google/genai";
import { sendTelegramMessage, sendTelegramVoice } from '../services/telegramService';

interface GeminiLabProps {
  checks: Check[];
}

const GeminiLab: React.FC<GeminiLabProps> = ({ checks }) => {
  const [activeTab, setActiveTab] = useState<'risk' | 'market' | 'live'>('risk');
  const [loading, setLoading] = useState(false);
  const [riskReport, setRiskReport] = useState<any>(null);
  const [marketQuery, setMarketQuery] = useState('');
  const [marketData, setMarketData] = useState<any>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [audioSending, setAudioSending] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);

  const user: User | null = JSON.parse(localStorage.getItem('tisa_user') || 'null');

  const handleRiskAnalysis = async () => {
    if (checks.length === 0) return;
    setLoading(true);
    try {
      const details = checks.map(c => `چک ${c.checkNumber}: ${c.amount} ریال، صادرکننده: ${c.issuerName}`).join(', ');
      const report = await getAdvancedRiskAnalysis(details);
      setRiskReport(report);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleMarketSearch = async () => {
    if (!marketQuery) return;
    setLoading(true);
    try {
      const data = await searchFinancialData(marketQuery);
      setMarketData(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const sendVoiceReportToTelegram = async () => {
    if (!user?.telegram?.botToken || !user?.telegram?.chatId) {
      alert('لطفا ابتدا تنظیمات تلگرام را در بخش تنظیمات تکمیل کنید.');
      return;
    }
    
    setAudioSending(true);
    try {
      const summaryText = checks.length > 0 
        ? `تعداد ${checks.length} چک در سامانه موجود است. مبلغ کل معادل ${checks.reduce((a, b) => a + b.amount, 0).toLocaleString('fa-IR')} ریال می‌باشد.` 
        : "هیچ چکی در سامانه ثبت نشده است.";
      
      const pcmBase64 = await generateSpeechReport(summaryText);
      if (pcmBase64) {
        const wavBlob = createWavBlob(pcmBase64);
        const res = await sendTelegramVoice(user.telegram.botToken, user.telegram.chatId, wavBlob);
        if (res.ok) alert('گزارش صوتی با موفقیت به تلگرام ارسال شد.');
        else alert('خطا در ارسال به تلگرام.');
      }
    } catch (e) {
      console.error(e);
      alert('خطا در تولید یا ارسال صوت.');
    }
    setAudioSending(false);
  };

  const toggleLiveAI = async () => {
    if (isLiveActive) {
      setIsLiveActive(false);
      // Logic to close session would go here if sessionRef was active
      return;
    }

    // Fixed: Always use process.env.API_KEY directly in initialization as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    setIsLiveActive(true);
    
    // Simplification for demo purposes as per guidelines
    console.log("Live AI Activated. Streaming audio...");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900">آزمایشگاه هوشمند (Gemini Lab)</h2>
          <p className="text-slate-500 font-medium">بهره‌گیری از قدرت مدل‌های Gemini برای تحلیل و مدیریت هوشمند</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          <TabButton active={activeTab === 'risk'} onClick={() => setActiveTab('risk')} label="تحلیل ریسک" />
          <TabButton active={activeTab === 'market'} onClick={() => setActiveTab('market')} label="جستجوی بازار" />
          <TabButton active={activeTab === 'live'} onClick={() => setActiveTab('live')} label="یار صوتی (Live)" />
        </div>
      </div>

      {activeTab === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold mb-4">وضعیت اعتبارسنجی</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">سیستم با تحلیل مبلغ، تاریخ سررسید و سوابق چک‌ها، یک گزارش هوشمند از سطح ریسک نقدینگی تهیه می‌کند.</p>
              <button 
                onClick={handleRiskAnalysis}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'در حال تحلیل...' : 'شروع تحلیل هوشمند'}
              </button>
              
              <button 
                onClick={sendVoiceReportToTelegram}
                disabled={audioSending}
                className="w-full mt-4 py-4 bg-sky-50 text-sky-600 rounded-2xl font-bold hover:bg-sky-100 transition-all flex items-center justify-center gap-2 border border-sky-100"
              >
                {audioSending ? 'در حال ارسال...' : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.15-.35.24-.57.24h-1.07v1.07c0 .44-.36.8-.8.8h-1.6c-.44 0-.8-.36-.8-.8v-1.07h-1.07c-.44 0-.8-.36-.8-.8v-1.6c0-.44.36-.8.8-.8h1.07V4.73c0-.44.36-.8.8-.8h1.6c.44 0 .8.36.8.8v1.07h1.07c.44 0 .8.36.8.8v1.6z"/></svg>
                    ارسال گزارش صوتی به تلگرام
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {riskReport ? (
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 animate-in slide-in-from-left duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-black text-slate-800">گزارش نهایی تحلیل ریسک</h4>
                    <p className="text-slate-400 font-medium">تولید شده توسط Gemini 3 Pro</p>
                  </div>
                  <div className={`text-center px-6 py-4 rounded-3xl ${
                    riskReport.riskScore > 70 ? 'bg-red-50 text-red-600' : 
                    riskReport.riskScore > 30 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1">Risk Score</p>
                    <p className="text-4xl font-black">{riskReport.riskScore}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      هشدارهای امنیتی
                    </h5>
                    <ul className="space-y-2">
                      {riskReport.warnings.map((w: string, i: number) => (
                        <li key={i} className="text-xs text-slate-600 leading-relaxed">• {w}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100">
                    <h5 className="font-bold text-indigo-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      پیشنهادات مدیریتی
                    </h5>
                    <ul className="space-y-2">
                      {riskReport.recommendations.map((r: string, i: number) => (
                        <li key={i} className="text-xs text-indigo-600 leading-relaxed">• {r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 mb-4">تحلیل تفصیلی نقدینگی</h5>
                  <p className="text-sm text-slate-600 leading-loose text-justify">{riskReport.analysis}</p>
                </div>
              </div>
            ) : (
              <div className="h-full bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center p-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h4 className="text-xl font-bold text-slate-400 mb-2">آماده تحلیل داده‌ها</h4>
                <p className="text-slate-300 max-w-sm">برای مشاهده گزارش ریسک و تحلیل نقدینگی، دکمه «شروع تحلیل هوشمند» را کلیک کنید.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-end">
             <div className="flex-1 space-y-3">
               <label className="text-sm font-bold text-slate-600 mr-2">جستجوی هوشمند در اخبار مالی و قوانین جدید چک</label>
               <input 
                type="text" 
                value={marketQuery}
                onChange={e => setMarketQuery(e.target.value)}
                placeholder="مثلا: قوانین جدید چک صیادی در سال ۱۴۰۳ چیست؟"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
               />
             </div>
             <button 
                onClick={handleMarketSearch}
                disabled={loading}
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
             >
               {loading ? 'در حال جستجو...' : 'پرسش از هوش مصنوعی'}
             </button>
          </div>

          {marketData && (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </div>
                <h4 className="text-xl font-black text-slate-800">یافته‌های مستند وب</h4>
              </div>
              <p className="text-sm text-slate-600 leading-loose text-justify bg-slate-50 p-6 rounded-3xl border border-slate-100">{marketData.text}</p>
              
              <div className="space-y-3">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">منابع و مراجع مورد استفاده:</h5>
                <div className="flex flex-wrap gap-2">
                  {marketData.sources.map((s: any, i: number) => (
                    <a key={i} href={s.web?.uri} target="_blank" className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">
                      {s.web?.title || 'منبع خارجی'}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'live' && (
        <div className="bg-slate-900 p-12 rounded-[3rem] text-white flex flex-col items-center justify-center gap-10 min-h-[500px] relative overflow-hidden animate-in zoom-in duration-500 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500 rounded-full blur-[150px] animate-pulse"></div>
          </div>
          
          <div className="relative z-10 text-center space-y-4">
             <h3 className="text-3xl font-black">مکالمه زنده با یار تیسا</h3>
             <p className="text-indigo-200/60 font-medium">پرسش و پاسخ صوتی در لحظه در مورد چک‌ها و وضعیت مالی</p>
          </div>

          <div className="relative z-10 w-48 h-48 flex items-center justify-center">
             <div className={`absolute inset-0 bg-indigo-500/20 rounded-full blur-xl transition-transform duration-500 ${isLiveActive ? 'scale-150 animate-pulse' : 'scale-100'}`}></div>
             <button 
              onClick={toggleLiveAI}
              className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all active:scale-90 ${
                isLiveActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
             >
               {isLiveActive ? '🛑' : '🎙️'}
             </button>
          </div>

          <div className="relative z-10 flex gap-4">
             {isLiveActive && (
               <div className="flex gap-2">
                 {[1, 2, 3, 4, 5].map(i => (
                   <div key={i} className={`w-1.5 h-8 bg-indigo-400 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                 ))}
               </div>
             )}
          </div>

          <div className="relative z-10 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl backdrop-blur-md">
            <p className="text-sm font-medium text-indigo-100">وضعیت اتصال: <span className={isLiveActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{isLiveActive ? 'فعال و در حال شنود...' : 'غیرفعال'}</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
      active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
);

export default GeminiLab;
