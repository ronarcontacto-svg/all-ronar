import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { supabase } from '../lib/supabase';
import { useSesion } from '../lib/sesion';
import { useTitulo } from '../lib/titulo';
import { VERSION_CONSENTIMIENTO } from '../lib/consentimiento';

// Texto en tono legal formal, español de España.
// Borrador: pendiente de revisión jurídica antes de publicar.
export function Condiciones() {
  const { cargando, sesion, consentido, recargarConsentimiento } = useSesion();
  const navegar = useNavigate();
  useTitulo('Condiciones');
  const [acepto, setAcepto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cargando && !sesion) return <Navigate to="/entrar" />;
  if (!cargando && consentido) return <Navigate to="/hoy" />;

  async function aceptar(e: FormEvent) {
    e.preventDefault();
    if (!sesion || !acepto) return;
    setError(null);
    setGuardando(true);
    const uid = sesion.user.id;
    // upsert + ignoreDuplicates: si ya existe (doble clic, reintento), no se duplica (migración 0003).
    const { error: err } = await supabase.from('consentimientos').upsert(
      [
        { usuario_id: uid, tipo: 'condiciones', version: VERSION_CONSENTIMIENTO },
        { usuario_id: uid, tipo: 'datos', version: VERSION_CONSENTIMIENTO },
      ],
      { onConflict: 'usuario_id,tipo,version', ignoreDuplicates: true },
    );
    setGuardando(false);
    if (err) {
      setError('No se pudo registrar el consentimiento. Inténtalo de nuevo.');
      return;
    }
    await recargarConsentimiento();
    navegar({ to: '/hoy' });
  }

  return (
    <div className="pantalla-texto">
      <header className="cabecera">
        <p className="eyebrow">Antes de empezar</p>
        <h1 className="titulo">Condiciones de uso y consentimiento</h1>
        <p className="tenue">Versión {VERSION_CONSENTIMIENTO}</p>
      </header>

      <article className="tarjeta legal">
        <h2 className="subtitulo">1. Objeto</h2>
        <p>
          Senda Cuántica es una herramienta personal de registro y práctica de la autoobservación.
          No constituye un servicio de asistencia sanitaria, psicológica ni terapéutica, ni sustituye
          el consejo de profesionales cualificados. No garantiza resultado alguno.
        </p>

        <h2 className="subtitulo">2. Datos que se recogen</h2>
        <p>
          Se registran los datos que usted introduce voluntariamente: intenciones diarias, observaciones
          del cuaderno, sintonías y lecturas de estado. Algunos de estos contenidos pueden referirse a
          su salud emocional o física, por lo que tienen la consideración de categorías especiales.
        </p>

        <h2 className="subtitulo">3. Finalidad y base jurídica</h2>
        <p>
          Los datos se tratan únicamente para prestarle el servicio y mostrarle su propio historial.
          La base jurídica es su consentimiento expreso, que puede retirar en cualquier momento.
        </p>

        <h2 className="subtitulo">4. Conservación y acceso</h2>
        <p>
          Cada registro solo es accesible desde su cuenta, mediante reglas de seguridad a nivel de fila.
          Puede exportar sus datos y borrar sus registros desde su perfil.
        </p>

        <h2 className="subtitulo">5. Sus derechos</h2>
        <p>
          Puede ejercer los derechos de acceso, rectificación, supresión, limitación y portabilidad. Si
          considera que su tratamiento no es adecuado, puede presentar una reclamación ante la Agencia
          Española de Protección de Datos.
        </p>
      </article>

      <form onSubmit={aceptar} className="tarjeta hero formulario">
        <label className="casilla">
          <input
            type="checkbox"
            checked={acepto}
            onChange={(e) => setAcepto(e.target.checked)}
          />
          <span>
            He leído las condiciones y consiento expresamente el tratamiento de mis datos para
            los fines descritos.
          </span>
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primario" type="submit" disabled={!acepto || guardando}>
          {guardando ? 'Registrando…' : 'Aceptar y continuar'}
        </button>
      </form>
    </div>
  );
}
