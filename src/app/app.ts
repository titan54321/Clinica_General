import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthService, ClinicRole } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, SidebarComponent, TopbarComponent, DashboardComponent, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  sidebarOpen = signal(false);
  requestedAction = signal<'patient' | 'appointment' | null>(null);

  constructor(readonly auth: AuthService) {}

  get role(): ClinicRole {
    return this.auth.role;
  }
}
