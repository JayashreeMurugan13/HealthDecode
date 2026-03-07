"use client";

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Custom muscle geometry creator
function createMuscleGeometry(type: string) {
  switch (type) {
    case 'pectoral':
      // Create pectoral muscle shape
      const pectoralShape = new THREE.Shape();
      pectoralShape.moveTo(-0.15, 0.1);
      pectoralShape.bezierCurveTo(-0.15, 0.15, -0.05, 0.15, 0, 0.1);
      pectoralShape.bezierCurveTo(0.05, 0.15, 0.15, 0.15, 0.15, 0.1);
      pectoralShape.bezierCurveTo(0.15, -0.1, 0.05, -0.15, 0, -0.1);
      pectoralShape.bezierCurveTo(-0.05, -0.15, -0.15, -0.1, -0.15, 0.1);
      return new THREE.ExtrudeGeometry(pectoralShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02 });
    
    case 'bicep':
      // Create bicep muscle shape
      const bicepCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.15, 0),
        new THREE.Vector3(0.03, 0.1, 0.02),
        new THREE.Vector3(0.04, 0, 0.03),
        new THREE.Vector3(0.03, -0.1, 0.02),
        new THREE.Vector3(0, -0.15, 0)
      ]);
      return new THREE.TubeGeometry(bicepCurve, 20, 0.04, 8, false);
    
    case 'abs':
      // Create abdominal muscle segments
      const absGeometry = new THREE.BoxGeometry(0.25, 0.08, 0.06);
      return absGeometry;
    
    case 'quadriceps':
      // Create quadriceps muscle
      const quadCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.2, 0),
        new THREE.Vector3(0.02, 0.1, 0.03),
        new THREE.Vector3(0.03, 0, 0.04),
        new THREE.Vector3(0.02, -0.1, 0.03),
        new THREE.Vector3(0, -0.2, 0)
      ]);
      return new THREE.TubeGeometry(quadCurve, 25, 0.06, 8, false);
    
    default:
      return new THREE.SphereGeometry(0.05, 16, 16);
  }
}

function AnatomicalMuscle({ position, muscleType, color, onClick, name, rotation = [0, 0, 0] }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const geometry = useMemo(() => createMuscleGeometry(muscleType), [muscleType]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: hovered ? '#0066FF' : color,
      roughness: 0.7,
      metalness: 0.1,
      transparent: false,
    });
  }, [color, hovered]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.05 : 1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      userData={{ name }}
      geometry={geometry}
      material={material}
    />
  );
}

