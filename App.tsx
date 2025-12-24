
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedChecks = localStorage.getItem('tisa_checks');
    if (savedChecks) setChecks(JSON.parse(savedChecks));
    const savedNotifs = localStorage.getItem('tisa_notifs');
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    const savedUser = localStorage.getItem('tisa_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

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
    localStorage.setItem('tisa_checks', JSON.stringify(updated));
  };

  const handleAddCheck = (newCheck: Omit<Check, 'id' | 'createdAt' | 'history'>) => {
    const check: Check = {
      ...newCheck,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      history: [{ id: Date.now().toString(), fromStatus: 'ثبت اولیه', toStatus: newCheck.status, timestamp: new Date().toLocaleString('fa-IR'), userId: user?.username || 'مدیر' }]
    };
    const updated = [...checks, check];
    setChecks(updated);
    localStorage.setItem('tisa_checks', JSON.stringify(updated));
    dispatchTelegram(formatNewCheckMessage(check, user?.username || 'مدیر سیستم'));
  };

  if (!isAuthenticated) return <Login onLogin={(u) => { setIsAuthenticated(true); setUser(u); }} />;

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden" dir="rtl">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
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
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(false)}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <SidebarLink to="/" icon={<ICONS.Dashboard />} label="پیشخوان" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/register" icon={<ICONS.Check />} label="ثبت چک" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/list" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} label="لیست چک‌ها" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/oracle" icon={<span className="text-xl">🔮</span>} label="رادار پیش‌گو" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/ai" icon={<ICONS.Ai />} label="آزمایشگاه AI" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/settings" icon={<ICONS.Settings />} label="تنظیمات" onClick={() => setIsSidebarOpen(false)} />
          </nav>
          <div className="p-4 border-t border-slate-100">
            <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm">
              <ICONS.Logout />
              <span>خروج</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-30">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 bg-slate-100 rounded-lg text-slate-600" onClick={() => setIsSidebarOpen(true)}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Enterprise Mode</span>
                <span className="text-sm font-black text-slate-700">{user?.username}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                سیستم آنلاین
              </div>
              
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)} 
                className={`relative p-2 lg:p-3 rounded-xl transition-all ${isNotifOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-red-600 border-2 border-white text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce z-10">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </button>

              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-slate-200 overflow-hidden border border-slate-300 shadow-sm">
                <img src={`https://picsum.photos/seed/${user?.id}/100/100`} alt="Avatar" />
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard checks={checks} logs={[]} />} />
              <Route path="/register" element={<RegisterCheck onAdd={handleAddCheck} />} />
              <Route path="/list" element={<CheckList checks={checks} onUpdateStatus={handleUpdateStatus} />} />
              <Route path="/oracle" element={<Forecaster checks={checks} />} />
              <Route path="/ai" element={<GeminiLab checks={checks} />} />
              <Route path="/settings" element={<Settings user={user} onUpdateTelegram={() => {}} />} />
            </Routes>
          </div>

          {/* Notifications Drawer (Responsive) */}
          {isNotifOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex justify-end" onClick={() => setIsNotifOpen(false)}>
              <div 
                className="w-full sm:w-[400px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300" 
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                   <h3 className="font-black">اعلانات سیستم</h3>
                   <button onClick={() => setIsNotifOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-center py-20 text-slate-400 text-sm">پیامی وجود ندارد</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                        <h4 className="text-sm font-bold mb-1">{n.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
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
