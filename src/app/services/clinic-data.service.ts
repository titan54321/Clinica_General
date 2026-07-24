import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AppointmentInput, AppointmentRow, ConsultationInput, MedicalRecordRow, PatientInput, PatientRow, VitalSignsInput, VitalSignsRow } from '../models/database.models';

@Injectable({ providedIn: 'root' })
export class ClinicDataService {
  constructor(private auth: AuthService) {}

  async getPatients(search = ''): Promise<PatientRow[]> {
    let query = this.auth.client
      .from('patients')
      .select('*')
      .neq('status', 'archived')
      .order('last_name')
      .limit(100);

    const cleanSearch = search.trim().replace(/[%_,()]/g, '');
    if (cleanSearch) {
      query = query.or(`first_name.ilike.%${cleanSearch}%,last_name.ilike.%${cleanSearch}%,phone.ilike.%${cleanSearch}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as PatientRow[];
  }

  async createPatient(input: PatientInput): Promise<PatientRow> {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('Sesión no disponible');

    const { data, error } = await this.auth.client
      .from('patients')
      .insert({ ...input, created_by: userId })
      .select()
      .single();

    if (error) throw error;
    return data as PatientRow;
  }

  async updatePatient(id: string, input: Partial<PatientInput>): Promise<PatientRow> {
    const { data, error } = await this.auth.client
      .from('patients')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PatientRow;
  }

  async getAppointments(date: Date = new Date()): Promise<AppointmentRow[]> {
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);

    const { data, error } = await this.auth.client
      .from('appointments')
      .select('*, patient:patients(id, first_name, last_name, record_number)')
      .gte('starts_at', from.toISOString())
      .lt('starts_at', to.toISOString())
      .order('starts_at');

    if (error) throw error;
    return (data ?? []) as AppointmentRow[];
  }

  async createAppointment(input: AppointmentInput): Promise<AppointmentRow> {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('Sesión no disponible');

    const { data, error } = await this.auth.client
      .from('appointments')
      .insert({ ...input, created_by: userId })
      .select('*, patient:patients(id, first_name, last_name, record_number)')
      .single();

    if (error) throw error;
    return data as AppointmentRow;
  }

  async updateAppointmentStatus(id: string, status: AppointmentRow['status']) {
    const { error } = await this.auth.client
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }

  async getMedicalHistory(patientId: string): Promise<MedicalRecordRow[]> {
    const { data, error } = await this.auth.client
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('consultation_date', { ascending: false });

    if (error) throw error;
    return (data ?? []) as MedicalRecordRow[];
  }

  async getLatestVitalSigns(patientId: string): Promise<VitalSignsRow | null> {
    const { data, error } = await this.auth.client
      .from('vital_signs')
      .select('*')
      .eq('patient_id', patientId)
      .order('measured_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as VitalSignsRow | null;
  }

  async createConsultation(
    patientId: string,
    consultation: ConsultationInput,
    vitals: VitalSignsInput
  ): Promise<MedicalRecordRow> {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('Sesión no disponible');

    const { data: record, error: recordError } = await this.auth.client
      .from('medical_records')
      .insert({
        patient_id: patientId,
        ...consultation,
        created_by: userId
      })
      .select()
      .single();

    if (recordError) throw recordError;

    const hasVitals = Object.values(vitals).some(value => value !== null);
    if (hasVitals) {
      const { error: vitalsError } = await this.auth.client
        .from('vital_signs')
        .insert({
          patient_id: patientId,
          medical_record_id: record.id,
          ...vitals,
          created_by: userId
        });

      if (vitalsError) throw vitalsError;
    }

    return record as MedicalRecordRow;
  }
}
