"use client";

import { ClienteProvider } from "@/lib/cliente-context";

// Proveedores globales del lado del cliente. Envuelve la app para que el sidebar
// y todos los módulos compartan el cliente activo.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <ClienteProvider>{children}</ClienteProvider>;
}
