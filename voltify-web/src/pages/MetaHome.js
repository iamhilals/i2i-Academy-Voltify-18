import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, OrbitControls, Html, useKeyboardControls, KeyboardControls, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowLeft, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Device Component
const InteractiveDevice = ({ deviceId, isActive, onDoubleClick, setOrbitEnabled, position, name, type, status, wattage, color, playerRef, rotationY = 0 }) => {
  const meshRef = useRef();
  const [showTooltip, setShowTooltip] = useState(false);

  useFrame(() => {
    if (meshRef.current && playerRef.current) {
      // Calculate distance between device and player
      const distance = meshRef.current.position.distanceTo(playerRef.current.position);
      
      // If close enough (e.g., 3 units), show tooltip
      if (distance < 3 && !showTooltip) {
        setShowTooltip(true);
      } else if (distance >= 3 && showTooltip) {
        setShowTooltip(false);
      }
    }
  });

  // Render the device mesh/group based on name or type
  const renderDevice3DShape = () => {
    const lower = name.toLowerCase();
    const lowerType = type ? type.toLowerCase() : '';

    // 1. Refrigerator / Freezer (Buzdolabı / Soğutucu)
    if (lowerType.includes('soğutucu') || lower.includes('buzdolabı') || lower.includes('fridge') || lower.includes('dondurucu')) {
      return (
        <group>
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 1.8, 0.8]} />
            <meshStandardMaterial color="#B0C4DE" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.35, 0.41]} castShadow>
            <boxGeometry args={[0.86, 0.7, 0.05]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.45, 0.41]} castShadow>
            <boxGeometry args={[0.86, 1.0, 0.05]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.18, 0.65, 0.44]}>
            <boxGeometry args={[0.26, 0.35, 0.01]} />
            <meshStandardMaterial color="#111" roughness={0.1} />
          </mesh>
          <mesh position={[0.18, 0.65, 0.45]}>
            <boxGeometry args={[0.22, 0.31, 0.005]} />
            <meshStandardMaterial color="#07170E" emissive={status === 'Hata' ? '#EF4444' : '#10B981'} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[-0.35, 1.1, 0.44]} castShadow>
            <boxGeometry args={[0.03, 0.18, 0.03]} />
            <meshStandardMaterial color="#333" metalness={0.9} />
          </mesh>
          <mesh position={[-0.35, 0.7, 0.44]} castShadow>
            <boxGeometry args={[0.03, 0.28, 0.03]} />
            <meshStandardMaterial color="#333" metalness={0.9} />
          </mesh>
        </group>
      );
    }

    // 2. Air Conditioner (Klima / İklimlendirme)
    if (lowerType.includes('iklimlendirme') || lower.includes('klima') || lower.includes('ac')) {
      return (
        <group position={[0, 0.5, 0]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[1.5, 0.42, 0.32]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.0, 0.05]}>
            <boxGeometry args={[1.42, 0.03, 0.18]} />
            <meshStandardMaterial color="#CBD5E1" />
          </mesh>
          <mesh position={[0.45, 1.12, 0.17]}>
            <boxGeometry args={[0.15, 0.08, 0.01]} />
            <meshStandardMaterial color="#0A1C10" emissive={status === 'Hata' ? '#EF4444' : '#06B6D4'} emissiveIntensity={0.8} />
          </mesh>
        </group>
      );
    }

    // 3. Washing Machine / Dishwasher (Çamaşır / Bulaşık / Beyaz Eşya)
    if (lowerType.includes('beyaz eşya') || lower.includes('çamaşır') || lower.includes('bulaşık') || lower.includes('washer') || lower.includes('makine')) {
      return (
        <group>
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshStandardMaterial color="#F1F5F9" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.82, 0.41]}>
            <boxGeometry args={[0.82, 0.14, 0.05]} />
            <meshStandardMaterial color="#1E293B" roughness={0.2} />
          </mesh>
          <mesh position={[0.22, 0.82, 0.44]}>
            <boxGeometry args={[0.18, 0.08, 0.01]} />
            <meshStandardMaterial color="#0A1C10" emissive={status === 'Hata' ? '#EF4444' : '#10B981'} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0.42, 0.41]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.03, 16]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.42, 0.43]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.01, 16]} />
            <meshStandardMaterial color="#111827" opacity={0.65} transparent roughness={0.1} />
          </mesh>
        </group>
      );
    }

    // 4. Smart Bulb / Lighting (Akıllı Ampul / Aydınlatma)
    if (lower.includes('ampul') || lower.includes('aydınlatma')) {
      return (
        <group>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.3, 12]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.26, 16, 16]} />
            <meshStandardMaterial color="#FFF" emissive={status === 'Hata' ? '#EF4444' : '#EAB308'} emissiveIntensity={status === 'Açık' ? 3 : 0.2} roughness={0.1} />
          </mesh>
        </group>
      );
    }

    // 5. Smart Plug (Akıllı Priz)
    if (lower.includes('priz')) {
      return (
        <group position={[0, 0.25, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.45, 0.45, 0.28]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
          </mesh>
          <mesh position={[-0.08, 0, 0.15]}>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} rotation={[Math.PI/2, 0, 0]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0.08, 0, 0.15]}>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} rotation={[Math.PI/2, 0, 0]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, -0.12, 0.15]} rotation={[Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.05, 0.07, 16]} />
            <meshStandardMaterial color={status === 'Hata' ? '#EF4444' : '#10B981'} emissive={status === 'Hata' ? '#EF4444' : '#10B981'} emissiveIntensity={3} />
          </mesh>
        </group>
      );
    }

    // 6. Computer / Laptop (Bilgisayar / Laptop / Monitör)
    if (lower.includes('bilgisayar') || lower.includes('laptop') || lower.includes('monitör') || lower.includes('computer') || lower.includes('pc')) {
      const isLaptop = lower.includes('laptop') || lower.includes('dizüstü');
      return (
        <group>
          {isLaptop ? (
            <group position={[0, 0.1, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.7, 0.03, 0.5]} />
                <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
              </mesh>
              <mesh position={[0, 0.22, -0.22]} rotation={[-Math.PI / 4, 0, 0]} castShadow>
                <boxGeometry args={[0.7, 0.44, 0.03]} />
                <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
              </mesh>
              <mesh position={[0, 0.22, -0.21]} rotation={[-Math.PI / 4, 0, 0]}>
                <boxGeometry args={[0.66, 0.4, 0.01]} />
                <meshStandardMaterial color="#0A1C10" emissive={status === 'Hata' ? '#EF4444' : '#10B981'} emissiveIntensity={0.3} />
              </mesh>
            </group>
          ) : (
            <group>
              <mesh position={[0.3, 0.45, 0]} castShadow>
                <boxGeometry args={[0.26, 0.8, 0.6]} />
                <meshStandardMaterial color="#0F172A" roughness={0.2} metalness={0.8} />
              </mesh>
              <mesh position={[-0.2, 0.15, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
              <mesh position={[-0.2, 0.55, 0.04]} castShadow>
                <boxGeometry args={[0.9, 0.55, 0.05]} />
                <meshStandardMaterial color="#1E293B" roughness={0.3} />
              </mesh>
              <mesh position={[-0.2, 0.55, 0.07]}>
                <boxGeometry args={[0.85, 0.5, 0.01]} />
                <meshStandardMaterial color="#07170E" emissive={status === 'Hata' ? '#EF4444' : '#06B6D4'} emissiveIntensity={0.4} />
              </mesh>
            </group>
          )}
        </group>
      );
    }

    // 7. Kitchen Cooker / Oven / Microwave / Airfryer (Fırın / Ocak / Mikrodalga / Fritöz / Tost)
    if (lower.includes('fırın') || lower.includes('ocak') || lower.includes('mikrodalga') || lower.includes('airfryer') || lower.includes('tost') || lower.includes('fritöz') || lower.includes('mutfak')) {
      return (
        <group>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.8, 0.8, 0.75]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.35, 0.38]} castShadow>
            <boxGeometry args={[0.65, 0.4, 0.02]} />
            <meshStandardMaterial color="#000" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.35, 0.35]}>
            <boxGeometry args={[0.55, 0.03, 0.01]} />
            <meshStandardMaterial color="#FF5A00" emissive={status === 'Hata' ? '#EF4444' : '#FF5A00'} emissiveIntensity={status === 'Açık' ? 3.5 : 0.2} />
          </mesh>
          <mesh position={[-0.2, 0.68, 0.39]} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 8]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[0.2, 0.68, 0.39]} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 8]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      );
    }

    // 8. Vacuum / Robot Vacuum (Süpürge / Robot)
    if (lower.includes('süpürge') || lower.includes('robot')) {
      const isRobot = lower.includes('robot');
      return (
        <group>
          {isRobot ? (
            <group position={[0, 0.06, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.38, 0.38, 0.12, 24]} />
                <meshStandardMaterial color="#0F172A" roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.08, 0.08]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
                <meshStandardMaterial color="#1E293B" />
              </mesh>
              <mesh position={[0, 0.12, 0.08]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color={status === 'Hata' ? '#EF4444' : '#00F3FF'} emissive={status === 'Hata' ? '#EF4444' : '#00F3FF'} emissiveIntensity={4} />
              </mesh>
            </group>
          ) : (
            <group position={[0, 0.3, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.4, 0.6, 0.4]} />
                <meshStandardMaterial color="#EF4444" roughness={0.4} />
              </mesh>
              <mesh position={[-0.22, -0.15, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.12, 0.12, 0.04, 12]} />
                <meshStandardMaterial color="#111" />
              </mesh>
              <mesh position={[0.22, -0.15, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.12, 0.12, 0.04, 12]} />
                <meshStandardMaterial color="#111" />
              </mesh>
            </group>
          )}
        </group>
      );
    }

    // 9. Coffee / Tea Maker / Kettle (Kahve / Çay / Kettle)
    if (lower.includes('kahve') || lower.includes('çay') || lower.includes('kettle')) {
      return (
        <group position={[0, 0.22, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.5, 0.4]} />
            <meshStandardMaterial color="#1E293B" roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.05, 0.13]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.28, 12]} />
            <meshStandardMaterial color="#FFF" opacity={0.5} transparent roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.09, 0.13]}>
            <cylinderGeometry args={[0.12, 0.12, 0.18, 8]} />
            <meshStandardMaterial color="#4A2C11" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.2, 0.18]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color={status === 'Hata' ? '#EF4444' : '#10B981'} emissive={status === 'Hata' ? '#EF4444' : '#10B981'} emissiveIntensity={3} />
          </mesh>
        </group>
      );
    }

    // 10. Boiler / Kombi / Modem / Network / Router (Kombi / Modem / Router / Bilişim)
    if (lower.includes('kombi') || lower.includes('modem') || lower.includes('router') || lower.includes('bilişim') || lower.includes('bilisim')) {
      const isBoiler = lower.includes('kombi');
      return (
        <group>
          {isBoiler ? (
            <group>
              <mesh position={[0, 1.0, -0.1]} castShadow>
                <boxGeometry args={[0.6, 1.0, 0.38]} />
                <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.7, 0.1]}>
                <boxGeometry args={[0.24, 0.14, 0.02]} />
                <meshStandardMaterial color="#1E293B" />
              </mesh>
              <mesh position={[0, 0.7, 0.115]}>
                <boxGeometry args={[0.2, 0.1, 0.005]} />
                <meshStandardMaterial color="#0A1C10" emissive={status === 'Hata' ? '#EF4444' : '#06B6D4'} emissiveIntensity={0.6} />
              </mesh>
            </group>
          ) : (
            <group position={[0, 0.08, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.6, 0.12, 0.42]} />
                <meshStandardMaterial color="#1E293B" roughness={0.4} />
              </mesh>
              <mesh position={[-0.18, 0.28, -0.16]} rotation={[0.1, 0, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.35, 8]} />
                <meshStandardMaterial color="#111" />
              </mesh>
              <mesh position={[0.18, 0.28, -0.16]} rotation={[0.1, 0, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.35, 8]} />
                <meshStandardMaterial color="#111" />
              </mesh>
              <mesh position={[-0.15, 0, 0.22]}>
                <sphereGeometry args={[0.015, 4, 4]} />
                <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={5} />
              </mesh>
              <mesh position={[0, 0, 0.22]}>
                <sphereGeometry args={[0.015, 4, 4]} />
                <meshStandardMaterial color={status === 'Hata' ? '#EF4444' : '#10B981'} emissive={status === 'Hata' ? '#EF4444' : '#10B981'} emissiveIntensity={5} />
              </mesh>
            </group>
          )}
        </group>
      );
    }

    // 11. Security Camera / Sensors (Kamera / Güvenlik)
    if (lower.includes('kamera') || lower.includes('güvenlik') || lower.includes('sensor') || lower.includes('sensör')) {
      return (
        <group position={[0, 1.2, 0]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 12]} />
            <meshStandardMaterial color="#64748B" />
          </mesh>
          <mesh castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#0F172A" roughness={0.05} metalness={0.9} />
          </mesh>
          <mesh position={[0.06, -0.06, 0.12]} rotation={[Math.PI/4, Math.PI/6, 0]}>
            <torusGeometry args={[0.04, 0.01, 8, 16]} />
            <meshStandardMaterial color="#E2E8F0" />
          </mesh>
          <mesh position={[-0.06, 0.06, 0.12]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={5} />
          </mesh>
        </group>
      );
    }

    // 12. EV Charging Station (Şarj İstasyonu)
    if (lower.includes('şarj') || lower.includes('ev ')) {
      return (
        <group>
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[0.4, 1.6, 0.4]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.2, 0.21]} castShadow>
            <boxGeometry args={[0.26, 0.5, 0.04]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1} />
          </mesh>
          <mesh position={[0, 1.2, 0.24]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={4} />
          </mesh>
        </group>
      );
    }

    // 13. Scale (Baskül)
    if (lower.includes('baskül')) {
      return (
        <group position={[0, 0.03, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.03, 0.6]} />
            <meshStandardMaterial color="#FFF" roughness={0.1} opacity={0.8} transparent />
          </mesh>
          <mesh position={[0, 0.018, -0.18]}>
            <boxGeometry args={[0.16, 0.008, 0.06]} />
            <meshStandardMaterial color="#07170E" emissive="#10B981" emissiveIntensity={1} />
          </mesh>
        </group>
      );
    }

    // 14. Iron (Ütü)
    if (lower.includes('ütü')) {
      return (
        <group position={[0, 0.1, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.18, 0.55]} />
            <meshStandardMaterial color="#3B82F6" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.16, -0.04]} rotation={[-Math.PI/6, 0, 0]}>
            <boxGeometry args={[0.06, 0.3, 0.06]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
        </group>
      );
    }

    // Default Smart Hub
    return (
      <group>
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.7, 0.8]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.71, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0.74, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={status === 'Hata' ? '#EF4444' : color} emissive={status === 'Hata' ? '#EF4444' : color} emissiveIntensity={3} />
        </mesh>
      </group>
    );
  };

  const deviceGroup = (
    <group 
      ref={meshRef} 
      position={position} 
      rotation={[0, rotationY, 0]}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onDoubleClick) onDoubleClick();
      }}
    >
      {renderDevice3DShape()}
      
      {showTooltip && (
        <Html position={[0, 1.8, 0]} center>
          <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-gray-100 flex flex-col gap-2 min-w-[170px] animate-in zoom-in-75 duration-200">
            <h3 className="font-bold text-gray-900 text-sm">{name}</h3>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${status === 'Hata' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {status}
              </span>
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <Zap className="w-3 h-3" /> {wattage}
              </span>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-1">
              {isActive ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDoubleClick) onDoubleClick();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1 rounded-lg transition-colors animate-pulse"
                >
                  Konumu Kilitle
                </button>
              ) : (
                <div className="text-[9px] text-gray-500 text-center font-bold bg-blue-50/50 text-blue-700 py-1.5 rounded border border-dashed border-blue-200">
                  Taşımak için çift tıkla
                </div>
              )}
              
              <button className="w-full bg-[#4C811F] hover:bg-green-700 text-white text-[10px] font-bold py-1 rounded-lg transition-colors">
                Yönet
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );

  return (
    <>
      {deviceGroup}
      
      {isActive && meshRef.current && (
        <TransformControls 
          object={meshRef.current} 
          mode="translate" 
          showY={false}
          onPointerDown={() => setOrbitEnabled(false)} 
          onPointerUp={() => setOrbitEnabled(true)}
        />
      )}
    </>
  );
};