function RealisticMaleAnatomy({ onPartClick }: { onPartClick: (part: string) => void }) {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 1.8, 0]} onClick={() => onPartClick('head')}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.8} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.62, 0]} onClick={() => onPartClick('head')}>
        <cylinderGeometry args={[0.06, 0.07, 0.15, 16]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.8} />
      </mesh>

      {/* Pectoral Muscles */}
      <AnatomicalMuscle
        position={[-0.08, 1.4, 0.05]}
        muscleType="pectoral"
        color="#CD853F"
        name="left-pectoral"
        onClick={() => onPartClick('chest')}
      />
      <AnatomicalMuscle
        position={[0.08, 1.4, 0.05]}
        muscleType="pectoral"
        color="#CD853F"
        name="right-pectoral"
        rotation={[0, Math.PI, 0]}
        onClick={() => onPartClick('chest')}
      />

      {/* Abdominal Muscles */}
      <AnatomicalMuscle
        position={[0, 1.15, 0.03]}
        muscleType="abs"
        color="#CD853F"
        name="upper-abs"
        onClick={() => onPartClick('stomach')}
      />
      <AnatomicalMuscle
        position={[0, 1.05, 0.03]}
        muscleType="abs"
        color="#CD853F"
        name="middle-abs"
        onClick={() => onPartClick('stomach')}
      />
      <AnatomicalMuscle
        position={[0, 0.95, 0.03]}
        muscleType="abs"
        color="#CD853F"
        name="lower-abs"
        onClick={() => onPartClick('stomach')}
      />

      {/* Shoulders */}
      <mesh position={[-0.25, 1.45, 0]} onClick={() => onPartClick('left-arm')}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#CD853F" roughness={0.7} />
      </mesh>
      <mesh position={[0.25, 1.45, 0]} onClick={() => onPartClick('right-arm')}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#CD853F" roughness={0.7} />
      </mesh>

      {/* Biceps */}
      <AnatomicalMuscle
        position={[-0.35, 1.2, 0]}
        muscleType="bicep"
        color="#CD853F"
        name="left-bicep"
        onClick={() => onPartClick('left-arm')}
      />
      <AnatomicalMuscle
        position={[0.35, 1.2, 0]}
        muscleType="bicep"
        color="#CD853F"
        name="right-bicep"
        onClick={() => onPartClick('right-arm')}
      />

      {/* Forearms */}
      <mesh position={[-0.35, 0.85, 0]} onClick={() => onPartClick('left-arm')}>
        <cylinderGeometry args={[0.04, 0.035, 0.3, 16]} />
        <meshStandardMaterial color="#CD853F" roughness={0.7} />
      </mesh>
      <mesh position={[0.35, 0.85, 0]} onClick={() => onPartClick('right-arm')}>
        <cylinderGeometry args={[0.04, 0.035, 0.3, 16]} />
        <meshStandardMaterial color="#CD853F" roughness={0.7} />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.35, 0.65, 0]} onClick={() => onPartClick('left-arm')}>
        <boxGeometry args={[0.06, 0.12, 0.04]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.8} />
      </mesh>
      <mesh position={[0.35, 0.65, 0]} onClick={() => onPartClick('right-arm')}>
        <boxGeometry args={[0.06, 0.12, 0.04]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.8} />
      </mesh>

      {/* Quadriceps */}
      <AnatomicalMuscle
        position={[-0.1, 0.4, 0]}
        muscleType="quadriceps"
        color="#CD853F"
        name="left-quadriceps"
        onClick={() => onPartClick('left-leg')}
      />
      <AnatomicalMuscle
        position={[0.1, 0.4, 0]}
        muscleType="quadriceps"
        color="#CD853F"
        name="right-quadriceps"
        onClick={() => onPartClick('right-leg')}
      />

      {/* Knees */}
      <mesh position={[-0.1, 0.12, 0]} onClick={() => onPartClick('left-leg')}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.8} />
      </mesh>
      <mesh position={[0.1, 0.12, 0]} onClick={() => onPartClick('right-leg')}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.8} />
      </mesh>

      {/* Calves */}
      <mesh position={[-0.1, -0.15, 0]} onClick={() => onPartClick('left-leg')}>
        <cylinderGeometry args={[0.055, 0.045, 0.38, 16]} />
        <meshStandardMaterial color="#CD853F" roughness={0.7} />
      </mesh>
      <mesh position={[0.1, -0.15, 0]} onClick={() => onPartClick('right-leg')}>
        <cylinderGeometry args={[0.055, 0.045, 0.38, 16]} />
        <meshStandardMaterial color="#CD853F" roughness={0.7} />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.1, -0.38, 0.08]} onClick={() => onPartClick('left-leg')}>
        <boxGeometry args={[0.08, 0.05, 0.18]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.8} />
      </mesh>
      <mesh position={[0.1, -0.38, 0.08]} onClick={() => onPartClick('right-leg')}>
        <boxGeometry args={[0.08, 0.05, 0.18]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.8} />
      </mesh>

      {/* Labels */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.06}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        Anatomical Male Muscle Model
      </Text>
    </group>
  );
}

export default function Human3D({ onPartClick }: { onPartClick: (part: string) => void }) {
  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-gray-100 to-white rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 0.8, 3], fov: 45 }}>
        {/* Professional anatomical lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-5, 8, -5]} intensity={0.6} />
        <pointLight position={[0, 3, 3]} intensity={0.8} color="#FFF8DC" />
        <spotLight 
          position={[3, 4, 3]} 
          intensity={0.5} 
          angle={0.4} 
          penumbra={0.3}
        />
        
        <RealisticMaleAnatomy onPartClick={onPartClick} />
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={5}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI - Math.PI / 8}
        />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 text-sm text-gray-700 shadow-lg">
        <p className="font-medium">🏥 Anatomical Muscle Model</p>
        <p>🖱️ Rotate • 🔍 Zoom • 👆 Click muscles</p>
      </div>
    </div>
  );
}