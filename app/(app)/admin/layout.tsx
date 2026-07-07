import { redirect } from "next/navigation";
import { SUPABASE_HABILITADO } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

// Gate de rol del lado servidor para el panel de super admin.
// La protección de la ruta en el layout de (app) solo verifica que haya sesión;
// sin este gate, cualquier miembro autenticado puede abrir /admin y depender
// únicamente de las políticas RLS. Aquí se exige rol super_admin como defensa en
// profundidad: un miembro sin ese rol es redirigido antes de renderizar.
export default async function AdminLayout({
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

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .maybeSingle();

    if (perfil?.rol !== "super_admin") redirect("/");
  }

  return <>{children}</>;
}
