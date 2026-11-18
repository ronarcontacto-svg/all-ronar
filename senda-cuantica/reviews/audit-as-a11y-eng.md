# Accessibility Audit: Senda Cuántica (tanda 1)

**Perspective**: Accessibility Engineer
**Date**: 2026-11-18
**Plan**: código actual en `src/` (sin plan escrito)

## Plan Summary
App mobile-first con formularios, botones de escala 1–5, un círculo animado de respiración y navegación inferior. El riesgo principal está en la sintonía (anuncios cada 5 s) y en la falta de anuncio de cambios de ruta.

## Files Reviewed
| File | A11y Role | Risk |
|------|-----------|------|
| src/components/Shell.tsx | nav principal, main | Bajo |
| src/components/Circulo.tsx | animación + aria-live | Alto |
| src/routes/Sintonia.tsx | temporizador, lecturas | Medio |
| src/routes/Cuaderno.tsx | formulario de 8 pasos | Medio |
| src/routes/Intencion.tsx | escalas aria-pressed | Medio |
| src/routes/Entrar.tsx, Condiciones.tsx | formularios y errores | Bajo |
| src/routes/Hoy.tsx, Perfil.tsx | listas, estados | Bajo |
| src/styles.css | foco, tamaños, contraste, reducir movimiento | Medio |

## Verdict: APPROVE WITH CHANGES

## Critical Issues (Must Fix)
| # | Issue | WCAG Criterion | File(s) | Impact | Fix |
|---|-------|---------------|---------|--------|-----|
| 1 | El círculo anuncia "Inhala"/"Exhala" con `aria-live="polite"` cada 5 s durante toda la sesión. Un lector de pantalla lo repite sin pausa. | 4.1.3 Status Messages (uso práctico) | src/components/Circulo.tsx:21 | Alto: hace inusable la sesión con lector | Quitar `aria-live` del ritmo. Anunciar solo al iniciar y al terminar, o dejar la etiqueta visible sin live region. |
| 2 | Con reducir movimiento, el círculo sigue cambiando de tamaño de golpe cada 5 s (la transición se elimina, pero `scale` se mantiene). | 2.3.3 Animation from Interactions | src/styles.css:153–163, 194 | Medio: el movimiento sigue presente | Con `prefers-reduced-motion`, mantener el círculo fijo y cambiar solo la etiqueta. |
| 3 | No hay anuncio ni movimiento de foco al cambiar de ruta. Todas las pantallas tienen el mismo `<title>` ("Senda Cuántica"). | 2.4.2 Page Titled, 2.4.3 Focus Order | index.html:8; src/router.tsx | Alto para lectores: no saben dónde están | Actualizar `document.title` por ruta y mover el foco al `<h1>` de la pantalla al navegar. |

## Recommendations
| # | Issue | WCAG Criterion | Fix |
|---|-------|---------------|-----|
| 1 | Los botones 1–5 de intensidad, lectura y noche solo leen el número. Falta el significado (p. ej. "1 = forzando"). | 4.1.2 Name, Role, Value | `aria-label="Nivel 1 de 5: forzando"` o similar en Intencion.tsx:141 y Sintonia.tsx (escala de lectura). |
| 2 | La casilla de Condiciones mide 22 px. El objetivo táctil recomendado es 24 px. | 2.5.8 Target Size (AA) | Subir `.casilla input` a 24 px (src/styles.css:110). La etiqueta ya es clicable. |
| 3 | Las barras de progreso del cuaderno (`aria-hidden`) no dan información al lector. | 1.3.1 Info and Relationships | Añadir `role="progressbar"` con `aria-valuenow` y `aria-valuemax`, o incluir el texto "Paso X de 8", que ya existe. |
| 4 | Los errores de Entrar y Condiciones no están ligados al campo. | 3.3.1 Error Identification | `aria-describedby` apuntando al mensaje de error (src/routes/Entrar.tsx). |
| 5 | La vista de sesión de la sintonía no tiene `<h1>`. | 1.3.1, 2.4.6 Headings | Añadir un `<h1>` visualmente oculto ("Sintonía en curso"). |
| 6 | El `<summary>` de "Marco del método" no tiene regla de foco propia. | 2.4.7 Focus Visible | Añadir `:focus-visible` a `.marco summary` en src/styles.css:64. |
| 7 | El estado "Cargando…" de Hoy no se anuncia. | 4.1.3 | `role="status"` en Hoy.tsx. |

## Nice-to-Haves
| # | Suggestion | Rationale |
|---|------------|-----------|
| 1 | Enlace "Saltar al contenido" al inicio de cada pantalla. | Menos recorrido con teclado en la navegación inferior. |
| 2 | Texto de estado "Registro sellado" con `role="status"`. | Confirma el guardado sin depender del cambio visual. |
| 3 | Soporte de teclado de flechas en la escala 1–5 (radiogroup). | Patrón más natural que cinco botones sueltos. |

## Keyboard Navigation Walkthrough
| Step | Action | Expected Focus | Expected Announcement | Plan Handles? |
|------|--------|---------------|----------------------|---------------|
| 1 | Tab desde la carga | Primer control de la pantalla | Nombre del control | Sí |
| 2 | Tab a la barra inferior | "Hoy" → "Perfil" en orden | "Enlace, Hoy" | Sí |
| 3 | Enter en "Intención" | Foco en el primer campo | Sin anuncio de cambio de página | No (Crítico 3) |
| 4 | Tab a escala 1–5 | Botón con foco visible | Solo número (Recomendación 1) | Parcial |
| 5 | Enter en "Iniciar sintonía" | Foco en "Salir" | Sin anuncio; "Inhala" cada 5 s | No (Crítico 1) |
| 6 | Enter en "Salir" | Foco en la lectura de salida | Sin anuncio | Parcial |
| 7 | Escape | No hay modal; no aplica | — | — |

## ARIA Checklist
| Element | Role | Label | States | Keyboard | Notes |
|---------|------|-------|--------|----------|-------|
| nav inferior | navigation | "Principal" | aria-current en ruta | Sí | OK |
| Botones de escala | button | Solo número | aria-pressed | Sí | Recomendación 1 |
| Círculo | div aria-hidden | — | — | No aplica | Label live: Crítico 1 |
| Casilla Condiciones | checkbox | Texto de la etiqueta | checked | Sí | 22 px |
| Campo email | textbox | Label htmlFor | required | Sí | Error sin describedby |
| Barra de progreso | div aria-hidden | — | — | No aplica | Recomendación 3 |
| Botón Salir | button | Texto visible | — | Sí | OK |

## Verdict Details
- Screen Reader Compatibility: CONCERNS (círculo, cambio de ruta)
- Keyboard Navigation: PASS con reservas (sin atrapamiento de foco; la escala necesita nombres)
- Focus Management: CONCERNS (sin movimiento de foco al cambiar de ruta)
- Color Contrast: PASS (texto tenue ~8:1; dorado ~8.7:1; cian ~8:1; error ~10:1 sobre fondo casi negro)
- Motion Sensitivity: CONCERNS (círculo cambia de tamaño con reducir movimiento)
