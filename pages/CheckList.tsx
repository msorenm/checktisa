
import React, { useState } from 'react';
import { Check, CheckStatus } from '../types';
import { StatusBadge } from './Dashboard';

interface CheckListProps {
  checks: Check[];
  onUpdateStatus: (id: string, status: CheckStatus) => void;
}

const CheckList: React.FC<CheckListProps> = ({ checks, onUpdateStatus }) => {
  const [filter, setFilter] = useState<string>('');
  const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);
  
  const filtered = checks.filter(c => c.checkNumber.includes(filter) || c.issuerName.includes(filter) || c.bankName.includes(filter));

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">مدیریت متمرکز چک‌ها</h2>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Total Checks Inventory</p>
        </div>
        <div className="relative w-full lg:w-96">
          <input 
            type="text" 
            placeholder="جستجو در چک‌ها..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full px-12 py-3.5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white font-bold text-sm"
          />
          <svg className="absolute right-4 top-4 w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-sm">موردی یافت نشد</p>
          </div>
        ) : (
          filtered.map(check => (
            <div key={check.id} className="bg-white p-5 lg:p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-center gap-6">
              <div className="hidden lg:flex w-16 h-16 bg-slate-50 rounded-2xl items-center justify-center text-indigo-600 font-black text-lg border border-slate-100">
                {check.bankName.substring(5, 7)}
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <div className="flex lg:flex-col justify-between items-center lg:items-start p-2 lg:p-0">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">شماره چک</p>
                  <p className="font-black text-slate-800 text-sm lg:text-base">{check.checkNumber}</p>
                </div>
                <div className="flex lg:flex-col justify-between items-center lg:items-start p-2 lg:p-0 border-t lg:border-t-0 border-slate-50">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">صادرکننده</p>
                  <p className="font-bold text-slate-700 text-sm">{check.issuerName}</p>
                </div>
                <div className="flex lg:flex-col justify-between items-center lg:items-start p-2 lg:p-0 border-t lg:border-t-0 border-slate-50">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">مبلغ نهایی</p>
                  <p className="font-black text-indigo-600 text-sm">{check.amount.toLocaleString('fa-IR')} ریال</p>
                </div>
                <div className="flex lg:flex-col justify-between items-center lg:items-start p-2 lg:p-0 border-t lg:border-t-0 border-slate-50">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">سررسید</p>
                  <p className="text-sm font-black text-slate-600">{check.dueDate}</p>
                </div>
              </div>
              <div className="flex w-full lg:w-auto items-center justify-between lg:justify-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <button 
                  onClick={() => setSelectedCheck(check)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-[11px] font-black text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  تاریخچه
                </button>
                <div className="flex flex-col gap-1 items-end">
                   <StatusBadge status={check.status} />
                   <select 
                    className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-black outline-none bg-slate-50 focus:border-indigo-500 transition-all mt-1"
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

      {/* History Modal (Responsive) */}
      {selectedCheck && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-2xl h-full sm:h-auto sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-6 lg:p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg lg:text-xl font-black mb-1">تاریخچه وقایع چک</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Event Logs: {selectedCheck.checkNumber}</p>
              </div>
              <button onClick={() => setSelectedCheck(null)} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 max-h-[70vh]">
              <div className="space-y-6 relative">
                <div className="absolute right-4 top-2 bottom-2 w-0.5 bg-slate-100 hidden sm:block"></div>
                {selectedCheck.history.map((entry, idx) => (
                  <div key={entry.id} className="relative sm:pr-12">
                    <div className={`hidden sm:block absolute right-2 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${idx === 0 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                    <div className="bg-slate-50 p-4 lg:p-5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded uppercase">{entry.fromStatus}</span>
                          <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                          <StatusBadge status={entry.toStatus as CheckStatus} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{entry.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-medium">
                        <p className="text-slate-600">تغییر وضعیت در سیستم ثبت شد.</p>
                        <span className="text-indigo-600 font-black">{entry.userId}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckList;
