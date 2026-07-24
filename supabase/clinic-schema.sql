-- =========================================================
-- Clínica Barri · Esquema clínico inicial
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =========================================================

create extension if not exists pgcrypto;

-- Devuelve el rol protegido almacenado en auth.users.app_metadata.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
$$;

-- Información administrativa visible para doctor y recepción.
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  record_number bigint generated always as identity unique,
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  sex text check (sex in ('female', 'male', 'other', 'not_specified')),
  phone text,
  email text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  blood_type text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz,
  appointment_type text not null default 'general'
    check (appointment_type in ('general', 'diabetes', 'prenatal', 'results', 'other')),
  reason text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'confirmed', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show')),
  administrative_notes text,
  assigned_doctor uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Información clínica: solamente el personal con rol doctor.
create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete restrict,
  appointment_id uuid references public.appointments(id) on delete set null,
  consultation_date timestamptz not null default now(),
  reason_for_visit text,
  subjective_notes text,
  physical_exam text,
  assessment text,
  diagnosis text,
  treatment_plan text,
  prescriptions text,
  follow_up_notes text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vital_signs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete restrict,
  medical_record_id uuid references public.medical_records(id) on delete cascade,
  measured_at timestamptz not null default now(),
  weight_kg numeric(6,2) check (weight_kg > 0),
  height_cm numeric(6,2) check (height_cm > 0),
  systolic_pressure smallint check (systolic_pressure > 0),
  diastolic_pressure smallint check (diastolic_pressure > 0),
  heart_rate smallint check (heart_rate > 0),
  respiratory_rate smallint check (respiratory_rate > 0),
  temperature_c numeric(4,1),
  oxygen_saturation numeric(5,2) check (oxygen_saturation between 0 and 100),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.diabetes_controls (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete restrict,
  medical_record_id uuid references public.medical_records(id) on delete set null,
  control_date date not null default current_date,
  glucose_mg_dl numeric(6,2),
  fasting_glucose boolean not null default false,
  hba1c_percent numeric(4,2),
  foot_exam text,
  adherence_notes text,
  medication_notes text,
  next_control_date date,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prenatal_controls (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete restrict,
  medical_record_id uuid references public.medical_records(id) on delete set null,
  control_date date not null default current_date,
  last_menstrual_period date,
  estimated_due_date date,
  gestational_weeks smallint check (gestational_weeks between 0 and 45),
  fundal_height_cm numeric(5,2),
  fetal_heart_rate smallint,
  fetal_movements boolean,
  presentation text,
  risk_level text not null default 'low'
    check (risk_level in ('low', 'medium', 'high')),
  observations text,
  next_control_date date,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para búsquedas y agenda.
create index if not exists patients_name_idx
  on public.patients (last_name, first_name);
create index if not exists appointments_starts_at_idx
  on public.appointments (starts_at);
create index if not exists appointments_patient_idx
  on public.appointments (patient_id);
create index if not exists medical_records_patient_idx
  on public.medical_records (patient_id, consultation_date desc);
create index if not exists vital_signs_patient_idx
  on public.vital_signs (patient_id, measured_at desc);
create index if not exists diabetes_controls_patient_idx
  on public.diabetes_controls (patient_id, control_date desc);
create index if not exists prenatal_controls_patient_idx
  on public.prenatal_controls (patient_id, control_date desc);

-- Actualización automática de updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists patients_set_updated_at on public.patients;
create trigger patients_set_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

drop trigger if exists medical_records_set_updated_at on public.medical_records;
create trigger medical_records_set_updated_at
before update on public.medical_records
for each row execute function public.set_updated_at();

drop trigger if exists diabetes_controls_set_updated_at on public.diabetes_controls;
create trigger diabetes_controls_set_updated_at
before update on public.diabetes_controls
for each row execute function public.set_updated_at();

drop trigger if exists prenatal_controls_set_updated_at on public.prenatal_controls;
create trigger prenatal_controls_set_updated_at
before update on public.prenatal_controls
for each row execute function public.set_updated_at();

-- Row Level Security.
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.medical_records enable row level security;
alter table public.vital_signs enable row level security;
alter table public.diabetes_controls enable row level security;
alter table public.prenatal_controls enable row level security;

-- Doctor y recepción pueden administrar datos demográficos y agenda.
drop policy if exists "Personal consulta pacientes" on public.patients;
create policy "Personal consulta pacientes"
on public.patients for select to authenticated
using (public.current_user_role() in ('doctor', 'recepcion'));

drop policy if exists "Personal registra pacientes" on public.patients;
create policy "Personal registra pacientes"
on public.patients for insert to authenticated
with check (
  public.current_user_role() in ('doctor', 'recepcion')
  and created_by = auth.uid()
);

drop policy if exists "Personal actualiza pacientes" on public.patients;
create policy "Personal actualiza pacientes"
on public.patients for update to authenticated
using (public.current_user_role() in ('doctor', 'recepcion'))
with check (public.current_user_role() in ('doctor', 'recepcion'));

drop policy if exists "Personal consulta citas" on public.appointments;
create policy "Personal consulta citas"
on public.appointments for select to authenticated
using (public.current_user_role() in ('doctor', 'recepcion'));

drop policy if exists "Personal registra citas" on public.appointments;
create policy "Personal registra citas"
on public.appointments for insert to authenticated
with check (
  public.current_user_role() in ('doctor', 'recepcion')
  and created_by = auth.uid()
);

drop policy if exists "Personal actualiza citas" on public.appointments;
create policy "Personal actualiza citas"
on public.appointments for update to authenticated
using (public.current_user_role() in ('doctor', 'recepcion'))
with check (public.current_user_role() in ('doctor', 'recepcion'));

-- Recepción puede cancelar una cita; solo doctor puede borrarla definitivamente.
drop policy if exists "Doctor elimina citas" on public.appointments;
create policy "Doctor elimina citas"
on public.appointments for delete to authenticated
using (public.current_user_role() = 'doctor');

-- Las tablas clínicas quedan completamente restringidas al doctor.
drop policy if exists "Doctor administra expedientes" on public.medical_records;
create policy "Doctor administra expedientes"
on public.medical_records for all to authenticated
using (public.current_user_role() = 'doctor')
with check (
  public.current_user_role() = 'doctor'
  and created_by = auth.uid()
);

drop policy if exists "Doctor administra signos vitales" on public.vital_signs;
create policy "Doctor administra signos vitales"
on public.vital_signs for all to authenticated
using (public.current_user_role() = 'doctor')
with check (
  public.current_user_role() = 'doctor'
  and created_by = auth.uid()
);

drop policy if exists "Doctor administra diabetes" on public.diabetes_controls;
create policy "Doctor administra diabetes"
on public.diabetes_controls for all to authenticated
using (public.current_user_role() = 'doctor')
with check (
  public.current_user_role() = 'doctor'
  and created_by = auth.uid()
);

drop policy if exists "Doctor administra prenatal" on public.prenatal_controls;
create policy "Doctor administra prenatal"
on public.prenatal_controls for all to authenticated
using (public.current_user_role() = 'doctor')
with check (
  public.current_user_role() = 'doctor'
  and created_by = auth.uid()
);

-- Permisos explícitos para el rol authenticated.
grant usage on schema public to authenticated;
grant select, insert, update on public.patients to authenticated;
grant usage, select on sequence public.patients_record_number_seq to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, insert, update, delete on public.medical_records to authenticated;
grant select, insert, update, delete on public.vital_signs to authenticated;
grant select, insert, update, delete on public.diabetes_controls to authenticated;
grant select, insert, update, delete on public.prenatal_controls to authenticated;

-- Verificación rápida: debe mostrar RLS activo en todas las tablas.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'patients',
    'appointments',
    'medical_records',
    'vital_signs',
    'diabetes_controls',
    'prenatal_controls'
  )
order by tablename;
