import { useEffect } from 'react';

/**
 * Pone el título de la pestaña según la pantalla y mueve el foco al <h1>.
 * Así un lector de pantalla anuncia el cambio de ruta en una SPA.
 */
export function useTitulo(titulo: string) {
  useEffect(() => {
    document.title = `${titulo} · Senda Cuántica`;
    const h1 = document.querySelector<HTMLElement>('h1');
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
  }, [titulo]);
}
