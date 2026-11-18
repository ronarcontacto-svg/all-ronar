import { useState, type FormEvent } from 'react';
import { Navigate } from '@tanstack/react-router';
import { supabase } from '../lib/supabase';
import { useSesion } from '../lib/sesion';
import { useTitulo } from '../lib/titulo';

export function Entrar() {
  const { cargando, sesion } = useSesion();
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useTitulo('Entrar');

  if (!cargando && sesion) return <Navigate to="/hoy" />;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/hoy`,
        shouldCreateUser: true,
      },
    });
    setEnviando(false);
    if (err) {
      setError('No se pudo enviar el enlace. Revisa el correo e inténtalo de nuevo.');
      return;
    }
    setEnviado(true);
  }

  return (
    <div className="pantalla-entrada">
      <header className="cabecera">
        <p className="eyebrow">Arquitectura de coherencia</p>
        <h1 className="titulo-grande">Senda <span className="text-gradient-quantum">Cuántica</span></h1>
        <p className="tenue">Práctica diaria de autoobservación</p>
      </header>

      <section className="tarjeta">
        {enviado ? (
          <>
            <h2 className="subtitulo">Revisa tu correo</h2>
            <p>
              Hemos enviado un enlace a <strong>{email}</strong>. Ábrelo desde este mismo
              dispositivo para entrar.
            </p>
          </>
        ) : (
          <form onSubmit={enviar} className="formulario">
            <h2 className="subtitulo">Entrar</h2>
            <p className="tenue">Te enviaremos un enlace de acceso. No hace falta contraseña.</p>
            <label className="etiqueta" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              className="campo"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={error ? 'error-email' : undefined}
            />
            {error && <p id="error-email" className="error" role="alert">{error}</p>}
            <button className="btn btn-primario" type="submit" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar enlace'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
