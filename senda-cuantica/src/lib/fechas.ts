export const ZONA = 'Europe/Madrid';

const formatoFecha = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const formatoHora = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONA,
  hour: '2-digit',
  hour12: false,
});

/** Fecha local (Madrid) en formato YYYY-MM-DD. */
export function fechaDe(d: Date): string {
  return formatoFecha.format(d);
}

export function hoy(): string {
  return fechaDe(new Date());
}

/** Desplaza una fecha YYYY-MM-DD un número de días. */
export function desplazar(fecha: string, dias: number): string {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** Hora local (0-23) de una fecha. */
export function horaDe(d: Date): number {
  return Number(formatoHora.format(d)) % 24;
}
