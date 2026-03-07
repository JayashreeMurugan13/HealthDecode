"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, Play, LogIn, Heart, Dna, Stethoscope, Cross, Activity } from "lucide-react";
import Link from "next/link";

// Animated ECG/Heartbeat Line
const HeartbeatLine = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0,100 L200,100 L230,100 L250,60 L270,140 L290,20 L310,180 L330,100 L360,100 L600,100 L630,100 L650,60 L670,140 L690,20 L710,180 L730,100 L760,100 L1000,100 L1030,100 L1050,60 L1070,140 L1090,20 L1110,180 L1130,100 L1160,100 L1200,100"
        fill="none"
        stroke="#0066FF"
        strokeWidth="3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
};

// Floating DNA Helix
const DNAHelix = () => {
  return (
    <motion.div
      className="absolute right-10 top-1/4 w-32 h-64 opacity-20"
      animate={{ rotateY: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 100 200" className="w-full h-full">
        {[...Array(10)].map((_, i) => (
          <g key={i}>
            <motion.circle
              cx={50 + 30 * Math.sin(i * 0.6)}
              cy={i * 20 + 10}
              r="6"
              fill="#0066FF"
              animate={{
                cx: [50 + 30 * Math.sin(i * 0.6), 50 - 30 * Math.sin(i * 0.6)],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.1,
              }}
            />
            <motion.circle
              cx={50 - 30 * Math.sin(i * 0.6)}
              cy={i * 20 + 10}
              r="6"
              fill="#00B5AD"
              animate={{
                cx: [50 - 30 * Math.sin(i * 0.6), 50 + 30 * Math.sin(i * 0.6)],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.1,
              }}
            />
            <motion.line
              x1={50 + 30 * Math.sin(i * 0.6)}
              y1={i * 20 + 10}
              x2={50 - 30 * Math.sin(i * 0.6)}
              y2={i * 20 + 10}
              stroke="#0066FF"
              strokeWidth="2"
              opacity={0.5}
            />
          </g>
        ))}
      </svg>
    </motion.div>
  );
};

// Floating Medical Icons
const FloatingIcon = ({ 
  icon: Icon, 
  className, 
  delay = 0 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  className: string; 
  delay?: number;
}) => {
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={{ y: 0, opacity: 0.3 }}
      animate={{ 
        y: [-10, 10, -10],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <Icon className="w-8 h-8 text-[#0066FF]/30" />
    </motion.div>
  );
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#E6F0FF] to-white">
      {/* Background Elements */}
      <HeartbeatLine />
      <DNAHelix />
      
      {/* Floating Icons */}
      <FloatingIcon icon={Stethoscope} className="left-[10%] top-[20%]" delay={0} />
      <FloatingIcon icon={Heart} className="right-[15%] top-[30%]" delay={0.5} />
      <FloatingIcon icon={Dna} className="left-[20%] bottom-[30%]" delay={1} />
      <FloatingIcon icon={Cross} className="right-[10%] bottom-[20%]" delay={1.5} />
      <FloatingIcon icon={Activity} className="left-[5%] top-[50%]" delay={2} />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated Heart Icon */}
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0066FF]/10 mb-8"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Heart className="w-10 h-10 text-[#0066FF] animate-heartbeat" />
          </motion.div>
          
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Understand Your{" "}
            <span className="text-[#0066FF]">Medical Reports</span>{" "}
            in Seconds
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-10 text-balance max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            AI-powered medical report analysis with clear explanations and personalized health insights
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/auth?mode=signup">
              <Button
                size="lg"
                className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ripple"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Report
              </Button>
            </Link>
            
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/10 px-8 py-6 text-lg rounded-full"
              >
                <Play className="w-5 h-5 mr-2" />
                Try Demo
              </Button>
            </Link>
            
            <Link href="/auth?mode=login">
              <Button
                size="lg"
                variant="ghost"
                className="text-[#0066FF] hover:bg-[#0066FF]/10 px-8 py-6 text-lg rounded-full"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Login
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 1.5, duration: 0.5 },
            y: { delay: 1.5, duration: 1.5, repeat: Infinity }
          }}
        >
          <div className="w-6 h-10 border-2 border-[#0066FF]/30 rounded-full flex items-start justify-center p-1">
            <motion.div
              className="w-1.5 h-3 bg-[#0066FF] rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
