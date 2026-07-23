import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, OrbitControls, Html, useKeyboardControls, KeyboardControls, useGLTF, Center, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowLeft, Zap, Power } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// GLB Model Loader Component
const GlbModel = ({ url, scale = 1.5 }) => {
  const { scene } = useGLTF(url);
  // Clone scene so we can use it multiple times if needed without conflict
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  return (
    <Suspense fallback={null}>
      <Center>
        <primitive object={clonedScene} scale={[scale, scale, scale]} />
      </Center>
    </Suspense>
  );
};

// Device Component
const InteractiveDevice = ({ position, name, status, wattage, color, playerRef, modelUrl, rotationY = 0, scale = 1 }) => {
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
      
      // No rotation or floating - completely static
    }
  });

  return (
    <mesh position={position} ref={meshRef} rotation={[0, rotationY, 0]}>
      {modelUrl ? (
        <GlbModel url={modelUrl} scale={scale} />
      ) : (
        <>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </>
      )}
      
      {showTooltip && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-gray-100 flex flex-col gap-2 min-w-[160px] animate-in zoom-in-75 duration-200">
            <h3 className="font-bold text-gray-900 text-sm">{name}</h3>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${status === 'Açık' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {status}
              </span>
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <Zap className="w-3 h-3" /> {wattage}
              </span>
            </div>
            <button className="mt-1 w-full bg-[#4C811F] hover:bg-green-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors">
              Yönet
            </button>
          </div>
        </Html>
      )}
    </mesh>
  );
};

// Camera Controller to follow player but allow 360 mouse rotation
const CameraController = ({ playerRef }) => {
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
      maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going under the floor
    />
  );
};

// Player Component
const Player = ({ playerRef }) => {
  const [_, get] = useKeyboardControls();
  const speed = 5;

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    
    const { forward, backward, left, right } = get();
    const velocity = new THREE.Vector3();

    if (forward) velocity.z -= 1;
    if (backward) velocity.z += 1;
    if (left) velocity.x -= 1;
    if (right) velocity.x += 1;

    velocity.normalize().multiplyScalar(speed * delta);
    playerRef.current.position.add(velocity);
    
    // We removed manual camera lerping here to let OrbitControls handle 360 rotation
  });

  return (
    <mesh ref={playerRef} position={[0, 0.5, 0]}>
      {/* Player Body (Placeholder for Lego Character) */}
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4C811F" />
      {/* Player Head */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#FFE0B2" />
      </mesh>
    </mesh>
  );
};

const MetaHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playerRef = useRef();

  // Get home data and devices from router state, or fallback to defaults
  const state = location.state || {};
  const homeName = state.homeName || "Meta-House 3D";
  const devices = state.devices || [];

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

  // Pre-calculated positions for devices to spread them around the room
  const devicePositions = [
    [-5, 0.5, -5],
    [5, 0.5, -2],
    [0, 0.5, 5],
    [-4, 0.5, 4],
    [6, 0.5, 6],
  ];

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
          <p className="text-white/80 text-xs font-medium bg-black/20 px-3 py-1 rounded-full inline-block mt-1">
            Yön tuşları veya W,A,S,D ile hareket edin
          </p>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-10 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3">
         <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
         <span className="text-white font-bold text-sm">Sistem Aktif ({devices.length} Cihaz)</span>
      </div>

      {/* 3D Canvas */}
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 10, 10], fov: 50 }}>
          <CameraController playerRef={playerRef} />
          <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
          <ambientLight intensity={0.5} />
          <directionalLight castShadow position={[10, 20, 10]} intensity={1.5} shadow-mapSize={[1024, 1024]} />
          
          {/* Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#f3f4f6" />
            <gridHelper args={[50, 50, '#e5e7eb', '#e5e7eb']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} />
          </mesh>

          {/* Walls */}
          {/* Back Wall */}
          <mesh position={[0, 2.5, -10]} receiveShadow castShadow>
            <boxGeometry args={[20, 5, 0.5]} />
            <meshStandardMaterial color="#e5e7eb" />
          </mesh>
          {/* Left Wall */}
          <mesh position={[-10, 2.5, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.5, 5, 20]} />
            <meshStandardMaterial color="#e5e7eb" />
          </mesh>
          {/* Right Wall */}
          <mesh position={[10, 2.5, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.5, 5, 20]} />
            <meshStandardMaterial color="#e5e7eb" />
          </mesh>

          {/* Player */}
          <Player playerRef={playerRef} />

          {/* Dynamic Devices based on specific Home data */}
          {devices.map((device, index) => {
            const pos = devicePositions[index % devicePositions.length];
            
            // Check if device is a Washing Machine to assign our model
            const isWasher = device.name.toLowerCase().includes('çamaşır') || device.name.toLowerCase().includes('washer');
            
            return (
              <InteractiveDevice 
                key={device.id}
                playerRef={playerRef}
                position={pos} 
                name={device.name} 
                status={device.isAnomalous ? "Hata" : "Açık"} 
                wattage={`${device.currentWattage}W`} 
                color={getDeviceColor(device.type)}
                modelUrl={isWasher ? '/washer.glb' : null}
                rotationY={isWasher ? 0 : 0} // 0 means default rotation, exact opposite of Math.PI
                scale={isWasher ? 1.5 : 1}
              />
            );
          })}

          {/* If no devices passed, render a default one just so room isn't empty */}
          {devices.length === 0 && (
            <InteractiveDevice 
              playerRef={playerRef}
              position={[0, 0.5, -3]} 
              name="Örnek Cihaz" 
              status="Açık" 
              wattage="50W" 
              color="#eab308" 
            />
          )}

        </Canvas>
      </KeyboardControls>
    </div>
  );
};

export default MetaHome;
