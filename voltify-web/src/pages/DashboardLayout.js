import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, Server, BarChart3, Zap, Settings, Brain, Atom, LogOut, Moon, Sun, Bell, CreditCard, Mail, X, Menu } from 'lucide-react';
import ChatbotSlideover from '../components/ChatbotSlideover';
import MusicPlayerBar from '../components/MusicPlayerBar';
import { authService } from '../services/authService';
import { inboxService } from '../services/inboxService';
import { homeService } from '../services/homeService';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('voltify_theme');
    return saved ? saved === 'dark' : false;
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [liveKw, setLiveKw] = useState(0);

  const [userProfile, setUserProfile] = useState(() => {
    const user = authService.getCurrentUser();
    return {
      fullName: (user && (user.fullName || user.username)) || 'Volkan Yüksel',
      avatar: (user && user.avatar) || 'Felix'
    };
  });

  useEffect(() => {
    const updateUser = () => {
      const user = authService.getCurrentUser();
      if (user) {
        setUserProfile({
          fullName: user.fullName || user.username || 'Volkan Yüksel',
          avatar: user.avatar || 'Felix'
        });
      }
    };

    window.addEventListener('voltify_user_updated', updateUser);
    return () => window.removeEventListener('voltify_user_updated', updateUser);
  }, []);

  useEffect(() => {
    localStorage.setItem('voltify_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    setShowTooltip(true);
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Poll notifications from backend every 10 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const messages = await inboxService.getMessages();
        
        const deletedIds = JSON.parse(localStorage.getItem('voltify_deleted_notifs') || '[]');
        const clearedAt = parseInt(localStorage.getItem('voltify_notifications_cleared_at') || '0', 10);

        const validMessages = messages.filter(msg => {
          const msgTime = new Date(msg.createdAt).getTime();
          return msgTime > clearedAt && !deletedIds.includes(msg.id);
        });

        const mappedMessages = validMessages.map(msg => {
          let shortMessage = '';
          if (msg.category === 'ANOMALY_DETECTED') {
            shortMessage = `${msg.homeName} evinizde normal dışı yüksek tüketim (anomali) tespit edildi.`;
          } else if (msg.category === 'BREACH_100') {
            shortMessage = `${msg.homeName} kotasını tamamen aştı! Ceza tarifesi devrede.`;
          } else if (msg.category === 'BREACH_80') {
            shortMessage = `${msg.homeName} güvenli limitinin %80'ine ulaştı.`;
          } else {
            shortMessage = 'Yeni bir Voltify AI uyarısı aldınız.';
          }

          return {
            id: msg.id,
            title: msg.category === 'ANOMALY_DETECTED' ? 'Cihaz Anomalisi' : 
                   msg.category === 'BREACH_100' ? 'Kota Aşıldı!' : 
                   msg.category === 'BREACH_80' ? 'Kritik Seviye (%80)' : 'Voltify AI Uyarısı',
            message: shortMessage,
            time: new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            color: msg.category === 'ANOMALY_DETECTED' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600',
            dotColor: msg.category === 'ANOMALY_DETECTED' ? 'bg-orange-500' : 'bg-red-500'
          };
        });
        setNotifications(mappedMessages);
      } catch (err) {
        console.warn('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Canlı toplam tüketim: tüm evlerin anlık güç toplamı (gerçek telemetriden), her 5 sn
  useEffect(() => {
    let active = true;
    const fetchLive = async () => {
      try {
        const homes = await homeService.getMyHomes();
        const list = Array.isArray(homes) ? homes : [];
        const statuses = await Promise.all(list.map(h => homeService.getHomeStatus(h.id).catch(() => null)));
        if (!active) return;
        let watt = 0;
        statuses.forEach(st => {
          if (st && Array.isArray(st.appliances)) {
            st.appliances.forEach(a => { watt += a.currentWattage || 0; });
          }
        });
        setLiveKw(watt / 1000);
      } catch (err) {
        // Hata toast'ı api.js interceptor'ında gösterilir
      }
    };
    fetchLive();
    const timer = setInterval(fetchLive, 5000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  return (
    <div className="flex h-screen bg-[#F5F7F5] dark:bg-[#181F19] font-sans overflow-hidden transition-colors duration-300">
      
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1E271F] border-r border-gray-100 dark:border-emerald-950/30 flex flex-col justify-between shadow-2xl md:shadow-[2px_0_10px_rgba(0,0,0,0.02)] transition-transform duration-300 transform ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div>
          {/* Logo Area */}
          <div 
            onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
            className="p-6 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
            title="Ana Sayfaya Dön"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-full overflow-hidden shadow-sm border border-gray-100 dark:border-emerald-950/20 bg-white dark:bg-[#2A352B]">
                <img src="/logo.png" alt="Voltify Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tighter">Voltify</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(false); }} 
              className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-4 px-4 space-y-2">
            <NavLink
              to="/dashboard"
              end
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-[#4C811F] text-white shadow-lg shadow-green-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-emerald-950/30 hover:text-gray-900 dark:hover:text-emerald-100'
                }`
              }
            >
              <LayoutGrid className="w-5 h-5" />
              Evlerim
            </NavLink>
            <NavLink
              to="/dashboard/devices"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-[#4C811F] text-white shadow-lg shadow-green-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-emerald-950/30 hover:text-gray-900 dark:hover:text-emerald-100'
                }`
              }
            >
              <Server className="w-5 h-5" />
              Cihazlar
            </NavLink>
            <NavLink
              to="/dashboard/statistics"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-[#4C811F] text-white shadow-lg shadow-green-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-[#253026] hover:text-[#4C811F] dark:hover:text-[#4C811F]'
                }`
              }
            >
              <BarChart3 className="w-5 h-5" />
              Veri & İstatistik
            </NavLink>
            <NavLink
              to="/dashboard/billing"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-[#4C811F] text-white shadow-lg shadow-green-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-[#253026] hover:text-[#4C811F] dark:hover:text-[#4C811F]'
                }`
              }
            >
              <CreditCard className="w-5 h-5" />
              Faturalarım
            </NavLink>
            <NavLink
              to="/dashboard/inbox"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm relative ${
                  isActive
                    ? 'bg-[#4C811F] text-white shadow-lg shadow-green-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-[#253026] hover:text-[#4C811F] dark:hover:text-[#4C811F]'
                }`
              }
            >
              <Mail className="w-5 h-5" />
              Gelen Kutusu
            </NavLink>
            <NavLink
              to="/dashboard/analytics"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-[#4C811F] text-white shadow-lg shadow-green-900/20'
                    : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-[#253026] hover:text-blue-800'
                }`
              }
            >
              <Brain className="w-5 h-5" />
              AI Tahmin Raporu
            </NavLink>
            <NavLink
              to="/dashboard/automations"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-[#4C811F] text-white shadow-lg shadow-green-900/20'
                    : 'text-purple-600 hover:bg-purple-50 dark:hover:bg-[#253026] hover:text-purple-800'
                }`
              }
            >
              <Atom className="w-5 h-5" />
              Otonom Senaryolar
            </NavLink>
          </nav>
        </div>

        {/* Bottom Actions (Profile, Logout, Pro Plan) */}
        <div className="p-4 mb-4 flex flex-col gap-2">
          <button 
            onClick={() => { navigate('/dashboard/settings'); setIsMobileMenuOpen(false); }}
            className="w-full bg-white dark:bg-[#1E271F] hover:bg-gray-50 dark:hover:bg-[#253026] border border-gray-200 dark:border-emerald-950/30 rounded-xl py-3 px-4 transition-colors flex items-center justify-between group shadow-sm cursor-pointer"
            title="Hesap ve Profil Ayarları"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatar}&backgroundColor=e2e8f0`} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-200 text-sm truncate">{userProfile.fullName}</span>
            </div>
            <Settings className="w-5 h-5 text-gray-400 group-hover:text-[#4C811F] transition-colors shrink-0" />
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-red-50 dark:bg-red-950/10 hover:bg-red-100 dark:hover:bg-red-950/20 border border-red-100 dark:border-red-900/20 rounded-xl py-2.5 px-4 transition-colors flex items-center justify-center gap-2 text-red-600 dark:text-red-400 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-bold text-xs tracking-wide">Çıkış Yap</span>
          </button>
          
          <button className="w-full bg-gradient-to-r from-[#4C811F] to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl py-2.5 px-4 font-bold text-xs tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            Pro Plana Yükseltin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 bg-transparent flex items-center justify-between px-4 md:px-8 z-40 relative transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white dark:bg-[#1E271F] border border-gray-200 dark:border-emerald-950/30 text-gray-700 dark:text-gray-200 shadow-sm"
              title="Menüyü Aç/Kapat"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-emerald-950/20 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full border border-blue-100/50 dark:border-emerald-900/20">
              <BarChart3 className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-xs md:text-sm font-medium text-blue-900 dark:text-emerald-300">Canlı Tüketim: {liveKw.toFixed(2)} kW</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Profile */}
            <div 
              onClick={() => navigate('/dashboard/settings')}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              title="Hesap Ayarları"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white dark:border-[#1E271F] shadow-sm overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatar}&backgroundColor=e2e8f0`} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-200 truncate max-w-[140px]">{userProfile.fullName}</span>
              </div>
            </div>

            <div className="w-px h-8 bg-gray-200 mx-1" /> {/* Vertical Divider */}

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full bg-white dark:bg-[#1E271F] border border-gray-200 dark:border-emerald-950/20 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-emerald-950/30 shadow-sm transition-all relative z-50"
              >
                <Bell className={`w-5 h-5 ${showNotifications ? 'fill-gray-900 text-gray-900' : ''}`} />
                {/* Notification Badge */}
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Backdrop Overlay when dropdown is open */}
              {showNotifications && (
                <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" onClick={() => setShowNotifications(false)} />
              )}

              {/* Dropdown Menu */}
              {showNotifications && (
                <div className="absolute top-14 right-0 w-80 sm:w-96 bg-white dark:bg-[#1E271F] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-emerald-950/30 z-[100] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 text-sm">Bildirimler</h3>
                    {notifications.length > 0 && (
                      <span className="text-xs font-bold text-[#4C811F] bg-green-100 px-2 py-0.5 rounded-full">{notifications.length} Yeni</span>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm font-medium">Yeni bildirim yok</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start group relative">
                          <div className={`w-8 h-8 rounded-full ${notif.color} flex items-center justify-center shrink-0 mt-0.5`}>
                            {notif.icon || <div className={`w-2 h-2 rounded-full ${notif.dotColor}`}></div>}
                          </div>
                          <div className="flex-1 pr-6">
                            <h4 className="text-sm font-bold text-gray-900 mb-0.5">{notif.title}</h4>
                            <p className="text-xs text-gray-500 font-medium">{notif.message}</p>
                            <span className="text-[10px] font-bold text-gray-400 mt-2 block">{notif.time}</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const deletedIds = JSON.parse(localStorage.getItem('voltify_deleted_notifs') || '[]');
                              deletedIds.push(notif.id);
                              localStorage.setItem('voltify_deleted_notifs', JSON.stringify(deletedIds));
                              setNotifications(notifications.filter(n => n.id !== notif.id));
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Bildirimi Sil"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div 
                      onClick={() => {
                        localStorage.setItem('voltify_notifications_cleared_at', Date.now().toString());
                        setNotifications([]);
                      }}
                      className="p-3 border-t border-gray-100 bg-gray-50/50 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-xs font-bold text-gray-600">Tümünü Sil</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle (Moved to far right) */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#1E271F] border border-gray-200 dark:border-emerald-950/20 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-emerald-950/30 shadow-sm transition-all"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto px-8 pb-8 relative z-10">
          <Outlet />

          {/* Voltify Team Footer */}
          <footer className="mt-16 mb-4 py-8 border-t border-gray-200 dark:border-emerald-950/30 text-center">
            <h4 className="text-base font-black text-gray-800 dark:text-white tracking-wide mb-4">Voltify Team</h4>
            <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
              <a 
                href="https://www.linkedin.com/in/hilalakg%C3%BCl/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white dark:bg-[#2A352B] border border-gray-200 dark:border-emerald-950/30 rounded-full text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm hover:text-[#4C811F] dark:hover:text-emerald-400 hover:border-[#4C811F]/50 transition-all cursor-pointer"
              >
                Hilal Ayşe AKGÜL
              </a>
              <a 
                href="https://www.linkedin.com/in/sudenazakta%C5%9F/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white dark:bg-[#2A352B] border border-gray-200 dark:border-emerald-950/30 rounded-full text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm hover:text-[#4C811F] dark:hover:text-emerald-400 hover:border-[#4C811F]/50 transition-all cursor-pointer"
              >
                Sude Naz AKTAŞ
              </a>
              <a 
                href="https://www.linkedin.com/in/volkan-yuksel57/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white dark:bg-[#2A352B] border border-gray-200 dark:border-emerald-950/30 rounded-full text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm hover:text-[#4C811F] dark:hover:text-emerald-400 hover:border-[#4C811F]/50 transition-all cursor-pointer"
              >
                Volkan YÜKSEL
              </a>
            </div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Developed by the Voltify Team • i2i Academy 2026</p>
          </footer>
        </div>

        {/* Floating Green Leaves / Falling Effect (Rendered in both Light & Dark modes) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Dekoratif Sol Üst Dal */}
          <svg className="absolute top-0 left-0 w-48 h-48 text-[#4C811F]/15 dark:text-emerald-500/10 fill-current pointer-events-none z-0" viewBox="0 0 100 100">
            <path d="M0,0 Q30,10 70,40 Q45,35 25,50 M30,10 Q45,5 50,15 M15,5 Q20,15 15,25" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Dal üzerindeki yapraklar */}
            <path d="M70,40 Q75,32 72,25 Q64,32 70,40 Z" />
            <path d="M50,15 Q57,10 54,2 Q45,10 50,15 Z" />
            <path d="M25,50 Q32,46 29,38 Q20,44 25,50 Z" />
            <path d="M15,25 Q22,22 19,14 Q10,20 15,25 Z" />
          </svg>

          {/* Dekoratif Sağ Üst Dal */}
          <svg className="absolute top-0 right-0 w-56 h-56 text-[#4C811F]/15 dark:text-emerald-500/10 fill-current pointer-events-none z-0 transform scale-x-[-1]" viewBox="0 0 100 100">
            <path d="M0,0 Q35,12 80,45 Q55,40 30,55 M40,15 Q58,5 65,18 M20,8 Q28,20 20,32" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M80,45 Q88,38 84,30 Q75,37 80,45 Z" />
            <path d="M65,18 Q73,12 70,2 Q60,10 65,18 Z" />
            <path d="M30,55 Q38,51 34,42 Q25,48 30,55 Z" />
            <path d="M20,32 Q28,29 25,20 Q15,26 20,32 Z" />
          </svg>

          {/* Custom falling leaves style block */}
          <style>{`
            @keyframes fallLeaf {
              0% { transform: translateY(-30px) translateX(0) rotate(0deg); opacity: 0; }
              10% { opacity: 0.35; }
              90% { opacity: 0.35; }
              100% { transform: translateY(105vh) translateX(120px) rotate(360deg); opacity: 0; }
            }
            .animate-leaf-fall {
              animation: fallLeaf linear infinite;
            }
          `}</style>
          {[...Array(18)].map((_, i) => {
            // Negatif gecikmeler sayesinde sayfa açıldığı an yapraklar ekranda zaten süzülüyor olur
            const delay = -((i * 2.2) % 18); 
            const duration = 12 + (i % 5) * 4;
            const size = 18 + (i % 3) * 10; // Yaprak boyutları (18px - 38px)
            const left = `${(i * 6.5) % 95}%`;
            return (
              <svg
                key={i}
                style={{
                  left: left,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`
                }}
                className="absolute top-0 animate-leaf-fall text-[#4C811F]/15 dark:text-emerald-400/25 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M17,2C17,2 10,7 10,13C10,17 13.5,20.5 17,20.5C20.5,20.5 24,17 24,13C24,7 17,2 17,2Z M17,20C17,20 13,17 13,13C13,10 16,5 17,4" />
              </svg>
            );
          })}
        </div>

        {/* AI Chatbot Button */}
        <div className="absolute bottom-8 right-8 z-50 flex flex-col items-end">
          {/* Tooltip */}
          <div className={`mb-4 bg-white dark:bg-[#1E271F] rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-emerald-950/30 max-w-[250px] transition-all duration-500 origin-bottom-right ${showTooltip ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
              Merhaba! Ben Volty. Kişisel asistanınızım <span role="img" aria-label="wave">👋</span>
            </p>
          </div>
          {/* Button */}
          <button 
            onClick={() => setIsChatOpen(true)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-16 h-16 bg-white border-4 border-[#4C811F] rounded-full flex items-center justify-center text-[#4C811F] shadow-lg hover:shadow-[#4C811F]/30 hover:scale-105 transition-all duration-300 relative overflow-hidden"
          >
            <Brain className="w-8 h-8 relative z-10" />
            <div className="absolute inset-0 bg-green-50 opacity-0 hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </main>

      {/* Volty AI Slideover */}
      <ChatbotSlideover 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      {/* Floating Music Player Bar */}
      <MusicPlayerBar />
    </div>
  );
};

export default DashboardLayout;
