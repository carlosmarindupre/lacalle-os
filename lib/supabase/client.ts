import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_HABILITADO } from "./config";

// Cliente de Supabase para el navegador (singleton). Solo se instancia si el
// proyecto está configurado; de lo contrario la app corre en modo local.
let _sb: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (!SUPABASE_HABILITADO) {
    throw new Error("Supabase no está configurado (faltan variables de entorno).");
  }
  if (!_sb) {
    _sb = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sb;
}
