import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';

function Lock3D({ isUnlocking, isDark }) {
  return (
    <div className="relative flex-shrink-0 flex items-center justify-center drop-shadow-xl"
      style={{ width: 'clamp(80px, 22vw, 115px)', height: 'clamp(130px, 34vw, 175px)', overflow: 'visible' }}>
      <motion.svg width="100%" height="60%" viewBox="0 0 120 80"
        className="absolute top-0"
        style={{ transformOrigin: 'bottom center', overflow: 'visible' }}
        animate={isUnlocking ? { y: -22, rotate: -28, x: -8 } : { y: 0, rotate: 0, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}>
        <defs>
          <linearGradient id="hookG2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? '#4B5563' : '#9CA3AF'} />
            <stop offset="40%" stopColor={isDark ? '#D1D5DB' : '#F9FAFB'} />
            <stop offset="100%" stopColor={isDark ? '#374151' : '#6B7280'} />
          </linearGradient>
        </defs>
        <path d="M20,75 L20,35 A35,35 0 0 1 100,35 L100,75"
          stroke="url(#hookG2)" strokeWidth="18" fill="none" strokeLinecap="round"
          style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.4))' }} />
      </motion.svg>

      <motion.div className="absolute bottom-0 w-full rounded-3xl"
        style={{
          height: '65%',
          background: isDark
            ? 'linear-gradient(145deg, #B8860B 0%, #DAA520 30%, #8B6914 100%)'
            : 'linear-gradient(145deg, #F5C842 0%, #E6B800 30%, #C69500 100%)',
          boxShadow: isDark
            ? '0 12px 28px rgba(0,0,0,0.6), inset 0 2px 6px rgba(255,255,255,0.2)'
            : '0 12px 28px rgba(0,0,0,0.25), inset 0 2px 8px rgba(255,255,255,0.5)',
        }}
        animate={isUnlocking ? { rotateY: 20 } : { rotateY: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div animate={isUnlocking ? { rotate: 180 } : { rotate: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <svg width="30" height="42" viewBox="0 0 30 42">
              <circle cx="15" cy="14" r="9" fill={isDark ? '#3D2A00' : '#5C3D00'} />
              <rect x="12" y="18" width="6" height="18" fill={isDark ? '#3D2A00' : '#5C3D00'} rx="1" />
              <rect x="9" y="28" width="6" height="4" fill={isDark ? '#3D2A00' : '#5C3D00'} />
            </svg>
          </motion.div>
        </div>
        <div className="absolute top-3 left-5 right-5 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.55), transparent)' }} />
      </motion.div>
    </div>
  );
}

function FormField({ label, type, value, onChange, placeholder, isDark, icon, isPassword, showPassword, onTogglePassword }) {
  const icons = {
    user: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
    lock: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />,
  };
  return (
    <div>
      <label className="block font-mono text-[11px] font-semibold tracking-wider mb-1.5"
        style={{ color: isDark ? '#7BC043' : '#4a6741' }}>{label}</label>
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
          style={{ color: isDark ? '#7BC043' : '#6a9241' }}>
          {icons[icon]}
        </svg>
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-11 ${isPassword ? 'pr-11' : 'pr-4'} py-3 text-sm rounded-full font-body focus:outline-none focus:ring-2`}
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${isDark ? 'rgba(123,192,67,0.25)' : 'rgba(100,150,60,0.3)'}`,
            color: isDark ? '#e5e7eb' : '#1a3d1a',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none hover:opacity-80 transition-opacity"
            style={{ color: isDark ? '#7BC043' : '#6a9241' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              {showPassword ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoginCard({ isDark, onGoRegister }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Lütfen kullanıcı adı ve şifrenizi girin.');
      return;
    }

    setIsUnlocking(true);

    try {
      await authService.login(username, password);
      setTimeout(() => {
        setIsUnlocking(false);
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setIsUnlocking(false);
      const errMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : 'Kullanıcı adı/email veya şifre hatalı!');
      setError(errMsg);
    }
  };

  // Değerlendiriciler için tek tık demo giriş (admin / admin123)
  const handleDemoLogin = async () => {
    setError('');
    setIsUnlocking(true);
    try {
      await authService.login('admin', 'admin123');
      setTimeout(() => {
        setIsUnlocking(false);
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setIsUnlocking(false);
      setError('Demo hesabı bulunamadı. Backend çalışıyor mu?');
    }
  };

  return (
    <div className="w-[85vw] max-w-[360px] sm:max-w-[420px] mx-auto flex flex-col items-center pt-8 sm:pt-10 -mt-10">
      {/* KİLİT */}
      <div className="z-30 flex justify-center w-full relative"
        style={{ marginBottom: '-44px', overflow: 'visible', transform: 'scale(0.9)' }}>
        <Lock3D isUnlocking={isUnlocking} isDark={isDark} />
      </div>

      {/* KART */}
      <motion.div
        className="relative z-20 rounded-3xl shadow-2xl w-full backdrop-blur-md"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(20,26,46,0.96) 0%, rgba(30,36,56,0.92) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,252,248,0.95) 100%)',
          boxShadow: isDark
            ? '0 30px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)'
            : '0 30px 60px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
          border: isDark ? '1px solid rgba(123,192,67,0.15)' : '1px solid rgba(100,150,60,0.15)',
          padding: '4rem 1.5rem 1.5rem 1.5rem',
        }}
        animate={isUnlocking ? { scale: 0.98, opacity: 0.8 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}>

        {/* Logo + Başlık */}
        <div className="flex flex-col items-center mb-4">
          <motion.div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-md flex items-center justify-center mb-3"
            style={{ background: isDark ? 'linear-gradient(135deg,#2D4A2D,#1A2E1A)' : 'linear-gradient(135deg,#E8F5E8,#C8E6C8)' }}
            whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.8 }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="w-8 h-8" style={{ color: isDark ? '#7BC043' : '#366b00' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </motion.div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold" style={{ color: isDark ? '#7BC043' : '#1a3d1a' }}>
            Voltify
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: isDark ? '#9DB8A0' : '#4a7a3a' }}>
            Enerjinizi Yönetin
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField label="KULLANICI ADI VEYA E-POSTA" type="text" value={username} onChange={setUsername}
            placeholder="Kullanıcı adı veya e-posta adresi" isDark={isDark} icon="user" />
          <FormField label="ŞİFRE" type="password" value={password} onChange={setPassword}
            placeholder="••••••••" isDark={isDark} icon="lock" isPassword={true} showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />

          {error && <div className="text-red-500 text-xs text-center font-body">{error}</div>}

          {/* Giriş butonu */}
          <motion.button type="submit" disabled={isUnlocking}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full py-2.5 rounded-full font-heading font-semibold text-sm flex items-center justify-center gap-2 shadow-md"
            style={{ background: 'linear-gradient(135deg,#7BC043,#5A9A2A)', color: '#fff' }}>
            <motion.svg
              animate={isUnlocking ? { scale: [1, 1.5, 1], rotate: [0, 360] } : { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: isUnlocking ? 1 : 2, repeat: isUnlocking ? 0 : Infinity, ease: 'easeInOut' }}
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" />
            </motion.svg>
            {isUnlocking ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </motion.button>

          {/* Değerlendiriciler için tek tık demo giriş */}
          <motion.button type="button" onClick={handleDemoLogin} disabled={isUnlocking}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full py-2.5 rounded-full font-heading font-semibold text-sm flex items-center justify-center gap-2 border-2 transition-all"
            style={{ borderColor: isDark ? '#7BC043' : '#5A9A2A', color: isDark ? '#7BC043' : '#366b00', background: 'transparent' }}>
            <span role="img" aria-label="key">🔑</span> Admin Girişi (Demo)
          </motion.button>

          {/* Ayraç */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
            <span className="text-xs font-mono" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>
              veya şununla devam et
            </span>
            <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
          </div>

          {/* Google + Apple */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button type="button"
              whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2.5 py-3 rounded-full text-sm font-body font-medium transition-all shadow-sm"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'white',
                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
                color: isDark ? '#e5e7eb' : '#374151',
                boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
              }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </motion.button>

            <motion.button type="button"
              whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2.5 py-3 rounded-full text-sm font-body font-medium transition-all shadow-sm"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'white',
                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
                color: isDark ? '#e5e7eb' : '#374151',
                boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
              }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"
                style={{ color: isDark ? '#e5e7eb' : '#1F2937' }}>
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Apple
            </motion.button>
          </div>

          {/* Kayıt linki */}
          <div className="text-center pt-2">
            <span className="font-body text-sm" style={{ color: isDark ? '#9DB8A0' : '#6a9241' }}>
              Hesabın yok mu?{' '}
            </span>
            <button type="button" onClick={onGoRegister}
              className="font-body text-sm font-semibold hover:underline"
              style={{ color: isDark ? '#7BC043' : '#366b00' }}>
              Kayıt Ol
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}