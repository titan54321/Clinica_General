import { Injectable, signal } from '@angular/core';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export type ClinicRole = 'doctor' | 'recepcion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.client.auth.getSession().then(({ data }) => {
      this.applySession(data.session);
      this.loading.set(false);
    });

    this.client.auth.onAuthStateChange((_event, session) => {
      this.applySession(session);
      this.loading.set(false);
    });
  }

  get role(): ClinicRole {
    const role = this.user()?.app_metadata?.['role'] ?? this.user()?.user_metadata?.['role'];
    return role === 'recepcion' ? 'recepcion' : 'doctor';
  }

  get displayName(): string {
    const user = this.user();
    return user?.user_metadata?.['full_name'] || user?.email?.split('@')[0] || 'Usuario';
  }

  async signIn(email: string, password: string) {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  private applySession(session: Session | null) {
    this.user.set(session?.user ?? null);
  }
}
