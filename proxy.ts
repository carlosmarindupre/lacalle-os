import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

// Proxy de Next.js 16 (antes "middleware"): corre antes de cada request y
// refresca la cookie de sesión de Supabase en el lugar donde sí está
// permitido modificar cookies. Protege rutas privadas vía updateSession.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Aplica a todo menos a assets estáticos y favicon.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
