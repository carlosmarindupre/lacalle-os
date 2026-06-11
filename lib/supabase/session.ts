import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_HABILITADO } from "./config";

// Refresca la sesión en cada request y protege las rutas: si no hay usuario
// autenticado, redirige a /login (salvo las rutas públicas de auth).
export async function updateSession(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  // Sin Supabase configurado no hay auth: la app corre en modo local.
  if (!SUPABASE_HABILITADO) return respuesta;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        respuesta = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          respuesta.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const esPublica = path.startsWith("/login") || path.startsWith("/auth");

  // Sin sesión y en ruta privada → al login.
  if (!user && !esPublica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Con sesión y entrando a /login → al inicio.
  if (user && path.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return respuesta;
}
