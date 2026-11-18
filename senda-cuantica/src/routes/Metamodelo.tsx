import { useMemo, useState } from 'react';
import { useTitulo } from '../lib/titulo';

// Metamodelo (PNL): preguntas que concretan generalizaciones, omisiones y juicios. Todo ocurre en el navegador; no se guarda nada.
type Patron = { id: string; pista: RegExp; nombre: string; pregunta: string };

const PATRONES: Patron[] = [
  {
    id: 'universal',
    pista: /\b(siempre|nunca|todos?|todas?|nadie|nada|cada vez)\b/i,
    nombre: 'Generalización',
    pregunta: '¿Siempre ha sido así? ¿Hubo alguna vez que no?',
  },
  {
    id: 'deber',
    pista: /\b(debo|debería|tengo que|tendría que|hay que)\b/i,
    nombre: 'Obligación',
    pregunta: '¿Qué pasaría si no lo hiciera? ¿Quién lo dice?',
  },
  {
    id: 'imposibilidad',
    pista: /\b(no puedo|es imposible|no soy capaz)\b/i,
    nombre: 'Imposibilidad',
    pregunta: '¿Qué te impide exactamente? ¿Qué has intentado?',
  },
  {
    id: 'causa',
    pista: /\b(me hace|me hizo|me pone|es culpa|por culpa de)\b/i,
    nombre: 'Causa y efecto',
    pregunta: '¿Cómo exactamente produce eso en ti? ¿Siempre te afecta igual?',
  },
  {
    id: 'lectura',
    pista: /\b(sé que|se que|pensará|piensa que|quiere decir)\b/i,
    nombre: 'Lectura de mente',
    pregunta: '¿Cómo lo sabes? ¿Qué te lo confirma? ¿Qué otra explicación hay?',
  },
  {
    id: 'nominal',
    pista: /\b(es un|es una|son unos|es un\/a)\s+\w+/i,
    nombre: 'Etiqueta',
    pregunta: '¿Qué hizo exactamente esa persona o situación, sin la etiqueta?',
  },
];

export function Metamodelo() {
  useTitulo('Metamodelo');
  const [frase, setFrase] = useState('');
  const encontrados = useMemo(() => PATRONES.filter((p) => p.pista.test(frase)), [frase]);

  return (
    <div className="pantalla">
      <header className="cabecera">
        <p className="eyebrow">PNL · lenguaje</p>
        <h1 className="titulo">Metamodelo</h1>
        <p className="tenue">Escribe una frase que te hayas dicho. Mira qué palabras la vuelven rígida.</p>
      </header>

      <section className="tarjeta hero formulario">
        <label className="etiqueta" htmlFor="frase">Tu frase</label>
        <textarea
          id="frase"
          className="campo area"
          value={frase}
          onChange={(e) => setFrase(e.target.value)}
          placeholder="Ej.: siempre me interrumpen y nadie escucha"
        />
      </section>

      <section className="tarjeta" aria-live="polite">
        {frase.trim() === '' ? (
          <p className="tenue">Cuando escribas una frase, aquí aparecerán las preguntas que la afinan.</p>
        ) : encontrados.length === 0 ? (
          <p className="tenue">No veo generalizaciones evidentes. Aun así, pregúntate: ¿qué parte exacta de esto es un hecho?</p>
        ) : (
          <ul className="lista-simple">
            {encontrados.map((p) => (
              <li key={p.id}>
                <p className="eyebrow">{p.nombre}</p>
                <p>{p.pregunta}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
