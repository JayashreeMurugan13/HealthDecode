"use client";

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface BodyPartMesh {
  name: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  onClick: () => void;
}

function BodyPart({ position, scale, color, onClick, children }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.1 : 1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? '#0066FF' : color} />
      {children}
    </mesh>
  );
}

function HumanBody({ onPartClick }: { onPartClick: (part: string) => void }) {
  return (
    <group>
      {/* Head */}
      <BodyPart
        position={[0, 4, 0]}
        scale={[0.8, 0.8, 0.8]}
        color="#FFE4B5"
        onClick={() => onPartClick('head')}
      >
        <sphereGeometry args={[0.6, 16, 16]} />
      </BodyPart>

      {/* Neck */}
      <BodyPart
        position={[0, 3, 0]}
        scale={[0.3, 0.4, 0.3]}
        color="#FFE4B5"
        onClick={() => onPartClick('neck')}
      />

      {/* Torso */}
      <BodyPart
        position={[0, 1.5, 0]}
        scale={[1.2, 2, 0.8]}
        color="#E6F0FF"
        onClick={() => onPartClick('chest')}
      />

      {/* Stomach */}
      <BodyPart
        position={[0, 0, 0]}
        scale={[1, 1, 0.7]}
        color="#E6F0FF"
        onClick={() => onPartClick('stomach')}
      />

      {/* Left Arm */}
      <BodyPart
        position={[-1.5, 2, 0]}
        scale={[0.4, 1.5, 0.4]}
        color="#FFE4B5"
        onClick={() => onPartClick('left-arm')}
      />

      {/* Right Arm */}
      <BodyPart
        position={[1.5, 2, 0]}
        scale={[0.4, 1.5, 0.4]}
        color="#FFE4B5"
        onClick={() => onPartClick('right-arm')}
      />

      {/* Left Leg */}
      <BodyPart
        position={[-0.4, -1.5, 0]}
        scale={[0.5, 2, 0.5]}
        color="#E6F0FF"
        onClick={() => onPartClick('left-leg')}
      />

      {/* Right Leg */}
      <BodyPart
        position={[0.4, -1.5, 0]}
        scale={[0.5, 2, 0.5]}
        color="#E6F0FF"
        onClick={() => onPartClick('right-leg')}
      />

      {/* Labels */}
      <Text
        position={[0, 5, 0]}
        fontSize={0.3}
        color="#0066FF"
        anchorX="center"
        anchorY="middle"
      >
        Click to diagnose
      </Text>
    </group>
  );
}

export default function Human3D({ onPartClick }: { onPartClick: (part: string) => void }) {
  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-blue-50 to-white rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <HumanBody onPartClick={onPartClick} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
        />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-sm text-gray-600">
        <p>🖱️ Drag to rotate • 🔍 Scroll to zoom • 👆 Click body parts</p>
      </div>
    </div>
  );
}