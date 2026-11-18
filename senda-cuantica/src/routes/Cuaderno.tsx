import { useState } from 'react';
import { useSesion } from '../lib/sesion';
import { guardarObservacion } from '../lib/datos';
import { useTitulo } from '../lib/titulo';

type Campo =
  | 'disparador'
  | 'emocion'
  | 'cuerpo'
  | 'cuando_aparezca'
  | 'hecho'
  | 'juicio'
  | 'emocion_nueva'
  | 'conducta'
  | 'elijo';

type Textos = Record<Campo, string>;

const VACIO: Textos = {
  disparador: '',
  emocion: '',
  cuerpo: '',
  cuando_aparezca: '',
  hecho: '',
  juicio: '',
  emocion_nueva: '',
  conducta: '',
  elijo: '',
};

// Ocho pasos. El paso 5 se divide en «Lo que ocurrió» (hecho) y «Lo que me dije» (juicio).
const PASOS: { titulo: string; pregunta: string; campo: Campo; intensidad?: boolean }[] = [
  { titulo: '1. Disparador', pregunta: '¿Qué situación lo disparó?', campo: 'disparador' },
  { titulo: '2. Emoción', pregunta: '¿Qué emoción apareció?', campo: 'emocion', intensidad: true },
  { titulo: '3. Cuerpo', pregunta: '¿Dónde lo sentiste en el cuerpo?', campo: 'cuerpo' },
  { titulo: '4. Cuándo aparece', pregunta: '¿En qué momento suele aparecer?', campo: 'cuando_aparezca' },
  { titulo: '5a. Lo que ocurrió', pregunta: 'Solo los hechos, sin interpretación.', campo: 'hecho' },
  { titulo: '5b. Lo que me dije', pregunta: 'La interpretación que añadí a lo ocurrido.', campo: 'juicio' },
  { titulo: '6. Emoción nueva', pregunta: '¿Qué emoción quiero sostener ahora?', campo: 'emocion_nueva' },
  { titulo: '7. Conducta', pregunta: '¿Qué haría si actuara desde esa emoción?', campo: 'conducta' },
  { titulo: '8. Elijo', pregunta: '¿Qué elijo para la próxima vez?', campo: 'elijo' },
];

export function Cuaderno() {
  const { sesion } = useSesion();
  useTitulo('Cuaderno');
  const uid = sesion?.user.id;
  const [paso, setPaso] = useState(0);
  const [textos, setTextos] = useState<Textos>(VACIO);
  const [intensidad, setIntensidad] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellado, setSellado] = useState(false);

  const actual = PASOS[paso];

  function reiniciar() {
    setPaso(0);
    setTextos(VACIO);
    setIntensidad(null);
    setError(null);
  }

  async function sellar() {
    if (!uid) return;
    setGuardando(true);
    setError(null);
    try {
      await guardarObservacion(uid, {
        disparador: textos.disparador.trim() || null,
        emocion: textos.emocion.trim() || null,
        intensidad,
        cuerpo: textos.cuerpo.trim() || null,
        cuando_aparezca: textos.cuando_aparezca.trim() || null,
        hecho: textos.hecho.trim() || null,
        juicio: textos.juicio.trim() || null,
        emocion_nueva: textos.emocion_nueva.trim() || null,
        conducta: textos.conducta.trim() || null,
        elijo: textos.elijo.trim() || null,
      });
      setSellado(true);
    } catch {
      setError('No se pudo guardar el registro. Tus respuestas siguen aquí; inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  if (sellado) {
    return (
      <div className="pantalla">
        <section className="tarjeta">
          <h1 className="titulo">Registro sellado</h1>
          <p>Queda en tu cuaderno.</p>
          <button className="btn btn-primario" onClick={() => { setSellado(false); reiniciar(); }}>
            Nuevo registro
          </button>
        </section>
      </div>
    );
  }

  const esUltimo = paso === PASOS.length - 1;

  return (
    <div className="pantalla">
      <header className="cabecera">
        <p className="eyebrow">Registro · ocho pasos</p>
        <h1 className="titulo">Cuaderno Dual</h1>
        <p className="cifra-paso">
          <span className="cifra">{Number.parseInt(actual.titulo, 10)}</span>
          <span className="cifra-de"> / 8</span>
        </p>
      </header>

      <div
        className="progreso"
        role="progressbar"
        aria-label="Progreso del cuaderno"
        aria-valuemin={1}
        aria-valuemax={8}
        aria-valuenow={Number.parseInt(actual.titulo, 10)}
      >
        <span style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }} />
      </div>

      <section className="tarjeta hero formulario hoja">
        <p className="eyebrow">Registro en curso</p>
        <h2 className="subtitulo">{actual.titulo}</h2>
        <p>{actual.pregunta}</p>

        {actual.intensidad && (
          <fieldset className="grupo">
            <legend className="etiqueta">Intensidad</legend>
            <div className="escala">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`opcion ${intensidad === n ? 'activa' : ''}`}
                  aria-pressed={intensidad === n}
                  aria-label={`Intensidad ${n} de 5`}
                  onClick={() => setIntensidad(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <label className="etiqueta" htmlFor="campo-paso">Tu respuesta</label>
        <textarea
          id="campo-paso"
          className="campo area"
          value={textos[actual.campo]}
          onChange={(e) => setTextos({ ...textos, [actual.campo]: e.target.value })}
        />

        {error && <p className="error" role="alert">{error}</p>}

        <div className="acciones">
          <button
            type="button"
            className="btn btn-sec"
            disabled={paso === 0 || guardando}
            onClick={() => setPaso(paso - 1)}
          >
            Anterior
          </button>
          {esUltimo ? (
            <button type="button" className="btn btn-primario" disabled={guardando} onClick={sellar}>
              {guardando ? 'Sellando…' : 'Sellar registro'}
            </button>
          ) : (
            <button type="button" className="btn btn-primario" onClick={() => setPaso(paso + 1)}>
              Siguiente
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
