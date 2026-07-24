import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientRow, MedicalRecordRow, VitalSignsRow } from '../../models/database.models';
import { ClinicDataService } from '../../services/clinic-data.service';

@Component({
  selector: 'app-medical-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medical-record.component.html',
  styleUrl: './medical-record.component.scss'
})
export class MedicalRecordComponent implements OnChanges {
  @Input() patient: PatientRow | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  tab = signal<'summary' | 'history' | 'consultation'>('summary');
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');
  history: MedicalRecordRow[] = [];
  latestVitals: VitalSignsRow | null = null;
  readonly today = new Date();

  consultation = {
    reason_for_visit: '',
    subjective_notes: '',
    physical_exam: '',
    assessment: '',
    diagnosis: '',
    treatment_plan: '',
    prescriptions: '',
    follow_up_notes: ''
  };

  vitals: Record<string, number | null> = {
    weight_kg: null,
    height_cm: null,
    systolic_pressure: null,
    diastolic_pressure: null,
    heart_rate: null,
    respiratory_rate: null,
    temperature_c: null,
    oxygen_saturation: null
  };

  constructor(private clinic: ClinicDataService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['patient']?.currentValue) {
      this.tab.set('summary');
      this.loadHistory();
    }
  }

  async loadHistory() {
    if (!this.patient) return;
    this.loading.set(true);
    this.error.set('');
    try {
      [this.history, this.latestVitals] = await Promise.all([
        this.clinic.getMedicalHistory(this.patient.id),
        this.clinic.getLatestVitalSigns(this.patient.id)
      ]);
    } catch {
      this.error.set('No fue posible cargar la información clínica.');
    } finally {
      this.loading.set(false);
    }
  }

  async saveConsultation() {
    if (!this.patient) return;
    if (!this.consultation.reason_for_visit.trim() || !this.consultation.diagnosis.trim()) {
      this.error.set('El motivo de consulta y el diagnóstico son obligatorios.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    try {
      await this.clinic.createConsultation(
        this.patient.id,
        this.nullableFields(this.consultation),
        this.vitals as any
      );
      this.resetForm();
      await this.loadHistory();
      this.success.set('La consulta se guardó en el expediente.');
      this.tab.set('history');
      this.updated.emit();
    } catch (error: any) {
      this.error.set(error?.message || 'No fue posible guardar la consulta.');
    } finally {
      this.saving.set(false);
    }
  }

  private nullableFields(input: Record<string, string>) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, value.trim() || null])
    ) as any;
  }

  private resetForm() {
    Object.keys(this.consultation).forEach(key => (this.consultation as any)[key] = '');
    Object.keys(this.vitals).forEach(key => this.vitals[key] = null);
  }

  age(): number {
    if (!this.patient) return 0;
    const birth = new Date(`${this.patient.birth_date}T00:00:00`);
    const today = new Date();
    let value = today.getFullYear() - birth.getFullYear();
    if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) value--;
    return value;
  }

  bmi(): string {
    const weight = this.latestVitals?.weight_kg;
    const height = this.latestVitals?.height_cm;
    if (!weight || !height) return '—';
    return (weight / Math.pow(height / 100, 2)).toFixed(1);
  }
}
