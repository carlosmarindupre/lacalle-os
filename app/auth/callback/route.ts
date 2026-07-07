import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config";

// Recibe el retorno de Google (vía Supabase), canjea el código por una sesión
// y deja las cookies. Si el correo no está autorizado, el trigger de la base
// bloquea el alta y volvemos a /login con el aviso.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Error del proveedor OAuth (p. ej. el usuario canceló, access_denied). No es
  // un problema de autorización de correo: se trata como fallo genérico de
  // sesión. No se refleja el valor crudo de `error` en la redirección.
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=sesion`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    });
    const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
    if (!exErr) {
      return NextResponse.redirect(`${origin}/`);
    }
    // El canje puede fallar porque el correo no está en la lista blanca (el
    // trigger de la base aborta el alta) o por causas transitorias (código
    // expirado, red). Supabase no permite distinguirlas de forma fiable desde
    // el mensaje, así que se usa un motivo honesto que cubre ambas en lugar de
    // afirmar "correo no autorizado" a alguien que sí lo está.
    return NextResponse.redirect(`${origin}/login?error=acceso`);
  }

  return NextResponse.redirect(`${origin}/login`);
}
