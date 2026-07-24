export interface PatientRow {
  id: string;
  record_number: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  sex: 'female' | 'male' | 'other' | 'not_specified' | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  blood_type: string | null;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
}

export interface AppointmentRow {
  id: string;
  patient_id: string;
  starts_at: string;
  ends_at: string | null;
  appointment_type: 'general' | 'diabetes' | 'prenatal' | 'results' | 'other';
  reason: string | null;
  status: 'scheduled' | 'confirmed' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  administrative_notes: string | null;
  assigned_doctor: string | null;
  patient?: Pick<PatientRow, 'id' | 'first_name' | 'last_name' | 'record_number'>;
}

export interface PatientInput {
  first_name: string;
  last_name: string;
  birth_date: string;
  sex: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  blood_type: string | null;
}

export interface AppointmentInput {
  patient_id: string;
  starts_at: string;
  ends_at: string | null;
  appointment_type: string;
  reason: string | null;
  status: string;
  administrative_notes: string | null;
}
