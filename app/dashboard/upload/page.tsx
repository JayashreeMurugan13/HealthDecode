"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Brain,
  FileSearch,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MedicalTooltip } from "@/components/ui/medical-tooltip";

interface ReportResult {
  parameter: string;
  result: string | number;
  normalRange: string;
  status: "normal" | "low" | "high" | "critical";
  unit?: string;
}

const sampleResults: ReportResult[] = [
  { parameter: "Hemoglobin", result: 10.2, normalRange: "13-17", status: "low", unit: "g/dL" },
  { parameter: "RBC Count", result: 4.8, normalRange: "4.5-5.5", status: "normal", unit: "million/uL" },
  { parameter: "WBC Count", result: 7500, normalRange: "4000-11000", status: "normal", unit: "/uL" },
  { parameter: "Platelet Count", result: 250000, normalRange: "150000-400000", status: "normal", unit: "/uL" },
  { parameter: "Cholesterol (Total)", result: 215, normalRange: "< 200", status: "high", unit: "mg/dL" },
  { parameter: "HDL Cholesterol", result: 52, normalRange: "> 40", status: "normal", unit: "mg/dL" },
  { parameter: "LDL Cholesterol", result: 135, normalRange: "< 100", status: "high", unit: "mg/dL" },
  { parameter: "Triglycerides", result: 145, normalRange: "< 150", status: "normal", unit: "mg/dL" },
  { parameter: "Blood Glucose (Fasting)", result: 98, normalRange: "70-100", status: "normal", unit: "mg/dL" },
  { parameter: "Creatinine", result: 1.0, normalRange: "0.7-1.3", status: "normal", unit: "mg/dL" },
];

const processingSteps = [
  { label: "Uploading", icon: Upload },
  { label: "OCR Extraction", icon: FileSearch },
  { label: "AI Analysis", icon: Brain },
  { label: "Results Ready", icon: CheckCircle },
];

