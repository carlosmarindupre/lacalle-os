import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import Providers from "@/components/Providers";
import { SUPABASE_HABILITADO } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El caso "producción sin Supabase" (mala configuración → fail-closed) lo
  // maneja el proxy (session.ts), que devuelve 503 en rutas privadas antes de
  // que este layout se renderice. Aquí solo se exige sesión cuando Supabase
  // está habilitado; en desarrollo sin Supabase la app corre en modo local.
  if (SUPABASE_HABILITADO) {
    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  }

  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
