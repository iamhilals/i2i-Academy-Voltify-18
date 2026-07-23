import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Cpu, Save, Search } from 'lucide-react';

const AddDeviceSlideover = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Autocomplete states
  const [deviceName, setDeviceName] = useState('');
  const [safeLimit, setSafeLimit] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Pre-defined fixed list. We use state so we can add to it if the user types something new.
  const [deviceList, setDeviceList] = useState([
    'Akıllı Ampul',
    'Akıllı Priz',
    'Ankastre Fırın',
    'Ankastre Ocak',
    'Aspiratör / Davlumbaz',
    'Baskül (Akıllı)',
    'Bilgisayar (Masaüstü)',
    'Bulaşık Makinesi',
    'Buzdolabı',
    'Çamaşır Kurutma Makinesi',
    'Çamaşır Makinesi',
    'Çay Makinesi',
    'Derin Dondurucu',
    'Dizüstü Bilgisayar (Laptop)',
    'Ekmek Kızartma Makinesi',
    'Elektrikli Bisiklet Şarjı',
    'Elektrikli Isıtıcı (Ufo/Radyatör)',
    'Elektrikli Süpürge',
    'Fritöz (Airfryer)',
    'Fırın (Mini / Midi)',
    'Güvenlik Kamerası',
    'Hava Temizleyici',
    'Kahve Makinesi',
    'Klima',
    'Kombi',
    'Mikrodalga Fırın',
    'Mikser / Blender',
    'Modem / Router',
    'Monitör',
    'Oyun Konsolu (PS/Xbox)',
    'Projeksiyon Cihazı',
    'Robot Süpürge',
    'Saç Kurutma Makinesi',
    'Ses Sistemi / Ev Sineması',
    'Su Isıtıcısı (Kettle)',
    'Su Sebili',
    'Şarj İstasyonu (EV)',
    'Televizyon',
    'Tost Makinesi',
    'Vantilatör',
    'Ütü'
  ]);

  // Filter the list based on user input (case-insensitive and ignores Turkish characters properly if possible)
  const filteredDevices = deviceList.filter(device => 
    device.toLocaleLowerCase('tr-TR').startsWith(deviceName.toLocaleLowerCase('tr-TR'))
  );

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // If the user typed a completely new device name, add it to our list for next time
      if (deviceName.trim() !== '' && !deviceList.some(d => d.toLocaleLowerCase('tr-TR') === deviceName.toLocaleLowerCase('tr-TR'))) {
        setDeviceList(prev => [...prev, deviceName.trim()].sort());
      }

      setIsSubmitting(false);
      setDeviceName(''); // reset for next time
      onClose();
    }, 1000);
  };

  // Helper function to simulate AI database for safe limits
  const getEstimatedLimit = (deviceName) => {
    const name = deviceName.toLocaleLowerCase('tr-TR');
    if (name.includes('klima')) return 2500;
    if (name.includes('çamaşır makinesi')) return 2200;
    if (name.includes('fırın')) return 2000;
    if (name.includes('bulaşık')) return 1800;
    if (name.includes('süpürge')) return 1500;
    if (name.includes('ütü')) return 2400;
    if (name.includes('buzdolabı')) return 350;
    if (name.includes('televizyon')) return 400;
    if (name.includes('bilgisayar')) return 600;
    if (name.includes('kombi')) return 150;
    if (name.includes('aydınlatma') || name.includes('ampul')) return 60;
    if (name.includes('şarj')) return 3000; // EV şarj vs
    return 1000; // Default fallback
  };

  const handleSelectDevice = (name) => {
    setDeviceName(name);
    setShowDropdown(false);
    
    // Auto-fill the safe limit using our simulated AI logic
    setSafeLimit(getEstimatedLimit(name).toString());
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[200] shadow-2xl transition-transform duration-500 transform flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Yeni Cihaz Ekle</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="add-device-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Autocomplete Input */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-sm font-bold text-gray-700">Cihaz Adı</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={deviceName}
                  onChange={(e) => {
                    setDeviceName(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Örn: Akıllı Süpürge, Salondaki Klima..." 
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#4C811F] focus:bg-white outline-none transition-all font-medium text-gray-900"
                  required
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredDevices.length > 0 ? (
                    filteredDevices.map((device, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectDevice(device)}
                        className="px-4 py-3 hover:bg-green-50 cursor-pointer text-sm font-medium text-gray-700 hover:text-[#4C811F] transition-colors border-b border-gray-50 last:border-none"
                      >
                        {device}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm font-medium text-gray-500 italic">
                      "{deviceName}" bulunamadı. Kaydettiğinizde yeni cihaz olarak listeye eklenecektir.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Kategori</label>
              <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#4C811F] focus:bg-white outline-none transition-all font-medium text-gray-900 appearance-none cursor-pointer" required>
                <option value="">Kategori Seçin</option>
                <option value="sogutucu">Soğutucu & Dondurucu</option>
                <option value="iklimlendirme">İklimlendirme (Klima, Isıtıcı)</option>
                <option value="beyazesya">Beyaz Eşya (Çamaşır, Bulaşık)</option>
                <option value="mutfak">Mutfak Aletleri (Fırın, Ocak, Mikrodalga)</option>
                <option value="kucuk_evaletleri">Küçük Ev Aletleri (Süpürge, Ütü)</option>
                <option value="elektronik">Ev Elektroniği (TV, Ses Sistemi)</option>
                <option value="bilisim">Bilişim & Ağ (Modem, PC, Sunucu)</option>
                <option value="aydinlatma">Akıllı Aydınlatma</option>
                <option value="guvenlik">Güvenlik & Sensörler</option>
                <option value="bahce">Bahçe & Dış Mekan</option>
                <option value="elektrikli_arac">Elektrikli Araç Şarj İstasyonu (EV)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Marka / Model</label>
                <input 
                  type="text" 
                  placeholder="Örn: Dyson V15" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#4C811F] focus:bg-white outline-none transition-all font-medium text-gray-900"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Güvenli Limit (W)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={safeLimit}
                    onChange={(e) => setSafeLimit(e.target.value)}
                    placeholder="Örn: 2000" 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#4C811F] focus:bg-white outline-none transition-all font-medium text-gray-900"
                    required
                  />
                  <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <h4 className="text-blue-800 font-bold text-sm mb-1">Voltify AI Otonom Eşleşme</h4>
              <p className="text-blue-600 text-xs font-medium leading-relaxed">
                Cihazı kaydettiğinizde, Voltify Akıllı Tanıma sistemi kategorisine ve modeline uygun <strong>sabit cihaz görselini</strong> kütüphaneden otomatik olarak atayacak ve ideal enerji limitlerini optimize edecektir.
              </p>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <button 
            type="submit" 
            form="add-device-form"
            disabled={isSubmitting}
            className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-gray-900/20"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Cihazı Kaydet ve Bağlan
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddDeviceSlideover;
