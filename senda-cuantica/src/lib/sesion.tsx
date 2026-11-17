import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { VERSION_CONSENTIMIENTO } from './consentimiento';

type ContextoSesion = {
  cargando: boolean;
  sesion: Session | null;
  consentido: boolean;
  recargarConsentimiento: () => Promise<void>;
};

const Contexto = createContext<ContextoSesion | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [sesion, setSesion] = useState<Session | null>(null);
  const [consentido, setConsentido] = useState(false);

  const comprobarConsentimiento = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setConsentido(false);
      return;
    }
    const { data, error } = await supabase
      .from('consentimientos')
      .select('tipo')
      .eq('usuario_id', uid)
      .eq('version', VERSION_CONSENTIMIENTO);
    if (error) {
      setConsentido(false);
      return;
    }
    const tipos = new Set((data ?? []).map((r: { tipo: string }) => r.tipo));
    setConsentido(tipos.has('condiciones') && tipos.has('datos'));
  }, []);

  useEffect(() => {
    let activo = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!activo) return;
      setSesion(data.session);
      await comprobarConsentimiento(data.session?.user.id);
      if (activo) setCargando(false);
    });
    const { data: suscripcion } = supabase.auth.onAuthStateChange(async (_evento, nueva) => {
      setSesion(nueva);
      await comprobarConsentimiento(nueva?.user.id);
    });
    return () => {
      activo = false;
      suscripcion.subscription.unsubscribe();
    };
  }, [comprobarConsentimiento]);

  const recargarConsentimiento = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await comprobarConsentimiento(data.session?.user.id);
  }, [comprobarConsentimiento]);

  const valor = useMemo(
    () => ({ cargando, sesion, consentido, recargarConsentimiento }),
    [cargando, sesion, consentido, recargarConsentimiento],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): ContextoSesion {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useSesion debe usarse dentro de ProveedorSesion');
  return ctx;
}
