
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Check, CheckStatus, AuditLog } from '../types';

interface DashboardProps {
  checks: Check[];
  logs: AuditLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ checks }) => {
  const totalAmount = checks.reduce((sum, c) => sum + c.amount, 0);
  const statusCounts = checks.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#94a3b8'];
  const recentChecks = [...checks].reverse().slice(0, 5);

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard title="کل مبلغ" value={totalAmount.toLocaleString('fa-IR')} icon="💰" color="bg-indigo-50 text-indigo-600" />
        <StatCard title="در انتظار" value={statusCounts[CheckStatus.PENDING]?.toString() || '۰'} icon="⏳" color="bg-amber-50 text-amber-600" />
        <StatCard title="سررسید نزدیک" value={statusCounts[CheckStatus.NEAR_DUE]?.toString() || '۰'} icon="🔔" color="bg-orange-50 text-orange-600" />
        <StatCard title="وصول شده" value={statusCounts[CheckStatus.CLEARED]?.toString() || '۰'} icon="✅" color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-base lg:text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
            توزیع وضعیت چک‌ها
          </h3>
          <div className="h-64 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-4 lg:p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-base lg:text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
            وضعیت لحظه‌ای
          </h3>
          <div className="space-y-4">
             {recentChecks.map(check => (
               <div key={check.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{check.bankName}</span>
                    <span className="text-xs font-black text-slate-700">{check.amount.toLocaleString('fa-IR')} ریال</span>
                  </div>
                  <StatusBadge status={check.status} />
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Recent Checks (Responsive List/Table) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-bold">آخرین چک‌ها</h3>
          <button className="text-indigo-600 text-xs font-bold">مشاهده همه</button>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">شماره</th>
                <th className="px-6 py-4">صادرکننده</th>
                <th className="px-6 py-4">مبلغ</th>
                <th className="px-6 py-4">سررسید</th>
                <th className="px-6 py-4">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentChecks.map(check => (
                <tr key={check.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold">{check.checkNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{check.issuerName}</td>
                  <td className="px-6 py-4 text-sm font-black text-indigo-600">{check.amount.toLocaleString('fa-IR')}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{check.dueDate}</td>
                  <td className="px-6 py-4"><StatusBadge status={check.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-slate-50">
          {recentChecks.map(check => (
            <div key={check.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-black text-slate-800">{check.checkNumber}</span>
                <StatusBadge status={check.status} />
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">صادرکننده:</span>
                <span className="text-slate-700">{check.issuerName}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">مبلغ:</span>
                <span className="text-indigo-600 font-bold">{check.amount.toLocaleString('fa-IR')} ریال</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: string, color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 lg:gap-6">
    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-xl lg:text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-[10px] lg:text-xs font-bold mb-1 uppercase">{title}</p>
      <p className="text-lg lg:text-xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export const StatusBadge: React.FC<{ status: CheckStatus }> = ({ status }) => {
  const styles: Record<CheckStatus, string> = {
    [CheckStatus.PENDING]: 'bg-slate-100 text-slate-600',
    [CheckStatus.NEAR_DUE]: 'bg-amber-100 text-amber-700',
    [CheckStatus.CLEARED]: 'bg-emerald-100 text-emerald-700',
    [CheckStatus.BOUNCED]: 'bg-red-100 text-red-700',
    [CheckStatus.VOIDED]: 'bg-slate-200 text-slate-400',
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-[9px] lg:text-[10px] font-black whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Dashboard;