// Camera Controller to follow player but allow 360 mouse rotation
const CameraController = ({ playerRef, enabled = true }) => {
  const controlsRef = useRef();
  useFrame(() => {
    if (controlsRef.current && playerRef.current) {
      controlsRef.current.target.lerp(playerRef.current.position, 0.1);
      controlsRef.current.update();
    }
  });
  return (
    <OrbitControls 
      ref={controlsRef} 
      makeDefault 
      minDistance={5}
      maxDistance={30}
      enabled={enabled}
      maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going under the floor
    />
  );
};

// 🪴 Potted Plant Component
const PottedPlant = ({ position }) => (
  <group position={position}>
    {/* Pot */}
    <mesh position={[0, 0.3, 0]} castShadow>
      <cylinderGeometry args={[0.35, 0.25, 0.6, 12]} />
      <meshStandardMaterial color="#8D5B4C" roughness={0.8} />
    </mesh>
    {/* Stem */}
    <mesh position={[0, 0.7, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
      <meshStandardMaterial color="#3E5C25" />
    </mesh>
    {/* Leaves (Cozy green sphere clusters) */}
    <mesh position={[0, 1.1, 0]} castShadow>
      <sphereGeometry args={[0.4, 8, 8]} />
      <meshStandardMaterial color="#4A752C" roughness={0.9} />
    </mesh>
    <mesh position={[0.2, 0.95, 0.15]} castShadow>
      <sphereGeometry args={[0.28, 8, 8]} />
      <meshStandardMaterial color="#5C8D3C" roughness={0.9} />
    </mesh>
    <mesh position={[-0.2, 0.9, -0.1]} castShadow>
      <sphereGeometry args={[0.26, 8, 8]} />
      <meshStandardMaterial color="#5C8D3C" roughness={0.9} />
    </mesh>
  </group>
);

// 🛋️ Cozy Couch Component
const CozyCouch = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Base */}
    <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.2, 0.3, 1.4]} />
      <meshStandardMaterial color="#2B3E34" roughness={0.9} />
    </mesh>
    {/* Backrest */}
    <mesh position={[0, 0.7, -0.55]} castShadow>
      <boxGeometry args={[3.2, 0.8, 0.3]} />
      <meshStandardMaterial color="#2B3E34" roughness={0.9} />
    </mesh>
    {/* Left Armrest */}
    <mesh position={[-1.45, 0.45, 0]} castShadow>
      <boxGeometry args={[0.3, 0.6, 1.4]} />
      <meshStandardMaterial color="#2B3E34" roughness={0.9} />
    </mesh>
    {/* Right Armrest */}
    <mesh position={[1.45, 0.45, 0]} castShadow>
      <boxGeometry args={[0.3, 0.6, 1.4]} />
      <meshStandardMaterial color="#2B3E34" roughness={0.9} />
    </mesh>
    {/* Seat Cushions */}
    <mesh position={[-0.6, 0.32, 0.05]} receiveShadow>
      <boxGeometry args={[1.1, 0.15, 1.1]} />
      <meshStandardMaterial color="#3B5447" roughness={0.8} />
    </mesh>
    <mesh position={[0.6, 0.32, 0.05]} receiveShadow>
      <boxGeometry args={[1.1, 0.15, 1.1]} />
      <meshStandardMaterial color="#3B5447" roughness={0.8} />
    </mesh>
  </group>
);

