create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  zona_horaria text not null default 'Europe/Madrid',
  creado_en timestamptz not null default now()
);

create table public.consentimientos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('condiciones','datos')),
  version text not null,
  aceptado_en timestamptz not null default now()
);

create table public.intenciones_diarias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  fecha date not null,
  eleccion text not null,
  suelto text,
  modo_real smallint check (modo_real between 1 and 5),
  variante_cumplida text check (variante_cumplida in ('si','parcial','no')),
  nota text,
  creada_en timestamptz not null default now(),
  cerrada_en timestamptz,
  unique (usuario_id, fecha)
);

create table public.observaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  creada_en timestamptz not null default now(),
  disparador text,
  emocion text,
  intensidad smallint check (intensidad between 1 and 5),
  cuerpo text,
  hecho text,
  juicio text,
  emocion_nueva text,
  conducta text,
  cuando_aparezca text,
  elijo text
);

create table public.sintonias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  creada_en timestamptz not null default now(),
  duracion_seg integer not null,
  lectura_entrada smallint not null check (lectura_entrada between 1 and 5),
  lectura_salida smallint check (lectura_salida between 1 and 5),
  completada boolean not null default false
);

create index on public.intenciones_diarias (usuario_id, fecha desc);
create index on public.observaciones (usuario_id, creada_en desc);
create index on public.sintonias (usuario_id, creada_en desc);

alter table public.perfiles enable row level security;
alter table public.consentimientos enable row level security;
alter table public.intenciones_diarias enable row level security;
alter table public.observaciones enable row level security;
alter table public.sintonias enable row level security;

create policy propio on public.perfiles for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy ver_propios on public.consentimientos for select to authenticated
  using ((select auth.uid()) = usuario_id);
create policy registrar_propio on public.consentimientos for insert to authenticated
  with check ((select auth.uid()) = usuario_id);
create policy propias on public.intenciones_diarias for all to authenticated
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy propias on public.observaciones for all to authenticated
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy propias on public.sintonias for all to authenticated
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);

create function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id) values (new.id);
  return new;
end $$;

create trigger al_registrarse after insert on auth.users
  for each row execute function public.crear_perfil();
