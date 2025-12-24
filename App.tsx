
import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { HashRouter, Routes, Route, Link, useLocation } = ReactRouterDOM as any;

import { ICONS, APP_NAME } from './constants';
import { Check, CheckStatus, User, Notification, CheckHistoryEntry, TelegramConfig } from './types';
import Dashboard from './pages/Dashboard';
import RegisterCheck from './pages/RegisterCheck';
import CheckList from './pages/CheckList';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { 
  sendTelegramMessage, 
  formatNewCheckMessage 
} from './services/telegramService';

const App: React.FC = () => {
  // بازیابی وضعیت احراز هویت از حافظه برای جلوگیری از خروج با رفرش
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('tisa_auth') === 'true';
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tisa_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [checks, setChecks] = useState<Check[]>(() => {
    const saved = localStorage.getItem('tisa_checks');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('tisa_notifs');
    return saved ? JSON.parse(saved) : [];
  });

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // همگام‌سازی دائمی با LocalStorage در صورت تغییر هر وضعیت
  useEffect(() => {
    localStorage.setItem('tisa_checks', JSON.stringify(checks));
  }, [checks]);

  useEffect(() => {
    localStorage.setItem('tisa_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('tisa_auth', isAuthenticated.toString());
    if (user) localStorage.setItem('tisa_user', JSON.stringify(user));
    else localStorage.removeItem('tisa_user');
  }, [isAuthenticated, user]);

  const dispatchTelegram = useCallback((message: string) => {
    if (user?.telegram?.botToken && user?.telegram?.chatId) {
      sendTelegramMessage(user.telegram.botToken, user.telegram.chatId, message);
    }
  }, [user]);

  const handleUpdateStatus = (id: string, status: CheckStatus) => {
    const updated = checks.map(c => {
      if (c.id === id) {
        const historyEntry: CheckHistoryEntry = {
          id: Date.now().toString(),
          fromStatus: c.status,
          toStatus: status,
          timestamp: new Date().toLocaleString('fa-IR'),
          userId: user?.username || 'کاربر'
        };
        return { ...c, status, history: [historyEntry, ...c.history] };
      }
      return c;
    });
    setChecks(updated);
  };

  const handleAddCheck = (newCheck: Omit<Check, 'id' | 'createdAt' | 'history'>) => {
    const check: Check = {
      ...newCheck,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      history: [{ 
        id: Date.now().toString(), 
        fromStatus: 'ثبت اولیه' as any, 
        toStatus: newCheck.status, 
        timestamp: new Date().toLocaleString('fa-IR'), 
        userId: user?.username || 'مدیر' 
      }]
    };
    setChecks(prev => [...prev, check]);
    dispatchTelegram(formatNewCheckMessage(check, user?.username || 'مدیر سیستم'));
  };

  const handleUpdateTelegram = (config: TelegramConfig) => {
    if (user) {
      const updatedUser = { ...user, telegram: config };
      setUser(updatedUser);
      // بلافاصله در استوریج ذخیره می‌شود به دلیل useEffect بالا
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('tisa_auth');
    localStorage.removeItem('tisa_user');
  };

  if (!isAuthenticated) return <Login onLogin={(u) => { setIsAuthenticated(true); setUser(u); }} />;

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir="rtl">
        
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <aside className={`
          fixed inset-y-0 right-0 w-64 bg-white border-l border-slate-200 flex flex-col shadow-2xl z-50 transition-transform duration-300 transform
          lg:translate-x-0 lg:static lg:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">T</div>
              <h1 className="text-lg font-bold text-indigo-900">{APP_NAME}</h1>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <SidebarLink to="/" icon={<ICONS.Dashboard />} label="پیشخوان" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/register" icon={<ICONS.Check />} label="ثبت چک" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/list" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} label="لیست چک‌ها" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/settings" icon={<ICONS.Settings />} label="تنظیمات" onClick={() => setIsSidebarOpen(false)} />
          </nav>
          <div className="p-4 border-t border-slate-100">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm">
              <ICONS.Logout />
              <span>خروج از سامانه</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-30">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 bg-slate-100 rounded-lg text-slate-600" onClick={() => setIsSidebarOpen(true)}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Enterprise Mode</span>
                <span className="text-sm font-black text-slate-700">{user?.username}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} className={`relative p-2 rounded-xl transition-all ${isNotifOpen ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 border-2 border-white text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </button>
              <div className="w-8 h-8 rounded-xl bg-slate-200 overflow-hidden border border-slate-300">
                <img src={`https://picsum.photos/seed/${user?.id}/100/100`} alt="Avatar" />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard checks={checks} logs={[]} />} />
              <Route path="/register" element={<RegisterCheck onAdd={handleAddCheck} />} />
              <Route path="/list" element={<CheckList checks={checks} onUpdateStatus={handleUpdateStatus} />} />
              <Route path="/settings" element={<Settings user={user} onUpdateTelegram={handleUpdateTelegram} />} />
            </Routes>
          </div>

          {isNotifOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex justify-end" onClick={() => setIsNotifOpen(false)}>
              <div className="w-full sm:w-[400px] bg-white h-full shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                   <h3 className="font-black">اعلانات سیستم</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {notifications.length === 0 ? <p className="text-center py-20 text-slate-400 text-sm">پیامی وجود ندارد</p> : null}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </HashRouter>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, onClick?: () => void }> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
    >
      <span className={isActive ? 'text-white' : 'text-slate-400'}>{icon}</span>
      <span className="font-bold text-sm">{label}</span>
    </Link>
  );
};

export default App;
