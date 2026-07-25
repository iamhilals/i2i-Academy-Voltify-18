import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, Zap, Home as HomeIcon, PiggyBank, AlertTriangle, Trash2 } from 'lucide-react';
import AddHomeSlideover from '../components/AddHomeSlideover';
import VoltBotWidget from '../components/VoltBotWidget';
import ConfirmModal from '../components/ConfirmModal';
import { homeService } from '../services/homeService';

const mockHomeImages = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=400&h=300'
];

const HomeDashboard = () => {
  const navigate = useNavigate();
  const [isAddHomeOpen, setIsAddHomeOpen] = useState(false);
  // Default to empty array [] so new accounts start with 0 homes cleanly
  const [homes, setHomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, homeId: null, homeName: '', isDeleting: false });

  const openDeleteModal = (e, homeId, homeName) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, homeId, homeName, isDeleting: false });
  };

  const handleConfirmDeleteHome = async () => {
    if (!deleteModal.homeId) return;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      await homeService.deleteHome(deleteModal.homeId);
      setHomes(prev => prev.filter(h => h.id !== deleteModal.homeId));
    } catch (err) {
      console.error('Ev silinemedi:', err);
    } finally {
      setDeleteModal({ isOpen: false, homeId: null, homeName: '', isDeleting: false });
    }
  };

  const loadHomes = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const backendHomes = await homeService.getMyHomes();
      if (Array.isArray(backendHomes) && backendHomes.length > 0) {
        // Canlı durumu (penalty + cihaz anomalisi) status endpoint'inden çek
        const statuses = await Promise.all(
          backendHomes.map(h => homeService.getHomeStatus(h.id).catch(() => null))
        );
        const formatted = backendHomes.map((h, idx) => {
          const st = statuses[idx];
          // Kritik iki nedenle: (1) ev penalty durumunda, VEYA (2) bir cihaz güvenli limiti aşıp anomali veriyor
          const isPenalty = st ? !!st.isPenaltyActive : (h.billingLedger ? !!h.billingLedger.isPenaltyActive : false);
          const anomalousDevice = (st && Array.isArray(st.appliances))
            ? st.appliances.find(a => a.isAnomalous)
            : null;
          const hasBreached = isPenalty || !!anomalousDevice;

          const totalKwhVal = st ? (st.totalKwh || 0) : (h.billingLedger ? (h.billingLedger.accumulatedWatt || 0) / 1800000 : 0);
          const balanceVal = st ? (st.currentBalance || 0) : (h.billingLedger ? (h.billingLedger.currentBalance || 0) : 0);

          let warning = null;
          if (isPenalty) warning = 'Bütçe veya güç kotası aşıldı!';
          else if (anomalousDevice) warning = `${anomalousDevice.name} güvenli limiti aşıyor!`;

          return {
            id: h.id,
            name: (st && st.name) || h.name || `Ev ${h.id}`,
            totalKwh: totalKwhVal,
            balance: balanceVal,
            consumption: `${totalKwhVal.toFixed(1)} kWh`,
            status: isPenalty ? 'Cezai Durum' : (anomalousDevice ? 'Kritik' : 'Aktif'),
            health: hasBreached ? 'KRİTİK' : 'MÜKEMMEL',
            healthScore: hasBreached ? 1 : 5,
            image: h.imageUrl || mockHomeImages[idx % mockHomeImages.length],
            isCritical: hasBreached,
            warning,
            squareMeters: (st && st.squareMeters) || h.squareMeters || 120,
            roomLayout: (st && st.roomLayout) || h.roomLayout || '2+1',
          };
        });
        setHomes(formatted);
      } else {
        setHomes([]);
      }
    } catch (err) {
      // Hata mesajı api.js interceptor'ında toast olarak gösterilir
      if (!silent) setHomes([]);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHomes();
    // Ana ızgarada kota/anomali durumunu canlı tut (sessiz yenileme)
    const timer = setInterval(() => loadHomes(true), 5000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic Statistics Computations
  const totalHomesCount = homes.length;
  const activeHomesCount = homes.filter(h => !h.isCritical).length;

  const totalKwh = homes.reduce((acc, h) => acc + (h.totalKwh || 0), 0).toFixed(2);
  const totalBillTL = homes.reduce((acc, h) => acc + (h.balance || 0), 0).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <AddHomeSlideover isOpen={isAddHomeOpen} onClose={() => setIsAddHomeOpen(false)} onSuccess={loadHomes} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Evlerim</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium mt-1">Tüm lokasyonlarınızın enerji durumu</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAddHomeOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4C811F] hover:bg-green-700 text-white rounded-xl transition-colors font-bold shadow-lg shadow-green-900/20 text-sm"
          >
            <Plus className="w-5 h-5" />
            Ev Ekle
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards & VoltBot Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 h-full">
            <div className="bg-white dark:bg-[#1E271F] rounded-3xl p-6 flex items-center gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-emerald-950/20">
              <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-emerald-950/20 flex items-center justify-center shrink-0">
                <Zap className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Toplam Tüketim</h3>
                <p className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                  {totalKwh} <span className="text-lg text-gray-500 font-bold">kWh</span>
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#1E271F] rounded-3xl p-6 flex items-center gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-emerald-950/20">
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-emerald-950/20 flex items-center justify-center shrink-0">
                <HomeIcon className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Aktif Evler</h3>
                <p className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                  {homes.length > 0 ? `${activeHomesCount}/${totalHomesCount}` : '0 Ev'}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E271F] rounded-3xl p-6 flex items-center gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-emerald-950/20">
              <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-emerald-950/20 flex items-center justify-center shrink-0">
                <PiggyBank className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Toplam Fatura</h3>
                <p className="text-3xl font-black text-green-600 dark:text-green-400 tracking-tight">
                  ₺{totalBillTL}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <VoltBotWidget />
        </div>
      </div>

      {/* Grid, Skeleton (ilk yükleme) veya Boş Durum */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1E271F] rounded-[2rem] p-4 border border-gray-100 dark:border-emerald-950/20">
              <div className="h-48 rounded-3xl bg-gray-100 dark:bg-emerald-950/20 mb-5" />
              <div className="h-5 w-2/3 rounded-lg bg-gray-100 dark:bg-emerald-950/20 mb-3" />
              <div className="h-3 w-1/2 rounded-lg bg-gray-100 dark:bg-emerald-950/20 mb-6" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-1.5 flex-1 rounded-full bg-gray-100 dark:bg-emerald-950/20" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : homes.length === 0 ? (
        <div className="bg-white dark:bg-[#1E271F] border border-gray-100 dark:border-emerald-950/30 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-green-50 dark:bg-emerald-950/30 text-[#4C811F] rounded-full flex items-center justify-center mb-4 shadow-inner">
            <HomeIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Henüz Kayıtlı Bir Eviniz Bulunmuyor</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md font-medium mb-6">
            Enerji tüketiminizi, akıllı cihazlarınızı ve fatura tasarruflarınızı anlık takip etmek için hemen ilk lokasyonunuzu ekleyin.
          </p>
          <button
            onClick={() => setIsAddHomeOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#4C811F] hover:bg-green-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-900/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            İlk Evinizi Ekleyin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {homes.map((home) => (
            <div 
              key={home.id} 
              onClick={() => navigate(`/dashboard/home/${home.id}`)}
              className={`bg-white dark:bg-[#1E271F] rounded-[2rem] p-4 cursor-pointer transition-all duration-300 hover:shadow-xl group
                ${home.isCritical 
                  ? 'border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:border-red-500' 
                  : 'border border-gray-100 dark:border-emerald-950/20 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-green-500/30'
                }`}
            >
              {/* Image Container */}
              <div className="relative h-48 rounded-3xl overflow-hidden mb-5">
                <img src={home.image} alt={home.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 z-10">
                  <button
                    onClick={(e) => openDeleteModal(e, home.id, home.name)}
                    className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-md shadow-lg transition-transform hover:scale-110"
                    title="Evi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-white backdrop-blur-md shadow-lg
                    ${home.isCritical ? 'bg-red-500/90' : 'bg-[#4C811F]/90'}`}>
                    {home.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="px-2">
                <h3 className={`text-xl font-black mb-1 ${home.isCritical ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>{home.name}</h3>
                <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">
                  {home.roomLayout} • {home.squareMeters} m²
                </p>
                
                <div className="flex justify-between items-end mb-6">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Tüketim</span>
                  <span className={`text-2xl font-black tracking-tight ${home.isCritical ? 'text-red-600' : 'text-[#4C811F]'}`}>
                    {home.consumption}
                  </span>
                </div>

                {/* Health Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-[10px] font-black tracking-wider uppercase">
                    <span className="text-gray-400 dark:text-gray-500">Enerji Sağlığı</span>
                    <span className={home.isCritical ? 'text-red-500' : home.healthScore > 3 ? 'text-[#4C811F]' : 'text-orange-500'}>
                      {home.health}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 flex-1 rounded-full ${
                          i <= home.healthScore 
                            ? (home.isCritical ? 'bg-red-500' : home.healthScore > 3 ? 'bg-[#4C811F]' : 'bg-orange-500')
                            : 'bg-gray-100 dark:bg-emerald-950/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Warning Badge */}
                {home.isCritical && (
                  <div className="mt-4 flex items-center justify-center gap-2 py-2 px-3 bg-red-50 dark:bg-red-950/10 rounded-xl text-red-600 dark:text-red-400 font-bold text-xs border border-red-100 dark:border-red-900/20">
                    <AlertTriangle className="w-4 h-4" />
                    {home.warning}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, homeId: null, homeName: '', isDeleting: false })}
        onConfirm={handleConfirmDeleteHome}
        title="Lokasyonu Sil"
        message={`"${deleteModal.homeName}" lokasyonunu ve bağlı cihaz verilerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Lokasyonu Sil"
        cancelText="Vazgeç"
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
};

export default HomeDashboard;
