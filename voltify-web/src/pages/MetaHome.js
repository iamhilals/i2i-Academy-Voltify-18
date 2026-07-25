import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, OrbitControls, Html, useKeyboardControls, KeyboardControls, useGLTF, PointerLockControls } from '@react-three/drei';
import { TransformControls } from '@react-three/drei/core/TransformControls';
import * as THREE from 'three';
import { ArrowLeft, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// ===== GLB Device config: maps device name/type to a public .glb file =====
const getDeviceGLBConfig = (type, name) => {
  const lower = (name || '').toLowerCase();
  
  if (lower.includes('akıllı ampul')) return { path: '/smart_bulb.glb', targetHeight: 0.35, posY: 1.0 };
  if (lower.includes('akıllı priz')) return { path: '/smart_plug.glb', targetHeight: 0.35, posY: 0.1 };
  if (lower.includes('ankastre fırın')) return { path: '/stove.glb', targetHeight: 0.95 };
  if (lower.includes('ankastre ocak')) return { path: '/stove.glb', targetHeight: 0.95 };
  if (lower.includes('masaüstü') || lower.includes('bilgisayar (masaüstü)')) return { path: '/desktop.glb', targetHeight: 1.0 };
  if (lower.includes('bulaşık makinesi')) return { path: '/dishwasher.glb', targetHeight: 0.85 };
  if (lower.includes('buzdolabı')) return { path: '/freezer.glb', targetHeight: 1.8 };
  if (lower.includes('çamaşır kurutma makinesi')) return { path: '/dryer.glb', targetHeight: 0.85 };
  if (lower.includes('çamaşır makinesi')) return { path: '/washer.glb', targetHeight: 0.85 };
  if (lower.includes('derin dondurucu')) return { path: '/freezer.glb', targetHeight: 1.8 };
  if (lower.includes('laptop') || lower.includes('dizüstü bilgisayar')) return { path: '/laptop.glb', targetHeight: 0.55, posY: 0.5 };
  if (lower.includes('radyatör') || lower.includes('ufo') || lower.includes('elektrikli ısıtıcı')) return { path: '/heater.glb', targetHeight: 1.2 };
  if (lower.includes('elektrikli süpürge')) return { path: '/vacuum.glb', targetHeight: 1.0 };
  if (lower.includes('fırın (mini') || lower.includes('mikrodalga fırın')) return { path: '/microwave.glb', targetHeight: 0.55, posY: 0.3 };
  if (lower.includes('kahve makinesi')) return { path: '/coffee_maker.glb', targetHeight: 0.45, posY: 0.25 };
  if (lower.includes('klima')) return { path: '/ac.glb', targetHeight: 1.8, posY: 2.2 };
  if (lower.includes('mikser') || lower.includes('blender')) return { path: '/blender.glb', targetHeight: 0.5, posY: 0.25 };
  if (lower.includes('oyun makinesi')) return { path: '/console.glb', targetHeight: 0.3, posY: 0.15 };
  if (lower.includes('su ısıtıcısı') || lower.includes('kettle')) return { path: '/kettle.glb', targetHeight: 0.3, posY: 0.15 };
  if (lower.includes('televizyon')) return { path: '/tv.glb', targetHeight: 1.6, posY: 1.2 };
  if (lower.includes('tost makinesi')) return { path: '/panini.glb', targetHeight: 0.3, posY: 0.15 };
  if (lower.includes('vantilatör')) return { path: '/fan.glb', targetHeight: 1.0 };

  return null;
};

// Auto-scaled GLB device model: normalizes to targetHeight via bounding box
const GLBDeviceModel = ({ path, targetHeight = 1.5, posY = 0 }) => {
  const { scene } = useGLTF(path);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) clone.scale.setScalar(targetHeight / maxDim);
    const newBox = new THREE.Box3().setFromObject(clone);
    clone.position.y = -newBox.min.y + posY;
    clone.traverse(child => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
    });
    return clone;
  }, [scene, targetHeight, posY]);
  return <primitive object={model} />;
};

// Device Component
const InteractiveDevice = ({ deviceId, isActive, onDoubleClick, setOrbitEnabled, position, name, type, status, wattage, color, playerRef, rotationY = 0, onPositionChange, onToggleActive, onRepair, scaleMultiplier = 1.0, onScaleChange }) => {
  const meshRef = useRef();
  const transformRef = useRef();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (isActive && transformRef.current) {
      const controls = transformRef.current;
      
      const handleDraggingChanged = (event) => {
        const isDragging = event.value; // true = dragging, false = released
        setOrbitEnabled(!isDragging);
        
        if (!isDragging && onPositionChange && meshRef.current) {
          const pos = meshRef.current.position;
          onPositionChange([pos.x, pos.y, pos.z]);
        }
      };

      controls.addEventListener('dragging-changed', handleDraggingChanged);
      return () => {
        controls.removeEventListener('dragging-changed', handleDraggingChanged);
      };
    }
  }, [isActive, onPositionChange, setOrbitEnabled]);

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

  // Render the device mesh/group — uses real GLB model if available, otherwise box geometry
  const renderDevice3DShape = () => {
    const lower = name.toLowerCase();
    const lowerType = type ? type.toLowerCase() : '';

    // 🔥 Try to load actual GLB model from /public first
    const glbConfig = getDeviceGLBConfig(type, name);
    if (glbConfig) {
      return (
        <Suspense fallback={
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[0.8, 1.2, 0.8]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        }>
          <GLBDeviceModel path={glbConfig.path} targetHeight={glbConfig.targetHeight || 1.5} posY={glbConfig.posY || 0} />
        </Suspense>
      );
    }

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
        <group position={[0, 1.2, 0]}> {/* Centered higher up to align transform controls */}
          {/* Main unit housing */}
          <mesh castShadow>
            <boxGeometry args={[1.8, 0.48, 0.38]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Front panel accent line */}
          <mesh position={[0, 0.02, 0.01]}>
            <boxGeometry args={[1.76, 0.4, 0.38]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.15} />
          </mesh>
          {/* Dark air outlet vent slot at bottom */}
          <mesh position={[0, -0.2, 0.05]}>
            <boxGeometry args={[1.68, 0.04, 0.3]} />
            <meshStandardMaterial color="#1E293B" roughness={0.9} />
          </mesh>
          {/* Air deflector flap (angled down) */}
          <mesh position={[0, -0.22, 0.08]} rotation={[0.25, 0, 0]}>
            <boxGeometry args={[1.66, 0.02, 0.12]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.3} />
          </mesh>
          {/* LED Display Box */}
          <mesh position={[0.55, 0.04, 0.192]}>
            <boxGeometry args={[0.22, 0.08, 0.01]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
          {/* Glow indicator on LED Display */}
          <mesh position={[0.55, 0.04, 0.198]}>
            <boxGeometry args={[0.18, 0.05, 0.005]} />
            <meshStandardMaterial 
              color={status === 'Hata' ? '#EF4444' : (status.includes('Ertelendi') ? '#EAB308' : '#06B6D4')} 
              emissive={status === 'Hata' ? '#EF4444' : (status.includes('Ertelendi') ? '#EAB308' : '#06B6D4')} 
              emissiveIntensity={1.8} 
            />
          </mesh>
          {/* Dynamic Cool Air Wind Stream Mesh (active when on and no error) */}
          {status !== 'Hata' && !status.includes('Ertelendi') && (
            <mesh position={[0, -0.5, 0.15]} rotation={[0.4, 0, 0]}>
              <planeGeometry args={[1.5, 0.7]} />
              <meshBasicMaterial color="#06B6D4" transparent={true} opacity={0.15} depthWrite={false} />
            </mesh>
          )}
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
      scale={scaleMultiplier}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onDoubleClick) onDoubleClick();
      }}
    >
      {renderDevice3DShape()}
      
      {showTooltip && (
        <Html position={[0, 1.2, 0]} center>
          <div className="transform translate-x-[70%] -translate-y-[70%] bg-white/90 backdrop-blur-md px-3 py-2 rounded-md shadow-2xl border border-gray-100 flex flex-col gap-1.5 min-w-[130px] animate-in zoom-in-75 duration-200">
            <h3 className="font-bold text-gray-900 text-xs">{name}</h3>
            <div className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                status.includes('Ertelendi') 
                  ? 'bg-amber-100 text-amber-700 animate-pulse' 
                  : (status === 'Hata' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')
              }`}>
                {status}
              </span>
              <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> {wattage}
              </span>
            </div>
            
            <div className="flex flex-col gap-1 mt-1">
              {isActive ? (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDoubleClick) onDoubleClick();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold py-1 rounded transition-colors animate-pulse"
                  >
                    Konumu Kilitle
                  </button>
                  {onScaleChange && (
                    <div className="mt-1 pt-1.5 border-t border-gray-200">
                      <label className="text-[9px] font-bold text-gray-500 mb-0.5 block">Boyut: %{Math.round(scaleMultiplier * 100)}</label>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="3.0" 
                        step="0.1" 
                        value={scaleMultiplier} 
                        onChange={(e) => {
                          e.stopPropagation();
                          onScaleChange(parseFloat(e.target.value));
                        }}
                        onPointerDown={(e) => { e.stopPropagation(); setOrbitEnabled(false); }}
                        onPointerUp={(e) => { e.stopPropagation(); setOrbitEnabled(true); }}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[8px] text-gray-500 text-center font-bold bg-blue-50/50 text-blue-700 py-1 rounded border border-dashed border-blue-200">
                  Taşımak için çift tıkla
                </div>
              )}
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleActive) onToggleActive();
                }}
                className={`w-full text-white text-[10px] font-bold py-1 rounded-lg transition-colors ${
                  status === 'Hata' ? 'bg-[#4C811F] hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {status === 'Hata' ? 'Çalıştır' : 'Durdur'}
              </button>
              {status === 'Hata' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRepair) onRepair();
                  }}
                  className="w-full bg-purple-650 hover:bg-purple-700 text-white text-[10px] font-bold py-1 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  ⚙️ Teşhis & Onar
                </button>
              )}
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
          ref={transformRef}
          object={meshRef.current} 
          mode="translate" 
          showY={false}
        />
      )}
    </>
  );
};

