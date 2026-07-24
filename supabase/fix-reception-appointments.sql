-- =========================================================
-- Corrección: recepción puede consultar, crear y actualizar citas.
-- Ejecutar en Supabase Dashboard > SQL Editor.
-- =========================================================

-- Lee primero app_metadata y, si el rol aún no está en el JWT,
-- usa el perfil protegido de public.profiles.
create or replace function public.current_user_role()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  jwt_role text;
  profile_role text;
begin
  jwt_role := auth.jwt() -> 'app_metadata' ->> 'role';

  if jwt_role in ('doctor', 'recepcion') then
    return jwt_role;
  end if;

  select role into profile_role
  from public.profiles
  where id = auth.uid();

  return coalesce(profile_role, '');
end;
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

alter table public.appointments enable row level security;

drop policy if exists "Personal consulta citas" on public.appointments;
create policy "Personal consulta citas"
on public.appointments for select
to authenticated
using (public.current_user_role() in ('doctor', 'recepcion'));

drop policy if exists "Personal registra citas" on public.appointments;
create policy "Personal registra citas"
on public.appointments for insert
to authenticated
with check (
  public.current_user_role() in ('doctor', 'recepcion')
  and created_by = auth.uid()
);

drop policy if exists "Personal actualiza citas" on public.appointments;
create policy "Personal actualiza citas"
on public.appointments for update
to authenticated
using (public.current_user_role() in ('doctor', 'recepcion'))
with check (public.current_user_role() in ('doctor', 'recepcion'));

grant select, insert, update on public.appointments to authenticated;
grant select on public.patients to authenticated;

-- Verificación de los roles guardados. No muestra contraseñas.
select
  u.email,
  u.raw_app_meta_data ->> 'role' as role_en_token,
  p.role as role_en_perfil
from auth.users u
left join public.profiles p on p.id = u.id
order by u.email;
