import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../models/clinic.models';

@Component({
  selector: 'app-patient-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-drawer.component.html',
  styleUrl: './patient-drawer.component.scss'
})
export class PatientDrawerComponent {
  @Input() patient: Patient | null = null;
  @Output() closed = new EventEmitter<void>();
}