// Camera Controller to follow player but allow 360 mouse rotation or FPS mode
const CameraController = ({ playerRef, cameraMode, enabled = true }) => {
  const controlsRef = useRef();
  useFrame((state) => {
    if (controlsRef.current && playerRef.current && cameraMode !== 'fps') {
      controlsRef.current.target.lerp(playerRef.current.position, 0.1);
      controlsRef.current.update();
    }
    
    if (cameraMode === 'fps' && playerRef.current) {
      // Pin camera to player's head height
      state.camera.position.set(
        playerRef.current.position.x,
        playerRef.current.position.y + 1.6,
        playerRef.current.position.z
      );
    }
  });

  if (cameraMode === 'fps') {
    return <PointerLockControls makeDefault />;
  }

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

// 🖼️ Wall Painting / Frame Component
const WallPainting = ({ position, rotation = [0, 0, 0], width = 1.4, height = 0.95, color1 = '#E8A87C', color2 = '#6B8F71' }) => (
  <group position={position} rotation={rotation}>
    {/* Frame */}
    <mesh castShadow>
      <boxGeometry args={[width + 0.12, height + 0.12, 0.06]} />
      <meshStandardMaterial color="#5C3D1E" roughness={0.7} metalness={0.1} />
    </mesh>
    {/* Canvas */}
    <mesh position={[0, 0, 0.04]}>
      <boxGeometry args={[width, height, 0.02]} />
      <meshStandardMaterial color={color1} roughness={0.9} />
    </mesh>
    {/* Abstract art stroke 1 */}
    <mesh position={[-width * 0.2, height * 0.1, 0.06]}>
      <boxGeometry args={[width * 0.35, height * 0.55, 0.01]} />
      <meshStandardMaterial color={color2} roughness={0.95} />
    </mesh>
    {/* Abstract art stroke 2 */}
    <mesh position={[width * 0.18, -height * 0.12, 0.06]}>
      <boxGeometry args={[width * 0.28, height * 0.35, 0.01]} />
      <meshStandardMaterial color="#D4A5A5" roughness={0.95} />
    </mesh>
  </group>
);

// 🍽️ Dining Table with 6 chairs (Görseldeki beyaz mermer yemek masası ve 6 sandalye)
const DiningTable = ({ position }) => (
  <group position={position}>
    {/* Table top (White polished marble) */}
    <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.5, 0.06, 1.4]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.15} metalness={0.1} />
    </mesh>
    {/* Slanted black metal table legs */}
    {[[-1.0, -0.55], [-1.0, 0.55], [1.0, -0.55], [1.0, 0.55]].map(([lx, lz], i) => (
      <mesh key={i} position={[lx, 0.38, lz]} rotation={[lz * 0.1, 0, lx * 0.05]} castShadow>
        <cylinderGeometry args={[0.035, 0.02, 0.76, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.5} />
      </mesh>
    ))}
    {/* Table centerpiece vase */}
    <mesh position={[0, 0.88, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.07, 0.14, 8]} />
      <meshStandardMaterial color="#ECEAE5" roughness={0.2} />
    </mesh>
    <mesh position={[0, 1.0, 0]}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshStandardMaterial color="#4A752C" roughness={0.9} />
    </mesh>

    {/* 6 Chairs (3 on left side, 3 on right side) */}
    {[
      // Left side chairs (facing right)
      [-0.7, 0, -0.85, 0],
      [0, 0, -0.85, 0],
      [0.7, 0, -0.85, 0],
      // Right side chairs (facing left)
      [-0.7, 0, 0.85, Math.PI],
      [0, 0, 0.85, Math.PI],
      [0.7, 0, 0.85, Math.PI]
    ].map(([cx, cz, rz, ry], i) => (
      <group key={i} position={[cx, 0, cz]} rotation={[0, ry, 0]}>
        {/* Cushion seat (Beige fabric) */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.48, 0.06, 0.46]} />
          <meshStandardMaterial color="#F4F0EB" roughness={0.8} />
        </mesh>
        {/* Upholstered backrest */}
        <mesh position={[0, 0.72, -0.2]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.46, 0.54, 0.05]} />
          <meshStandardMaterial color="#F4F0EB" roughness={0.8} />
        </mesh>
        {/* Chair legs (Oak wood) */}
        {[[-0.18, -0.16], [-0.18, 0.16], [0.18, -0.16], [0.18, 0.16]].map(([llx, llz], li) => (
          <mesh key={li} position={[llx, 0.2, llz]} rotation={[llz * 0.05, 0, llx * 0.05]}>
            <cylinderGeometry args={[0.018, 0.012, 0.4, 6]} />
            <meshStandardMaterial color="#C49A6C" roughness={0.6} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

// 🛏️ Bed Component (Lüks Platform Yatak + Pürüzsüz Başlık Duvar Paneli + Entegre Puf Bench + Yatak Başı Lambaları)
const Bed = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Headboard Wall Panel & Slats (Auto-rotates with the bed!) */}
    {/* Smooth beige center wall panel */}
    <mesh position={[0, 1.3, -1.34]} castShadow receiveShadow>
      <boxGeometry args={[2.2, 2.6, 0.04]} />
      <meshStandardMaterial color="#EAE3D8" roughness={0.7} />
    </mesh>
    {/* Left vertical wood slats */}
    {[-1.6, -1.4, -1.2].map((xVal, idx) => (
      <mesh key={`l-slat-${idx}`} position={[xVal, 1.3, -1.32]} castShadow>
        <boxGeometry args={[0.08, 2.6, 0.04]} />
        <meshStandardMaterial color="#C49A6C" roughness={0.65} />
      </mesh>
    ))}
    {/* Right vertical wood slats */}
    {[1.2, 1.4, 1.6].map((xVal, idx) => (
      <mesh key={`r-slat-${idx}`} position={[xVal, 1.3, -1.32]} castShadow>
        <boxGeometry args={[0.08, 2.6, 0.04]} />
        <meshStandardMaterial color="#C49A6C" roughness={0.65} />
      </mesh>
    ))}

    {/* Platform cream upholstered base */}
    <mesh position={[0, 0.15, 0.05]} castShadow receiveShadow>
      <boxGeometry args={[1.9, 0.22, 2.45]} />
      <meshStandardMaterial color="#F4F0EB" roughness={0.8} />
    </mesh>
    {/* Mattress */}
    <mesh position={[0, 0.32, 0.05]} castShadow>
      <boxGeometry args={[1.82, 0.22, 2.4]} />
      <meshStandardMaterial color="#F9F9FB" roughness={0.9} />
    </mesh>
    {/* Cream bedding with baby blue throw (Matches target floor plan!) */}
    <mesh position={[0, 0.44, 0.4]} castShadow>
      <boxGeometry args={[1.8, 0.04, 1.1]} />
      <meshStandardMaterial color="#8EA6BB" roughness={0.95} />
    </mesh>
    
    {/* Soft Pillows */}
    {/* Row 1 (White) */}
    <mesh position={[-0.42, 0.48, -0.9]} castShadow>
      <boxGeometry args={[0.7, 0.12, 0.42]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
    </mesh>
    <mesh position={[0.42, 0.48, -0.9]} castShadow>
      <boxGeometry args={[0.7, 0.12, 0.42]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
    </mesh>
    {/* Row 2 (Baby Blue Accent Pillows) */}
    <mesh position={[-0.42, 0.52, -0.7]} rotation={[0.2, 0, 0]} castShadow>
      <boxGeometry args={[0.65, 0.12, 0.4]} />
      <meshStandardMaterial color="#8EA6BB" roughness={0.95} />
    </mesh>
    <mesh position={[0.42, 0.52, -0.7]} rotation={[0.2, 0, 0]} castShadow>
      <boxGeometry args={[0.65, 0.12, 0.4]} />
      <meshStandardMaterial color="#8EA6BB" roughness={0.95} />
    </mesh>

    {/* Cream Channel-Padded Headboard */}
    <mesh position={[0, 0.85, -1.16]} castShadow>
      <boxGeometry args={[1.92, 1.0, 0.14]} />
      <meshStandardMaterial color="#F4F0EB" roughness={0.8} />
    </mesh>
    {/* Channel Tufting Details */}
    {[-0.8, -0.5, -0.2, 0.2, 0.5, 0.8].map((xVal, idx) => (
      <mesh key={`head-${idx}`} position={[xVal, 0.85, -1.08]} castShadow>
        <boxGeometry args={[0.04, 0.98, 0.02]} />
        <meshStandardMaterial color="#E6DFD3" roughness={0.9} />
      </mesh>
    ))}

    {/* Upholstered Bench (Puf) at the foot of the bed */}
    <mesh position={[0, 0.17, 1.5]} castShadow receiveShadow>
      <boxGeometry args={[1.5, 0.34, 0.45]} />
      <meshStandardMaterial color="#F4F0EB" roughness={0.8} />
    </mesh>
    {/* Bench Channel Tufting details */}
    {[-0.6, -0.3, 0, 0.3, 0.6].map((xVal, idx) => (
      <mesh key={`bench-${idx}`} position={[xVal, 0.22, 1.5]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.47]} />
        <meshStandardMaterial color="#E6DFD3" roughness={0.9} />
      </mesh>
    ))}
  </group>
);

// 🗄️ Wardrobe Component (Lüks Cam Kapaklı ve İç Işıklı Gardırop - Ortası Cam, Kenarları Lake Lake Kapaklar)
const Wardrobe = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Wardrobe shell (Oak wood structure) */}
    <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.2, 2.4, 0.65]} />
      <meshStandardMaterial color="#C49A6C" roughness={0.65} />
    </mesh>
    {/* Internal Shelves */}
    {[-0.8, -0.2, 0.4, 1.0].map((yVal, idx) => (
      <mesh key={idx} position={[0, yVal + 1.2, 0.01]} receiveShadow>
        <boxGeometry args={[2.14, 0.03, 0.58]} />
        <meshStandardMaterial color="#B08658" roughness={0.6} />
      </mesh>
    ))}
    {/* Internal glowing LED lighting bar in the center */}
    <mesh position={[0, 2.3, 0.26]}>
      <boxGeometry args={[0.7, 0.02, 0.02]} />
      <meshStandardMaterial color="#FFE4CC" emissive="#FF9F1C" emissiveIntensity={4.5} />
    </mesh>

    {/* Left Cupboard Door (Lake/Cream white) */}
    <mesh position={[-0.7, 1.2, 0.33]} castShadow>
      <boxGeometry args={[0.72, 2.36, 0.04]} />
      <meshStandardMaterial color="#F4F0EB" roughness={0.6} />
    </mesh>
    {/* Right Cupboard Door (Lake/Cream white) */}
    <mesh position={[0.7, 1.2, 0.33]} castShadow>
      <boxGeometry args={[0.72, 2.36, 0.04]} />
      <meshStandardMaterial color="#F4F0EB" roughness={0.6} />
    </mesh>

    {/* Center Cupboard Door (Black framed glass) */}
    <mesh position={[0, 1.2, 0.31]} castShadow>
      <boxGeometry args={[0.72, 2.36, 0.02]} />
      <meshStandardMaterial color="#4A4A4A" transparent opacity={0.5} roughness={0.2} metalness={0.5} />
    </mesh>
    {/* Black metal profile for center glass door */}
    <mesh position={[0, 1.2, 0.32]}>
      <boxGeometry args={[0.74, 2.38, 0.01]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
    </mesh>

    {/* Elegant vertical black door handles */}
    <mesh position={[-0.37, 1.2, 0.36]} castShadow>
      <boxGeometry args={[0.02, 0.4, 0.02]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </mesh>
    <mesh position={[0.37, 1.2, 0.36]} castShadow>
      <boxGeometry args={[0.02, 0.4, 0.02]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </mesh>
  </group>
);

// 🔲 WoodCeilingPanel (Yatak Odası Ahşap Tavan Detayı)
const WoodCeilingPanel = ({ position, width = 3.6, length = 3.6 }) => (
  <group position={position}>
    {/* Main wooden board */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color="#A0693A" roughness={0.7} metalness={0.04} />
    </mesh>
    {/* Recessed Warm LED spot lights */}
    {[
      [-width / 3, -length / 3],
      [width / 3, -length / 3],
      [-width / 3, length / 3],
      [width / 3, length / 3],
      [0, 0]
    ].map(([lx, lz], idx) => (
      <mesh key={idx} position={[lx, -0.01, lz]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#FFF" emissive="#FFE4CC" emissiveIntensity={4} />
      </mesh>
    ))}
  </group>
);

// 💡 Luxury Chandelier (Modern Salon Avizesi - Cam Küreli Sarkıt Avize)
const LuxuryChandelier = ({ position }) => (
  <group position={position}>
    {/* Main rod */}
    <mesh position={[0, 0.5, 0]} castShadow>
      <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
    </mesh>
    {/* Horizontal branching rods */}
    {[-0.8, 0, 0.8].map((xVal, idx) => (
      <group key={idx} position={[xVal, 0.1, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 1.6, 8]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Branching along Z */}
        {[-0.6, 0.6].map((zVal, zIdx) => (
          <group key={zIdx} position={[0, 0, zVal]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.6, 8]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Glowing frosted globes */}
            <mesh position={[0, -0.1, 0]}>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFF" emissiveIntensity={2.5} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>
    ))}
  </group>
);

// 🚪 sliding glass window / door
const SlidingGlassDoor = ({ position, width = 0.2, height = 2.5, length = 6.0 }) => (
  <group position={position}>
    {/* Main Frame (Dark charcoal metal) */}
    <mesh position={[0, 0.04, 0]} castShadow>
      <boxGeometry args={[width, 0.08, length]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, height - 0.04, 0]} castShadow>
      <boxGeometry args={[width, 0.08, length]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, height / 2, -length / 2]} castShadow>
      <boxGeometry args={[width, height, 0.08]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, height / 2, length / 2]} castShadow>
      <boxGeometry args={[width, height, 0.08]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, height / 2, 0]} castShadow>
      <boxGeometry args={[width, height, 0.08]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
    </mesh>

    {/* Glass panel 1 (closed) */}
    <mesh position={[-0.02, height / 2, -length / 4]} castShadow>
      <boxGeometry args={[0.02, height - 0.16, length / 2 - 0.04]} />
      <meshStandardMaterial color="#C8E0F0" transparent opacity={0.35} metalness={0.9} roughness={0.05} />
    </mesh>
    {/* Glass panel 2 (partially open) */}
    <mesh position={[0.02, height / 2, length / 4 + 0.5]} castShadow>
      <boxGeometry args={[0.02, height - 0.16, length / 2 - 0.04]} />
      <meshStandardMaterial color="#C8E0F0" transparent opacity={0.35} metalness={0.9} roughness={0.05} />
    </mesh>
  </group>
);

// 🏖️ Master Balcony / Terrace (Wood Deck + Private Garden + Marble Pool with Ladder + Lounger)
const MasterBalcony = ({ position, width = 3.0, length = 5.8 }) => (
  <group position={position}>
    {/* Wooden Deck floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial color="#8E6A4F" roughness={0.85} />
    </mesh>
    {/* Balcony Railing (Glass + Brass top rail) */}
    <mesh position={[0, 0.5, length / 2]} castShadow>
      <boxGeometry args={[width, 1.0, 0.04]} />
      <meshStandardMaterial color="#C8E0F0" transparent opacity={0.3} metalness={0.9} roughness={0.05} />
    </mesh>
    <mesh position={[0, 0.5, -length / 2]} castShadow>
      <boxGeometry args={[width, 1.0, 0.04]} />
      <meshStandardMaterial color="#C8E0F0" transparent opacity={0.3} metalness={0.9} roughness={0.05} />
    </mesh>
    <mesh position={[width / 2, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
      <boxGeometry args={[length, 1.0, 0.04]} />
      <meshStandardMaterial color="#C8E0F0" transparent opacity={0.3} metalness={0.9} roughness={0.05} />
    </mesh>
    <mesh position={[width / 2, 1.02, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, length, 8]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} />
    </mesh>

    {/* 🌊 Mini Balcony Swimming Pool with wide Marble border */}
    {/* Wide Marble frame border around the pool */}
    <mesh position={[-0.1, 0.04, 1.2]} castShadow receiveShadow>
      <boxGeometry args={[1.9, 0.08, 2.7]} />
      <meshStandardMaterial color="#E3DFD5" roughness={0.35} metalness={0.1} />
    </mesh>
    {/* Tiled grid border markings */}
    {[-1.3, 0, 1.3].map((zVal, idx) => (
      <mesh key={`tz-${idx}`} position={[-0.1, 0.085, 1.2 + zVal]}>
        <boxGeometry args={[1.88, 0.005, 0.015]} />
        <meshStandardMaterial color="#BDBAA8" />
      </mesh>
    ))}
    {[-0.9, 0, 0.9].map((xVal, idx) => (
      <mesh key={`tx-${idx}`} position={[-0.1 + xVal, 0.085, 1.2]}>
        <boxGeometry args={[0.015, 0.005, 2.68]} />
        <meshStandardMaterial color="#BDBAA8" />
      </mesh>
    ))}

    {/* Pool Water cut-out */}
    <mesh position={[-0.1, 0.08, 1.2]}>
      <boxGeometry args={[1.5, 0.02, 2.3]} />
      <meshStandardMaterial color="#0EA5E9" emissive="#06B6D4" emissiveIntensity={1.8} transparent opacity={0.8} roughness={0.1} />
    </mesh>
    {/* Pool internal soft blue light glow */}
    <mesh position={[-0.1, 0.06, 1.2]}>
      <boxGeometry args={[1.4, 0.01, 2.2]} />
      <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={3} />
    </mesh>

    {/* 🪜 Stainless Steel Pool Ladder going into the water */}
    <group position={[0.5, 0.06, 0.45]} rotation={[0, Math.PI, 0]}>
      {/* Curved Rail 1 (Left) */}
      <mesh position={[-0.12, 0.16, -0.05]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.32, 8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.12, 0.32, 0.0]} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.08, 0.012, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.12, 0.1, 0.08]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Curved Rail 2 (Right) */}
      <mesh position={[0.12, 0.16, -0.05]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.32, 8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.12, 0.32, 0.0]} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.08, 0.012, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.12, 0.1, 0.08]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Steps inside the pool */}
      {[-0.02, 0.08].map((yVal, i) => (
        <mesh key={i} position={[0, yVal, 0.08]}>
          <boxGeometry args={[0.22, 0.015, 0.04]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} />
        </mesh>
      ))}
    </group>

    {/* 🏡 Private Garden / Green Area on the Deck */}
    {/* Grass segment */}
    <mesh position={[-0.4, 0.02, -2.1]} receiveShadow>
      <boxGeometry args={[2.0, 0.02, 1.2]} />
      <meshStandardMaterial color="#4D7C0F" roughness={0.9} />
    </mesh>
    {/* Potted bushes & flowers */}
    {[-1.2, 0.8].map((xVal, idx) => (
      <group key={`p-garden-${idx}`} position={[xVal, 0.02, -2.2]}>
        {/* Pot */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.1, 0.3, 10]} />
          <meshStandardMaterial color="#ECEAE5" roughness={0.5} />
        </mesh>
        {/* Bush */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshStandardMaterial color="#3F6212" roughness={0.95} />
        </mesh>
        <mesh position={[0.05, 0.42, 0.03]} castShadow>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color="#4D7C0F" roughness={0.9} />
        </mesh>
      </group>
    ))}
    
    {/* Lounge Chair (Sun lounger) shifted to the other side */}
    <group position={[0.3, 0.05, -1.1]} rotation={[0, -Math.PI / 8, 0]}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.7, 0.12, 1.8]} />
        <meshStandardMaterial color="#C49A6C" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.66, 0.08, 1.76]} />
        <meshStandardMaterial color="#F9F9FB" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.35, -0.6]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.66, 0.08, 0.7]} />
        <meshStandardMaterial color="#F9F9FB" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.44, -0.75]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.45, 0.08, 0.22]} />
        <meshStandardMaterial color="#DFDCD6" roughness={0.9} />
      </mesh>
    </group>
  </group>
);

// 💡 Master Bedroom Chandelier (Modern brass ring light matching the ceiling wood panel)
const BedroomChandelier = ({ position }) => (
  <group position={position}>
    {/* Brass hanging wire */}
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.006, 0.006, 0.8, 4]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.9} />
    </mesh>
    {/* Modern brass ring/hoop */}
    <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <torusGeometry args={[0.45, 0.025, 8, 32]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
    </mesh>
    {/* Glowing light inside the ring */}
    <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.42, 0.015, 6, 24]} />
      <meshStandardMaterial color="#FFF" emissive="#FFE4CC" emissiveIntensity={3.5} />
    </mesh>
    {/* Elegant hanging crystals */}
    {[-0.3, 0, 0.3].map((xVal, i) => (
      <mesh key={i} position={[xVal, -0.15, 0]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#E8F4F8" transparent opacity={0.8} metalness={0.9} roughness={0.1} />
      </mesh>
    ))}
  </group>
);

// 🗄️ Wide Bedside Chest with Vase & Branches
const WideBedsideChest = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.8, 0.6, 0.55]} />
      <meshStandardMaterial color="#C49A6C" roughness={0.65} />
    </mesh>
    <mesh position={[0, 0.66, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.09, 0.12, 12]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
    </mesh>
    <group position={[0, 0.72, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.4, 4]} />
        <meshStandardMaterial color="#5C4033" />
      </mesh>
      <mesh position={[0.08, 0.2, 0.05]} rotation={[0.2, 0, 0.3]} castShadow>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#4A752C" roughness={0.9} />
      </mesh>
      <mesh position={[-0.08, 0.24, -0.05]} rotation={[-0.2, 0, -0.3]} castShadow>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#4A752C" roughness={0.9} />
      </mesh>
    </group>
  </group>
);

// 🍳 Luxury Kitchen (U-shaped baby blue cabinets + white marble countertops + central kitchen island with bar stools)
const LuxuryKitchen = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* --- U-SHAPED CABINETS (Baby Blue) --- */}
    {/* Main Z-axis cabinet */}
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.65, 0.9, 3.4]} />
      <meshStandardMaterial color="#98B2C6" roughness={0.5} />
    </mesh>
    {/* Left return (extending in X) */}
    <mesh position={[-0.475, 0.45, 1.375]} castShadow receiveShadow>
      <boxGeometry args={[1.0, 0.9, 0.65]} />
      <meshStandardMaterial color="#98B2C6" roughness={0.5} />
    </mesh>
    {/* Right return (extending in X) */}
    <mesh position={[-0.475, 0.45, -1.375]} castShadow receiveShadow>
      <boxGeometry args={[1.0, 0.9, 0.65]} />
      <meshStandardMaterial color="#98B2C6" roughness={0.5} />
    </mesh>

    {/* --- COUNTERTOPS (Polished White Marble) --- */}
    {/* Main Countertop */}
    <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.68, 0.04, 3.44]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.15 /* polished */} metalness={0.1} />
    </mesh>
    {/* Left Countertop */}
    <mesh position={[-0.475, 0.92, 1.375]} castShadow receiveShadow>
      <boxGeometry args={[1.02, 0.04, 0.68]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.15} metalness={0.1} />
    </mesh>
    {/* Right Countertop */}
    <mesh position={[-0.475, 0.92, -1.375]} castShadow receiveShadow>
      <boxGeometry args={[1.02, 0.04, 0.68]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.15} metalness={0.1} />
    </mesh>

    {/* --- WALL-MOUNTED UPPER CABINETS (Baby Blue) --- */}
    <mesh position={[-0.15, 1.8, 0]} castShadow>
      <boxGeometry args={[0.35, 0.8, 3.4]} />
      <meshStandardMaterial color="#98B2C6" roughness={0.6} />
    </mesh>
    {/* Right corner upper cabinet */}
    <mesh position={[-0.475, 1.8, -1.375]} castShadow>
      <boxGeometry args={[1.0, 0.8, 0.35]} />
      <meshStandardMaterial color="#98B2C6" roughness={0.6} />
    </mesh>

    {/* Cabinet door grooves & handles */}
    {[-1.2, -0.6, 0, 0.6, 1.2].map((zVal, idx) => (
      <group key={idx} position={[0.33, 0.45, zVal]}>
        {/* White handle */}
        <mesh position={[0.01, 0.2, 0.2]}>
          <boxGeometry args={[0.015, 0.15, 0.015]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>
      </group>
    ))}

    {/* Kitchen Sink */}
    <mesh position={[-0.2, 0.95, 0.7]}>
      <boxGeometry args={[0.42, 0.01, 0.6]} />
      <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.2} />
    </mesh>
    {/* Gold/Brass Faucet */}
    <group position={[-0.1, 1.05, 0.7]}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.2, 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} />
      </mesh>
      <mesh position={[-0.04, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} />
      </mesh>
    </group>

  </group>
);

