
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Fix: Use namespace import for react-router-dom to handle environment-specific export issues where named exports are not detected
import * as ReactRouterDOM from 'react-router-dom';
const { HashRouter, Routes, Route, Link, useNavigate, useLocation } = ReactRouterDOM as any;

import { ICONS, APP_NAME } from './constants';
import { Check, CheckStatus, AuditLog, User, Notification, CheckHistoryEntry, TelegramConfig } from './types';
import Dashboard from './pages/Dashboard';
import RegisterCheck from './pages/RegisterCheck';
import CheckList from './pages/CheckList';
import GeminiLab from './pages/GeminiLab';
import Forecaster from './pages/Forecaster';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { 
  sendTelegramMessage, 
  formatNewCheckMessage, 
  formatStatusUpdateMessage, 
  formatAlertMessage 
} from './services/telegramService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Initialize data
  useEffect(() => {
    const savedChecks = localStorage.getItem('tisa_checks');
    if (savedChecks) {
      setChecks(JSON.parse(savedChecks));
    } else {
      const initial: Check[] = [
        {
          id: '1',
          checkNumber: '44521098',
          amount: 250000000,
          bankName: 'بانک ملی ایران',
          issuerName: 'علی رضایی',
          receiverName: 'شرکت فناوران تیسا',
          issueDate: '1402/10/01',
          dueDate: '1403/02/15',
          status: CheckStatus.PENDING,
          createdAt: new Date().toISOString(),
          history: [
            {
              id: 'h1',
              fromStatus: 'ثبت اولیه',
              toStatus: CheckStatus.PENDING,
              timestamp: new Date().toLocaleString('fa-IR'),
              userId: 'system'
            }
          ]
        }
      ];
      setChecks(initial);
      localStorage.setItem('tisa_checks', JSON.stringify(initial));
    }

    const savedNotifs = localStorage.getItem('tisa_notifs');
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }

    const savedUser = localStorage.getItem('tisa_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('tisa_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (user) localStorage.setItem('tisa_user', JSON.stringify(user));
  }, [user]);

  const dispatchTelegram = useCallback((message: string) => {
    if (user?.telegram?.botToken && user?.telegram?.chatId) {
      sendTelegramMessage(user.telegram.botToken, user.telegram.chatId, message);
    }
  }, [user]);

  useEffect(() => {
    if (checks.length === 0) return;
    const newNotifs: Notification[] = [];
    
    checks.forEach(check => {
      if (check.status === CheckStatus.NEAR_DUE && !notifications.find(n => n.id === `nd-${check.id}`)) {
        const title = 'هشدار سررسید نزدیک';
        const msg = `چک شماره ${check.checkNumber} به مبلغ ${check.amount.toLocaleString('fa-IR')} ریال در شرف سررسید است.`;
        newNotifs.push({
          id: `nd-${check.id}`, title, message: msg, type: 'WARNING', timestamp: new Date().toLocaleTimeString('fa-IR'), isRead: false
        });
        if (user?.telegram?.autoReminders) {
          dispatchTelegram(formatAlertMessage(check, 'NEAR_DUE'));
        }
      }
      if (check.status === CheckStatus.BOUNCED && !notifications.find(n => n.id === `bn-${check.id}`)) {
        const title = 'خطای بحرانی: چک برگشتی';
        const msg = `چک شماره ${check.checkNumber} توسط بانک برگشت خورد. اقدام فوری لازم است.`;
        newNotifs.push({
          id: `bn-${check.id}`, title, message: msg, type: 'CRITICAL', timestamp: new Date().toLocaleTimeString('fa-IR'), isRead: false
        });
        dispatchTelegram(formatAlertMessage(check, 'BOUNCED'));
      }
    });

    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev].slice(0, 30));
    }
  }, [checks, user, dispatchTelegram, notifications]);

  const handleUpdateTelegram = (config: TelegramConfig) => {
    if (user) {
      setUser({ ...user, telegram: config });
    }
  };

  const handleAddCheck = (newCheck: Omit<Check, 'id' | 'createdAt' | 'history'>) => {
    const timestamp = new Date().toLocaleString('fa-IR');
    const check: Check = {
      ...newCheck,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      history: [
        {
          id: Date.now().toString(),
          fromStatus: 'ثبت اولیه',
          toStatus: newCheck.status,
          timestamp,
          userId: user?.username || 'مدیر'
        }
      ]
    };
    const updated = [...checks, check];
    setChecks(updated);
    localStorage.setItem('tisa_checks', JSON.stringify(updated));
    addLog(`ثبت چک جدید به شماره ${check.checkNumber}`);
    
    const notif: Notification = {
      id: `new-${check.id}`,
      title: 'ثبت چک جدید',
      message: `چک شماره ${check.checkNumber} با موفقیت در سامانه تیسا ثبت گردید.`,
      type: 'INFO',
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      isRead: false
    };
    setNotifications(prev => [notif, ...prev]);

    dispatchTelegram(formatNewCheckMessage(check, user?.username || 'مدیر سیستم'));
  };

  const handleUpdateStatus = (id: string, status: CheckStatus) => {
    const timestamp = new Date().toLocaleString('fa-IR');
    let oldStatus: CheckStatus | null = null;
    let targetCheck: Check | null = null;

    const updated = checks.map(c => {
      if (c.id === id) {
        oldStatus = c.status;
        const historyEntry: CheckHistoryEntry = {
          id: Date.now().toString(),
          fromStatus: c.status,
          toStatus: status,
          timestamp,
          userId: user?.username || 'کاربر'
        };
        targetCheck = { ...c, status, history: [historyEntry, ...c.history] };
        return targetCheck;
      }
      return c;
    });

    setChecks(updated);
    localStorage.setItem('tisa_checks', JSON.stringify(updated));
    addLog(`تغییر وضعیت چک شناسه ${id} به ${status}`);

    if (targetCheck && oldStatus) {
      dispatchTelegram(formatStatusUpdateMessage(targetCheck, oldStatus, status, user?.username || 'کاربر'));
    }
  };

  const addLog = (action: string) => {
    const log: AuditLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('fa-IR'),
      userId: user?.id || 'system',
      action,
      details: 'عملیات با موفقیت انجام شد'
    };
    setLogs(prev => [log, ...prev].slice(0, 50));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  // Sort notifications: CRITICAL first, then WARNING, then INFO
  const sortedNotifications = useMemo(() => {
    const priority = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    return [...notifications].sort((a, b) => priority[a.type] - priority[b.type]);
  }, [notifications]);

  if (!isAuthenticated) {
    return <Login onLogin={(u) => { setIsAuthenticated(true); setUser(u); }} />;
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir="rtl">
        <aside className="w-64 bg-white border-l border-slate-200 flex flex-col shadow-sm z-20">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">T</div>
            <h1 className="text-xl font-bold text-indigo-900 tracking-tight">{APP_NAME}</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <SidebarLink to="/" icon={<ICONS.Dashboard />} label="پیشخوان" />
            <SidebarLink to="/register" icon={<ICONS.Check />} label="ثبت چک" />
            <SidebarLink to="/list" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} label="لیست چک‌ها" />
            <SidebarLink to="/oracle" icon={<div className="text-xl">🔮</div>} label="رادار پیش‌گو" />
            <SidebarLink to="/ai" icon={<ICONS.Ai />} label="آزمایشگاه AI" />
            <SidebarLink to="/settings" icon={<ICONS.Settings />} label="تنظیمات" />
          </nav>
          <div className="p-4 border-t border-slate-100">
            <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <ICONS.Logout />
              <span>خروج از سامانه</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="font-medium text-slate-800">خوش آمدید، {user?.username}</span>
              <span className="h-4 w-px bg-slate-200"></span>
              <span>امروز: {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-4">
              {user?.telegram?.botToken && (
                 <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black border border-sky-100">
                   <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                   اتصال تلگرام فعال
                 </div>
              )}
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)} 
                className={`relative p-2.5 rounded-xl transition-all ${isNotifOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 border-2 border-white text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce z-10">
                    {unreadCount}
                  </span>
                )}
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </button>
              <div className="w-9 h-9 rounded-xl bg-slate-200 overflow-hidden border border-slate-300 shadow-sm">
                <img src={`https://picsum.photos/seed/${user?.id}/100/100`} alt="Avatar" />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<Dashboard checks={checks} logs={logs} />} />
              <Route path="/register" element={<RegisterCheck onAdd={handleAddCheck} />} />
              <Route path="/list" element={<CheckList checks={checks} onUpdateStatus={handleUpdateStatus} />} />
              <Route path="/oracle" element={<Forecaster checks={checks} />} />
              <Route path="/ai" element={<GeminiLab checks={checks} />} />
              <Route path="/settings" element={<Settings user={user} onUpdateTelegram={handleUpdateTelegram} />} />
            </Routes>
          </div>

          {/* New Advanced Notif Drawer */}
          {isNotifOpen && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md z-30 flex justify-end animate-in fade-in duration-300" onClick={() => setIsNotifOpen(false)}>
              <div 
                className="w-[420px] bg-white/95 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-500 overflow-hidden border-r border-white/20" 
                onClick={e => e.stopPropagation()}
              >
                {/* Drawer Header */}
                <div className="p-8 border-b bg-slate-900 text-white relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full"></div>
                   <div className="relative z-10 flex justify-between items-center">
                     <div>
                       <h3 className="text-xl font-black flex items-center gap-3">
                         مرکز فرماندهی هشدار
                         <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                       </h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 opacity-70">Tisa Intelligence Monitoring</p>
                     </div>
                     <button onClick={() => setIsNotifOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                   </div>
                </div>

                {/* Notif Controls */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                   <span className="text-xs font-black text-slate-500">{notifications.length} اعلان فعال</span>
                   <div className="flex gap-2">
                     <button onClick={markAllRead} className="text-[10px] font-black text-indigo-600 px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-all">خوانده شد</button>
                     <button onClick={clearNotifications} className="text-[10px] font-black text-red-600 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-all">پاکسازی</button>
                   </div>
                </div>

                {/* Notif List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {notifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      </div>
                      <h4 className="text-lg font-black text-slate-800">صندوق اعلانات خالی است</h4>
                      <p className="text-xs font-medium text-slate-500 mt-2">تمامی هشدارها با موفقیت مدیریت شده‌اند.</p>
                    </div>
                  ) : (
                    sortedNotifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`group relative p-5 rounded-3xl border transition-all duration-300 hover:scale-[1.02] ${
                          n.type === 'CRITICAL' ? 'bg-red-50/40 border-red-100 shadow-[0_10px_30px_rgba(239,68,68,0.1)]' :
                          n.type === 'WARNING' ? 'bg-amber-50/40 border-amber-100 shadow-[0_10px_30px_rgba(245,158,11,0.05)]' :
                          'bg-indigo-50/40 border-indigo-100 shadow-sm'
                        } ${!n.isRead ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                      >
                        <div className="flex gap-4 items-start">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm ${
                             n.type === 'CRITICAL' ? 'bg-red-600 text-white' :
                             n.type === 'WARNING' ? 'bg-amber-500 text-white' :
                             'bg-indigo-600 text-white'
                           }`}>
                             {n.type === 'CRITICAL' ? '🚨' : n.type === 'WARNING' ? '⚠️' : 'ℹ️'}
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-center mb-1">
                               <h4 className={`text-sm font-black truncate ${
                                 n.type === 'CRITICAL' ? 'text-red-900' :
                                 n.type === 'WARNING' ? 'text-amber-900' :
                                 'text-slate-800'
                               }`}>{n.title}</h4>
                               <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                             </div>
                             <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-3">
                               {n.message}
                             </p>
                             <div className="flex justify-end">
                               {n.type === 'CRITICAL' && (
                                 <button className="text-[9px] font-black bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors uppercase tracking-widest">اقدام فوری</button>
                               )}
                               {n.type === 'WARNING' && (
                                 <button className="text-[9px] font-black bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors uppercase tracking-widest">بررسی جزییات</button>
                               )}
                             </div>
                           </div>
                        </div>
                        {!n.isRead && (
                          <div className="absolute top-4 left-4 w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Drawer Footer */}
                <div className="p-6 bg-slate-900 text-center">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Tisa Intelligence Engine v3.1</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </HashRouter>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default App;
