import { Link, Navigate, Outlet } from '@tanstack/react-router';
import { useSesion } from '../lib/sesion';

export function Cargando() {
  return (
    <div className="centro" role="status">
      <p className="tenue">Sintonizando…</p>
    </div>
  );
}

/** Layout de la zona privada: exige sesión y consentimiento vigente. */
export function LayoutProtegido() {
  const { cargando, sesion, consentido } = useSesion();
  if (cargando) return <Cargando />;
  if (!sesion) return <Navigate to="/entrar" />;
  if (!consentido) return <Navigate to="/condiciones" />;

  return (
    <div className="app">
      <main className="contenido">
        <Outlet />
      </main>
      <nav className="navegacion" aria-label="Principal">
        <Link to="/hoy" className="nav-item">Hoy</Link>
        <Link to="/intencion" className="nav-item">Intención</Link>
        <Link to="/cuaderno" className="nav-item">Cuaderno</Link>
        <Link to="/sintonia" className="nav-item">Sintonía</Link>
        <Link to="/perfil" className="nav-item">Perfil</Link>
      </nav>
    </div>
  );
}
