"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, AlertTriangle, CheckCircle, Search, Filter, Eye, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Report {
  id: string;
  fileName: string;
  uploadDate: string;
  reportType: string;
  status: "normal" | "attention" | "critical";
  abnormalCount: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "normal" | "attention">("all");
  
  useEffect(() => {
    fetchReports();
  }, []);
  
  const fetchReports = async () => {
    try {
      // Get reports from localStorage instead of API
      const userId = getCurrentUserId();
      if (userId) {
        const key = `reports_${userId}`;
        const storedReports = JSON.parse(localStorage.getItem(key) || '[]');
        
        const formattedReports = storedReports.map((r: any) => ({
          id: r.id,
          fileName: r.fileName,
          uploadDate: new Date(r.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          reportType: r.reportType || 'Blood Test',
          status: r.abnormalCount > 0 ? 'attention' : 'normal',
          abnormalCount: r.abnormalCount || 0,
        }));
        setReports(formattedReports);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getCurrentUserId = () => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch (error) {
        return null;
      }
    }
    return null;
  };
  
  const deleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      // Delete from localStorage
      const userId = getCurrentUserId();
      if (userId) {
        const key = `reports_${userId}`;
        const storedReports = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = storedReports.filter((r: any) => r.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
        setReports(reports.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };
  
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reportType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || report.status === filter;
    return matchesSearch && matchesFilter;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-green-100 text-green-700";
      case "attention": return "bg-yellow-100 text-yellow-700";
      case "critical": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal": return CheckCircle;
      case "attention": return AlertTriangle;
      case "critical": return AlertTriangle;
      default: return FileText;
    }
  };
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">My Reports</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your uploaded medical reports
        </p>
      </motion.div>
      
      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={`rounded-xl ${filter === "all" ? "bg-[#0066FF]" : ""}`}
          >
            All
          </Button>
          <Button
            variant={filter === "normal" ? "default" : "outline"}
            onClick={() => setFilter("normal")}
            className={`rounded-xl ${filter === "normal" ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Normal
          </Button>
          <Button
            variant={filter === "attention" ? "default" : "outline"}
            onClick={() => setFilter("attention")}
            className={`rounded-xl ${filter === "attention" ? "bg-yellow-600 hover:bg-yellow-700" : ""}`}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Needs Attention
          </Button>
        </div>
      </motion.div>
      
      {/* Reports Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report, index) => {
          const StatusIcon = getStatusIcon(report.status);
          return (
            <motion.div
              key={report.id}
              className="p-5 rounded-2xl bg-white border border-border hover:shadow-lg transition-all duration-300 cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#0066FF]/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#0066FF]" />
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  <StatusIcon className="w-3 h-3" />
                  {report.status === "normal" ? "Normal" : "Attention"}
                </span>
              </div>
              
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-[#0066FF] transition-colors">
                {report.fileName}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{report.reportType}</p>
              
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {report.uploadDate}
                </div>
                {report.abnormalCount > 0 && (
                  <span className="text-sm text-yellow-600 font-medium">
                    {report.abnormalCount} abnormal
                  </span>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant="ghost"
                  className="flex-1 text-[#0066FF] hover:bg-[#0066FF]/10"
                  onClick={() => window.location.href = `/dashboard/reports/${report.id}`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  onClick={(e) => deleteReport(report.id, e)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}
      
      {!loading && filteredReports.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No reports found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}
    </div>
  );
}
