import { createClient } from '@supabase/supabase-js';

// Solo la clave publicable. Nunca la service_role en el cliente.
const url = import.meta.env.VITE_SUPABASE_URL as string;
const clave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !clave) {
  throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en .env.local');
}

export const supabase = createClient(url, clave, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
