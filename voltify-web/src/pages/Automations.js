import React, { useState, useEffect } from 'react';
import { Atom, Zap, Clock, Plus, Shield, Settings2, ChevronDown, Info, Trash2 } from 'lucide-react';
import { homeService } from '../services/homeService';

// Tetikleyici tipleri (sabit kavramlar - sayısal mock değil)
const TRIGGER_OPTIONS = [
  { value: 'saat_22', label: 'Saat 22:00 olduğunda' },
  { value: 'fiyat_artisi', label: 'Elektrik yüksek tarifeye geçtiğinde' },
  { value: 'tuketim_asimi', label: "Evin anlık tüketimi güç kotasını aştığında" },
  { value: 'evden_cikis', label: 'Evden çıktığımda' },
];

const Automations = () => {
  // Senaryolar boş başlar (gerçek durum) — kullanıcı aşağıdaki oluşturucudan ekler.
  const [routines, setRoutines] = useState([]);
  const [ifCondition, setIfCondition] = useState('');
  const [thenAction, setThenAction] = useState('');
  const [actionOptions, setActionOptions] = useState([{ value: 'notify', label: 'Telefonuma bildirim gönder' }]);

  // Aksiyon menüsünü kullanıcının GERÇEK cihazlarından doldur
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const homes = await homeService.getMyHomes();
        if (!active) return;
        const names = new Set();
        (Array.isArray(homes) ? homes : []).forEach((h) => {
          (h.appliances || []).forEach((a) => { if (a.name) names.add(a.name); });
        });
        const opts = [];
        names.forEach((n) => {
          opts.push({ value: `${n}::off`, label: `${n} — Kapat` });
          opts.push({ value: `${n}::eco`, label: `${n} — Eco moda al` });
        });
        opts.push({ value: 'notify', label: 'Telefonuma bildirim gönder' });
        setActionOptions(opts);
      } catch (e) {
        // Hata toast'ı api.js interceptor'ında gösterilir
      }
    })();
    return () => { active = false; };
  }, []);

  const activeCount = routines.filter((r) => r.isEnabled).length;

  const toggleRoutine = (id) => {
    setRoutines(routines.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r)));
  };

  const removeRoutine = (id) => setRoutines(routines.filter((r) => r.id !== id));

  const saveRoutine = () => {
    const trigger = TRIGGER_OPTIONS.find((t) => t.value === ifCondition);
    const action = actionOptions.find((a) => a.value === thenAction);
    if (!trigger || !action) return;
    setRoutines((prev) => [
      ...prev,
      { id: Date.now(), title: 'Yeni Senaryo', trigger: trigger.label, action: action.label, isEnabled: true },
    ]);
    setIfCondition('');
    setThenAction('');
  };

  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-300">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Atom className="w-6 h-6 text-purple-200" />
              </div>
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-100 rounded-full text-xs font-bold tracking-widest uppercase">
                Voltify Otonom Merkez
              </span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Otonom Senaryolar</h1>
            <p className="text-purple-200 font-medium max-w-xl">
              Cihazlarınızı akıllı kurallarla birbirine bağlayın. Aşağıdaki oluşturucuyla kendi "Eğer → O Halde" senaryolarınızı kurun.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center shrink-0">
            <p className="text-purple-200 text-sm font-bold uppercase tracking-wider mb-1">Aktif Senaryo</p>
            <p className="text-5xl font-black text-white">{activeCount}</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-purple-200 text-sm font-bold">
              <Shield className="w-4 h-4" />
              <span>{routines.length} senaryo tanımlı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Routines Grid */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="w-6 h-6 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Senaryolarım</h2>
        </div>

        {routines.length === 0 ? (
          <div className="bg-white dark:bg-[#1E271F] border border-dashed border-gray-200 dark:border-emerald-950/40 rounded-3xl p-10 text-center">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/30 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Atom className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Henüz senaryo yok</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
              Aşağıdaki oluşturucudan bir tetikleyici ve aksiyon seçerek ilk otomasyon senaryonuzu tanımlayın.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {routines.map((routine) => (
              <div key={routine.id} className={`bg-white dark:bg-[#1E271F] rounded-3xl p-6 border transition-all ${routine.isEnabled ? 'border-purple-200 dark:border-purple-900/40 shadow-lg shadow-purple-900/5' : 'border-gray-100 dark:border-emerald-950/30 opacity-60'}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{routine.title}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRoutine(routine.id)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${routine.isEnabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${routine.isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-[#182119] flex items-center justify-center shrink-0 mt-0.5"><Clock className="w-3 h-3 text-gray-500" /></div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300"><span className="font-bold text-gray-900 dark:text-white">Eğer:</span> {routine.trigger}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center shrink-0 mt-0.5"><Zap className="w-3 h-3 text-purple-600" /></div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300"><span className="font-bold text-purple-700 dark:text-purple-400">O Halde:</span> {routine.action}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${routine.isEnabled ? 'text-green-600 bg-green-50 dark:bg-green-950/30' : 'text-gray-500 bg-gray-50 dark:bg-[#182119]'}`}>
                    {routine.isEnabled ? 'Aktif' : 'Pasif'}
                  </span>
                  <button onClick={() => removeRoutine(routine.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Sil">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Rule Builder */}
      <div className="bg-white dark:bg-[#1E271F] rounded-3xl p-8 border border-gray-100 dark:border-emerald-950/30 shadow-sm mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Yeni Senaryo Yarat (IFTTT)</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Kendi otomasyon zincirinizi saniyeler içinde kurun. Aksiyonlar kayıtlı gerçek cihazlarınızdan gelir.</p>

        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* IF Box */}
          <div className="flex-1 w-full bg-gray-50 dark:bg-[#182119] border-2 border-gray-100 dark:border-emerald-950/40 rounded-3xl p-6 relative">
            <span className="absolute -top-3 left-6 px-3 py-1 bg-gray-900 text-white text-xs font-black tracking-widest uppercase rounded-full">EĞER (IF)</span>
            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 mt-2">Tetikleyici seçin</label>
            <div className="relative">
              <select
                value={ifCondition}
                onChange={(e) => setIfCondition(e.target.value)}
                className="w-full bg-white dark:bg-[#1E271F] border-2 border-gray-200 dark:border-emerald-950/40 text-gray-900 dark:text-white font-bold text-lg px-4 py-4 rounded-2xl appearance-none cursor-pointer focus:outline-none focus:border-gray-900"
              >
                <option value="">Bir tetikleyici seçin...</option>
                {TRIGGER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="hidden lg:flex w-16 h-16 bg-white dark:bg-[#1E271F] border-2 border-purple-100 dark:border-purple-900/40 rounded-full items-center justify-center shrink-0 z-10 shadow-lg">
            <Zap className="w-6 h-6 text-purple-600 animate-pulse" />
          </div>

          {/* THEN Box */}
          <div className="flex-1 w-full bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-100 dark:border-purple-900/40 rounded-3xl p-6 relative">
            <span className="absolute -top-3 left-6 px-3 py-1 bg-purple-600 text-white text-xs font-black tracking-widest uppercase rounded-full shadow-md shadow-purple-600/30">O HALDE (THEN)</span>
            <label className="block text-sm font-bold text-purple-800 dark:text-purple-300 mb-2 mt-2">Aksiyon seçin</label>
            <div className="relative">
              <select
                value={thenAction}
                onChange={(e) => setThenAction(e.target.value)}
                className="w-full bg-white dark:bg-[#1E271F] border-2 border-purple-200 dark:border-purple-900/40 text-purple-900 dark:text-purple-200 font-bold text-lg px-4 py-4 rounded-2xl appearance-none cursor-pointer focus:outline-none focus:border-purple-600"
              >
                <option value="">Bir aksiyon seçin...</option>
                {actionOptions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={saveRoutine}
            disabled={!ifCondition || !thenAction}
            className="px-8 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-900/20"
          >
            <Plus className="w-5 h-5" />
            Senaryoyu Ekle
          </button>
        </div>
      </div>

      {/* Honest info banner */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-blue-700 dark:text-blue-300 text-sm font-medium leading-relaxed">
          Senaryolar arayüz üzerinde tanımlanır ve bu oturumda saklanır. Otomasyonların cihazları fiziksel olarak
          tetiklemesi için ayrı bir kural/otomasyon motoru gerekir; bu sürümde senaryolar örnek amaçlıdır.
        </p>
      </div>

    </div>
  );
};

export default Automations;
