import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, Gift, Heart, Edit2, Check, RefreshCw, FlaskConical } from 'lucide-react';
import { ecoPetService } from '../services/ecoPetService';

// Sevimli "Yaprak/Filiz Bebek" (Eco-Sprout) karakterini render eden bileşen
const CuteSproutAvatar = ({ mood, forceMood }) => {
  let bodyColor, eyeElement, cheekColor, leafTransform, mouthPath, expressionClass = "";
  const currentMood = forceMood || mood;

  switch (currentMood) {
    case 'SICK':
      bodyColor = "#A7F3D0"; // Solgun yeşil
      cheekColor = "opacity-0"; // Kızarıklık yok
      leafTransform = "rotate(45) translate(5, 5)"; // Yaprak solmuş
      expressionClass = "animate-pulse";
      eyeElement = (
        <g stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" fill="none">
          {/* Dizzy X X Eyes */}
          <line x1="16" y1="16" x2="24" y2="24" />
          <line x1="24" y1="16" x2="16" y2="24" />
          <line x1="40" y1="16" x2="48" y2="24" />
          <line x1="48" y1="16" x2="40" y2="24" />
        </g>
      );
      mouthPath = "M26,32 Q32,27 38,32"; // Üzgün ağız
      break;
      
    case 'SAD':
      bodyColor = "#6EE7B7"; // Hüzünlü yeşil
      cheekColor = "fill-blue-300 opacity-70"; // Hüzünlü yanaklar
      leafTransform = "rotate(25) translate(2, 2)";
      expressionClass = "animate-gentle-bounce";
      // Ağlayan/Üzgün koca gözler
      eyeElement = (
        <g fill="#065F46">
          <circle cx="20" cy="20" r="4" />
          <circle cx="44" cy="20" r="4" />
          {/* Süzülen Gözyaşları */}
          <path d="M20,24 C19,28 17,28 17,25 Z" fill="#3B82F6" className="animate-pulse" />
          <path d="M44,24 C43,28 41,28 41,25 Z" fill="#3B82F6" className="animate-pulse" />
        </g>
      );
      mouthPath = "M26,33 Q32,28 38,33";
      break;
      
    case 'NEUTRAL':
      bodyColor = "#34D399";
      cheekColor = "fill-pink-300 opacity-60";
      leafTransform = "rotate(0)";
      eyeElement = (
        <g fill="#065F46">
          <circle cx="20" cy="20" r="4.5" />
          <circle cx="44" cy="20" r="4.5" />
          <circle cx="18.5" cy="18.5" r="1.5" fill="white" />
          <circle cx="42.5" cy="18.5" r="1.5" fill="white" />
        </g>
      );
      mouthPath = "M27,30 Q32,32 37,30";
      break;
      
    case 'HAPPY':
    default:
      bodyColor = "#10B981"; // Canlı neşeli yeşil
      cheekColor = "fill-pink-400 opacity-90";
      leafTransform = "translate(0, -3) scale(1.1)";
      expressionClass = "animate-gentle-bounce";
      // Gülen gözler
      eyeElement = (
        <g stroke="#047857" strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M15,22 Q20,16 25,22" />
          <path d="M39,22 Q44,16 49,22" />
        </g>
      );
      mouthPath = "M25,28 Q32,38 39,28 Z"; // Açık gülen ağız
      break;
  }

  return (
    <div className={`relative flex items-center justify-center w-24 h-24 ${expressionClass}`}>
      
      {/* HAPPY durumunda havada uçuşan kalpler */}
      {currentMood === 'HAPPY' && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          <div className="absolute top-0 left-2 animate-heart-float-1 text-red-500 text-xs">❤️</div>
          <div className="absolute top-2 right-2 animate-heart-float-2 text-red-400 text-sm">❤️</div>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-heart-float-3 text-pink-500 text-xs">❤️</div>
        </div>
      )}

      {/* SAD durumunda havada süzülen yağmur bulutu */}
      {currentMood === 'SAD' && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-none text-blue-300 text-lg animate-pulse">
          🌧️
        </div>
      )}

      <svg viewBox="0 0 64 64" className="w-20 h-20 filter drop-shadow-md overflow-visible">
        {/* Anten Yaprağı / Sevimli Filiz */}
        <g transform={`translate(32, 12) ${leafTransform}`}>
          <path d="M0,0 Q-3,-8 -10,-10" fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M-10,-10 Q-15,-18 -7,-20 Q-2,-15 -10,-10" fill="#34D399" stroke="#047857" strokeWidth="1.5" />
          <path d="M0,0 Q3,-6 8,-6 Q10,-11 6,-12 Q2,-9 0,0" fill="#6EE7B7" stroke="#047857" strokeWidth="1.5" />
        </g>

        {/* Ana Yuvarlak Gövde (Eco Sprout Head) */}
        <circle cx="32" cy="36" r="20" fill={bodyColor} stroke="#047857" strokeWidth="3" />

        {/* Yanak Pembişlikleri */}
        <ellipse cx="18" cy="27" rx="3.5" ry="2" className={cheekColor} />
        <ellipse cx="46" cy="27" rx="3.5" ry="2" className={cheekColor} />

        {/* Gözler */}
        {eyeElement}

        {/* Ağız */}
        <path d={mouthPath} fill={currentMood === 'HAPPY' ? '#A7F3D0' : 'none'} stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

