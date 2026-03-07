"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Upload, FileText, Brain, AlertTriangle, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Medical Report",
    description: "Simply drag and drop your medical report PDF or image",
    color: "#0066FF",
  },
  {
    icon: FileText,
    title: "OCR Text Extraction",
    description: "Our AI extracts all text and values from your report",
    color: "#00B5AD",
  },
  {
    icon: Brain,
    title: "AI Medical Analysis",
    description: "Advanced AI analyzes your report using medical knowledge",
    color: "#0066FF",
  },
  {
    icon: AlertTriangle,
    title: "Abnormality Detection",
    description: "Identifies values outside normal ranges instantly",
    color: "#EAB308",
  },
  {
    icon: MessageSquare,
    title: "Patient-Friendly Explanation",
    description: "Get clear, easy-to-understand explanations",
    color: "#22C55E",
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      {/* Connector Line */}
      {index < steps.length - 1 && (
        <motion.div
          className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
          style={{ 
            background: `linear-gradient(90deg, ${step.color}, ${steps[index + 1].color})`,
            transformOrigin: "left",
          }}
        />
      )}
      
      {/* Step Number */}
      <motion.div
        className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-sm font-bold z-10"
        style={{ color: step.color, border: `2px solid ${step.color}` }}
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.4, delay: index * 0.15 + 0.2 }}
      >
        {index + 1}
      </motion.div>
      
      {/* Icon Container */}
      <motion.div
        className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 glass-card"
        style={{ backgroundColor: `${step.color}15` }}
        whileHover={{ 
          scale: 1.1, 
          boxShadow: `0 20px 40px ${step.color}30`,
        }}
        transition={{ duration: 0.3 }}
      >
        <step.icon className="w-12 h-12" style={{ color: step.color }} />
      </motion.div>
      
      {/* Content */}
      <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
        {step.title}
      </h3>
      <p className="text-muted-foreground text-center max-w-[200px]">
        {step.description}
      </p>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
  
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0066FF" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-block px-4 py-1.5 bg-[#0066FF]/10 text-[#0066FF] rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
          >
            Simple Process
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From upload to understanding - your medical report analyzed in 5 simple steps
          </p>
        </motion.div>
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
