import React from 'react';
import { X, Activity, AlertTriangle, TrendingUp, Zap, Battery, Cpu, Box } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Dummy historical data for the chart
const mockChartData = [
  { time: '00:00', consumption: 1.2 },
  { time: '04:00', consumption: 0.8 },
  { time: '08:00', consumption: 3.5 },
  { time: '12:00', consumption: 4.2 },
  { time: '16:00', consumption: 8.7 },
  { time: '20:00', consumption: 6.1 },
  { time: '24:00', consumption: 2.3 },
];

// Dummy appliances data
const mockAppliances = [
  { id: 1, name: 'Buzdolabı', type: 'Soğutucu', currentWattage: 150, maxSafeWattage: 300, isAnomalous: false },
  { id: 2, name: 'Klima (Salon)', type: 'İklimlendirme', currentWattage: 2200, maxSafeWattage: 2500, isAnomalous: false },
  { id: 3, name: 'Çamaşır Makinesi', type: 'Beyaz Eşya', currentWattage: 3100, maxSafeWattage: 2000, isAnomalous: true, consecutiveBreaches: 4 },
  { id: 4, name: 'Televizyon', type: 'Elektronik', currentWattage: 120, maxSafeWattage: 400, isAnomalous: false },
];

const getApplianceIcon = (type) => {
  switch (type) {
    case 'İklimlendirme': return <Zap className="w-5 h-5 text-blue-500" />;
    case 'Soğutucu': return <Box className="w-5 h-5 text-cyan-500" />;
    case 'Beyaz Eşya': return <Battery className="w-5 h-5 text-orange-500" />;
    default: return <Cpu className="w-5 h-5 text-gray-500" />;
  }
};

const HomeDetailModal = ({ isOpen, onClose, home }) => {
  if (!isOpen || !home) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#F5F7F5] w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header (with Home Image Background) */}
        <div className="relative h-48 shrink-0">
          <img src={home.image} alt={home.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider text-white backdrop-blur-md shadow-lg mb-3 inline-block
                ${home.isCritical ? 'bg-red-500/90' : 'bg-[#4C811F]/90'}`}>
                {home.status.toUpperCase()}
              </span>
              <h2 className="text-4xl font-black text-white tracking-tight">{home.name}</h2>
            </div>
            
            <div className="text-right">
              <p className="text-gray-300 text-sm font-bold uppercase tracking-wider mb-1">Anlık Tüketim</p>
              <p className={`text-4xl font-black ${home.isCritical ? 'text-red-400' : 'text-green-400'}`}>
                {home.consumption}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* AI Alert Banner if Critical */}
          {home.isCritical && (
            <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-red-800 font-bold text-lg mb-1">Voltify AI Uyarısı</h4>
                <p className="text-red-600 font-medium leading-relaxed">
                  Evdeki "Çamaşır Makinesi" son 4 döngüdür güvenli tüketim limitlerini (%100 Bütçe) aştı. 
                  Sistem otomatik olarak cezalı tarifeye geçiş yapmıştır. Lütfen cihazı kontrol edin!
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Appliances List */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900">Kayıtlı Cihazlar</h3>
              </div>
              
              <div className="space-y-4">
                {mockAppliances.map((app) => (
                  <div 
                    key={app.id} 
                    className={`bg-white p-4 rounded-2xl border transition-all ${
                      app.isAnomalous 
                        ? 'border-red-300 shadow-[0_4px_15px_rgba(239,68,68,0.1)]' 
                        : 'border-gray-100 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${app.isAnomalous ? 'bg-red-50' : 'bg-gray-50'}`}>
                          {getApplianceIcon(app.type)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{app.name}</h4>
                          <span className="text-xs font-medium text-gray-500">{app.type}</span>
                        </div>
                      </div>
                      {app.isAnomalous && (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Anomali
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-500">Mevcut Çekim</span>
                        <span className={app.isAnomalous ? 'text-red-600' : 'text-gray-900'}>
                          {app.currentWattage} W / {app.maxSafeWattage} W
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${app.isAnomalous ? 'bg-red-500' : 'bg-[#4C811F]'}`}
                          style={{ width: `${Math.min((app.currentWattage / app.maxSafeWattage) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Chart & Billing */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Billing Info */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Birikimli Fatura (Bu Ay)</h4>
                  <p className="text-3xl font-black text-gray-900">₺ 1,245.50</p>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bütçe Kotası (₺ 1,500)</h4>
                  <p className={`text-xl font-black ${home.isCritical ? 'text-red-500' : 'text-[#4C811F]'}`}>
                    %83 <span className="text-sm font-medium text-gray-500">Kullanıldı</span>
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-900">24 Saatlik Tüketim Trendi (kW)</h3>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={home.isCritical ? '#EF4444' : '#4C811F'} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={home.isCritical ? '#EF4444' : '#4C811F'} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="consumption" 
                        stroke={home.isCritical ? '#EF4444' : '#4C811F'} 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorConsumption)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDetailModal;
