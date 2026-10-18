export interface User {
  id: number;
  name: string;
  role: 'ems-technician' | 'dispatcher' | 'admin';
  password: string; 
  location?: string; 
}