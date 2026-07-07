"use client";

// Capa de datos del panel de super admin (Fase 3).
// Todo corre del lado del cliente con la sesión normal: las políticas RLS de
// Supabase garantizan que solo un super_admin pueda escribir en estas tablas.
// No requiere la service_role key.

import { getSupabase } from "./supabase/client";
import type {
  Cliente,
  CorreoAprobado,
  Perfil,
  RolUsuario,
} from "./supabase/types";

export type AccesoFila = { usuario_id: string; cliente_id: string };

export type DatosPanel = {
  miId: string | null;
  perfiles: Perfil[];
  correos: CorreoAprobado[];
  clientes: Cliente[];
  accesos: AccesoFila[];
};

// Carga todo lo que el panel necesita en paralelo.
export async function cargarPanel(): Promise<DatosPanel> {
  const sb = getSupabase();
  const { data: u } = await sb.auth.getUser();
  const [perfiles, correos, clientes, accesos] = await Promise.all([
    sb.from("perfiles").select("id,correo,nombre,rol").order("correo"),
    sb
      .from("correos_aprobados")
      .select("correo,rol_inicial,creado_en")
      .order("creado_en"),
    sb.from("clientes").select("id,nombre,slug,archivado").order("nombre"),
    sb.from("acceso_cliente").select("usuario_id,cliente_id"),
  ]);
  return {
    miId: u.user?.id ?? null,
    perfiles: (perfiles.data ?? []) as Perfil[],
    correos: (correos.data ?? []) as CorreoAprobado[],
    clientes: (clientes.data ?? []) as Cliente[],
    accesos: (accesos.data ?? []) as AccesoFila[],
  };
}

function slugify(texto: string): string {
  const s = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "cliente";
}

// --- Invitaciones / lista blanca ---
export async function invitarCorreo(correo: string, rol: RolUsuario) {
  const sb = getSupabase();
  const { error } = await sb
    .from("correos_aprobados")
    .upsert(
      { correo: correo.trim().toLowerCase(), rol_inicial: rol },
      { onConflict: "correo" }
    );
  if (error) throw error;
}

export async function quitarCorreo(correo: string) {
  const sb = getSupabase();
  const { error } = await sb.from("correos_aprobados").delete().eq("correo", correo);
  if (error) throw error;
}

// --- Usuarios / roles ---
export async function cambiarRol(perfilId: string, rol: RolUsuario) {
  const sb = getSupabase();
  const { error } = await sb.from("perfiles").update({ rol }).eq("id", perfilId);
  if (error) throw error;
}

// Revoca el acceso de un usuario existente: borra su perfil y, en cascada, sus
// asignaciones de cliente (acceso_cliente). Aunque su sesión siga viva hasta
// expirar, sin perfil las políticas RLS le niegan todo dato y el gate de /admin
// lo expulsa. NO borra su cuenta de auth (eso requiere service-role desde el
// dashboard de Supabase); para impedir que vuelva a registrarse hay que quitar
// además su correo de la lista blanca con quitarCorreo().
export async function revocarAcceso(perfilId: string) {
  const sb = getSupabase();
  const { error } = await sb.from("perfiles").delete().eq("id", perfilId);
  if (error) throw error;
}

// --- Clientes ---
export async function crearCliente(nombre: string) {
  const sb = getSupabase();
  const base = slugify(nombre);
  let slug = base;
  for (let i = 0; i < 5; i++) {
    const { error } = await sb
      .from("clientes")
      .insert({ nombre: nombre.trim(), slug });
    if (!error) return;
    if (error.code === "23505") {
      // slug duplicado: prueba con un sufijo
      slug = `${base}-${i + 2}`;
      continue;
    }
    throw error;
  }
  throw new Error("No se pudo generar un identificador único para el cliente.");
}

export async function renombrarCliente(id: string, nombre: string) {
  const sb = getSupabase();
  const { error } = await sb
    .from("clientes")
    .update({ nombre: nombre.trim() })
    .eq("id", id);
  if (error) throw error;
}

export async function archivarCliente(id: string, archivado: boolean) {
  const sb = getSupabase();
  const { error } = await sb.from("clientes").update({ archivado }).eq("id", id);
  if (error) throw error;
}

// --- Accesos (qué miembro ve qué cliente) ---
export async function asignarAcceso(usuarioId: string, clienteId: string) {
  const sb = getSupabase();
  const { error } = await sb
    .from("acceso_cliente")
    .upsert(
      { usuario_id: usuarioId, cliente_id: clienteId },
      { onConflict: "usuario_id,cliente_id" }
    );
  if (error) throw error;
}

export async function quitarAcceso(usuarioId: string, clienteId: string) {
  const sb = getSupabase();
  const { error } = await sb
    .from("acceso_cliente")
    .delete()
    .eq("usuario_id", usuarioId)
    .eq("cliente_id", clienteId);
  if (error) throw error;
}
