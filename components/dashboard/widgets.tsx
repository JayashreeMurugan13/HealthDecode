"use client";

import { motion } from "framer-motion";
import { FileText, AlertTriangle, Heart, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down";
  trendValue?: string;
  color: string;
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, trend, trendValue, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="p-6 rounded-2xl bg-white border border-border shadow-sm hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
      <p className="text-muted-foreground text-sm">{title}</p>
    </motion.div>
  );
}

export function HealthScoreWidget({ score = 80 }: { score?: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "#22C55E";
    if (s >= 60) return "#EAB308";
    return "#EF4444";
  };
  
  return (
    <motion.div
      className="p-6 rounded-2xl bg-white border border-border shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Health Score</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="12"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={getScoreColor(score)}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={440}
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: 440 - (440 * score) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-bold"
              style={{ color: getScoreColor(score) }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-muted-foreground text-sm">/ 100</span>
          </div>
        </div>
      </div>
      <p className="text-center text-muted-foreground mt-4">
        {score >= 80 ? "Excellent Health" : score >= 60 ? "Good Health" : "Needs Attention"}
      </p>
    </motion.div>
  );
}

export function BloodSugarChart() {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    // Get health metrics from localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        const userId = user.id;
        const key = `health_metrics_${userId}`;
        const metrics = JSON.parse(localStorage.getItem(key) || '[]');
        const bloodSugarMetrics = metrics.filter((m: any) => m.type === 'blood_sugar');
        
        if (bloodSugarMetrics.length > 0) {
          const chartData = bloodSugarMetrics.map((m: any) => ({
            date: new Date(m.date).toLocaleDateString('en-US', { month: 'short' }),
            value: m.value,
          }));
          setData(chartData);
        }
      } catch (error) {
        console.error('Error loading blood sugar data:', error);
      }
    }
  }, []);
  
  const displayData = data.length > 0 ? data : [
    { date: "Upload", value: 0 },
    { date: "Report", value: 0 },
  ];
  
  return (
    <motion.div
      className="p-6 rounded-2xl bg-white border border-border shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Blood Sugar Trends</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="bloodSugarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} domain={data.length > 0 ? ['auto', 'auto'] : [0, 150]} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: 12, 
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#0066FF" 
              strokeWidth={3}
              fill="url(#bloodSugarGradient)"
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-muted-foreground">Normal Range: 70-100 mg/dL</span>
        {data.length > 0 ? (
          <span className={`font-medium ${
            data[data.length - 1].value > 100 ? 'text-orange-600' : 
            data[data.length - 1].value < 70 ? 'text-red-600' : 
            'text-green-600'
          }`}>
            Latest: {data[data.length - 1].value} mg/dL
          </span>
        ) : (
          <span className="text-muted-foreground">No data yet</span>
        )}
      </div>
    </motion.div>
  );
}

