
import React, { useState } from 'react';
import { Check, CheckStatus } from '../types';
import { BANK_LIST } from '../constants';
import { analyzeCheckImage } from '../services/geminiService';

interface RegisterCheckProps {
  onAdd: (check: Omit<Check, 'id' | 'createdAt' | 'history'>) => void;
}

const RegisterCheck: React.FC<RegisterCheckProps> = ({ onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    checkNumber: '',
    amount: '',
    bankName: BANK_LIST[0],
    issuerName: '',
    receiverName: '',
    issueDate: '',
    dueDate: '',
    status: CheckStatus.PENDING
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const extracted = await analyzeCheckImage(base64);
        setFormData(prev => ({ ...prev, checkNumber: extracted.checkNumber || prev.checkNumber, amount: extracted.amount?.toString() || prev.amount, issuerName: extracted.issuer || prev.issuerName, dueDate: extracted.dueDate || prev.dueDate }));
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setLoading(false);
      alert('خطا در تحلیل تصویر');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.checkNumber || !formData.amount || !formData.dueDate) {
      alert('فیلدهای ستاره‌دار اجباری هستند');
      return;
    }
    onAdd({ ...formData, amount: Number(formData.amount) });
    alert('چک با موفقیت ثبت شد');
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom duration-500">
      <div className="bg-white p-5 lg:p-8 rounded-[2rem] lg:rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl lg:text-2xl font-black text-slate-800">ثبت چک جدید</h2>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-tighter">Enter Check Assets</p>
          </div>
          <label className="w-full sm:w-auto cursor-pointer bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {loading ? 'پردازش هوش مصنوعی...' : 'اسکن چک (AI)'}
          </label>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <Input label="شماره چک *" value={formData.checkNumber} onChange={val => setFormData({...formData, checkNumber: val})} placeholder="مثلا: 12345678" />
          <Input label="مبلغ (ریال) *" type="number" value={formData.amount} onChange={val => setFormData({...formData, amount: val})} placeholder="مثلا: 500,000,000" />
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-500 mr-2">بانک صادرکننده</label>
            <select 
              className="px-4 py-3.5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-slate-50 font-bold text-sm"
              value={formData.bankName}
              onChange={e => setFormData({...formData, bankName: e.target.value})}
            >
              {BANK_LIST.map(bank => <option key={bank} value={bank}>{bank}</option>)}
            </select>
          </div>

          <Input label="نام صادرکننده" value={formData.issuerName} onChange={val => setFormData({...formData, issuerName: val})} placeholder="نام کامل صادرکننده" />
          <Input label="در وجه" value={formData.receiverName} onChange={val => setFormData({...formData, receiverName: val})} placeholder="نام دریافت‌کننده" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="تاریخ صدور" value={formData.issueDate} onChange={val => setFormData({...formData, issueDate: val})} placeholder="140x/xx/xx" />
            <Input label="سررسید *" value={formData.dueDate} onChange={val => setFormData({...formData, dueDate: val})} placeholder="140x/xx/xx" />
          </div>

          <div className="md:col-span-2 pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3 lg:gap-4">
            <button type="button" className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-slate-500 font-black text-sm hover:bg-slate-50 transition-all uppercase tracking-widest">انصراف</button>
            <button type="submit" className="w-full sm:w-auto px-12 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest">تایید نهایی و ثبت</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string }> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-tighter">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-4 py-3.5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-slate-50 font-bold text-sm"
    />
  </div>
);

export default RegisterCheck;
