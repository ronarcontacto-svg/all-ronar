# Production Readiness Audit: Senda Cuántica (tanda 1)

**Perspective**: Production Readiness Engineer
**Date**: 2026-11-18
**Plan**: código actual (`src/`, `supabase/migrations/`, `public/sw.js`), sin desplegar

## Plan Summary
Se publica una SPA con login por magic link, registros de datos personales sensibles y exportar/borrar. Lo que más puede romper en producción: el borrado no es atómico, el consentimiento puede duplicarse, la sintonía depende de timers que el navegador frena en segundo plano, y no hay ningún registro de errores.

## Files Reviewed
| File | Production Role | Risk |
|------|----------------|------|
| supabase/migrations/0001_init.sql | Esquema y RLS | Medio |
| supabase/migrations/0002_revocar_crear_perfil.sql | Permisos del trigger | Bajo |
| src/lib/sesion.tsx | Sesión y consentimiento | Medio |
| src/components/Shell.tsx | Guardas de rutas | Bajo |
| src/lib/datos.ts | Lecturas, escrituras, export y borrado | Alto |
| src/routes/Perfil.tsx | Export y borrado de datos | Alto |
| src/routes/Condiciones.tsx | Alta del consentimiento | Medio |
| src/routes/Sintonia.tsx, src/components/Circulo.tsx | Temporizador en cliente | Medio |
| src/routes/Hoy.tsx | Carga completa del historial | Medio |
| public/sw.js | Caché offline | Medio |
| .gitignore, .env.local | Secretos y exclusiones | Bajo |

## Verdict: APPROVE WITH CHANGES

## Critical Issues (Must Fix)
| # | Issue | File(s) | Production Failure Mode | Fix |
|---|-------|---------|------------------------|-----|
| 1 | El borrado hace tres `delete` seguidos sin transacción. Si el tercero falla, quedan datos a medias y el usuario ve un error sin saber qué quedó. | src/lib/datos.ts (`borrarMisRegistros`), src/routes/Perfil.tsx | Borrado parcial de datos sensibles | Una función SQL (RPC) que borre en una sola transacción, o un único `delete` por tabla con reintento y mensaje de estado final. |
| 2 | Sin restricción única en `consentimientos`. Si la consulta de consentimiento falla, la app manda al usuario a Condiciones y puede aceptar de nuevo, creando filas duplicadas. | supabase/migrations/0001_init.sql, src/lib/sesion.tsx, src/routes/Condiciones.tsx | Registro legal duplicado y ambiguo | Migración 0003: `unique (usuario_id, tipo, version)` y `upsert` en Condiciones. |
| 3 | El service worker guarda en caché respuestas sin comprobar `res.ok`. Un 500 del servidor se cachea y se sirve sin conexión. | public/sw.js (handler `fetch`) | La app offline muestra una pantalla de error como si fuera la válida | Cachear solo si `res.ok`; no cachear rutas que no sean `/`, `/manifest.webmanifest` o assets con hash. |
| 4 | La sintonía cuenta segundos con `setInterval`. En pestañas en segundo plano el navegador frena el timer y la sesión dura más de lo elegido. Además, el registro guarda `duracion_seg` planificada, no la real. | src/routes/Sintonia.tsx (efecto de cuenta atrás) | Datos de duración incorrectos | Calcular el tiempo restante con `Date.now()` contra una hora de inicio, no con contadores. |