export function CholesterolChart() {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    // Get health metrics from localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        const userId = user.id;
        const key = `health_metrics_${userId}`;
        const metrics = JSON.parse(localStorage.getItem(key) || '[]');
        const cholesterolMetrics = metrics.filter((m: any) => m.type === 'cholesterol');
        
        if (cholesterolMetrics.length > 0) {
          const chartData = cholesterolMetrics.map((m: any) => ({
            date: new Date(m.date).toLocaleDateString('en-US', { month: 'short' }),
            value: m.value,
          }));
          setData(chartData);
        }
      } catch (error) {
        console.error('Error loading cholesterol data:', error);
      }
    }
  }, []);
  
  const displayData = data.length > 0 ? data : [
    { date: "Upload", value: 0 },
    { date: "Report", value: 0 },
  ];
  
  return (
    <motion.div
      className="p-6 rounded-2xl bg-white border border-border shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Cholesterol Levels</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="cholesterolGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00B5AD" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00B5AD" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} domain={data.length > 0 ? ['auto', 'auto'] : [0, 250]} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: 12, 
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#00B5AD" 
              strokeWidth={3}
              fill="url(#cholesterolGradient)"
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-muted-foreground">Desirable: {"<"} 200 mg/dL</span>
        {data.length > 0 ? (
          <span className={`font-medium ${
            data[data.length - 1].value >= 240 ? 'text-red-600' : 
            data[data.length - 1].value >= 200 ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            Latest: {data[data.length - 1].value} mg/dL
          </span>
        ) : (
          <span className="text-muted-foreground">No data yet</span>
        )}
      </div>
    </motion.div>
  );
}

export function BloodPressureChart() {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    // Get health metrics from localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        const userId = user.id;
        const key = `health_metrics_${userId}`;
        const metrics = JSON.parse(localStorage.getItem(key) || '[]');
        const bpMetrics = metrics.filter((m: any) => m.type === 'blood_pressure');
        
        if (bpMetrics.length > 0) {
          const chartData = bpMetrics.map((m: any) => ({
            date: new Date(m.date).toLocaleDateString('en-US', { month: 'short' }),
            systolic: m.systolic,
            diastolic: m.diastolic,
          }));
          setData(chartData);
        }
      } catch (error) {
        console.error('Error loading blood pressure data:', error);
      }
    }
  }, []);
  
  const displayData = data.length > 0 ? data : [
    { date: "Upload", systolic: 0, diastolic: 0 },
    { date: "Report", systolic: 0, diastolic: 0 },
  ];
  
  return (
    <motion.div
      className="p-6 rounded-2xl bg-white border border-border shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Blood Pressure History</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} domain={data.length > 0 ? ['auto', 'auto'] : [0, 180]} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: 12, 
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
            />
            <Line 
              type="monotone" 
              dataKey="systolic" 
              stroke="#EF4444" 
              strokeWidth={3}
              dot={{ fill: "#EF4444", strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
              name="Systolic"
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
            <Line 
              type="monotone" 
              dataKey="diastolic" 
              stroke="#0066FF" 
              strokeWidth={3}
              dot={{ fill: "#0066FF", strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
              name="Diastolic"
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Systolic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#0066FF]" />
          <span className="text-muted-foreground">Diastolic</span>
        </div>
      </div>
    </motion.div>
  );
}

export function LatestReportSummary() {
  const [report, setReport] = useState<any>(null);
  
  useEffect(() => {
    // Get latest report from localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        const userId = user.id;
        const key = `reports_${userId}`;
        const reports = JSON.parse(localStorage.getItem(key) || '[]');
        
        if (reports.length > 0) {
          // Sort by upload date and get the latest
          const sortedReports = reports.sort((a: any, b: any) => 
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
          );
          setReport(sortedReports[0]);
        }
      } catch (error) {
        console.error('Error loading latest report:', error);
      }
    }
  }, []);
  
  if (!report) {
    return (
      <motion.div
        className="p-6 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h3 className="text-lg font-semibold mb-4">Latest Report Summary</h3>
        <p className="text-white/70">No reports uploaded yet. Upload your first medical report to see analysis here.</p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      className="p-6 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <h3 className="text-lg font-semibold mb-4">Latest Report Summary</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium">{report.fileName}</p>
            <p className="text-sm text-white/70">Uploaded: {new Date(report.uploadDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
          <p className="text-sm leading-relaxed">
            {report.aiSummary || 'Analysis complete. Check the detailed report for more information.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-300" />
          <span className="text-sm text-yellow-100">{report.abnormalCount} values need attention</span>
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardStats({ totalReports = 0, abnormalFindings = 0 }: { totalReports?: number; abnormalFindings?: number }) {
  const [healthScore, setHealthScore] = useState(100);
  
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setHealthScore(user.healthScore || 100);
    }
  }, []);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Reports Uploaded"
        value={totalReports}
        icon={FileText}
        trend="up"
        trendValue={totalReports > 0 ? `+${Math.min(3, totalReports)} this month` : "No reports"}
        color="#0066FF"
        delay={0}
      />
      <StatCard
        title="Abnormal Findings"
        value={abnormalFindings}
        icon={AlertTriangle}
        trend={abnormalFindings > 0 ? "down" : undefined}
        trendValue={abnormalFindings > 0 ? "-2 from last" : undefined}
        color="#EAB308"
        delay={0.1}
      />
      <StatCard
        title="Health Score"
        value={`${healthScore}/100`}
        icon={Heart}
        trend="up"
        trendValue="+5 points"
        color="#22C55E"
        delay={0.2}
      />
      <StatCard
        title="Next Checkup"
        value="15 Days"
        icon={Heart}
        color="#00B5AD"
        delay={0.25}
      />
    </div>
  );
}
