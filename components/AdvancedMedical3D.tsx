"use client";

import { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, AlertTriangle, Stethoscope } from 'lucide-react';

// Anatomical regions mapping
const ANATOMICAL_REGIONS = {
  head: { name: 'Cranium & Facial Region', color: '#FF6B6B' },
  neck: { name: 'Cervical Region', color: '#4ECDC4' },
  chest: { name: 'Pectoralis Major', color: '#45B7D1' },
  abdomen: { name: 'Rectus Abdominis', color: '#96CEB4' },
  'left-shoulder': { name: 'Left Deltoid', color: '#FFEAA7' },
  'right-shoulder': { name: 'Right Deltoid', color: '#FFEAA7' },
  'left-arm': { name: 'Left Bicep Brachii', color: '#DDA0DD' },
  'right-arm': { name: 'Right Bicep Brachii', color: '#DDA0DD' },
  'left-leg': { name: 'Left Quadriceps', color: '#98D8C8' },
  'right-leg': { name: 'Right Quadriceps', color: '#98D8C8' },
  back: { name: 'Latissimus Dorsi', color: '#F7DC6F' }
};

// Diagnostic questions database
const DIAGNOSTIC_QUESTIONS = {
  'Pectoralis Major': [
    { id: 1, question: 'Are you experiencing sharp or dull pain here?', options: ['Sharp pain', 'Dull ache', 'Burning sensation', 'No pain'] },
    { id: 2, question: 'Does this happen after heavy lifting or physical work?', options: ['Yes, always', 'Sometimes', 'No', 'Only during exercise'] },
    { id: 3, question: 'Does the pain radiate to other areas?', options: ['To arm/shoulder', 'To back', 'To neck', 'Stays localized'] }
  ],
  'Rectus Abdominis': [
    { id: 1, question: 'What type of discomfort do you feel?', options: ['Cramping', 'Sharp pain', 'Bloating', 'Tenderness'] },
    { id: 2, question: 'When does the pain occur?', options: ['After eating', 'During movement', 'At rest', 'During exercise'] },
    { id: 3, question: 'Any associated symptoms?', options: ['Nausea', 'Fever', 'Constipation', 'None'] }
  ],
  'Left Bicep Brachii': [
    { id: 1, question: 'What triggers the pain?', options: ['Lifting objects', 'Reaching overhead', 'At rest', 'Specific movements'] },
    { id: 2, question: 'How would you describe the pain?', options: ['Sharp/stabbing', 'Dull ache', 'Muscle fatigue', 'Numbness/tingling'] }
  ]
};

// Diagnostic results database
const DIAGNOSTIC_RESULTS = {
  'Pectoralis Major': {
    'Sharp pain': { condition: 'Muscle Strain', probability: 'High', recommendations: ['Rest and ice', 'Gentle stretching', 'Anti-inflammatory medication'] },
    'Dull ache': { condition: 'Muscle Fatigue', probability: 'Medium', recommendations: ['Adequate rest', 'Massage therapy', 'Gradual return to activity'] }
  },
  'Rectus Abdominis': {
    'Cramping': { condition: 'Abdominal Muscle Spasm', probability: 'High', recommendations: ['Heat therapy', 'Hydration', 'Electrolyte balance'] },
    'Sharp pain': { condition: 'Muscle Strain', probability: 'Medium', recommendations: ['Rest', 'Ice application', 'Medical evaluation'] }
  }
};

