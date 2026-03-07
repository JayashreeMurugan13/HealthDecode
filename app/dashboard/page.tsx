"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";
import {
  DashboardStats,
  HealthScoreWidget,
  BloodSugarChart,
  CholesterolChart,
  BloodPressureChart,
  LatestReportSummary,
} from "@/components/dashboard/widgets";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalReports: 0, abnormalFindings: 0, healthScore: 100 });
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      // Get reports from localStorage instead of API
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        const userId = user.id;
        const key = `reports_${userId}`;
        const reports = JSON.parse(localStorage.getItem(key) || '[]');
        
        const totalReports = reports.length;
        const abnormalFindings = reports.reduce((sum: number, r: any) => sum + (r.abnormalCount || 0), 0);
        let healthScore = user.healthScore || 100;
        if (totalReports > 0) {
          const avgAbnormal = abnormalFindings / totalReports;
          healthScore = Math.max(50, Math.round(100 - (avgAbnormal * 10)));
          
          // Update user's health score in localStorage
          user.healthScore = healthScore;
          localStorage.setItem('currentUser', JSON.stringify(user));
          const usersData = localStorage.getItem('users');
          const users = usersData ? JSON.parse(usersData) : [];
          const userIndex = users.findIndex((u: any) => u.id === userId);
          if (userIndex !== -1) {
            users[userIndex].healthScore = healthScore;
            localStorage.setItem('users', JSON.stringify(users));
          }
        }
        setStats({ totalReports, abnormalFindings, healthScore });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, <span className="text-[#0066FF]">{user?.name || "User"}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {"Here's an overview of your health data"}
        </p>
      </motion.div>
      
      {/* Stats Grid */}
      <DashboardStats totalReports={stats.totalReports} abnormalFindings={stats.abnormalFindings} />
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BloodSugarChart />
        </div>
        <HealthScoreWidget score={stats.healthScore} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CholesterolChart />
        <BloodPressureChart />
      </div>
      
      {/* Latest Report Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LatestReportSummary />
        </div>
        <motion.div
          className="p-6 rounded-2xl bg-white border border-border shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a
              href="/dashboard/upload"
              className="flex items-center gap-3 p-3 rounded-xl bg-[#0066FF]/5 hover:bg-[#0066FF]/10 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#0066FF] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span className="font-medium text-foreground group-hover:text-[#0066FF] transition-colors">
                Upload New Report
              </span>
            </a>
            <a
              href="/dashboard/chatbot"
              className="flex items-center gap-3 p-3 rounded-xl bg-[#00B5AD]/5 hover:bg-[#00B5AD]/10 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#00B5AD] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="font-medium text-foreground group-hover:text-[#00B5AD] transition-colors">
                Ask AI Assistant
              </span>
            </a>
            <a
              href="/dashboard/diagnosis"
              className="flex items-center gap-3 p-3 rounded-xl bg-[#EAB308]/5 hover:bg-[#EAB308]/10 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#EAB308] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-medium text-foreground group-hover:text-[#EAB308] transition-colors">
                Body Diagnosis
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
