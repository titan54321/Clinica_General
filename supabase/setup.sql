-- Ejecutar una vez en Supabase SQL Editor.
-- El rol se guarda en app_metadata para que el usuario no pueda cambiarlo.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('doctor', 'recepcion')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuarios consultan su perfil"
on public.profiles for select
to authenticated
using (auth.uid() = id);

-- Después de crear cada usuario desde Authentication > Users:
-- update auth.users
-- set raw_app_meta_data = raw_app_meta_data || '{"role":"doctor"}'::jsonb
-- where email = 'doctor@clinicabarri.mx';
