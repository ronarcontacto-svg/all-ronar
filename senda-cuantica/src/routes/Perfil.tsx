import { useState } from 'react';
import { Link, Navigate } from '@tanstack/react-router';
import { useSesion } from '../lib/sesion';
import { supabase } from '../lib/supabase';
import { borrarMisRegistros, exportarDatos } from '../lib/datos';
import { useTitulo } from '../lib/titulo';

export function Perfil() {
  const { sesion } = useSesion();
  useTitulo('Perfil');
  const uid = sesion?.user.id;
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState('');
  const [ocupado, setOcupado] = useState(false);

  if (!sesion) return <Navigate to="/entrar" />;

  async function exportar() {
    if (!uid) return;
    setError(null);
    setOcupado(true);
    try {
      const datos = await exportarDatos(uid);
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `senda-cuantica-${new Date().toISOString().slice(0, 10)}.json`;
      enlace.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo exportar. Inténtalo de nuevo.');
    } finally {
      setOcupado(false);
    }
  }

  async function borrar() {
    if (!uid || confirmacion !== 'BORRAR') return;
    setError(null);
    setOcupado(true);
    try {
      await borrarMisRegistros();
      setConfirmacion('');
      setMensaje('Listo. Tus registros se han borrado.');
    } catch {
      setError('No se pudieron borrar los registros. Inténtalo de nuevo.');
    } finally {
      setOcupado(false);
    }
  }

  async function salir() {
    await supabase.auth.signOut();
  }

  return (
    <div className="pantalla">
      <header className="cabecera">
        <p className="eyebrow">Tu cuenta</p>
        <h1 className="titulo">Perfil</h1>
        <p className="tenue">{sesion.user.email}</p>
      </header>

      {mensaje && <p className="aviso" role="status">{mensaje}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      <section className="tarjeta hero">
        <p className="eyebrow">Tu archivo</p>
        <h2 className="subtitulo">Mis datos</h2>
        <p className="tenue">Descarga una copia de todo lo que has registrado.</p>
        <button type="button" className="btn btn-primario" onClick={exportar} disabled={ocupado}>
          Exportar mis datos
        </button>
      </section>

      <section className="tarjeta formulario zona-peligro">
        <p className="eyebrow">Zona de cuidado</p>
        <h2 className="subtitulo">Borrar mis registros</h2>
        <p className="tenue">
          Se borran intenciones, observaciones y sintonías. Esta acción no se puede deshacer. Para
          confirmar, escribe BORRAR.
        </p>
        <input
          className="campo"
          aria-label="Escribe BORRAR para confirmar"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-peligro"
          disabled={ocupado || confirmacion !== 'BORRAR'}
          onClick={borrar}
        >
          Borrar registros
        </button>
      </section>

      <section className="tarjeta">
        <Link to="/acerca" className="enlace">Acerca de la práctica</Link>
      </section>

      <section className="tarjeta">
        <button type="button" className="btn btn-sec" onClick={salir}>
          Cerrar sesión
        </button>
      </section>
    </div>
  );
}
