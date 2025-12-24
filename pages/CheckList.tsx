
import React, { useState } from 'react';
import { Check, CheckStatus, CheckHistoryEntry } from '../types';
import { StatusBadge } from './Dashboard';

interface CheckListProps {
  checks: Check[];
  onUpdateStatus: (id: string, status: CheckStatus) => void;
}

const CheckList: React.FC<CheckListProps> = ({ checks, onUpdateStatus }) => {
  const [filter, setFilter] = useState<string>('');
  const [selectedCheckForHistory, setSelectedCheckForHistory] = useState<Check | null>(null);
  
  const filtered = checks.filter(c => 
    c.checkNumber.includes(filter) || 
    c.issuerName.includes(filter) || 
    c.bankName.includes(filter)
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold">لیست جامع چک‌ها</h2>
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="جستجو در شماره چک، صادرکننده یا بانک..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full px-12 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <svg className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-400 font-medium">هیچ چکی یافت نشد</p>
          </div>
        ) : (
          filtered.map(check => (
            <div key={check.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-lg border border-slate-100">
                {check.bankName.substring(5, 7)}
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div>
                  <p className="text-xs text-slate-400 mb-1">شماره چک</p>
                  <p className="font-bold text-slate-800">{check.checkNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">صادرکننده</p>
                  <p className="font-medium text-slate-700">{check.issuerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">مبلغ</p>
                  <p className="font-bold text-indigo-600">{check.amount.toLocaleString('fa-IR')} ریال</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">تاریخ سررسید</p>
                  <p className="text-sm font-medium text-slate-600">{check.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedCheckForHistory(check)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  تاریخچه
                </button>
                <div className="h-8 w-px bg-slate-100"></div>
                <div className="flex flex-col gap-1">
                   <StatusBadge status={check.status} />
                   <select 
                    className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-medium outline-none bg-slate-50 focus:border-indigo-500"
                    value={check.status}
                    onChange={(e) => onUpdateStatus(check.id, e.target.value as CheckStatus)}
                  >
                    {Object.values(CheckStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* History Modal */}
      {selectedCheckForHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black mb-1">تاریخچه وقایع چک</h3>
                <p className="text-slate-400 text-sm">شماره چک: {selectedCheckForHistory.checkNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedCheckForHistory(null)}
                className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 max-h-[60vh]">
              <div className="space-y-8 relative">
                {/* Timeline vertical line */}
                <div className="absolute right-4 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                
                {selectedCheckForHistory.history.map((entry, idx) => (
                  <div key={entry.id} className="relative pr-12 group">
                    {/* Timeline dot */}
                    <div className={`absolute right-2 top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-125 ${
                      idx === 0 ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}></div>
                    
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 group-hover:border-indigo-100 group-hover:bg-white transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded uppercase">{entry.fromStatus}</span>
                          <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                          <StatusBadge status={entry.toStatus as CheckStatus} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">{entry.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <p className="text-slate-600 leading-relaxed font-medium">تغییر وضعیت چک توسط اپراتور در سامانه ثبت شد.</p>
                        <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-bold">
                           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                           {entry.userId}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-8 border-t border-slate-100 bg-slate-50 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">سامانه یکپارچه نظارت بر زنجیره چک - تیسا</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckList;
