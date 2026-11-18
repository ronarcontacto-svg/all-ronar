import { useState } from 'react';
import { useTitulo } from '../lib/titulo';

// Niveles neurológicos (marco de PNL). Es un mapa para observar, no una afirmación sobre cómo funciona la mente.
const NIVELES = [
  {
    id: 'entorno',
    nombre: 'Entorno',
    pregunta: '¿Dónde y con quién ocurre?',
    ejemplo: 'Lugares, personas y momentos concretos.',
  },
  {
    id: 'conducta',
    nombre: 'Conducta',
    pregunta: '¿Qué hago exactamente?',
    ejemplo: 'Acciones observables, sin interpretarlas.',
  },
  {
    id: 'capacidades',
    nombre: 'Capacidades',
    pregunta: '¿Cómo lo hago? ¿Qué habilidades uso o me faltan?',
    ejemplo: 'Estrategias, pasos, recursos.',
  },
  {
    id: 'creencias',
    nombre: 'Creencias y valores',
    pregunta: '¿Qué creo que es verdad aquí? ¿Qué me importa?',
    ejemplo: 'Permisos, prohibiciones, lo que tiene sentido para mí.',
  },
  {
    id: 'identidad',
    nombre: 'Identidad',
    pregunta: '¿Desde qué papel me vivo a mí mismo?',
    ejemplo: 'La idea de quién soy en esta situación.',
  },
] as const;

const RADIOS = [136, 110, 84, 58, 32];

export function Niveles() {
  useTitulo('Niveles');
  const [activo, setActivo] = useState<number | null>(null);
  const nivel = activo == null ? null : NIVELES[activo];

  return (
    <div className="pantalla">
      <header className="cabecera">
        <p className="eyebrow">PNL · mapa</p>
        <h1 className="titulo">Niveles neurológicos</h1>
        <p className="tenue">
          Un cambio en una capa afecta a las de dentro, pero no al revés. Elige una capa y observa qué hay en ella.
        </p>
      </header>

      <section className="tarjeta hero niveles-bloque">
        <svg viewBox="0 0 300 300" className="niveles-mapa" role="img" aria-label="Cinco capas concéntricas de entorno a identidad">
          {RADIOS.map((r, i) => (
            <circle
              key={NIVELES[i].id}
              cx={150}
              cy={150}
              r={r}
              className={`nivel-capa ${activo === i ? 'activa' : ''}`}
            />
          ))}
        </svg>

        <div className="niveles-botones" role="group" aria-label="Capas">
          {NIVELES.map((n, i) => (
            <button
              key={n.id}
              type="button"
              className={`opcion ${activo === i ? 'activa' : ''}`}
              aria-pressed={activo === i}
              onClick={() => setActivo(i)}
            >
              {n.nombre}
            </button>
          ))}
        </div>
      </section>

      {nivel && (
        <section className="tarjeta" aria-live="polite">
          <p className="eyebrow">{nivel.nombre}</p>
          <h2 className="subtitulo">{nivel.pregunta}</h2>
          <p className="tenue">{nivel.ejemplo}</p>
          <p>
            Pregúntate: ¿qué cambia si ajusto solo esta capa, y qué se mantiene? Lo que observes puede anotarse en el
            cuaderno o en un reencuadre.
          </p>
        </section>
      )}
    </div>
  );
}
