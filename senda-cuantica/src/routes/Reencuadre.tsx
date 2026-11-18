import { useEffect, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useSesion } from '../lib/sesion';
import { useTitulo } from '../lib/titulo';
import { cargarReencuadres, guardarReencuadre, type Reencuadre as ReencuadreTipo } from '../lib/datos';

// Técnica de reencuadre (PNL): no se trata de tener razón, sino de ver otra lectura posible.
const PASOS = [
  { titulo: '1. Situación', ayuda: 'Describe solo lo que ocurrió, como lo grabaría una cámara.', campo: 'situacion' },
  { titulo: '2. Lo que me dije', ayuda: '¿Qué significado le di? ¿Qué pensé de mí o de la otra persona?', campo: 'significado_inicial' },
  { titulo: '3. Otra lectura posible', ayuda: 'Una interpretación igual de posible que te sirva más para actuar.', campo: 'significado_nuevo' },
] as const;

type Campos = { situacion: string; significado_inicial: string; significado_nuevo: string; nota: string };
const VACIO: Campos = { situacion: '', significado_inicial: '', significado_nuevo: '', nota: '' };

export function Reencuadre() {
  const { sesion } = useSesion();
  useTitulo('Reencuadre');
  const uid = sesion?.user.id;
  const [paso, setPaso] = useState(0);
  const [campos, setCampos] = useState<Campos>(VACIO);
  const [historial, setHistorial] = useState<ReencuadreTipo[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    cargarReencuadres(uid)
      .then(setHistorial)
      .catch(() => setError('No se pudo cargar tu historial.'));
  }, [uid]);

  const actual = PASOS[paso];
  const esUltimo = paso === PASOS.length - 1;

  async function sellar(e: FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await guardarReencuadre(uid, {
        situacion: campos.situacion.trim(),
        significado_inicial: campos.significado_inicial.trim() || null,
        significado_nuevo: campos.significado_nuevo.trim(),
        nota: campos.nota.trim() || null,
      });
      setHistorial(await cargarReencuadres(uid));
      setCampos(VACIO);
      setPaso(0);
      setMensaje('Reencuadre guardado.');
    } catch {
      setError('No se pudo guardar. Tus respuestas siguen aquí; inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  const listo = campos.situacion.trim() !== '' && campos.significado_nuevo.trim() !== '';

  return (
    <div className="pantalla">
      <header className="cabecera">
        <p className="eyebrow">PNL · reencuadre</p>
        <h1 className="titulo">Otra lectura</h1>
        <p className="tenue">Cuando una situación te pesa, observa qué significado le diste y busca otro igual de posible.</p>
      </header>

      {mensaje && <p className="aviso" role="status">{mensaje}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      <form className="tarjeta hero formulario" onSubmit={sellar}>
        <div className="progreso" role="progressbar" aria-valuemin={1} aria-valuemax={PASOS.length} aria-valuenow={paso + 1} aria-label="Progreso del reencuadre">
          <span style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }} />
        </div>
        <p className="eyebrow">Paso {paso + 1} de {PASOS.length}</p>
        <h2 className="subtitulo">{actual.titulo}</h2>
        <p className="tenue">{actual.ayuda}</p>
        <label className="etiqueta" htmlFor="campo-reencuadre">Tu respuesta</label>
        <textarea
          id="campo-reencuadre"
          className="campo area"
          value={campos[actual.campo]}
          onChange={(e) => setCampos({ ...campos, [actual.campo]: e.target.value })}
        />
        {esUltimo && (
          <>
            <label className="etiqueta" htmlFor="nota-reencuadre">Nota (opcional)</label>
            <textarea id="nota-reencuadre" className="campo area" value={campos.nota} onChange={(e) => setCampos({ ...campos, nota: e.target.value })} />
          </>
        )}
        <div className="acciones">
          <button type="button" className="btn btn-sec" disabled={paso === 0 || guardando} onClick={() => setPaso(paso - 1)}>
            Anterior
          </button>
          {esUltimo ? (
            <button type="submit" className="btn btn-primario" disabled={!listo || guardando}>
              {guardando ? 'Guardando…' : 'Guardar reencuadre'}
            </button>
          ) : (
            <button type="button" className="btn btn-primario" onClick={() => setPaso(paso + 1)} disabled={actual.campo === 'situacion' && !campos.situacion.trim()}>
              Siguiente
            </button>
          )}
        </div>
      </form>

      <p>
        <Link to="/niveles" className="enlace">Ver el mapa de niveles neurológicos</Link>
      </p>

      {historial.length > 0 && (
        <section className="tarjeta">
          <p className="eyebrow">Tus reencuadres</p>
          <ul className="lista-simple">
            {historial.slice(0, 5).map((r) => (
              <li key={r.id}>
                <strong>{new Date(r.creada_en).toLocaleDateString('es-ES')}</strong> · {r.situacion}
                <br />
                <span className="tenue">Otra lectura: {r.significado_nuevo}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
