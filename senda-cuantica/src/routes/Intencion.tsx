import { useEffect, useState, type FormEvent } from 'react';
import { useSesion } from '../lib/sesion';
import {
  cerrarIntencionNoche,
  guardarIntencionManana,
  intencionDelDia,
  type Intencion as IntencionTipo,
  type Variante,
} from '../lib/datos';
import { hoy } from '../lib/fechas';
import { useTitulo } from '../lib/titulo';

// Concepto del método, no hecho sobre la realidad: la intención es una forma de practicar.
const MARCO =
  'Según el marco que sigue esta práctica, hay dos modos de actuar. En el interno, se fuerza el resultado con esfuerzo. En el externo, se elige la variante y se actúa desde una certeza tranquila. Esto es una manera de practicar y observar, no una afirmación sobre cómo funciona la realidad.';

export function Intencion() {
  const { sesion } = useSesion();
  useTitulo('Intención');
  const uid = sesion?.user.id;
  const fecha = hoy();
  const [cargando, setCargando] = useState(true);
  const [intencion, setIntencion] = useState<IntencionTipo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [eleccion, setEleccion] = useState('');
  const [suelto, setSuelto] = useState('');

  const [modo, setModo] = useState<number | null>(null);
  const [variante, setVariante] = useState<Variante | null>(null);
  const [nota, setNota] = useState('');

  async function cargar() {
    if (!uid) return;
    const i = await intencionDelDia(uid, fecha);
    setIntencion(i);
    setCargando(false);
  }

  useEffect(() => {
    cargar().catch(() => {
      setError('No se pudo cargar la intención de hoy.');
      setCargando(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  async function guardarManana(e: FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setError(null);
    setGuardando(true);
    try {
      await guardarIntencionManana(uid, fecha, eleccion.trim(), suelto.trim());
      await cargar();
    } catch {
      setError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  async function cerrarNoche(e: FormEvent) {
    e.preventDefault();
    if (!intencion || modo == null || variante == null) return;
    setError(null);
    setGuardando(true);
    try {
      await cerrarIntencionNoche(intencion.id, modo, variante, nota.trim());
      await cargar();
    } catch {
      setError('No se pudo cerrar la intención. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <p className="tenue">Cargando…</p>;

  return (
    <div className="pantalla">
      <header className="cabecera">
        <p className="eyebrow">Campo de práctica · {fecha}</p>
        <h1 className="titulo">Intención</h1>
      </header>

      <details className="tarjeta marco">
        <summary>Marco del método</summary>
        <p>{MARCO}</p>
      </details>

      {error && <p className="error" role="alert">{error}</p>}

      {!intencion ? (
        <form className="tarjeta hero formulario" onSubmit={guardarManana}>
          <p className="eyebrow">Paso 1 · al empezar el día</p>
          <h2 className="subtitulo">Mañana</h2>
          <label className="etiqueta" htmlFor="eleccion">Hoy elijo…</label>
          <textarea
            id="eleccion"
            className="campo area"
            required
            value={eleccion}
            onChange={(e) => setEleccion(e.target.value)}
          />
          <label className="etiqueta" htmlFor="suelto">Lo que suelto</label>
          <textarea
            id="suelto"
            className="campo area"
            value={suelto}
            onChange={(e) => setSuelto(e.target.value)}
          />
          <button className="btn btn-primario" type="submit" disabled={guardando || !eleccion.trim()}>
            Sellar intención
          </button>
        </form>
      ) : (
        <section className="tarjeta">
          <h2 className="subtitulo">Intención sellada</h2>
          <p className="etiqueta">Hoy elijo</p>
          <p>{intencion.eleccion}</p>
          {intencion.suelto && (
            <>
              <p className="etiqueta">Lo que suelto</p>
              <p>{intencion.suelto}</p>
            </>
          )}
        </section>
      )}

      {intencion && !intencion.cerrada_en && (
        <form className="tarjeta hero formulario" onSubmit={cerrarNoche}>
          <p className="eyebrow">Paso 2 · al cerrar el día</p>
          <h2 className="subtitulo">Noche</h2>
          <fieldset className="grupo">
            <legend className="etiqueta">¿Desde dónde actuaste?</legend>
            <p className="tenue">1 = forzando · 5 = certeza tranquila</p>
            <div className="escala">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`opcion ${modo === n ? 'activa' : ''}`}
                  aria-pressed={modo === n}
                  aria-label={`Nivel ${n} de 5`}
                  onClick={() => setModo(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="grupo">
            <legend className="etiqueta">¿Se dio la variante?</legend>
            <div className="escala">
              {(['si', 'parcial', 'no'] as Variante[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`opcion ancha ${variante === v ? 'activa' : ''}`}
                  aria-pressed={variante === v}
                  onClick={() => setVariante(v)}
                >
                  {v === 'si' ? 'Sí' : v === 'parcial' ? 'Parcial' : 'No'}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="etiqueta" htmlFor="nota">Nota (opcional)</label>
          <textarea id="nota" className="campo area" value={nota} onChange={(e) => setNota(e.target.value)} />
          <button
            className="btn btn-primario"
            type="submit"
            disabled={guardando || modo == null || variante == null}
          >
            Cerrar el día
          </button>
        </form>
      )}

      {intencion?.cerrada_en && (
        <section className="tarjeta">
          <h2 className="subtitulo">Día cerrado</h2>
          <p>Nivel {intencion.modo_real} de 5 · variante {intencion.variante_cumplida === 'si' ? 'sí' : intencion.variante_cumplida === 'parcial' ? 'parcial' : 'no'}</p>
          {intencion.nota && <p className="tenue">{intencion.nota}</p>}
        </section>
      )}
    </div>
  );
}
