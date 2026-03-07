"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MedicalTooltip } from "@/components/ui/medical-tooltip";

export default function TimelinePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchReports();
  }, []);
  
  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.success) {
        setReports(data.reports.sort((a: any, b: any) => 
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getTrend = (param: string, currentValue: number, index: number) => {
    if (index === reports.length - 1) return null;
    const prevReport = reports[index + 1];
    const prevParam = prevReport?.extractedData?.parameters?.find((p: any) => p.parameter === param);
    if (!prevParam) return null;
    
    const diff = currentValue - prevParam.result;
    if (Math.abs(diff) < 0.1) return { icon: Minus, color: 'text-gray-500', text: 'Stable' };
    if (diff > 0) return { icon: TrendingUp, color: 'text-blue-500', text: 'Increasing' };
    return { icon: TrendingDown, color: 'text-blue-500', text: 'Decreasing' };
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Reports Yet</h3>
        <p className="text-muted-foreground">Upload your first medical report to see your health timeline</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Health Timeline</h1>
        <p className="text-muted-foreground mt-1">Your medical report history</p>
      </motion.div>
      
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-6">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              className="relative flex gap-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-[#0066FF]/10 border-2 border-[#0066FF]">
                <FileText className="w-5 h-5 text-[#0066FF]" />
              </div>
              
              <div className="flex-1 p-5 rounded-2xl bg-white border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{report.fileName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{report.aiSummary?.substring(0, 100)}...</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(report.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                
                {/* Blood Test Parameters */}
                {report.extractedData?.parameters && report.extractedData.parameters.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Blood Test Results</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {report.extractedData.parameters.slice(0, 4).map((param: any) => {
                        const trend = getTrend(param.parameter, param.result, index);
                        return (
                          <div key={param.parameter}>
                            <p className="text-sm text-muted-foreground">
                              <MedicalTooltip term={param.parameter.toLowerCase().split(' ')[0]}>
                                {param.parameter}
                              </MedicalTooltip>
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">{param.result} {param.unit}</p>
                              {trend && (
                                <span className={`flex items-center gap-1 text-xs ${trend.color}`}>
                                  <trend.icon className="w-3 h-3" />
                                  {trend.text}
                                </span>
                              )}
                            </div>
                            <span className={`text-xs ${
                              param.status === 'normal' ? 'text-green-600' :
                              param.status === 'low' ? 'text-yellow-600' :
                              param.status === 'high' ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              {param.status.toUpperCase()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Clinical Findings */}
                {report.extractedData?.clinicalFindings && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Clinical Summary</h4>
                    {report.extractedData.clinicalFindings.vitalSigns && Object.keys(report.extractedData.clinicalFindings.vitalSigns).length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {Object.entries(report.extractedData.clinicalFindings.vitalSigns).slice(0, 4).map(([key, value]: [string, any]) => (
                          <div key={key} className="text-sm">
                            <span className="text-muted-foreground">{key}:</span>
                            <span className="ml-2 font-medium text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {report.extractedData.clinicalFindings.diagnosis && report.extractedData.clinicalFindings.diagnosis.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {report.extractedData.clinicalFindings.diagnosis.slice(0, 3).map((diag: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700 border border-blue-200">
                            {diag.substring(0, 40)}{diag.length > 40 ? '...' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Radiology Findings */}
                {report.extractedData?.radiologyFindings && report.extractedData.radiologyFindings.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Radiology Findings</h4>
                    <div className="space-y-2">
                      {report.extractedData.radiologyFindings.slice(0, 3).map((finding: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{finding.anatomy}: {finding.finding}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            finding.severity === 'normal' ? 'bg-green-100 text-green-700' :
                            finding.severity === 'mild' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {finding.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Medications */}
                {report.extractedData?.medications && report.extractedData.medications.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Medications</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.extractedData.medications.slice(0, 4).map((med: any, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-md text-xs bg-purple-50 text-purple-700 border border-purple-200">
                          {med.name} - {med.dosage}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
