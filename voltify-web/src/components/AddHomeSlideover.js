import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Home, Building2, Briefcase, Plus, MapPin, Maximize, Zap, Sparkles, Image as ImageIcon, Upload } from 'lucide-react';
import { homeService } from '../services/homeService';

const defaultImages = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400&h=300',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=400&h=300'
];

const AddHomeSlideover = ({ isOpen, onClose, onSuccess }) => {
  const [homeName, setHomeName] = useState('');
  const [address, setAddress] = useState('');
  const [homeType, setHomeType] = useState('apartment'); // 'house', 'apartment', 'office'
  const [squareMeters, setSquareMeters] = useState('');
  const [roomLayout, setRoomLayout] = useState('2+1');
  const [hasSmartInfra, setHasSmartInfra] = useState(false);
  const [selectedImage, setSelectedImage] = useState(defaultImages[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef(null);

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setSelectedImage(dataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await homeService.registerHome({
        name: homeName,
        address: address,
        squareMeters: parseInt(squareMeters) || 100,
        type: homeType,
        roomLayout: roomLayout,
        imageUrl: selectedImage,
      });
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      console.warn('Could not register home to backend:', err);
    } finally {
      setIsSubmitting(false);
      onClose();
      // Reset form
      setHomeName('');
      setAddress('');
      setHomeType('apartment');
      setSquareMeters('');
      setRoomLayout('2+1');
      setHasSmartInfra(false);
      setSelectedImage(defaultImages[0]);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-500 z-[100] ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
      />

      {/* Slideover Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-[110] flex flex-col ${
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
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <Home className="w-4 h-4 text-gray-400" /> Oda Düzeni
                </label>
                <select
                  value={roomLayout}
                  onChange={(e) => setRoomLayout(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#4C811F] focus:bg-white outline-none transition-all font-bold text-gray-700"
                  required
                >
                  <option value="1+0">1+0 (Stüdyo)</option>
                  <option value="1+1">1+1</option>
                  <option value="2+1">2+1</option>
                  <option value="3+1">3+1</option>
                </select>
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

            {/* Ev Görseli (Image Selector) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Ev Görseli</label>
              
              {/* Preview */}
              <div className="relative w-full h-44 rounded-lg overflow-hidden shadow-sm border border-gray-100 group">
                <img src={selectedImage} alt="Seçilen ev" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white text-xs font-bold flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Yeni Yükle
                  </button>
                </div>
              </div>

              {/* Default Image Options */}
              <div className="flex gap-2 items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">veya seç:</span>
                <div className="flex gap-2 items-center">
                  {defaultImages.map((imgUrl, i) => (
                    <button 
                      key={i} 
                      type="button" 
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative w-12 h-8 rounded overflow-hidden shrink-0 transition-transform ${selectedImage === imgUrl ? 'ring-2 ring-[#4C811F] ring-offset-1 scale-105' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                    >
                      <img src={imgUrl} alt={`Default ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-8 rounded bg-gray-50 border border-gray-200 border-dashed flex items-center justify-center shrink-0 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
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
    </>,
    document.body
  );
};

export default AddHomeSlideover;
