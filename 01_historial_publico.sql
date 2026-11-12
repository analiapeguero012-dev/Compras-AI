-- COMPARIA: HISTORIAL COMPARTIDO
-- ADVERTENCIA: este esquema permite LECTURA PÚBLICA a cualquiera que acceda a la web
-- o utilice el API público. NUNCA guardar cotizaciones confidenciales en este modo.
-- INSERTAR: solo compradores autenticados, verificados y preautorizados en comparia_editors.
-- Las versiones publicadas son inmutables; solo un administrador puede retirarlas.

create extension if not exists pgcrypto;

create table if not exists public.comparia_editors (
  email text primary key,
  added_at timestamptz not null default now()
);

-- No se puede leer/modificar desde la app el listado de compradores autorizados.
revoke all on table public.comparia_editors from anon, authenticated;
alter table public.comparia_editors enable row level security;

create or replace function public.comparia_can_publish()
returns boolean
language sql stable security definer set search_path = ''
as $$
 select exists(
   select 1 from public.comparia_editors
   where lower(trim(email)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
 );
$$;
revoke all on function public.comparia_can_publish() from public, anon;
grant execute on function public.comparia_can_publish() to authenticated;

create table if not exists public.comparia_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  owner_id uuid not null references auth.users(id),
  author_email text not null,
  project text not null,
  request_code text,
  report_date date,
  supplier_count integer not null default 0,
  winner_name text,
  winner_score numeric,
  total_evaluated numeric,
  snapshot jsonb not null,
  constraint snapshot_is_object check (jsonb_typeof(snapshot) = 'object'),
  constraint snapshot_size_limit check (octet_length(snapshot::text) <= 400000)
);

create index if not exists comparia_reports_recent on public.comparia_reports(created_at desc);
alter table public.comparia_reports enable row level security;
revoke all on table public.comparia_reports from anon, authenticated;
grant select on table public.comparia_reports to anon, authenticated;
grant insert on table public.comparia_reports to authenticated;

drop policy if exists comparia_public_read on public.comparia_reports;
create policy comparia_public_read on public.comparia_reports for select
  to anon, authenticated using (true);

drop policy if exists comparia_verified_editors_publish on public.comparia_reports;
create policy comparia_verified_editors_publish on public.comparia_reports for insert
  to authenticated with check (
    owner_id = (select auth.uid())
    and lower(author_email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
    and (select public.comparia_can_publish())
  );

-- No se concede UPDATE ni DELETE desde el navegador: protege las versiones históricas.
-- Agrega cada correo autorizado desde SQL Editor (no se publica su listado):
-- insert into public.comparia_editors(email) values ('comprador@empresa.com');
