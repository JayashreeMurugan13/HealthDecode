"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface MuscleGroup {
  id: string;
  name: string;
  color: string;
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
}

function MuscleBody({ onPartClick, selectedPart }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const createMuscle = (id: string, geometry: any, position: [number, number, number], color: string) => {
    const isSelected = selectedPart === id;
    const isHovered = hoveredPart === id;
    const meshColor = isSelected ? "#0066FF" : isHovered ? "#00B5AD" : color;

    return (
      <mesh
        key={id}
        position={position}
        geometry={geometry}
        onClick={() => onPartClick(id)}
        onPointerOver={() => setHoveredPart(id)}
        onPointerOut={() => setHoveredPart(null)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={meshColor} 
          metalness={0.2} 
          roughness={0.8}
          emissive={isSelected ? "#0044CC" : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
    );
  };

  return (
    <group ref={groupRef}>
      {/* Head */}
      {createMuscle("head", new THREE.SphereGeometry(0.4, 32, 32), [0, 2.5, 0], "#C89090")}
      
      {/* Neck */}
      {createMuscle("neck", new THREE.CylinderGeometry(0.2, 0.25, 0.4, 24), [0, 2, 0], "#B87575")}
      
      {/* Chest - Pectoralis Major */}
      {createMuscle("chest", new THREE.BoxGeometry(1, 0.6, 0.4), [0, 1.5, 0.1], "#A85555")}
      
      {/* Shoulders - Deltoids */}
      {createMuscle("left-shoulder", new THREE.SphereGeometry(0.3, 24, 24), [-0.7, 1.6, 0], "#B86565")}
      {createMuscle("right-shoulder", new THREE.SphereGeometry(0.3, 24, 24), [0.7, 1.6, 0], "#B86565")}
      
      {/* Abdomen - Rectus Abdominis */}
      {createMuscle("stomach", new THREE.BoxGeometry(0.8, 0.8, 0.3), [0, 0.7, 0.05], "#984545")}
      
      {/* Upper Arms - Biceps */}
      {createMuscle("left-arm", new THREE.CylinderGeometry(0.15, 0.12, 0.8, 24), [-0.9, 1, 0], "#B87070")}
      {createMuscle("right-arm", new THREE.CylinderGeometry(0.15, 0.12, 0.8, 24), [0.9, 1, 0], "#B87070")}
      
      {/* Forearms */}
      {createMuscle("left-forearm", new THREE.CylinderGeometry(0.12, 0.1, 0.7, 24), [-0.9, 0.2, 0], "#C89090")}
      {createMuscle("right-forearm", new THREE.CylinderGeometry(0.12, 0.1, 0.7, 24), [0.9, 0.2, 0], "#C89090")}
      
      {/* Thighs - Quadriceps */}
      {createMuscle("left-leg", new THREE.CylinderGeometry(0.2, 0.18, 1.2, 24), [-0.25, -0.5, 0], "#A85555")}
      {createMuscle("right-leg", new THREE.CylinderGeometry(0.2, 0.18, 1.2, 24), [0.25, -0.5, 0], "#A85555")}
      
      {/* Calves - Gastrocnemius */}
      {createMuscle("left-calf", new THREE.CylinderGeometry(0.15, 0.12, 0.8, 24), [-0.25, -1.5, 0], "#B86565")}
      {createMuscle("right-calf", new THREE.CylinderGeometry(0.15, 0.12, 0.8, 24), [0.25, -1.5, 0], "#B86565")}
      
      {/* Back - Trapezius */}
      {createMuscle("back", new THREE.BoxGeometry(1, 0.8, 0.3), [0, 1.5, -0.2], "#A85555")}
      
      {/* Glutes */}
      {createMuscle("glutes", new THREE.BoxGeometry(0.8, 0.4, 0.3), [0, 0.1, -0.15], "#B87070")}
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.6} />
      <spotLight position={[0, 8, 3]} angle={0.3} penumbra={1} intensity={1} castShadow />
      <hemisphereLight args={["#ffffff", "#555555", 0.5]} />
    </group>
  );
}

export default function MuscleAnatomy3D({ onPartClick, selectedPart }: { onPartClick: (id: string) => void; selectedPart: string | null }) {
  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-gray-50 to-white rounded-2xl overflow-hidden">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 1, 5]} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
        <MuscleBody onPartClick={onPartClick} selectedPart={selectedPart} />
      </Canvas>
    </div>
  );
}
