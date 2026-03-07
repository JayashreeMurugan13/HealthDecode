"use client";

import { motion } from "framer-motion";
import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export function DashboardHeader() {
  const [user, setUser] = useState<any>(null);
  const [hasNotifications] = useState(true);
  
  useEffect(() => {
    // Get user from localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        setUser(JSON.parse(currentUser));
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
  }, []);
  
  return (
    <header className="h-14 sm:h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6">
      {/* Search Bar */}
      <div className="relative max-w-md flex-1 mr-2 sm:mr-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="pl-9 sm:pl-10 h-9 sm:h-11 rounded-xl border-border/50 bg-secondary/50 focus:bg-white transition-colors text-sm"
        />
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <motion.button
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Health Score: 80/100 - Good Health"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          {hasNotifications && (
            <motion.span
              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 rounded-full bg-red-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>
        
        {/* User Avatar */}
        <motion.div
          className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-secondary transition-colors cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0066FF]/10 flex items-center justify-center flex-shrink-0">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#0066FF]" />
            )}
          </div>
          <div className="hidden md:block">
            <p className="font-medium text-foreground text-sm">{user?.name || "Loading..."}</p>
            <p className="text-xs text-muted-foreground">Patient</p>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
