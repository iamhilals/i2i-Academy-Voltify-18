import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, AlertTriangle, Zap, Activity, DollarSign, Power } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { homeService } from '../services/homeService';

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

// Seçilen aralık için grafik verisini GERÇEK ölçümlerden üretir:
const RANGE_MS = { '1h': 3600e3, '6h': 6 * 3600e3, '24h': 24 * 3600e3 };
const BUCKETS = 30;

function buildSeries(serverHistory, samples, range) {
  const windowMs = RANGE_MS[range] || RANGE_MS['24h'];
  const bucketMs = windowMs / BUCKETS;
  const now = Date.now();

  const merged = [
    ...serverHistory.map((r) => ({ t: r.timestampMillis, watt: r.watt })),
    ...samples,
  ];

  const data = [];
  for (let i = 0; i < BUCKETS; i++) {
    const end = now - (BUCKETS - 1 - i) * bucketMs;
    const start = end - bucketMs;
    const inBucket = merged.filter((p) => p.t > start && p.t <= end);
    const wattage = inBucket.length
      ? Math.round(inBucket.reduce((s, x) => s + x.watt, 0) / inBucket.length)
      : null;
    data.push({ time: fmtTime(end), wattage });
  }
  return data;
}

function minutesForRange(range) {
  return range === '1h' ? 60 : range === '6h' ? 360 : 1440;
}

function fmtTime(ms) {
  return new Date(ms).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

const DeviceDetailModal = ({ isOpen, onClose, device, onToggleDevice, homeId }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [range, setRange] = useState('1h');
  const [samples, setSamples] = useState([]);
  const [serverHistory, setServerHistory] = useState([]);

  // En güncel gerçek watt değerini ref'te tut
  const deviceWattRef = useRef(0);
  deviceWattRef.current = Math.round(device?.currentWattage || 0);

  // Cihaz açıldığında/değiştiğinde tamponu sıfırla, 2 sn'de bir gerçek watt örnekle
  useEffect(() => {
    if (!isOpen || !device) return undefined;
    setSamples([{ t: Date.now(), watt: deviceWattRef.current }]);
    const timer = setInterval(() => {
      setSamples((prev) => {
        const next = [...prev, { t: Date.now(), watt: deviceWattRef.current }];
        return next.length > 1200 ? next.slice(-1200) : next;
      });
    }, 2000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, device?.id]);

  // Backend'den GERÇEK cihaz geçmişini çek
  useEffect(() => {
    if (!isOpen || !device || !homeId) return undefined;
    let active = true;
    const load = async () => {
      try {
        const rows = await homeService.getApplianceReadings(homeId, device.id, minutesForRange(range));
        if (active) setServerHistory(Array.isArray(rows) ? rows : []);
      } catch (e) {
        // Hatalar toast ile gösterilir
      }
    };
    load();
    const timer = setInterval(load, 20000);
    return () => {
      active = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, device?.id, range, homeId]);

  const chartData = useMemo(() => buildSeries(serverHistory, samples, range), [serverHistory, samples, range]);

  if (!isOpen || !device) return null;

  const isOff = (device.currentWattage || 0) === 0;
  const currWatt = Math.round(device.currentWattage || 0);
  const safeLimit = Math.round(device.safePowerLimit || device.maxSafeWattage || 1500);

  const handleToggle = async () => {
    if (!onToggleDevice) return;
    setIsProcessing(true);
    try {
      await onToggleDevice(device);
    } finally {
      setIsProcessing(false);
    }
  };

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
          
          {/* Dynamic Image Container matching exact device with local PNGs */}
          <div className="relative w-[340px] h-full shrink-0 flex items-center justify-center rounded-[2rem] overflow-hidden shadow-2xl border border-white/20">
            <img 
              src={getDeviceLocalImage(device.type, device.name)}
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
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Toplam Tüketim</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{(device.totalKwh || 0).toFixed(2)}<span className="text-sm font-bold text-gray-400">kWh</span></p>
              </div>
              <div className="bg-gray-50 dark:bg-[#182119] p-4 rounded-2xl border border-gray-100 dark:border-emerald-950/20">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Toplam Maliyet</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">₺{(device.totalCost || 0).toFixed(2)}</p>
              </div>
            </div>

            {/* Canlı Cihaz Tüketim Akışı - 1s / 6s / 24s aralıkları */}
            <div className="bg-white dark:bg-[#182119] border border-gray-100 dark:border-emerald-950/20 rounded-3xl p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-400" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Cihaz Tüketim Akışı (W)</h3>
                  <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-wider ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Canlı
                  </span>
                </div>
                <div className="flex gap-1 bg-gray-100 dark:bg-emerald-950/40 p-1 rounded-xl">
                  {['1h', '6h', '24h'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-black transition-colors ${
                        range === r
                          ? 'bg-white dark:bg-emerald-800 text-[#4C811F] dark:text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      {r === '1h' ? '1 Saat' : r === '6h' ? '6 Saat' : '24 Saat'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDevice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={device.isAnomalous ? '#EF4444' : '#3B82F6'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={device.isAnomalous ? '#EF4444' : '#3B82F6'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} minTickGap={28} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                      formatter={(value) => [`${value} W`, 'Tüketim']}
                    />
                    <Area type="monotone" dataKey="wattage" stroke={device.isAnomalous ? '#EF4444' : '#3B82F6'} strokeWidth={3} fillOpacity={1} fill="url(#colorDevice)" connectNulls isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] font-medium text-gray-400 mt-2 leading-relaxed">
                Tamamı gerçek ölçüm: sağ uç canlı (2 sn), geçmiş ise backend'de kayıtlı cihaz verisinden çizilir. Geçmiş, sistem çalıştıkça 24 saate kadar dolar.
              </p>
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