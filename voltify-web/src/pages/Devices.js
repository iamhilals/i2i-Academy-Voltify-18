import React, { useState, useEffect } from 'react';
import { Server, Activity, AlertTriangle, Power, Zap, MapPin, Search } from 'lucide-react';
import { homeService } from '../services/homeService';

// Maps device name/type to a local public PNG image path
const getDeviceLocalImage = (type, name) => {
  const lower = (name || '').toLowerCase();
  const lType = (type || '').toLowerCase();
  if (lower.includes('buzdolabı') || lower.includes('dondurucu') || lType.includes('soğutucu'))
    return '/fridge/1.png';
  return null; // No local PNG available — will use emoji tile
};

// Returns a display emoji for device type for non-image fallback
const getDeviceEmoji = (type, name) => {
  const lower = (name || '').toLowerCase();
  const lType = (type || '').toLowerCase();
  if (lower.includes('klima') || lType.includes('iklimlendirme')) return '❄️';
  if (lower.includes('çamaşır')) return '🫧';
  if (lower.includes('kurutucu')) return '🌀';
  if (lower.includes('televizyon') || lower.includes('tv')) return '📺';
  if (lower.includes('konsol') || lower.includes('oyun')) return '🎮';
  if (lower.includes('süpürge')) return '🤖';
  if (lower.includes('laptop') || lower.includes('dizüstü')) return '💻';
  if (lower.includes('masaüstü') || lower.includes('desktop')) return '🖥️';
  if (lower.includes('kombi') || lower.includes('ısıtıcı')) return '🔥';
  if (lower.includes('fan') || lower.includes('vantilatör')) return '💨';
  if (lower.includes('kettle') || lower.includes('su ısıtıcı')) return '☕';
  if (lower.includes('mikro')) return '📡';
  if (lower.includes('kahve')) return '☕';
  if (lower.includes('blender')) return '🥤';
  if (lower.includes('panini') || lower.includes('tost')) return '🥪';
  if (lower.includes('ampul') || lower.includes('lamba')) return '💡';
  if (lower.includes('priz')) return '🔌';
  if (lower.includes('ocak') || lower.includes('fırın')) return '🍳';
  if (lower.includes('bulaşık')) return '🍽️';
  if (lower.includes('kamera') || lower.includes('güvenlik')) return '📷';
  return '⚡';
};

// Background gradient colors per device category
const getDeviceGradient = (type, name) => {
  const lower = (name || '').toLowerCase();
  const lType = (type || '').toLowerCase();
  if (lower.includes('klima') || lType.includes('iklimlendirme') || lower.includes('fan')) return 'from-sky-50 to-blue-100';
  if (lower.includes('çamaşır') || lower.includes('bulaşık')) return 'from-indigo-50 to-indigo-100';
  if (lower.includes('televizyon') || lower.includes('konsol') || lower.includes('laptop') || lower.includes('masaüstü')) return 'from-gray-50 to-slate-100';
  if (lower.includes('kahve') || lower.includes('kettle') || lower.includes('ocak') || lower.includes('tost')) return 'from-amber-50 to-orange-100';
  if (lower.includes('süpürge')) return 'from-violet-50 to-purple-100';
  if (lower.includes('kombi') || lower.includes('ısıtıcı')) return 'from-red-50 to-orange-100';
  return 'from-green-50 to-emerald-100';
};

