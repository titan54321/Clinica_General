export interface Appointment {
  time: string;
  patient: string;
  reason: string;
  type: 'Diabetes' | 'Prenatal' | 'Consulta';
  status: 'Confirmada' | 'En espera' | 'Pendiente';
  initials: string;
  color: string;
}

export interface Patient {
  name: string;
  id: string;
  age: number;
  program: 'Diabetes' | 'Prenatal' | 'General';
  lastVisit: string;
  nextVisit: string;
  status: 'Estable' | 'Atención' | 'Control';
  detail: string;
  value: string;
  initials: string;
  color: string;
}
