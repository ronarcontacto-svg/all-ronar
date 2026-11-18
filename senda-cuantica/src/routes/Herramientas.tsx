import { Link } from '@tanstack/react-router';
import { useTitulo } from '../lib/titulo';

// Todas las herramientas en un solo sitio, para que la navegación móvil tenga cinco pestañas.
const HERRAMIENTAS = [
  {
    to: '/rueda',
    etiqueta: 'Mirada de conjunto',
    nombre: 'Rueda de la vida',
    descripcion: 'Puntúa ocho áreas de tu vida y mira dónde estás más bajo hoy.',
  },
  {
    to: '/reencuadre',
    etiqueta: 'PNL · significado',
    nombre: 'Reencuadre',
    descripcion: 'Separa lo que ocurrió de lo que te dijiste y busca otra lectura igual de posible.',
  },
  {
    to: '/niveles',
    etiqueta: 'PNL · mapa',
    nombre: 'Niveles neurológicos',
    descripcion: 'Observa en qué capa está un cambio: entorno, conducta, capacidades, creencias o identidad.',
  },
  {
    to: '/metamodelo',
    etiqueta: 'PNL · lenguaje',
    nombre: 'Metamodelo',
    descripcion: 'Mira qué palabras vuelven rígida una frase y qué pregunta la afina.',
  },
  {
    to: '/posiciones',
    etiqueta: 'PNL · perspectiva',
    nombre: 'Tres miradas',
    descripcion: 'Observa una situación desde tu lugar, desde el de la otra persona y desde fuera.',
  },
] as const;

export function Herramientas() {
  useTitulo('Herramientas');
  return (
    <div className="pantalla">
      <header className="cabecera">
        <p className="eyebrow">Práctica complementaria</p>
        <h1 className="titulo">Herramientas</h1>
        <p className="tenue">Úsalas cuando una situación se repita y quieras mirarla con más detalle.</p>
      </header>

      <div className="herramientas">
        {HERRAMIENTAS.map((h) => (
          <Link key={h.to} to={h.to} className="tarjeta herramienta">
            <p className="eyebrow">{h.etiqueta}</p>
            <h2 className="subtitulo">{h.nombre}</h2>
            <p className="tenue">{h.descripcion}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