const VoltBotWidget = () => {
  const [pet, setPet] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Test/Demo modunda tüm ruh hallerini denemek için state
  const [testMode, setTestMode] = useState(false);
  const [forcedMood, setForcedMood] = useState(null);

  const fetchPet = async () => {
    try {
      setLoading(true);
      const data = await ecoPetService.getPet();
      setPet(data);
      setNewName(data.name);
      setError('');
    } catch (err) {
      setError('Eco-Pet verisi alınamadı.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPet();
  }, []);

  const handleFeed = async () => {
    if (pet.foodCount <= 0 || actionLoading) return;
    try {
      setActionLoading(true);
      const updatedPet = await ecoPetService.feedPet();
      setPet(updatedPet);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Besleme başarısız.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || actionLoading) return;
    try {
      setActionLoading(true);
      const updatedPet = await ecoPetService.renamePet(newName);
      setPet(updatedPet);
      setIsEditingName(false);
      setError('');
    } catch (err) {
      setError('İsim değiştirme başarısız.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex items-center justify-center min-h-[220px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#4C811F]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col items-center justify-center min-h-[220px] text-center">
        <p className="text-red-500 font-bold mb-2 text-sm">{error}</p>
        <button 
          onClick={fetchPet} 
          className="px-4 py-2 bg-[#4C811F] hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all"
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  if (!pet) return null;

  const getMoodConfig = (mood) => {
    switch (mood) {
      case 'SICK':
        return {
          textColor: 'text-red-600',
          statusText: 'Hasta 🤒 (Destek Lazım)'
        };
      case 'SAD':
        return {
          textColor: 'text-amber-600',
          statusText: 'Üzgün 🥺 (Limit Aşımı)'
        };
      case 'NEUTRAL':
        return {
          textColor: 'text-blue-600',
          statusText: 'Uykulu 😐 (Tasarrufa Başla)'
        };
      case 'HAPPY':
      default:
        return {
          textColor: 'text-green-600',
          statusText: 'Çok Mutlu 😊 (Kalpli Mod)'
        };
    }
  };

  const currentMood = forcedMood || pet.mood || 'HAPPY';
  const moodConfig = getMoodConfig(currentMood);
  const maxExp = pet.level * 100;
  const expPercent = Math.min(100, (pet.experience / maxExp) * 100);

  return (
    <div className="bg-white dark:bg-[#1E271F] rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-emerald-950/20 flex flex-col justify-between relative overflow-visible">
      {/* Özel CSS animasyonları enjekte etme */}
      <style>{`
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-gentle-bounce { animation: gentleBounce 2s infinite ease-in-out; }
        @keyframes heartFloat1 {
          0% { transform: translateY(10px) scale(0.5); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-25px) scale(1.1); opacity: 0; }
        }
        @keyframes heartFloat2 {
          0% { transform: translateY(15px) scale(0.6); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-30px) scale(1.2) rotate(15deg); opacity: 0; }
        }
        @keyframes heartFloat3 {
          0% { transform: translateY(12px) scale(0.5); opacity: 0; }
          50% { opacity: 0.9; }
          100% { transform: translateY(-22px) scale(1.0) rotate(-15deg); opacity: 0; }
        }
        .animate-heart-float-1 { animation: heartFloat1 2s infinite ease-out; }
        .animate-heart-float-2 { animation: heartFloat2 2.3s infinite ease-out 0.5s; }
        .animate-heart-float-3 { animation: heartFloat3 1.8s infinite ease-out 0.2s; }
      `}</style>

      {/* Top Section: Name and Level */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-2.5 py-1 text-xs border border-gray-200 dark:border-emerald-900/30 rounded-xl focus:outline-none focus:border-[#4C811F] bg-transparent dark:text-gray-100"
                maxLength={15}
              />
              <button
                onClick={handleRename}
                disabled={actionLoading}
                className="p-1 bg-[#4C811F] text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{pet.name}</h3>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        
        {/* Test Modu Toggle Butonu */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => { setTestMode(!testMode); if(testMode) setForcedMood(null); }}
            className={`p-1 rounded-lg transition-colors ${testMode ? 'bg-orange-100 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-emerald-950/20'}`}
            title="Test Modu"
          >
            <FlaskConical className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-emerald-950/30 text-green-700 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Shield className="w-3 h-3" /> Seviye {pet.level}
          </div>
        </div>
      </div>

      {/* Main Section: Sprout Avatar and Stats */}
      <div className="flex items-center gap-5 my-3 z-10">
        {/* Render Sprout Avatar with forced mood capability */}
        <CuteSproutAvatar mood={pet.mood} forceMood={forcedMood} />

        <div className="flex-1 space-y-2">
          {/* Health Bar */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
              <span className="flex items-center gap-1 text-red-500/80"><Heart className="w-3 h-3 fill-current" /> Sağlık</span>
              <span className="text-gray-600 dark:text-gray-300">%{pet.healthScore}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-emerald-950/20 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  pet.healthScore <= 20 ? 'bg-red-500' : pet.healthScore <= 50 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${pet.healthScore}%` }}
              ></div>
            </div>
          </div>

          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
              <span className="text-blue-500/80">Deneyim</span>
              <span className="text-gray-600 dark:text-gray-300">{pet.experience}/{maxExp} XP</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-emerald-950/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${expPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Status and Controls */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-emerald-950/20 z-10">
        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Mod: <span className={`${moodConfig.textColor} ml-0.5`}>{moodConfig.statusText}</span>
        </div>
        <button
          onClick={handleFeed}
          disabled={pet.foodCount <= 0 || actionLoading}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#4C811F] hover:bg-green-700 disabled:bg-gray-100 disabled:dark:bg-emerald-950/10 disabled:text-gray-400 text-white rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <Gift className="w-3.5 h-3.5" /> Besle ({pet.foodCount} Mama)
        </button>
      </div>

      {/* Test Modu Kontrol Paneli */}
      {testMode && (
        <div className="mt-4 p-3 bg-orange-50/50 border border-orange-100 rounded-2xl animate-in fade-in duration-200">
          <div className="text-[9px] font-black text-orange-600 uppercase tracking-wider mb-2">🧪 Test Ortamı (Ruh Hali Seç):</div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'HAPPY', label: '😊 Mutlu' },
              { id: 'NEUTRAL', label: '😐 Uykulu' },
              { id: 'SAD', label: '🥺 Üzgün' },
              { id: 'SICK', label: '🤒 Hasta' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setForcedMood(m.id)}
                className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  forcedMood === m.id 
                    ? 'bg-orange-600 text-white shadow-sm' 
                    : 'bg-white border border-orange-200 text-orange-700 hover:bg-orange-100/50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setForcedMood(null)}
            className="w-full mt-2 py-1 text-[9px] font-black text-gray-500 uppercase tracking-wider text-center hover:underline"
          >
            Sıfırla (Otomatik Mod)
          </button>
        </div>
      )}

      {error && <div className="text-[10px] text-red-500 font-bold mt-2 text-center">{error}</div>}
    </div>
  );
};

export default VoltBotWidget;
