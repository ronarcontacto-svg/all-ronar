import { useEffect, useMemo, useState } from 'react';
import { useSesion } from '../lib/sesion';
import { useTitulo } from '../lib/titulo';
import { AREAS_RUEDA, cargarRuedas, guardarRueda, type Puntuaciones, type Rueda as RuedaTipo } from '../lib/datos';

const CENTRO = 150;
const RADIO = 118;

function punto(i: number, valor: number): [number, number] {
  const angulo = -Math.PI / 2 + (i * 2 * Math.PI) / AREAS_RUEDA.length;
  const r = (valor / 10) * RADIO;
  return [CENTRO + r * Math.cos(angulo), CENTRO + r * Math.sin(angulo)];
}

function Rueda({ valores }: { valores: Puntuaciones }) {
  const poligono = useMemo(
    () => AREAS_RUEDA.map((a, i) => punto(i, valores[a] ?? 1).join(',')).join(' '),
    [valores],
  );
  return (
    <svg viewBox="0 0 300 300" className="rueda" role="img" aria-label="Rueda de la vida con tus puntuaciones">
      {[2, 4, 6, 8, 10].map((n) => (
        <circle key={n} cx={CENTRO} cy={CENTRO} r={(n / 10) * RADIO} className="rueda-anillo" />
      ))}
      {AREAS_RUEDA.map((a, i) => {
        const [x, y] = punto(i, 10);
        const [lx, ly] = punto(i, 11.6);
        return (
          <g key={a}>
            <line x1={CENTRO} y1={CENTRO} x2={x} y2={y} className="rueda-eje" />
            <text x={lx} y={ly} className="rueda-etiqueta" textAnchor="middle" dominantBaseline="middle">
              {a}
            </text>
          </g>
        );
      })}
      <polygon points={poligono} className="rueda-forma" />
      {AREAS_RUEDA.map((a, i) => {
        const [x, y] = punto(i, valores[a] ?? 1);
        return <circle key={a} cx={x} cy={y} r={3.5} className="rueda-punto" />;
      })}
    </svg>
  );
}

export function RuedaVida() {
  const { sesion } = useSesion();
  useTitulo('Rueda de la vida');
  const uid = sesion?.user.id;
  const inicial = useMemo(() => Object.fromEntries(AREAS_RUEDA.map((a) => [a, 5])) as Puntuaciones, []);
  const [valores, setValores] = useState<Puntuaciones>(inicial);
  const [historial, setHistorial] = useState<RuedaTipo[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    cargarRuedas(uid)
      .then((r) => {
        setHistorial(r);
        if (r[0]) setValores(r[0].puntuaciones);
      })
      .catch(() => setError('No se pudo cargar tu rueda.'));
  }, [uid]);

  async function guardar() {
    if (!uid) return;
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await guardarRueda(uid, valores);
      setHistorial(await cargarRuedas(uid));
      setMensaje('Guardado.');
    } catch {
      setError('No se pudo guardar la rueda. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  const masBaja = AREAS_RUEDA.reduce((a, b) => ((valores[b] ?? 10) < (valores[a] ?? 10) ? b : a));

  return (
    <div className="pantalla">
      <header className="cabecera">
        <p className="eyebrow">Mirada de conjunto</p>
        <h1 className="titulo">Rueda de la vida</h1>
        <p className="tenue">Puntúa cada área de 1 a 10, según cómo la vives hoy.</p>
      </header>

      {mensaje && <p className="aviso" role="status">{mensaje}</p>}
      {error && <p className="error" role="alert">{error}</p>}

      <section className="tarjeta hero rueda-bloque">
        <Rueda valores={valores} />
        <p className="tenue">El área que más pide atención hoy: <strong>{masBaja}</strong>.</p>
      </section>

      <section className="tarjeta formulario">
        <p className="eyebrow">Puntúa</p>
        {AREAS_RUEDA.map((a) => (
          <label key={a} className="rango">
            <span className="rango-cabecera">
              <span>{a}</span>
              <span className="cifra-pequena">{valores[a]}</span>
            </span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={valores[a]}
              onChange={(e) => setValores({ ...valores, [a]: Number(e.target.value) })}
              aria-label={`${a}, puntuación de 1 a 10`}
            />
          </label>
        ))}
        <button type="button" className="btn btn-primario" onClick={guardar} disabled={guardando || !uid}>
          {guardando ? 'Guardando…' : 'Guardar rueda'}
        </button>
      </section>

      {historial.length > 0 && (
        <section className="tarjeta">
          <p className="eyebrow">Historial</p>
          <ul className="lista-simple">
            {historial.slice(0, 5).map((r) => (
              <li key={r.id}>
                {new Date(r.creada_en).toLocaleDateString('es-ES')} · media{' '}
                {(Object.values(r.puntuaciones).reduce((s, v) => s + v, 0) / AREAS_RUEDA.length).toFixed(1)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
