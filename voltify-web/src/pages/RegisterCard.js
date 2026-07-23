import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/authService';

// Profil avatarları — kadın, erkek, nötr, robot
const AVATARS = [
  {
    id: 'woman',
    label: 'Kadın',
    render: (active, isDark) => (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <circle cx="24" cy="48" r="20" fill={active ? '#7BC043' : (isDark ? '#2D3748' : '#E8F5E8')} />
        <circle cx="24" cy="17" r="9" fill={active ? '#FDDCB5' : '#FDDCB5'} />
        <path d="M24 8 Q16 8 15 14 Q14 22 12 24 Q15 26 24 26 Q33 26 36 24 Q34 22 33 14 Q32 8 24 8Z"
          fill={active ? '#8B4513' : (isDark ? '#6B3A1F' : '#8B4513')} />
        <path d="M14 24 Q10 30 10 38 L38 38 Q38 30 34 24 Q30 28 24 28 Q18 28 14 24Z"
          fill={active ? '#7BC043' : (isDark ? '#4A6741' : '#7BC043')} opacity="0.9" />
        <path d="M16 20 Q18 25 24 26 Q30 25 32 20" fill="#FDDCB5" stroke="#E0B090" strokeWidth="0.5" />
      </svg>
    ),
  },
  {
    id: 'man',
    label: 'Erkek',
    render: (active, isDark) => (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <circle cx="24" cy="48" r="20" fill={active ? '#3B82F6' : (isDark ? '#2D3748' : '#EFF6FF')} />
        <circle cx="24" cy="17" r="9" fill="#FDDCB5" />
        <path d="M15 15 Q15 8 24 8 Q33 8 33 15 Q33 10 24 10 Q15 10 15 15Z"
          fill={active ? '#1F2937' : (isDark ? '#374151' : '#1F2937')} />
        <path d="M14 24 Q10 30 10 38 L38 38 Q38 30 34 24 Q30 28 24 28 Q18 28 14 24Z"
          fill={active ? '#3B82F6' : (isDark ? '#1E3A5F' : '#3B82F6')} opacity="0.9" />
        <path d="M16 20 Q18 25 24 26 Q30 25 32 20" fill="#FDDCB5" stroke="#E0B090" strokeWidth="0.5" />
      </svg>
    ),
  },
  {
    id: 'neutral',
    label: 'Nötr',
    render: (active, isDark) => (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <circle cx="24" cy="48" r="20" fill={active ? '#8B5CF6' : (isDark ? '#2D3748' : '#F5F3FF')} />
        <circle cx="24" cy="17" r="9" fill="#FDDCB5" />
        <path d="M15 14 Q15 7 24 7 Q33 7 33 14 Q31 9 24 9 Q17 9 15 14Z"
          fill={active ? '#5B21B6' : (isDark ? '#4C1D95' : '#5B21B6')} />
        <path d="M14 24 Q10 30 10 38 L38 38 Q38 30 34 24 Q30 28 24 28 Q18 28 14 24Z"
          fill={active ? '#8B5CF6' : (isDark ? '#3B0764' : '#8B5CF6')} opacity="0.9" />
        <path d="M16 20 Q18 25 24 26 Q30 25 32 20" fill="#FDDCB5" stroke="#E0B090" strokeWidth="0.5" />
      </svg>
    ),
  },
  {
    id: 'bot',
    label: 'Robot',
    render: (active, isDark) => (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <circle cx="24" cy="48" r="20" fill={active ? '#10B981' : (isDark ? '#2D3748' : '#ECFDF5')} />
        <rect x="15" y="10" width="18" height="14" rx="3" fill={active ? '#374151' : (isDark ? '#4B5563' : '#6B7280')} />
        <circle cx="20" cy="17" r="3" fill="#10B981" />
        <circle cx="28" cy="17" r="3" fill="#10B981" />
        <line x1="24" y1="5" x2="24" y2="10" stroke={active ? '#10B981' : '#6B7280'} strokeWidth="2" />
        <circle cx="24" cy="4" r="2" fill="#10B981" />
        <path d="M14 24 Q10 30 10 38 L38 38 Q38 30 34 24 Q30 28 24 28 Q18 28 14 24Z"
          fill={active ? '#10B981' : (isDark ? '#064E3B' : '#10B981')} opacity="0.9" />
      </svg>
    ),
  },
];

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score: 1, label: 'Çok Zayıf', color: '#EF4444' };
  if (score === 2) return { score: 2, label: 'Zayıf', color: '#F97316' };
  if (score === 3) return { score: 3, label: 'Orta', color: '#F59E0B' };
  if (score === 4) return { score: 4, label: 'Güçlü', color: '#84CC16' };
  return { score: 5, label: 'Çok Güçlü', color: '#22C55E' };
}

