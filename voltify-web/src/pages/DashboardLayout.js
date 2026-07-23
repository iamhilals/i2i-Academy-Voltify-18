import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, Server, Users, BarChart3, Zap, Settings, Brain, Atom, LogOut, Moon, Sun, Bell, CreditCard, Mail } from 'lucide-react';
import ChatbotSlideover from '../components/ChatbotSlideover';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Apply dark mode class to body/html if needed for global Tailwind 'dark:' prefix
  useEffect(() => {
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
    <div className="flex h-screen bg-[#F5F7F5] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-10">
        <div>
          {/* Logo Area */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="p-6 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            title="Ana Sayfaya Dön"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full overflow-hidden shadow-sm border border-gray-100 bg-white">
              <img src="/logo.png" alt="Voltify Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tighter">Voltify</span>
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
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
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
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
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
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
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
                    : 'text-gray-500 hover:bg-green-50 hover:text-[#4C811F]'
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
                    : 'text-gray-500 hover:bg-green-50 hover:text-[#4C811F]'
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
                    : 'text-gray-500 hover:bg-green-50 hover:text-[#4C811F]'
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
                    : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
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
                    : 'text-purple-600 hover:bg-purple-50 hover:text-purple-800'
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
          <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 transition-colors flex items-center justify-between group shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-gray-900 text-sm">Volkan Yüksel</span>
            </div>
            <Settings className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl py-2.5 px-4 transition-colors flex items-center justify-center gap-2 text-red-600 shadow-sm"
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
        <header className="h-20 bg-transparent flex items-center justify-between px-8 z-10 transition-colors">
          <div className="flex items-center gap-3 bg-blue-50/50 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-100/50">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-900">Canlı Şebeke Yükü: 12.4 GW</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Energy Points */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enerji Puanı</span>
                <span className="text-sm font-bold text-gray-900">984 XP</span>
              </div>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">Baş Stratejist</span>
                <span className="text-[11px] font-medium text-gray-500">Seviye 42</span>
              </div>
            </div>

            <div className="w-px h-8 bg-gray-200 mx-1" /> {/* Vertical Divider */}

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-all relative"
              >
                <Bell className={`w-5 h-5 ${showNotifications ? 'fill-gray-900 text-gray-900' : ''}`} />
                {/* Notification Badge */}
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
              </button>

              {/* Dropdown Menu */}
              {showNotifications && (
                <div className="absolute top-14 right-[-60px] w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
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
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-all"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto px-8 pb-8">
          <Outlet />
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
    </div>
  );
};

export default DashboardLayout;
