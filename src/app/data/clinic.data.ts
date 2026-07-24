import { Appointment, Patient } from '../models/clinic.models';

export const APPOINTMENTS: Appointment[] = [
  { time: '09:00', patient: 'Mariana Torres', reason: 'Control prenatal · 24 sem.', type: 'Prenatal', status: 'Confirmada', initials: 'MT', color: '#c98868' },
  { time: '10:30', patient: 'Roberto Salgado', reason: 'Control metabólico', type: 'Diabetes', status: 'En espera', initials: 'RS', color: '#6b8d92' },
  { time: '12:00', patient: 'Elena Vázquez', reason: 'Consulta de seguimiento', type: 'Consulta', status: 'Confirmada', initials: 'EV', color: '#8072a5' },
  { time: '13:30', patient: 'Jorge Ramírez', reason: 'Revisión de resultados', type: 'Diabetes', status: 'Pendiente', initials: 'JR', color: '#6480a4' }
];

export const PATIENTS: Patient[] = [
  { name: 'Roberto Salgado', id: 'P-01942', age: 58, program: 'Diabetes', lastVisit: '12 jul 2026', nextVisit: 'Hoy, 10:30', status: 'Atención', detail: 'HbA1c', value: '8.2%', initials: 'RS', color: '#6b8d92' },
  { name: 'Mariana Torres', id: 'P-02106', age: 31, program: 'Prenatal', lastVisit: '02 jul 2026', nextVisit: 'Hoy, 09:00', status: 'Control', detail: 'Semana', value: '24', initials: 'MT', color: '#c98868' },
  { name: 'Lucía Hernández', id: 'P-01768', age: 46, program: 'Diabetes', lastVisit: '18 jul 2026', nextVisit: '30 jul 2026', status: 'Estable', detail: 'Glucosa', value: '112', initials: 'LH', color: '#789a83' }
];
