
import React, { useState } from 'react';
import { Check, CheckStatus } from '../types';
import { BANK_LIST } from '../constants';
import { analyzeCheckImage } from '../services/geminiService';

interface RegisterCheckProps {
  // Fixed: Update onAdd signature to omit 'history' which is added in App.tsx during creation
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
        setFormData(prev => ({
          ...prev,
          checkNumber: extracted.checkNumber || prev.checkNumber,
          amount: extracted.amount?.toString() || prev.amount,
          issuerName: extracted.issuer || prev.issuerName,
          dueDate: extracted.dueDate || prev.dueDate
        }));
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert('خطا در تحلیل تصویر چک. لطفا فیلدها را دستی پر کنید.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.checkNumber || !formData.amount || !formData.dueDate) {
      alert('لطفا اطلاعات اجباری را تکمیل کنید');
      return;
    }
    // Fixed: Passing the check data without id, createdAt, or history as per the updated prop type
    onAdd({
      ...formData,
      amount: Number(formData.amount)
    });
    setFormData({
      checkNumber: '',
      amount: '',
      bankName: BANK_LIST[0],
      issuerName: '',
      receiverName: '',
      issueDate: '',
      dueDate: '',
      status: CheckStatus.PENDING
    });
    alert('چک با موفقیت ثبت شد');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">ثبت چک جدید</h2>
            <p className="text-slate-500 text-sm">اطلاعات برگه چک را با دقت وارد کنید</p>
          </div>
          <label className="cursor-pointer bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {loading ? 'در حال تحلیل...' : 'استخراج از تصویر (AI)'}
          </label>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="شماره چک *" value={formData.checkNumber} onChange={val => setFormData({...formData, checkNumber: val})} placeholder="مثلا: 12345678" />
          <Input label="مبلغ (ریال) *" type="number" value={formData.amount} onChange={val => setFormData({...formData, amount: val})} placeholder="مثلا: 500,000,000" />
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">بانک صادرکننده</label>
            <select 
              className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
              value={formData.bankName}
              onChange={e => setFormData({...formData, bankName: e.target.value})}
            >
              {BANK_LIST.map(bank => <option key={bank} value={bank}>{bank}</option>)}
            </select>
          </div>

          <Input label="نام صادرکننده" value={formData.issuerName} onChange={val => setFormData({...formData, issuerName: val})} placeholder="نام کامل صادرکننده چک" />
          <Input label="در وجه" value={formData.receiverName} onChange={val => setFormData({...formData, receiverName: val})} placeholder="نام دریافت‌کننده" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="تاریخ صدور" value={formData.issueDate} onChange={val => setFormData({...formData, issueDate: val})} placeholder="1402/xx/xx" />
            <Input label="تاریخ سررسید *" value={formData.dueDate} onChange={val => setFormData({...formData, dueDate: val})} placeholder="1403/xx/xx" />
          </div>

          <div className="md:col-span-2 pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button type="button" className="px-8 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-all">انصراف</button>
            <button type="submit" className="px-12 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">تایید و ثبت چک</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string }> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-slate-700">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50"
    />
  </div>
);

export default RegisterCheck;
