"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { SUPABASE_HABILITADO } from "./supabase/config";
import { getSupabase } from "./supabase/client";
import { useClienteActivo } from "./cliente-context";

// Persistencia del tablero, por cliente.
//   · Modo local (sin Supabase): guarda en localStorage, namespaced por cliente.
//   · Modo Supabase: guarda en la tabla `estado_tablero` (compartido por equipo),
//     con las reglas de acceso aplicadas a nivel de base de datos.
// La firma del hook no cambió, así que los módulos no se tocan.

const ns = (clienteId: string, key: string) => `motor2026:${clienteId}:${key}`;

function esObjetoPlano(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// Si el esquema creció (nuevos campos en initial), lo guardado se fusiona sobre
// los defaults para no perder claves nuevas.
function fusionar<T>(initial: T, guardado: unknown): T {
  if (esObjetoPlano(guardado) && esObjetoPlano(initial)) {
    return { ...(initial as object), ...(guardado as object) } as T;
  }
  return guardado as T;
}

async function leer<T>(
  clienteId: string,
  key: string,
  initial: T
): Promise<T> {
  if (SUPABASE_HABILITADO) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("estado_tablero")
      .select("valor")
      .eq("cliente_id", clienteId)
      .eq("clave", key)
      .maybeSingle();
    if (error || data?.valor == null) return initial;
    return fusionar(initial, data.valor);
  }
  try {
    const raw = localStorage.getItem(ns(clienteId, key));
    if (raw === null) return initial;
    return fusionar(initial, JSON.parse(raw));
  } catch {
    return initial;
  }
}

async function escribir<T>(
  clienteId: string,
  key: string,
  value: T
): Promise<void> {
  if (SUPABASE_HABILITADO) {
    const sb = getSupabase();
    await sb.from("estado_tablero").upsert(
      {
        cliente_id: clienteId,
        clave: key,
        valor: value as unknown,
        actualizado_en: new Date().toISOString(),
      },
      { onConflict: "cliente_id,clave" }
    );
    return;
  }
  try {
    localStorage.setItem(ns(clienteId, key), JSON.stringify(value));
  } catch {
    // storage lleno o no disponible
  }
}

export function usePersistentState<T>(
  key: string,
  initial: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const { clienteId } = useClienteActivo();
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  // `initial` suele venir como literal inline (identidad nueva en cada render):
  // lo congelamos en un ref para no re-disparar la carga.
  const initialRef = useRef(initial);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar al montar y cada vez que cambia el cliente o la clave.
  useEffect(() => {
    let cancelado = false;
    setLoaded(false);
    // Evita mostrar datos del cliente anterior mientras carga el nuevo.
    setValue(initialRef.current);
    if (!clienteId) {
      setLoaded(true);
      return;
    }
    (async () => {
      const cargado = await leer(clienteId, key, initialRef.current);
      if (cancelado) return;
      setValue(cargado);
      setLoaded(true);
    })();
    return () => {
      cancelado = true;
    };
  }, [key, clienteId]);

  // Escritura write-through: solo cuando el componente actualiza el valor (acción
  // del usuario), nunca en la carga. Debounced para no escribir en cada tecla.
  const setAndPersist = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      setValue((prev) => {
        const next =
          typeof action === "function"
            ? (action as (p: T) => T)(prev)
            : action;
        if (clienteId) {
          if (debRef.current) clearTimeout(debRef.current);
          const cid = clienteId;
          debRef.current = setTimeout(() => {
            void escribir(cid, key, next);
          }, 400);
        }
        return next;
      });
    },
    [key, clienteId]
  );

  return [value, setAndPersist, loaded];
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

export const hoyISO = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
