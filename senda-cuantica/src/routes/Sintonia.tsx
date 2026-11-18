import { useEffect, useState } from 'react';
import { useSesion } from '../lib/sesion';
import { guardarSintonia } from '../lib/datos';
import { Circulo } from '../components/Circulo';
import { useTitulo } from '../lib/titulo';

type Fase = 'entrada' | 'elegir' | 'sesion' | 'salida' | 'hecho';

const LECTURA = [1, 2, 3, 4, 5];

function Lectura({ titulo, onElegir }: { titulo: string; onElegir: (n: number) => void }) {
  return (
    <section className="tarjeta">
      <h2 className="subtitulo">{titulo}</h2>
      <p className="tenue">1 = disperso · 5 = centrado</p>
      <div className="escala">
        {LECTURA.map((n) => (
          <button key={n} type="button" className="opcion" aria-label={`Nivel ${n} de 5`} onClick={() => onElegir(n)}>
            {n}
          </button>
        ))}
      </div>
    </section>
  );
}

export function Sintonia() {
  const { sesion } = useSesion();
  useTitulo('Sintonía');
  const uid = sesion?.user.id;
  const [fase, setFase] = useState<Fase>('entrada');
  const [lecturaEntrada, setLecturaEntrada] = useState<number | null>(null);
  const [minutos, setMinutos] = useState<1 | 3 | 5>(1);
  const [restante, setRestante] = useState(60);
  const [completada, setCompletada] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cuenta atrás de 1 s durante la sesión.
  useEffect(() => {
    if (fase !== 'sesion') return;
    const id = window.setInterval(() => setRestante((r) => r - 1), 1000);
    return () => window.clearInterval(id);
  }, [fase]);

  // Al llegar a cero, la sesión se da por completada.
  useEffect(() => {
    if (fase === 'sesion' && restante <= 0) {
      setCompletada(true);
      setFase('salida');
    }
  }, [fase, restante]);

  function iniciar() {
    setRestante(minutos * 60);
    setCompletada(false);
    setFase('sesion');
  }

  function salir() {
    // Botón Salir: termina antes de tiempo, no se marca como completada.
    setCompletada(false);
    setFase('salida');
  }

  async function registrarSalida(lecturaSalida: number | null) {
    if (!uid || lecturaEntrada == null) return;
    setError(null);
    try {
      await guardarSintonia(uid, {
        duracion_seg: minutos * 60,
        lectura_entrada: lecturaEntrada,
        lectura_salida: lecturaSalida,
        completada,
      });
      setFase('hecho');
    } catch {
      setError('No se pudo guardar la sintonía. Inténtalo de nuevo.');
    }
  }

  const mm = String(Math.floor(Math.max(restante, 0) / 60)).padStart(2, '0');
  const ss = String(Math.max(restante, 0) % 60).padStart(2, '0');

  if (fase === 'sesion') {
    return (
      <div className="pantalla pantalla-sesion">
        <h1 className="sr-only">Sintonía en curso</h1>
        {/* Salir siempre visible durante la sesión */}
        <button type="button" className="btn btn-salir" onClick={salir}>
          Salir
        </button>
        <p className="contador" aria-live="off">{mm}:{ss}</p>
        <Circulo activo />
      </div>
    );
  }

  return (
    <div className="pantalla">
      <header className="cabecera">
        <h1 className="titulo">Sintonía 0,1 Hz</h1>
        <p className="tenue">Respiración de 5 segundos entre inhalación y exhalación.</p>
      </header>

      {error && <p className="error" role="alert">{error}</p>}

      {fase === 'entrada' && (
        <Lectura
          titulo="Lectura de entrada"
          onElegir={(n) => {
            setLecturaEntrada(n);
            setFase('elegir');
          }}
        />
      )}

      {fase === 'elegir' && (
        <section className="tarjeta formulario">
          <h2 className="subtitulo">Duración</h2>
          <div className="escala">
            {([1, 3, 5] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`opcion ancha ${minutos === m ? 'activa' : ''}`}
                aria-pressed={minutos === m}
                onClick={() => setMinutos(m)}
              >
                {m} min
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primario" onClick={iniciar}>
            Sintonizar
          </button>
        </section>
      )}

      {fase === 'salida' && (
        <section className="tarjeta">
          <h2 className="subtitulo">{completada ? 'Sesión completada' : 'Sesión interrumpida'}</h2>
          <p className="tenue">Ahora, tu lectura de salida (puedes saltarla).</p>
          <div className="escala">
            {LECTURA.map((n) => (
              <button key={n} type="button" className="opcion" aria-label={`Nivel de salida ${n} de 5`} onClick={() => registrarSalida(n)}>
                {n}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-sec" onClick={() => registrarSalida(null)}>
            Saltar y sellar
          </button>
        </section>
      )}

      {fase === 'hecho' && (
        <section className="tarjeta">
          <h2 className="subtitulo">Sintonía sellada</h2>
          <button
            type="button"
            className="btn btn-primario"
            onClick={() => {
              setLecturaEntrada(null);
              setFase('entrada');
            }}
          >
            Nueva sintonía
          </button>
        </section>
      )}
    </div>
  );
}