// 🛁 Luxury Bathroom (Freestanding tub + glass shower cabin + oak vanity with backlit mirror + wall-hung toilet + stacked laundry)
const LuxuryBathroom = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Freestanding Bathtub */}
    <group position={[-0.8, 0.25, -0.9]} rotation={[0, Math.PI / 4, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.44, 0.5, 20]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
      </mesh>
      <mesh position={[0.2, 0.26, 0.1]}>
        <cylinderGeometry args={[0.44, 0.42, 0.02, 20]} />
        <meshStandardMaterial color="#0EA5E9" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      <mesh position={[-0.56, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.62, 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} />
      </mesh>
      <mesh position={[-0.46, 0.58, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} />
      </mesh>
    </group>

    {/* Glass Walk-in Shower Cabin */}
    <group position={[0.9, 1.0, -1.0]}>
      <mesh position={[0, -0.98, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.04, 1.0]} />
        <meshStandardMaterial color="#F4F0EB" roughness={0.5} />
      </mesh>
      <mesh position={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.01, 2.0, 1.0]} />
        <meshStandardMaterial color="#C8E0F0" transparent opacity={0.25} metalness={0.9} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[1.0, 2.0, 0.01]} />
        <meshStandardMaterial color="#C8E0F0" transparent opacity={0.25} metalness={0.9} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0.8, -0.46]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 10]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.2, -0.48]}>
        <cylinderGeometry args={[0.01, 0.01, 1.2, 6]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} />
      </mesh>
    </group>

    {/* Vanity Cabinet & Circle Backlit Mirror */}
    <group position={[-0.8, 0.38, 0.8]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.76, 0.5]} />
        <meshStandardMaterial color="#C49A6C" roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.15, -0.23]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.02, 32]} />
        <meshStandardMaterial color="#FFB85C" emissive="#FF9F1C" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0, 1.15, -0.21]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.02, 32]} />
        <meshStandardMaterial color="#DFDCD6" roughness={0.15} metalness={0.95} />
      </mesh>
      <mesh position={[0, 0.39, 0]}>
        <boxGeometry args={[0.6, 0.02, 0.35]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.48, -0.12]}>
        <cylinderGeometry args={[0.012, 0.012, 0.16, 6]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} />
      </mesh>
    </group>

    {/* Toilet (wall hung) */}
    <group position={[0.9, 0.28, 0.9]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, 0.4, -0.16]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.8, 0.16]} />
        <meshStandardMaterial color="#F4F0EB" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.15, 0.15]} castShadow>
        <cylinderGeometry args={[0.18, 0.16, 0.3, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.31, 0.15]}>
        <boxGeometry args={[0.38, 0.02, 0.38]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
    </group>

    {/* Stacked Laundry Washing Machine & Dryer Unit */}
    <group position={[0.0, 1.1, 1.2]} rotation={[0, Math.PI, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 2.2, 0.72]} />
        <meshStandardMaterial color="#C49A6C" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.5, 0.02]} castShadow>
        <boxGeometry args={[0.72, 0.88, 0.68]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.5, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 16]} />
        <meshStandardMaterial color="#4A4A4A" transparent opacity={0.6} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.5, 0.02]} castShadow>
        <boxGeometry args={[0.72, 0.88, 0.68]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 16]} />
        <meshStandardMaterial color="#4A4A4A" transparent opacity={0.6} metalness={0.9} />
      </mesh>
    </group>
  </group>
);

// 💄 Vanity / Makeup Table (Lake Askılı Konsol + Dairesel Arkadan Aydınlatmalı LED Ayna + Puf Stool)
const VanityTable = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Floating table body with drawers (Lake white) */}
    <mesh position={[0, 0.65, 0.1]} castShadow receiveShadow>
      <boxGeometry args={[1.2, 0.16, 0.46]} />
      <meshStandardMaterial color="#F4F0EB" roughness={0.6} />
    </mesh>
    {/* Minimalist black handles on drawers */}
    <mesh position={[-0.3, 0.65, 0.34]} castShadow>
      <boxGeometry args={[0.1, 0.015, 0.015]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </mesh>
    <mesh position={[0.3, 0.65, 0.34]} castShadow>
      <boxGeometry args={[0.1, 0.015, 0.015]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </mesh>

    {/* Backlit Circular Mirror */}
    {/* LED Backlight Glow */}
    <mesh position={[0, 1.28, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.44, 0.44, 0.02, 32]} />
      <meshStandardMaterial color="#FFB85C" emissive="#FF9F1C" emissiveIntensity={3} />
    </mesh>
    {/* Mirror Glass Panel */}
    <mesh position={[0, 1.28, -0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.42, 0.42, 0.02, 32]} />
      <meshStandardMaterial color="#DFDCD6" roughness={0.15 /* mirror reflection simulated */} metalness={0.95} />
    </mesh>

    {/* Cosmetic vase with pampas grass/dried flowers */}
    <mesh position={[0.42, 0.8, 0.1]} castShadow>
      <cylinderGeometry args={[0.05, 0.06, 0.12, 10]} />
      <meshStandardMaterial color="#F9F9FB" roughness={0.5} />
    </mesh>
    {/* Pampas grass */}
    {[[0.42, 0.94, 0.1, 0.08], [0.46, 0.98, 0.12, 0.06], [0.38, 0.97, 0.08, 0.07]].map(([px, py, pz, r], idx) => (
      <mesh key={idx} position={[px, py, pz]} castShadow>
        <sphereGeometry args={[r, 8, 8]} />
        <meshStandardMaterial color="#D9C3B0" roughness={0.95} />
      </mesh>
    ))}

    {/* Cylindrical Cream Upholstered Stool (Puf Stool) */}
    <mesh position={[0, 0.18, 0.36]} castShadow receiveShadow>
      <cylinderGeometry args={[0.22, 0.22, 0.36, 20]} />
      <meshStandardMaterial color="#F4F0EB" roughness={0.8} />
    </mesh>
  </group>
);

// 📚 Bookshelf
const Bookshelf = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Shelf Frame (Oak wood) */}
    <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.2, 2.0, 0.35]} />
      <meshStandardMaterial color="#C49A6C" roughness={0.65} />
    </mesh>
    {[0.3, 0.82, 1.34, 1.75].map((y, i) => (
      <mesh key={i} position={[0, y, 0.01]}><boxGeometry args={[1.15, 0.04, 0.32]} /><meshStandardMaterial color="#B08658" roughness={0.6} /></mesh>
    ))}
    {/* Neutral / Pinterest styled books */}
    {[
      [[-0.4, 0.55, 0.1], [0.12, 0.34, 0.1], '#ECEAE5'],
      [[-0.22, 0.55, 0.1], [0.09, 0.34, 0.1], '#7D8D7E'],
      [[-0.10, 0.55, 0.1], [0.1, 0.34, 0.1], '#DFDCD6'],
      [[0.05, 0.55, 0.1], [0.08, 0.34, 0.1], '#E69F86'],
      [[-0.38, 1.08, 0.1], [0.14, 0.34, 0.1], '#7D8D7E'],
      [[-0.18, 1.08, 0.1], [0.11, 0.34, 0.1], '#ECEAE5'],
      [[0.05, 1.08, 0.1], [0.09, 0.34, 0.1], '#E69F86'],
      [[-0.38, 1.60, 0.1], [0.10, 0.34, 0.1], '#DFDCD6'],
      [[-0.22, 1.60, 0.1], [0.12, 0.34, 0.1], '#7D8D7E'],
      [[0.00, 1.60, 0.1], [0.10, 0.34, 0.1], '#ECEAE5'],
    ].map(([pos, args, color], i) => (
      <mesh key={i} position={pos}><boxGeometry args={args} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
    ))}
  </group>
);

// 🪑 Bedside Table
const BedsideTable = ({ position }) => (
  <group position={position}>
    {/* Floating cabinet (Cream off-white) */}
    <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.55, 0.34, 0.4]} />
      <meshStandardMaterial color="#F4F0EB" roughness={0.6} />
    </mesh>
    {/* Drawers front detail */}
    <mesh position={[0, 0.5, 0.21]}>
      <boxGeometry args={[0.51, 0.12, 0.01]} />
      <meshStandardMaterial color="#ECE7E1" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.34, 0.21]}>
      <boxGeometry args={[0.51, 0.12, 0.01]} />
      <meshStandardMaterial color="#ECE7E1" roughness={0.8} />
    </mesh>
    {/* Minimalist black drawer handles */}
    <mesh position={[0, 0.5, 0.22]}>
      <boxGeometry args={[0.12, 0.015, 0.015]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.34, 0.22]}>
      <boxGeometry args={[0.12, 0.015, 0.015]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </mesh>

    {/* 💡 Hanging Bedside Light Rod from ceiling */}
    <group position={[0, 1.2, 0]}>
      {/* Thin black suspension wire/rod */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 2.6, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Cylindrical glowing pendant tube */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.34, 8]} />
        <meshStandardMaterial color="#FFF" emissive="#FFE4CC" emissiveIntensity={3.5} />
      </mesh>
      {/* Black detail cap */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.06, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
    </group>
  </group>
);

// 🛋️ Cozy Couch Component
const CozyCouch = ({ position, rotation = [0, 0, 0], scale = [1, 1, 1], color = '#ECEAE5' }) => (
  <group position={position} rotation={rotation} scale={scale}>
    {/* Base */}
    <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.2, 0.25, 1.4]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {/* Backrest */}
    <mesh position={[0, 0.72, -0.55]} castShadow>
      <boxGeometry args={[3.2, 0.76, 0.3]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {/* Left Armrest */}
    <mesh position={[-1.45, 0.46, 0]} castShadow>
      <boxGeometry args={[0.3, 0.58, 1.4]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {/* Right Armrest */}
    <mesh position={[1.45, 0.46, 0]} castShadow>
      <boxGeometry args={[0.3, 0.58, 1.4]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {/* Seat Cushions */}
    <mesh position={[-0.62, 0.34, 0.05]} receiveShadow>
      <boxGeometry args={[1.22, 0.12, 1.1]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
    </mesh>
    <mesh position={[0.62, 0.34, 0.05]} receiveShadow>
      <boxGeometry args={[1.22, 0.12, 1.1]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
    </mesh>
    {/* Decorative throw pillows */}
    <mesh position={[-1.15, 0.52, -0.22]} rotation={[0.1, 0.2, 0.15]} castShadow>
      <boxGeometry args={[0.38, 0.38, 0.14]} />
      <meshStandardMaterial color="#E69F86" roughness={0.9} /> {/* warm peach pillow */}
    </mesh>
    <mesh position={[1.15, 0.52, -0.22]} rotation={[0.1, -0.2, -0.15]} castShadow>
      <boxGeometry args={[0.38, 0.38, 0.14]} />
      <meshStandardMaterial color="#7D8D7E" roughness={0.9} /> {/* sage green pillow */}
    </mesh>
    {/* Wooden legs */}
    {[[-1.4, -0.55], [-1.4, 0.55], [1.4, -0.55], [1.4, 0.55]].map(([lx, lz], idx) => (
      <mesh key={idx} position={[lx, 0.06, lz]} rotation={[lz < 0 ? -0.1 : 0.1, 0, lx < 0 ? -0.1 : 0.1]} castShadow>
        <cylinderGeometry args={[0.03, 0.02, 0.14, 8]} />
        <meshStandardMaterial color="#C49A6C" roughness={0.6} />
      </mesh>
    ))}
  </group>
);

// 🧺 Pinterest Textured Geometric Rug Component
const PinterestRug = ({ position, width = 5.2, height = 6.2 }) => (
  <group position={position}>
    {/* Carpet base */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color="#ECE7E1" roughness={0.95} />
    </mesh>
    {/* Geometric diamond pattern overlay */}
    <group position={[0, 0.005, 0]}>
      {[-2, -1, 0, 1, 2].map((xOffset) => (
        <group key={xOffset}>
          <mesh position={[xOffset, 0, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
            <planeGeometry args={[0.02, height * 1.4]} />
            <meshStandardMaterial color="#D1C5B6" roughness={0.95} />
          </mesh>
          <mesh position={[xOffset, 0, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]} receiveShadow>
            <planeGeometry args={[0.02, height * 1.4]} />
            <meshStandardMaterial color="#D1C5B6" roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  </group>
);

// 🧺 Cozy Bedroom Rug Component
const BedroomRug = ({ position, width = 2.4, height = 3.0 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
    <planeGeometry args={[width, height]} />
    <meshStandardMaterial color="#DFDCD6" roughness={0.95} />
  </mesh>
);

// 💡 Pinterest Multi-Bulb Chandelier (Modern Avize)
const PinterestChandelier = ({ position }) => (
  <group position={position}>
    {/* Ceiling plate */}
    <mesh position={[0, 0.7, 0]} castShadow>
      <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
      <meshStandardMaterial color="#EFECE7" roughness={0.5} />
    </mesh>
    {/* Suspension rod (brass stem) */}
    <mesh position={[0, 0.35, 0]} castShadow>
      <cylinderGeometry args={[0.015, 0.015, 0.7, 8]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
    </mesh>
    {/* Circular light fixture */}
    <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <torusGeometry args={[0.3, 0.02, 8, 24]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
    </mesh>
    {/* 6 glass globes (spheres) around the circle */}
    {[0, 60, 120, 180, 240, 300].map((angle, idx) => {
      const rad = (angle * Math.PI) / 180;
      const lx = Math.cos(rad) * 0.3;
      const lz = Math.sin(rad) * 0.3;
      return (
        <group key={idx} position={[lx, 0, lz]}>
          <mesh position={[0, 0, 0]} castShadow>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFF" emissiveIntensity={1.5} roughness={0.1} />
          </mesh>
        </group>
      );
    })}
  </group>
);

// 🪑 Pinterest Armchair (Berjer)
const Armchair = ({ position, rotation = [0, 0, 0], color = '#DFDCD6' }) => (
  <group position={position} rotation={rotation}>
    {/* Seat base */}
    <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.9, 0.25, 0.9]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {/* Seat cushion */}
    <mesh position={[0, 0.4, 0]} castShadow>
      <boxGeometry args={[0.82, 0.12, 0.82]} />
      <meshStandardMaterial color="#ECEAE5" roughness={0.8} />
    </mesh>
    {/* Rounded backrest */}
    <mesh position={[0, 0.72, -0.36]} castShadow>
      <boxGeometry args={[0.9, 0.64, 0.18]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {/* Slanted wooden legs */}
    {[-0.36, 0.36].map((x) =>
      [-0.36, 0.36].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.08, z]} rotation={[z < 0 ? -0.15 : 0.15, 0, x < 0 ? -0.15 : 0.15]} castShadow>
          <cylinderGeometry args={[0.025, 0.015, 0.2, 8]} />
          <meshStandardMaterial color="#C49A6C" roughness={0.6} />
        </mesh>
      ))
    )}
  </group>
);

// 🚪 Curtains Component (Dynamic sliding blinds and drapes)
const Curtains = ({ position, rotation = [0, 0, 0], isOpen = true }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Curtain rod */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <boxGeometry args={[2.5, 0.04, 0.04]} />
        <meshStandardMaterial color="#111" metalness={0.8} />
      </mesh>
      
      {/* Smart sheer blinds center - Y position and height animate */}
      <mesh position={[0, 2.3 - (isOpen ? 0.2 : 1.1), -0.01]} receiveShadow>
        <boxGeometry args={[1.8, isOpen ? 0.4 : 2.2, 0.01]} />
        <meshStandardMaterial color="#FAF5EB" roughness={0.95} transparent opacity={0.8} />
      </mesh>
      
      {/* Thick left drape */}
      <mesh position={[isOpen ? -1.0 : -0.7, 1.1, 0.02]} castShadow>
        <boxGeometry args={[isOpen ? 0.4 : 0.6, 2.3, 0.08]} />
        <meshStandardMaterial color="#C5BCAE" roughness={0.9} />
      </mesh>
      
      {/* Thick right drape */}
      <mesh position={[isOpen ? 1.0 : 0.7, 1.1, 0.02]} castShadow>
        <boxGeometry args={[isOpen ? 0.4 : 0.6, 2.3, 0.08]} />
        <meshStandardMaterial color="#C5BCAE" roughness={0.9} />
      </mesh>
    </group>
  );
};

// 🌧️ Rain Particle Effect for Rainy Weather
const RainEffect = ({ count = 350, size = 18, active }) => {
  const pointsRef = useRef();

  // Generate random rain droplet coordinates
  const tempArray = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * size * 2.0,
        y: Math.random() * 12 + 1,
        z: (Math.random() - 0.5) * size * 2.0,
        speed: 0.15 + Math.random() * 0.15
      });
    }
    return arr;
  }, [count, size]);

  useFrame(() => {
    if (!active || !pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx + 1] -= tempArray[i].speed;
      
      if (positions[idx + 1] < 0.05) {
        positions[idx + 1] = 12;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const initialPositions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    tempArray.forEach((p, i) => {
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
    });
    return pos;
  }, [tempArray, count]);

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#7dd3fc" 
        size={0.07} 
        transparent 
        opacity={0.8} 
      />
    </points>
  );
};

// ☕ Pinterest Coffee Table (Orta Sehpa)
const CoffeeTable = ({ position }) => (
  <group position={position}>
    {/* Round table top */}
    <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.65, 0.65, 0.06, 24]} />
      <meshStandardMaterial color="#E8DFD3" roughness={0.65} />
    </mesh>
    {/* Three slanted legs */}
    {[0, 120, 240].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const lx = Math.cos(rad) * 0.4;
      const lz = Math.sin(rad) * 0.4;
      return (
        <mesh key={i} position={[lx, 0.17, lz]} rotation={[lz * 0.3, 0, -lx * 0.3]} castShadow>
          <cylinderGeometry args={[0.025, 0.015, 0.32, 8]} />
          <meshStandardMaterial color="#C49A6C" roughness={0.6} />
        </mesh>
      );
    })}
  </group>
);

