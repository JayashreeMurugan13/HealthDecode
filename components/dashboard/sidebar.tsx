"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Clock, 
  User as UserIcon, 
  MessageCircle, 
  Heart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Upload, label: "Upload Report", href: "/dashboard/upload" },
  { icon: FileText, label: "My Reports", href: "/dashboard/reports" },
  { icon: Clock, label: "Health Timeline", href: "/dashboard/timeline" },
  { icon: UserIcon, label: "Body Diagnosis", href: "/dashboard/diagnosis" },
  { icon: MessageCircle, label: "AI Chatbot", href: "/dashboard/chatbot" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useAuth();
  
  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-border z-40 flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Heart className="w-5 h-5 text-white" />
          </motion.div>
          {!isCollapsed && (
            <motion.span
              className="text-lg font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Health<span className="text-[#0066FF]">Decode</span>
            </motion.span>
          )}
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/30"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-current"
                  )} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <motion.div
                      className="ml-auto w-2 h-2 rounded-full bg-white"
                      layoutId="activeIndicator"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Section */}
      <div className="p-4 border-t border-border">
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#0066FF]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#0066FF]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
      
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </motion.aside>
  );
}
