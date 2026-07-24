import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart as PieIcon, Clock, Zap, Activity, TrendingUp, Server } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { homeService } from '../services/homeService';

const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#6B7280', '#EF4444', '#0EA5E9'];

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ kwh: 0, bill: 0, deviceCount: 0, topDevice: null });
  const [deviceBars, setDeviceBars] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [peakHour, setPeakHour] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const homes = await homeService.getMyHomes();
        if (!active) return;
        const list = Array.isArray(homes) ? homes : [];

        const statuses = await Promise.all(list.map((h) => homeService.getHomeStatus(h.id).catch(() => null)));
        if (!active) return;

        // Cihazları (homeId ile) topla
        const appliances = [];
        let kwh = 0, bill = 0;
        statuses.forEach((st, i) => {
          if (!st) return;
          bill += st.currentBalance || 0;
          kwh += st.totalKwh || 0;
          (st.appliances || []).forEach((a) => appliances.push({ ...a, homeId: list[i].id }));
        });

        // En çok tüketen cihaz
        const topDevice = appliances.reduce((best, a) => (!best || (a.totalKwh || 0) > (best.totalKwh || 0) ? a : best), null);
        setTotals({ kwh, bill, deviceCount: appliances.length, topDevice });

        // Cihaz bazında kWh (çubuk) — en çok tüketen 8 cihaz
        const bars = appliances
          .map((a) => ({ name: a.name, kwh: +(a.totalKwh || 0).toFixed(2), watt: Math.round(a.currentWattage || 0) }))
          .sort((x, y) => y.kwh - x.kwh)
          .slice(0, 8);
        setDeviceBars(bars);

        // Kategori dağılımı (cihaz tipine göre). kWh yoksa anlık watt'a düş.
        const useKwh = appliances.some((a) => (a.totalKwh || 0) > 0);
        const byType = {};
        appliances.forEach((a) => {
          const key = a.type || 'Diğer';
          byType[key] = (byType[key] || 0) + (useKwh ? (a.totalKwh || 0) : (a.currentWattage || 0));
        });
        const catTotal = Object.values(byType).reduce((s, v) => s + v, 0) || 1;
        const cats = Object.entries(byType)
          .filter(([, v]) => v > 0)
          .map(([name, v]) => ({ name, value: Math.round((v / catTotal) * 100), raw: v }))
          .sort((a, b) => b.value - a.value);
        setCategoryData(cats);

        // Saatlik yük profili: her cihazın 24 saatlik gerçek ölçümlerini saate göre grupla
        const readingsArrays = await Promise.all(
          appliances.map((a) => homeService.getApplianceReadings(a.homeId, a.id, 1440).catch(() => []))
        );
        if (!active) return;
        const perApplHourly = readingsArrays.map((arr) => {
          const sum = new Array(24).fill(0), cnt = new Array(24).fill(0);
          (Array.isArray(arr) ? arr : []).forEach((r) => {
            const h = new Date(r.timestampMillis).getHours();
            sum[h] += r.watt; cnt[h] += 1;
          });
          return sum.map((s, h) => (cnt[h] ? s / cnt[h] : null));
        });
        const hourlyData = [];
        let peak = null;
        for (let h = 0; h < 24; h++) {
          let total = 0, any = false;
          perApplHourly.forEach((pa) => { if (pa[h] != null) { total += pa[h]; any = true; } });
          if (any) {
            const row = { time: `${String(h).padStart(2, '0')}:00`, load: Math.round(total) };
            hourlyData.push(row);
            if (!peak || row.load > peak.load) peak = row;
          }
        }
        setHourly(hourlyData);
        setPeakHour(peak);
      } catch (e) {
        // Hatalar api.js interceptor'ında toast olarak gösterilir
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const timer = setInterval(load, 20000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-36 rounded-3xl bg-gray-100 dark:bg-[#1E271F]" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 h-80 rounded-3xl bg-gray-100 dark:bg-[#1E271F]" />
          <div className="h-80 rounded-3xl bg-gray-100 dark:bg-[#1E271F]" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Gelişmiş İstatistikler</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium ml-1">Gerçek telemetriye dayalı tüketim analizi.</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#1E271F] border border-gray-100 dark:border-emerald-950/30 p-6 rounded-3xl shadow-sm">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-500" /> Toplam Tüketim
          </h4>
          <p className="text-4xl font-black text-gray-900 dark:text-white">{totals.kwh.toFixed(2)}<span className="text-xl text-gray-400 font-bold ml-1">kWh</span></p>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">{totals.deviceCount} cihaz üzerinden</p>
        </div>

        <div className="bg-white dark:bg-[#1E271F] border border-gray-100 dark:border-emerald-950/30 p-6 rounded-3xl shadow-sm">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" /> Toplam Fatura
          </h4>
          <p className="text-4xl font-black text-gray-900 dark:text-white">₺{totals.bill.toFixed(2)}</p>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">Birikimli tahmini tutar</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 p-6 rounded-3xl shadow-xl">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" /> En Çok Tüketen Cihaz
          </h4>
          <p className="text-3xl font-black text-white truncate">{totals.topDevice ? totals.topDevice.name : '—'}</p>
          <p className="text-sm font-medium text-gray-400 mt-2">
            {totals.topDevice ? `${(totals.topDevice.totalKwh || 0).toFixed(2)} kWh · ₺${(totals.topDevice.totalCost || 0).toFixed(2)}` : 'Henüz veri yok'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Device bar chart */}
        <div className="xl:col-span-2 bg-white dark:bg-[#1E271F] border border-gray-100 dark:border-emerald-950/30 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-gray-400" /> Cihaz Bazında Tüketim
          </h3>
          <p className="text-sm text-gray-500 font-medium mb-6">En çok enerji harcayan cihazlar (kWh)</p>
          <div className="h-80 w-full">
            {deviceBars.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium">Henüz cihaz verisi yok.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceBars} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} />
                  <RechartsTooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6' }} formatter={(v) => [`${v} kWh`, 'Tüketim']} />
                  <Bar dataKey="kwh" fill="#4C811F" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category pie */}
        <div className="xl:col-span-1 bg-white dark:bg-[#1E271F] border border-gray-100 dark:border-emerald-950/30 rounded-3xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
            <PieIcon className="w-5 h-5 text-gray-400" /> Kategori Dağılımı
          </h3>
          <p className="text-sm text-gray-500 font-medium mb-2">Tüketimin cihaz tipine göre bölümü</p>

          <div className="flex-1 w-full relative flex flex-col items-center justify-center min-h-[240px]">
            {categoryData.length === 0 ? (
              <div className="text-gray-400 text-sm font-medium">Henüz veri yok.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {categoryData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(v) => [`%${v}`, 'Pay']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="block text-3xl font-black text-gray-900 dark:text-white">{totals.kwh.toFixed(1)}</span>
                  <span className="block text-xs font-bold text-gray-400">kWh</span>
                </div>
              </>
            )}
          </div>

          {categoryData.length > 0 && (
            <div className="mt-auto space-y-3 pt-4">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{entry.name}</span>
                  </div>
                  <span className="text-sm font-black text-gray-900 dark:text-white">%{entry.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hourly load profile */}
      <div className="bg-white dark:bg-[#1E271F] border border-gray-100 dark:border-emerald-950/30 rounded-3xl p-6 shadow-sm mb-10">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-gray-400" /> Saatlik Tüketim Yoğunluğu
        </h3>
        <p className="text-sm text-gray-500 font-medium mb-6">Günün saatlerine göre ortalama toplam güç (W) — gerçek ölçümlerden</p>

        <div className="h-64 w-full">
          {hourly.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium text-center px-6">
              Saatlik profil, sistem çalıştıkça gerçek ölçümlerle dolar. Şimdilik yeterli veri yok.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} minTickGap={20} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(v) => [`${v} W`, 'Ortalama Güç']} />
                <Area type="monotone" dataKey="load" stroke="#3B82F6" strokeWidth={3} fill="url(#colorLoad)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {peakHour && (
          <div className="mt-6 bg-gray-50 dark:bg-[#182119] rounded-2xl p-4 border border-gray-100 dark:border-emerald-950/30 flex items-start gap-3">
            <Activity className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-gray-900 dark:text-white text-sm">Pik Saat: {peakHour.time}</h5>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                Ölçümlere göre en yüksek ortalama güç bu saatte (~{peakHour.load} W). Yüksek tarifeye denk geliyorsa
                yoğun cihazları bu saatin dışına ertelemeyi düşünün.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Statistics;
