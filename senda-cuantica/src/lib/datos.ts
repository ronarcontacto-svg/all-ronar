import { supabase } from './supabase';

export type Variante = 'si' | 'parcial' | 'no';

export type Intencion = {
  id: string;
  fecha: string;
  eleccion: string;
  suelto: string | null;
  modo_real: number | null;
  variante_cumplida: Variante | null;
  nota: string | null;
  creada_en: string;
  cerrada_en: string | null;
};

export type Observacion = {
  id: string;
  creada_en: string;
  disparador: string | null;
  emocion: string | null;
  intensidad: number | null;
  cuerpo: string | null;
  hecho: string | null;
  juicio: string | null;
  emocion_nueva: string | null;
  conducta: string | null;
  cuando_aparezca: string | null;
  elijo: string | null;
};

export type Sintonia = {
  id: string;
  creada_en: string;
  duracion_seg: number;
  lectura_entrada: number;
  lectura_salida: number | null;
  completada: boolean;
};

const COLS_INTENCION =
  'id, fecha, eleccion, suelto, modo_real, variante_cumplida, nota, creada_en, cerrada_en';
const COLS_OBSERVACION =
  'id, creada_en, disparador, emocion, intensidad, cuerpo, hecho, juicio, emocion_nueva, conducta, cuando_aparezca, elijo';
const COLS_SINTONIA = 'id, creada_en, duracion_seg, lectura_entrada, lectura_salida, completada';

function ok<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export async function intencionDelDia(uid: string, fecha: string): Promise<Intencion | null> {
  return ok(
    await supabase
      .from('intenciones_diarias')
      .select(COLS_INTENCION)
      .eq('usuario_id', uid)
      .eq('fecha', fecha)
      .maybeSingle(),
  );
}

export async function guardarIntencionManana(
  uid: string,
  fecha: string,
  eleccion: string,
  suelto: string,
): Promise<void> {
  ok(
    await supabase
      .from('intenciones_diarias')
      .insert({ usuario_id: uid, fecha, eleccion, suelto: suelto || null }),
  );
}

export async function cerrarIntencionNoche(
  id: string,
  modoReal: number,
  variante: Variante,
  nota: string,
): Promise<void> {
  ok(
    await supabase
      .from('intenciones_diarias')
      .update({
        modo_real: modoReal,
        variante_cumplida: variante,
        nota: nota || null,
        cerrada_en: new Date().toISOString(),
      })
      .eq('id', id),
  );
}

export async function guardarObservacion(
  uid: string,
  datos: Omit<Observacion, 'id' | 'creada_en'>,
): Promise<void> {
  ok(await supabase.from('observaciones').insert({ usuario_id: uid, ...datos }));
}

export async function guardarSintonia(
  uid: string,
  datos: Omit<Sintonia, 'id' | 'creada_en'>,
): Promise<void> {
  ok(await supabase.from('sintonias').insert({ usuario_id: uid, ...datos }));
}

export async function cargarHistorial(uid: string) {
  const [intenciones, observaciones, sintonias] = await Promise.all([
    supabase
      .from('intenciones_diarias')
      .select(COLS_INTENCION)
      .eq('usuario_id', uid)
      .order('fecha', { ascending: false }),
    supabase
      .from('observaciones')
      .select(COLS_OBSERVACION)
      .eq('usuario_id', uid)
      .order('creada_en', { ascending: false }),
    supabase
      .from('sintonias')
      .select(COLS_SINTONIA)
      .eq('usuario_id', uid)
      .order('creada_en', { ascending: false }),
  ]);
  return {
    intenciones: ok(intenciones) as Intencion[],
    observaciones: ok(observaciones) as Observacion[],
    sintonias: ok(sintonias) as Sintonia[],
  };
}

/** Exporta todo lo del usuario. Los consentimientos también se incluyen. */
export async function exportarDatos(uid: string) {
  const [perfil, consentimientos, intenciones, observaciones, sintonias] = await Promise.all([
    supabase.from('perfiles').select('nombre, zona_horaria, creado_en').eq('id', uid).maybeSingle(),
    supabase.from('consentimientos').select('tipo, version, aceptado_en').eq('usuario_id', uid),
    supabase.from('intenciones_diarias').select(COLS_INTENCION).eq('usuario_id', uid),
    supabase.from('observaciones').select(COLS_OBSERVACION).eq('usuario_id', uid),
    supabase.from('sintonias').select(COLS_SINTONIA).eq('usuario_id', uid),
  ]);
  return {
    exportado_en: new Date().toISOString(),
    perfil: ok(perfil),
    consentimientos: ok(consentimientos),
    intenciones_diarias: ok(intenciones),
    observaciones: ok(observaciones),
    sintonias: ok(sintonias),
  };
}

/**
 * Borra intenciones, observaciones y sintonías del usuario.
 * No borra consentimientos: la tabla no tiene policy de DELETE, y se conservan
 * como prueba de la aceptación. Tampoco borra la cuenta de autenticación.
 */
export async function borrarMisRegistros(uid: string): Promise<void> {
  ok(await supabase.from('observaciones').delete().eq('usuario_id', uid).select('id'));
  ok(await supabase.from('sintonias').delete().eq('usuario_id', uid).select('id'));
  ok(await supabase.from('intenciones_diarias').delete().eq('usuario_id', uid).select('id'));
}
