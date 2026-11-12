-- ComparIA - HISTORIAL PRIVADO: LECTORES Y EDITORES INDEPENDIENTES
-- Ejecutar INMEDIATAMENTE DESPUÉS de 01_historial_publico.sql.
-- Así se elimina la lectura pública y se autoriza acceso únicamente a correos aprobados.
-- EDITORES: public.comparia_editors (pueden consultar y publicar)
-- LECTORES: public.comparia_viewers (pueden consultar; NO pueden publicar)

create table if not exists public.comparia_viewers (
  email text primary key,
  added_at timestamptz not null default now()
);
revoke all on table public.comparia_viewers from anon, authenticated;
alter table public.comparia_viewers enable row level security;

create or replace function public.comparia_can_view()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (select public.comparia_can_publish()) or exists (
    select 1 from public.comparia_viewers
    where lower(trim(email)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
  );
$$;
revoke all on function public.comparia_can_view() from public, anon;
grant execute on function public.comparia_can_view() to authenticated;

-- IMPORTANTE: desactivar lectura anónima también a nivel de GRANT.
revoke select on table public.comparia_reports from anon;
drop policy if exists comparia_public_read on public.comparia_reports;
drop policy if exists comparia_team_read on public.comparia_reports;
drop policy if exists comparia_authorized_read on public.comparia_reports;
create policy comparia_authorized_read on public.comparia_reports
  for select to authenticated
  using ((select public.comparia_can_view()));

-- La política de INSERT de 01 sigue permitiendo publicar SOLO a comparia_editors.
-- Añadir correos desde SQL Editor de Supabase (nunca desde GitHub):
-- insert into public.comparia_viewers(email) values ('lector@empresa.com');
-- insert into public.comparia_editors(email) values ('comprador@empresa.com');
