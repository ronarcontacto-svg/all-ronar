-- Borra en una sola transacción las intenciones, observaciones y sintonías del usuario actual.
-- Los consentimientos no se borran: se conservan como prueba de aceptación.
create or replace function public.borrar_mis_registros()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.observaciones where usuario_id = (select auth.uid());
  delete from public.sintonias where usuario_id = (select auth.uid());
  delete from public.intenciones_diarias where usuario_id = (select auth.uid());
end $$;

revoke execute on function public.borrar_mis_registros() from public, anon;
grant execute on function public.borrar_mis_registros() to authenticated;
