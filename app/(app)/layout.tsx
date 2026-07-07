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
  if (SUPABASE_HABILITADO) {
    const supabase = await getServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  } else if (process.env.NODE_ENV === "production") {
    // Producción sin Supabase = mala configuración: no renderizar el tablero
    // sin autenticación (defensa en profundidad; el proxy ya devuelve 503).
    throw new Error("Supabase no está configurado en producción.");
  }

  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
