"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { 
  FileSearch, 
  AlertCircle, 
  BookOpen, 
  User, 
  MessageCircle, 
  Clock 
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "AI Medical Report Analyzer",
    description: "Advanced AI that reads and understands complex medical reports, extracting key information instantly.",
    gradient: "from-[#0066FF] to-[#0052CC]",
  },
  {
    icon: AlertCircle,
    title: "Abnormal Value Detection",
    description: "Automatically highlights values outside normal ranges with color-coded severity indicators.",
    gradient: "from-[#EAB308] to-[#CA8A04]",
  },
  {
    icon: BookOpen,
    title: "Medical Term Explanation",
    description: "Complex medical terminology translated into simple, easy-to-understand language.",
    gradient: "from-[#00B5AD] to-[#009688]",
  },
  {
    icon: User,
    title: "Interactive 3D Body Diagnosis",
    description: "Explore a 3D human body model to understand where symptoms originate and what they mean.",
    gradient: "from-[#0066FF] to-[#00B5AD]",
  },
  {
    icon: MessageCircle,
    title: "AI Medical Chatbot",
    description: "Ask questions about your health, get explanations, and receive personalized advice 24/7.",
    gradient: "from-[#22C55E] to-[#16A34A]",
  },
  {
    icon: Clock,
    title: "Personal Health Timeline",
    description: "Track your health metrics over time with beautiful visualizations and trend analysis.",
    gradient: "from-[#0066FF] to-[#6366F1]",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      className="group relative"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="relative p-8 rounded-2xl bg-white border border-border/50 h-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#0066FF]/10 hover:-translate-y-2">
        {/* Gradient Background on Hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
        
        {/* Glow Effect */}
        <motion.div
          className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
        />
        
        {/* Icon */}
        <motion.div
          className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <feature.icon className="w-7 h-7 text-white" />
        </motion.div>
        
        {/* Content */}
        <h3 className="text-xl font-semibold text-foreground mb-3 relative">
          {feature.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed relative">
          {feature.description}
        </p>
        
        {/* Arrow on Hover */}
        <motion.div
          className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
        >
          <svg 
            className="w-5 h-5 text-[#0066FF]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
  
  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#E6F0FF]/30 relative overflow-hidden">
      {/* Decorative Elements */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#0066FF]/5 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#00B5AD]/5 blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      
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
            className="inline-block px-4 py-1.5 bg-[#00B5AD]/10 text-[#00B5AD] rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
          >
            Powerful Features
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to understand, track, and improve your health
          </p>
        </motion.div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
