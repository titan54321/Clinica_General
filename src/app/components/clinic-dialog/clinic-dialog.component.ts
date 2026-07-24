import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicDataService } from '../../services/clinic-data.service';
import { PatientRow } from '../../models/database.models';

@Component({
  selector: 'app-clinic-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clinic-dialog.component.html',
  styleUrls: ['./clinic-dialog.component.scss', './clinic-dialog-extra.scss']
})
export class ClinicDialogComponent {
  @Input() mode: 'patient' | 'appointment' | 'consultation' | null = null;
  @Input() patients: PatientRow[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() patientSelected = new EventEmitter<PatientRow>();

  busy = signal(false);
  error = signal('');

  patient = {
    first_name: '',
    last_name: '',
    birth_date: '',
    sex: 'not_specified',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_type: ''
  };

  appointment = {
    patient_id: '',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00',
    appointment_type: 'general',
    reason: '',
    status: 'scheduled',
    administrative_notes: ''
  };

  constructor(private clinic: ClinicDataService) {}

  selectConsultationPatient() {
    const patient = this.patients.find(item => item.id === this.appointment.patient_id);
    if (!patient) {
      this.error.set('Selecciona un paciente para iniciar la consulta.');
      return;
    }
    this.patientSelected.emit(patient);
  }

  async submitPatient() {
    if (!this.patient.first_name.trim() || !this.patient.last_name.trim() || !this.patient.birth_date) {
      this.error.set('Nombre, apellidos y fecha de nacimiento son obligatorios.');
      return;
    }

    this.busy.set(true);
    this.error.set('');
    try {
      await this.clinic.createPatient({
        ...this.patient,
        sex: this.patient.sex || null,
        phone: this.patient.phone || null,
        email: this.patient.email || null,
        address: this.patient.address || null,
        emergency_contact_name: this.patient.emergency_contact_name || null,
        emergency_contact_phone: this.patient.emergency_contact_phone || null,
        blood_type: this.patient.blood_type || null
      });
      this.saved.emit();
    } catch (error: any) {
      this.error.set(error?.message || 'No fue posible registrar al paciente.');
    } finally {
      this.busy.set(false);
    }
  }

  async submitAppointment() {
    if (!this.appointment.patient_id || !this.appointment.date || !this.appointment.time) {
      this.error.set('Selecciona paciente, fecha y hora.');
      return;
    }

    this.busy.set(true);
    this.error.set('');
    try {
      const startsAt = new Date(`${this.appointment.date}T${this.appointment.time}:00`);
      const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
      await this.clinic.createAppointment({
        patient_id: this.appointment.patient_id,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        appointment_type: this.appointment.appointment_type,
        reason: this.appointment.reason || null,
        status: this.appointment.status,
        administrative_notes: this.appointment.administrative_notes || null
      });
      this.saved.emit();
    } catch (error: any) {
      this.error.set(error?.message || 'No fue posible registrar la cita.');
    } finally {
      this.busy.set(false);
    }
  }
}
