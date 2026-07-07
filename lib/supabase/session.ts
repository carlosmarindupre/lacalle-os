import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_HABILITADO } from "./config";

// Refresca la sesión en cada request y protege las rutas: si no hay usuario
// autenticado, redirige a /login (salvo las rutas públicas de auth).
export async function updateSession(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  // Sin Supabase configurado no hay auth.
  //   · Desarrollo: la app corre en modo local (localStorage), sin login.
  //   · Producción: la ausencia de credenciales es una mala configuración
  //     (p. ej. env vars que no propagaron en el deploy). Servir el tablero
  //     sin autenticación sería un fail-open, así que se cierra el acceso a
  //     las rutas privadas devolviendo 503 en vez de exponerlas.
  if (!SUPABASE_HABILITADO) {
    if (process.env.NODE_ENV === "production") {
      const path = request.nextUrl.pathname;
      const esPublica = path.startsWith("/login") || path.startsWith("/auth");
      if (!esPublica) {
        return new NextResponse(
          "Servicio no disponible: autenticación no configurada.",
          { status: 503 }
        );
      }
    }
    return respuesta;
  }

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

  // Redirige preservando las cookies de sesión ya refrescadas en `respuesta`.
  // Si getUser() rotó el token, esas cookies viven en `respuesta`; un
  // NextResponse.redirect nuevo no las lleva, causando refresh loops / logout
  // intermitente. El patrón oficial de Supabase copia las cookies al redirect.
  const redirigir = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const redir = NextResponse.redirect(url);
    respuesta.cookies.getAll().forEach((c) => redir.cookies.set(c));
    return redir;
  };

  // Sin sesión y en ruta privada → al login.
  if (!user && !esPublica) return redirigir("/login");

  // Con sesión y entrando a /login → al inicio.
  if (user && path.startsWith("/login")) return redirigir("/");

  return respuesta;
}
