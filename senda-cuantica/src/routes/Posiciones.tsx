import { useState } from 'react';
import { useTitulo } from '../lib/titulo';

// Posiciones perceptuales (PNL): tres miradas sobre una misma situación. Nada se guarda.
const POSICIONES = [
  {
    id: 'yo',
    nombre: 'Mi posición',
    guia: 'Desde tus ojos: qué ves, qué sientes y qué necesitas.',
  },
  {
    id: 'otro',
    nombre: 'La otra persona',
    guia: 'Desde sus ojos: qué ve, qué le importa y qué intenta lograr. No hace falta acertar.',
  },
  {
    id: 'observador',
    nombre: 'Un observador',
    guia: 'Desde fuera, como alguien neutral que filma la escena: qué pasa realmente entre ambos.',
  },
] as const;

type Textos = Record<(typeof POSICIONES)[number]['id'], string>;
const VACIO: Textos = { yo: '', otro: '', observador: '' };

export function Posiciones() {
  useTitulo('Posiciones');
  const [paso, setPaso] = useState(0);
  const [textos, setTextos] = useState<Textos>(VACIO);
  const actual = POSICIONES[paso];

  return (
    <div className="pantalla">
      <header className="cabecera">
        <p className="eyebrow">PNL · perspectiva</p>
        <h1 className="titulo">Tres miradas</h1>
        <p className="tenue">Mira la misma situación desde tres lugares. Nada de lo que escribas se guarda.</p>
      </header>

      <div className="progreso" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={paso + 1} aria-label="Posición actual">
        <span style={{ width: `${((paso + 1) / POSICIONES.length) * 100}%` }} />
      </div>

      <section className="tarjeta hero formulario">
        <p className="eyebrow">Posición {paso + 1} de 3</p>
        <h2 className="subtitulo">{actual.nombre}</h2>
        <p className="tenue">{actual.guia}</p>
        <label className="etiqueta" htmlFor="texto-posicion">Lo que observas</label>
        <textarea
          id="texto-posicion"
          className="campo area"
          value={textos[actual.id]}
          onChange={(e) => setTextos({ ...textos, [actual.id]: e.target.value })}
        />
        <div className="acciones">
          <button type="button" className="btn btn-sec" disabled={paso === 0} onClick={() => setPaso(paso - 1)}>
            Anterior
          </button>
          <button
            type="button"
            className="btn btn-primario"
            disabled={paso === POSICIONES.length - 1}
            onClick={() => setPaso(paso + 1)}
          >
            Siguiente
          </button>
        </div>
      </section>

      {paso === POSICIONES.length - 1 && (
        <section className="tarjeta">
          <p className="eyebrow">Al terminar</p>
          <p>
            Pregúntate: ¿qué detalle nuevo ves desde la tercera mirada que no veías desde la primera? Si quieres
            conservarlo, pásalo a un reencuadre.
          </p>
        </section>
      )}
    </div>
  );
}
