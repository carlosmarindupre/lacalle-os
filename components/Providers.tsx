"use client";

import { SesionProvider } from "@/lib/sesion-context";
import { ClienteProvider } from "@/lib/cliente-context";

// Proveedores globales del lado del cliente. Envuelve la app para que el sidebar
// y todos los módulos compartan la sesión (usuario/rol) y el cliente activo.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SesionProvider>
      <ClienteProvider>{children}</ClienteProvider>
    </SesionProvider>
  );
}
