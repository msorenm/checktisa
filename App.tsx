
import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { HashRouter, Routes, Route, Link, useLocation, Navigate } = ReactRouterDOM as any;

import { ICONS, APP_NAME } from './constants';
import { Check, CheckStatus, User, Notification, CheckHistoryEntry, TelegramConfig } from './types';
import Dashboard from './pages/Dashboard';
import RegisterCheck from './pages/RegisterCheck';
import CheckList from './pages/CheckList';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { SecureDB } from './services/storageService';
import { 
  sendTelegramMessage, 
  formatNewCheckMessage 
} from './services/telegramService';

const App: React.FC = () => {
  // ۱. بارگذاری وضعیت احراز هویت
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return SecureDB.load('auth_status') === true;
  });
  
  // ۲. بارگذاری پروفایل کاربر (شامل تنظیمات تلگرام)
  const [user, setUser] = useState<User | null>(() => {
    return SecureDB.load('user_profile');
  });

  // ۳. بارگذاری دیتابیس چک‌ها
  const [checks, setChecks] = useState<Check[]>(() => {
    return SecureDB.load('checks_master') || [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    return SecureDB.load('notifs_stream') || [];
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // سینک کردن دائمی داده‌ها با دیتابیس رمزنگاری شده (فقط اگر داده معتبر باشد)
  useEffect(() => {
    if (checks.length > 0) SecureDB.save('checks_master', checks);
  }, [checks]);

  useEffect(() => {
    if (notifications.length > 0) SecureDB.save('notifs_stream', notifications);
  }, [notifications]);

  useEffect(() => {
    SecureDB.save('auth_status', isAuthenticated);
    if (user) {
      SecureDB.save('user_profile', user);
    }
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
          userId: user?.username || 'مدیر'
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
      SecureDB.save('user_profile', updatedUser);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // ما یوزر را null نمی‌کنیم تا اطلاعاتش در حافظه SecureDB بماند
    SecureDB.clearSession();
    window.location.reload();
  };

  if (!isAuthenticated) return <Login onLogin={(u) => { 
    // هنگام لاگین، اگر دیتابیسی از قبل بود، آن را با اطلاعات لاگین ترکیب کن
    const existingUser = SecureDB.load('user_profile');
    if (existingUser) {
        setUser(existingUser);
    } else {
        setUser(u);
    }
    setIsAuthenticated(true); 
  }} />;

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-['Vazirmatn']" dir="rtl">
        
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
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">T</div>
              <h1 className="text-lg font-black text-indigo-900">{APP_NAME}</h1>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <SidebarLink to="/" icon={<ICONS.Dashboard />} label="داشبورد امنیتی" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/register" icon={<ICONS.Check />} label="ثبت چک جدید" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/list" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} label="بانک اطلاعات" onClick={() => setIsSidebarOpen(false)} />
            <div className="pt-4 pb-2 px-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">پیکربندی</span>
            </div>
            <SidebarLink to="/settings" icon={<ICONS.Settings />} label="تنظیمات بات و امنیت" onClick={() => setIsSidebarOpen(false)} />
          </nav>
          <div className="p-4 border-t border-slate-100">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-black text-sm">
              <ICONS.Logout />
              <span>خروج امن از سشن</span>
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
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Verified Admin Access</span>
                <span className="text-sm font-black text-slate-700">{user?.username}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black border border-indigo-100">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                دیتابیس رمزنگاری شده فعال
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden border border-slate-300">
                <img src={`https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff&bold=true`} alt="Avatar" />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard checks={checks} logs={[]} />} />
              <Route path="/register" element={<RegisterCheck onAdd={handleAddCheck} />} />
              <Route path="/list" element={<CheckList checks={checks} onUpdateStatus={handleUpdateStatus} />} />
              <Route path="/settings" element={<Settings user={user} onUpdateTelegram={handleUpdateTelegram} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
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
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
    >
      <span className={isActive ? 'text-white' : 'text-slate-400'}>{icon}</span>
      <span className="font-black text-sm">{label}</span>
    </Link>
  );
};

export default App;
