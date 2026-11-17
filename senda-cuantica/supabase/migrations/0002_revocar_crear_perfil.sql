-- crear_perfil() es solo un trigger sobre auth.users: nadie debe poder invocarla por la API.
revoke execute on function public.crear_perfil() from public, anon, authenticated;
