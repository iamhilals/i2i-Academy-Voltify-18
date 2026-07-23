import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, AlertTriangle, TrendingUp, DollarSign, TurkishLira, PieChart as PieChartIcon, Zap } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import DeviceDetailModal from '../components/DeviceDetailModal';
import AddDeviceSlideover from '../components/AddDeviceSlideover';

// Dummy historical data for the chart
const dailyTrendData = [
  { time: '00:00', consumption: 1.2 }, { time: '04:00', consumption: 0.8 },
  { time: '08:00', consumption: 3.5 }, { time: '12:00', consumption: 4.2 },
  { time: '16:00', consumption: 8.7 }, { time: '20:00', consumption: 6.1 },
  { time: '24:00', consumption: 2.3 },
];

const weeklyCostData = [
  { day: 'Pzt', cost: 45 }, { day: 'Sal', cost: 52 }, { day: 'Çar', cost: 38 },
  { day: 'Per', cost: 65 }, { day: 'Cum', cost: 80 }, { day: 'Cmt', cost: 120 },
  { day: 'Paz', cost: 105 },
];

const categoryData = [
  { name: 'İklimlendirme', value: 45 },
  { name: 'Beyaz Eşya', value: 25 },
  { name: 'Aydınlatma', value: 15 },
  { name: 'Elektronik', value: 15 },
];
const COLORS = ['#3B82F6', '#F97316', '#EAB308', '#8B5CF6'];

// Dummy appliances data with IMAGES
const mockAppliances = [
  { id: 1, name: 'Buzdolabı', type: 'Soğutucu', currentWattage: 150, maxSafeWattage: 300, isAnomalous: false, image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=150&h=150' },
  { id: 2, name: 'Klima (Salon)', type: 'İklimlendirme', currentWattage: 2200, maxSafeWattage: 2500, isAnomalous: false, image: 'https://images.unsplash.com/photo-1598444983083-d9d300fdf220?auto=format&fit=crop&q=80&w=150&h=150' },
  { id: 3, name: 'Çamaşır Makinesi', type: 'Beyaz Eşya', currentWattage: 3100, maxSafeWattage: 2000, isAnomalous: true, consecutiveBreaches: 4, image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&q=80&w=150&h=150' },
  { id: 4, name: 'Televizyon', type: 'Elektronik', currentWattage: 120, maxSafeWattage: 400, isAnomalous: false, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=150&h=150' },
];

const mockHomeData = {
  id: 1,
  name: 'Villa i2i',
  consumption: '1.2 kW',
  status: 'Oktimal',
  isCritical: false, // For demonstration, we can toggle this if needed
  image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200&h=400',
};

const HomeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);

  // In a real app, we would fetch home data by ID here. 
  // For now, we'll use mockHomeData but simulate critical state if ID == 2
  const isCritical = id === '2';
  const home = { ...mockHomeData, isCritical, name: isCritical ? 'Crimson Lodge' : 'Villa i2i' };

  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header (with Home Image Background) */}
      <div className="relative h-64 rounded-3xl shrink-0 overflow-hidden mb-8 shadow-sm">
        <img src={home.image} alt={home.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 px-4 py-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl flex items-center gap-2 text-white font-bold transition-colors shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri Dön
        </button>

        <button 
          onClick={() => navigate('/dashboard/meta-home', { state: { homeName: home.name, devices: mockAppliances } })}
          className="absolute top-6 right-6 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 backdrop-blur-md rounded-xl flex items-center gap-2 text-white font-bold transition-colors shadow-xl shadow-purple-900/40 border border-white/10"
        >
          <Zap className="w-5 h-5" />
          Meta-House 3D ile Gezin
        </button>

        <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
          <div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider text-white backdrop-blur-md shadow-lg mb-3 inline-block
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        
        {/* Left Column: Appliances List & AI Alert */}
        <div className="lg:col-span-1 space-y-6">
          
          {home.isCritical && (
            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-red-800 font-bold text-lg mb-1">Voltify AI Uyarısı</h4>
                <p className="text-red-600 font-medium text-sm leading-relaxed">
                  Evdeki "Çamaşır Makinesi" son 4 döngüdür güvenli tüketim limitlerini aştı. 
                  Lütfen cihazı kontrol edin!
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900">Kayıtlı Cihazlar</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#4C811F] bg-green-50 px-3 py-1 rounded-full">{mockAppliances.length} Cihaz</span>
                <button 
                  onClick={() => setIsAddDeviceOpen(true)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-sm transition-colors" 
                  title="Yeni Cihaz Ekle"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {mockAppliances.map((app) => (
                <div 
                  key={app.id} 
                  onClick={() => setSelectedDevice(app)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col gap-3 cursor-pointer hover:shadow-md ${
                    app.isAnomalous 
                      ? 'border-red-300 bg-red-50/30' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Appliance Image instead of icon */}
                    <div className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border-2 ${app.isAnomalous ? 'border-red-400' : 'border-transparent'}`}>
                      <img src={app.image} alt={app.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{app.name}</h4>
                          <span className="text-xs font-medium text-gray-500">{app.type}</span>
                        </div>
                        {app.isAnomalous && (
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1 uppercase tracking-wider">
                      <span className="text-gray-400">Canlı Çekim</span>
                      <span className={app.isAnomalous ? 'text-red-600' : 'text-gray-700'}>
                        {app.currentWattage}W <span className="text-gray-400 font-medium">/ {app.maxSafeWattage}W</span>
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
        </div>

        {/* Right Column: Multiple Charts & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Row: Mini Stat Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <TurkishLira className="w-4 h-4" /> Birikimli Fatura
              </h4>
              <p className="text-4xl font-black text-gray-900 mb-2">₺ 1,245<span className="text-xl text-gray-400">.50</span></p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                <div className={`h-full rounded-full ${home.isCritical ? 'bg-red-500' : 'bg-orange-400'}`} style={{width: '83%'}}></div>
              </div>
              <p className="text-xs font-bold text-gray-500 mt-2 text-right">Bütçenin %83'ü</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Tasarruf Hedefi
              </h4>
              <p className="text-4xl font-black text-[#4C811F] mb-2">% 12<span className="text-xl text-gray-400">.4</span></p>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                <div className="h-full rounded-full bg-[#4C811F]" style={{width: '60%'}}></div>
              </div>
              <p className="text-xs font-bold text-gray-500 mt-2 text-right">Aylık hedefte ilerleme</p>
            </div>
          </div>

          {/* Chart 1: Daily Trend */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-bold text-gray-900">24 Saatlik Tüketim (kW)</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={home.isCritical ? '#EF4444' : '#4C811F'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={home.isCritical ? '#EF4444' : '#4C811F'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="consumption" stroke={home.isCritical ? '#EF4444' : '#4C811F'} strokeWidth={4} fillOpacity={1} fill="url(#colorConsumption)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Two Columns for extra charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 2: Weekly Cost (Bar Chart) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TurkishLira className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900">Haftalık Maliyet (₺)</h3>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyCostData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="cost" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Category Distribution (Pie Chart) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <PieChartIcon className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900">Tüketim Dağılımı</h3>
              </div>
              <div className="h-48 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend positioned manually to look good */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  {categoryData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-xs font-bold text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Device Animation Modal */}
      <DeviceDetailModal 
        isOpen={!!selectedDevice} 
        onClose={() => setSelectedDevice(null)} 
        device={selectedDevice} 
      />

      {/* Add Device Slideover */}
      <AddDeviceSlideover 
        isOpen={isAddDeviceOpen} 
        onClose={() => setIsAddDeviceOpen(false)} 
      />
    </div>
  );
};

export default HomeDetail;
