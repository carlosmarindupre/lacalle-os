"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { SUPABASE_HABILITADO } from "./supabase/config";
import { getSupabase } from "./supabase/client";
import type { Cliente } from "./supabase/types";

// Cliente por defecto cuando la app corre en modo local (sin Supabase).
// Mantiene el mismo id "matriz" que usaba el almacenamiento local previo.
const CLIENTE_LOCAL: Cliente = {
  id: "matriz",
  nombre: "Matriz (local)",
  slug: "matriz",
};
const LS_SELECCION = "motor2026:cliente-activo";

type ContextoCliente = {
  clientes: Cliente[];
  clienteId: string | null;
  clienteActivo: Cliente | null;
  setClienteId: (id: string) => void;
  recargar: () => Promise<void>;
  cargando: boolean;
};

const ClienteContext = createContext<ContextoCliente | null>(null);

export function ClienteProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>(
    SUPABASE_HABILITADO ? [] : [CLIENTE_LOCAL]
  );
  const [clienteId, setClienteIdState] = useState<string | null>(
    SUPABASE_HABILITADO ? null : CLIENTE_LOCAL.id
  );
  const [cargando, setCargando] = useState(SUPABASE_HABILITADO);

  // Carga (o recarga) los clientes que el usuario puede ver (filtrado por RLS).
  // Conserva la selección actual si sigue siendo válida; si no, cae al guardado o al primero.
  const recargar = useCallback(async () => {
    if (!SUPABASE_HABILITADO) return;
    try {
      const sb = getSupabase();
      const { data } = await sb
        .from("clientes")
        .select("id,nombre,slug")
        .eq("archivado", false)
        .order("nombre");
      const lista = (data ?? []) as Cliente[];
      setClientes(lista);
      setClienteIdState((actual) => {
        if (actual && lista.some((c) => c.id === actual)) return actual;
        const guardado =
          typeof localStorage !== "undefined"
            ? localStorage.getItem(LS_SELECCION)
            : null;
        return lista.find((c) => c.id === guardado)?.id ?? lista[0]?.id ?? null;
      });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const setClienteId = (id: string) => {
    setClienteIdState(id);
    try {
      localStorage.setItem(LS_SELECCION, id);
    } catch {
      // sin acceso a localStorage: la selección no persiste, pero la app sigue
    }
  };

  const clienteActivo = clientes.find((c) => c.id === clienteId) ?? null;

  return (
    <ClienteContext.Provider
      value={{
        clientes,
        clienteId,
        clienteActivo,
        setClienteId,
        recargar,
        cargando,
      }}
    >
      {children}
    </ClienteContext.Provider>
  );
}

export function useClienteActivo(): ContextoCliente {
  const ctx = useContext(ClienteContext);
  if (!ctx) {
    throw new Error("useClienteActivo debe usarse dentro de <ClienteProvider>");
  }
  return ctx;
}
