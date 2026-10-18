export interface Case {
  id: number;
  patientName: string;
  birthYear: number;
  age?: number; 
  sex: 'M' | 'F';
  description: string;

  // Location
  latitude: number;
  longitude: number;

  // Metadata - from backend
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'SOS';
  isSos: boolean;
  acknowledged: boolean;
  isActive: boolean;
  createdAt: string;
  createdById: number;

  // Vitals - OPTIONAL (only for regular cases, not for SOS)
  bpm?: number;
  systolicPressure?: number;
  diastolicPressure?: number;
  resRate?: number;
  saturation?: number;
  temperature?: number;
  
  // Frontend-only fields (optional)
  status?: 'active' | 'sent' | 'completed';
  eta?: number;
}

export interface CreateCaseDTO {
  patientName: string;
  birthYear: number;
  sex: 'M' | 'F';
  description: string;
  bpm: number;
  systolicPressure: number;
  diastolicPressure: number;
  resRate: number;
  saturation: number;
  temperature: number;
  latitude: number;
  longitude: number;
}

export interface CreateSosCaseDTO {
  patientName: string;
  birthYear: number;
  sex: 'M' | 'F';
  description: string;
  latitude: number;
  longitude: number;
}

export interface UpdateCaseDTO {
  patientName?: string;
  birthYear?: number;
  sex?: 'M' | 'F';
  description?: string;
  bpm?: number;
  systolicPressure?: number;
  diastolicPressure?: number;
  resRate?: number;
  saturation?: number;
  temperature?: number;
  isSos?: boolean;
  acknowledged?: boolean;
  isActive?: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'SOS';
  latitude?: number;
  longitude?: number;
}