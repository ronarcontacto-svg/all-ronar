-- Un único registro por usuario, tipo y versión: evita duplicados por doble clic o reintentos.
-- Si ya existieran duplicados, esta migración fallará y debe limpiarse antes.
alter table public.consentimientos
  add constraint consentimientos_usuario_tipo_version_key unique (usuario_id, tipo, version);
