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
  readonly clinicRole = signal<ClinicRole>('recepcion');

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
    return this.clinicRole();
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
    if (!session?.user) {
      this.clinicRole.set('recepcion');
      return;
    }

    const protectedRole = session.user.app_metadata?.['role'];
    if (protectedRole === 'doctor' || protectedRole === 'recepcion') {
      this.clinicRole.set(protectedRole);
      return;
    }

    // Compatibilidad con instalaciones que guardaron el rol en public.profiles.
    this.client
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        this.clinicRole.set(data?.role === 'doctor' ? 'doctor' : 'recepcion');
      });
  }
}