// Glowing Red Point Component
function DiagnosticPoint({ position, visible }: { position: THREE.Vector3, visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const { scale, opacity } = useSpring({
    scale: visible ? 1 : 0,
    opacity: visible ? 1 : 0,
    config: { tension: 300, friction: 30 }
  });

  const { pos } = useSpring({
    pos: position.toArray(),
    config: { tension: 200, friction: 25 }
  });

  useFrame((state) => {
    if (meshRef.current && visible) {
      meshRef.current.material.emissive.setHSL(0, 1, 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.2);
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={pos as any}
      scale={scale}
    >
      <sphereGeometry args={[0.05, 16, 16]} />
      <animated.meshStandardMaterial
        color="#FF0000"
        emissive="#FF0000"
        emissiveIntensity={0.5}
        transparent
        opacity={opacity}
      />
      {/* Glow effect */}
      <mesh scale={2}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <animated.meshBasicMaterial
          color="#FF0000"
          transparent
          opacity={opacity.to(o => o * 0.2)}
        />
      </mesh>
    </animated.mesh>
  );
}

// Anatomical Human Body Model
function AnatomicalBody({ onBodyClick }: { onBodyClick: (region: string, point: THREE.Vector3) => void }) {
  const { raycaster, camera, scene } = useThree();
  const bodyRef = useRef<THREE.Group>(null);

  const handleClick = useCallback((event: any) => {
    if (!bodyRef.current) return;

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bodyRef.current.children, true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const region = intersection.object.userData.region || 'chest';
      onBodyClick(region, intersection.point);
    }
  }, [raycaster, camera, onBodyClick]);

  return (
    <group ref={bodyRef} onClick={handleClick}>
      {/* Head */}
      <mesh position={[0, 1.7, 0]} userData={{ region: 'head' }}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFDBAC" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.5, 0]} userData={{ region: 'neck' }}>
        <cylinderGeometry args={[0.06, 0.08, 0.15, 8]} />
        <meshStandardMaterial color="#FFDBAC" />
      </mesh>

      {/* Torso - Chest */}
      <mesh position={[0, 1.2, 0]} userData={{ region: 'chest' }}>
        <boxGeometry args={[0.35, 0.4, 0.2]} />
        <meshStandardMaterial color="#E8B4B8" />
      </mesh>

      {/* Abdomen */}
      <mesh position={[0, 0.7, 0]} userData={{ region: 'abdomen' }}>
        <boxGeometry args={[0.3, 0.35, 0.18]} />
        <meshStandardMaterial color="#E8B4B8" />
      </mesh>

      {/* Left Shoulder */}
      <mesh position={[-0.25, 1.35, 0]} userData={{ region: 'left-shoulder' }}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>

      {/* Right Shoulder */}
      <mesh position={[0.25, 1.35, 0]} userData={{ region: 'right-shoulder' }}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>

      {/* Left Arm */}
      <mesh position={[-0.35, 1.0, 0]} userData={{ region: 'left-arm' }}>
        <cylinderGeometry args={[0.06, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>

      {/* Right Arm */}
      <mesh position={[0.35, 1.0, 0]} userData={{ region: 'right-arm' }}>
        <cylinderGeometry args={[0.06, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.1, 0.1, 0]} userData={{ region: 'left-leg' }}>
        <cylinderGeometry args={[0.08, 0.06, 0.8, 8]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.1, 0.1, 0]} userData={{ region: 'right-leg' }}>
        <cylinderGeometry args={[0.08, 0.06, 0.8, 8]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>
    </group>
  );
}

// Diagnostic Sidebar Component
function DiagnosticSidebar({ 
  isOpen, 
  selectedRegion, 
  onClose, 
  onAnswer 
}: { 
  isOpen: boolean;
  selectedRegion: string | null;
  onClose: () => void;
  onAnswer: (answer: string) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const questions = selectedRegion ? DIAGNOSTIC_QUESTIONS[selectedRegion as keyof typeof DIAGNOSTIC_QUESTIONS] || [] : [];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
    onAnswer(answer);
  };

  const resetDiagnostic = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  const getResults = () => {
    if (!selectedRegion || answers.length === 0) return null;
    const firstAnswer = answers[0];
    return DIAGNOSTIC_RESULTS[selectedRegion as keyof typeof DIAGNOSTIC_RESULTS]?.[firstAnswer as keyof any] || {
      condition: 'Requires Medical Evaluation',
      probability: 'Unknown',
      recommendations: ['Consult healthcare provider', 'Monitor symptoms', 'Rest if needed']
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <div className="p-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">HealthDecode AI</h3>
                  <p className="text-sm text-gray-500">Diagnostic Assistant</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Selected Region */}
            {selectedRegion && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-1">Selected Region</h4>
                <p className="text-blue-700">{selectedRegion}</p>
              </div>
            )}

            {!showResults ? (
              <>
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>Question {currentQuestion + 1} of {questions.length}</span>
                    <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Question */}
                {questions[currentQuestion] && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      {questions[currentQuestion].question}
                    </h4>
                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option) => (
                        <motion.button
                          key={option}
                          className="w-full p-4 rounded-xl border border-gray-200 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleAnswer(option)}
                        >
                          <span className="font-medium text-gray-900">{option}</span>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Results */
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium">Analysis Complete</span>
                </div>

                {(() => {
                  const results = getResults();
                  return results ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h5 className="font-semibold text-gray-900 mb-2">Possible Condition</h5>
                        <p className="text-gray-700 mb-2">{results.condition}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          results.probability === 'High' ? 'bg-red-100 text-red-700' :
                          results.probability === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {results.probability} Probability
                        </span>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Next Steps</h5>
                        <ul className="space-y-2">
                          {results.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null;
                })()}

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Medical Disclaimer</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        This AI analysis is for informational purposes only. Always consult a qualified healthcare professional for proper diagnosis and treatment.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { resetDiagnostic(); onClose(); }}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Start New Analysis
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main Component
export default function AdvancedMedical3D() {
  const [selectedPoint, setSelectedPoint] = useState<THREE.Vector3 | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleBodyClick = useCallback((region: string, point: THREE.Vector3) => {
    setSelectedPoint(point);
    setSelectedRegion(ANATOMICAL_REGIONS[region as keyof typeof ANATOMICAL_REGIONS]?.name || region);
    setSidebarOpen(true);
  }, []);

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedPoint(null);
    setSelectedRegion(null);
  };

  return (
    <div className="relative w-full h-[700px] bg-gradient-to-b from-blue-50 via-white to-blue-50 rounded-2xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 1, 3], fov: 50 }}
        shadows
      >
        {/* Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, 5]} intensity={0.3} />

        {/* Environment */}
        <Environment preset="studio" />
        
        {/* Human Body Model */}
        <AnatomicalBody onBodyClick={handleBodyClick} />
        
        {/* Diagnostic Point */}
        {selectedPoint && (
          <DiagnosticPoint 
            position={selectedPoint} 
            visible={!!selectedPoint} 
          />
        )}

        {/* Ground Shadows */}
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.3}
          scale={3}
          blur={2}
          far={1}
        />

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={6}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="font-semibold text-gray-900 mb-2">HealthDecode AI</h3>
        <p className="text-sm text-gray-600 mb-2">3D Diagnostic Assistant</p>
        <div className="text-xs text-gray-500 space-y-1">
          <p>🖱️ Rotate: Drag to rotate view</p>
          <p>🔍 Zoom: Scroll to zoom in/out</p>
          <p>👆 Click: Select body region</p>
        </div>
      </div>

      {/* Diagnostic Sidebar */}
      <DiagnosticSidebar
        isOpen={sidebarOpen}
        selectedRegion={selectedRegion}
        onClose={handleCloseSidebar}
        onAnswer={(answer) => console.log('Answer:', answer)}
      />
    </div>
  );
}