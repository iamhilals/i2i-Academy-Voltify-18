import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Plus, Zap, Home as HomeIcon, PiggyBank, AlertTriangle } from 'lucide-react';
import AddHomeSlideover from '../components/AddHomeSlideover';
import { homeService } from '../services/homeService';

const mockHomes = [
  {
    id: 1,
    name: 'Villa i2i',
    consumption: '1.2 kW',
    status: 'Oktimal',
    health: 'MÜKEMMEL',
    healthScore: 5,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400&h=300',
    isCritical: false,
  },
  {
    id: 2,
    name: 'Crimson Lodge',
    consumption: '8.7 kW',
    status: 'Cezai Durum',
    health: 'KRİTİK',
    healthScore: 1,
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=400&h=300',
    isCritical: true,
    warning: 'Aşırı şebeke çekimi!'
  },
  {
    id: 3,
    name: 'Eco Habitat',
    consumption: '0.4 kW',
    status: 'Verimlilik PRO',
    health: 'KUSURSUZ',
    healthScore: 5,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400&h=300',
    isCritical: false,
  },
  {
    id: 4,
    name: 'Neo Studio',
    consumption: '3.1 kW',
    status: 'Stabil',
    health: 'ORTA',
    healthScore: 3,
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=400&h=300',
    isCritical: false,
  }
];

const HomeDashboard = () => {
  const navigate = useNavigate();
  const [isAddHomeOpen, setIsAddHomeOpen] = useState(false);
  const [homes, setHomes] = useState(mockHomes);

  useEffect(() => {
    async function loadHomes() {
      try {
        const backendHomes = await homeService.getMyHomes();
        if (Array.isArray(backendHomes) && backendHomes.length > 0) {
          const formatted = backendHomes.map((h, idx) => ({
            id: h.id,
            name: h.name || `Ev ${h.id}`,
            consumption: `${h.currentConsumptionKw || (h.appliances ? h.appliances.length * 0.5 : 1.2)} kW`,
            status: h.status || 'Aktif',
            health: 'MÜKEMMEL',
            healthScore: 5,
            image: mockHomes[idx % mockHomes.length].image,
            isCritical: false,
          }));
          setHomes(formatted);
        }
      } catch (err) {
        console.warn('Backend server unreachable or unauthenticated, using mock homes data:', err);
      }
    }
    loadHomes();
  }, []);


  return (
    <div className="max-w-6xl mx-auto">
      <AddHomeSlideover isOpen={isAddHomeOpen} onClose={() => setIsAddHomeOpen(false)} />
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Evlerim</h1>
          <p className="text-gray-500 font-medium mt-1">Tüm lokasyonlarınızın enerji durumu</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
            <Filter className="w-4 h-4" />
            Filtrele
          </button>
          <button 
            onClick={() => setIsAddHomeOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-[#4C811F] text-white rounded-xl hover:bg-green-700 transition-colors font-bold shadow-lg shadow-green-900/20"
          >
            <Plus className="w-5 h-5" />
            Ev Ekle
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-3xl p-6 flex items-center gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <Zap className="w-7 h-7 text-green-500" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Toplam Tüketim</h3>
            <p className="text-3xl font-black text-gray-900 tracking-tight">12.4 <span className="text-lg text-gray-500 font-bold">kW</span></p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 flex items-center gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <HomeIcon className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Aktif Evler</h3>
            <p className="text-3xl font-black text-gray-900 tracking-tight">14/15</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 flex items-center gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
            <PiggyBank className="w-7 h-7 text-orange-500" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Toplam Tasarruf</h3>
            <p className="text-3xl font-black text-green-600 tracking-tight">245.50 <span className="text-lg font-bold">TL</span></p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {homes.map((home) => (
          <div 
            key={home.id} 
            onClick={() => navigate(`/dashboard/home/${home.id}`)}
            className={`bg-white rounded-[2rem] p-4 cursor-pointer transition-all duration-300 hover:shadow-xl group
              ${home.isCritical 
                ? 'border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:border-red-500' 
                : 'border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-green-500/30'
              }`}
          >
            {/* Image Container */}
            <div className="relative h-48 rounded-3xl overflow-hidden mb-5">
              <img src={home.image} alt={home.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-white backdrop-blur-md shadow-lg
                  ${home.isCritical ? 'bg-red-500/90' : 'bg-[#4C811F]/90'}`}>
                  {home.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="px-2">
              <h3 className={`text-xl font-bold mb-4 ${home.isCritical ? 'text-red-500' : 'text-gray-900'}`}>{home.name}</h3>
              
              <div className="flex justify-between items-end mb-6">
                <span className="text-xs font-bold text-gray-400">Tüketim</span>
                <span className={`text-2xl font-black tracking-tight ${home.isCritical ? 'text-red-600' : 'text-[#4C811F]'}`}>
                  {home.consumption}
                </span>
              </div>

              {/* Health Bar */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-[10px] font-black tracking-wider uppercase">
                  <span className="text-gray-400">Enerji Sağlığı</span>
                  <span className={home.isCritical ? 'text-red-500' : home.healthScore > 3 ? 'text-[#4C811F]' : 'text-orange-500'}>
                    {home.health}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 flex-1 rounded-full ${
                        i <= home.healthScore 
                          ? (home.isCritical ? 'bg-red-500' : home.healthScore > 3 ? 'bg-[#4C811F]' : 'bg-orange-500')
                          : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Warning Badge */}
              {home.isCritical && (
                <div className="mt-4 flex items-center justify-center gap-2 py-2 px-3 bg-red-50 rounded-xl text-red-600 font-bold text-xs border border-red-100">
                  <AlertTriangle className="w-4 h-4" />
                  {home.warning}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeDashboard;
