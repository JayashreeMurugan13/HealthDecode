export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  healthScore?: number;
}

export interface MedicalReport {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'failed';
  reportType: string;
  extractedData?: ReportData;
  aiSummary?: string;
  abnormalCount: number;
}

export interface ReportData {
  parameters: ReportParameter[];
}

export interface ReportParameter {
  parameter: string;
  result: string | number;
  normalRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  unit?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface HealthMetric {
  id: string;
  userId: string;
  metricType: 'blood_sugar' | 'cholesterol' | 'blood_pressure';
  value: number;
  systolic?: number;
  diastolic?: number;
  date: Date;
}
