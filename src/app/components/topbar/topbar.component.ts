import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  @Input() role: 'doctor' | 'recepcion' = 'doctor';
  @Output() roleChange = new EventEmitter<'doctor' | 'recepcion'>();
  @Output() menuClick = new EventEmitter<void>();
  @Output() createClick = new EventEmitter<'appointment'>();
}