// 📺 TV & Console Component
const TVConsole = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Wooden Console Stand */}
    <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
      <boxGeometry args={[4.2, 0.6, 0.9]} />
      <meshStandardMaterial color="#4A3525" roughness={0.75} />
    </mesh>
    {/* Console Drawers */}
    <mesh position={[-1, 0.3, 0.46]}>
      <boxGeometry args={[1.4, 0.4, 0.02]} />
      <meshStandardMaterial color="#362519" roughness={0.8} />
    </mesh>
    <mesh position={[1, 0.3, 0.46]}>
      <boxGeometry args={[1.4, 0.4, 0.02]} />
      <meshStandardMaterial color="#362519" roughness={0.8} />
    </mesh>
    {/* TV Stand Pole */}
    <mesh position={[0, 0.8, -0.2]}>
      <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
      <meshStandardMaterial color="#111" metalness={0.9} />
    </mesh>
    {/* TV Screen Panel */}
    <mesh position={[0, 1.7, -0.2]} castShadow>
      <boxGeometry args={[3.2, 1.8, 0.08]} />
      <meshStandardMaterial color="#151515" roughness={0.4} metalness={0.8} />
    </mesh>
    {/* TV Screen Display (Glows softly) */}
    <mesh position={[0, 1.7, -0.15]}>
      <boxGeometry args={[3.0, 1.6, 0.01]} />
      <meshStandardMaterial color="#07170E" emissive="#10B981" emissiveIntensity={0.25} roughness={0.1} />
    </mesh>
  </group>
);