const Devices = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const homes = await homeService.getMyHomes();
      if (Array.isArray(homes) && homes.length > 0) {
        const allAppliances = [];
        homes.forEach(h => {
          if (Array.isArray(h.appliances)) {
            h.appliances.forEach(a => {
              allAppliances.push({
                id: a.id,
                homeId: h.id,
                name: a.name,
                type: a.type || 'Elektronik',
                location: `${h.name} - ${a.room || 'Salon'}`,
                currentWattage: a.currentWattage || 0,
                status: a.currentWattage > 0 ? 'active' : 'standby',
                isAnomalous: a.isAnomalous || false,
                image: a.image || 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=150&h=150'
              });
            });
          }
        });
        setDevices(allAppliances);
      } else {
        setDevices([]);
      }
    } catch (err) {
      console.warn('Could not load user devices from backend:', err);
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const toggleDeviceStatus = async (deviceId) => {
    const targetDev = devices.find(d => d.id === deviceId);
    if (!targetDev) return;

    const nextStatus = targetDev.status === 'active' ? 'standby' : 'active';
    const nextWattage = nextStatus === 'active' ? 250 : 0;

    setDevices(devices.map(dev => {
      if (dev.id === deviceId) {
        return { ...dev, status: nextStatus, currentWattage: nextWattage };
      }
      return dev;
    }));

    try {
      if (targetDev.homeId && targetDev.id) {
        await homeService.updateAppliance(targetDev.homeId, targetDev.id, {
          name: targetDev.name
        });
      }
    } catch (err) {
      console.warn('Backend update failed:', err);
    }
  };

  const turnOffAllStandby = () => {
    setDevices(devices.map(dev => dev.status === 'standby' ? { ...dev, status: 'offline', currentWattage: 0 } : dev));
  };

  const filteredDevices = devices.filter(dev => {
    const matchesSearch = dev.name.toLowerCase().includes(searchQuery.toLowerCase()) || dev.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return dev.status === 'active';
    if (activeTab === 'standby') return dev.status === 'standby' || dev.status === 'charging';
    if (activeTab === 'anomalous') return dev.isAnomalous;
    return true;
  });

  const totalWattage = devices.filter(d => d.status === 'active' || d.status === 'charging' || d.status === 'standby').reduce((acc, curr) => acc + curr.currentWattage, 0);

  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
              <Server className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Tüm Cihazlarım</h1>
          </div>
          <p className="text-gray-500 font-medium">Toplam {devices.length} cihaz ağınıza bağlı durumda.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Toplam Çekim</p>
            <p className="text-2xl font-black text-gray-900">{(totalWattage / 1000).toFixed(1)} <span className="text-sm font-bold text-gray-400">kW</span></p>
          </div>
          {devices.length > 0 && (
            <button 
              onClick={turnOffAllStandby}
              className="px-5 py-3 bg-[#4C811F] hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-900/10 transition-colors flex items-center gap-2"
            >
              <Power className="w-5 h-5" />
              Açık Unutulanları Kapat
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        
        {/* Tabs */}
        <div className="flex w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar gap-2">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${activeTab === 'all' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            Tümü ({devices.length})
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'active' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-green-50 hover:text-green-700'}`}
          >
            <Zap className="w-4 h-4" /> Aktif ({devices.filter(d => d.status === 'active').length})
          </button>
          <button 
            onClick={() => setActiveTab('standby')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'standby' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'}`}
          >
            <Activity className="w-4 h-4" /> Standby/Uyku ({devices.filter(d => d.status === 'standby' || d.status === 'charging').length})
          </button>
          <button 
            onClick={() => setActiveTab('anomalous')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'anomalous' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-red-50 hover:text-red-700'}`}
          >
            <AlertTriangle className="w-4 h-4" /> Kritik ({devices.filter(d => d.isAnomalous).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Cihaz veya konum ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:border-gray-900 transition-colors"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Device Grid */}
      {filteredDevices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
          <Server className="w-16 h-16 text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-1">Cihaz Bulunamadı</h3>
          <p className="text-gray-500 font-medium text-sm max-w-md text-center">
            {devices.length === 0 
              ? 'Henüz evlerinizde kayıtlı bir cihaz bulunmuyor. Evlerim sayfasından bir ev seçip ilk cihazınızı ekleyebilirsiniz.' 
              : 'Bu filtrelere veya aramaya uygun bir cihaz bulunamadı.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
          {filteredDevices.map(device => {
            const isActive = device.status === 'active';
            const isStandby = device.status === 'standby' || device.status === 'charging';
            
            let borderClass = 'border-gray-100 hover:border-gray-200';
            let bgClass = 'bg-white';
            
            if (device.isAnomalous) {
              borderClass = 'border-red-300 shadow-lg shadow-red-900/5';
              bgClass = 'bg-red-50/30';
            } else if (isActive) {
              borderClass = 'border-green-200 shadow-md shadow-green-900/5';
            }

            return (
              <div key={device.id} className={`p-5 rounded-3xl border transition-all flex flex-col group ${borderClass} ${bgClass}`}>
                
                {/* Header (Status & Toggle) */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {device.isAnomalous ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider">
                        <AlertTriangle className="w-3 h-3" /> Tehlike
                      </span>
                    ) : isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider">
                        <Zap className="w-3 h-3" /> Açık
                      </span>
                    ) : isStandby ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-wider">
                        Uyku
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider">
                        Kapalı
                      </span>
                    )}
                  </div>

                  {/* Toggle Button */}
                  <button 
                    onClick={() => toggleDeviceStatus(device.id)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${isActive ? 'bg-[#4C811F]' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Device Image or Emoji Tile */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className={`w-24 h-24 rounded-2xl overflow-hidden shadow-sm border-4 transition-all duration-300 ${
                      device.isAnomalous ? 'border-red-400 scale-105' : isActive ? 'border-green-100' : 'border-transparent'
                    }`}>
                      {(() => {
                        const localImg = getDeviceLocalImage(device.type, device.name);
                        if (localImg) {
                          return (
                            <img
                              src={localImg}
                              alt={device.name}
                              className={`w-full h-full object-cover ${!isActive && !isStandby ? 'grayscale opacity-70' : ''}`}
                            />
                          );
                        }
                        return (
                          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getDeviceGradient(device.type, device.name)} ${
                            !isActive && !isStandby ? 'grayscale opacity-60' : ''
                          }`}>
                            <span className="text-4xl">{getDeviceEmoji(device.type, device.name)}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg text-center leading-tight mb-1">{device.name}</h3>
                  <p className="text-gray-500 font-medium text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {device.location}
                  </p>
                </div>

                {/* Bottom Stats */}
                <div className="mt-auto border-t border-gray-100/80 pt-4 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kategori</p>
                    <p className="text-xs font-bold text-gray-700">{device.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Güç Tüketimi</p>
                    <p className={`text-xl font-black ${device.isAnomalous ? 'text-red-500' : isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {device.currentWattage}<span className="text-xs font-bold text-gray-400 ml-0.5">W</span>
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Devices;
