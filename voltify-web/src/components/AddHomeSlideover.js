import React, { useState } from 'react';
import { X, Home, Building2, Briefcase, Plus, MapPin, Maximize, Zap, Sparkles } from 'lucide-react';

const AddHomeSlideover = ({ isOpen, onClose }) => {
  const [homeName, setHomeName] = useState('');
  const [address, setAddress] = useState('');
  const [homeType, setHomeType] = useState('apartment'); // 'house', 'apartment', 'office'
  const [squareMeters, setSquareMeters] = useState('');
  const [hasSmartInfra, setHasSmartInfra] = useState(false);

  // Calculate AI prediction based on square meters and type
  const calculateEstimate = () => {
    if (!squareMeters) return 0;
    let base = parseInt(squareMeters) * 3.5; // base calculation
    if (homeType === 'house') base *= 1.2;
    if (homeType === 'office') base *= 1.5;
    return Math.round(base);
  };

  const estimatedKwh = calculateEstimate();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call for adding a home
    console.log("Adding new home:", { homeName, address, homeType, squareMeters, hasSmartInfra });
    onClose();
    // Reset form
    setHomeName('');
    setAddress('');
    setHomeType('apartment');
    setSquareMeters('');
    setHasSmartInfra(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-500 z-[60] ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
      />

      {/* Slideover Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-[70] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-28 bg-gradient-to-br from-gray-900 to-gray-800 px-8 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <Home className="w-48 h-48 -mr-10 -mt-10 text-white" />
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-md">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white leading-tight">Yeni Ev Ekle</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Sisteme Lokasyon Tanımla</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Mekan Adı */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mekan Adı</label>
              <input 
                type="text" 
                value={homeName}
                onChange={(e) => setHomeName(e.target.value)}
                placeholder="Örn: Bodrum Yazlık" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#4C811F] focus:bg-white outline-none transition-all font-medium text-gray-900"
                required
              />
            </div>

            {/* Mekan Tipi Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mekan Tipi</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setHomeType('house')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    homeType === 'house' ? 'border-[#4C811F] bg-green-50 text-[#4C811F]' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Home className="w-6 h-6" />
                  <span className="text-xs font-bold">Müstakil</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHomeType('apartment')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    homeType === 'apartment' ? 'border-[#4C811F] bg-green-50 text-[#4C811F]' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-6 h-6" />
                  <span className="text-xs font-bold">Apartman</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHomeType('office')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    homeType === 'office' ? 'border-[#4C811F] bg-green-50 text-[#4C811F]' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-6 h-6" />
                  <span className="text-xs font-bold">Ofis</span>
                </button>
              </div>
            </div>

            {/* Metrekare & Adres Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <Maximize className="w-4 h-4 text-gray-400" /> Büyüklük (m²)
                </label>
                <input 
                  type="number" 
                  value={squareMeters}
                  onChange={(e) => setSquareMeters(e.target.value)}
                  placeholder="Örn: 120" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#4C811F] focus:bg-white outline-none transition-all font-medium text-gray-900"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" /> Tam Adres
                </label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Açık adres giriniz..." 
                  rows="2"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#4C811F] focus:bg-white outline-none transition-all font-medium text-gray-900 resize-none"
                  required
                />
              </div>
            </div>

            {/* Akıllı Altyapı Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Akıllı Ev Altyapısı</h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Bu lokasyonda IoT sensörleri var mı?</p>
              </div>
              <button 
                type="button"
                onClick={() => setHasSmartInfra(!hasSmartInfra)}
                className={`w-12 h-6 rounded-full relative transition-colors ${hasSmartInfra ? 'bg-[#4C811F]' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${hasSmartInfra ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* AI Estimation Box */}
            <div className={`mt-4 p-5 rounded-2xl border transition-all duration-500 ${squareMeters ? 'bg-blue-50 border-blue-100 opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none hidden'}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Voltify AI Bütçe Tahmini</h4>
                  <p className="text-xs text-blue-700 font-medium leading-relaxed">
                    Yapay zeka verilerimize göre {squareMeters}m²'lik bir {homeType === 'apartment' ? 'apartman dairesi' : homeType === 'house' ? 'müstakil ev' : 'ofis'} için aylık ideal enerji tüketim hedefiniz:
                  </p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-blue-900">{estimatedKwh}</span>
                    <span className="text-sm font-bold text-blue-600">kWh/ay</span>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer (Action Button) */}
        <div className="p-6 bg-white border-t border-gray-100 shrink-0">
          <button 
            onClick={handleSubmit}
            disabled={!homeName || !squareMeters}
            className="w-full py-4 bg-[#4C811F] hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2 text-lg"
          >
            <Plus className="w-5 h-5" />
            Lokasyonu Kaydet
          </button>
        </div>

      </div>
    </>
  );
};

export default AddHomeSlideover;
