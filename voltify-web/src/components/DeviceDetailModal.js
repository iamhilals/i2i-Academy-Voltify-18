import React from 'react';
import { X, AlertTriangle, Zap, Clock, DollarSign, Power } from 'lucide-react';

// Maps device name/type to a local public PNG image path
const getDeviceLocalImage = (type, name) => {
  const lower = (name || '').toLowerCase();
  const lType = (type || '').toLowerCase();
  
  if (lower.includes('buzdolabı') || lower.includes('dondurucu') || lType.includes('soğutucu')) {
    return '/fridge.png';
  }
  if (lower.includes('klima') || lower.includes(' ac') || lType.includes('iklimlendirme')) {
    return '/ac.png';
  }
  if (lower.includes('fırın') || lower.includes('ocak') || lower.includes('ankastre') || lType.includes('ocak') || lType.includes('fırın') || lower.includes('stove') || lower.includes('oven')) {
    return '/oven.png';
  }
  if (lower.includes('çamaşır') || lower.includes('washer') || lType.includes('çamaşır') || lower.includes('kurutucu') || lower.includes('dryer')) {
    return '/washer.png';
  }
  if (lower.includes('bulaşık') || lower.includes('dishwasher') || lType.includes('bulaşık')) {
    return '/dishwasher.png';
  }
  if (lower.includes('televizyon') || lower.includes(' tv') || lower.startsWith('tv') || (lType.includes('elektronik') && lower.includes('tv'))) {
    return '/tv.png';
  }
  if (lower.includes('konsol') || lower.includes('oyun') || lower.includes('game') || lower.includes('playstation') || lower.includes('xbox')) {
    return '/console.png';
  }
  if (lower.includes('süpürge') || lower.includes('vacuum') || lower.includes('robot')) {
    return '/vacuum.png';
  }
  if (lower.includes('kombi') || lower.includes('ısıtıcı') || lower.includes('boiler')) {
    return '/boiler.png';
  }
  if (lower.includes('priz') || lower.includes('plug')) {
    return '/plug.png';
  }
  if (lower.includes('ampul') || lower.includes('lamba') || lower.includes('bulb') || lower.includes('aydınlatma')) {
    return '/bulb.png';
  }
  return '/plug.png'; // default fallback
};

const DeviceDetailModal = ({ isOpen, onClose, device }) => {
  // isOpen false ise anında kaybolur, hiçbir şey render edilmez.
  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Arka plan karartması */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Ana Kutusu */}
      <div className="relative w-full max-w-6xl h-[85vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Kapatma Çarpısı */}
        <button 
          onClick={onClose}
          className="absolute top-0 right-0 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row w-full h-full items-center justify-center gap-6">
          
          {/* Correct Device Image Container */}
          <div className="relative w-[400px] h-[550px] shrink-0 flex items-center justify-center rounded-2xl overflow-hidden bg-white/10 shadow-2xl">
            <img 
              src={getDeviceLocalImage(device?.type, device?.name)} 
              alt={device?.name || 'Cihaz Görseli'} 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Data Content */}
          <div className="flex-1 w-full max-w-3xl bg-white rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-full">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900">{device?.name || 'Cihaz'}</h2>
                  <p className="text-gray-500 font-medium">{device?.type || 'Sistem Verileri'}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase
                  ${device?.isAnomalous ? 'bg-red-100 text-red-600' : 'bg-green-100 text-[#4C811F]'}`}>
                  {device?.isAnomalous ? 'Kritik Durum' : 'Optimum'}
                </span>
              </div>
            </div>

            {/* AI Warning */}
            {device?.isAnomalous && (
              <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-800 font-bold text-lg mb-1">Yapay Zeka Uyarı Raporu</h4>
                  <p className="text-red-600 text-sm leading-relaxed">Cihaz son 3 döngüdür normalin %40 üzerinde güç çekiyor. Motor arızası olabilir. Filtreleri kontrol etmeniz veya yetkili servise danışmanız önerilir.</p>
                </div>
              </div>
            )}

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Canlı Çekim</p>
                <p className={`text-2xl font-black ${device?.isAnomalous ? 'text-red-500' : 'text-gray-900'}`}>{device?.currentWattage || 150}<span className="text-sm font-bold text-gray-400">W</span></p>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Güvenli Limit</p>
                <p className="text-2xl font-black text-[#4C811F]">{device?.maxSafeWattage || 300}<span className="text-sm font-bold text-gray-400">W</span></p>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Clock className="w-3 h-3"/> Çalışma (Gün)</p>
                <p className="text-2xl font-black text-gray-900">14.5<span className="text-sm font-bold text-gray-400">s</span></p>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Tahmini Maliyet</p>
                <p className="text-2xl font-black text-gray-900">₺4.20<span className="text-sm font-bold text-gray-400">/g</span></p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="py-4 bg-[#4C811F] hover:bg-green-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-green-900/10 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Optimum Moda Al
              </button>
              <button className="py-4 bg-white border-2 border-red-100 hover:bg-red-50 text-red-600 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2">
                <Power className="w-5 h-5" />
                Cihazı Kapat
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailModal;