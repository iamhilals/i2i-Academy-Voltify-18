import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    console.log('Login denemesi:', { username, password });
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* GÖKYÜZÜ — nefes alan gradient (Pixar sabahı) */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(to bottom, #FFB088 0%, #FFD8A8 30%, #FFE9C8 55%, #B8E0F5 85%, #7EC8E8 100%)',
            'linear-gradient(to bottom, #FFC098 0%, #FFE0B8 30%, #FFF0D0 55%, #C0E8FA 85%, #8ED0F0 100%)',
            'linear-gradient(to bottom, #FFB088 0%, #FFD8A8 30%, #FFE9C8 55%, #B8E0F5 85%, #7EC8E8 100%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* GÜNEŞ + Işıması */}
      <motion.div
        className="absolute"
        style={{ top: '12%', right: '15%', width: 180, height: 180 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Işıma halesi */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,235,150,0.9) 0%, rgba(255,220,120,0.4) 40%, transparent 70%)',
            filter: 'blur(20px)',
            transform: 'scale(2)',
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        {/* Güneş */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 40% 40%, #FFF8DC 0%, #FFE066 50%, #FFB84D 100%)',
            boxShadow:
              '0 0 60px 20px rgba(255, 224, 102, 0.7), 0 0 100px 40px rgba(255, 184, 77, 0.5)',
          }}
        />
      </motion.div>

      {/* BULUTLAR — 3 katman parallax */}
      <CloudLayer count={4} y={80} scale={1.2} opacity={0.9} duration={90} />
      <CloudLayer count={3} y={140} scale={1.5} opacity={0.75} duration={130} />
      <CloudLayer count={5} y={200} scale={0.9} opacity={0.6} duration={170} />

      {/* KUŞLAR — üstten geçiyor */}
      {[...Array(5)].map((_, i) => (
        <Bird key={i} delay={i * 4} yOffset={100 + i * 30} />
      ))}

      {/* UZAK DAĞLAR (en arka katman) */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        viewBox="0 0 1200 300"
        preserveAspectRatio="xMidYMax slice"
        style={{ height: '55%' }}
      >
        <path
          d="M0,180 L120,120 L240,160 L360,90 L480,140 L600,100 L720,150 L840,110 L960,140 L1080,120 L1200,150 L1200,300 L0,300 Z"
          fill="#8AB5D6"
          opacity="0.65"
        />
      </svg>

      {/* ORTA DAĞLAR */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        viewBox="0 0 1200 300"
        preserveAspectRatio="xMidYMax slice"
        style={{ height: '45%' }}
      >
        <path
          d="M0,220 L100,180 L220,200 L340,140 L460,180 L580,130 L700,170 L820,150 L940,180 L1060,160 L1200,190 L1200,300 L0,300 Z"
          fill="#6FA5C7"
          opacity="0.85"
        />
      </svg>

      {/* YEŞİL TEPELER — ön plan */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        viewBox="0 0 1200 350"
        preserveAspectRatio="xMidYMax slice"
        style={{ height: '38%' }}
      >
        {/* Uzak yeşil tepe */}
        <path
          d="M0,220 Q150,170 300,200 T600,210 T900,195 T1200,210 L1200,350 L0,350 Z"
          fill="#7BA05B"
        />
        {/* Orta tepe */}
        <path
          d="M0,260 Q200,220 400,245 T800,255 T1200,240 L1200,350 L0,350 Z"
          fill="#6A9250"
        />
      </svg>

      {/* RÜZGAR TÜRBİNLERİ */}
      <Turbine x="15%" bottom="30%" scale={0.7} speed={6} />
      <Turbine x="82%" bottom="32%" scale={0.6} speed={7} />
      <Turbine x="72%" bottom="28%" scale={0.5} speed={5} />

      {/* KÜÇÜK EVLER (Pixar/Up tarzı) */}
      <CartoonHouse x="25%" bottom="22%" color="#E63946" roofColor="#8B2635" />
      <CartoonHouse x="60%" bottom="20%" color="#F4A261" roofColor="#8B5A2B" />
      <CartoonHouse x="45%" bottom="18%" color="#4A90E2" roofColor="#2C5A87" scale={0.9} />

      {/* AĞAÇLAR */}
      <Tree x="8%" bottom="16%" scale={1.1} />
      <Tree x="35%" bottom="14%" scale={0.9} />
      <Tree x="55%" bottom="12%" scale={1.0} />
      <Tree x="88%" bottom="15%" scale={1.2} />
      <Tree x="95%" bottom="10%" scale={0.8} />

      {/* Süzülen enerji parçacıkları */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(180,240,150,1) 0%, rgba(150,220,110,0.5) 70%, transparent 100%)',
              filter: 'blur(1px)',
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
            }}
            animate={{
              y: -50,
              x: Math.random() * window.innerWidth,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* LOGIN KARTI */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        className="relative z-10 bg-white/85 backdrop-blur-md rounded-lg shadow-2xl p-10 w-full max-w-md mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="w-20 h-20 bg-white rounded-lg shadow-md flex items-center justify-center mb-4"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-12 h-12 text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </motion.div>
          <h1 className="font-heading text-5xl font-bold text-primary">Voltify</h1>
          <p className="font-body text-lg text-on-surface-variant mt-1">
            Enerjinizi Yönetin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-mono text-sm text-on-surface-variant mb-2">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
                className="w-full pl-12 pr-4 py-3 bg-white/60 border border-outline-variant rounded-full font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-sm text-on-surface-variant mb-2">
              Şifre
            </label>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-white/60 border border-outline-variant rounded-full font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="text-error text-sm font-body text-center">{error}</div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary py-3 rounded-full font-heading font-semibold text-lg flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <motion.svg
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" />
            </motion.svg>
            Enerjiyi Yönet
          </motion.button>

          <div className="text-center">
            <Link
              to="/register"
              className="text-secondary font-body text-sm hover:underline"
            >
              Yeni misiniz? Kayıt Olun
            </Link>
          </div>

          <div className="flex items-center justify-center gap-3 text-sm font-mono text-on-surface-variant">
            <span className="flex items-center gap-1">
              🌐 <span className="font-semibold">TR</span>
            </span>
            <span className="text-outline">|</span>
            <span>EN</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ----- YARDIMCI BILEŞENLER ----- */

// Bulut katmanı
function CloudLayer({ count, y, scale, opacity, duration }) {
  return (
    <div className="absolute inset-x-0 pointer-events-none" style={{ top: `${y}px` }}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: Math.random() * 60,
            transform: `scale(${scale})`,
            opacity,
          }}
          initial={{ x: -300 }}
          animate={{ x: '110vw' }}
          transition={{
            duration,
            repeat: Infinity,
            delay: (i * duration) / count,
            ease: 'linear',
          }}
        >
          <Cloud />
        </motion.div>
      ))}
    </div>
  );
}

// Basit yumuşak bulut SVG
function Cloud() {
  return (
    <svg width="160" height="70" viewBox="0 0 160 70">
      <ellipse cx="40" cy="45" rx="30" ry="20" fill="white" />
      <ellipse cx="70" cy="35" rx="35" ry="25" fill="white" />
      <ellipse cx="100" cy="40" rx="30" ry="22" fill="white" />
      <ellipse cx="125" cy="50" rx="25" ry="18" fill="white" />
    </svg>
  );
}

// Uçan kuş (V şeklinde)
function Bird({ delay, yOffset }) {
  return (
    <motion.svg
      className="absolute pointer-events-none"
      style={{ top: `${yOffset}px`, left: '-50px' }}
      width="30"
      height="20"
      viewBox="0 0 30 20"
      initial={{ x: -50, y: 0 }}
      animate={{ x: '110vw', y: [0, -20, 0, -15, 0] }}
      transition={{
        duration: 25,
        repeat: Infinity,
        delay,
        ease: 'linear',
      }}
    >
      <motion.path
        d="M2,15 Q8,5 15,12 Q22,5 28,15"
        stroke="#3d3d3d"
        strokeWidth="2"
        fill="none"
        animate={{
          d: [
            'M2,15 Q8,5 15,12 Q22,5 28,15',
            'M2,10 Q8,15 15,8 Q22,15 28,10',
            'M2,15 Q8,5 15,12 Q22,5 28,15',
          ],
        }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}

// Rüzgar türbini
function Turbine({ x, bottom, scale, speed }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: x, bottom, transform: `scale(${scale})` }}
    >
      {/* Direk */}
      <div
        className="absolute"
        style={{
          left: 38,
          bottom: 0,
          width: 4,
          height: 120,
          background: 'linear-gradient(to bottom, #e8e8e8, #b0b0b0)',
        }}
      />
      {/* Kanatlar */}
      <motion.svg
        className="absolute"
        style={{ left: 0, bottom: 100, width: 80, height: 80 }}
        viewBox="0 0 80 80"
        animate={{ rotate: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        <g transform="translate(40,40)">
          <path d="M0,0 L-3,-38 L3,-38 Z" fill="#f5f5f5" stroke="#c0c0c0" strokeWidth="0.5" />
          <path
            d="M0,0 L-3,-38 L3,-38 Z"
            fill="#f5f5f5"
            stroke="#c0c0c0"
            strokeWidth="0.5"
            transform="rotate(120)"
          />
          <path
            d="M0,0 L-3,-38 L3,-38 Z"
            fill="#f5f5f5"
            stroke="#c0c0c0"
            strokeWidth="0.5"
            transform="rotate(240)"
          />
          <circle r="4" fill="#a0a0a0" />
        </g>
      </motion.svg>
    </div>
  );
}

// Karikatür ev
function CartoonHouse({ x, bottom, color, roofColor, scale = 1 }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, bottom, transform: `scale(${scale})` }}
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="80" height="90" viewBox="0 0 80 90">
        {/* Duvar */}
        <rect x="10" y="35" width="60" height="50" fill={color} rx="3" />
        {/* Çatı */}
        <polygon points="5,40 40,10 75,40" fill={roofColor} />
        {/* Kapı */}
        <rect x="32" y="55" width="16" height="30" fill="#5C3317" rx="2" />
        <circle cx="44" cy="70" r="1.5" fill="#FFD700" />
        {/* Pencereler — sıcak sarı ışıkla */}
        <rect x="15" y="45" width="12" height="12" fill="#FFEB99" stroke={roofColor} strokeWidth="1.5" rx="1" />
        <rect x="53" y="45" width="12" height="12" fill="#FFEB99" stroke={roofColor} strokeWidth="1.5" rx="1" />
        {/* Baca */}
        <rect x="52" y="15" width="8" height="15" fill={roofColor} />
      </svg>
    </motion.div>
  );
}

// Ağaç
function Tree({ x, bottom, scale = 1 }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, bottom, transform: `scale(${scale})` }}
      animate={{ rotate: [-1, 1, -1] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformOrigin: 'bottom center', left: x, bottom }}
    >
      <svg width="60" height="90" viewBox="0 0 60 90">
        {/* Gövde */}
        <rect x="26" y="55" width="8" height="35" fill="#6B4423" rx="2" />
        {/* Yapraklar - 3 katman balon şeklinde */}
        <circle cx="30" cy="50" r="20" fill="#5C8A3D" />
        <circle cx="18" cy="42" r="15" fill="#6EA04A" />
        <circle cx="42" cy="42" r="15" fill="#6EA04A" />
        <circle cx="30" cy="30" r="18" fill="#7AB055" />
      </svg>
    </motion.div>
  );
}