// 📺 Luxury TV Wall & Console Feature Wall (Marble panel + vertical wooden slats + LED glows)
const LuxuryTVWall = ({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Background marble panel */}
      <mesh position={[0, 1.8, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.6, 0.1]} />
        <meshStandardMaterial color="#F2EFE9" roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* Vertical wooden slats on left & right sides */}
      {/* Left Slats */}
      {[-2.3, -2.1, -1.9, -1.7].map((xVal, idx) => (
        <mesh key={`l-${idx}`} position={[xVal, 1.8, 0.03]} castShadow>
          <boxGeometry args={[0.08, 2.6, 0.06]} />
          <meshStandardMaterial color="#C49A6C" roughness={0.65} />
        </mesh>
      ))}
      {/* Right Slats */}
      {[1.7, 1.9, 2.1, 2.3].map((xVal, idx) => (
        <mesh key={`r-${idx}`} position={[xVal, 1.8, 0.03]} castShadow>
          <boxGeometry args={[0.08, 2.6, 0.06]} />
          <meshStandardMaterial color="#C49A6C" roughness={0.65} />
        </mesh>
      ))}

      {/* Hidden Warm LED backlight strip for the marble panel */}
      <mesh position={[0, 3.12, 0.08]}>
        <boxGeometry args={[3.1, 0.02, 0.02]} />
        <meshStandardMaterial color="#FFB85C" emissive="#FF9F1C" emissiveIntensity={5} />
      </mesh>
      <mesh position={[0, 0.52, 0.08]}>
        <boxGeometry args={[3.1, 0.02, 0.02]} />
        <meshStandardMaterial color="#FFB85C" emissive="#FF9F1C" emissiveIntensity={5} />
      </mesh>

      {/* Long Floating TV Console Stand */}
      <mesh position={[0, 0.38, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.36, 0.5]} />
        <meshStandardMaterial color="#F4F0EB" roughness={0.4} />
      </mesh>
      {/* Under-glow console LED strip */}
      <mesh position={[0, 0.18, 0.3]}>
        <boxGeometry args={[4.2, 0.02, 0.02]} />
        <meshStandardMaterial color="#FFB85C" emissive="#FF9F1C" emissiveIntensity={4} />
      </mesh>

      {/* Mounted TV Screen Panel */}
      <mesh position={[0, 1.8, 0.12]} castShadow>
        <boxGeometry args={[2.5, 1.4, 0.05]} />
        <meshStandardMaterial color="#111111" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* TV Screen Display (Glows softly) */}
      <mesh position={[0, 1.8, 0.15]}>
        <boxGeometry args={[2.42, 1.32, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>

      {/* Elegant decorative gold vase on console */}
      <mesh position={[1.8, 0.65, 0.38]} castShadow>
        <cylinderGeometry args={[0.04, 0.08, 0.18, 10]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[-1.8, 0.65, 0.38]} castShadow>
        <cylinderGeometry args={[0.05, 0.09, 0.18, 10]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
};

// 🛋️ Luxury L-Shaped Sectional Sofa
const LuxuryLSofa = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Base frame (beige) */}
    {/* Main long part along X axis */}
    <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
      <boxGeometry args={[3.4, 0.22, 1.1]} />
      <meshStandardMaterial color="#ECEAE5" roughness={0.8} />
    </mesh>
    {/* L-extension along Z axis (chaiselongue on the right side) */}
    <mesh position={[1.15, 0.18, -0.95]} castShadow receiveShadow>
      <boxGeometry args={[1.1, 0.22, 1.0]} />
      <meshStandardMaterial color="#ECEAE5" roughness={0.8} />
    </mesh>
    
    {/* Backrest along X axis */}
    <mesh position={[-0.3, 0.6, -0.45]} castShadow>
      <boxGeometry args={[2.8, 0.62, 0.2]} />
      <meshStandardMaterial color="#ECEAE5" roughness={0.8} />
    </mesh>
    {/* Backrest extension for corner */}
    <mesh position={[1.45, 0.6, -0.95]} castShadow>
      <boxGeometry args={[0.2, 0.62, 1.2]} />
      <meshStandardMaterial color="#ECEAE5" roughness={0.8} />
    </mesh>

    {/* Seat Cushions */}
    <mesh position={[-0.6, 0.28, 0.05]} receiveShadow>
      <boxGeometry args={[1.1, 0.1, 0.9]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
    </mesh>
    <mesh position={[0.5, 0.28, 0.05]} receiveShadow>
      <boxGeometry args={[1.1, 0.1, 0.9]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
    </mesh>
    {/* Chaiselongue cushion */}
    <mesh position={[1.15, 0.28, -0.95]} receiveShadow>
      <boxGeometry args={[0.96, 0.1, 0.96]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
    </mesh>

    {/* Upholstered armrest on the left */}
    <mesh position={[-1.6, 0.4, 0]} castShadow>
      <boxGeometry args={[0.2, 0.44, 1.1]} />
      <meshStandardMaterial color="#ECEAE5" roughness={0.8} />
    </mesh>

    {/* Elegant throw pillows */}
    <mesh position={[-1.3, 0.46, -0.22]} rotation={[0.08, 0.15, 0.1]} castShadow>
      <boxGeometry args={[0.36, 0.36, 0.12]} />
      <meshStandardMaterial color="#8EA6BB" roughness={0.9} /> {/* baby blue throw pillow */}
    </mesh>
    <mesh position={[-0.2, 0.46, -0.22]} rotation={[0.05, -0.1, -0.08]} castShadow>
      <boxGeometry args={[0.36, 0.36, 0.12]} />
      <meshStandardMaterial color="#D1C9BE" roughness={0.9} /> {/* linen pillow */}
    </mesh>
    <mesh position={[0.8, 0.46, -0.22]} rotation={[0.05, -0.15, -0.05]} castShadow>
      <boxGeometry args={[0.36, 0.36, 0.12]} />
      <meshStandardMaterial color="#8EA6BB" roughness={0.9} /> {/* baby blue throw pillow */}
    </mesh>

    {/* Minimalist wood feet */}
    {[
      [-1.5, 0.45], [-1.5, -0.45], 
      [0.6, 0.45], [0.6, -0.45],
      [1.5, -1.35], [0.7, -1.35]
    ].map(([lx, lz], idx) => (
      <mesh key={idx} position={[lx, 0.04, lz]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
    ))}
  </group>
);

// ☕ Luxury Rectangular Coffee Table (Polished white marble slab table)
const LuxuryCoffeeTable = ({ position }) => (
  <group position={position}>
    {/* Rectangular low solid base */}
    <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.0, 0.3, 0.5]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
    </mesh>
    {/* Large rectangular marble table top slab */}
    <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.3, 0.05, 0.7]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.12} metalness={0.15} />
    </mesh>
    {/* Elegant centerpiece vase */}
    <mesh position={[0, 0.42, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.06, 0.14, 8]} />
      <meshStandardMaterial color="#ECEAE5" roughness={0.3} />
    </mesh>
    {/* White flowers */}
    <mesh position={[0, 0.52, 0]} castShadow>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
    </mesh>
  </group>
);

// 🪑 Round Armchair (Tub chair facing the sofa)
const RoundArmchair = ({ position, rotation = [0, 0, 0] }) => (
  <group position={position} rotation={rotation}>
    {/* Round base drum */}
    <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.5, 0.5, 0.7, 24]} />
      <meshStandardMaterial color="#DFDCD6" roughness={0.8} />
    </mesh>
    {/* Hollow backrest wrapper */}
    <mesh position={[0, 0.6, 0]} castShadow>
      <cylinderGeometry args={[0.5, 0.5, 0.35, 24, 1, true]} />
      <meshStandardMaterial color="#DFDCD6" roughness={0.8} />
    </mesh>
    {/* Seat cushion */}
    <mesh position={[0, 0.48, 0]} castShadow>
      <cylinderGeometry args={[0.44, 0.44, 0.15, 20]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
    </mesh>
  </group>
);

// ☕ Luxury Side Table (Brass base + Marble top + Glass carafe)
const LuxurySideTable = ({ position }) => (
  <group position={position}>
    {/* Brass pedestal */}
    <mesh position={[0, 0.25, 0]} castShadow>
      <cylinderGeometry args={[0.16, 0.16, 0.5, 12]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
    </mesh>
    {/* Round marble top */}
    <mesh position={[0, 0.51, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.24, 0.24, 0.04, 16]} />
      <meshStandardMaterial color="#F2EFE9" roughness={0.4} metalness={0.15} />
    </mesh>
    {/* Glass carafe / cup */}
    <mesh position={[0, 0.6, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.14, 8]} />
      <meshStandardMaterial color="#C8E0F0" transparent opacity={0.6} roughness={0.1} />
    </mesh>
  </group>
);

// 🔲 Ceiling Glowing LED Strip Rectangles
const CeilingLEDs = ({ position, width = 3.6, length = 4.6 }) => (
  <group position={position}>
    {/* Rectangular glowing LED strip */}
    {/* Top side */}
    <mesh position={[0, 0, -length / 2]}>
      <boxGeometry args={[width, 0.02, 0.02]} />
      <meshStandardMaterial color="#FFE4CC" emissive="#FF9F1C" emissiveIntensity={5} />
    </mesh>
    {/* Bottom side */}
    <mesh position={[0, 0, length / 2]}>
      <boxGeometry args={[width, 0.02, 0.02]} />
      <meshStandardMaterial color="#FFE4CC" emissive="#FF9F1C" emissiveIntensity={5} />
    </mesh>
    {/* Left side */}
    <mesh position={[-width / 2, 0, 0]}>
      <boxGeometry args={[0.02, 0.02, length]} />
      <meshStandardMaterial color="#FFE4CC" emissive="#FF9F1C" emissiveIntensity={5} />
    </mesh>
    {/* Right side */}
    <mesh position={[width / 2, 0, 0]}>
      <boxGeometry args={[0.02, 0.02, length]} />
      <meshStandardMaterial color="#FFE4CC" emissive="#FF9F1C" emissiveIntensity={5} />
    </mesh>
    {/* Center spotlight pin light */}
    <mesh position={[0, -0.01, 0]}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={4} />
    </mesh>
  </group>
);

// 🌿 Luxury Tall Potted Plant (Corner bamboo/ficus style)
const LuxuryPottedPlant = ({ position }) => (
  <group position={position}>
    {/* Tall white ceramic pot */}
    <mesh position={[0, 0.38, 0]} castShadow>
      <cylinderGeometry args={[0.26, 0.18, 0.76, 16]} />
      <meshStandardMaterial color="#ECEAE5" roughness={0.5} />
    </mesh>
    {/* Stems */}
    <mesh position={[0, 0.9, 0]} castShadow>
      <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
      <meshStandardMaterial color="#5C4033" roughness={0.9} />
    </mesh>
    <mesh position={[0.08, 0.9, 0.04]} rotation={[0.1, 0, 0.08]} castShadow>
      <cylinderGeometry args={[0.012, 0.012, 0.5, 6]} />
      <meshStandardMaterial color="#5C4033" roughness={0.9} />
    </mesh>
    <mesh position={[-0.08, 0.9, -0.04]} rotation={[-0.1, 0, -0.08]} castShadow>
      <cylinderGeometry args={[0.012, 0.012, 0.5, 6]} />
      <meshStandardMaterial color="#5C4033" roughness={0.9} />
    </mesh>
    {/* Leaf clusters (spheres of green) */}
    {[
      [0, 1.25, 0, 0.38],
      [0.08, 1.45, 0.05, 0.34],
      [-0.08, 1.4, -0.05, 0.36],
      [0.15, 1.6, 0.08, 0.28],
      [-0.15, 1.55, -0.08, 0.3],
    ].map(([px, py, pz, r], i) => (
      <mesh key={i} position={[px, py, pz]} castShadow>
        <sphereGeometry args={[r, 8, 8]} />
        <meshStandardMaterial color="#4A752C" roughness={0.8} />
      </mesh>
    ))}
  </group>
);

// 💡 Luxury Dining Area Curved Chandelier
const LuxuryDiningChandelier = ({ position }) => (
  <group position={position}>
    {/* Suspension wires */}
    <mesh position={[-0.6, 0.5, 0]}>
      <cylinderGeometry args={[0.005, 0.005, 1.0, 4]} />
      <meshStandardMaterial color="#111" metalness={0.9} />
    </mesh>
    <mesh position={[0.6, 0.5, 0]}>
      <cylinderGeometry args={[0.005, 0.005, 1.0, 4]} />
      <meshStandardMaterial color="#111" metalness={0.9} />
    </mesh>
    {/* Curved golden light tube */}
    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]} castShadow>
      <boxGeometry args={[1.6, 0.03, 0.03]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
    </mesh>
    {/* Glowing underside */}
    <mesh position={[0, -0.02, 0]}>
      <boxGeometry args={[1.56, 0.01, 0.025]} />
      <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={3} />
    </mesh>
  </group>
);

// 💡 Cozy Smart Floor Lamp Component
const FloorLamp = ({ position, lightingMode = 'day' }) => {
  const isOn = lightingMode === 'dim';
  const isNight = lightingMode === 'night';
  // Dim mode: full warm glow. Night mode: faint blue glow. Day: off.
  const bulbColor = isNight ? '#b3cfff' : '#FCD34D';
  const bulbEmissive = isNight ? '#90b8ff' : '#EAB308';
  const bulbIntensity = isOn ? 8 : isNight ? 2 : 0;
  const lightIntensity = isOn ? 12.0 : isNight ? 1.5 : 0;
  const lightColor = isNight ? '#8ab4f8' : '#FCD34D';

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 16]} />
        <meshStandardMaterial color="#8B7355" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 2.4, 8]} />
        <meshStandardMaterial color="#8B7355" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Shade */}
      <mesh position={[0, 2.35, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.32, 0.45, 16]} />
        <meshStandardMaterial color="#F5E6C8" roughness={0.9} />
      </mesh>
      {/* Glowing Smart Bulb — reacts to mode */}
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial
          color={bulbColor}
          emissive={bulbEmissive}
          emissiveIntensity={bulbIntensity}
        />
      </mesh>
      {/* Light source — only emits in dim/night */}
      {(isOn || isNight) && (
        <pointLight
          position={[0, 2.2, 0]}
          color={lightColor}
          intensity={lightIntensity}
          distance={12}
          decay={1.8}
          castShadow
        />
      )}
    </group>
  );
};

// 3D Partition Walls Component depending on roomLayout and floorSize
const PartitionWalls = ({ layout, size }) => {
  const half = size / 2;
  const height = 2.5;
  const thickness = 0.25;

  const wallMat = (
    <meshStandardMaterial color="#ECE8E2" roughness={0.6} metalness={0.05} />
  );

  // 1+1 layout walls
  const render1plus1 = () => (
    <group>
      {/* Middle dividing wall along Z axis at X = 0 (leaving a door gap in center) */}
      <mesh position={[0, height / 2, -(half + 0.5) / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half - 0.5]} />
        {wallMat}
      </mesh>
      <mesh position={[0, height / 2, (half + 0.5) / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half - 0.5]} />
        {wallMat}
      </mesh>
      {/* Header over the doorway */}
      <mesh position={[0, height - 0.25, 0]} castShadow>
        <boxGeometry args={[thickness, 0.5, 1.0]} />
        {wallMat}
      </mesh>
    </group>
  );

  // 2+1 layout walls (Uses same corridor/room splitting layout as 3+1 for clean room alignment, plus salon kitchen divider)
  const render2plus1 = () => (
    <group>
      {/* Base 3+1 walls */}
      {render3plus1()}
      
      {/* Salon-Kitchen divider wall at Z = -3.5 (from X = -half to X = -half/3) */}
      {/* Outer section (left): from X = -half to X = -5.0. Center: -7.0, Width: 4.0 */}
      <mesh position={[-7.0, height / 2, -3.5]} castShadow receiveShadow>
        <boxGeometry args={[4.0, height, thickness]} />
        {wallMat}
      </mesh>
      {/* Inner section (right): from X = -4.0 to X = -half/3. Center: -3.5, Width: 1.0 */}
      <mesh position={[-3.5, height / 2, -3.5]} castShadow receiveShadow>
        <boxGeometry args={[1.0, height, thickness]} />
        {wallMat}
      </mesh>
      {/* Door header over the doorway (from X = -5.0 to X = -4.0) */}
      <mesh position={[-4.5, height - 0.25, -3.5]} castShadow>
        <boxGeometry args={[1.0, 0.5, thickness]} />
        {wallMat}
      </mesh>
    </group>
  );

  // 3+1 layout walls
  const render3plus1 = () => (
    <group>
      {/* Living room divider at X = -half / 3 */}
      <mesh position={[-half / 3, height / 2, -(half + 0.5) / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half - 0.5]} />
        {wallMat}
      </mesh>
      <mesh position={[-half / 3, height / 2, (half + 0.5) / 2]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half - 0.5]} />
        {wallMat}
      </mesh>
      <mesh position={[-half / 3, height - 0.25, 0]} castShadow>
        <boxGeometry args={[thickness, 0.5, 1.0]} />
        {wallMat}
      </mesh>

      {/* Corridor walls on right side with 3 doorway gaps */}
      <mesh position={[half / 3, height / 2, -half * 5/6 - 0.25]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half * 1/3 - 0.5]} />
        {wallMat}
      </mesh>
      <mesh position={[half / 3, height / 2, -half / 3]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half * 2/3 - 1.0]} />
        {wallMat}
      </mesh>
      <mesh position={[half / 3, height / 2, half / 3]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half * 2/3 - 1.0]} />
        {wallMat}
      </mesh>
      <mesh position={[half / 3, height / 2, half * 5/6 + 0.25]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, half * 1/3 - 0.5]} />
        {wallMat}
      </mesh>

      {/* Headers over the 3 doorways */}
      <mesh position={[half / 3, height - 0.25, -half * 2/3]} castShadow>
        <boxGeometry args={[thickness, 0.5, 1.0]} />
        {wallMat}
      </mesh>
      <mesh position={[half / 3, height - 0.25, 0]} castShadow>
        <boxGeometry args={[thickness, 0.5, 1.0]} />
        {wallMat}
      </mesh>
      <mesh position={[half / 3, height - 0.25, half * 2/3]} castShadow>
        <boxGeometry args={[thickness, 0.5, 1.0]} />
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

