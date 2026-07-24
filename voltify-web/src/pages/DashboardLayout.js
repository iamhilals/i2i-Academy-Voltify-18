import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, Server, Users, BarChart3, Zap, Settings, Brain, Atom, LogOut, Moon, Sun, Bell, CreditCard, Mail } from 'lucide-react';
import ChatbotSlideover from '../components/ChatbotSlideover';
import MusicPlayerBar from '../components/MusicPlayerBar';
import { authService } from '../services/authService';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('voltify_theme');
    return saved ? saved === 'dark' : false;
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  return (
    <div className="flex h-screen bg-[#F5F7F5] dark:bg-[#181F19] font-sans overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#1E271F] border-r border-gray-100 dark:border-emerald-950/30 flex flex-col justify-between shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-10 transition-colors duration-300">
        <div>
          {/* Logo Area */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="p-6 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            title="Ana Sayfaya Dön"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full overflow-hidden shadow-sm border border-gray-100 dark:border-emerald-950/20 bg-white dark:bg-[#2A352B]">
              <img src="/logo.png" alt="Voltify Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tighter">Voltify</span>
          </div>

          {/* Navigation */}
          <nav className="mt-4 px-4 space-y-2">
            <NavLink
              to="/dashboard"
              end
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
              to="/dashboard/community"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-[#4C811F] text-white shadow-lg shadow-green-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-emerald-950/30 hover:text-gray-900 dark:hover:text-emerald-100'
                }`
              }
            >
              <Users className="w-5 h-5" />
              Topluluk
            </NavLink>
            <NavLink
              to="/dashboard/statistics"
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
            onClick={() => navigate('/dashboard/settings')}
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
        <header className="h-20 bg-transparent flex items-center justify-between px-8 z-40 relative transition-colors">
          <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-emerald-950/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-100/50 dark:border-emerald-900/20">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-900 dark:text-emerald-300">Canlı Şebeke Yükü: 12.4 GW</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Energy Points */}
            <div className="flex items-center gap-3 bg-white dark:bg-[#1E271F] px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-emerald-950/20">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enerji Puanı</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">984 XP</span>
              </div>
            </div>

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
                <span className="text-sm font-bold text-gray-900 dark:text-gray-200 truncate max-w-[120px]">{userProfile.fullName}</span>
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Seviye 42</span>
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
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
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
                    <span className="text-xs font-bold text-[#4C811F] bg-green-100 px-2 py-0.5 rounded-full">3 Yeni</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {/* Item 1 */}
                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-0.5">Buzdolabı Uyarısı!</h4>
                        <p className="text-xs text-gray-500 font-medium">Mutfaktaki buzdolabının kapağı 5 dakikadır açık. Soğutma kaybı yaşanıyor.</p>
                        <span className="text-[10px] font-bold text-gray-400 mt-2 block">Şimdi</span>
                      </div>
                    </div>
                    {/* Item 2 */}
                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-0.5">Bütçe Limiti</h4>
                        <p className="text-xs text-gray-500 font-medium">Günlük enerji bütçenizin %80'ine ulaştınız. Otomasyonlar devreye giriyor.</p>
                        <span className="text-[10px] font-bold text-gray-400 mt-2 block">1 saat önce</span>
                      </div>
                    </div>
                    {/* Item 3 */}
                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-0.5">Program Tamamlandı</h4>
                        <p className="text-xs text-gray-500 font-medium">Çamaşır makinesi Eco-Mod programını bitirdi. Beklemeye alındı.</p>
                        <span className="text-[10px] font-bold text-gray-400 mt-2 block">3 saat önce</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-xs font-bold text-gray-600">Tümünü Okundu İşaretle</span>
                  </div>
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
          <div className={`mb-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 max-w-[250px] transition-all duration-500 origin-bottom-right ${showTooltip ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}>
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
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