// 💡 Cozy Smart Floor Lamp Component
const FloorLamp = ({ position }) => (
  <group position={position}>
    {/* Base */}
    <mesh position={[0, 0.05, 0]} castShadow>
      <cylinderGeometry args={[0.3, 0.3, 0.08, 16]} />
      <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.1} />
    </mesh>
    {/* Pole */}
    <mesh position={[0, 1.25, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 2.4, 8]} />
      <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.1} />
    </mesh>
    {/* Shade */}
    <mesh position={[0, 2.35, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.32, 0.45, 16]} />
      <meshStandardMaterial color="#F8FAFC" roughness={0.9} />
    </mesh>
    {/* Glowing Smart Bulb */}
    <mesh position={[0, 2.25, 0]}>
      <sphereGeometry args={[0.12, 8, 8]} />
      <meshStandardMaterial color="#FFF" emissive="#EAB308" emissiveIntensity={6} />
    </mesh>
    {/* Warm indoor lighting light source */}
    <pointLight position={[0, 2.2, 0]} color="#FCD34D" intensity={1.8} distance={8} decay={1.5} castShadow />
  </group>
);

// 3D Partition Walls Component depending on roomLayout and floorSize
const PartitionWalls = ({ layout, size }) => {
  const half = size / 2;
  const height = 2.5;
  const thickness = 0.25;

  const wallMat = (
    <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.1} />
  );

  // 1+1 layout walls
  const render1plus1 = () => (
    <group>
      {/* Middle dividing wall along Z axis at X = 0 (leaving a door gap in center) */}
      <mesh position={[0, height / 2, -(half + 2) / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half - 2]} />
        {wallMat}
      </mesh>
      <mesh position={[0, height / 2, (half + 2) / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half - 2]} />
        {wallMat}
      </mesh>
      {/* Header over the doorway */}
      <mesh position={[0, height - 0.25, 0]} castShadow>
        <boxGeometry args={[thickness, 0.5, 4]} />
        {wallMat}
      </mesh>
    </group>
  );

  // 2+1 layout walls
  const render2plus1 = () => (
    <group>
      {/* Main dividing wall separating Living Room (X < 0) from Bedrooms (X > 0) */}
      {/* Divider wall on Z-axis with door gaps at Z=-3 and Z=3 */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, 4]} />
        {wallMat}
      </mesh>
      <mesh position={[0, height / 2, -(half + 5) / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half - 5]} />
        {wallMat}
      </mesh>
      <mesh position={[0, height / 2, (half + 5) / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half - 5]} />
        {wallMat}
      </mesh>
      {/* Headers over the doorways */}
      <mesh position={[0, height - 0.25, -4]} castShadow>
        <boxGeometry args={[thickness, 0.5, 2]} />
        {wallMat}
      </mesh>
      <mesh position={[0, height - 0.25, 4]} castShadow>
        <boxGeometry args={[thickness, 0.5, 2]} />
        {wallMat}
      </mesh>

      {/* Bedroom divider wall (along X-axis at Z = 0, for X > 0) */}
      <mesh position={[(half + 2) / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[half - 2, height, thickness]} />
        {wallMat}
      </mesh>
      {/* Header over bedroom door */}
      <mesh position={[1, height - 0.25, 0]} castShadow>
        <boxGeometry args={[2, 0.5, thickness]} />
        {wallMat}
      </mesh>
    </group>
  );

  // 3+1 layout walls
  const render3plus1 = () => (
    <group>
      {/* Living room divider at X = -half / 3 */}
      <mesh position={[-half / 3, height / 2, -(half + 2) / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half - 2]} />
        {wallMat}
      </mesh>
      <mesh position={[-half / 3, height / 2, (half + 2) / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half - 2]} />
        {wallMat}
      </mesh>
      <mesh position={[-half / 3, height - 0.25, 0]} castShadow>
        <boxGeometry args={[thickness, 0.5, 4]} />
        {wallMat}
      </mesh>

      {/* Corridor walls on right side */}
      <mesh position={[half / 3, height / 2, -half / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half - 1]} />
        {wallMat}
      </mesh>
      <mesh position={[half / 3, height / 2, half / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half - 1]} />
        {wallMat}
      </mesh>

      {/* Horizontal dividers for the 3 bedrooms on the right side (X > half/3) */}
      {/* Divider 1 at Z = -half / 3 */}
      <mesh position={[half * 2/3, height / 2, -half / 3]} castShadow receiveShadow>
        <boxGeometry args={[half * 2/3, height, thickness]} />
        {wallMat}
      </mesh>
      {/* Divider 2 at Z = half / 3 */}
      <mesh position={[half * 2/3, height / 2, half / 3]} castShadow receiveShadow>
        <boxGeometry args={[half * 2/3, height, thickness]} />
        {wallMat}
      </mesh>
    </group>
  );

  if (layout === '1+1') return render1plus1();
  if (layout === '2+1') return render2plus1();
  if (layout === '3+1') return render3plus1();
  return null; // 1+0 (Studio) - fully open space
};

