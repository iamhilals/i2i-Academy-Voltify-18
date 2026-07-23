import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoginCard from './LoginCard';
import RegisterCard from './RegisterCard';

export default function AuthLayout({ mode }) {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const mousePosRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Sabit rastgele değerler
  const stars = useMemo(() =>
    [...Array(120)].map(() => ({
      size: Math.random() > 0.8 ? 2 : 1,
      left: Math.random() * 100,
      top: Math.random() * 55,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    })), []);

  const clouds = useMemo(() => [
    { y: 55, topOffset: 10, scale: 1.4, duration: 90, delay: 0 },
    { y: 55, topOffset: 35, scale: 1.8, duration: 110, delay: 25 },
    { y: 130, topOffset: 15, scale: 1.6, duration: 130, delay: 45 },
    { y: 130, topOffset: 40, scale: 1.2, duration: 100, delay: 70 },
    { y: 200, topOffset: 5, scale: 2.0, duration: 160, delay: 15 },
  ], []);

  const particles = useMemo(() =>
    [...Array(18)].map(() => ({
      startX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
      endX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
      duration: 12 + Math.random() * 8,
      delay: Math.random() * 8,
    })), []);

  const houses = useMemo(() => [
    { x: '2%',  color: '#E63946', roof: '#8B2635', scale: 0.9,  delay: 0,   mobileHide: true  },
    { x: '13%', color: '#F4A261', roof: '#8B5A2B', scale: 1.05, delay: 0.5, mobileHide: false },
    { x: '26%', color: '#4A90E2', roof: '#2C5A87', scale: 0.85, delay: 1,   mobileHide: true  },
    { x: '38%', color: '#9B59B6', roof: '#5D2E7A', scale: 0.95, delay: 1.5, mobileHide: true  },
    { x: '56%', color: '#E67E22', roof: '#8B4513', scale: 0.9,  delay: 0.3, mobileHide: false },
    { x: '70%', color: '#16A085', roof: '#0E5F4B', scale: 1.0,  delay: 0.8, mobileHide: true  },
    { x: '82%', color: '#C0392B', roof: '#6B1F17', scale: 0.85, delay: 1.2, mobileHide: false },
    { x: '92%', color: '#F39C12', roof: '#8B5A00', scale: 0.9,  delay: 1.7, mobileHide: true  },
  ], []);

  const GROUND_Y = 90;

  const goToLogin = () => navigate('/login');
  const goToRegister = () => navigate('/register');

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">

      {/* GÖKYÜZÜ */}
      <motion.div className="absolute inset-0"
        animate={{
          background: isDark
            ? 'linear-gradient(to bottom, #0B1026 0%, #1A1B4B 30%, #2D1B4E 60%, #3D2C6B 100%)'
            : 'linear-gradient(to bottom, #FFB088 0%, #FFC898 20%, #FFE0B8 40%, #FFECD0 55%, #D4E9F5 75%, #A8D5EE 100%)',
        }}
        transition={{ duration: 2 }}
      />

      {/* Atmosferik glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: isDark
          ? 'radial-gradient(ellipse at 50% 100%, rgba(180,150,255,0.15) 0%, transparent 60%)'
          : 'radial-gradient(ellipse at 50% 100%, rgba(255,200,140,0.3) 0%, transparent 60%)',
      }} />

      {/* YILDIZLAR */}
      <AnimatePresence>
        {isDark && (
          <motion.div className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}>
            {stars.map((s, i) => (
              <motion.div key={i} className="absolute bg-white rounded-full"
                style={{ width: s.size, height: s.size, left: `${s.left}%`, top: `${s.top}%` }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* GÜNEŞ */}
      <motion.div className="absolute pointer-events-none" style={{ width: 200, height: 200 }}
        animate={{ top: isDark ? '110%' : '10%', right: '12%', opacity: isDark ? 0 : 1, scale: [1, 1.04, 1] }}
        transition={{ top: { duration: 2.5, ease: 'easeInOut' }, opacity: { duration: 1.5 }, scale: { duration: 4, repeat: Infinity } }}>
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(255,220,140,0.7) 0%, rgba(255,190,100,0.35) 40%, transparent 70%)',
          filter: 'blur(30px)', transform: 'scale(2.5)',
        }} />
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 40% 40%, #FFF8DC 0%, #FFE066 45%, #FFB84D 100%)',
          boxShadow: '0 0 80px 30px rgba(255,210,100,0.6)',
        }} />
      </motion.div>

      {/* AY */}
      <motion.div className="absolute pointer-events-none" style={{ width: 130, height: 130 }}
        animate={{ top: isDark ? '10%' : '-20%', right: '18%', opacity: isDark ? 1 : 0 }}
        transition={{ duration: 2.5, ease: 'easeInOut' }}>
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(220,220,255,0.6) 0%, rgba(180,180,240,0.3) 40%, transparent 70%)',
          filter: 'blur(15px)', transform: 'scale(2)',
        }} />
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E8E8F5 40%, #B8B8D0 100%)',
          boxShadow: 'inset -15px -15px 30px rgba(100,100,140,0.5), 0 0 40px rgba(255,255,255,0.4)',
        }} />
        <div className="absolute top-7 left-9 w-4 h-4 rounded-full" style={{ background: '#B8B8D0' }} />
        <div className="absolute top-14 left-5 w-3 h-3 rounded-full" style={{ background: '#B8B8D0' }} />
      </motion.div>

      {/* BULUTLAR */}
      {clouds.map((c, i) => (
        <div key={i} className="absolute inset-x-0 pointer-events-none"
          style={{ top: `${c.y + c.topOffset}px`, opacity: isDark ? 0.15 : 0.85 }}>
          <motion.div className="absolute" style={{ transform: `scale(${c.scale})` }}
            initial={{ x: -300 }} animate={{ x: '110vw' }}
            transition={{ duration: c.duration, repeat: Infinity, delay: c.delay, ease: 'linear' }}>
            <svg width="200" height="80" viewBox="0 0 200 80">
              <ellipse cx="50" cy="55" rx="35" ry="22" fill={isDark ? '#3A4060' : 'white'} />
              <ellipse cx="85" cy="42" rx="40" ry="28" fill={isDark ? '#3A4060' : 'white'} />
              <ellipse cx="120" cy="48" rx="35" ry="25" fill={isDark ? '#3A4060' : 'white'} />
              <ellipse cx="150" cy="58" rx="30" ry="20" fill={isDark ? '#3A4060' : 'white'} />
            </svg>
          </motion.div>
        </div>
      ))}

      {/* KUŞLAR */}
      {!isDark && [0, 5, 10, 15, 20].map((delay, i) => (
        <motion.svg key={i} className="absolute pointer-events-none"
          style={{ top: `${90 + i * 35}px`, left: '-50px' }}
          width="28" height="18" viewBox="0 0 28 18"
          initial={{ x: -50, y: 0 }} animate={{ x: '110vw', y: [0, -18, 0, -12, 0] }}
          transition={{ duration: 22, repeat: Infinity, delay, ease: 'linear' }}>
          <motion.path d="M2,13 Q7,4 14,10 Q21,4 26,13" stroke="#555" strokeWidth="1.5" fill="none"
            animate={{ d: ['M2,13 Q7,4 14,10 Q21,4 26,13', 'M2,9 Q7,13 14,7 Q21,13 26,9', 'M2,13 Q7,4 14,10 Q21,4 26,13'] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }} />
        </motion.svg>
      ))}

      {/* DAĞLAR */}
      <svg className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" style={{ height: '55%', filter: 'blur(1px)' }}>
        <motion.path d="M0,180 L120,120 L240,160 L360,90 L480,140 L600,100 L720,150 L840,110 L960,140 L1080,120 L1200,150 L1200,300 L0,300 Z"
          animate={{ fill: isDark ? '#2D3454' : '#9BC2DC' }} transition={{ duration: 2 }} opacity={0.55} />
      </svg>
      <svg className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" style={{ height: '45%' }}>
        <motion.path d="M0,220 L100,180 L220,200 L340,140 L460,180 L580,130 L700,170 L820,150 L940,180 L1060,160 L1200,190 L1200,300 L0,300 Z"
          animate={{ fill: isDark ? '#252B4A' : '#7BA5C9' }} transition={{ duration: 2 }} opacity={0.85} />
      </svg>
      <svg className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        viewBox="0 0 1200 350" preserveAspectRatio="xMidYMax slice" style={{ height: '38%' }}>
        <defs>
          <linearGradient id="h1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#3A5849' : '#8EB670'} />
            <stop offset="100%" stopColor={isDark ? '#2F4A3D' : '#6A9250'} />
          </linearGradient>
          <linearGradient id="h2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#324B3E' : '#7EA062'} />
            <stop offset="100%" stopColor={isDark ? '#263C33' : '#5A8443'} />
          </linearGradient>
        </defs>
        <path d="M0,220 Q150,170 300,200 T600,210 T900,195 T1200,210 L1200,350 L0,350 Z" fill="url(#h1)" />
        <path d="M0,260 Q200,220 400,245 T800,255 T1200,240 L1200,350 L0,350 Z" fill="url(#h2)" />
      </svg>

      {/* RÜZGAR TÜRBİNLERİ */}
      {[{ x: '7%', b: '30%', s: 0.7, sp: 6 }, { x: '90%', b: '32%', s: 0.6, sp: 7 }, { x: '76%', b: '28%', s: 0.5, sp: 5 }].map((t, i) => (
        <div key={i} className="absolute hidden sm:block pointer-events-none" style={{ left: t.x, bottom: t.b, transform: `scale(${t.s})` }}>
          <div className="absolute" style={{ left: 38, bottom: 0, width: 4, height: 120, background: isDark ? 'linear-gradient(to bottom,#6b7280,#374151)' : 'linear-gradient(to bottom,#e8e8e8,#b0b0b0)' }} />
          {isDark && <motion.div className="absolute rounded-full" style={{ left: 36, bottom: 125, width: 8, height: 8, background: '#ff0033', boxShadow: '0 0 12px 4px rgba(255,0,51,0.8)' }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />}
          <motion.svg className="absolute" style={{ left: 0, bottom: 100, width: 80, height: 80 }} viewBox="0 0 80 80" animate={{ rotate: 360 }} transition={{ duration: t.sp, repeat: Infinity, ease: 'linear' }}>
            <g transform="translate(40,40)">
              {[0, 120, 240].map(r => <path key={r} d="M0,0 L-3,-38 L3,-38 Z" fill={isDark ? '#9CA3AF' : '#f5f5f5'} stroke={isDark ? '#4B5563' : '#c0c0c0'} strokeWidth="0.5" transform={`rotate(${r})`} />)}
              <circle r="4" fill={isDark ? '#4B5563' : '#a0a0a0'} />
            </g>
          </motion.svg>
        </div>
      ))}

      {/* KALDIRIM */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{
        height: `${GROUND_Y}px`,
        background: isDark ? 'linear-gradient(to bottom, transparent, #1A1F2E 25%, #0F1421 100%)' : 'linear-gradient(to bottom, transparent, #8A9B54 15%, #6E7F42 35%, #4C6B38 100%)',
      }} />

      {/* EVLER */}
      {houses.map((h, i) => (
        <motion.div key={i}
          className={`absolute pointer-events-none ${h.mobileHide ? 'hidden sm:block' : 'block'}`}
          style={{ left: h.x, bottom: `${GROUND_Y - 5}px`, transform: `scale(${h.scale})` }}
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: h.delay }}>
          <svg width="80" height="90" viewBox="0 0 80 90" style={{ transition: 'all 2s ease' }}>
            <rect x="10" y="35" width="60" height="50" fill={isDark ? '#3D3D3D' : h.color} rx="3" />
            <polygon points="5,40 40,10 75,40" fill={isDark ? '#1A1A2E' : h.roof} />
            <rect x="32" y="55" width="16" height="30" fill="#5C3317" rx="2" />
            <motion.rect x="15" y="45" width="12" height="12" fill="#FFEB99" stroke={isDark ? '#1A1A2E' : h.roof} strokeWidth="1.5" rx="1" animate={{ opacity: isDark ? [0.8, 1, 0.8] : 1 }} transition={{ duration: 2, repeat: Infinity }} style={{ filter: isDark ? 'drop-shadow(0 0 6px #FFEB99)' : 'none' }} />
            <motion.rect x="53" y="45" width="12" height="12" fill="#FFEB99" stroke={isDark ? '#1A1A2E' : h.roof} strokeWidth="1.5" rx="1" animate={{ opacity: isDark ? [1, 0.85, 1] : 1 }} transition={{ duration: 2.5, repeat: Infinity }} style={{ filter: isDark ? 'drop-shadow(0 0 6px #FFEB99)' : 'none' }} />
            <rect x="52" y="15" width="8" height="15" fill={isDark ? '#1A1A2E' : h.roof} />
          </svg>
        </motion.div>
      ))}

      {/* SOKAK LAMBALARI */}
      {['10%', '34%', '52%', '68%', '88%'].map((x, i) => (
        <div key={i} className="absolute hidden sm:block pointer-events-none" style={{ left: x, bottom: `${GROUND_Y - 5}px` }}>
          <svg width="30" height="130" viewBox="0 0 30 130" style={{ transition: 'all 2s ease' }}>
            <rect x="13" y="20" width="4" height="105" fill={isDark ? '#2C2C3E' : '#5A5A6E'} />
            <rect x="10" y="15" width="14" height="3" fill={isDark ? '#2C2C3E' : '#5A5A6E'} />
            <rect x="7" y="5" width="16" height="12" rx="2" fill={isDark ? '#1F1F2E' : '#3F3F5E'} />
          </svg>
          {isDark && (
            <>
              <motion.div className="absolute rounded-full pointer-events-none"
                style={{ width: 100, height: 100, left: -35, top: -10, background: 'radial-gradient(circle, rgba(255,235,120,0.4) 0%, rgba(255,220,80,0.2) 40%, transparent 70%)', filter: 'blur(8px)' }}
                animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }} />
              <div className="absolute rounded-full pointer-events-none" style={{ width: 8, height: 8, left: 11, top: 8, background: '#FFEB99', boxShadow: '0 0 20px 8px rgba(255,235,153,0.9)' }} />
            </>
          )}
        </div>
      ))}

      {/* AĞAÇLAR */}
      {[
        { x: '7%', scale: 0.8 }, { x: '22%', scale: 0.9 },
        { x: '46%', scale: 1.0 }, { x: '64%', scale: 0.85 }, { x: '80%', scale: 0.95 }
      ].map((t, i) => (
        <motion.div key={i} className="absolute pointer-events-none"
          style={{ left: t.x, bottom: `${GROUND_Y - 20}px`, transformOrigin: 'bottom center' }}
          animate={{ rotate: [-1, 1, -1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <div style={{ transform: `scale(${t.scale})` }}>
            <svg width="60" height="90" viewBox="0 0 60 90" style={{ transition: 'all 2s ease' }}>
              <rect x="26" y="55" width="8" height="35" fill={isDark ? '#3D2817' : '#6B4423'} rx="2" />
              <circle cx="30" cy="50" r="20" fill={isDark ? '#1F3A2A' : '#5C8A3D'} />
              <circle cx="18" cy="42" r="15" fill={isDark ? '#264534' : '#6EA04A'} />
              <circle cx="42" cy="42" r="15" fill={isDark ? '#264534' : '#6EA04A'} />
              <circle cx="30" cy="30" r="18" fill={isDark ? '#2D4F3D' : '#7AB055'} />
            </svg>
          </div>
        </motion.div>
      ))}

      {/* KEDİLER */}
      <Cat startX={-100} direction={1} baseY={GROUND_Y - 55} speed={45}
        color="#3D3D3D" stripeColor="#1A1A1A" mousePosRef={mousePosRef} isDark={isDark} />
      <Cat startX={typeof window !== 'undefined' ? window.innerWidth + 100 : 1300}
        direction={-1} baseY={GROUND_Y - 55} speed={35}
        color="#B8804A" stripeColor="#7A4820" mousePosRef={mousePosRef} isDark={isDark} />

      {/* PARTİKÜLLER */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <motion.div key={i} className="absolute w-2 h-2 rounded-full"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(180,200,255,1) 0%, rgba(150,180,240,0.5) 70%, transparent 100%)'
                : 'radial-gradient(circle, rgba(180,240,150,1) 0%, rgba(150,220,110,0.5) 70%, transparent 100%)',
              filter: 'blur(1px)',
            }}
            initial={{ x: p.startX, y: typeof window !== 'undefined' ? window.innerHeight + 50 : 900 }}
            animate={{ y: -50, x: p.endX, opacity: [0, 1, 1, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'linear' }} />
        ))}
      </div>

      {/* DARK MODE TOGGLE */}
      <motion.button onClick={() => setIsDark(!isDark)}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        className="absolute top-4 right-4 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/30 backdrop-blur-md shadow-lg flex items-center justify-center">
        <motion.div animate={{ rotate: isDark ? 180 : 0 }} transition={{ duration: 0.5 }}>
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFEB99" className="w-6 h-6">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4A5568" className="w-6 h-6">
              <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
            </svg>
          )}
        </motion.div>
      </motion.button>

      {/* KART GEÇİŞİ — arka plan değişmez, sadece kart kayar */}
      <AnimatePresence mode="wait">
        {mode === 'login' ? (
          <motion.div key="login"
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -120 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-20"
          >
            <LoginCard isDark={isDark} onGoRegister={goToRegister} />
          </motion.div>
        ) : (
          <motion.div key="register"
            initial={{ opacity: 0, x: 120 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-20"
          >
            <RegisterCard isDark={isDark} onGoLogin={goToLogin} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---- KATEDİ ---- */
function Cat({ startX, direction, baseY, speed, color, stripeColor, mousePosRef, isDark }) {
  const [x, setX] = useState(startX);
  const [state, setState] = useState('walking');
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [tailPhase, setTailPhase] = useState(0);
  const [legPhase, setLegPhase] = useState(0);
  const posRef = useRef(startX);
  const stateRef = useRef('walking');
  const idleTimerRef = useRef(null);
  const idleActiveRef = useRef(false);

  const scheduleNextIdle = () => {
    const waitTime = 4000 + Math.random() * 8000;
    idleTimerRef.current = setTimeout(() => {
      if (stateRef.current === 'walking') {
        idleActiveRef.current = true;
        stateRef.current = 'idle';
        setState('idle');
        setTimeout(() => {
          if (stateRef.current === 'idle') {
            idleActiveRef.current = false;
            stateRef.current = 'walking';
            setState('walking');
          }
          scheduleNextIdle();
        }, 2000 + Math.random() * 2000);
      } else {
        scheduleNextIdle();
      }
    }, waitTime);
  };

  useEffect(() => {
    scheduleNextIdle();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let lastTime = performance.now();
    let animId;
    const animate = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setTailPhase(p => (p + dt * 2) % (Math.PI * 2));
      setLegPhase(p => (p + dt * 8) % (Math.PI * 2));
      const catScreenY = window.innerHeight - baseY - 25;
      const dx = mousePosRef.current.x - posRef.current;
      const dy = mousePosRef.current.y - catScreenY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let newState = idleActiveRef.current ? 'idle' : 'walking';
      if (dist < 90) newState = 'jumping';
      else if (dist < 200) newState = 'sitting';
      if (newState !== stateRef.current) {
        if (newState === 'walking' || newState === 'idle') idleActiveRef.current = newState === 'idle';
        stateRef.current = newState;
        setState(newState);
      }
      const angle = Math.atan2(dy, dx);
      setEyeOffset({ x: Math.cos(angle) * 1.5, y: Math.sin(angle) * 1.5 });
      if (newState === 'walking') {
        posRef.current += direction * speed * dt;
        if (direction > 0 && posRef.current > window.innerWidth + 100) posRef.current = -100;
        else if (direction < 0 && posRef.current < -100) posRef.current = window.innerWidth + 100;
      }
      setX(posRef.current);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [direction, speed, baseY, mousePosRef]);

  const tailSwing = Math.sin(tailPhase) * 12;
  const tailTip = Math.sin(tailPhase * 1.3 + 0.5) * 8;
  const isMoving = state === 'walking';
  const legSwing = isMoving ? Math.sin(legPhase) * 4 : 0;
  const legSwing2 = isMoving ? Math.sin(legPhase + Math.PI) * 4 : 0;
  const facingScale = direction > 0 ? -1 : 1;

  return (
    <motion.div className="absolute pointer-events-none z-10"
      style={{ left: x, bottom: baseY }}
      animate={state === 'jumping' ? { y: [0, -20, 0] } : { y: 0 }}
      transition={{ duration: 0.4, repeat: state === 'jumping' ? Infinity : 0 }}>
      <svg width="70" height="55" viewBox="0 0 70 55"
        style={{ transform: `scaleX(${facingScale})`, transformOrigin: 'center', display: 'block' }}>
        <path d={`M54,36 Q${64 + tailSwing},${28 - Math.abs(tailSwing * 0.3)} ${60 + tailTip},${18 - tailSwing * 0.5}`}
          stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx={60 + tailTip} cy={18 - tailSwing * 0.5} r="4" fill={color} opacity="0.7" />
        <ellipse cx="30" cy="34" rx="20" ry="12" fill={color} />
        <ellipse cx="30" cy="38" rx="14" ry="7" fill={color} opacity="0.85" />
        <path d="M22,31 Q27,29 32,31" stroke={stripeColor} strokeWidth="1.2" fill="none" opacity="0.5" />
        <path d="M24,36 Q29,34 34,36" stroke={stripeColor} strokeWidth="1.2" fill="none" opacity="0.5" />
        <path d="M32,32 Q37,30 42,32" stroke={stripeColor} strokeWidth="1.2" fill="none" opacity="0.5" />
        <ellipse cx={43 + legSwing2} cy={47} rx="3.5" ry="4.5" fill={color} />
        <ellipse cx={50 + legSwing} cy={47} rx="3" ry="4" fill={color} />
        <ellipse cx={16 + legSwing} cy={46} rx="3" ry="5" fill={color} />
        <ellipse cx={23 + legSwing2} cy={47} rx="3" ry="4.5" fill={color} />
        <ellipse cx={16 + legSwing} cy={51} rx="4" ry="2" fill={color} />
        <ellipse cx={23 + legSwing2} cy={52} rx="3.5" ry="1.5" fill={color} />
        <ellipse cx={43 + legSwing2} cy={52} rx="4" ry="2" fill={color} />
        <ellipse cx={50 + legSwing} cy={51} rx="3.5" ry="1.5" fill={color} />
        <ellipse cx="15" cy="28" rx="7" ry="6" fill={color} />
        <ellipse cx="12" cy="22" rx="11" ry="10" fill={color} />
        <path d="M3,15 L4,7 L10,13 Z" fill={color} />
        <path d="M13,12 L18,6 L20,15 Z" fill={color} />
        <path d="M5,14 L6,10 L9,13 Z" fill="#FFB6C1" opacity="0.8" />
        <path d="M14,12 L16.5,9 L18,14 Z" fill="#FFB6C1" opacity="0.8" />
        <circle cx="8" cy="22" r="3" fill="white" />
        <circle cx="16" cy="22" r="3" fill="white" />
        <circle cx={8 + eyeOffset.x} cy={22 + eyeOffset.y} r="2" fill={isDark ? '#FFDD44' : '#3A7A30'} />
        <circle cx={16 + eyeOffset.x} cy={22 + eyeOffset.y} r="2" fill={isDark ? '#FFDD44' : '#3A7A30'} />
        <ellipse cx={8 + eyeOffset.x} cy={22 + eyeOffset.y} rx={state === 'jumping' ? 0.3 : 0.8} ry="1.8" fill="black" />
        <ellipse cx={16 + eyeOffset.x} cy={22 + eyeOffset.y} rx={state === 'jumping' ? 0.3 : 0.8} ry="1.8" fill="black" />
        <circle cx={9 + eyeOffset.x} cy={21 + eyeOffset.y} r="0.5" fill="white" opacity="0.8" />
        <circle cx={17 + eyeOffset.x} cy={21 + eyeOffset.y} r="0.5" fill="white" opacity="0.8" />
        <path d="M10.5,26 L13,26 L11.75,27.5 Z" fill="#E091A0" />
        <path d="M11.75,27.5 Q9.5,29.5 7.5,29" stroke="#555" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        <path d="M11.75,27.5 Q14,29.5 16,29" stroke="#555" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        <line x1="3" y1="26" x2="-2" y2="25" stroke={stripeColor} strokeWidth="0.6" opacity="0.8" />
        <line x1="3" y1="27.5" x2="-2" y2="27.5" stroke={stripeColor} strokeWidth="0.6" opacity="0.8" />
        <line x1="20" y1="26" x2="25" y2="25" stroke={stripeColor} strokeWidth="0.6" opacity="0.8" />
        <line x1="20" y1="27.5" x2="25" y2="27.5" stroke={stripeColor} strokeWidth="0.6" opacity="0.8" />
        {state === 'sitting' && (
          <>
            <ellipse cx="8" cy="50" rx="5" ry="3" fill={color} />
            <ellipse cx="18" cy="50" rx="5" ry="3" fill={color} />
          </>
        )}
      </svg>
      <AnimatePresence>
        {state === 'jumping' && (
          <motion.div className="absolute pointer-events-none font-mono font-bold text-sm"
            style={{ top: -28, left: facingScale > 0 ? 30 : -10, color: isDark ? '#FFEB99' : '#333' }}
            initial={{ opacity: 0, scale: 0, y: 5 }} animate={{ opacity: 1, scale: 1, y: -5 }} exit={{ opacity: 0, scale: 0, y: 0 }}>
            😾 miyav!
          </motion.div>
        )}
        {state === 'idle' && (
          <motion.div className="absolute pointer-events-none text-base" style={{ top: -24, left: 10 }}
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}>
            💤
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}