import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  busy = signal(false);
  error = signal('');
  message = signal('');

  constructor(private auth: AuthService) {}

  async submit() {
    if (!this.email || !this.password) {
      this.error.set('Ingresa tu correo y contraseña.');
      return;
    }

    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.signIn(this.email.trim(), this.password);
    } catch {
      this.error.set('No pudimos iniciar sesión. Verifica tus datos.');
    } finally {
      this.busy.set(false);
    }
  }

  async recover() {
    if (!this.email) {
      this.error.set('Escribe tu correo para enviarte el enlace.');
      return;
    }

    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.resetPassword(this.email.trim());
      this.message.set('Te enviamos un enlace para restablecer tu contraseña.');
    } catch {
      this.error.set('No fue posible enviar el correo. Intenta de nuevo.');
    } finally {
      this.busy.set(false);
    }
  }
}