// Room Labels Component
const RoomLabels = ({ layout, size }) => {
  const half = size / 2;
  
  if (layout === '1+0') {
    return (
      <Html position={[0, 1.8, 0]} center distanceFactor={12}>
        <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
          Studio Yaşam Alanı
        </div>
      </Html>
    );
  }

  if (layout === '1+1') {
    return (
      <group>
        <Html position={[-half / 2, 1.8, 0]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Salon & Mutfak
          </div>
        </Html>
        <Html position={[half / 2, 1.8, 0]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Yatak Odası
          </div>
        </Html>
      </group>
    );
  }

  if (layout === '2+1') {
    return (
      <group>
        <Html position={[-half / 2, 1.8, 0]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Salon & Mutfak
          </div>
        </Html>
        <Html position={[half / 2, 1.8, -half / 2]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Ana Yatak Odası
          </div>
        </Html>
        <Html position={[half / 2, 1.8, half / 2]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Çocuk Odası
          </div>
        </Html>
      </group>
    );
  }

  if (layout === '3+1') {
    return (
      <group>
        <Html position={[-half * 2/3, 1.8, 0]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Geniş Salon
          </div>
        </Html>
        <Html position={[half * 2/3, 1.8, -half * 2/3]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Yatak Odası 1
          </div>
        </Html>
        <Html position={[half * 2/3, 1.8, 0]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Yatak Odası 2
          </div>
        </Html>
        <Html position={[half * 2/3, 1.8, half * 2/3]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Çocuk Odası
          </div>
        </Html>
      </group>
    );
  }

  return null;
};

// Advanced Multi-Character Player Component (Robot, Man, Woman, Child)
const Player = ({ playerRef, characterType = 'robot', initialPosition = [0, 0.5, 0] }) => {
  const [, get] = useKeyboardControls();
  const speed = 5.5;

  // Refs for character parts to animate walk cycles
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const bodyRef = useRef();
  const headRef = useRef();

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    
    const { forward, backward, left, right } = get();
    const velocity = new THREE.Vector3();

    if (forward) velocity.z -= 1;
    if (backward) velocity.z += 1;
    if (left) velocity.x -= 1;
    if (right) velocity.x += 1;

    const isMoving = forward || backward || left || right;
    velocity.normalize().multiplyScalar(speed * delta);
    playerRef.current.position.add(velocity);
    
    const time = state.clock.getElapsedTime();

    if (characterType === 'robot') {
      // 🤖 Robot Hovering Animation
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.5 + Math.sin(time * 3.5) * 0.08;
        if (isMoving) {
          bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, forward ? 0.15 : backward ? -0.15 : 0, 0.1);
          bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, left ? 0.15 : right ? -0.15 : 0, 0.1);
        } else {
          bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, 0.1);
          bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, 0, 0.1);
        }
      }
      if (headRef.current) {
        headRef.current.position.y = 0.28 + Math.sin(time * 5) * 0.02;
      }
    } else {
      // 👨👩🧒 Human Walking Leg & Arm Swing Animation
      if (isMoving) {
        const swingSpeed = 14;
        const swingAngle = 0.6;
        
        // Swing legs back and forth opposite to each other
        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * swingSpeed) * swingAngle;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(time * swingSpeed) * swingAngle;
        
        // Swing arms opposite to legs
        if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.sin(time * swingSpeed) * (swingAngle * 0.7);
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time * swingSpeed) * (swingAngle * 0.7);
        
        // Walk bobbing (head/body bobbing up and down)
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.55 + Math.abs(Math.sin(time * swingSpeed)) * 0.05;
        }
      } else {
        // Reset limbs to neutral standing position
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
        if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
        if (bodyRef.current) bodyRef.current.position.y = 0.55;
      }
    }
  });

  // Render Robot mesh
  const renderRobot = () => (
    <group ref={bodyRef}>
      {/* Body Sphere */}
      <mesh castShadow>
        <sphereGeometry args={[0.48, 16, 16]} />
        <meshStandardMaterial color="#4C811F" roughness={0.2} metalness={0.4} />
      </mesh>
      
      {/* Torus Ring */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.5, 0.035, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={3} />
      </mesh>

      {/* Hovering Head */}
      <group ref={headRef}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial color="#1E293B" roughness={0.15} metalness={0.8} />
        </mesh>
        <mesh position={[0.09, 0.32, 0.22]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={4} />
        </mesh>
        <mesh position={[-0.09, 0.32, 0.22]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={4} />
        </mesh>
      </group>

      {/* Thruster Glow */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.15, 0.01, 0.08, 16]} />
        <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={5} />
      </mesh>
    </group>
  );

  // Render Man mesh
  const renderMan = () => (
    <group ref={bodyRef} position={[0, 0.55, 0]}>
      {/* Torso (Blue Shirt) */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.65, 0.25]} />
        <meshStandardMaterial color="#2563EB" roughness={0.7} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 8]} />
        <meshStandardMaterial color="#FDBA74" roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.56, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#FDBA74" roughness={0.8} />
      </mesh>

      {/* Brown Hair */}
      <mesh position={[0, 0.7, -0.02]} castShadow>
        <boxGeometry args={[0.26, 0.15, 0.26]} />
        <meshStandardMaterial color="#451A03" roughness={0.9} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.07, 0.58, 0.19]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[-0.07, 0.58, 0.19]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>

      {/* Left Leg (Grey Pants) */}
      <group ref={leftLegRef} position={[-0.15, -0.32, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.18, 0.45, 0.18]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.46, 0.04]} castShadow>
          <boxGeometry args={[0.18, 0.06, 0.26]} />
          <meshStandardMaterial color="#1E293B" roughness={0.9} />
        </mesh>
      </group>

      {/* Right Leg (Grey Pants) */}
      <group ref={rightLegRef} position={[0.15, -0.32, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.18, 0.45, 0.18]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.46, 0.04]} castShadow>
          <boxGeometry args={[0.18, 0.06, 0.26]} />
          <meshStandardMaterial color="#1E293B" roughness={0.9} />
        </mesh>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.32, 0.15, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.12, 0.4, 0.12]} />
          <meshStandardMaterial color="#2563EB" roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.43, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FDBA74" />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.32, 0.15, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.12, 0.4, 0.12]} />
          <meshStandardMaterial color="#2563EB" roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.43, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FDBA74" />
        </mesh>
      </group>
    </group>
  );

  // Render Woman mesh
  const renderWoman = () => (
    <group ref={bodyRef} position={[0, 0.55, 0]}>
      {/* Torso (Pink Dress/Shirt) */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.46, 0.6, 0.22]} />
        <meshStandardMaterial color="#DB2777" roughness={0.7} />
      </mesh>

      {/* Dress Skirt */}
      <mesh position={[0, -0.26, 0]} castShadow>
        <boxGeometry args={[0.52, 0.18, 0.28]} />
        <meshStandardMaterial color="#DB2777" roughness={0.7} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 8]} />
        <meshStandardMaterial color="#FDBA74" roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FDBA74" roughness={0.8} />
      </mesh>

      {/* Long Yellow/Blonde Hair */}
      <group position={[0, 0.48, -0.06]}>
        {/* Hair Top */}
        <mesh position={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[0.26, 0.16, 0.26]} />
          <meshStandardMaterial color="#EAB308" roughness={0.9} />
        </mesh>
        {/* Hair Back Draping */}
        <mesh position={[0, -0.15, -0.06]} castShadow>
          <boxGeometry args={[0.26, 0.45, 0.14]} />
          <meshStandardMaterial color="#EAB308" roughness={0.9} />
        </mesh>
      </group>

      {/* Eyes */}
      <mesh position={[0.06, 0.54, 0.17]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[-0.06, 0.54, 0.17]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.14, -0.32, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.4, 8]} />
          <meshStandardMaterial color="#FDBA74" roughness={0.8} />
        </mesh>
        {/* Shoes */}
        <mesh position={[0, -0.43, 0.03]} castShadow>
          <boxGeometry args={[0.15, 0.05, 0.2]} />
          <meshStandardMaterial color="#DC2626" roughness={0.9} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.14, -0.32, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.4, 8]} />
          <meshStandardMaterial color="#FDBA74" roughness={0.8} />
        </mesh>
        {/* Shoes */}
        <mesh position={[0, -0.43, 0.03]} castShadow>
          <boxGeometry args={[0.15, 0.05, 0.2]} />
          <meshStandardMaterial color="#DC2626" roughness={0.9} />
        </mesh>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.29, 0.12, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.1, 0.36, 0.1]} />
          <meshStandardMaterial color="#DB2777" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.39, 0]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color="#FDBA74" />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.29, 0.12, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.1, 0.36, 0.1]} />
          <meshStandardMaterial color="#DB2777" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.39, 0]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color="#FDBA74" />
        </mesh>
      </group>
    </group>
  );

  // Render Child mesh
  const renderChild = () => (
    <group ref={bodyRef} position={[0, 0.35, 0]} scale={[0.7, 0.7, 0.7]}>
      {/* Torso (Red Shirt) */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.48, 0.58, 0.24]} />
        <meshStandardMaterial color="#EF4444" roughness={0.7} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 8]} />
        <meshStandardMaterial color="#FDBA74" roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#FDBA74" roughness={0.8} />
      </mesh>

      {/* Red Cap Hat */}
      <group position={[0, 0.68, 0.02]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.08, 12]} />
          <meshStandardMaterial color="#DC2626" roughness={0.5} />
        </mesh>
        {/* Visor bill pointing forward */}
        <mesh position={[0, -0.02, 0.14]} castShadow>
          <boxGeometry args={[0.22, 0.015, 0.14]} />
          <meshStandardMaterial color="#DC2626" roughness={0.5} />
        </mesh>
      </group>

      {/* Eyes */}
      <mesh position={[0.07, 0.54, 0.18]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[-0.07, 0.54, 0.18]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>

      {/* Left Leg (Blue Jeans) */}
      <group ref={leftLegRef} position={[-0.14, -0.32, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.16, 0.42, 0.16]} />
          <meshStandardMaterial color="#1D4ED8" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.42, 0.04]} castShadow>
          <boxGeometry args={[0.16, 0.05, 0.22]} />
          <meshStandardMaterial color="#FFF" roughness={0.9} />
        </mesh>
      </group>

      {/* Right Leg (Blue Jeans) */}
      <group ref={rightLegRef} position={[0.14, -0.32, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.16, 0.42, 0.16]} />
          <meshStandardMaterial color="#1D4ED8" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.42, 0.04]} castShadow>
          <boxGeometry args={[0.16, 0.05, 0.22]} />
          <meshStandardMaterial color="#FFF" roughness={0.9} />
        </mesh>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.3, 0.14, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.1, 0.35, 0.1]} />
          <meshStandardMaterial color="#EF4444" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#FDBA74" />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.3, 0.14, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <boxGeometry args={[0.1, 0.35, 0.1]} />
          <meshStandardMaterial color="#EF4444" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.38, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#FDBA74" />
        </mesh>
      </group>
    </group>
  );

  return (
    <group ref={playerRef} position={initialPosition}>
      {characterType === 'robot' && renderRobot()}
      {characterType === 'man' && renderMan()}
      {characterType === 'woman' && renderWoman()}
      {characterType === 'child' && renderChild()}
    </group>
  );
};

