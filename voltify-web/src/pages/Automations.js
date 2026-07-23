import React, { useState } from 'react';
import { Atom, Zap, Clock, TrendingDown, Bell, Plus, Check, Power, Shield, Settings2, Sparkles, ChevronDown } from 'lucide-react';

// Mock active routines
const activeRoutines = [
  { id: 1, title: 'Gece Modu Tasarrufu', trigger: 'Saat 22:00 olduğunda', action: 'Bulaşık Makinesini Çalıştır', isEnabled: true, savings: '₺45/ay' },
  { id: 2, title: 'Zirve Saat Koruması', trigger: 'Enerji fiyatı arttığında', action: 'Klimayı Eco Moda Al', isEnabled: true, savings: '₺120/ay' },
  { id: 3, title: 'Evden Çıkış', trigger: 'Evde kimse yoksa', action: 'Tüm Işıkları ve Bekleyen Cihazları Kapat', isEnabled: false, savings: '₺30/ay' },
];

const Automations = () => {
  const [routines, setRoutines] = useState(activeRoutines);
  
  // Rule builder states
  const [ifCondition, setIfCondition] = useState('');
  const [thenAction, setThenAction] = useState('');

  const toggleRoutine = (id) => {
    setRoutines(routines.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
  };

  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden">
        {/* Background Patterns */}
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
              Cihazlarınızı akıllı kurallarla birbirine bağlayın. Sistem sizin yerinize düşünsün, siz sadece tasarrufun tadını çıkarın.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center shrink-0">
            <p className="text-purple-200 text-sm font-bold uppercase tracking-wider mb-1">Otonom Tasarruf</p>
            <p className="text-5xl font-black text-white">₺ 195<span className="text-xl text-purple-300">/ay</span></p>
            <div className="flex items-center justify-center gap-2 mt-2 text-green-400 text-sm font-bold">
              <Shield className="w-4 h-4" />
              <span>3 Aktif Senaryo Koruması</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Routines Grid */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <Settings2 className="w-6 h-6 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900">Aktif Senaryolarım</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routines.map((routine) => (
            <div key={routine.id} className={`bg-white rounded-3xl p-6 border transition-all ${routine.isEnabled ? 'border-purple-200 shadow-lg shadow-purple-900/5' : 'border-gray-100 opacity-60'}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-900 text-lg">{routine.title}</h3>
                {/* Custom Toggle */}
                <button 
                  onClick={() => toggleRoutine(routine.id)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${routine.isEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${routine.isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center shrink-0 mt-0.5"><Clock className="w-3 h-3 text-gray-500" /></div>
                  <p className="text-sm font-medium text-gray-600"><span className="font-bold text-gray-900">Eğer:</span> {routine.trigger}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center shrink-0 mt-0.5"><Zap className="w-3 h-3 text-purple-600" /></div>
                  <p className="text-sm font-medium text-gray-600"><span className="font-bold text-purple-700">O Halde:</span> {routine.action}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 w-fit px-3 py-1.5 rounded-lg">
                <TrendingDown className="w-4 h-4" />
                Tahmini Kazanç: {routine.savings}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Rule Builder */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Yeni Senaryo Yarat (IFTTT)</h2>
        <p className="text-gray-500 font-medium mb-8">Kendi otomasyon zincirinizi saniyeler içinde kurun.</p>
        
        <div className="flex flex-col lg:flex-row items-center gap-6">
          
          {/* IF Box */}
          <div className="flex-1 w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 relative group hover:border-gray-200 transition-colors">
            <span className="absolute -top-3 left-6 px-3 py-1 bg-gray-900 text-white text-xs font-black tracking-widest uppercase rounded-full">
              EĞER (IF)
            </span>
            <label className="block text-sm font-bold text-gray-600 mb-2 mt-2">Tetikleyici seçin</label>
            <div className="relative">
              <select 
                value={ifCondition}
                onChange={(e) => setIfCondition(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 text-gray-900 font-bold text-lg px-4 py-4 rounded-2xl appearance-none cursor-pointer focus:outline-none focus:border-gray-900"
              >
                <option value="">Bir tetikleyici seçin...</option>
                <option value="saat_22">Saat 22:00 olduğunda</option>
                <option value="fiyat_artisi">Elektrik birim fiyatı yüksek tarifeye geçtiğinde</option>
                <option value="tuketim_asimi">Evin anlık tüketimi 5000W'ı aştığında</option>
                <option value="evden_cikis">Evden çıktığımda (Konum)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Connection Link */}
          <div className="hidden lg:flex w-16 h-16 bg-white border-2 border-purple-100 rounded-full items-center justify-center shrink-0 z-10 shadow-lg">
            <Zap className="w-6 h-6 text-purple-600 animate-pulse" />
          </div>
          {/* Mobile connection */}
          <div className="lg:hidden w-8 h-8 flex items-center justify-center">
            <Zap className="w-5 h-5 text-purple-600 animate-pulse" />
          </div>

          {/* THEN Box */}
          <div className="flex-1 w-full bg-purple-50 border-2 border-purple-100 rounded-3xl p-6 relative group hover:border-purple-200 transition-colors">
            <span className="absolute -top-3 left-6 px-3 py-1 bg-purple-600 text-white text-xs font-black tracking-widest uppercase rounded-full shadow-md shadow-purple-600/30">
              O HALDE (THEN)
            </span>
            <label className="block text-sm font-bold text-purple-800 mb-2 mt-2">Aksiyon seçin</label>
            <div className="relative">
              <select 
                value={thenAction}
                onChange={(e) => setThenAction(e.target.value)}
                className="w-full bg-white border-2 border-purple-200 text-purple-900 font-bold text-lg px-4 py-4 rounded-2xl appearance-none cursor-pointer focus:outline-none focus:border-purple-600"
              >
                <option value="">Bir aksiyon seçin...</option>
                <option value="klima_eco">Salondaki Klimayı Eco Moda Al</option>
                <option value="bulasik_baslat">Bulaşık Makinesini Çalıştır</option>
                <option value="isiklari_kapat">Tüm Işıkları ve Açık Cihazları Kapat</option>
                <option value="bildirim_at">Telefonuma Acil Uyarı Bildirimi At</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
            </div>
          </div>

        </div>

        <div className="mt-8 flex justify-end">
          <button 
            disabled={!ifCondition || !thenAction}
            className="px-8 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-900/20"
          >
            <Plus className="w-5 h-5" />
            Senaryoyu Kaydet ve Başlat
          </button>
        </div>
      </div>

      {/* Voltify AI Suggestions */}
      <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-8 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute right-0 top-0 opacity-10 text-blue-500">
           <Sparkles className="w-64 h-64 -mr-10 -mt-10" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-900">Voltify AI Alışkanlık Önerisi</h2>
          </div>
          <p className="text-blue-700 font-medium mb-6 max-w-2xl">
            Sisteme bağladığınız cihazların son 2 haftalık verilerini inceledik. Sabahları rutin olarak kettle'ı çalıştırıyorsunuz. Bunu otomatikleştirelim mi?
          </p>

          <div className="bg-white rounded-2xl p-5 border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-gray-900">Sabah Kahvesi Rutini</h4>
              <p className="text-sm font-medium text-gray-500 mt-1">
                <strong>Eğer</strong> hafta içi saat 07:15 olursa, <strong>O halde</strong> Su Isıtıcısını (Kettle) çalıştır.
              </p>
            </div>
            <button className="shrink-0 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition-colors">
              <Check className="w-4 h-4" />
              Öneriyi Kabul Et
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Automations;
