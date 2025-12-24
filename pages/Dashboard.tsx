
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Check, CheckStatus, AuditLog } from '../types';

interface DashboardProps {
  checks: Check[];
  logs: AuditLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ checks, logs }) => {
  const totalAmount = checks.reduce((sum, c) => sum + c.amount, 0);
  const statusCounts = checks.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#94a3b8'];

  const recentChecks = [...checks].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="کل مبلغ در جریان" value={totalAmount.toLocaleString('fa-IR') + ' ریال'} icon="💰" color="bg-indigo-50 text-indigo-600" />
        <StatCard title="چک‌های در انتظار" value={statusCounts[CheckStatus.PENDING]?.toString() || '۰'} icon="⏳" color="bg-amber-50 text-amber-600" />
        <StatCard title="نزدیک به سررسید" value={statusCounts[CheckStatus.NEAR_DUE]?.toString() || '۰'} icon="🔔" color="bg-orange-50 text-orange-600" />
        <StatCard title="وصول شده (ماه جاری)" value={statusCounts[CheckStatus.CLEARED]?.toString() || '۰'} icon="✅" color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
            توزیع وضعیت چک‌ها
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
            گزارش فعالیت‌های اخیر
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[320px] pr-2">
            {logs.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10">هیچ فعالیتی ثبت نشده است</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex gap-4 items-start border-r-2 border-slate-100 pr-4 relative">
                  <div className="absolute -right-1.5 top-0 w-3 h-3 bg-slate-200 rounded-full border-2 border-white"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{log.action}</p>
                    <p className="text-xs text-slate-400">{log.timestamp} - {log.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Checks Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-bold">آخرین چک‌های ثبت شده</h3>
          <button className="text-indigo-600 text-sm font-medium hover:underline">مشاهده همه</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">شماره چک</th>
                <th className="px-6 py-4 font-medium">صادرکننده</th>
                <th className="px-6 py-4 font-medium">مبلغ (ریال)</th>
                <th className="px-6 py-4 font-medium">سررسید</th>
                <th className="px-6 py-4 font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentChecks.map(check => (
                <tr key={check.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{check.checkNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{check.issuerName}</td>
                  <td className="px-6 py-4 text-sm font-medium text-indigo-600">{check.amount.toLocaleString('fa-IR')}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{check.dueDate}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={check.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: string, color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-sm mb-1">{title}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export const StatusBadge: React.FC<{ status: CheckStatus }> = ({ status }) => {
  const styles: Record<CheckStatus, string> = {
    [CheckStatus.PENDING]: 'bg-slate-100 text-slate-600',
    [CheckStatus.NEAR_DUE]: 'bg-amber-100 text-amber-700',
    [CheckStatus.CLEARED]: 'bg-emerald-100 text-emerald-700',
    [CheckStatus.BOUNCED]: 'bg-red-100 text-red-700',
    [CheckStatus.VOIDED]: 'bg-slate-200 text-slate-400 line-through',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Dashboard;
