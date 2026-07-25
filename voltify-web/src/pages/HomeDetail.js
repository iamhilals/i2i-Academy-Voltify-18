import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, AlertTriangle, TurkishLira, PieChart as PieChartIcon, Zap, Plus } from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import DeviceDetailModal from '../components/DeviceDetailModal';
import { getDeviceLocalImage } from '../utils/deviceMapping';
import AddDeviceSlideover from '../components/AddDeviceSlideover';
import { homeService } from '../services/homeService';

const mockHomeData = {
  id: 1,
  name: 'Villa i2i',
  consumption: '0.0 kW',
  currentBalance: 0,
  budgetQuotaTry: 1500,
  status: 'Optimal',
  isCritical: false,
  image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200&h=400',
  squareMeters: 120,
  roomLayout: '2+1'
};

const COLORS = ['#3B82F6', '#F97316', '#EAB308', '#8B5CF6'];

const HomeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [homeState, setHomeState] = useState(null);
  const [appliances, setAppliances] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;

    // Canlı ev durumu: statik alanlar + anlık watt & anomali (Ignite sub-ms okuma)
    async function fetchStatus() {
      try {
        const statusData = await homeService.getHomeStatus(id);
        if (!active || !statusData) return;
        setHomeState({
          id: statusData.id || parseInt(id),
          name: statusData.name || `Ev ${id}`,
          totalKwh: statusData.totalKwh || 0,
          currentBalance: statusData.currentBalance || 0,
          budgetQuotaTry: statusData.budgetQuotaTry || 1500,
          status: statusData.isPenaltyActive ? 'Cezai Durum' : 'Optimal',
          isCritical: statusData.isPenaltyActive || false,
          image: mockHomeData.image,
          squareMeters: statusData.squareMeters || 120,
          roomLayout: statusData.roomLayout || '2+1',
        });
        const freshAppliances = Array.isArray(statusData.appliances) ? statusData.appliances : [];
        setAppliances(freshAppliances);
        // Modal açıksa seçili cihazın canlı verisini (watt/anomali) de tazele
        setSelectedDevice((prev) => {
          if (!prev) return prev;
          const fresh = freshAppliances.find((a) => a.id === prev.id);
          return fresh ? { ...prev, ...fresh } : prev;
        });
      } catch (err) {
        // Hatalar api.js interceptor'ında kullanıcıya toast olarak gösterilir
      } finally {
        if (active) setIsLoading(false);
      }
    }

    // Günlük geçmiş trendi: PostgreSQL snapshot'ları (grafikler için)
    async function fetchHistory() {
      try {
        const data = await homeService.getHomeHistory(id);
        if (!active) return;
        const rows = Array.isArray(data) ? data : (data && Array.isArray(data.content) ? data.content : []);
        setHistory(rows);
      } catch (err) {
        // Sessizce geç; grafik canlı veriyle fallback yapar
      }
    }

    fetchStatus();
    fetchHistory();

    // Şartname NFR: 1-2 sn agresif polling ile canlı güncelleme (UI donmadan)
    const statusTimer = setInterval(fetchStatus, 2000);
    const historyTimer = setInterval(fetchHistory, 15000);
    return () => {
      active = false;
      clearInterval(statusTimer);
      clearInterval(historyTimer);
    };
  }, [id]);

  const handleToggleDevice = async (deviceToToggle) => {
    const nextOn = deviceToToggle.powerOn === false; // kapalıysa aç, açıksa kapat
    // Optimistik güncelle; 2 sn'lik polling gerçek durumu doğrular
    const patch = { powerOn: nextOn, currentWattage: nextOn ? (deviceToToggle.currentWattage || 0) : 0 };
    setAppliances(prev => prev.map(a => a.id === deviceToToggle.id ? { ...a, ...patch } : a));
    if (selectedDevice && selectedDevice.id === deviceToToggle.id) {
      setSelectedDevice(prev => ({ ...prev, ...patch }));
    }

    try {
      await homeService.setAppliancePower(id, deviceToToggle.id, nextOn);
    } catch (err) {
      // Hata toast'ı api.js interceptor'ında gösterilir
    }
  };

  const home = homeState || { 
    ...mockHomeData, 
    id: parseInt(id) || 1, 
  };

  // Dynamic Balance & Budget Percentage Calculations
  const currentBalance = home.currentBalance || 0;
  const budgetQuota = home.budgetQuotaTry || 1500;
  const budgetPercentage = Math.min(100, Math.round((currentBalance / budgetQuota) * 100));

  const formattedBalanceMajor = Math.floor(currentBalance).toLocaleString();
  const formattedBalanceMinor = (currentBalance % 1).toFixed(2).substring(2);

  // Anlık toplam cihaz gücü (canlı telemetriden)
  const totalDeviceWatt = appliances.reduce((acc, a) => acc + (a.currentWattage || 0), 0);

  // Günlük trend: PostgreSQL snapshot'larından türetilir (kWh = accumulatedWatt / 1.800.000).
  // Snapshot yoksa canlı anlık değerle tek noktalı fallback gösterilir.
  const sortedHistory = [...history].sort((a, b) => new Date(a.snapshotDate) - new Date(b.snapshotDate));
  const dailyTrendData = sortedHistory.length > 0
    ? sortedHistory.map((s) => ({
        time: new Date(s.snapshotDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
        consumption: +(((s.dailyWatt || 0) / 1800000)).toFixed(2),
        cost: +((s.dailyCost || 0)).toFixed(2),
      }))
    : [{ time: 'Bugün', consumption: +((totalDeviceWatt / 1000)).toFixed(2), cost: +currentBalance.toFixed(2) }];

  const weeklyCostData = dailyTrendData.map((d) => ({ day: d.time, cost: d.cost }));

  // Tüketim dağılımı: cihaz tiplerine göre anlık watt toplamı (canlı)
  const categoryMap = {};
  appliances.forEach((a) => {
    const key = a.type || 'Diğer';
    categoryMap[key] = (categoryMap[key] || 0) + (a.currentWattage || 0);
  });
  const categoryEntries = Object.entries(categoryMap).filter(([, v]) => v > 0);
  const categoryData = categoryEntries.length > 0
    ? categoryEntries.map(([name, value]) => ({ name, value: Math.round(value) }))
    : [{ name: 'Veri bekleniyor', value: 100 }];

  // Şartname NFR: ağ isteği sürerken skeleton göster (ilk yükleme)
  if (isLoading && !homeState) {
    return (
      <div className="w-full flex flex-col gap-8 animate-pulse">
        <div className="h-64 rounded-3xl bg-gray-100 dark:bg-[#1E271F]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 rounded-3xl bg-gray-100 dark:bg-[#1E271F] lg:col-span-1" />
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="h-28 rounded-3xl bg-gray-100 dark:bg-[#1E271F]" />
            <div className="h-64 rounded-3xl bg-gray-100 dark:bg-[#1E271F]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      
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
          onClick={() => navigate('/dashboard/meta-home', { state: { homeName: home.name, devices: appliances, squareMeters: home.squareMeters, roomLayout: home.roomLayout } })}
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
            <p className="text-gray-300 text-sm font-bold mt-1 uppercase tracking-wider">
              {home.roomLayout || '2+1'} Oda Düzeni • {home.squareMeters || 120} m² Büyüklük
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-gray-300 text-sm font-bold uppercase tracking-wider mb-1">Anlık Tüketim</p>
            <p className={`text-4xl font-black ${home.isCritical ? 'text-red-400' : 'text-green-400'}`}>
              {(totalDeviceWatt / 1000).toFixed(2)} <span className="text-2xl">kW</span>
            </p>
            <p className="text-white text-lg font-black mt-1">Toplam: {(home.totalKwh || 0).toFixed(2)} kWh</p>
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
                  Güvenli tüketim limitleri veya kota aşıldı. Lütfen cihazlarınızı kontrol edin!
                </p>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#1E271F] rounded-3xl p-6 border border-gray-100 dark:border-emerald-950/30 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kayıtlı Cihazlar</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#4C811F] bg-green-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">{appliances.length} Cihaz</span>
                <button 
                  onClick={() => setIsAddDeviceOpen(true)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-900 dark:bg-emerald-800 hover:bg-black text-white rounded-full shadow-sm transition-colors" 
                  title="Yeni Cihaz Ekle"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
            </div>
            
            {appliances.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-[#182119] rounded-2xl border border-dashed border-gray-200 dark:border-emerald-950/40">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Bu evde henüz kayıtlı bir cihaz yok.</p>
                <button 
                  onClick={() => setIsAddDeviceOpen(true)}
                  className="text-xs font-bold text-[#4C811F] hover:underline flex items-center gap-1 mx-auto"
                >
                  <Plus className="w-3.5 h-3.5" /> İlk Cihazınızı Ekleyin
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {appliances.map((app) => (
                  <div 
                    key={app.id} 
                    onClick={() => setSelectedDevice(app)}
                    className={`p-3 rounded-2xl border flex flex-col gap-3 cursor-pointer ${
                      app.isAnomalous 
                        ? 'border-red-300 bg-red-50/30' 
                        : 'border-gray-100 dark:border-emerald-950/20 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border-2 ${app.isAnomalous ? 'border-red-400' : 'border-transparent'}`}>
                        <img 
                          src={getDeviceLocalImage(app.type, app.name)} 
                          alt={app.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{app.name}</h4>
                            <div className="flex gap-2 items-center mt-0.5">
                              <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">{app.type || 'Akıllı Cihaz'}</span>
                              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                                {app.room || 'Salon'}
                              </span>
                            </div>
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
                        <span className={app.isAnomalous ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}>
                          {Math.round(app.currentWattage || 0)}W <span className="text-gray-400 font-medium">/ {Math.round(app.maxSafeWattage || 2000)}W</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-emerald-950/30 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${app.isAnomalous ? 'bg-red-500' : 'bg-[#4C811F]'}`}
                          style={{ width: `${Math.min(((app.currentWattage || 0) / (app.maxSafeWattage || 2000)) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1.5">
                        <span>Toplam</span>
                        <span>{(app.totalKwh || 0).toFixed(2)} kWh · ₺{(app.totalCost || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multiple Charts & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Row: Mini Stat Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#1E271F] p-6 rounded-3xl border border-gray-100 dark:border-emerald-950/30 shadow-sm flex flex-col justify-center">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <TurkishLira className="w-4 h-4" /> Birikimli Fatura
              </h4>
              <p className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                ₺ {formattedBalanceMajor}<span className="text-xl text-gray-400">.{formattedBalanceMinor}</span>
              </p>
              <div className="w-full bg-gray-100 dark:bg-emerald-950/30 h-1.5 rounded-full mt-2">
                <div className={`h-full rounded-full ${home.isCritical ? 'bg-red-500' : 'bg-orange-400'}`} style={{ width: `${budgetPercentage}%` }}></div>
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2 text-right">Bütçenin %{budgetPercentage}'i</p>
            </div>
            
            <div className="bg-white dark:bg-[#1E271F] p-6 rounded-3xl border border-gray-100 dark:border-emerald-950/30 shadow-sm flex flex-col justify-center">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Toplam Enerji
              </h4>
              <p className="text-4xl font-black text-[#4C811F] mb-2">
                {(home.totalKwh || 0).toFixed(2)} <span className="text-xl text-gray-400">kWh</span>
              </p>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2 text-right">Şimdiye kadarki toplam tüketim</p>
            </div>
          </div>

          {/* Chart 1: Daily Trend */}
          <div className="bg-white dark:bg-[#1E271F] p-6 rounded-3xl border border-gray-100 dark:border-emerald-950/30 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Günlük Tüketim Trendi (kWh)</h3>
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
            <div className="bg-white dark:bg-[#1E271F] p-6 rounded-3xl border border-gray-100 dark:border-emerald-950/30 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TurkishLira className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Günlük Maliyet (₺)</h3>
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
            <div className="bg-white dark:bg-[#1E271F] p-6 rounded-3xl border border-gray-100 dark:border-emerald-950/30 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <PieChartIcon className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tüketim Dağılımı</h3>
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
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  {categoryData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{entry.name}</span>
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
        onToggleDevice={handleToggleDevice}
        homeId={id}
      />

      {/* Add Device Slideover */}
      <AddDeviceSlideover 
        isOpen={isAddDeviceOpen} 
        onClose={() => setIsAddDeviceOpen(false)} 
        onAddDevice={(newDevice) => {
          setAppliances(prev => [...prev, newDevice]);
        }}
        homeId={id}
        roomLayout={home.roomLayout}
      />
    </div>
  );
};

export default HomeDetail;
