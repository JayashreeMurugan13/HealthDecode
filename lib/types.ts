export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  dateOfBirth?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  profileImage?: string;
  healthScore?: number;
}

export interface MedicalReport {
  id: string;
  userId: string;
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'error';
  results?: ReportResult[];
  summary?: string;
}

export interface ReportResult {
  parameter: string;
  result: string | number;
  normalRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  unit?: string;
}

export interface HealthTimelineEntry {
  date: string;
  type: 'report' | 'checkup' | 'medication';
  title: string;
  description: string;
  values?: {
    name: string;
    value: number;
    trend: 'improving' | 'stable' | 'worsening';
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface BodyDiagnosisQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface DiagnosisResult {
  condition: string;
  probability: 'low' | 'medium' | 'high';
  description: string;
  recommendations: string[];
}
