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
      <header className="cabecera-app">
        <div className="marca">
          <div>
            <p className="eyebrow">Arquitectura de coherencia</p>
            <p className="marca-nombre">Senda <span className="text-gradient-quantum">Cuántica</span></p>
          </div>
          <div className="marca-icono" aria-hidden="true">◎</div>
        </div>
        <nav className="tabs" aria-label="Principal">
          <Link to="/hoy" className="tab">Hoy</Link>
          <Link to="/intencion" className="tab">Intención</Link>
          <Link to="/cuaderno" className="tab">Cuaderno</Link>
          <Link to="/sintonia" className="tab">Sintonía</Link>
          <Link to="/rueda" className="tab">Rueda</Link>
          <Link to="/reencuadre" className="tab">Reencuadre</Link>
          <Link to="/perfil" className="tab">Perfil</Link>
        </nav>
      </header>
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}
