import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Lightbulb, Zap, Leaf, AlertTriangle, Inbox as InboxIcon } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { homeService } from '../services/homeService';
import { inboxService } from '../services/inboxService';

const CATEGORY_LABEL = {
  BREACH_80: { label: '%80 Kota', tone: 'text-orange-700 bg-orange-100' },
  BREACH_100: { label: '%100 Ceza', tone: 'text-red-700 bg-red-100' },
  ANOMALY_DETECTED: { label: 'Anomali', tone: 'text-red-700 bg-red-100' },
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
};

// Gerçek snapshot'lardan (kümülatif kWh) + canlı güce dayalı tahminden 30 günlük projeksiyon
const buildProjection = (historyList, avgDailyKwh, liveTotalKwh) => {
  const byDate = {};
  historyList.forEach((hist) => {
    (hist || []).forEach((s) => {
      const kwh = (s.dailyWatt || 0) / 1800000;
      byDate[s.snapshotDate] = (byDate[s.snapshotDate] || 0) + kwh;
    });
  });
  const actualDates = Object.keys(byDate).sort();
  const actualPoints = actualDates.map((d) => ({ date: d, kwh: +byDate[d].toFixed(2) }));

  const startCum = actualPoints.length ? actualPoints[actualPoints.length - 1].kwh : +(liveTotalKwh || 0).toFixed(2);
  const startDate = actualPoints.length ? new Date(actualPoints[actualPoints.length - 1].date) : new Date();

  const data = actualPoints.map((p, i) => ({
    label: fmtDate(p.date),
    actual: p.kwh,
    predicted: i === actualPoints.length - 1 ? p.kwh : null, // köprü noktası
  }));
  if (data.length === 0) {
    data.push({ label: 'Bugün', actual: startCum, predicted: startCum });
  }
  const bridgeIndex = data.length - 1;

  for (let i = 1; i <= 30; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    data.push({
      label: d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
      actual: null,
      predicted: +(startCum + avgDailyKwh * i).toFixed(2),
    });
  }
  return { data, bridgeLabel: data[bridgeIndex].label };
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ instantKw: 0, totalKwh: 0, balance: 0, predictedBill: 0, avgDailyKwh: 0, co2: 0, rate: 2.07 });
  const [chart, setChart] = useState({ data: [], bridgeLabel: '' });
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const homes = await homeService.getMyHomes();
        if (!active) return;
        const list = Array.isArray(homes) ? homes : [];

        const statuses = await Promise.all(list.map((h) => homeService.getHomeStatus(h.id).catch(() => null)));
        const histories = await Promise.all(list.map((h) => homeService.getHomeHistory(h.id).catch(() => null)));
        if (!active) return;

        let instantWatt = 0, totalKwh = 0, balance = 0, rateSum = 0, rateCount = 0;
        statuses.filter(Boolean).forEach((st) => {
          (st.appliances || []).forEach((a) => { instantWatt += a.currentWattage || 0; });
          totalKwh += st.totalKwh || 0;
          balance += st.currentBalance || 0;
          if (st.baseRate) { rateSum += st.baseRate; rateCount += 1; }
        });
        const rate = rateCount ? rateSum / rateCount : 2.07;
        const instantKw = instantWatt / 1000;
        const avgDailyKwh = instantKw * 24;             // mevcut güce göre günlük tüketim
        const predictedBill = avgDailyKwh * 30 * rate;  // 30 günlük tahmini fatura
        const co2 = totalKwh * 0.42;                    // TR şebeke faktörü ~0.42 kg CO2/kWh

        const historyList = histories.filter(Boolean).map((p) => (Array.isArray(p) ? p : (p && Array.isArray(p.content) ? p.content : [])));
        const projection = buildProjection(historyList, avgDailyKwh, totalKwh);

        setMetrics({ instantKw, totalKwh, balance, predictedBill, avgDailyKwh, co2, rate });
        setChart(projection);

        const alerts = await inboxService.getMessages().catch(() => []);
        if (active) setRecommendations(Array.isArray(alerts) ? alerts.slice(0, 5) : []);
      } catch (e) {
        // Hatalar api.js interceptor'ında toast olarak gösterilir
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const timer = setInterval(load, 15000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-8 animate-pulse">
        <div className="h-40 rounded-3xl bg-gray-100 dark:bg-[#1E271F]" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 h-96 rounded-3xl bg-gray-100 dark:bg-[#1E271F]" />
          <div className="h-96 rounded-3xl bg-gray-100 dark:bg-[#1E271F]" />
        </div>
      </div>
    );
  }

  const billMajor = Math.floor(metrics.predictedBill).toLocaleString('tr-TR');
  const billMinor = (metrics.predictedBill % 1).toFixed(2).substring(2);

  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-300">

      {/* AI Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
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
              Evlerinizin canlı gücü ve tarife oranlarına göre önümüzdeki 30 günlük tahmini faturanız.
              Anlık güç: <strong className="text-white">{metrics.instantKw.toFixed(2)} kW</strong> · Toplam tüketim: <strong className="text-white">{metrics.totalKwh.toFixed(2)} kWh</strong>.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center shrink-0">
            <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">30 Günlük Tahmini Fatura</p>
            <p className="text-5xl font-black text-white">₺ {billMajor}<span className="text-xl text-blue-300">.{billMinor}</span></p>
            <div className="flex items-center justify-center gap-2 mt-2 text-blue-200 text-sm font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Mevcut günlük tüketim: {metrics.avgDailyKwh.toFixed(1)} kWh</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left: Projection chart */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#1E271F] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-emerald-950/30">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">30 Günlük Tüketim Projeksiyonu</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Gerçekleşen kümülatif tüketim ve tahmini seyir (kWh)</p>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-600 dark:text-gray-300">Gerçekleşen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-300 border-2 border-indigo-400 border-dashed" />
                  <span className="text-gray-600 dark:text-gray-300">AI Tahmini</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} minTickGap={28} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(value, name) => [`${value} kWh`, name === 'actual' ? 'Gerçekleşen' : 'AI Tahmini']}
                  />
                  {chart.bridgeLabel && (
                    <ReferenceLine x={chart.bridgeLabel} stroke="#9CA3AF" strokeDasharray="3 3" label={{ position: 'top', value: 'BUGÜN', fill: '#6B7280', fontSize: 10, fontWeight: 'bold' }} />
                  )}
                  <Area type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={4} fill="url(#colorActual)" connectNulls isAnimationActive={false} />
                  <Area type="monotone" dataKey="predicted" stroke="#818CF8" strokeWidth={4} strokeDasharray="5 5" fill="url(#colorPredicted)" connectNulls isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real-derived insight cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-100 rounded-3xl p-6 relative overflow-hidden">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-green-900 mb-2">Karbon Ayak İzi</h3>
              <p className="text-green-700 text-sm font-medium">
                Toplam <strong className="text-green-900">{metrics.totalKwh.toFixed(2)} kWh</strong> tüketimin
                yaklaşık <strong className="text-green-900">{metrics.co2.toFixed(1)} kg CO₂</strong> karşılığı var
                (TR şebeke faktörü 0,42 kg/kWh).
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 relative overflow-hidden">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Anlık Güç Durumu</h3>
              <p className="text-blue-700 text-sm font-medium">
                Şu an tüm cihazların çektiği toplam güç <strong className="text-blue-900">{metrics.instantKw.toFixed(2)} kW</strong>.
                Bu hızla devam ederse günde <strong className="text-blue-900">{metrics.avgDailyKwh.toFixed(1)} kWh</strong> tüketirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Real AI recommendations */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-[#1E271F] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-emerald-950/30 h-full">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Tasarruf Önerileri</h2>
            </div>

            {recommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 text-gray-400">
                <InboxIcon className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-medium max-w-xs">
                  Henüz AI önerisi yok. Bir ev kotasını (%80/%100) aştığında veya bir cihaz anomali verdiğinde,
                  Gemini'nin ürettiği gerçek tasarruf önerileri burada listelenir.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((r) => {
                  const meta = CATEGORY_LABEL[r.category] || { label: 'Bildirim', tone: 'text-gray-700 bg-gray-100' };
                  return (
                    <div key={r.id} className="border border-gray-100 dark:border-emerald-950/30 rounded-2xl p-5">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{r.homeName || 'Eviniz'}</h4>
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${meta.tone}`}>{meta.label}</span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium leading-relaxed whitespace-pre-line line-clamp-6">
                        {r.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-emerald-950/30 flex items-center justify-center gap-2 text-gray-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Gerçek olaylara dayalı öneriler</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
