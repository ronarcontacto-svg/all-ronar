import { horaDe } from './fechas';
import type { Intencion, Observacion, Variante } from './datos';

const MINIMO = 3;

export type Patrones = {
  registros: number;
  disparador: { texto: string; veces: number } | null;
  faltanDisparador: number;
  hora: { franja: string; veces: number } | null;
  faltanHora: number;
  relacion: { variante: Variante; modoMedio: number; n: number }[];
  faltanRelacion: number;
};

function franja(h: number): string {
  return `${String(h).padStart(2, '0')}:00–${String((h + 1) % 24).padStart(2, '0')}:00`;
}

/**
 * Reglas simples, sin IA:
 * - disparador más repetido (texto normalizado)
 * - franja horaria más frecuente de las observaciones
 * - modo_real medio según variante_cumplida (solo intenciones cerradas)
 * Cada patrón exige al menos MINIMO registros; si no, indica cuántos faltan.
 */
export function calcularPatrones(obs: Observacion[], ints: Intencion[]): Patrones {
  const conDisparador = obs.filter((o) => o.disparador && o.disparador.trim());
  const conteoDisp = new Map<string, number>();
  for (const o of conDisparador) {
    const clave = o.disparador!.trim().toLowerCase();
    conteoDisp.set(clave, (conteoDisp.get(clave) ?? 0) + 1);
  }
  let disparador: Patrones['disparador'] = null;
  if (conDisparador.length >= MINIMO) {
    const [texto, veces] = [...conteoDisp.entries()].sort((a, b) => b[1] - a[1])[0];
    disparador = { texto, veces };
  }

  const conteoHora = new Map<number, number>();
  for (const o of obs) {
    const h = horaDe(new Date(o.creada_en));
    conteoHora.set(h, (conteoHora.get(h) ?? 0) + 1);
  }
  let hora: Patrones['hora'] = null;
  if (obs.length >= MINIMO) {
    const [h, veces] = [...conteoHora.entries()].sort((a, b) => b[1] - a[1])[0];
    hora = { franja: franja(h), veces };
  }

  const cerradas = ints.filter((i) => i.modo_real != null && i.variante_cumplida != null);
  const variantes: Variante[] = ['si', 'parcial', 'no'];
  const relacion = variantes
    .map((variante) => {
      const grupo = cerradas.filter((i) => i.variante_cumplida === variante);
      const modoMedio = grupo.length
        ? grupo.reduce((s, i) => s + (i.modo_real ?? 0), 0) / grupo.length
        : 0;
      return { variante, modoMedio: Math.round(modoMedio * 10) / 10, n: grupo.length };
    })
    .filter((r) => r.n > 0);

  return {
    registros: obs.length,
    disparador,
    faltanDisparador: Math.max(0, MINIMO - conDisparador.length),
    hora,
    faltanHora: Math.max(0, MINIMO - obs.length),
    relacion,
    faltanRelacion: Math.max(0, MINIMO - cerradas.length),
  };
}