## Recommendations
| # | Issue | Why | Fix |
|---|-------|-----|-----|
| 1 | No hay ningún registro de errores: los `catch` solo muestran un texto genérico. | Sin logs no se puede investigar un fallo real. | Añadir un registro mínimo (consola en dev, servicio de errores en prod) con etiqueta de operación y código de error. |
| 2 | `Hoy` carga todo el historial de las tres tablas en cada visita. | Con meses de uso la pantalla se vuelve lenta y consume ancho de banda. | Limitar la carga a los últimos 60 días para el dashboard y calcular los patrones en el servidor más adelante. |
| 3 | `signOut` en Perfil no maneja errores. | Si falla, la sesión queda activa sin aviso. | Mostrar un mensaje si `signOut` devuelve error. |
| 4 | El borrado de consentimientos no está cubierto por ninguna política. | Es intencional, pero no está documentado en el esquema. | Comentar en 0001 o en la migración que los consentimientos no se borran. |
| 5 | SMTP de prueba (`onboarding@resend.dev`) solo entrega al dueño de la cuenta de Resend. | En producción no llegan correos a otros usuarios. | Verificar un dominio en Resend antes de abrir la app a usuarios. |
| 6 | La URL de redirección del magic link es `http://localhost:5173`. | Al desplegar en Vercel hay que añadir la URL pública en Authentication > URL Configuration. | Añadir la URL de producción antes del primer despliegue. |
| 7 | El bundle pesa 540 kB; Vite avisa. | Carga más lenta en móvil. | Dividir por ruta con imports dinámicos (`React.lazy` o el router). |
| 8 | Consentimiento sin índice ni restricción de versión. | Consultas más lentas al crecer. | Índice sobre `(usuario_id, version)` junto con el punto 2. |

## Nice-to-Haves
| # | Suggestion | Rationale |
|---|------------|-----------|
| 1 | Cabeceras de seguridad en Vercel (CSP, `X-Frame-Options`, `Referrer-Policy`). | Reduce superficie de ataque al desplegar. |
| 2 | Pruebas de extremo a extremo del flujo de magic link. | Hoy solo se probó manualmente. |
| 3 | Versión de la app visible en Perfil. | Facilita reportes de error. |

## Failure Mode Analysis
| Scenario | What Fails | User Impact | Recovery | Plan Handles It? |
|----------|-----------|-------------|----------|-------------------|
| Falla la red al guardar una intención | Insert no llega | Mensaje "No se pudo guardar" | Reintentar manualmente | Sí |
| Falla el segundo de tres deletes | Borrado parcial | Datos mixtos, error genérico | Ninguna automática | No (Crítico 1) |
| Doble clic en Aceptar en Condiciones | Dos filas de consentimiento | Registro duplicado | Ninguna | No (Crítico 2) |
| Consulta de consentimiento falla al entrar | Redirección a Condiciones | Usuario confundido, puede re-aceptar | Recargar la página | Parcial |
| Pestaña en segundo plano durante la sintonía | Timer se retrasa | Duración registrada incorrecta | Ninguna | No (Crítico 4) |
| El servidor responde 500 y el usuario está offline | El SW sirve la respuesta de error cacheada | Pantalla rota | Recargar con red | No (Crítico 3) |
| Expira la sesión con la app abierta | `onAuthStateChange` manda a /entrar | Pérdida del texto sin guardar | Volver a entrar | Parcial |
| Cambia la versión del consentimiento | Todos deben aceptar de nuevo | Esperado | Aceptar | Sí |
| Revocar EXECUTE de crear_perfil() rompe el alta | Trigger no crea perfil | Usuario sin perfil | Verificar con un alta de prueba | No verificado (ver abajo) |

## Environment Checklist
| Concern | Dev | Prod | Gap? |
|---------|-----|------|------|
| File paths | Vite `/` | Vercel `/` | No |
| Network | localhost:5173 | Dominio público | Sí: redirect URL (Recomendación 6) |
| Permissions | RLS por usuario | Igual | No |
| Config | `.env.local` | Variables en Vercel (pendiente) | Sí: no hay aún |
| Build output | `npm run build` OK | Sin desplegar | Pendiente |
| Email | SMTP Resend de prueba | Dominio propio | Sí (Recomendación 5) |

## Verdict Details
- E2E Flow: CONCERNS (magic link probado solo en dev; alta de usuario nueva sin probar tras el REVOKE)
- Error Recovery: CONCERNS (borrado parcial, duplicados de consentimiento)
- Data Integrity: CONCERNS (sin unicidad en consentimientos; sintonía con duración errónea)
- Environment Parity: PASS con pendientes (redirect URL y variables de Vercel)
- Observability: CONCERNS (sin registro de errores)

## Lo que sí está bien
- RLS activo en las 5 tablas, policies por `auth.uid()`.
- Clave publicable en el cliente; no hay `service_role`.
- `.env.local` está excluido de git (`git status` limpio).
- El SW no cachea llamadas a Supabase (son de otro origen).
- Permisos del trigger reducidos (migración 0002).