const EMPTY_ARRAY = [];

const MetaHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playerRef = useRef();

  // Get home data and devices from router state, or fallback to defaults
  const state = location.state || {};
  const homeName = state.homeName || "Meta-House 3D";
  const devices = state.devices || EMPTY_ARRAY;
  const squareMeters = state.squareMeters || 120;
  const roomLayout = state.roomLayout || "2+1";

  // Metrekareye göre zemin boyutunu belirleme
  const getFloorSize = (sqm) => {
    if (sqm <= 80) return 14;
    if (sqm <= 120) return 18;
    if (sqm <= 160) return 22;
    return 26;
  };
  const floorSize = getFloorSize(squareMeters);
  const halfSize = floorSize / 2;

  // Calculate living room center X coordinate to prevent furniture overlapping with dividing walls
  const getSalonCenterX = (layout, size) => {
    const half = size / 2;
    if (layout === '1+1' || layout === '2+1') {
      return -half / 2;
    }
    if (layout === '3+1') {
      return -half * 2/3;
    }
    return 0; // 1+0 (Studio)
  };
  const salonX = getSalonCenterX(roomLayout, floorSize);

  // Colors mapping for devices based on type
  const getDeviceColor = (type) => {
    switch(type) {
      case 'İklimlendirme': return '#3b82f6'; // Blue
      case 'Beyaz Eşya': return '#f97316'; // Orange
      case 'Elektronik': return '#ef4444'; // Red
      case 'Soğutucu': return '#0ea5e9'; // Light Blue
      default: return '#eab308'; // Yellow
    }
  };

  // Calculate dynamic device positions based on room layout, floor size, and room assignment
  const getDevicePosition = (device, layout, size, index) => {
    const half = size / 2;
    const offset = 2;

    // Check device type or name to see if we can infer a room if not specified
    let room = device.room || localStorage.getItem(`voltify_device_room_${device.id}`);
    if (!room) {
      // Fallback inference based on device name or category
      const name = (device.name || '').toLowerCase();
      if (name.includes('klima') || name.includes('tv') || name.includes('televizyon') || name.includes('koltuk') || name.includes('ampul')) {
        room = layout === '3+1' ? 'Geniş Salon' : 'Salon';
      } else if (name.includes('yatak') || name.includes('bilgisayar') || name.includes('laptop')) {
        room = layout === '3+1' ? 'Yatak Odası 1' : 'Yatak Odası';
      } else if (name.includes('çocuk') || name.includes('oyun') || name.includes('konsol')) {
        room = 'Çocuk Odası';
      } else {
        room = layout === '3+1' ? 'Geniş Salon' : 'Salon'; // fallback to salon
      }
    }

    const rName = room.toLowerCase();

    // Layout: 1+0 (Studio)
    if (layout === '1+0') {
      const positions = [
        [-(half - offset), 0.5, -(half - offset)],
        [(half - offset), 0.5, -(half - offset)],
        [-(half - offset), 0.5, (half - offset)],
        [(half - offset), 0.5, (half - offset)],
        [-(half - offset), 0.5, 0],
        [(half - offset), 0.5, 0]
      ];
      return positions[index % positions.length];
    }

    // Layout: 1+1
    if (layout === '1+1') {
      if (rName.includes('yatak')) {
        // Yatak Odası (X > 0)
        const positions = [
          [(half - offset), 0.5, -(half - offset)],
          [2, 0.5, -(half - offset)],
          [(half - offset), 0.5, (half - offset)],
          [2, 0.5, (half - offset)]
        ];
        return positions[index % positions.length];
      } else {
        // Salon (X < 0)
        const positions = [
          [-(half - offset), 0.5, -(half - offset)],
          [-2, 0.5, -(half - offset)],
          [-(half - offset), 0.5, (half - offset)],
          [-2, 0.5, (half - offset)]
        ];
        return positions[index % positions.length];
      }
    }

    // Layout: 2+1
    if (layout === '2+1') {
      if (rName.includes('ana yatak') || rName.includes('yatak odası')) {
        // Ana Yatak Odası (X > 0, Z < 0)
        const positions = [
          [(half - offset), 0.5, -(half - offset)],
          [2, 0.5, -(half - offset)],
          [(half - offset), 0.5, -2]
        ];
        return positions[index % positions.length];
      } else if (rName.includes('çocuk')) {
        // Çocuk Odası (X > 0, Z > 0)
        const positions = [
          [(half - offset), 0.5, (half - offset)],
          [2, 0.5, (half - offset)],
          [(half - offset), 0.5, 2]
        ];
        return positions[index % positions.length];
      } else {
        // Salon (X < 0)
        const positions = [
          [-(half - offset), 0.5, -(half - offset)],
          [-2, 0.5, -(half - offset)],
          [-(half - offset), 0.5, (half - offset)],
          [-2, 0.5, (half - offset)]
        ];
        return positions[index % positions.length];
      }
    }

    // Layout: 3+1
    if (layout === '3+1') {
      if (rName.includes('yatak odası 1')) {
        // Room 1 (X > half/3, Z < -half/3)
        const positions = [
          [(half - offset), 0.5, -(half - offset)],
          [(half - offset - 2), 0.5, -(half - offset)]
        ];
        return positions[index % positions.length];
      } else if (rName.includes('yatak odası 2')) {
        // Room 2 (X > half/3, -half/3 < Z < half/3)
        const positions = [
          [(half - offset), 0.5, 0],
          [(half - offset - 2), 0.5, 0]
        ];
        return positions[index % positions.length];
      } else if (rName.includes('çocuk')) {
        // Room 3 (X > half/3, Z > half/3)
        const positions = [
          [(half - offset), 0.5, (half - offset)],
          [(half - offset - 2), 0.5, (half - offset)]
        ];
        return positions[index % positions.length];
      } else {
        // Geniş Salon (X < -half/3)
        const positions = [
          [-(half - offset), 0.5, -(half - offset)],
          [-(half - offset - 2), 0.5, -(half - offset)],
          [-(half - offset), 0.5, (half - offset)]
        ];
        return positions[index % positions.length];
      }
    }

    return [0, 0.5, 0];
  };

  const [devicePositionsMap, setDevicePositionsMap] = useState({});
  const [selectedTransformId, setSelectedTransformId] = useState(null);
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [characterType, setCharacterType] = useState('robot');

  useEffect(() => {
    // Initialize position mapping for any devices that don't have a position yet
    setDevicePositionsMap(prev => {
      const updated = { ...prev };
      devices.forEach((device, index) => {
        if (updated[device.id] === undefined) {
          updated[device.id] = getDevicePosition(device, roomLayout, floorSize, index);
        }
      });
      return updated;
    });
  }, [devices, roomLayout, floorSize]);

  // Keyboard mapping
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  ];

  return (
    <div className="w-full h-[calc(100vh-100px)] rounded-3xl overflow-hidden relative shadow-sm border border-gray-100 bg-gray-900">
      
      {/* UI Overlay */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 shadow-lg"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white drop-shadow-md">{homeName} - 3D Mod</h1>
          <p className="text-white/80 text-xs font-bold bg-black/35 px-3 py-1 rounded-full inline-block mt-1">
            {roomLayout} • {squareMeters} m² • Yön tuşları veya W,A,S,D ile hareket edin
          </p>
        </div>
      </div>
      
      {/* Character Selector Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-2">
        <span className="text-white/90 text-xs font-black mr-1 uppercase">Karakter:</span>
        <button 
          onClick={() => setCharacterType('robot')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${characterType === 'robot' ? 'bg-[#4C811F] text-white shadow' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
        >
          🤖 Robot
        </button>
        <button 
          onClick={() => setCharacterType('man')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${characterType === 'man' ? 'bg-[#4C811F] text-white shadow' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
        >
          👨 Erkek
        </button>
        <button 
          onClick={() => setCharacterType('woman')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${characterType === 'woman' ? 'bg-[#4C811F] text-white shadow' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
        >
          👩 Kadın
        </button>
        <button 
          onClick={() => setCharacterType('child')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${characterType === 'child' ? 'bg-[#4C811F] text-white shadow' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
        >
          🧒 Çocuk
        </button>
      </div>

      <div className="absolute top-6 right-6 z-10 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3">
         <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
         <span className="text-white font-bold text-sm">Sistem Aktif ({devices.length} Cihaz)</span>
      </div>

      {/* 3D Canvas */}
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 10, 10], fov: 50 }}>
          <CameraController playerRef={playerRef} enabled={orbitEnabled} />
          <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
          <ambientLight intensity={0.5} />
          <directionalLight castShadow position={[10, 20, 10]} intensity={1.5} shadow-mapSize={[1024, 1024]} />
          
          {/* Custom Floor (Chic dark slate parquet style) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[floorSize + 30, floorSize + 30]} />
            <meshStandardMaterial color="#1E293B" roughness={0.85} metalness={0.1} />
            <gridHelper args={[floorSize + 30, floorSize + 30, '#334155', '#334155']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} />
          </mesh>

          {/* Cozy Room Carpet under sofa and coffee table */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[salonX, 0.02, -0.5]} receiveShadow>
            <planeGeometry args={[5.2, 6.2]} />
            <meshStandardMaterial color="#2E4C3E" roughness={0.95} />
          </mesh>

          {/* Room Walls (Premium charcoal wood panel style) */}
          {/* Back Wall */}
          <mesh position={[0, 2.5, -halfSize]} receiveShadow castShadow>
            <boxGeometry args={[floorSize, 5, 0.4]} />
            <meshStandardMaterial color="#0F172A" roughness={0.7} />
          </mesh>
          {/* Left Wall */}
          <mesh position={[-halfSize, 2.5, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.4, 5, floorSize]} />
            <meshStandardMaterial color="#0F172A" roughness={0.7} />
          </mesh>
          {/* Right Wall */}
          <mesh position={[halfSize, 2.5, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.4, 5, floorSize]} />
            <meshStandardMaterial color="#0F172A" roughness={0.7} />
          </mesh>

          {/* 3D Dynamic Partition Walls based on roomLayout */}
          <PartitionWalls layout={roomLayout} size={floorSize} />

          {/* Room Labels */}
          <RoomLabels layout={roomLayout} size={floorSize} />

          {/* Voltify Smart Energy Neon Lighting Tubes along the wall tops */}
          <mesh position={[0, 4.8, -halfSize + 0.2]} castShadow>
            <boxGeometry args={[floorSize - 0.2, 0.06, 0.06]} />
            <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={3} />
          </mesh>
          <mesh position={[-halfSize + 0.2, 4.8, 0]} castShadow>
            <boxGeometry args={[0.06, 0.06, floorSize - 0.2]} />
            <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={3} />
          </mesh>
          <mesh position={[halfSize - 0.2, 4.8, 0]} castShadow>
            <boxGeometry args={[0.06, 0.06, floorSize - 0.2]} />
            <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={3} />
          </mesh>

          {/* Furniture Elements */}
          <CozyCouch position={[salonX, 0, 1.8]} rotation={[0, Math.PI, 0]} />
          <TVConsole position={[salonX, 0, -halfSize + 0.8]} />
          <FloorLamp position={[salonX + 2.0, 0, 1.6]} />
          
          {/* Wooden Coffee Table */}
          <group position={[salonX, 0, -1.2]}>
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.08, 1.1]} />
              <meshStandardMaterial color="#5C4033" roughness={0.9} />
            </mesh>
            {/* Table Legs */}
            <mesh position={[-0.8, 0.15, -0.45]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
              <meshStandardMaterial color="#111" metalness={0.9} />
            </mesh>
            <mesh position={[0.8, 0.15, -0.45]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
              <meshStandardMaterial color="#111" metalness={0.9} />
            </mesh>
            <mesh position={[-0.8, 0.15, 0.45]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
              <meshStandardMaterial color="#111" metalness={0.9} />
            </mesh>
            <mesh position={[0.8, 0.15, 0.45]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
              <meshStandardMaterial color="#111" metalness={0.9} />
            </mesh>
          </group>

          {/* Potted Plants for Nature Vibes (Dynamically set to room corners) */}
          <PottedPlant position={[-halfSize + 1.5, 0, -halfSize + 1.5]} />
          <PottedPlant position={[halfSize - 1.5, 0, -halfSize + 1.5]} />
          <PottedPlant position={[-halfSize + 1.5, 0, halfSize - 1.5]} />

          {/* Player */}
          <Player playerRef={playerRef} characterType={characterType} initialPosition={[salonX, 0.5, 0]} />

          {/* Dynamic Devices based on specific Home data */}
          {devices.map((device, index) => {
            const pos = devicePositionsMap[device.id] || getDevicePosition(device, roomLayout, floorSize, index);
            
            return (
              <InteractiveDevice 
                key={device.id}
                deviceId={device.id}
                isActive={selectedTransformId === device.id}
                onDoubleClick={() => setSelectedTransformId(selectedTransformId === device.id ? null : device.id)}
                setOrbitEnabled={setOrbitEnabled}
                playerRef={playerRef}
                position={pos} 
                name={device.name} 
                type={device.type}
                status={device.isAnomalous ? "Hata" : "Açık"} 
                wattage={`${device.currentWattage}W`} 
                color={getDeviceColor(device.type)}
              />
            );
          })}

          {/* If no devices passed, render a default one just so room isn't empty */}
          {devices.length === 0 && (
            <InteractiveDevice 
              deviceId={999}
              isActive={selectedTransformId === 999}
              onDoubleClick={() => setSelectedTransformId(selectedTransformId === 999 ? null : 999)}
              setOrbitEnabled={setOrbitEnabled}
              playerRef={playerRef}
              position={[0, 0.5, -3]} 
              name="Buzdolabı" 
              type="Soğutucu"
              status="Açık" 
              wattage="120W" 
              color="#0ea5e9" 
            />
          )}

        </Canvas>
      </KeyboardControls>
    </div>
  );
};

export default MetaHome;
