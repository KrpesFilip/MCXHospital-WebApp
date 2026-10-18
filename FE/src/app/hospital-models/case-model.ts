export interface CaseModel {
  id: number;
  patientName: string;
  birthYear: number;
  sex: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'SOS';
  isSos: boolean;
  isActive: boolean;
  acknowledged: boolean;
  createdAt: string;
  createdById: number;
  
  // Vitali znakovi
  bpm?: number;
  resRate?: number;
  saturation?: number;
  temperature?: number;
  systolicPressure?: number;
  diastolicPressure?: number;
  
  // Lokacija
  latitude: number;
  longitude: number;
  
  // UI dodatni
  status?: 'DRAFT' | 'SENT' | 'ACKNOWLEDGED' | 'CLOSED';
  etaMinutes?: number;
  summary?: string;
}