-- Rueda de la vida y reencuadre (PNL). Mismo patrón que el resto: RLS por usuario.

create table public.ruedas_vida (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  creada_en timestamptz not null default now(),
  puntuaciones jsonb not null check (jsonb_typeof(puntuaciones) = 'object')
);

create table public.reencuadres (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  creada_en timestamptz not null default now(),
  situacion text not null,
  significado_inicial text,
  significado_nuevo text not null,
  nota text
);

create index on public.ruedas_vida (usuario_id, creada_en desc);
create index on public.reencuadres (usuario_id, creada_en desc);

alter table public.ruedas_vida enable row level security;
alter table public.reencuadres enable row level security;

create policy propias on public.ruedas_vida for all to authenticated
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy propios on public.reencuadres for all to authenticated
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);

-- Borrar mis registros también limpia lo nuevo (sigue sin tocar consentimientos).
create or replace function public.borrar_mis_registros() returns void
language plpgsql security invoker set search_path = '' as $$
begin
  delete from public.observaciones where usuario_id = (select auth.uid());
  delete from public.sintonias where usuario_id = (select auth.uid());
  delete from public.intenciones_diarias where usuario_id = (select auth.uid());
  delete from public.ruedas_vida where usuario_id = (select auth.uid());
  delete from public.reencuadres where usuario_id = (select auth.uid());
end $$;

revoke execute on function public.borrar_mis_registros() from public, anon;
grant execute on function public.borrar_mis_registros() to authenticated;
