// Configuración de Supabase. Si faltan las variables, la app funciona en modo
// local (localStorage); si están presentes, usa Supabase como fuente compartida.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const SUPABASE_HABILITADO = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
