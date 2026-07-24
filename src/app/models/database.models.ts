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

export interface MedicalRecordRow {
  id: string;
  patient_id: string;
  consultation_date: string;
  reason_for_visit: string | null;
  subjective_notes: string | null;
  physical_exam: string | null;
  assessment: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  prescriptions: string | null;
  follow_up_notes: string | null;
  created_at: string;
}

export interface VitalSignsRow {
  id: string;
  patient_id: string;
  medical_record_id: string | null;
  measured_at: string;
  weight_kg: number | null;
  height_cm: number | null;
  systolic_pressure: number | null;
  diastolic_pressure: number | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  temperature_c: number | null;
  oxygen_saturation: number | null;
}

export interface ConsultationInput {
  reason_for_visit: string | null;
  subjective_notes: string | null;
  physical_exam: string | null;
  assessment: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  prescriptions: string | null;
  follow_up_notes: string | null;
}

export interface VitalSignsInput {
  weight_kg: number | null;
  height_cm: number | null;
  systolic_pressure: number | null;
  diastolic_pressure: number | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  temperature_c: number | null;
  oxygen_saturation: number | null;
}
