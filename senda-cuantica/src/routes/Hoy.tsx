import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useSesion } from '../lib/sesion';
import { useTitulo } from '../lib/titulo';
import { cargarHistorial, type Intencion, type Observacion, type Sintonia } from '../lib/datos';
import { calcularPatrones } from '../lib/patrones';
import { desplazar, fechaDe, hoy } from '../lib/fechas';

function estadioDe(dias: number): string {
  if (dias === 0) return 'Sin comenzar';
  if (dias < 7) return 'Primeros pasos';
  if (dias < 21) return 'Constancia';
  if (dias < 50) return 'Integración';
  return 'Asentamiento';
}

const ETIQUETA_VARIANTE = { si: 'Sí', parcial: 'Parcial', no: 'No' } as const;

export function Hoy() {
  const { sesion } = useSesion();
  useTitulo('Hoy');
  const uid = sesion?.user.id;
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intenciones, setIntenciones] = useState<Intencion[]>([]);
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [sintonias, setSintonias] = useState<Sintonia[]>([]);

  useEffect(() => {
    if (!uid) return;
    let activo = true;
    cargarHistorial(uid)
      .then((h) => {
        if (!activo) return;
        setIntenciones(h.intenciones);
        setObservaciones(h.observaciones);
        setSintonias(h.sintonias);
      })
      .catch(() => activo && setError('No se pudo cargar tu historial.'))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [uid]);

  const fechaHoy = hoy();

  const diasPracticados = useMemo(() => {
    const set = new Set<string>();
    intenciones.forEach((i) => set.add(i.fecha));
    observaciones.forEach((o) => set.add(fechaDe(new Date(o.creada_en))));
    sintonias.forEach((s) => set.add(fechaDe(new Date(s.creada_en))));
    return set;
  }, [intenciones, observaciones, sintonias]);

  const ultimos7 = useMemo(() => {
    let n = 0;
    for (let i = 0; i < 7; i++) if (diasPracticados.has(desplazar(fechaHoy, -i))) n++;
    return n;
  }, [diasPracticados, fechaHoy]);

  const intencionHoy = intenciones.find((i) => i.fecha === fechaHoy) ?? null;
  const observacionesHoy = observaciones.filter((o) => fechaDe(new Date(o.creada_en)) === fechaHoy).length;
  const sintoniasHoy = sintonias.filter((s) => fechaDe(new Date(s.creada_en)) === fechaHoy).length;

  const patrones = useMemo(() => calcularPatrones(observaciones, intenciones), [observaciones, intenciones]);

  if (cargando) return <p className="tenue" role="status">Cargando…</p>;

  const manana = intencionHoy ? 'Sellada' : 'Pendiente';
  const momento =
    observacionesHoy + sintoniasHoy > 0
      ? `${observacionesHoy} en el cuaderno · ${sintoniasHoy} sintonía${sintoniasHoy === 1 ? '' : 's'}`
      : 'Pendiente';
  const noche = !intencionHoy
    ? 'Pendiente'
    : intencionHoy.cerrada_en
      ? 'Cerrada'
      : 'Pendiente';

  return (
    <div className="pantalla">
      <section className="tarjeta hero">
        <p className="eyebrow">Campo de práctica · {fechaHoy}</p>
        <h1 className="titulo-grande">
          Interrumpe, <span className="text-gradient-quantum">sintoniza</span>, sella.
        </h1>
        <p className="tenue">Observa, registra, vuelve a sintonizar.</p>
      </section>

      {error && <p className="error" role="alert">{error}</p>}

      <section className="tarjeta">
        <h2 className="subtitulo">Hilo del día</h2>
        <ol className="hilo">
          <li>
            <Link to="/intencion" className="hilo-fila">
              <span>Mañana · intención</span>
              <span className="estado">{manana}</span>
            </Link>
          </li>
          <li>
            <Link to="/cuaderno" className="hilo-fila">
              <span>Momento · cuaderno y sintonía</span>
              <span className="estado">{momento}</span>
            </Link>
          </li>
          <li>
            <Link to="/intencion" className="hilo-fila">
              <span>Noche · ¿desde dónde actuaste?</span>
              <span className="estado">{noche}</span>
            </Link>
          </li>
        </ol>
      </section>

      <div className="metricas">
        <article className="tarjeta metrica">
          <p className="eyebrow">Constancia</p>
          <p className="cifra">{ultimos7}<span className="cifra-de"> / 7</span></p>
          <p className="tenue">Días con registro en la última semana.</p>
        </article>
        <article className="tarjeta metrica">
          <p className="eyebrow">Estadio</p>
          <p className="cifra cifra-texto">{estadioDe(diasPracticados.size)}</p>
          <p className="tenue">Según tus días de práctica.</p>
        </article>
        <article className="tarjeta metrica">
          <p className="eyebrow">Días en total</p>
          <p className="cifra">{diasPracticados.size}</p>
          <p className="tenue">Días con algún registro.</p>
        </article>
      </div>

      <section className="tarjeta">
        <h2 className="subtitulo">Lectura de patrones</h2>
        {patrones.registros === 0 && intenciones.length === 0 ? (
          <p className="tenue">Aún no hay registros. Cuando tengas al menos 3 de cada tipo, verás aquí lo que se repite.</p>
        ) : (
          <>
            <div className="patron">
              <h3 className="etiqueta">Disparador más frecuente</h3>
              {patrones.disparador ? (
                <p>«{patrones.disparador.texto}» · {patrones.disparador.veces} veces</p>
              ) : (
                <p className="tenue">Faltan {patrones.faltanDisparador} registros con disparador.</p>
              )}
            </div>
            <div className="patron">
              <h3 className="etiqueta">Franja horaria más frecuente</h3>
              {patrones.hora ? (
                <p>{patrones.hora.franja} · {patrones.hora.veces} observaciones</p>
              ) : (
                <p className="tenue">Faltan {patrones.faltanHora} observaciones.</p>
              )}
            </div>
            <div className="patron">
              <h3 className="etiqueta">Desde dónde actuaste y si se dio la variante</h3>
              {patrones.faltanRelacion > 0 && patrones.relacion.length === 0 ? (
                <p className="tenue">Faltan {patrones.faltanRelacion} intenciones cerradas.</p>
              ) : (
                <ul className="lista-simple">
                  {patrones.relacion.map((r) => (
                    <li key={r.variante}>
                      Variante {ETIQUETA_VARIANTE[r.variante].toLowerCase()}: nivel medio {r.modoMedio} de 5 ({r.n} días)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
