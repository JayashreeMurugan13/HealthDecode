"use client";

import { motion } from "framer-motion";
import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export function DashboardHeader() {
  const { user } = useAuth();
  const [hasNotifications] = useState(true);
  
  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search reports, health data..."
          className="pl-10 h-11 rounded-xl border-border/50 bg-secondary/50 focus:bg-white transition-colors"
        />
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <motion.button
          className="relative w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Health Score: 80/100 - Good Health"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {hasNotifications && (
            <motion.span
              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>
        
        {/* User Avatar */}
        <motion.div
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary transition-colors cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-10 h-10 rounded-full bg-[#0066FF]/10 flex items-center justify-center">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-[#0066FF]" />
            )}
          </div>
          <div className="hidden md:block">
            <p className="font-medium text-foreground text-sm">{user?.name || "Guest"}</p>
            <p className="text-xs text-muted-foreground">Patient</p>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
