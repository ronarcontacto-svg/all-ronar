import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { ProveedorSesion } from './lib/sesion';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProveedorSesion>
      <RouterProvider router={router} />
    </ProveedorSesion>
  </StrictMode>,
);

// El service worker solo se registra en producción, para no interferir con Vite en desarrollo.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Sin service worker la app sigue funcionando como web normal.
    });
  });
}
