import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicDialogComponent } from '../../components/clinic-dialog/clinic-dialog.component';
import { ClinicDataService } from '../../services/clinic-data.service';
import { AppointmentRow, PatientRow } from '../../models/database.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ClinicDialogComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnChanges {
  @Input() role: 'doctor' | 'recepcion' = 'doctor';
  @Input() requestedAction: 'patient' | 'appointment' | null = null;
  @Output() actionHandled = new EventEmitter<void>();

  patients: PatientRow[] = [];
  appointments: AppointmentRow[] = [];
  dialog = signal<'patient' | 'appointment' | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(private clinic: ClinicDataService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['requestedAction']?.currentValue) {
      this.dialog.set(changes['requestedAction'].currentValue);
    }
  }

  async loadData() {
    this.loading.set(true);
    this.error.set('');
    try {
      [this.patients, this.appointments] = await Promise.all([
        this.clinic.getPatients(),
        this.clinic.getAppointments()
      ]);
    } catch {
      this.error.set('No fue posible cargar los datos. Revisa la sesión y las políticas de Supabase.');
    } finally {
      this.loading.set(false);
    }
  }

  async onSaved() {
    this.closeDialog();
    await this.loadData();
  }

  closeDialog() {
    this.dialog.set(null);
    this.actionHandled.emit();
  }

  age(birthDate: string): number {
    const birth = new Date(`${birthDate}T00:00:00`);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  initials(patient: PatientRow): string {
    return `${patient.first_name[0] ?? ''}${patient.last_name[0] ?? ''}`.toUpperCase();
  }

  appointmentLabel(type: string): string {
    return ({ general: 'Consulta', diabetes: 'Diabetes', prenatal: 'Prenatal', results: 'Resultados', other: 'Otro' } as Record<string, string>)[type] ?? type;
  }

  statusLabel(status: string): string {
    return ({ scheduled: 'Programada', confirmed: 'Confirmada', waiting: 'En espera', in_progress: 'En consulta', completed: 'Completada', cancelled: 'Cancelada', no_show: 'No asistió' } as Record<string, string>)[status] ?? status;
  }
}
