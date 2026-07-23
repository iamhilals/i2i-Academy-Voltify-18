import React from 'react';
import { BarChart3, TrendingDown, Clock, PieChart as PieIcon, Activity, Calendar, ArrowUpRight, ArrowDownRight, Zap, AlertTriangle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// Data for Year-over-Year Comparison
const yoyData = [
  { month: 'Oca', lastYear: 450, thisYear: 410 },
  { month: 'Şub', lastYear: 420, thisYear: 380 },
  { month: 'Mar', lastYear: 380, thisYear: 340 },
  { month: 'Nis', lastYear: 350, thisYear: 320 },
  { month: 'May', lastYear: 390, thisYear: 310 }, // 2026 AI optimization shines here
  { month: 'Haz', lastYear: 510, thisYear: 450 },
  { month: 'Tem', lastYear: 620, thisYear: 520 }, // Current month (partial/projected)
];

// Data for Category Breakdown
const categoryData = [
  { name: 'İklimlendirme (Klima)', value: 45 },
  { name: 'Beyaz Eşya', value: 25 },
  { name: 'Aydınlatma', value: 15 },
  { name: 'Elektronik & Eğlence', value: 10 },
  { name: 'Diğer (Prizler)', value: 5 },
];
const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#6B7280'];

// Data for Time-of-Day Heatmap (Area Chart)
const timeOfDayData = [
  { time: '00:00', load: 15 },
  { time: '04:00', load: 10 },
  { time: '08:00', load: 65 }, // Morning routine
  { time: '12:00', load: 35 },
  { time: '16:00', load: 40 },
  { time: '20:00', load: 85 }, // Evening peak
  { time: '23:59', load: 30 },
];

const Statistics = () => {
  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Gelişmiş İstatistikler</h1>
          </div>
          <p className="text-gray-500 font-medium ml-1">Verilerinizi derinlemesine inceleyin ve tüketim alışkanlıklarınızı keşfedin.</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg">Aylık</button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-bold rounded-lg transition-colors">Yıllık</button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Metric 1 */}
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" /> Toplam Tüketim (Temmuz)
            </h4>
            <div className="flex items-end gap-3 mb-2">
              <p className="text-4xl font-black text-gray-900">520<span className="text-xl text-gray-400 font-bold ml-1">kWh</span></p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md">
              <ArrowDownRight className="w-4 h-4" />
              <span>Geçen yıla göre %16 daha az</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" /> En Yoğun Gün
            </h4>
            <div className="flex items-end gap-3 mb-2">
              <p className="text-4xl font-black text-gray-900">Pazar</p>
            </div>
            <p className="text-sm font-medium text-gray-500">Ortalama <strong className="text-gray-900">24 kWh</strong> günlük tüketim</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
           <div className="relative z-10">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-blue-400" /> Verimlilik Skoru
            </h4>
            <div className="flex items-end gap-3 mb-2">
              <p className="text-4xl font-black text-white">%85<span className="text-xl text-gray-500 font-bold ml-1">/ 100</span></p>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-gradient-to-r from-blue-400 to-green-400 h-full rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        
        {/* Left Column (2 spans) - YoY Comparison */}
        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-400" /> Yıllık Tüketim Karşılaştırması
              </h3>
              <p className="text-sm text-gray-500 font-medium">2025 ve 2026 yıllarının aylık bazda analizi (kWh)</p>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-md bg-gray-200" />
                <span className="text-gray-500">2025 (Geçen Yıl)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-md bg-[#4C811F]" />
                <span className="text-gray-900">2026 (Bu Yıl)</span>
              </div>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yoyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} />
                <RechartsTooltip 
                  cursor={{fill: '#F9FAFB'}} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="lastYear" name="2025" fill="#E5E7EB" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="thisYear" name="2026" fill="#4C811F" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column - Category Breakdown */}
        <div className="xl:col-span-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-gray-400" /> Kategori Dağılımı
            </h3>
            <p className="text-sm text-gray-500 font-medium">Bu ayki tüketimin cihazlara göre bölümü</p>
          </div>

          <div className="flex-1 w-full relative flex flex-col items-center justify-center min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={categoryData} 
                  cx="50%" cy="45%" 
                  innerRadius={60} outerRadius={90} 
                  paddingAngle={5} dataKey="value" stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Center Text */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-3xl font-black text-gray-900">520</span>
              <span className="block text-xs font-bold text-gray-400">kWh</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="mt-auto space-y-3">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm font-bold text-gray-600">{entry.name}</span>
                </div>
                <span className="text-sm font-black text-gray-900">%{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Area - Heatmap / Time of day */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" /> Saatlik Tüketim Yoğunluğu (Heatmap)
            </h3>
            <p className="text-sm text-gray-500 font-medium">Günün hangi saatlerinde daha çok enerji harcanıyor?</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeOfDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/> {/* Gece (Mavi) */}
                  <stop offset="35%" stopColor="#F59E0B" stopOpacity={0.8}/> {/* Sabah (Turuncu) */}
                  <stop offset="70%" stopColor="#EF4444" stopOpacity={0.8}/> {/* Akşam (Kırmızı - Pik) */}
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8}/> {/* Gece Yarısı (Mavi) */}
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                labelStyle={{ fontWeight: 'bold', color: '#374151' }}
              />
              <Area 
                type="monotone" 
                dataKey="load" 
                stroke="none" 
                fill="url(#colorLoad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Heatmap Insights */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-gray-900 text-sm">Akşam Pik Saatleri (20:00)</h5>
              <p className="text-xs text-gray-500 font-medium mt-1">Elektrik birim fiyatının en yüksek olduğu bu saatlerde tüketiminiz zirve yapıyor. Çamaşır makinesini 22:00 sonrasına ertelemeyi düşünün.</p>
            </div>
          </div>
          <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-gray-900 text-sm">Gece Tüketimi Optimum</h5>
              <p className="text-xs text-gray-500 font-medium mt-1">Gece yarısından sabaha kadar olan durağan tüketiminiz oldukça düşük (10-15 kWh). Standby kaçaklarınız çok az.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Statistics;
