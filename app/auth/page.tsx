"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { clientAuth } from "@/lib/client-auth";

// Floating Particles Background - using fixed positions to avoid hydration mismatch
const ParticlesBackground = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden" />;
  }
  
  // Fixed positions for particles to avoid hydration mismatch
  const particles = [
    { x: 10, y: 15, duration: 12 }, { x: 85, y: 25, duration: 15 },
    { x: 20, y: 70, duration: 18 }, { x: 75, y: 80, duration: 14 },
    { x: 50, y: 10, duration: 16 }, { x: 30, y: 45, duration: 13 },
    { x: 90, y: 55, duration: 17 }, { x: 15, y: 90, duration: 11 },
    { x: 60, y: 35, duration: 19 }, { x: 45, y: 85, duration: 12 },
    { x: 5, y: 50, duration: 14 }, { x: 70, y: 5, duration: 16 },
    { x: 35, y: 60, duration: 15 }, { x: 80, y: 40, duration: 13 },
    { x: 25, y: 20, duration: 18 }, { x: 55, y: 75, duration: 11 },
    { x: 95, y: 30, duration: 17 }, { x: 40, y: 95, duration: 14 },
    { x: 65, y: 65, duration: 12 }, { x: 12, y: 38, duration: 16 },
  ];
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#0066FF]/20"
          style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, signup, user } = useAuth();
  
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "signup" || modeParam === "login") {
      setMode(modeParam);
    }
  }, [searchParams]);
  
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }
        if (!name.trim()) {
          setError("Please enter your name");
          setIsLoading(false);
          return;
        }
        
        // Use client-side auth
        clientAuth.signup(email, password, name);
        router.push('/dashboard');
      } else {
        // Use client-side auth
        clientAuth.login(email, password);
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message);
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E6F0FF] via-white to-[#E0F7FA] relative overflow-hidden">
      <ParticlesBackground />
      
      {/* Decorative Circles */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#0066FF]/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-[#00B5AD]/10 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <motion.div
            className="w-12 h-12 rounded-xl bg-[#0066FF] flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Heart className="w-6 h-6 text-white" />
          </motion.div>
          <span className="text-2xl font-bold text-foreground">
            Health<span className="text-[#0066FF]">Decode</span>
          </span>
        </Link>
        
        {/* Auth Card */}
        <motion.div
          className="glass-card p-8 rounded-3xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Tab Switcher */}
          <div className="flex bg-secondary rounded-xl p-1 mb-8">
            <button
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
                mode === "login"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Login
            </button>
            <button
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
                mode === "signup"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => { setMode("signup"); setError(""); }}
            >
              Sign Up
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-border/50 focus:border-[#0066FF] focus:ring-[#0066FF]/20 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-xl border-border/50 focus:border-[#0066FF] focus:ring-[#0066FF]/20 transition-all"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-foreground mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-xl border-border/50 focus:border-[#0066FF] focus:ring-[#0066FF]/20 transition-all"
                />
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="confirm-password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground mb-2 block">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-border/50 focus:border-[#0066FF] focus:ring-[#0066FF]/20 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-xl font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Login" : "Create Account"}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
          
          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? (
              <>
                {"Don't have an account? "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-[#0066FF] hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-[#0066FF] hover:underline font-medium"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </motion.div>
        
        {/* Security Badge */}
        <motion.div
          className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Lock className="w-4 h-4" />
          <span>Secured with 256-bit encryption</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E6F0FF] via-white to-[#E0F7FA]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0066FF]" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
