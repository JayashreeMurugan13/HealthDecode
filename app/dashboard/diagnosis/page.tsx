"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const MuscleAnatomy3D = dynamic(() => import("@/components/MuscleAnatomy3D"), { ssr: false });

interface BodyPart {
  id: string;
  name: string;
  position: { x: number; y: number };
  questions: {
    id: string;
    question: string;
    options: string[];
  }[];
  conditions: {
    name: string;
    probability: "low" | "medium" | "high";
    description: string;
    recommendations: string[];
  }[];
}

const bodyParts: BodyPart[] = [
  {
    id: "head",
    name: "Head",
    position: { x: 50, y: 8 },
    questions: [
      { id: "1", question: "Do you experience frequent headaches?", options: ["Yes", "No", "Sometimes"] },
      { id: "2", question: "Do you feel dizzy or lightheaded?", options: ["Yes", "No", "Occasionally"] },
      { id: "3", question: "Do you have trouble concentrating?", options: ["Yes", "No", "Sometimes"] },
    ],
    conditions: [
      { name: "Tension Headache", probability: "medium", description: "Common headache caused by stress or muscle tension", recommendations: ["Get adequate sleep", "Manage stress", "Stay hydrated"] },
      { name: "Migraine", probability: "low", description: "Severe recurring headache often accompanied by nausea", recommendations: ["Identify triggers", "Consult a neurologist", "Consider preventive medication"] },
    ],
  },
  {
    id: "chest",
    name: "Chest",
    position: { x: 50, y: 28 },
    questions: [
      { id: "1", question: "Do you experience chest pain or discomfort?", options: ["Yes", "No", "Sometimes"] },
      { id: "2", question: "Do you feel shortness of breath?", options: ["Yes", "No", "During exercise"] },
      { id: "3", question: "Do you have palpitations?", options: ["Yes", "No", "Occasionally"] },
    ],
    conditions: [
      { name: "Acid Reflux", probability: "medium", description: "Stomach acid flowing back into the esophagus", recommendations: ["Avoid spicy foods", "Eat smaller meals", "Don't lie down after eating"] },
      { name: "Anxiety", probability: "low", description: "Chest tightness related to anxiety or stress", recommendations: ["Practice relaxation techniques", "Regular exercise", "Consider therapy"] },
    ],
  },
  {
    id: "stomach",
    name: "Stomach",
    position: { x: 50, y: 42 },
    questions: [
      { id: "1", question: "Do you experience pain after eating?", options: ["Yes", "No", "Sometimes"] },
      { id: "2", question: "Do you feel nausea or burning sensation?", options: ["Yes", "No", "Occasionally"] },
      { id: "3", question: "Do you have bloating or gas?", options: ["Yes", "No", "Frequently"] },
    ],
    conditions: [
      { name: "Gastritis", probability: "high", description: "Inflammation of the stomach lining", recommendations: ["Avoid spicy and acidic foods", "Take antacids", "Consult a gastroenterologist"] },
      { name: "Acidity", probability: "medium", description: "Excess acid production in the stomach", recommendations: ["Eat smaller meals", "Avoid lying down after meals", "Reduce caffeine intake"] },
      { name: "Food Poisoning", probability: "low", description: "Illness from contaminated food", recommendations: ["Stay hydrated", "Rest", "Seek medical attention if severe"] },
    ],
  },
  {
    id: "back",
    name: "Back",
    position: { x: 50, y: 35 },
    questions: [
      { id: "1", question: "Do you have lower back pain?", options: ["Yes", "No", "Sometimes"] },
      { id: "2", question: "Does the pain radiate to your legs?", options: ["Yes", "No", "Occasionally"] },
      { id: "3", question: "Is the pain worse in the morning?", options: ["Yes", "No", "Sometimes"] },
    ],
    conditions: [
      { name: "Muscle Strain", probability: "high", description: "Overstretched or torn back muscles", recommendations: ["Apply ice/heat", "Gentle stretching", "Rest and avoid heavy lifting"] },
      { name: "Herniated Disc", probability: "low", description: "Disc material pressing on nerves", recommendations: ["Physical therapy", "Pain management", "Consult an orthopedist"] },
    ],
  },
  {
    id: "left-arm",
    name: "Left Arm",
    position: { x: 25, y: 40 },
    questions: [
      { id: "1", question: "Do you have pain or numbness in your arm?", options: ["Yes", "No", "Sometimes"] },
      { id: "2", question: "Do you experience weakness?", options: ["Yes", "No", "Occasionally"] },
    ],
    conditions: [
      { name: "Muscle Fatigue", probability: "high", description: "Tired muscles from overuse", recommendations: ["Rest the arm", "Gentle massage", "Gradual return to activity"] },
      { name: "Nerve Compression", probability: "low", description: "Pinched nerve causing symptoms", recommendations: ["Physical therapy", "Avoid repetitive motions", "Consult a specialist"] },
    ],
  },
  {
    id: "right-arm",
    name: "Right Arm",
    position: { x: 75, y: 40 },
    questions: [
      { id: "1", question: "Do you have pain or numbness in your arm?", options: ["Yes", "No", "Sometimes"] },
      { id: "2", question: "Do you experience weakness?", options: ["Yes", "No", "Occasionally"] },
    ],
    conditions: [
      { name: "Muscle Fatigue", probability: "high", description: "Tired muscles from overuse", recommendations: ["Rest the arm", "Gentle massage", "Gradual return to activity"] },
      { name: "Carpal Tunnel", probability: "medium", description: "Nerve compression in the wrist", recommendations: ["Wear a wrist splint", "Take breaks from repetitive tasks", "Ergonomic adjustments"] },
    ],
  },
  {
    id: "left-leg",
    name: "Left Leg",
    position: { x: 40, y: 75 },
    questions: [
      { id: "1", question: "Do you have leg pain or cramps?", options: ["Yes", "No", "Sometimes"] },
      { id: "2", question: "Do you notice swelling?", options: ["Yes", "No", "Occasionally"] },
    ],
    conditions: [
      { name: "Muscle Cramps", probability: "high", description: "Involuntary muscle contractions", recommendations: ["Stay hydrated", "Stretch regularly", "Ensure adequate potassium intake"] },
      { name: "Poor Circulation", probability: "low", description: "Reduced blood flow to extremities", recommendations: ["Regular exercise", "Elevate legs when resting", "Consult a vascular specialist"] },
    ],
  },
  {
    id: "right-leg",
    name: "Right Leg",
    position: { x: 60, y: 75 },
    questions: [
      { id: "1", question: "Do you have leg pain or cramps?", options: ["Yes", "No", "Sometimes"] },
      { id: "2", question: "Do you notice swelling?", options: ["Yes", "No", "Occasionally"] },
    ],
    conditions: [
      { name: "Muscle Cramps", probability: "high", description: "Involuntary muscle contractions", recommendations: ["Stay hydrated", "Stretch regularly", "Ensure adequate potassium intake"] },
      { name: "Sciatica", probability: "medium", description: "Pain along the sciatic nerve", recommendations: ["Physical therapy", "Hot/cold therapy", "Avoid prolonged sitting"] },
    ],
  },
];

