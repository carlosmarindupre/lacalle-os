"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { SUPABASE_HABILITADO } from "./supabase/config";
import { getSupabase } from "./supabase/client";

// Sesión del usuario actual (identidad + rol), resuelta una sola vez y
// compartida por toda la app. Antes cada componente que necesitaba "quién soy /
// qué rol tengo" (el Sidebar, y potencialmente el panel admin) hacía su propio
// auth.getUser() + consulta a perfiles; esto lo centraliza en un provider.
type ContextoSesion = {
  userId: string | null;
  correo: string | null;
  esSuperAdmin: boolean;
  cargando: boolean;
};

const ESTADO_LOCAL: ContextoSesion = {
  userId: null,
  correo: null,
  esSuperAdmin: false,
  cargando: false,
};

const SesionContext = createContext<ContextoSesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<ContextoSesion>(
    SUPABASE_HABILITADO ? { ...ESTADO_LOCAL, cargando: true } : ESTADO_LOCAL
  );

  useEffect(() => {
    if (!SUPABASE_HABILITADO) return;
    let cancelado = false;

    (async () => {
      const sb = getSupabase();
      // getSession lee la sesión localmente (sin round-trip a Supabase Auth): el
      // proxy ya la validó y refrescó en la request que cargó esta página. Basta
      // para mostrar identidad y decidir qué links del menú se ven.
      const {
        data: { session },
      } = await sb.auth.getSession();
      const user = session?.user;

      if (!user) {
        if (!cancelado) setEstado(ESTADO_LOCAL);
        return;
      }

      // El rol vive en `perfiles`, no en el JWT, así que necesita una consulta.
      // La visibilidad del link de Admin es solo cosmética: el acceso real a
      // /admin lo hace cumplir el gate server-side de app/(app)/admin/layout.tsx.
      const { data: perfil } = await sb
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelado) return;
      setEstado({
        userId: user.id,
        correo: user.email ?? null,
        esSuperAdmin: perfil?.rol === "super_admin",
        cargando: false,
      });
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <SesionContext.Provider value={estado}>{children}</SesionContext.Provider>
  );
}

export function useSesion(): ContextoSesion {
  const ctx = useContext(SesionContext);
  if (!ctx) {
    throw new Error("useSesion debe usarse dentro de <SesionProvider>");
  }
  return ctx;
}