// 3D Interactive Door Component that opens when player is close
const InteractiveDoor = ({ position, baseRotation = 0, playerRef }) => {
  const doorRef = useRef();
  const [isOpen, setIsOpen] = useState(false);

  useFrame(() => {
    if (!playerRef.current || !doorRef.current) return;
    
    // Calculate distance between door center and player
    const doorWorldPos = new THREE.Vector3(...position);
    const distance = doorWorldPos.distanceTo(playerRef.current.position);
    
    const shouldBeOpen = distance < 2.8;
    if (shouldBeOpen !== isOpen) {
      setIsOpen(shouldBeOpen);
    }

    const targetRotation = shouldBeOpen ? Math.PI / 2.2 : 0; // open 80 degrees
    doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, targetRotation, 0.12);
  });

  return (
    <group position={position} rotation={[0, baseRotation, 0]}>
      {/* Hinge/Pivot group */}
      <group ref={doorRef}>
        {/* Door panel: width 1.0, height 2.0, thickness 0.08. Pivoted at the left edge (X = 0) */}
        <mesh position={[0.5, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 2.0, 0.08]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0.05} />
        </mesh>
        {/* Gold Door Handle */}
        <mesh position={[0.9, 1.0, 0.06]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#EAB308" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.9, 1.0, -0.06]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#EAB308" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
};

// Doors Component mapping doors by layout
const Doors = ({ layout, size, playerRef }) => {
  const half = size / 2;
  
  if (layout === '1+1') {
    return (
      <group>
        {/* Door on the partition wall gap at X = 0, Z = 0 */}
        <InteractiveDoor position={[0, 0, -0.5]} baseRotation={-Math.PI / 2} playerRef={playerRef} />
      </group>
    );
  }

  if (layout === '2+1') {
    return (
      <group>
        {/* Living room divider door */}
        <InteractiveDoor position={[-half / 3, 0, -0.5]} baseRotation={-Math.PI / 2} playerRef={playerRef} />
        {/* Three corridor doors */}
        {/* Yatak Odası 1 Door */}
        <InteractiveDoor position={[half / 3, 0, -half * 2/3 - 0.5]} baseRotation={-Math.PI / 2} playerRef={playerRef} />
        {/* Banyo Door */}
        <InteractiveDoor position={[half / 3, 0, -0.5]} baseRotation={-Math.PI / 2} playerRef={playerRef} />
        {/* Çocuk Odası Door */}
        <InteractiveDoor position={[half / 3, 0, half * 2/3 - 0.5]} baseRotation={-Math.PI / 2} playerRef={playerRef} />
        {/* Kitchen Door leading to rear partition */}
        <InteractiveDoor position={[-4.5, 0, -3.5]} baseRotation={0} playerRef={playerRef} />
      </group>
    );
  }

  if (layout === '3+1') {
    return (
      <group>
        {/* Living room divider door */}
        <InteractiveDoor position={[-half / 3, 0, -0.5]} baseRotation={-Math.PI / 2} playerRef={playerRef} />
        {/* Three corridor doors for bedrooms */}
        {/* Yatak Odası 1 Door */}
        <InteractiveDoor position={[half / 3, 0, -half * 2/3 - 0.5]} baseRotation={-Math.PI / 2} playerRef={playerRef} />
        {/* Yatak Odası 2 Door */}
        <InteractiveDoor position={[half / 3, 0, -0.5]} baseRotation={-Math.PI / 2} playerRef={playerRef} />
        {/* Çocuk Odası Door */}
        <InteractiveDoor position={[half / 3, 0, half * 2/3 - 0.5]} baseRotation={-Math.PI / 2} playerRef={playerRef} />
      </group>
    );
  }

  return null;
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
        <Html position={[-half * 2/3, 1.8, 0]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Lüks Salon
          </div>
        </Html>
        <Html position={[half * 2/3, 1.8, -half * 2/3]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Ana Yatak Odası
          </div>
        </Html>
        <Html position={[half * 2/3, 1.8, 0]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Ayrı Mutfak
          </div>
        </Html>
        <Html position={[half * 2/3, 1.8, half * 2/3]} center distanceFactor={12}>
          <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-wider shadow-lg select-none whitespace-nowrap">
            Banyo & Tuvalet
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

// Advanced Multi-Character Player Component (Robot, Man, Woman, Child) with sliding AABB wall collision detection
const Player = ({ playerRef, characterType = 'robot', initialPosition = [0, 0.5, 0], roomLayout = '2+1', floorSize = 18, cameraMode = 'orbit' }) => {
  const [, get] = useKeyboardControls();
  const speed = 5.5;

  // Refs for character parts to animate walk cycles
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const bodyRef = useRef();
  const headRef = useRef();

  // Analytical Collision Detection (sliding along wall boundaries)
  const checkCollision = (x, z) => {
    const half = floorSize / 2;
    const r = 0.45; // player collision bounding cylinder radius

    // 1. Boundary Check (outer walls)
    if (x < -half + r || x > half - r || z < -half + r || z > half - r) {
      return true;
    }

    // 2. Front Wall door gap check (center gap at X in [-0.9, 0.9])
    if (z > half - 0.2 - r) {
      if (x < -0.9 || x > 0.9) {
        return true;
      }
    }

    // 3. Partition Walls collisions


    if (roomLayout === '2+1' || roomLayout === '3+1') {
      // Living room divider at X = -half / 3. Gap Z in [-1, 1].
      const wallX1 = -half / 3;
      if (Math.abs(x - wallX1) < 0.15 + r) {
        if (z < -1 || z > 1) {
          return true;
        }
      }
      // Corridor wall at X = half / 3. Gaps at Z = -half*2/3, Z = 0, Z = half*2/3 (width 1.0 each)
      const wallX2 = half / 3;
      if (Math.abs(x - wallX2) < 0.15 + r) {
        const inGap1 = Math.abs(z + half * 2/3) < 0.5;
        const inGap2 = Math.abs(z) < 0.5;
        const inGap3 = Math.abs(z - half * 2/3) < 0.5;
        if (!inGap1 && !inGap2 && !inGap3) {
          return true;
        }
      }
      // Horizontal dividers at Z = -half / 3 and Z = half / 3 (for X > half/3)
      const wallZ1 = -half / 3;
      const wallZ2 = half / 3;
      if (x > half / 3) {
        if (Math.abs(z - wallZ1) < 0.15 + r || Math.abs(z - wallZ2) < 0.15 + r) {
          return true;
        }
      }

      // Salon-Kitchen divider wall at Z = -3.5 (only for 2+1 layout, left side X < -half/3)
      if (roomLayout === '2+1' && x < -half / 3) {
        if (Math.abs(z - (-3.5)) < 0.15 + r) {
          const inDoorway = x > -5.0 && x < -4.0;
          if (!inDoorway) {
            return true;
          }
        }
      }
    }

    if (roomLayout === '1+1') {
      // Divider at X = 0. Gap Z in [-1, 1].
      if (Math.abs(x) < 0.15 + r) {
        if (z < -1 || z > 1) {
          return true;
        }
      }
      // Partitioned Bathroom Wall Z = 5.8 (for X in [0, 2.5])
      if (x > 0 && x < 2.5 + r) {
        if (Math.abs(z - 5.8) < 0.15 + r) {
          const inDoorGap = x > 0.75 && x < 1.75;
          if (!inDoorGap) {
            return true;
          }
        }
      }
      // Partitioned Bathroom Wall X = 2.5 (for Z in [5.8, 9])
      if (z > 5.8 && z < half) {
        if (Math.abs(x - 2.5) < 0.15 + r) {
          return true;
        }
      }
    }

    return false;
  };

  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const { forward, backward, left, right } = get();
    const isMoving = forward || backward || left || right;

    if (isMoving) {
      // Camera's forward direction — projected onto the ground plane (ignore pitch)
      const camForward = new THREE.Vector3();
      state.camera.getWorldDirection(camForward);
      camForward.y = 0;
      camForward.normalize();

      // Camera's right direction = camForward × worldUp
      const camRight = new THREE.Vector3()
        .crossVectors(camForward, new THREE.Vector3(0, 1, 0))
        .normalize();

      // Build movement direction from key inputs relative to camera orientation
      const moveDir = new THREE.Vector3();
      if (forward)  moveDir.addScaledVector(camForward,  1);  // W → toward camera's forward
      if (backward) moveDir.addScaledVector(camForward, -1);  // S → away from camera
      if (right)    moveDir.addScaledVector(camRight,    1);  // D → camera's right
      if (left)     moveDir.addScaledVector(camRight,   -1);  // A → camera's left

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize().multiplyScalar(speed * delta);

        const currentPos = playerRef.current.position.clone();

        // Slide-collision: try X and Z separately
        let newX = currentPos.x + moveDir.x;
        if (checkCollision(newX, currentPos.z)) newX = currentPos.x;

        let newZ = currentPos.z + moveDir.z;
        if (checkCollision(currentPos.x, newZ)) newZ = currentPos.z;

        playerRef.current.position.x = newX;
        playerRef.current.position.z = newZ;

        // Rotate character to face movement direction
        const angle = Math.atan2(moveDir.x, moveDir.z);
        playerRef.current.rotation.y = THREE.MathUtils.lerp(
          playerRef.current.rotation.y,
          angle,
          0.2
        );
      }
    }

    
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
    <group ref={playerRef} position={initialPosition} visible={cameraMode !== 'fps'}>
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

  // Get home data and devices from router state, or fallback to persisted state on page refresh
  const [persistedState] = useState(() => {
    if (location.state && Object.keys(location.state).length > 0) {
      sessionStorage.setItem('voltify_current_meta_home', JSON.stringify(location.state));
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem('voltify_current_meta_home');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const homeName = persistedState.homeName || "Meta-House 3D";
  const [localDevices, setLocalDevices] = useState(() => persistedState.devices || EMPTY_ARRAY);
  const squareMeters = persistedState.squareMeters || 120;
  const roomLayout = persistedState.roomLayout || "2+1";

  // Native Speech-to-Action Voice Command Controller states
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechResponse, setSpeechResponse] = useState('');

  // 🔋 Smart Grid Peak Shaving Simulation states
  const [simHour, setSimHour] = useState(12);
  const [isSmartSavingAI, setIsSmartSavingAI] = useState(true); // Default to active for competition wow factor!
  const [scheduledDevices, setScheduledDevices] = useState({}); // { [deviceId]: targetHour }
  const [accumulatedCostManual, setAccumulatedCostManual] = useState(0);
  const [accumulatedCostAI, setAccumulatedCostAI] = useState(0);
  const [showGridPanel, setShowGridPanel] = useState(false); // Controlled panel visibility state

  // 🌧️ Weather Sync states
  const [weather, setWeather] = useState('sunny'); // 'sunny', 'rainy', 'cloudy'
  const [syncCity, setSyncCity] = useState('İstanbul');
  const [weatherSyncActive, setWeatherSyncActive] = useState(false);

  // 🛠️ Diagnostics & Troubleshooting game states
  const [diagnosingDeviceId, setDiagnosingDeviceId] = useState(null);
  const [diagnosticBreakers, setDiagnosticBreakers] = useState({ S1: true, S2: false, S3: false, S4: true });
  const [diagnosticTarget, setDiagnosticTarget] = useState({ S1: true, S2: true, S3: true, S4: true });

  // Dynamic electricity price formula
  const getElectricityPrice = (hour) => {
    if (hour >= 17 && hour < 22) return 5.8; // Peak hours (Red)
    if (hour >= 22 || hour < 6) return 1.2;  // Off-Peak hours (Green)
    return 2.5;                              // Normal hours (Yellow)
  };

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
        [-(half - offset), 0.0, -(half - offset)],
        [(half - offset), 0.0, -(half - offset)],
        [-(half - offset), 0.0, (half - offset)],
        [(half - offset), 0.0, (half - offset)],
        [-(half - offset), 0.0, 0],
        [(half - offset), 0.0, 0]
      ];
      return positions[index % positions.length];
    }

    // Layout: 1+1
    if (layout === '1+1') {
      if (rName.includes('yatak')) {
        // Yatak Odası (X > 0)
        const positions = [
          [(half - offset), 0.0, -(half - offset)],
          [2, 0.0, -(half - offset)],
          [(half - offset), 0.0, (half - offset)],
          [2, 0.0, (half - offset)]
        ];
        return positions[index % positions.length];
      } else {
        // Salon (X < 0)
        const positions = [
          [-(half - offset), 0.0, -(half - offset)],
          [-2, 0.0, -(half - offset)],
          [-(half - offset), 0.0, (half - offset)],
          [-2, 0.0, (half - offset)]
        ];
        return positions[index % positions.length];
      }
    }

    // Layout: 2+1
    if (layout === '2+1') {
      if (rName.includes('ana yatak') || rName.includes('yatak odası')) {
        // Ana Yatak Odası (X > 0, Z < 0)
        const positions = [
          [(half - offset), 0.0, -(half - offset)],
          [2, 0.0, -(half - offset)],
          [(half - offset), 0.0, -2]
        ];
        return positions[index % positions.length];
      } else if (rName.includes('çocuk')) {
        // Çocuk Odası (X > 0, Z > 0)
        const positions = [
          [(half - offset), 0.0, (half - offset)],
          [2, 0.0, (half - offset)],
          [(half - offset), 0.0, 2]
        ];
        return positions[index % positions.length];
      } else {
        // Salon (X < 0)
        const positions = [
          [-(half - offset), 0.0, -(half - offset)],
          [-2, 0.0, -(half - offset)],
          [-(half - offset), 0.0, (half - offset)],
          [-2, 0.0, (half - offset)]
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
  const [deviceScalesMap, setDeviceScalesMap] = useState({});
  const [selectedTransformId, setSelectedTransformId] = useState(null);
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [characterType, setCharacterType] = useState('robot');
  const [lightingMode, setLightingMode] = useState('dim');
  const [cameraMode, setCameraMode] = useState('orbit');

  // 1. Virtual Clock Interval (1 minute = 1 hour simulation tick)
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setSimHour(prev => (prev + 1) % 24);
    }, 5000); // 5 seconds per simulated hour
    return () => clearInterval(clockTimer);
  }, []);

  // 2. Real-time consumption & cost calculation hook
  useEffect(() => {
    const price = getElectricityPrice(simHour);
    
    // Calculate wattage and update cost accumulators
    let manualTotalWatts = 0;
    let aiTotalWatts = 0;

    localDevices.forEach(d => {
      const isOff = d.isAnomalous;
      
      // Manual Mode calculation (devices turn on immediately when requested)
      if (!isOff) {
        manualTotalWatts += d.currentWattage || 150;
      }
      
      // AI Mode calculation (defers high wattage loads during peak hours)
      const isPeak = simHour >= 17 && simHour < 22;
      const isHighWattage = d.type === 'Beyaz Eşya' || d.type === 'İklimlendirme';
      
      let isDeviceActiveAI = !isOff;
      if (isSmartSavingAI && isPeak && isHighWattage) {
        isDeviceActiveAI = false; // peak-shaved!
      }
      
      if (isDeviceActiveAI) {
        aiTotalWatts += d.currentWattage || 150;
      }
    });

    // Add baseline lighting consumption
    const baseLights = lightingMode === 'day' ? 300 : lightingMode === 'dim' ? 120 : 40;
    const aiBaseLights = isSmartSavingAI && (simHour >= 17 && simHour < 22)
      ? baseLights * 0.7 // AI dims lights during peak hours to save load
      : baseLights;

    manualTotalWatts += baseLights;
    aiTotalWatts += aiBaseLights;

    // Accumulate simulation tick cost (expressed in currency TL per Wh)
    // We treat each 5s tick as 1 hour of simulated consumption (Wh -> kWh)
    const kwhManual = manualTotalWatts / 1000;
    const kwhAI = aiTotalWatts / 1000;

    setAccumulatedCostManual(prev => prev + (kwhManual * price * 0.1));
    setAccumulatedCostAI(prev => prev + (kwhAI * price * 0.1));

    // Auto-run deferred devices when peak hours end (UCUZ TARİFE BAŞLADI: 22:00)
    if (simHour === 22 && isSmartSavingAI) {
      const hasScheduled = Object.keys(scheduledDevices).length > 0;
      
      setLocalDevices(prev => prev.map(d => {
        if (scheduledDevices[d.id]) {
          return { ...d, isAnomalous: false }; // turn active!
        }
        return d;
      }));
      setScheduledDevices({});
      
      // Voice / alert notification: ONLY speak if we actually turned on scheduled appliances!
      if (hasScheduled) {
        const text = "Ucuz tarifeye geçildi. Ertelenen beyaz eşyalarınız otomatik olarak çalıştırıldı.";
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'tr-TR';
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  }, [simHour, isSmartSavingAI, lightingMode, localDevices, scheduledDevices]);

  // 3. Handle manual device toggle (with AI scheduling support)
  const handleToggleDevice = (deviceId) => {
    const isPeak = simHour >= 17 && simHour < 22;
    
    setLocalDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        const currentlyOff = d.isAnomalous;
        const isHighWattage = d.type === 'Beyaz Eşya' || d.type === 'İklimlendirme';

        if (currentlyOff && isSmartSavingAI && isPeak && isHighWattage) {
          // Defer the device launch!
          setScheduledDevices(prevSched => ({ ...prevSched, [d.id]: 22 }));
          
          const text = `${d.name} yüksek tarife nedeniyle ertelendi. Saat 22:00'de otomatik çalışacak.`;
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'tr-TR';
            window.speechSynthesis.speak(utterance);
          }
          return d; // keep it off
        }

        // Otherwise toggle normally
        if (!currentlyOff && scheduledDevices[d.id]) {
          // If turning off an already scheduled device, remove from schedule
          setScheduledDevices(prevSched => {
            const copy = { ...prevSched };
            delete copy[d.id];
            return copy;
          });
        }

        return { ...d, isAnomalous: !d.isAnomalous };
      }
      return d;
    }));
  };

  // 4. Geolocation & Real-time Weather Sync (Open-Meteo API - No token required!)
  const syncRealWeather = () => {
    setWeatherSyncActive(true);
    setSpeechResponse("Gerçek zamanlı konum ve hava durumu verileri eşitleniyor...");
    
    if (!navigator.geolocation) {
      setTimeout(() => {
        setWeather('rainy');
        setSyncCity('İstanbul');
        setWeatherSyncActive(false);
        setSpeechResponse("Tarayıcınız konum servislerini desteklemiyor. İstanbul için yağmurlu hava eşitlendi.");
      }, 1500);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding for city name
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=tr`);
          const geoData = await geoRes.json();
          const cityName = geoData.city || geoData.principalSubdivision || 'Bulunduğunuz Şehir';
          setSyncCity(cityName);

          // Get weather data from Open-Meteo
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          const weatherCode = weatherData.current_weather.weathercode;
          
          // Weather codes: 0 = Sunny, 1-3 = Cloudy, 51-67 = Rainy, 71-82 = Snow, 95-99 = Stormy
          let weatherState = 'sunny';
          let speechText = 'güneşli';
          
          if (weatherCode >= 51 && weatherCode <= 82) {
            weatherState = 'rainy';
            speechText = 'yağmurlu';
          } else if (weatherCode >= 1 && weatherCode <= 45) {
            weatherState = 'cloudy';
            speechText = 'bulutlu';
          } else if (weatherCode >= 95) {
            weatherState = 'rainy';
            speechText = 'fırtınalı ve yağmurlu';
          }

          setWeather(weatherState);
          setWeatherSyncActive(false);
          
          const response = `${cityName} için hava durumu senkronize edildi. Şu an hava ${speechText}.`;
          setSpeechResponse(response);
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(response);
            utterance.lang = 'tr-TR';
            window.speechSynthesis.speak(utterance);
          }
        } catch (e) {
          console.error(e);
          setWeather('sunny');
          setWeatherSyncActive(false);
          setSpeechResponse("Hava durumu verisi alınamadı. Varsayılan güneşli hava ayarlandı.");
        }
      },
      (error) => {
        console.error(error);
        // Fallback mock
        setTimeout(() => {
          setWeather('rainy');
          setSyncCity('İstanbul');
          setWeatherSyncActive(false);
          const response = "Konum erişim izni verilmedi. İstanbul için yağmurlu hava senkronize edildi.";
          setSpeechResponse(response);
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(response);
            utterance.lang = 'tr-TR';
            window.speechSynthesis.speak(utterance);
          }
        }, 1500);
      }
    );
  };

  // 5. Automated Smart Blinds (Curtains) logic
  const areCurtainsOpen = !(weather === 'sunny' && simHour >= 11 && simHour <= 15);
  const [lastCurtainState, setLastCurtainState] = useState(true);

  useEffect(() => {
    if (areCurtainsOpen !== lastCurtainState) {
      setLastCurtainState(areCurtainsOpen);
    }
  }, [areCurtainsOpen, lastCurtainState]);

  // 🛠️ Device Diagnostics & Troubleshooting Mini-Game logic
  const startDiagnostics = (deviceId) => {
    const target = {
      S1: true,
      S2: true,
      S3: Math.random() > 0.5,
      S4: true
    };
    const current = {
      S1: Math.random() > 0.5,
      S2: false,
      S3: false,
      S4: Math.random() > 0.5
    };
    
    setDiagnosticTarget(target);
    setDiagnosticBreakers(current);
    setDiagnosingDeviceId(deviceId);

    // Modal open is visual, no text speechResponse logging needed
  };

  useEffect(() => {
    const malfunctionTimer = setInterval(() => {
      // 50% probability check at each 2-minute interval to keep alerts balanced and prevent audio spam
      if (Math.random() > 0.5) return;

      const activeDevices = localDevices.filter(d => !d.isAnomalous && !scheduledDevices[d.id]);
      if (activeDevices.length > 0 && !diagnosingDeviceId) {
        const randomDevice = activeDevices[Math.floor(Math.random() * activeDevices.length)];
        
        setLocalDevices(prev => prev.map(d => 
          d.id === randomDevice.id ? { ...d, isAnomalous: true } : d
        ));

        const text = `Sistem uyarısı: ${randomDevice.name} şebeke hattında sigorta atması veya kaçak akım arızası tespit edildi.`;
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'tr-TR';
          window.speechSynthesis.speak(utterance);
        }
      }
    }, 120000); // 2 minutes interval
    return () => clearInterval(malfunctionTimer);
  }, [localDevices, diagnosingDeviceId, scheduledDevices]);

  useEffect(() => {
    // Load persisted positions from localStorage first
    let saved = {};
    let savedScales = {};
    try {
      saved = JSON.parse(localStorage.getItem('voltify_device_positions') || '{}');
      savedScales = JSON.parse(localStorage.getItem('voltify_device_scales') || '{}');
    } catch(e) {}
    setDeviceScalesMap(savedScales);


    // Initialize position mapping: use saved if exists, otherwise calculate default
    setDevicePositionsMap(prev => {
      const updated = { ...saved, ...prev };
      localDevices.forEach((device, index) => {
        const key = String(device.id);
        if (updated[key] === undefined) {
          updated[key] = getDevicePosition(device, roomLayout, floorSize, index);
        }
      });
      return updated;
    });
  }, [localDevices, roomLayout, floorSize]);

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

      {/* Camera Mode Toggle Button */}
      <button 
        onClick={() => setCameraMode(prev => prev === 'orbit' ? 'fps' : 'orbit')}
        className="absolute bottom-6 left-6 z-20 bg-slate-900/90 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur font-bold flex items-center gap-2 border border-white/10 transition-all"
      >
        {cameraMode === 'orbit' ? 'FPS Moduna Geç (Karakter Gözü)' : 'Kuşbakışı Moduna Dön'}
      </button>

      {/* Crosshair when in FPS mode */}
      {cameraMode === 'fps' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full z-10 pointer-events-none mix-blend-difference" />
      )}

      {/* Keyboard guide for FPS */}
      {cameraMode === 'fps' && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/10 pointer-events-none text-center shadow-xl">
          W A S D tuşlarıyla yürü. Fareyle etrafa bak.<br />
          İmleci serbest bırakmak için ESC'ye bas.
        </div>
      )}
      
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

      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3">
           <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
           <span className="text-white font-bold text-sm">Sistem Aktif ({localDevices.length} Cihaz)</span>
        </div>
        
        <button
          onClick={() => {
            setShowGridPanel(!showGridPanel);
          }}
          className={`px-4 py-3 rounded-2xl border shadow-lg flex items-center gap-2 font-bold text-xs transition-all duration-200 active:scale-95 ${
            showGridPanel 
              ? 'bg-[#4C811F] text-white border-[#4C811F] shadow-green-950/20' 
              : 'bg-white/10 backdrop-blur-md text-white border-white/10 hover:bg-white/20'
          }`}
        >
          🔌 {showGridPanel ? 'Paneli Gizle' : 'Akıllı Şebeke'}
        </button>
      </div>

      {/* 🔋 Smart Grid Peak Shaving Simulator Dashboard */}
      {showGridPanel && (
        <div className="absolute top-24 right-6 z-10 w-[300px] bg-slate-950/90 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-col gap-4 text-white animate-in slide-in-from-right-5 duration-200">
          {/* Title */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
              <h2 className="text-sm font-black uppercase tracking-wider">Voltify Akıllı Şebeke</h2>
            </div>
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">Simülatör</span>
          </div>

          {/* Simulation Clock & Tariff */}
          <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-white/40 uppercase">Sanal Saat</span>
              <span className="text-xl font-black tabular-nums tracking-tight mt-0.5">
                {simHour.toString().padStart(2, '0')}:00
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-white/40 uppercase">Tarife Durumu</span>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full mt-1.5 flex items-center gap-1.5 ${
                simHour >= 17 && simHour < 22 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : (simHour >= 22 || simHour < 6 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30')
              }`}>
                {simHour >= 17 && simHour < 22 && <>🔴 Zirve Tarife</>}
                {(simHour >= 22 || simHour < 6) && <>🟢 Ucuz Tarife</>}
                {simHour >= 6 && simHour < 17 && <>🟡 Standart Tarife</>}
              </span>
            </div>
          </div>

          {/* Price info */}
          <div className="flex justify-between text-xs font-bold text-white/80">
            <span>Birim Fiyat:</span>
            <span className="font-black text-emerald-400">{getElectricityPrice(simHour).toFixed(2)} TL/kWh</span>
          </div>

          {/* AI Optimiser Switch */}
          <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-bold">Smart Peak-Shaving</span>
              <span className="text-[9px] text-white/40 font-black uppercase mt-0.5">Yapay Zeka Otomasyonu</span>
            </div>
            <button
              onClick={() => {
                setIsSmartSavingAI(!isSmartSavingAI);
                const text = isSmartSavingAI 
                  ? "Akıllı yük tıraşlama otomasyonu kapatıldı." 
                  : "Akıllı yük tıraşlama aktif. Cihazlar yoğun saatlerde ertelenecek.";
                if (window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance(text);
                  utterance.lang = 'tr-TR';
                  window.speechSynthesis.speak(utterance);
                }
              }}
              className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${
                isSmartSavingAI ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                isSmartSavingAI ? 'translate-x-6' : 'translate-x-0'
              }`}></div>
            </button>
          </div>

          {/* Cost comparison stats */}
          <div className="flex flex-col gap-2 bg-black/45 p-3.5 rounded-2xl border border-white/5">
            <div className="flex justify-between text-xs">
              <span className="text-white/60 font-medium">AI Olmadan Maliyet:</span>
              <span className="font-black tabular-nums">{accumulatedCostManual.toFixed(2)} TL</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/60 font-medium">AI Smart Maliyet:</span>
              <span className="font-black tabular-nums text-emerald-400">{accumulatedCostAI.toFixed(2)} TL</span>
            </div>
            
            {/* Net Savings highlight */}
            {accumulatedCostManual > accumulatedCostAI && (
              <div className="flex justify-between text-xs border-t border-white/10 pt-2 mt-1 font-bold">
                <span className="text-emerald-400">Net Tasarruf:</span>
                <span className="font-black text-emerald-400 tabular-nums animate-pulse">
                  {(accumulatedCostManual - accumulatedCostAI).toFixed(2)} TL
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🛠️ Troubleshooting / Diagnostics Mini-Game Modal */}
      {diagnosingDeviceId && (() => {
        const brokenDevice = localDevices.find(d => d.id === diagnosingDeviceId);
        
        const isPatternCorrect = 
          diagnosticBreakers.S1 === diagnosticTarget.S1 &&
          diagnosticBreakers.S2 === diagnosticTarget.S2 &&
          diagnosticBreakers.S3 === diagnosticTarget.S3 &&
          diagnosticBreakers.S4 === diagnosticTarget.S4;

        const handleToggleBreaker = (key) => {
          setDiagnosticBreakers(prev => ({ ...prev, [key]: !prev[key] }));
        };

        const handleExecuteRepair = () => {
          if (!isPatternCorrect) return;

          setLocalDevices(prev => prev.map(d => 
            d.id === diagnosingDeviceId ? { ...d, isAnomalous: false } : d
          ));
          setDiagnosingDeviceId(null);

          const text = `${brokenDevice ? brokenDevice.name : "Cihaz"} başarıyla onarıldı ve şebekeye güvenle bağlandı.`;
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'tr-TR';
            window.speechSynthesis.speak(utterance);
          }
        };

        return (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="w-[350px] bg-slate-950/95 border border-white/10 rounded-[28px] p-5 shadow-2xl flex flex-col gap-4 text-white animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-white">Voltify Teşhis & Onarım</h2>
                </div>
                <button 
                  onClick={() => setDiagnosingDeviceId(null)}
                  className="text-white/40 hover:text-white text-xs font-bold uppercase hover:bg-white/5 px-2.5 py-1 rounded-lg transition-all"
                >
                  Kapat
                </button>
              </div>

              {/* Status Diagnostic Box */}
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col gap-1 text-center">
                <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">Hata Kaynağı</span>
                <span className="text-sm font-black">{brokenDevice ? brokenDevice.name : "Bilinmeyen Cihaz"}</span>
                <span className="text-[10px] text-red-300 font-bold mt-1">🔴 DURUM: Şebeke Hatası (Kısa Devre / Faz Kaybı)</span>
              </div>

              {/* Breakers */}
              <div className="flex flex-col gap-3">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Sigorta Paneli (Breaker Controls)</span>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'S1', name: 'Aşırı Yük Koruma' },
                    { id: 'S2', name: 'Kaçak Akım Rölesi' },
                    { id: 'S3', name: 'Faz Dengeleyici' },
                    { id: 'S4', name: 'Toprak Akım Fişi' }
                  ].map((breaker) => {
                    const isFlippedUp = diagnosticBreakers[breaker.id];
                    
                    return (
                      <div 
                        key={breaker.id} 
                        onClick={() => handleToggleBreaker(breaker.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 select-none ${
                          isFlippedUp 
                            ? 'bg-emerald-500/10 border-emerald-500/30' 
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black opacity-60 uppercase">{breaker.id}</span>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            isFlippedUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {isFlippedUp ? 'ON' : 'TRIP'}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold">{breaker.name}</span>
                        
                        {/* Switch Visual Track */}
                        <div className="h-5 w-full bg-black/40 rounded-full flex items-center p-0.5 mt-1 border border-white/5">
                          <div className={`h-4 w-[48%] rounded-full transition-all duration-200 flex items-center justify-center text-[8px] font-black ${
                            isFlippedUp 
                              ? 'bg-emerald-500 text-white translate-x-[102%]' 
                              : 'bg-red-500 text-white translate-x-0'
                          }`}>
                            {isFlippedUp ? 'ON' : 'OFF'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clues */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
                <div className="text-[10px] font-black text-purple-400 uppercase tracking-wider">
                  🛠️ Teşhis & Şebeke Şeması:
                </div>
                <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                  Şebeke direncini dengelemek ve akımı stabilize etmek için sigortaları şu konuma getirin:
                </p>
                <div className="flex gap-2 justify-center mt-1">
                  {Object.entries(diagnosticTarget).map(([key, val]) => (
                    <span key={key} className="text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">
                      {key}: <span className={val ? 'text-emerald-400 font-black' : 'text-red-400 font-black'}>{val ? 'ON' : 'TRIP'}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-1">
                <button
                  onClick={() => setDiagnosingDeviceId(null)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white py-2.5 rounded-2xl text-xs font-bold transition-all"
                >
                  Kapat
                </button>
                <button
                  disabled={!isPatternCorrect}
                  onClick={handleExecuteRepair}
                  className={`flex-[1.5] py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    isPatternCorrect 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95' 
                      : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  ⚡ Enerji Ver & Onar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 🎛️ Left Vertical Control Column (Environmental Controls) */}
      <div className="absolute top-24 left-6 z-10 flex flex-col gap-3.5 w-[165px] text-white select-none">
        
        {/* 🕯️ Ambiance Selector Card */}
        <div className="bg-slate-950/85 backdrop-blur-xl border border-white/10 p-3 rounded-[24px] shadow-2xl flex flex-col gap-2.5 animate-in slide-in-from-left-5 duration-200">
          <div className="border-b border-white/10 pb-1.5 flex justify-between items-center px-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Ambiyans</span>
          </div>
          
          <div className="flex gap-2 justify-between">
            <button 
              onClick={() => setLightingMode('day')}
              className={`w-10 h-10 rounded-xl text-sm font-black transition-all flex items-center justify-center ${
                lightingMode === 'day' ? 'bg-[#4C811F] text-white shadow scale-105 border border-white/20' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Gündüz Modu"
            >
              ☀️
            </button>
            <button 
              onClick={() => setLightingMode('dim')}
              className={`w-10 h-10 rounded-xl text-sm font-black transition-all flex items-center justify-center ${
                lightingMode === 'dim' ? 'bg-[#D97706] text-white shadow scale-105 border border-white/20' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Loş Ambiyans"
            >
              🕯️
            </button>
            <button 
              onClick={() => setLightingMode('night')}
              className={`w-10 h-10 rounded-xl text-sm font-black transition-all flex items-center justify-center ${
                lightingMode === 'night' ? 'bg-[#6366F1] text-white shadow scale-105 border border-white/20' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Gece Modu"
            >
              🌌
            </button>
          </div>
        </div>

        {/* 🌧️ Weather Selector Card */}
        <div className="bg-slate-950/85 backdrop-blur-xl border border-white/10 p-3 rounded-[24px] shadow-2xl flex flex-col gap-2.5 animate-in slide-in-from-left-5 duration-300">
          <div className="border-b border-white/10 pb-1.5 flex justify-between items-center px-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Hava Durumu</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 justify-between">
              <button 
                onClick={() => {
                  setWeather('sunny');
                  setSpeechResponse("Hava durumu güneşli olarak ayarlandı.");
                }}
                className={`w-10 h-10 rounded-xl text-sm font-black transition-all flex items-center justify-center ${
                  weather === 'sunny' ? 'bg-[#D97706] text-white shadow scale-105 border border-white/20' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Güneşli"
              >
                ☀️
              </button>
              <button 
                onClick={() => {
                  setWeather('rainy');
                  setSpeechResponse("Hava durumu yağmurlu olarak ayarlandı.");
                }}
                className={`w-10 h-10 rounded-xl text-sm font-black transition-all flex items-center justify-center ${
                  weather === 'rainy' ? 'bg-[#0284C7] text-white shadow scale-105 border border-white/20' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Yağmurlu"
              >
                🌧️
              </button>
              <button 
                onClick={() => {
                  setWeather('cloudy');
                  setSpeechResponse("Hava durumu bulutlu olarak ayarlandı.");
                }}
                className={`w-10 h-10 rounded-xl text-sm font-black transition-all flex items-center justify-center ${
                  weather === 'cloudy' ? 'bg-[#64748B] text-white shadow scale-105 border border-white/20' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Bulutlu"
              >
                ☁️
              </button>
            </div>
            
            {/* Geolocation Sync Button */}
            <button
              onClick={syncRealWeather}
              disabled={weatherSyncActive}
              className={`w-full py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 mt-0.5 border border-purple-500/30 active:scale-95 ${
                weatherSyncActive 
                  ? 'bg-purple-600/30 text-purple-300 animate-pulse' 
                  : 'bg-purple-650 hover:bg-purple-700 text-white shadow'
              }`}
              title="Gerçek Konum Hava Durumu Eşitle"
            >
              {weatherSyncActive ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Eşitleniyor...</span>
                </>
              ) : (
                <div className="flex flex-col items-center leading-tight py-0.5">
                  <span>📡 Konum Eşitle</span>
                  {syncCity && <span className="text-[7.5px] font-black text-purple-200 opacity-90 mt-0.5 truncate max-w-[120px]">({syncCity})</span>}
                </div>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* 3D Canvas */}
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 10, 10], fov: 50 }}>
          <CameraController playerRef={playerRef} enabled={orbitEnabled} cameraMode={cameraMode} />
          <Sky 
            sunPosition={weather === 'sunny' ? [100, 20, 100] : (weather === 'cloudy' ? [30, 8, 30] : [0, -10, 0])} 
            turbidity={weather === 'sunny' ? 0.1 : (weather === 'cloudy' ? 8 : 10)} 
            rayleigh={weather === 'sunny' ? 0.5 : (weather === 'cloudy' ? 2 : 3)} 
          />
          <RainEffect count={450} size={floorSize} active={weather === 'rainy'} />
          
          {/* Dynamic Lights based on lightingMode */}
          {/* Dynamic Lights based on lightingMode (Configured to keep every room bright and cozy, preventing black voids) */}
          {lightingMode === 'day' && (
            <>
              {/* Daylight dynamically tailored to Weather Sync state (Sunny, Cloudy, or Rainy) */}
              <ambientLight 
                intensity={weather === 'sunny' ? 1.4 : (weather === 'cloudy' ? 0.8 : 0.35)} 
                color={weather === 'sunny' ? "#fffef8" : (weather === 'cloudy' ? "#cbd5e1" : "#475569")} 
              />
              <directionalLight 
                castShadow 
                position={[15, 25, 10]} 
                intensity={weather === 'sunny' ? 2.5 : (weather === 'cloudy' ? 0.6 : 0.15)} 
                color={weather === 'sunny' ? "#fff9e6" : (weather === 'cloudy' ? "#cbd5e1" : "#475569")} 
                shadow-mapSize={[2048, 2048]} 
              />
              <hemisphereLight 
                args={[
                  weather === 'sunny' ? '#e8f4ff' : (weather === 'cloudy' ? '#cbd5e1' : '#334155'), 
                  weather === 'sunny' ? '#d4b896' : (weather === 'cloudy' ? '#94a3b8' : '#1e293b'), 
                  weather === 'sunny' ? 0.65 : (weather === 'cloudy' ? 0.35 : 0.15)
                ]} 
              />
              
              {/* Soft daytime downlights inside each room */}
              <pointLight position={[salonX, 3.2, 0]} intensity={1.5} color="#ffffff" distance={15} decay={1.0} />
              {roomLayout === '1+1' && (
                <>
                  <pointLight position={[halfSize - 3.2, 3.2, 0]} intensity={1.5} color="#ffffff" distance={12} decay={1.0} />
                  <pointLight position={[1.25, 3.2, 7.4]} intensity={1.2} color="#ffffff" distance={10} decay={1.0} />
                </>
              )}
              {roomLayout === '2+1' && (
                <>
                  <pointLight position={[halfSize - 3.2, 3.2, 4.0]} intensity={1.5} color="#ffffff" distance={12} decay={1.0} />
                  <pointLight position={[halfSize - 3.2, 3.2, -3.5]} intensity={1.5} color="#ffffff" distance={12} decay={1.0} />
                  <pointLight position={[1.3, 3.2, 0]} intensity={1.2} color="#ffffff" distance={10} decay={1.0} />
                </>
              )}
              {roomLayout === '3+1' && (
                <>
                  <pointLight position={[halfSize - 3.2, 3.2, -6.5]} intensity={1.5} color="#ffffff" distance={12} decay={1.0} />
                  <pointLight position={[halfSize - 3.2, 3.2, 0]} intensity={1.5} color="#ffffff" distance={12} decay={1.0} />
                  <pointLight position={[halfSize - 3.2, 3.2, 5.5]} intensity={1.5} color="#ffffff" distance={12} decay={1.0} />
                </>
              )}
            </>
          )}
          {lightingMode === 'dim' && (
            <>
              {/* Cozy ambiance: very low ambient + warm lamp pools */}
              <ambientLight intensity={0.12} color="#ffd1a9" />
              <directionalLight castShadow position={[10, 20, 10]} intensity={0.18} color="#ffe4cc" shadow-mapSize={[1024, 1024]} />
              
              {/* Cozy point lights in each active room */}
              <pointLight position={[salonX, 2.8, 0]} intensity={8.0} color="#ff8c2a" distance={15} decay={1.2} castShadow />
              {roomLayout === '1+1' && (
                <>
                  <pointLight position={[halfSize - 3.2, 2.8, 0]} intensity={7.0} color="#ffaa55" distance={12} decay={1.2} castShadow />
                  <pointLight position={[1.25, 2.8, 7.4]} intensity={6.0} color="#ffaa55" distance={10} decay={1.2} castShadow />
                </>
              )}
              {roomLayout === '2+1' && (
                <>
                  <pointLight position={[halfSize - 3.2, 2.8, 4.0]} intensity={7.0} color="#ffaa55" distance={12} decay={1.2} castShadow />
                  <pointLight position={[halfSize - 3.2, 2.8, -3.5]} intensity={7.0} color="#ffaa55" distance={12} decay={1.2} castShadow />
                  <pointLight position={[1.3, 2.8, 0]} intensity={6.0} color="#ffaa55" distance={10} decay={1.2} castShadow />
                </>
              )}
              {roomLayout === '3+1' && (
                <>
                  <pointLight position={[halfSize - 3.2, 2.8, -6.5]} intensity={7.0} color="#ffaa55" distance={12} decay={1.2} castShadow />
                  <pointLight position={[halfSize - 3.2, 2.8, 0]} intensity={7.0} color="#ffaa55" distance={12} decay={1.2} castShadow />
                  <pointLight position={[halfSize - 3.2, 2.8, 5.5]} intensity={6.0} color="#ffaa55" distance={12} decay={1.2} castShadow />
                </>
              )}
            </>
          )}
          {lightingMode === 'night' && (
            <>
              {/* Night: dim blue moonlight ambient — not pitch black */}
              <ambientLight intensity={0.22} color="#1a2744" />
              <directionalLight castShadow position={[-10, 20, -5]} intensity={0.3} color="#6ea8f7" shadow-mapSize={[1024, 1024]} />
              
              {/* Night lights in active rooms */}
              <pointLight position={[salonX, 2.8, 0]} intensity={3.5} color="#3b6fd4" distance={16} decay={1.2} />
              {roomLayout === '1+1' && (
                <>
                  <pointLight position={[halfSize - 3.2, 2.8, 0]} intensity={3.0} color="#5b3fd4" distance={12} decay={1.2} />
                  <pointLight position={[1.25, 2.8, 7.4]} intensity={2.5} color="#4f6bf5" distance={10} decay={1.2} />
                </>
              )}
              {roomLayout === '2+1' && (
                <>
                  <pointLight position={[halfSize - 3.2, 2.8, 4.0]} intensity={3.0} color="#5b3fd4" distance={12} decay={1.2} />
                  <pointLight position={[halfSize - 3.2, 2.8, -3.5]} intensity={3.0} color="#5b3fd4" distance={12} decay={1.2} />
                  <pointLight position={[1.3, 2.8, 0]} intensity={2.5} color="#4f6bf5" distance={10} decay={1.2} />
                </>
              )}
              {roomLayout === '3+1' && (
                <>
                  <pointLight position={[halfSize - 3.2, 2.8, -6.5]} intensity={3.0} color="#5b3fd4" distance={12} decay={1.2} />
                  <pointLight position={[halfSize - 3.2, 2.8, 0]} intensity={3.0} color="#5b3fd4" distance={12} decay={1.2} />
                  <pointLight position={[halfSize - 3.2, 2.8, 5.5]} intensity={2.5} color="#4f6bf5" distance={12} decay={1.2} />
                </>
              )}
            </>
          )}
          
          {/* Outer perimeter walkway */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[floorSize + 30, floorSize + 30]} />
            <meshStandardMaterial color="#6B7280" roughness={0.9} />
          </mesh>
          {/* Inner Floor - White Polished Marble with subtle grey veins */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
            <planeGeometry args={[floorSize - 0.8, floorSize - 0.8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.12} metalness={0.15} />
          </mesh>
          
          {/* Marble Veins details */}
          {[-5, -1, 3, 7].map((offset, idx) => (
            <mesh key={`vein-1-${idx}`} rotation={[-Math.PI / 2, 0, Math.PI / 4.5]} position={[offset - 2, 0.015, offset]} receiveShadow>
              <planeGeometry args={[0.035, floorSize - 1.5]} />
              <meshBasicMaterial color="#D1D5DB" transparent opacity={0.45} />
            </mesh>
          ))}
          {[-7, -3, 1, 5].map((offset, idx) => (
            <mesh key={`vein-2-${idx}`} rotation={[-Math.PI / 2, 0, -Math.PI / 3.8]} position={[offset, 0.015, offset - 1]} receiveShadow>
              <planeGeometry args={[0.025, floorSize - 2]} />
              <meshBasicMaterial color="#E5E7EB" transparent opacity={0.55} />
            </mesh>
          ))}

          {/* Pinterest Geometric Rug */}
          <PinterestRug position={[salonX, 0.02, 0.5]} width={5.2} height={6.2} />

          {/* Room Walls (Pinterest warm cream style) */}
          {/* Back Wall */}
          <mesh position={[0, 2.5, -halfSize]} receiveShadow castShadow>
            <boxGeometry args={[floorSize, 5, 0.4]} />
            <meshStandardMaterial color="#ECE8E2" roughness={0.7} />
          </mesh>
          {/* Left Wall */}
          <mesh position={[-halfSize, 2.5, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.4, 5, floorSize]} />
            <meshStandardMaterial color="#ECE8E2" roughness={0.7} />
          </mesh>
          {/* Shortened Right Wall to accommodate Master Bedroom glass doors */}
          <mesh position={[halfSize, 2.5, (halfSize - 3) / 2]} receiveShadow castShadow>
            <boxGeometry args={[0.4, 5, floorSize - 6]} />
            <meshStandardMaterial color="#ECE8E2" roughness={0.7} />
          </mesh>
          {/* Header wall above the sliding glass door */}
          <mesh position={[halfSize, 3.75, -halfSize + 3]} receiveShadow castShadow>
            <boxGeometry args={[0.4, 2.5, 6]} />
            <meshStandardMaterial color="#ECE8E2" roughness={0.7} />
          </mesh>
          {/* Sliding Glass Doors for Master Bedroom */}
          <SlidingGlassDoor position={[halfSize, 0, -halfSize + 3]} length={6.0} />
          {/* Private Master Balcony with deck, glass railing & lounger */}
          <MasterBalcony position={[halfSize + 1.5, 0, -halfSize + 3]} length={5.8} />

          {/* Front Wall with a doorway for the front door */}
          <mesh position={[-(halfSize + 0.5) / 2, 2.5, halfSize]} receiveShadow castShadow>
            <boxGeometry args={[floorSize - 1.0, 5, 0.4]} />
            <meshStandardMaterial color="#ECE8E2" roughness={0.7} />
          </mesh>
          <mesh position={[(halfSize + 0.5) / 2, 2.5, halfSize]} receiveShadow castShadow>
            <boxGeometry args={[floorSize - 1.0, 5, 0.4]} />
            <meshStandardMaterial color="#ECE8E2" roughness={0.7} />
          </mesh>
          <mesh position={[0, 4.5, halfSize]} castShadow>
            <boxGeometry args={[1.0, 1.0, 0.4]} />
            <meshStandardMaterial color="#ECE8E2" roughness={0.5} />
          </mesh>

          {/* 3D Dynamic Partition Walls based on roomLayout */}
          <PartitionWalls layout={roomLayout} size={floorSize} />

          {/* Doors (automatically swings open when player gets close) */}
          <Doors layout={roomLayout} size={floorSize} playerRef={playerRef} />
          
          {/* Main Front Door */}
          <InteractiveDoor position={[-0.5, 0, halfSize]} baseRotation={0} playerRef={playerRef} />

          {/* Room Labels */}
          <RoomLabels layout={roomLayout} size={floorSize} />

          {/* Voltify Smart Energy Neon Lighting Tubes — brightness depends on mode */}
          <mesh position={[0, 4.8, -halfSize + 0.2]} castShadow>
            <boxGeometry args={[floorSize - 0.2, 0.06, 0.06]} />
            <meshStandardMaterial
              color="#10B981"
              emissive="#10B981"
              emissiveIntensity={lightingMode === 'day' ? 1.5 : lightingMode === 'night' ? 5 : 2}
            />
          </mesh>
          <mesh position={[-halfSize + 0.2, 4.8, 0]} castShadow>
            <boxGeometry args={[0.06, 0.06, floorSize - 0.2]} />
            <meshStandardMaterial
              color="#06B6D4"
              emissive="#06B6D4"
              emissiveIntensity={lightingMode === 'day' ? 1.5 : lightingMode === 'night' ? 5 : 2}
            />
          </mesh>
          <mesh position={[halfSize - 0.2, 4.8, 0]} castShadow>
            <boxGeometry args={[0.06, 0.06, floorSize - 0.2]} />
            <meshStandardMaterial
              color="#06B6D4"
              emissive="#06B6D4"
              emissiveIntensity={lightingMode === 'day' ? 1.5 : lightingMode === 'night' ? 5 : 2}
            />
          </mesh>

          {/* Furniture Elements & Dynamic Pinterest layout based on roomLayout */}
          {/* --- SALON / LIVING ROOM (Exactly like the luxury Pinterest image) --- */}
          {/* L-Shaped Sectional Sofa (beige) */}
          <LuxuryLSofa position={[salonX - 0.6, 0, 1.8]} rotation={[0, Math.PI, 0]} />
          
          {/* Two Round Armchairs facing the sofa */}
          <RoundArmchair position={[salonX - 1.2, 0, -0.8]} rotation={[0, 0, 0]} />
          <RoundArmchair position={[salonX + 0.8, 0, -0.8]} rotation={[0, 0, 0]} />
          {/* Sleek side table between them */}
          <LuxurySideTable position={[salonX - 0.2, 0, -0.8]} />
          
          {/* Large Low Circular Coffee Table with Gold tray and flowers */}
          <LuxuryCoffeeTable position={[salonX - 0.2, 0, 0.6]} />

          {/* Luxury TV Feature Wall (Marble + wood slats + backlights) */}
          <LuxuryTVWall position={[salonX, 0, -halfSize + 0.25]} />

          {/* 🍳 Open-concept Pinterest-style American Kitchen on left wall (hidden in separate kitchen layout of 2+1) */}
          {roomLayout !== '2+1' && (
            <LuxuryKitchen position={[-halfSize + 0.325, 0, -6.5]} rotation={[0, -Math.PI / 2, 0]} />
          )}
          
          {/* Ceiling LED strip lighting rectangles for luxury mood */}
          <CeilingLEDs position={[salonX, 4.75, 0.6]} width={3.6} length={4.6} />
          <LuxuryChandelier position={[salonX, 3.8, 0.6]} />
          {roomLayout === '3+1' ? (
            <CeilingLEDs position={[0, 4.75, halfSize - 3.0]} width={2.4} length={2.0} />
          ) : (
            <CeilingLEDs position={[halfSize - 3.5, 4.75, halfSize - 3.0]} width={2.4} length={2.0} />
          )}

          {/* Curtains for Living Room Windows */}
          <Curtains position={[-halfSize + 0.22, 2.5, -2]} rotation={[0, Math.PI / 2, 0]} isOpen={areCurtainsOpen} />
          <Curtains position={[-halfSize + 0.22, 2.5, 2.5]} rotation={[0, Math.PI / 2, 0]} isOpen={areCurtainsOpen} />

          {/* Corner potted plant in the corner next to TV and dining */}
          <LuxuryPottedPlant position={[salonX + 2.2, 0, -halfSize + 1.2]} />
          
          {/* Floor lamp placed in the back corner */}
          <FloorLamp position={[salonX + 2.2, 0, 2.2]} lightingMode={lightingMode} />

          {/* 🖼️ Paintings on left wall */}
          <WallPainting position={[-halfSize + 0.25, 2.2, -2]} rotation={[0, Math.PI / 2, 0]} color1="#D4A5C9" color2="#8FAD7E" />
          <WallPainting position={[-halfSize + 0.25, 2.2, 2.5]} rotation={[0, Math.PI / 2, 0]} width={1.0} height={0.65} color1="#F0D080" color2="#7098B8" />

          {/* --- DINING AREA --- */}
          {/* Rug under dining table */}
          {roomLayout === '3+1' ? (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, halfSize - 3.0]} receiveShadow>
              <planeGeometry args={[2.8, 1.8]} />
              <meshStandardMaterial color="#DFDCD6" roughness={0.95} />
            </mesh>
          ) : (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[halfSize - 3.5, 0.02, halfSize - 3.0]} receiveShadow>
              <planeGeometry args={[2.8, 1.8]} />
              <meshStandardMaterial color="#DFDCD6" roughness={0.95} />
            </mesh>
          )}

           {roomLayout === '3+1' ? (
            <group>
              <DiningTable position={[0, 0, halfSize - 3.0]} />
              <LuxuryDiningChandelier position={[0, 3.8, halfSize - 3.0]} />
            </group>
          ) : (
            <group>
              <DiningTable position={[halfSize - 3.5, 0, halfSize - 3.0]} />
              <LuxuryDiningChandelier position={[halfSize - 3.5, 3.8, halfSize - 3.0]} />
            </group>
          )}

          {/* Hallway Runner Rug (Only for 3+1 central corridor) */}
          {roomLayout === '3+1' && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
              <planeGeometry args={[1.2, floorSize - 2.0]} />
              <meshStandardMaterial color="#DFDCD6" roughness={0.95} />
            </mesh>
          )}

          {/* --- DYNAMIC BEDROOM FURNITURE (Prevents clipping partition walls) --- */}
          {roomLayout === '1+1' && (
            <group>
              {/* Bedroom 1 (Right side: X > 0) */}
              <BedroomRug position={[halfSize - 3.2, 0.02, 0]} />
              <Bed position={[halfSize - 3.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
              <BedsideTable position={[halfSize - 1.2, 0, -1.2]} />
              <BedsideTable position={[halfSize - 1.2, 0, 1.2]} />
              <Wardrobe position={[halfSize - 1.2, 0, 3.5]} rotation={[0, Math.PI / 2, 0]} />
              {/* Extra Wardrobe */}
              <Wardrobe position={[halfSize - 3.4, 0, 3.5]} rotation={[0, Math.PI / 2, 0]} />
              <VanityTable position={[halfSize - 3.8, 0, -3.5]} rotation={[0, Math.PI, 0]} />
              <Bookshelf position={[halfSize - 3.5, 0, -1.5]} rotation={[0, 0, 0]} />
              <Curtains position={[halfSize - 0.22, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} isOpen={areCurtainsOpen} />
              <WoodCeilingPanel position={[halfSize - 3.2, 4.78, 0]} width={3.6} length={3.6} />
              <BedroomChandelier position={[halfSize - 3.2, 3.8, 0]} />

              {/* 🚪 Partitioned Bathroom for 1+1 */}
              <mesh position={[1.25, 2.5, 5.8]} receiveShadow castShadow>
                <boxGeometry args={[2.5, 5.0, 0.2]} />
                <meshStandardMaterial color="#ECE8E2" roughness={0.7} />
              </mesh>
              <mesh position={[2.5, 2.5, 7.4]} receiveShadow castShadow>
                <boxGeometry args={[0.2, 5.0, 3.2]} />
                <meshStandardMaterial color="#ECE8E2" roughness={0.7} />
              </mesh>
              <InteractiveDoor position={[1.25, 0, 5.8]} baseRotation={0} playerRef={playerRef} />
              <LuxuryBathroom position={[1.25, 0, 7.4]} rotation={[0, 0, 0]} />
            </group>
          )}

          {roomLayout === '2+1' && (
            <group>
              {/* --- LEFT REAR ROOM: Ayrı Mutfak (Z < -3.5, X < -halfSize / 3) --- */}
              <BedroomRug position={[-6.0, 0.02, -6.5]} />
              {/* Modular kitchen cabinetry along the back wall, facing forward, NO built-in appliances! */}
              <LuxuryKitchen position={[-6.0, 0, -halfSize + 0.35]} rotation={[0, 0, 0]} />
              <WoodCeilingPanel position={[-6.0, 4.78, -6.5]} width={3.6} length={3.6} />
              <BedroomChandelier position={[-6.0, 3.8, -6.5]} />

              {/* --- RIGHT ROOM 1: Ana Yatak Odası (Z < -halfSize / 3, X > halfSize / 3) --- */}
              <BedroomRug position={[halfSize - 3.2, 0.02, -6.5]} />
              <Bed position={[halfSize - 3.2, 0, -6.8]} rotation={[0, 0, 0]} />
              <BedsideTable position={[halfSize - 4.4, 0, -8.0]} rotation={[0, 0, 0]} />
              <BedsideTable position={[halfSize - 2.0, 0, -8.0]} rotation={[0, 0, 0]} />
              <Wardrobe position={[halfSize - 1.2, 0, -4.5]} rotation={[0, Math.PI / 2, 0]} />
              <VanityTable position={[halfSize - 3.8, 0, -5.0]} rotation={[0, Math.PI, 0]} />
              <Curtains position={[halfSize - 0.22, 2.5, -6.0]} rotation={[0, -Math.PI / 2, 0]} isOpen={areCurtainsOpen} />
              <WoodCeilingPanel position={[halfSize - 3.2, 4.78, -6.8]} width={3.6} length={3.6} />
              <BedroomChandelier position={[halfSize - 3.2, 3.8, -6.8]} />

              {/* --- RIGHT ROOM 2: Banyo & Tuvalet (-halfSize/3 < Z < halfSize/3, X > halfSize / 3) --- */}
              <BedroomRug position={[halfSize - 3.2, 0.02, 0]} />
              <LuxuryBathroom position={[halfSize - 3.2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
              <Curtains position={[halfSize - 0.22, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} isOpen={areCurtainsOpen} />
              <WoodCeilingPanel position={[halfSize - 3.2, 4.78, 0]} width={3.6} length={3.6} />
              <BedroomChandelier position={[halfSize - 3.2, 3.8, 0]} />
              
              {/* --- RIGHT ROOM 3: Çocuk Odası (Z > halfSize / 3, X > halfSize / 3) --- */}
              <BedroomRug position={[halfSize - 3.2, 0.02, 6.5]} />
              <Bed position={[halfSize - 3.2, 0, 6.5]} rotation={[0, Math.PI / 2, 0]} />
              <BedsideTable position={[halfSize - 1.2, 0, 5.3]} />
              <BedsideTable position={[halfSize - 1.2, 0, 7.7]} />
              <Wardrobe position={[halfSize - 1.2, 0, 8.0]} rotation={[0, Math.PI / 2, 0]} />
              <VanityTable position={[halfSize - 3.5, 0, 8.2]} rotation={[0, Math.PI, 0]} />
              <Curtains position={[halfSize - 0.22, 2.5, 6.5]} rotation={[0, -Math.PI / 2, 0]} isOpen={areCurtainsOpen} />
              <WoodCeilingPanel position={[halfSize - 3.2, 4.78, 6.5]} width={3.6} length={3.6} />
              <BedroomChandelier position={[halfSize - 3.2, 3.8, 6.5]} />
            </group>
          )}

          {roomLayout === '3+1' && (
            <group>
              {/* Yatak Odası 1 (Room 1: Z < -halfSize / 3) - Master Bedroom */}
              <BedroomRug position={[halfSize - 3.2, 0.02, -6.5]} />
              <Bed position={[halfSize - 3.2, 0, -6.8]} rotation={[0, 0, 0]} />
              <BedsideTable position={[halfSize - 4.4, 0, -8.0]} rotation={[0, 0, 0]} />
              <BedsideTable position={[halfSize - 2.0, 0, -8.0]} rotation={[0, 0, 0]} />
              {/* Double wardrobes side-by-side on front partition wall */}
              <Wardrobe position={[4.2, 0, -3.5]} rotation={[0, Math.PI, 0]} />
              <Wardrobe position={[6.4, 0, -3.5]} rotation={[0, Math.PI, 0]} />
              <VanityTable position={[4.2, 0, -6.0]} rotation={[0, Math.PI / 2, 0]} />
              {/* Double paintings behind the bed on back wall */}
              <WallPainting position={[halfSize - 3.8, 2.2, -halfSize + 0.25]} width={1.0} height={0.75} color1="#ADC6E8" color2="#B8D4A8" />
              <WallPainting position={[halfSize - 2.6, 2.2, -halfSize + 0.25]} width={1.0} height={0.75} color1="#ECEAE5" color2="#7D8D7E" />
              <Curtains position={[halfSize - 0.22, 2.5, -6.0]} rotation={[0, -Math.PI / 2, 0]} isOpen={areCurtainsOpen} />
              <WoodCeilingPanel position={[halfSize - 3.2, 4.78, -6.8]} width={3.6} length={3.6} />
              <BedroomChandelier position={[halfSize - 3.2, 3.8, -6.8]} />
              
              {/* Yatak Odası 2 (Room 2: -halfSize/3 < Z < halfSize/3) - Birebir görseldeki tasarım */}
              <BedroomRug position={[halfSize - 3.2, 0.02, 0]} />
              <Bed position={[halfSize - 3.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
              <BedsideTable position={[halfSize - 1.2, 0, -1.0]} />
              <BedsideTable position={[halfSize - 1.2, 0, 1.0]} />
              <Wardrobe position={[halfSize - 1.2, 0, -2.0]} rotation={[0, Math.PI / 2, 0]} />
              <VanityTable position={[halfSize - 3.5, 0, 2.0]} rotation={[0, Math.PI, 0]} />
              <Curtains position={[halfSize - 0.22, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} isOpen={areCurtainsOpen} />
              <WoodCeilingPanel position={[halfSize - 3.2, 4.78, 0]} width={3.6} length={3.6} />
              <BedroomChandelier position={[halfSize - 3.2, 3.8, 0]} />
 
              {/* 🛁 Converted Luxury Bathroom Room in 3+1 (Room 3: Z > halfSize / 3) */}
              <BedroomRug position={[halfSize - 3.2, 0.02, 5.5]} />
              <LuxuryBathroom position={[halfSize - 3.2, 0, 5.5]} rotation={[0, -Math.PI / 2, 0]} />
              <Curtains position={[halfSize - 0.22, 2.5, 6.0]} rotation={[0, -Math.PI / 2, 0]} isOpen={areCurtainsOpen} />
            </group>
          )}


          {/* Player */}
          <Player 
            playerRef={playerRef} 
            characterType={characterType} 
            initialPosition={[salonX, 0.0, 0]} 
            roomLayout={roomLayout} 
            floorSize={floorSize} 
            cameraMode={cameraMode}
          />

          {/* Dynamic Devices based on specific Home data */}
          {localDevices.map((device, index) => {
            const key = String(device.id);
            const pos = devicePositionsMap[key] || getDevicePosition(device, roomLayout, floorSize, index);
            const scale = deviceScalesMap[key] || 1.0;
            
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
                status={scheduledDevices[device.id] ? "Ertelendi (Saat 22:00)" : (device.isAnomalous ? "Hata" : "Açık")} 
                wattage={`${device.currentWattage}W`} 
                color={getDeviceColor(device.type)}
                scaleMultiplier={scale}
                onScaleChange={(newScale) => {
                  setDeviceScalesMap(prev => ({ ...prev, [key]: newScale }));
                  try {
                    const saved = JSON.parse(localStorage.getItem('voltify_device_scales') || '{}');
                    saved[key] = newScale;
                    localStorage.setItem('voltify_device_scales', JSON.stringify(saved));
                  } catch(e) {}
                }}
                onPositionChange={(newPos) => {
                  setDevicePositionsMap(prev => ({ ...prev, [key]: newPos }));
                  try {
                    const saved = JSON.parse(localStorage.getItem('voltify_device_positions') || '{}');
                    saved[key] = newPos;
                    localStorage.setItem('voltify_device_positions', JSON.stringify(saved));
                  } catch(e) {}
                  setSelectedTransformId(null);
                }}
                onToggleActive={() => handleToggleDevice(device.id)}
                onRepair={() => startDiagnostics(device.id)}
              />
            );
          })}

          {/* If no devices passed, render a default one just so room isn't empty */}
          {localDevices.length === 0 && (() => {
            const fallbackPos = devicePositionsMap['999'] || [0, 0.5, -3];
            return (
              <InteractiveDevice 
                deviceId={999}
                isActive={selectedTransformId === 999}
                onDoubleClick={() => setSelectedTransformId(selectedTransformId === 999 ? null : 999)}
                setOrbitEnabled={setOrbitEnabled}
                playerRef={playerRef}
                position={fallbackPos} 
                name="Buzdolabı" 
                type="Soğutucu"
                status="Açık" 
                wattage="120W" 
                color="#0ea5e9"
                scaleMultiplier={deviceScalesMap['999'] || 1.0}
                onScaleChange={(newScale) => {
                  setDeviceScalesMap(prev => ({ ...prev, '999': newScale }));
                  try {
                    const saved = JSON.parse(localStorage.getItem('voltify_device_scales') || '{}');
                    saved['999'] = newScale;
                    localStorage.setItem('voltify_device_scales', JSON.stringify(saved));
                  } catch(e) {}
                }}
                onPositionChange={(newPos) => {
                  setDevicePositionsMap(prev => ({ ...prev, '999': newPos }));
                  try {
                    const saved = JSON.parse(localStorage.getItem('voltify_device_positions') || '{}');
                    saved['999'] = newPos;
                    localStorage.setItem('voltify_device_positions', JSON.stringify(saved));
                  } catch(e) {}
                  setSelectedTransformId(null);
                }}
              />
            );
          })()}

        </Canvas>
      </KeyboardControls>

      {/* 🎙️ AI Voice Control Assistant (Speech-to-Action) */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-3">
        {(speechTranscript || speechResponse) && (
          <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl max-w-[280px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            {speechTranscript && (
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mb-0.5">Söylediğiniz:</div>
            )}
            {speechTranscript && (
              <div className="text-white text-xs font-bold italic mb-2">"{speechTranscript}"</div>
            )}
            {speechResponse && (
              <div className="text-[10px] font-black text-purple-400 uppercase tracking-wider mb-0.5">Voltify Asistan:</div>
            )}
            {speechResponse && (
              <div className="text-white text-xs font-bold leading-relaxed">{speechResponse}</div>
            )}
          </div>
        )}
        
        <button
          onClick={() => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
              alert("Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen Google Chrome veya Microsoft Edge kullanın.");
              return;
            }

            const recognition = new SpeechRecognition();
            recognition.lang = 'tr-TR';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
              setIsListening(true);
              setSpeechTranscript('Dinleniyor...');
              setSpeechResponse('');
            };

            recognition.onerror = (event) => {
              console.error(event);
              setIsListening(false);
              setSpeechTranscript('Anlaşılamadı.');
              setTimeout(() => {
                setSpeechTranscript('');
              }, 3500);
            };

            recognition.onend = () => {
              setIsListening(false);
            };

            recognition.onresult = (event) => {
              const command = event.results[0][0].transcript.toLowerCase();
              setSpeechTranscript(command);
              
              let responseText = "Komut anlaşılamadı. Örneğin: 'ışıkları kapat', 'klimayı aç', 'robot yap' diyebilirsiniz.";
              
              if (command.includes('gündüz') || command.includes('ışıkları aç') || command.includes('ışığı aç')) {
                setLightingMode('day');
                responseText = "Anlaşıldı, gün ışığı modunu aktif ettim.";
              } else if (command.includes('gece') || command.includes('ışıkları kapat') || command.includes('ışığı kapat')) {
                setLightingMode('night');
                responseText = "Tamamdır, gece modunu açıp ortamı kararttım.";
              } else if (command.includes('loş') || command.includes('ambiyans')) {
                setLightingMode('dim');
                responseText = "Loş ışık ambiyansı ayarlandı.";
              } else if (command.includes('robot')) {
                setCharacterType('robot');
                responseText = "Karakteriniz VoltBot olarak güncellendi.";
              } else if (command.includes('erkek')) {
                setCharacterType('man');
                responseText = "Karakteriniz erkek avatar olarak güncellendi.";
              } else if (command.includes('kadın')) {
                setCharacterType('woman');
                responseText = "Karakteriniz kadın avatar olarak güncellendi.";
              } else if (command.includes('çocuk')) {
                setCharacterType('child');
                responseText = "Karakteriniz çocuk avatar olarak güncellendi.";
              } else if (command.includes('klima') || command.includes('ac')) {
                if (command.includes('aç') || command.includes('çalıştır')) {
                  setLocalDevices(prev => prev.map(d => 
                    (d.name.toLowerCase().includes('klima') || d.type === 'İklimlendirme')
                    ? { ...d, isAnomalous: false } : d
                  ));
                  responseText = "Salon kliması çalıştırılıyor.";
                } else if (command.includes('kapat') || command.includes('durdur')) {
                  setLocalDevices(prev => prev.map(d => 
                    (d.name.toLowerCase().includes('klima') || d.type === 'İklimlendirme')
                    ? { ...d, isAnomalous: true } : d
                  ));
                  responseText = "Klimanız kapatıldı.";
                }
              } else if (command.includes('televizyon') || command.includes('tv')) {
                if (command.includes('aç') || command.includes('çalıştır')) {
                  setLocalDevices(prev => prev.map(d => 
                    d.name.toLowerCase().includes('tv') ? { ...d, isAnomalous: false } : d
                  ));
                  responseText = "Televizyon açılıyor.";
                } else if (command.includes('kapat') || command.includes('durdur')) {
                  setLocalDevices(prev => prev.map(d => 
                    d.name.toLowerCase().includes('tv') ? { ...d, isAnomalous: true } : d
                  ));
                  responseText = "Televizyon kapatıldı.";
                }
              } else if (command.includes('tüm cihazlar') || command.includes('her şeyi')) {
                if (command.includes('aç') || command.includes('aktif')) {
                  setLocalDevices(prev => prev.map(d => ({ ...d, isAnomalous: false })));
                  responseText = "Evdeki tüm akıllı cihazlar aktif hale getirildi.";
                } else if (command.includes('kapat') || command.includes('söndür')) {
                  setLocalDevices(prev => prev.map(d => ({ ...d, isAnomalous: true })));
                  responseText = "Evdeki tüm cihazlar kapatıldı. Maksimum tasarruf modu.";
                }
              }

              setSpeechResponse(responseText);

              // TTS (Text-to-Speech) Speak Back
              if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(responseText);
                utterance.lang = 'tr-TR';
                window.speechSynthesis.speak(utterance);
              }

              // Auto-clear bubble after 5 seconds to keep screen neat
              setTimeout(() => {
                setSpeechTranscript('');
                setSpeechResponse('');
              }, 5000);
            };

            recognition.start();
          }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-2xl transition-all duration-300 active:scale-95 group ${
            isListening 
              ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' 
              : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
          }`}
          title="Sesli Komut Asistanı"
        >
          <div className="relative">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
            </svg>
            {isListening && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-slate-900 animate-ping"></span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default MetaHome;
