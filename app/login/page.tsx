"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("error");
  });

  const entrar = async () => {
    setCargando(true);
    setError(null);
    const sb = getSupabase();
    const { error: err } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      setError("error");
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-2xl font-semibold tracking-tight">
            laCalle<span className="text-turquesa">OS</span>
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-mut">
            sistema operacional
          </div>
        </div>

        <div className="rounded-xl border border-line bg-panel p-6">
          <h1 className="text-sm font-medium text-snow">Iniciar sesión</h1>
          <p className="mt-1 text-xs text-mut">
            Acceso restringido al equipo de laCalle.
          </p>

          {error && (
            <div className="mt-4 rounded-md border border-magenta/40 bg-magenta/10 px-3 py-2 text-xs text-magenta">
              {error === "no_autorizado"
                ? "Tu correo no está autorizado para acceder. Contacta al administrador."
                : "No se pudo iniciar sesión. Inténtalo de nuevo."}
            </div>
          )}

          <button
            onClick={entrar}
            disabled={cargando}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-md border border-line2 bg-panel2 px-4 py-2.5 text-sm font-medium text-snow transition-colors hover:border-turquesa disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
              />
            </svg>
            {cargando ? "Redirigiendo…" : "Continuar con Google"}
          </button>
        </div>

        <p className="mt-4 text-center text-[10px] text-dim">
          laCalle © 2026 · v0.1
        </p>
      </div>
    </div>
  );
}