type ProcessingStatus = "idle" | "uploading" | "processing" | "analyzing" | "complete";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<ReportResult[]>([]);
  const [summary, setSummary] = useState("");
  const [uploadData, setUploadData] = useState<any>(null);
  const [processData, setProcessData] = useState<any>(null);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === "application/pdf" || file.type.startsWith("image/")
    );
    
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.type === "application/pdf" || file.type.startsWith("image/")
      );
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  }, []);
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const processFiles = async () => {
    if (files.length === 0) return;
    
    try {
      setStatus("uploading");
      setCurrentStep(0);
      
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadDataResult = await uploadRes.json();
      setUploadData(uploadDataResult);
      
      setCurrentStep(1);
      setStatus("processing");
      
      // Convert file to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(files[0]);
      });
      
      const processRes = await fetch('/api/upload/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileData,
          fileType: uploadDataResult.files[0].fileType 
        }),
      });
      
      if (!processRes.ok) {
        const errorData = await processRes.json();
        console.error('Processing error:', errorData);
        console.log('Extracted text:', errorData.extractedText);
        console.log('Hint:', errorData.hint);
        
        // Show detailed error with extracted text
        let errorMessage = errorData.error || 'Processing failed';
        if (errorData.extractedText) {
          errorMessage += `\n\nExtracted text preview:\n${errorData.extractedText}`;
        }
        if (errorData.hint) {
          errorMessage += `\n\n${errorData.hint}`;
        }
        
        throw new Error(errorMessage);
      }
      const processDataResult = await processRes.json();
      setProcessData(processDataResult);
      
      setCurrentStep(2);
      setStatus("analyzing");
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: uploadDataResult.files[0].fileName,
          fileUrl: uploadDataResult.files[0].fileUrl,
          fileType: uploadDataResult.files[0].fileType,
          extractedData: { 
            parameters: processDataResult.parameters,
            radiologyFindings: processDataResult.radiologyFindings,
            medications: processDataResult.medications,
            clinicalFindings: processDataResult.clinicalFindings,
          },
          aiSummary: processDataResult.summary,
          abnormalCount: processDataResult.abnormalCount,
          sendEmail: true,
        }),
      });
      
      // Save to localStorage for current user
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          const userId = user.id;
          const key = `reports_${userId}`;
          const reports = JSON.parse(localStorage.getItem(key) || '[]');
          
          const newReport = {
            id: Date.now().toString(),
            userId,
            fileName: uploadDataResult.files[0].fileName,
            fileUrl: uploadDataResult.files[0].fileUrl,
            fileType: uploadDataResult.files[0].fileType,
            uploadDate: new Date().toISOString(),
            status: 'completed',
            reportType: processDataResult.reportType || 'Blood Test',
            extractedData: {
              parameters: processDataResult.parameters,
              radiologyFindings: processDataResult.radiologyFindings,
              medications: processDataResult.medications,
              clinicalFindings: processDataResult.clinicalFindings,
            },
            aiSummary: processDataResult.summary,
            abnormalCount: processDataResult.abnormalCount || 0,
          };
          
          reports.push(newReport);
          localStorage.setItem(key, JSON.stringify(reports));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
      }
      
      // Save health metrics from blood test parameters
      if (processDataResult.parameters && processDataResult.parameters.length > 0) {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          try {
            const user = JSON.parse(currentUser);
            const userId = user.id;
            const metricsKey = `health_metrics_${userId}`;
            const metrics = JSON.parse(localStorage.getItem(metricsKey) || '[]');
            
            for (const param of processDataResult.parameters) {
              let metricType = null;
              let value = null;
              
              if (param.parameter.toLowerCase().includes('glucose') || param.parameter.toLowerCase().includes('blood sugar')) {
                metricType = 'blood_sugar';
                value = parseFloat(param.result);
              } else if (param.parameter.toLowerCase().includes('cholesterol') && param.parameter.toLowerCase().includes('total')) {
                metricType = 'cholesterol';
                value = parseFloat(param.result);
              }
              
              if (metricType && value) {
                const newMetric = {
                  id: Date.now().toString() + Math.random(),
                  userId,
                  type: metricType,
                  value,
                  date: new Date().toISOString()
                };
                metrics.push(newMetric);
                
                // Also call API
                await fetch('/api/health-metrics', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: metricType, value }),
                });
              }
            }
            
            localStorage.setItem(metricsKey, JSON.stringify(metrics));
          } catch (error) {
            console.error('Error saving health metrics:', error);
          }
        }
      }
      
      // Save blood pressure from clinical findings
      if (processDataResult.clinicalFindings?.vitalSigns) {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          const userId = user.id;
          const metricsKey = `health_metrics_${userId}`;
          const metrics = JSON.parse(localStorage.getItem(metricsKey) || '[]');
          
          const vitalSigns = processDataResult.clinicalFindings.vitalSigns;
          
          // Check for any BP reading (Morning BP, Evening BP, or Blood Pressure)
          const bpKeys = Object.keys(vitalSigns).filter(k => k.toLowerCase().includes('bp') || k.toLowerCase().includes('blood pressure'));
          
          for (const bpKey of bpKeys) {
            const bp = vitalSigns[bpKey];
            const match = bp.match(/(\d+)\/(\d+)/);
            if (match) {
              const newMetric = {
                id: Date.now().toString() + Math.random(),
                userId,
                type: 'blood_pressure',
                systolic: parseInt(match[1]),
                diastolic: parseInt(match[2]),
                date: new Date().toISOString()
              };
              metrics.push(newMetric);
              
              await fetch('/api/health-metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'blood_pressure',
                  systolic: parseInt(match[1]),
                  diastolic: parseInt(match[2]),
                }),
              });
            }
          }
          
          localStorage.setItem(metricsKey, JSON.stringify(metrics));
        }
      }
      
      setCurrentStep(3);
      setStatus("complete");
      
      if (processDataResult.parameters.length === 0) {
        setResults([]);
        setSummary(processDataResult.summary || "No blood test parameters detected. Please upload a clear medical report PDF.");
      } else {
        setResults(processDataResult.parameters);
        setSummary(processDataResult.summary || "Analysis complete. Please review the results below.");
      }
    } catch (error: any) {
      console.error('Processing error:', error);
      setStatus("complete");
      setResults([]);
      setSummary(error.message || "Failed to process the file. Please ensure it's a valid medical report PDF with readable text.");
    }
  };
  
  const resetUpload = () => {
    setFiles([]);
    setStatus("idle");
    setCurrentStep(0);
    setResults([]);
    setSummary("");
  };
  
  const getStatusColor = (resultStatus: string) => {
    switch (resultStatus) {
      case "normal": return "bg-green-100 text-green-700 border-green-200";
      case "low": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "high": return "bg-orange-100 text-orange-700 border-orange-200";
      case "critical": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  
  const getStatusBadge = (resultStatus: string) => {
    switch (resultStatus) {
      case "normal": return "NORMAL";
      case "low": return "LOW";
      case "high": return "HIGH";
      case "critical": return "CRITICAL";
      default: return resultStatus.toUpperCase();
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Upload Medical Report</h1>
        <p className="text-muted-foreground mt-1">
          Upload your medical reports for AI-powered analysis
        </p>
      </motion.div>
      
      {status === "idle" && (
        <>
          {/* Upload Zone */}
          <motion.div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              isDragging 
                ? "border-[#0066FF] bg-[#0066FF]/5" 
                : "border-border hover:border-[#0066FF]/50 bg-white"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <input
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <motion.div
              className="w-20 h-20 mx-auto rounded-2xl bg-[#0066FF]/10 flex items-center justify-center mb-6"
              animate={{ scale: isDragging ? 1.1 : 1 }}
            >
              <Upload className="w-10 h-10 text-[#0066FF]" />
            </motion.div>
            
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Drag and drop your files here
            </h3>
            <p className="text-muted-foreground mb-4">
              or click to browse from your computer
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                PDF Reports
              </span>
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Image Reports
              </span>
            </div>
          </motion.div>
          
          {/* Selected Files */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="font-semibold text-foreground">Selected Files ({files.length})</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl bg-white border border-border"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 flex items-center justify-center">
                          {file.type === "application/pdf" ? (
                            <FileText className="w-5 h-5 text-[#0066FF]" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-[#0066FF]" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </motion.div>
                  ))}
                </div>
                
                <Button
                  onClick={processFiles}
                  className="w-full h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-xl text-lg"
                >
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Analyze Reports
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      
      {/* Processing State */}
      {(status === "uploading" || status === "processing" || status === "analyzing") && (
        <motion.div
          className="p-8 rounded-2xl bg-white border border-border text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {processingSteps.map((step, index) => (
              <div key={step.label} className="flex items-center">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index <= currentStep 
                      ? "bg-[#0066FF] text-white" 
                      : "bg-secondary text-muted-foreground"
                  }`}
                  animate={index === currentStep ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: index === currentStep ? Infinity : 0 }}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : index === currentStep ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </motion.div>
                {index < processingSteps.length - 1 && (
                  <div 
                    className={`w-12 h-1 mx-2 rounded-full ${
                      index < currentStep ? "bg-[#0066FF]" : "bg-secondary"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {processingSteps[currentStep].label}
          </h3>
          <p className="text-muted-foreground">
            {currentStep === 0 && "Uploading your medical report..."}
            {currentStep === 1 && "Extracting text using advanced OCR..."}
            {currentStep === 2 && "AI is analyzing your medical data..."}
          </p>
          
          {/* Scanning Animation */}
          <motion.div
            className="relative w-48 h-64 mx-auto mt-8 rounded-xl bg-secondary overflow-hidden"
          >
            <FileText className="absolute inset-0 m-auto w-16 h-16 text-[#0066FF]/20" />
            <motion.div
              className="absolute left-0 right-0 h-1 bg-[#0066FF]"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      )}
      
      {/* Results */}
      {status === "complete" && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Success Header */}
          <motion.div
            className="p-6 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Analysis Complete</h3>
              <p className="text-green-600 text-sm">Your medical report has been successfully analyzed</p>
            </div>
          </motion.div>
          
          {/* Patient-Friendly Summary */}
          <motion.div
            className="p-6 rounded-2xl bg-[#0066FF]/5 border border-[#0066FF]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0066FF] flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">AI Summary</h3>
                <p className="text-muted-foreground leading-relaxed">{summary}</p>
              </div>
            </div>
          </motion.div>
          
          {/* Results Table */}
          {results.length > 0 ? (
          <motion.div
            className="rounded-2xl bg-white border border-border overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-foreground">Detailed Results</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Parameter</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Result</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Normal Range</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.map((result, index) => (
                    <motion.tr
                      key={result.parameter}
                      className={`${result.status !== "normal" ? "bg-yellow-50/50" : ""}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        <MedicalTooltip term={result.parameter.toLowerCase().split(' ')[0]}>
                          {result.parameter}
                        </MedicalTooltip>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {result.result} {result.unit}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{result.normalRange} {result.unit}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(result.status)}`}>
                          {getStatusBadge(result.status)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
          ) : processData?.radiologyFindings && processData.radiologyFindings.length > 0 ? (
          <motion.div
            className="rounded-2xl bg-white border border-border overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-foreground">Radiology Findings</h3>
            </div>
            <div className="p-6 space-y-4">
              {processData.radiologyFindings.map((finding: any, index: number) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  finding.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  finding.severity === 'severe' ? 'bg-orange-50 border-orange-200' :
                  finding.severity === 'moderate' ? 'bg-yellow-50 border-yellow-200' :
                  finding.severity === 'mild' ? 'bg-blue-50 border-blue-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{finding.anatomy}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{finding.finding}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      finding.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      finding.severity === 'severe' ? 'bg-orange-100 text-orange-700' :
                      finding.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                      finding.severity === 'mild' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {finding.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          ) : processData?.medications && processData.medications.length > 0 ? (
          <motion.div
            className="rounded-2xl bg-white border border-border overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-foreground">Prescribed Medications</h3>
            </div>
            <div className="p-6 space-y-4">
              {processData.medications.map((med: any, index: number) => (
                <div key={index} className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h4 className="font-medium text-foreground">{med.name}</h4>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dosage:</span>
                      <span className="ml-2 text-foreground">{med.dosage}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="ml-2 text-foreground">{med.frequency}</span>
                    </div>
                    {med.duration && (
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-2 text-foreground">{med.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          ) : processData?.clinicalFindings ? (
          <motion.div
            className="rounded-2xl bg-white border border-border overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-foreground">Clinical Findings</h3>
            </div>
            <div className="p-6 space-y-6">
              {processData.clinicalFindings.vitalSigns && Object.keys(processData.clinicalFindings.vitalSigns).length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Vital Signs</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(processData.clinicalFindings.vitalSigns).map(([key, value]: [string, any]) => (
                      <div key={key} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-xs text-muted-foreground">{key}</p>
                        <p className="text-lg font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {processData.clinicalFindings.diagnosis && processData.clinicalFindings.diagnosis.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Diagnosis / Problems</h4>
                  <ul className="space-y-2">
                    {processData.clinicalFindings.diagnosis.map((diag: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#0066FF]/10 flex items-center justify-center text-xs font-medium text-[#0066FF] flex-shrink-0">{i + 1}</span>
                        <span className="text-foreground">{diag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {processData.clinicalFindings.riskFactors && processData.clinicalFindings.riskFactors.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Risk Factors</h4>
                  <div className="flex flex-wrap gap-2">
                    {processData.clinicalFindings.riskFactors.map((risk: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700 border border-yellow-200">
                        {risk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {processData.clinicalFindings.allergies && processData.clinicalFindings.allergies.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {processData.clinicalFindings.allergies.map((allergy: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 border border-red-200">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {processData.clinicalFindings.physicalExam && processData.clinicalFindings.physicalExam.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Physical Examination</h4>
                  <ul className="space-y-1">
                    {processData.clinicalFindings.physicalExam.map((exam: string, i: number) => (
                      <li key={i} className="text-muted-foreground text-sm">• {exam}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
          ) : (
          <motion.div
            className="p-12 rounded-2xl bg-white border border-border text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Parameters Detected</h3>
            <p className="text-muted-foreground mb-4">
              The PDF could not be read or does not contain recognizable blood test parameters.
            </p>
            <p className="text-sm text-muted-foreground">
              Please ensure your PDF contains text with parameter names like Hemoglobin, Cholesterol, etc.
            </p>
          </motion.div>
          )}
          
          {/* Legend - Only show for blood test reports */}
          {results.length > 0 && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Critical</span>
            </div>
          </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={resetUpload}
              variant="outline"
              className="flex-1 h-12 rounded-xl"
            >
              Upload Another Report
            </Button>
            <Button
              onClick={() => {
                alert('Report already saved!');
                window.location.href = '/dashboard/reports';
              }}
              className="flex-1 h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-xl"
            >
              View in My Reports
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
