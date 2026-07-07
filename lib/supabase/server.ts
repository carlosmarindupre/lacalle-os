import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

// Cliente de Supabase para Server Components (solo lectura de sesión).
// En un Server Component las cookies no se pueden modificar: el refresh real de
// la sesión lo hace el proxy (session.ts), así que aquí silenciamos el set y
// solo leemos. Centralizado para no repetir el boilerplate del cliente en cada
// layout/route handler.
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // no-op en Server Components
        }
      },
    },
  });
}
