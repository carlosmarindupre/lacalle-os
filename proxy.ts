// La protección de rutas se maneja en app/(app)/layout.tsx (Server Component,
// corre en Node.js donde @supabase/ssr funciona sin restricciones de Edge Runtime).
// Este archivo existe solo para que Next.js refresque las cookies de sesión.
import { type NextRequest, NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
