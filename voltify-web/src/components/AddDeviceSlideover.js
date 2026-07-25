import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { X, Zap, Cpu, Save, Search, Sparkles } from 'lucide-react';
import { homeService } from '../services/homeService';

const AddDeviceSlideover = ({ isOpen, onClose, onAddDevice, homeId, roomLayout }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Autocomplete states
  const [deviceName, setDeviceName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [safeLimit, setSafeLimit] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Dynamic rooms selection based on home layout
  const getRoomsForLayout = (layout) => {
    switch (layout) {
      case '1+0':
        return ['Studio Alanı'];
      case '1+1':
        return ['Salon', 'Yatak Odası'];
      case '2+1':
        return ['Salon', 'Ana Yatak Odası', 'Çocuk Odası'];
      case '3+1':
        return ['Geniş Salon', 'Yatak Odası 1', 'Yatak Odası 2', 'Çocuk Odası'];
      default:
        return ['Salon', 'Yatak Odası'];
    }
  };
  const availableRooms = useMemo(() => getRoomsForLayout(roomLayout), [roomLayout]);
  const [selectedRoom, setSelectedRoom] = useState(availableRooms[0] || 'Salon');

  useEffect(() => {
    if (availableRooms.length > 0) {
      setSelectedRoom(availableRooms[0]);
    }
  }, [roomLayout, availableRooms]);

  // Pre-defined quick preset chips for popular appliances
  const quickPresets = [
    { name: 'Buzdolabı', category: 'sogutucu', limit: 350, icon: '❄️' },
    { name: 'Bulaşık Makinesi', category: 'beyazesya', limit: 1800, icon: '🍽️' },
    { name: 'Su Isıtıcı (Kettle)', category: 'mutfak', limit: 2200, icon: '☕' },
    { name: 'Televizyon', category: 'elektronik', limit: 400, icon: '📺' },
    { name: 'Klima', category: 'iklimlendirme', limit: 2500, icon: '❄️' },
    { name: 'Çamaşır Makinesi', category: 'beyazesya', limit: 2200, icon: '🧺' },
    { name: 'Ankastre Fırın', category: 'mutfak', limit: 2400, icon: '🍳' },
  ];

  // Pre-defined fixed list.
  const [deviceList, setDeviceList] = useState([
    'Akıllı Ampul',
    'Akıllı Priz',
    'Ankastre Fırın',
    'Ankastre Ocak',
    'Bilgisayar (Masaüstü)',
    'Bulaşık Makinesi',
    'Buzdolabı',
    'Çamaşır Kurutma Makinesi',
    'Çamaşır Makinesi',
    'Derin Dondurucu',
    'Dizüstü Bilgisayar (Laptop)',
    'Elektrikli Isıtıcı (Ufo/Radyatör)',
    'Elektrikli Süpürge',
    'Fırın (Mini / Midi)',
    'Kahve Makinesi',
    'Klima',
    'Mikrodalga Fırın',
    'Mikser / Blender',
    'Oyun Makinesi',
    'Su Isıtıcısı (Kettle)',
    'Televizyon',
    'Tost Makinesi',
    'Vantilatör'
  ]);

  // Helper function to estimate category & safe limit based on device name
  const getEstimatedLimitAndCategory = (nameStr) => {
    const name = nameStr.toLocaleLowerCase('tr-TR');
    if (name.includes('klima')) return { limit: 2500, category: 'iklimlendirme' };
    if (name.includes('çamaşır')) return { limit: 2200, category: 'beyazesya' };
    if (name.includes('bulaşık')) return { limit: 1800, category: 'beyazesya' };
    if (name.includes('fırın')) return { limit: 2400, category: 'mutfak' };
    if (name.includes('süpürge')) return { limit: 1500, category: 'kucuk_evaletleri' };
    if (name.includes('ütü')) return { limit: 2400, category: 'kucuk_evaletleri' };
    if (name.includes('buzdolabı')) return { limit: 350, category: 'sogutucu' };
    if (name.includes('televizyon') || name.includes('tv')) return { limit: 400, category: 'elektronik' };
    if (name.includes('bilgisayar') || name.includes('laptop')) return { limit: 600, category: 'bilisim' };
    if (name.includes('kombi')) return { limit: 150, category: 'iklimlendirme' };
    if (name.includes('aydınlatma') || name.includes('ampul')) return { limit: 60, category: 'aydinlatma' };
    if (name.includes('kettle') || name.includes('su ısıtıcı')) return { limit: 2200, category: 'mutfak' };
    return { limit: 1500, category: 'elektronik' };
  };

  // Filter the list based on user input
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

  const handleApplyPreset = (preset) => {
    setDeviceName(preset.name);
    setCategory(preset.category);
    setSafeLimit(preset.limit.toString());
    setShowDropdown(false);
  };

  const handleSelectDevice = (name) => {
    setDeviceName(name);
    setShowDropdown(false);
    const est = getEstimatedLimitAndCategory(name);
    setSafeLimit(est.limit.toString());
    setCategory(est.category);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setDeviceName(val);
    setShowDropdown(true);
    if (val.trim().length >= 3) {
      const est = getEstimatedLimitAndCategory(val);
      if (!safeLimit || safeLimit === '1000') {
        setSafeLimit(est.limit.toString());
      }
      if (!category) {
        setCategory(est.category);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const categoryMap = {
        'sogutucu': 'Soğutucu',
        'iklimlendirme': 'İklimlendirme',
        'beyazesya': 'Beyaz Eşya',
        'mutfak': 'Beyaz Eşya',
        'kucuk_evaletleri': 'Elektronik',
        'elektronik': 'Elektronik',
        'bilisim': 'Elektronik',
        'aydinlatma': 'Elektronik',
        'guvenlik': 'Elektronik',
        'bahce': 'Elektronik',
        'elektrikli_arac': 'Elektronik'
      };

      const finalLimit = parseFloat(safeLimit) || 1500.0;

      const payload = {
        name: deviceName.trim(),
        safePowerLimit: finalLimit,
        room: selectedRoom,
        type: categoryMap[category] || 'Elektronik'
      };

      let registeredAppliance = null;
      if (homeId) {
        const updatedHome = await homeService.addAppliance(homeId, payload);
        if (updatedHome && Array.isArray(updatedHome.appliances)) {
          registeredAppliance = updatedHome.appliances.find(
            app => app.name === payload.name && app.room === payload.room
          ) || updatedHome.appliances[updatedHome.appliances.length - 1];
        }
      }

      if (!registeredAppliance) {
        registeredAppliance = {
          id: Date.now(),
          name: payload.name,
          type: payload.type,
          room: payload.room,
          currentWattage: Math.floor(Math.random() * (finalLimit * 0.6)) + 20,
          maxSafeWattage: finalLimit,
          isAnomalous: false,
          image: category === 'sogutucu' ? '/fridge/fridge_mock.png' : '/washer/washer_mock.png'
        };
      }

      if (registeredAppliance && registeredAppliance.id) {
        localStorage.setItem(`voltify_device_room_${registeredAppliance.id}`, selectedRoom);
      }

      if (onAddDevice) {
        onAddDevice(registeredAppliance);
      }

      if (deviceName.trim() !== '' && !deviceList.some(d => d.toLocaleLowerCase('tr-TR') === deviceName.toLocaleLowerCase('tr-TR'))) {
        setDeviceList(prev => [...prev, deviceName.trim()].sort());
      }

      setDeviceName('');
      setCategory('');
      setBrand('');
      setSafeLimit('');
      onClose();
    } catch (err) {
      console.warn('Could not register appliance to backend:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
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
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#1E271F] z-[200] shadow-2xl transition-transform duration-500 transform flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 dark:bg-emerald-800 rounded-xl flex items-center justify-center text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Yeni Cihaz Ekle</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-emerald-950/40 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Quick Preset Buttons (Tek Tıkla Doldurma) */}
          <div>
            <label className="text-xs font-black text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#4C811F]" /> Hızlı Seçim (Tek Tıkla Limit Atama)
            </label>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-emerald-950/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 border border-gray-200 dark:border-emerald-900/40 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.name}</span>
                  <span className="text-[10px] text-[#4C811F] font-black bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded-md">{preset.limit}W</span>
                </button>
              ))}
            </div>
          </div>
          
          <form id="add-device-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Autocomplete Input */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Cihaz Adı</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={deviceName}
                  onChange={handleNameChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Örn: Bulaşık Makinesi, Salondaki Klima..." 
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-gray-50 dark:bg-[#182119] border-2 border-gray-100 dark:border-emerald-950/40 focus:border-[#4C811F] focus:bg-white dark:focus:bg-[#182119] outline-none transition-all font-medium text-gray-900 dark:text-white"
                  required
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1E271F] border border-gray-100 dark:border-emerald-950/40 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredDevices.length > 0 ? (
                    filteredDevices.map((device, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelectDevice(device)}
                        className="px-4 py-3 hover:bg-green-50 dark:hover:bg-emerald-950/60 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#4C811F] transition-colors border-b border-gray-50 dark:border-emerald-950/20 last:border-none"
                      >
                        {device}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 italic">
                      "{deviceName}" bulunamadı. Kaydettiğinizde yeni cihaz olarak eklenecektir.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Kategori</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#182119] border-2 border-gray-100 dark:border-emerald-950/40 focus:border-[#4C811F] outline-none transition-all font-medium text-gray-900 dark:text-white cursor-pointer" 
                required
              >
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

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Bulunduğu Oda</label>
              <select 
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#182119] border-2 border-gray-100 dark:border-emerald-950/40 focus:border-[#4C811F] outline-none transition-all font-bold text-gray-700 dark:text-gray-300 cursor-pointer" 
                required
              >
                {availableRooms.map((room, idx) => (
                  <option key={idx} value={room}>{room}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Marka / Model</label>
                <input 
                  type="text" 
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Örn: Dyson, Bosch..." 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#182119] border-2 border-gray-100 dark:border-emerald-950/40 focus:border-[#4C811F] outline-none transition-all font-medium text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <span>Güvenli Limit (W)</span>
                  <span className="text-[10px] font-black text-[#4C811F] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200/50">AI Otomatik Atar</span>
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={safeLimit || '1500'}
                    onChange={(e) => setSafeLimit(e.target.value)}
                    placeholder="Örn: 1800" 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#182119] border-2 border-gray-100 dark:border-emerald-950/40 focus:border-[#4C811F] outline-none transition-all font-medium text-gray-900 dark:text-white"
                    required
                  />
                  <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4C811F]" />
                </div>
              </div>
            </div>

            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-gray-100 dark:border-emerald-950/30">
              💡 <strong>Bilmiyor musunuz?</strong> Voltify AI seçtiğiniz cihaza göre ideal güvenli Watt limitini otomatik doldurur. Dilerseniz özelleştirebilirsiniz.
            </p>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4">
              <h4 className="text-blue-800 dark:text-blue-300 font-bold text-sm mb-1">Voltify AI Otonom Eşleşme</h4>
              <p className="text-blue-600 dark:text-blue-400 text-xs font-medium leading-relaxed">
                Cihazı kaydettiğinizde, Voltify Akıllı Tanıma sistemi kategorisine ve modeline uygun <strong>sabit cihaz görselini</strong> kütüphaneden otomatik olarak atayacaktır.
              </p>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-emerald-950/30 bg-gray-50/50 dark:bg-[#182119]">
          <button 
            type="submit" 
            form="add-device-form"
            disabled={isSubmitting}
            className="w-full py-4 bg-gray-900 dark:bg-emerald-800 hover:bg-black text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-gray-900/20"
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
    </>,
    document.body
  );
};

export default AddDeviceSlideover;
