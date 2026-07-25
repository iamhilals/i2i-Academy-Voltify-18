import React, { useState, useEffect } from 'react';
import { Server, Activity, AlertTriangle, Power, Zap, MapPin, Search, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { homeService } from '../services/homeService';
import { getDeviceLocalImage } from '../utils/deviceMapping';

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

  // Canlı veriyi status endpoint'inden çek (gerçek watt/anomali/powerOn — 150 varsayılanı yok)
  const loadDevices = async (silent = false) => {
    try {
      const homes = await homeService.getMyHomes();
      if (!Array.isArray(homes) || homes.length === 0) {
        setDevices([]);
        return;
      }
      const statuses = await Promise.all(homes.map(h => homeService.getHomeStatus(h.id).catch(() => null)));
      const all = [];
      statuses.forEach((st, i) => {
        if (!st) return;
        (st.appliances || []).forEach(a => {
          const on = a.powerOn !== false;
          const watt = Math.round(a.currentWattage || 0);
          all.push({
            id: a.id,
            homeId: homes[i].id,
            name: a.name,
            type: a.type || 'Elektronik',
            location: `${homes[i].name} - ${a.room || 'Salon'}`,
            currentWattage: watt,
            powerOn: on,
            status: on ? 'active' : 'offline',
            isAnomalous: a.isAnomalous || false,
          });
        });
      });
      setDevices(all);
    } catch (err) {
      // Hata toast'ı api.js interceptor'ında gösterilir
      if (!silent) setDevices([]);
    }
  };

  useEffect(() => {
    loadDevices();
    const timer = setInterval(() => loadDevices(true), 3000);
    return () => clearInterval(timer);
  }, []);

  const toggleDeviceStatus = async (deviceId) => {
    const targetDev = devices.find(d => d.id === deviceId);
    if (!targetDev) return;
    const nextOn = !targetDev.powerOn;

    setDevices(devices.map(dev => dev.id === deviceId
      ? { ...dev, powerOn: nextOn, status: nextOn ? 'active' : 'offline', currentWattage: nextOn ? dev.currentWattage : 0 }
      : dev));

    try {
      await homeService.setAppliancePower(targetDev.homeId, targetDev.id, nextOn);
    } catch (err) {
      // Hata toast'ı api.js interceptor'ında gösterilir
    }
  };

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, deviceId: null, homeId: null, deviceName: '', isDeleting: false });

  const openDeleteApplianceModal = (e, deviceId, homeId, deviceName) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, deviceId, homeId, deviceName, isDeleting: false });
  };

  const handleConfirmDeleteAppliance = async () => {
    if (!deleteModal.deviceId || !deleteModal.homeId) return;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      await homeService.deleteAppliance(deleteModal.homeId, deleteModal.deviceId);
      setDevices(prev => prev.filter(d => d.id !== deleteModal.deviceId));
    } catch (err) {
      console.error('Cihaz silinemedi:', err);
    } finally {
      setDeleteModal({ isOpen: false, deviceId: null, homeId: null, deviceName: '', isDeleting: false });
    }
  };

  const turnOffAllStandby = async () => {
    const onDevices = devices.filter(d => d.powerOn);
    setDevices(devices.map(dev => dev.powerOn ? { ...dev, powerOn: false, status: 'offline', currentWattage: 0 } : dev));
    await Promise.all(onDevices.map(d => homeService.setAppliancePower(d.homeId, d.id, false).catch(() => {})));
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

                  {/* Actions: Toggle & Delete */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleDeviceStatus(device.id)}
                      className={`w-11 h-6 rounded-full relative transition-colors ${isActive ? 'bg-[#4C811F]' : 'bg-gray-200'}`}
                      title={isActive ? 'Cihazı Kapat' : 'Cihazı Aç'}
                    >
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <button
                      onClick={(e) => openDeleteApplianceModal(e, device.id, device.homeId, device.name)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      title="Cihazı Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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

      {/* Modern Confirm Delete Modal for Devices */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, deviceId: null, homeId: null, deviceName: '', isDeleting: false })}
        onConfirm={handleConfirmDeleteAppliance}
        title="Cihazı Sil"
        message={`"${deleteModal.deviceName}" cihazını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Cihazı Sil"
        cancelText="Vazgeç"
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default Devices;
