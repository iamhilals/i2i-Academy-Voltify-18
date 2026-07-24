import React, { useState } from 'react';
import { X, AlertTriangle, Zap, Activity, Clock, DollarSign, Power } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Returns image matching device type/name instead of hardcoding fridge
const getDeviceImage = (type, name) => {
  const lowerName = (name || '').toLowerCase();
  const lowerType = (type || '').toLowerCase();
  
  if (lowerName.includes('klima') || lowerType.includes('iklim')) {
    return 'https://images.unsplash.com/photo-1598444983083-d9d300fdf220?auto=format&fit=crop&q=80&w=400&h=500';
  }
  if (lowerName.includes('bulaşık')) {
    return 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&q=80&w=400&h=500';
  }
  if (lowerName.includes('çamaşır')) {
    return 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&q=80&w=400&h=500';
  }
  if (lowerName.includes('tv') || lowerName.includes('televizyon')) {
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400&h=500';
  }
  if (lowerName.includes('kettle') || lowerName.includes('kahve')) {
    return 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=400&h=500';
  }
  return 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=400&h=500';
};

const DeviceDetailModal = ({ isOpen, onClose, device, onToggleDevice }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !device) return null; 

  const isOff = (device.currentWattage || 0) === 0;
  const currWatt = device.currentWattage || 0;
  const safeLimit = device.safePowerLimit || device.maxSafeWattage || 1500;

  // Dynamic 24-Hour chart curve based on REAL current Wattage
  const deviceChartData = [
    { time: '08:00', wattage: isOff ? 0 : Math.round(currWatt * 0.8) },
    { time: '12:00', wattage: isOff ? 0 : Math.round(currWatt * 0.95) },
    { time: '16:00', wattage: isOff ? 0 : Math.round(currWatt * 1.15) },
    { time: '20:00', wattage: isOff ? 0 : Math.round(currWatt * 1.0) },
    { time: '24:00', wattage: isOff ? 0 : Math.round(currWatt * 0.6) },
  ];

  const handleToggle = async () => {
    if (!onToggleDevice) return;
    setIsProcessing(true);
    try {
      await onToggleDevice(device);
    } finally {
      setIsProcessing(false);
    }
  };

  const deviceImage = getDeviceImage(device.type, device.name);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Main Modal Card */}
      <div className="relative w-full max-w-5xl h-[80vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-200 z-10">
        
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 z-50 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row w-full h-full items-center justify-center gap-6">
          
          {/* Dynamic Image Container matching exact device */}
          <div className="relative w-[340px] h-full shrink-0 flex items-center justify-center rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
            <img 
              src={deviceImage}
              alt={device.name}
              className={`w-full h-full object-cover transition-all duration-500 ${isOff ? 'grayscale opacity-60' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md ${isOff ? 'bg-gray-600' : 'bg-[#4C811F]'}`}>
                {isOff ? 'CİHAZ KAPALI' : 'CİHAZ AKTİF'}
              </span>
              <h3 className="text-2xl font-black text-white mt-1">{device.name}</h3>
            </div>
          </div>

          {/* Data Content Panel */}
          <div className="flex-1 w-full max-w-2xl bg-white dark:bg-[#1E271F] rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-full border border-gray-100 dark:border-emerald-950/30">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">{device.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{device.type || 'Akıllı Cihaz'} • Canlı Sistem Verileri</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase
                  ${device.isAnomalous ? 'bg-red-100 text-red-600' : isOff ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-[#4C811F]'}`}>
                  {device.isAnomalous ? 'Kritik Durum' : isOff ? 'Kapalı' : 'Optimum'}
                </span>
              </div>
            </div>

            {/* AI Warning Report */}
            {device.isAnomalous && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-800 font-bold text-lg mb-1">Yapay Zeka Uyarı Raporu</h4>
                  <p className="text-red-600 text-sm leading-relaxed">Cihaz son ölçümlerde güvenli limiti ({safeLimit}W) aştı. Filtreleri ve elektrik aksamını kontrol etmeniz önerilir.</p>
                </div>
              </div>
            )}

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-[#182119] p-4 rounded-2xl border border-gray-100 dark:border-emerald-950/20">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Canlı Çekim</p>
                <p className={`text-2xl font-black ${device.isAnomalous ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                  {currWatt}<span className="text-sm font-bold text-gray-400">W</span>
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-[#182119] p-4 rounded-2xl border border-gray-100 dark:border-emerald-950/20">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Güvenli Limit</p>
                <p className="text-2xl font-black text-[#4C811F]">{safeLimit}<span className="text-sm font-bold text-gray-400">W</span></p>
              </div>
              <div className="bg-gray-50 dark:bg-[#182119] p-4 rounded-2xl border border-gray-100 dark:border-emerald-950/20">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Çalışma</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{isOff ? '0.0' : '14.5'}<span className="text-sm font-bold text-gray-400">s</span></p>
              </div>
              <div className="bg-gray-50 dark:bg-[#182119] p-4 rounded-2xl border border-gray-100 dark:border-emerald-950/20">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Tahmini Maliyet</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">₺{isOff ? '0.00' : (currWatt * 0.028).toFixed(2)}<span className="text-sm font-bold text-gray-400">/g</span></p>
              </div>
            </div>

            {/* Dynamic 24-Hour Device Consumption Chart */}
            <div className="bg-white dark:bg-[#182119] border border-gray-100 dark:border-emerald-950/20 rounded-3xl p-6 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">24 Saatlik Cihaz Tüketimi (W)</h3>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={deviceChartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDevice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={device.isAnomalous ? '#EF4444' : '#3B82F6'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={device.isAnomalous ? '#EF4444' : '#3B82F6'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} />
                    <Area type="monotone" dataKey="wattage" stroke={device.isAnomalous ? '#EF4444' : '#3B82F6'} strokeWidth={3} fillOpacity={1} fill="url(#colorDevice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Action Buttons - Real Persistence */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleToggle}
                disabled={isProcessing}
                className={`py-4 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isOff 
                    ? 'bg-[#4C811F] hover:bg-green-700 text-white shadow-green-900/20' 
                    : 'bg-white border-2 border-red-200 hover:bg-red-50 text-red-600'
                }`}
              >
                <Power className="w-5 h-5" />
                {isProcessing ? 'İşleniyor...' : isOff ? 'Cihazı Aç' : 'Cihazı Kapat'}
              </button>
              
              <button 
                onClick={onClose}
                className="py-4 bg-gray-100 dark:bg-emerald-950/40 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailModal;