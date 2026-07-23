import React from 'react';
import { Brain, TrendingDown, TrendingUp, AlertTriangle, Lightbulb, Zap, BatteryCharging, Leaf } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

// Mock data for AI Prediction Chart
// First 15 days are actual (historical), next 15 days are predicted
const predictionData = [
  { day: '1', actual: 12, predicted: null },
  { day: '3', actual: 14, predicted: null },
  { day: '6', actual: 11, predicted: null },
  { day: '9', actual: 16, predicted: null },
  { day: '12', actual: 13, predicted: null },
  { day: '15', actual: 15, predicted: 15 }, // Transition point
  { day: '18', actual: null, predicted: 18 },
  { day: '21', actual: null, predicted: 14 },
  { day: '24', actual: null, predicted: 22 }, // Expected spike (e.g., weekend)
  { day: '27', actual: null, predicted: 16 },
  { day: '30', actual: null, predicted: 12 },
];

const Analytics = () => {
  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
      
      {/* AI Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-200" />
              </div>
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-100 rounded-full text-xs font-bold tracking-widest uppercase">
                Voltify AI Engine v2.0
              </span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Gelecek Ay Tahmin Raporu</h1>
            <p className="text-blue-200 font-medium max-w-xl">
              Yapay zeka asistanınız geçmiş 90 günlük kullanım alışkanlıklarınızı analiz etti. 
              İşte gelecek ayki beklenen tablonuz ve tasarruf fırsatlarınız.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center shrink-0">
            <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">Tahmini Fatura</p>
            <p className="text-5xl font-black text-white">₺ 1,840<span className="text-xl text-blue-300">.50</span></p>
            <div className="flex items-center justify-center gap-2 mt-2 text-green-400 text-sm font-bold">
              <TrendingDown className="w-4 h-4" />
              <span>Geçen aya göre %12 daha düşük</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Big Chart */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900">30 Günlük Yapay Zeka Projeksiyonu</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Gerçekleşen tüketim ve gelecek tahminleri (kWh)</p>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-600">Gerçekleşen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-300 border-2 border-indigo-400 border-dashed" />
                  <span className="text-gray-600">AI Tahmini</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                    </linearGradient>
                    {/* Custom pattern for predicted area */}
                    <pattern id="patternPredicted" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                      <line x1="0" y="0" x2="0" y2="8" stroke="#818CF8" strokeWidth="2" strokeOpacity="0.3" />
                    </pattern>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                  />
                  
                  {/* Vertical line separating Actual vs Predicted */}
                  <ReferenceLine x="15" stroke="#9CA3AF" strokeDasharray="3 3" label={{ position: 'top', value: 'BUGÜN', fill: '#6B7280', fontSize: 10, fontWeight: 'bold' }} />
                  
                  <Area type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={4} fill="url(#colorActual)" />
                  <Area type="monotone" dataKey="predicted" stroke="#818CF8" strokeWidth={4} strokeDasharray="5 5" fill="url(#patternPredicted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-100 rounded-3xl p-6 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-green-900 mb-2">Karbon Ayak İzi</h3>
                <p className="text-green-700 text-sm font-medium mb-4">
                  Yapay zeka optimizasyonları sayesinde gelecek ay doğaya <strong className="text-green-900">45kg daha az CO2</strong> salınımı yapmanız bekleniyor. Bu 2 yetişkin ağaç dikmekle eşdeğer!
                </p>
                <button className="text-green-800 font-bold text-sm hover:underline">Sertifikayı Görüntüle →</button>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                  <BatteryCharging className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-orange-900 mb-2">Yoğunluk Uyarısı</h3>
                <p className="text-orange-700 text-sm font-medium mb-4">
                  Tahminlere göre <strong className="text-orange-900">24-25 Temmuz</strong> hafta sonu enerji tüketiminiz %30 artacak (Sıcak hava dalgası bekleniyor).
                </p>
                <button className="text-orange-800 font-bold text-sm hover:underline">Klima Otomasyonu Kur →</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Actionable Advice */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
            <div className="flex items-center gap-3 mb-8">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">Otonom Tasarruf Önerileri</h2>
            </div>

            <div className="space-y-4">
              
              {/* Suggestion 1 */}
              <div className="border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-sm">Buzdolabı Optimizasyonu</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-black">- ₺140</span>
                </div>
                <p className="text-gray-500 text-xs font-medium leading-relaxed mb-4">
                  Buzdolabınızı mevcut 2°C yerine ideal olan 4°C'ye alırsanız gıdalarınız bozulmaz ve aylık faturanızda ciddi düşüş yaşanır.
                </p>
                <button className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors">
                  Otomatik Ayarla (İzin Ver)
                </button>
              </div>

              {/* Suggestion 2 */}
              <div className="border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-sm">Kombi / Su Isıtıcı Zamanlaması</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-black">- ₺85</span>
                </div>
                <p className="text-gray-500 text-xs font-medium leading-relaxed mb-4">
                  Su ısıtıcınız tüm gün çalışıyor. Yapay zeka bunu sadece sabah ve akşam kullanımlarınızdan 30 dk önce çalışacak şekilde programlayabilir.
                </p>
                <button className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors">
                  Zamanlamayı Uygula
                </button>
              </div>

              {/* Suggestion 3 */}
              <div className="border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-sm">Gizli Tüketim Tespiti</h4>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-black">Tehlike</span>
                </div>
                <p className="text-gray-500 text-xs font-medium leading-relaxed mb-4">
                  Televizyon ve Ses sisteminiz "Kapalı" konumda olmalarına rağmen gece boyunca toplam 45W enerji çekmeye devam ediyor (Standby sızıntısı).
                </p>
                <button className="w-full py-2 bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 text-xs font-bold rounded-xl transition-colors">
                  Akıllı Priz Satın Al
                </button>
              </div>

            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Voltify AI 24/7 Devrede</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
