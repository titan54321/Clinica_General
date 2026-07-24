import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() role: 'doctor' | 'recepcion' = 'doctor';
  @Input() open = false;
  @Output() roleChange = new EventEmitter<'doctor' | 'recepcion'>();
  @Output() closeMenu = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