export default function DiagnosisPage() {
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  
  const handlePartClick = (part: BodyPart) => {
    setSelectedPart(part);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };
  
  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (selectedPart && currentQuestion < selectedPart.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };
  
  const closePanel = () => {
    setSelectedPart(null);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };
  
  const getProbabilityColor = (prob: string) => {
    switch (prob) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Interactive Body Diagnosis</h1>
        <p className="text-muted-foreground mt-1">
          Click on any body part to start a symptom assessment
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3D Body Diagram */}
        <motion.div
          className="relative bg-white rounded-2xl border border-border p-8 min-h-[600px]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            3D Muscle Anatomy - Click any muscle group
          </h3>
          
          <MuscleAnatomy3D 
            onPartClick={(id: string) => {
              const part = bodyParts.find(p => p.id === id);
              if (part) handlePartClick(part);
            }}
            selectedPart={selectedPart?.id || null}
          />
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Drag to rotate • Scroll to zoom • Click muscles to diagnose
          </p>
        </motion.div>
        
        {/* Diagnosis Panel */}
        <AnimatePresence mode="wait">
          {selectedPart ? (
            <motion.div
              key="panel"
              className="bg-white rounded-2xl border border-border p-6 h-fit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {selectedPart.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedPart.name}</h3>
                    <p className="text-sm text-muted-foreground">Symptom Assessment</p>
                  </div>
                </div>
                <button
                  onClick={closePanel}
                  className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              {!showResults ? (
                <>
                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>Question {currentQuestion + 1} of {selectedPart.questions.length}</span>
                      <span>{Math.round(((currentQuestion + 1) / selectedPart.questions.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#0066FF]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestion + 1) / selectedPart.questions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  
                  {/* Question */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-foreground mb-4">
                      {selectedPart.questions[currentQuestion].question}
                    </h4>
                    <div className="space-y-3">
                      {selectedPart.questions[currentQuestion].options.map((option) => (
                        <motion.button
                          key={option}
                          className="w-full p-4 rounded-xl border border-border text-left hover:border-[#0066FF] hover:bg-[#0066FF]/5 transition-colors flex items-center justify-between group"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleAnswer(selectedPart.questions[currentQuestion].id, option)}
                        >
                          <span className="font-medium text-foreground">{option}</span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#0066FF]" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Results */
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Assessment Complete</span>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Possible Conditions</h4>
                    <div className="space-y-4">
                      {selectedPart.conditions.map((condition, index) => (
                        <motion.div
                          key={condition.name}
                          className="p-4 rounded-xl border border-border"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-foreground">{condition.name}</h5>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getProbabilityColor(condition.probability)}`}>
                              {condition.probability.toUpperCase()} PROBABILITY
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{condition.description}</p>
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">Recommendations:</p>
                            <ul className="space-y-1">
                              {condition.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF] mt-1.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Medical Disclaimer</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          This is not a medical diagnosis. Please consult a healthcare professional for accurate assessment and treatment.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={closePanel}
                    className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white"
                  >
                    Start New Assessment
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              className="bg-white rounded-2xl border border-border p-8 flex flex-col items-center justify-center text-center min-h-[400px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 rounded-full bg-[#0066FF]/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-[#0066FF]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Select a Body Part
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Click on any body part in the diagram to begin a symptom assessment and receive possible condition analysis.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