function RegField({ label, type, value, onChange, placeholder, isDark, icon }) {
  const icons = {
    user: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
    email: <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />,
    phone: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />,
  };
  return (
    <div>
      <label className="block font-mono text-[10px] font-semibold tracking-wider mb-1"
        style={{ color: isDark ? '#7BC043' : '#4a6741' }}>{label}</label>
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: isDark ? '#7BC043' : '#6a9241' }}>
          {icons[icon]}
        </svg>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl font-body focus:outline-none focus:ring-2"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(123,192,67,0.2)' : 'rgba(100,150,60,0.25)'}`,
            color: isDark ? '#e5e7eb' : '#1a3d1a',
          }} />
      </div>
    </div>
  );
}

export default function RegisterCard({ isDark, onGoLogin }) {
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState('woman');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const passwordStrength = getPasswordStrength(password);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !password) {
      setError('Lütfen zorunlu alanları doldurun.');
      return;
    }
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    const username = (firstName + lastName).replace(/\s+/g, '').toLowerCase() || email.split('@')[0];

    setLoading(true);
    try {
      await authService.register(username, email, password);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      console.warn('Backend register unavailable or returned error, falling back to demo registration:', err);
      localStorage.setItem('voltify_token', 'demo-jwt-token');
      localStorage.setItem('voltify_user', JSON.stringify({ username, email, role: 'USER' }));
      setLoading(false);
      navigate('/dashboard');
    }
  };

  return (
    <div className="w-[94vw] max-w-[580px] sm:max-w-[620px] mx-auto my-6">
      <div className="rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(20,26,46,0.96) 0%, rgba(30,36,56,0.92) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,252,248,0.95) 100%)',
          boxShadow: isDark
            ? '0 30px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)'
            : '0 30px 60px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
          border: isDark ? '1px solid rgba(123,192,67,0.15)' : '1px solid rgba(100,150,60,0.15)',
        }}>

        {/* BAŞLIK */}
        <div className="mb-5">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold" style={{ color: isDark ? '#7BC043' : '#1a3d1a' }}>
            Hesabınızı Oluşturun
          </h1>
          <p className="text-xs sm:text-sm mt-1 font-body" style={{ color: isDark ? '#7BC043' : '#4a7a3a' }}>
            Enerji verimliliği yolculuğunuza bugün başlayın.
          </p>
        </div>

        {/* PROFİL RESMİ + AVATAR SEÇİMİ */}
        <div className="flex items-start gap-4 mb-5">
          {/* Fotoğraf yükleme */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <motion.button type="button" onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(123,192,67,0.1)',
                border: `2px dashed ${isDark ? 'rgba(123,192,67,0.4)' : 'rgba(100,150,60,0.4)'}`,
              }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="w-6 h-6" style={{ color: isDark ? '#7BC043' : '#6a9241' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <span className="text-[9px] font-mono" style={{ color: isDark ? '#7BC043' : '#6a9241' }}>Fotoğraf</span>
                </div>
              )}
              {photoPreview && (
                <button type="button" onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </motion.button>
            <span className="text-[9px] font-mono" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>Opsiyonel</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          {/* Avatar seçimi */}
          <div className="flex-1">
            <label className="block font-mono text-[10px] font-semibold tracking-wider mb-2"
              style={{ color: isDark ? '#7BC043' : '#4a6741' }}>
              PROFİL AVATARI SEÇ
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((avatar) => (
                <motion.button key={avatar.id} type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }}
                  className="relative flex flex-col items-center gap-1 p-2 rounded-xl"
                  style={{
                    background: selectedAvatar === avatar.id
                      ? (isDark ? 'rgba(123,192,67,0.2)' : 'rgba(123,192,67,0.12)')
                      : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                    border: `2px solid ${selectedAvatar === avatar.id ? '#7BC043' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                  }}>
                  {avatar.render(selectedAvatar === avatar.id, isDark)}
                  <span className="text-[9px] font-mono"
                    style={{ color: selectedAvatar === avatar.id ? '#7BC043' : (isDark ? '#6B7280' : '#9CA3AF') }}>
                    {avatar.label}
                  </span>
                  {selectedAvatar === avatar.id && (
                    <motion.div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: '#7BC043' }}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Ad + Soyad */}
          <div className="grid grid-cols-2 gap-3">
            <RegField label="AD" type="text" value={firstName} onChange={setFirstName}
              placeholder="Örn. Ahmet" isDark={isDark} icon="user" />
            <RegField label="SOYAD" type="text" value={lastName} onChange={setLastName}
              placeholder="Örn. Yılmaz" isDark={isDark} icon="user" />
          </div>

          <RegField label="E-POSTA" type="email" value={email} onChange={setEmail}
            placeholder="ahmet@email.com" isDark={isDark} icon="email" />

          <RegField label="TELEFON NUMARASI" type="tel" value={phone} onChange={setPhone}
            placeholder="0555 123 45 67" isDark={isDark} icon="phone" />

          {/* ŞİFRE */}
          <div>
            <label className="block font-mono text-[10px] font-semibold tracking-wider mb-1"
              style={{ color: isDark ? '#7BC043' : '#4a6741' }}>ŞİFRE</label>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isDark ? '#7BC043' : '#6a9241' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 karakter"
                className="w-full pl-9 pr-10 py-2 text-sm rounded-xl font-body focus:outline-none focus:ring-2"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
                  border: `1px solid ${isDark ? 'rgba(123,192,67,0.2)' : 'rgba(100,150,60,0.25)'}`,
                  color: isDark ? '#e5e7eb' : '#1a3d1a',
                }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: isDark ? '#7BC043' : '#6a9241' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  {showPassword
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    : <>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </>
                  }
                </svg>
              </button>
            </div>

            {/* ŞİFRE GÜCÜ */}
            <AnimatePresence>
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <motion.div key={level} className="h-1.5 flex-1 rounded-full"
                        animate={{ background: level <= passwordStrength.score ? passwordStrength.color : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') }}
                        transition={{ duration: 0.3 }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-semibold" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>
                      {password.length} karakter
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                    {[
                      { label: '8+ karakter', ok: password.length >= 8 },
                      { label: 'Büyük harf (A-Z)', ok: /[A-Z]/.test(password) },
                      { label: 'Rakam (0-9)', ok: /[0-9]/.test(password) },
                      { label: 'Özel karakter (!@#)', ok: /[^A-Za-z0-9]/.test(password) },
                    ].map((tip) => (
                      <div key={tip.label} className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: tip.ok ? '#22C55E' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') }}>
                          {tip.ok && (
                            <svg className="w-1.5 h-1.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[9px] font-mono" style={{ color: tip.ok ? '#22C55E' : (isDark ? '#6B7280' : '#9CA3AF') }}>
                          {tip.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs text-center font-body">{error}</motion.div>
          )}

          {/* KAYIT BUTONU */}
          <motion.button type="submit"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-full font-heading font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md mt-1"
            style={{ background: 'linear-gradient(135deg,#7BC043,#5A9A2A)', color: '#fff' }}>
            Hesap Oluştur
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </motion.button>

          <div className="text-center pt-1">
            <span className="font-body text-xs" style={{ color: isDark ? '#9DB8A0' : '#6a9241' }}>
              Zaten bir Voltify hesabın var mı?{' '}
            </span>
            <button type="button" onClick={onGoLogin}
              className="font-body text-xs font-semibold hover:underline"
              style={{ color: isDark ? '#7BC043' : '#366b00' }}>
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}