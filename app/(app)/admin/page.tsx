"use client";

import { useEffect, useState, useCallback } from "react";
import {
  cargarPanel,
  invitarCorreo,
  quitarCorreo,
  cambiarRol,
  crearCliente,
  renombrarCliente,
  archivarCliente,
  asignarAcceso,
  quitarAcceso,
  type DatosPanel,
} from "@/lib/admin";
import { useClienteActivo } from "@/lib/cliente-context";
import type { RolUsuario } from "@/lib/supabase/types";

// ─── helpers ─────────────────────────────────────────────────────────────────

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel2 px-2.5 py-0.5 text-[11px] text-snow">
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-dim transition-colors hover:text-magenta"
          title="Quitar"
        >
          ×
        </button>
      )}
    </span>
  );
}

function Badge({ rol }: { rol: RolUsuario }) {
  const isAdmin = rol === "super_admin";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
        isAdmin
          ? "bg-turquesa/15 text-turquesa"
          : "bg-panel2 text-mut"
      }`}
    >
      {isAdmin ? "Super admin" : "Miembro"}
    </span>
  );
}

function SeccionHeader({ titulo, desc }: { titulo: string; desc?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-snow">{titulo}</h2>
      {desc && <p className="mt-0.5 text-[12px] text-mut">{desc}</p>}
    </div>
  );
}

// ─── sección: correos aprobados ───────────────────────────────────────────────

function SeccionInvitaciones({
  datos,
  miId,
  onRefrescar,
}: {
  datos: DatosPanel;
  miId: string | null;
  onRefrescar: () => void;
}) {
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<RolUsuario>("miembro");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invitar = async () => {
    const c = correo.trim().toLowerCase();
    if (!c || !c.includes("@")) {
      setError("Ingresa un correo válido.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await invitarCorreo(c, rol);
      setCorreo("");
      onRefrescar();
    } catch {
      setError("No se pudo guardar. Verifica que tengas permisos.");
    } finally {
      setGuardando(false);
    }
  };

  const quitar = async (c: string) => {
    if (!confirm(`¿Quitar "${c}" de la lista de acceso?`)) return;
    try {
      await quitarCorreo(c);
      onRefrescar();
    } catch {
      alert("No se pudo quitar el correo.");
    }
  };

  return (
    <section className="rounded-xl border border-line bg-panel p-5">
      <SeccionHeader
        titulo="Correos autorizados"
        desc="Solo los correos en esta lista pueden iniciar sesión. Al agregar un correo, el usuario podrá entrar la próxima vez que acceda con Google."
      />

      {/* Formulario */}
      <div className="flex gap-2">
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && invitar()}
          placeholder="correo@empresa.com"
          className="flex-1 rounded-md border border-line bg-panel2 px-3 py-1.5 text-[13px] text-snow placeholder:text-dim focus:border-turquesa focus:outline-none"
        />
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value as RolUsuario)}
          className="rounded-md border border-line bg-panel2 px-2.5 py-1.5 text-[12px] text-snow focus:border-turquesa focus:outline-none"
        >
          <option value="miembro">Miembro</option>
          <option value="super_admin">Super admin</option>
        </select>
        <button
          onClick={invitar}
          disabled={guardando}
          className="rounded-md bg-turquesa px-3 py-1.5 text-[12px] font-medium text-ink transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {guardando ? "…" : "Agregar"}
        </button>
      </div>
      {error && <p className="mt-2 text-[11px] text-magenta">{error}</p>}

      {/* Lista */}
      <div className="mt-4 divide-y divide-line/50">
        {datos.correos.length === 0 && (
          <p className="text-[12px] text-dim">Sin correos en la lista.</p>
        )}
        {datos.correos.map((ca) => {
          const perfil = datos.perfiles.find(
            (p) => p.correo.toLowerCase() === ca.correo.toLowerCase()
          );
          const esMiCorreo = perfil?.id === miId;
          return (
            <div
              key={ca.correo}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <span className="block truncate text-[13px] text-snow">
                  {ca.correo}
                </span>
                {perfil ? (
                  <span className="text-[10px] text-turquesa">Registrado</span>
                ) : (
                  <span className="text-[10px] text-dim">Pendiente de primer acceso</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge rol={ca.rol_inicial} />
                {!esMiCorreo && (
                  <button
                    onClick={() => quitar(ca.correo)}
                    className="text-[11px] text-dim transition-colors hover:text-magenta"
                    title="Quitar acceso"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── sección: usuarios registrados ───────────────────────────────────────────

function SeccionUsuarios({
  datos,
  miId,
  onRefrescar,
}: {
  datos: DatosPanel;
  miId: string | null;
  onRefrescar: () => void;
}) {
  const cambiar = async (id: string, rol: RolUsuario) => {
    if (id === miId && rol !== "super_admin") {
      if (!confirm("¿Quitarte el rol de super admin? Perderías acceso a este panel.")) return;
    }
    try {
      await cambiarRol(id, rol);
      onRefrescar();
    } catch {
      alert("No se pudo cambiar el rol.");
    }
  };

  if (datos.perfiles.length === 0) {
    return (
      <section className="rounded-xl border border-line bg-panel p-5">
        <SeccionHeader
          titulo="Usuarios"
          desc="Personas que ya iniciaron sesión al menos una vez."
        />
        <p className="text-[12px] text-dim">Aún no hay usuarios registrados.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-panel p-5">
      <SeccionHeader
        titulo="Usuarios"
        desc="Personas que ya iniciaron sesión al menos una vez."
      />
      <div className="divide-y divide-line/50">
        {datos.perfiles.map((p) => {
          const accesos = datos.accesos
            .filter((a) => a.usuario_id === p.id)
            .map((a) => datos.clientes.find((c) => c.id === a.cliente_id))
            .filter(Boolean);

          const clientesSinAcceso = datos.clientes.filter(
            (c) =>
              !c.archivado &&
              !datos.accesos.find(
                (a) => a.usuario_id === p.id && a.cliente_id === c.id
              )
          );

          const esMiembro = p.rol === "miembro";

          return (
            <div key={p.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-snow">
                    {p.nombre ?? p.correo}
                  </p>
                  {p.nombre && (
                    <p className="truncate text-[11px] text-dim">{p.correo}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge rol={p.rol} />
                  {p.id !== miId && (
                    <button
                      onClick={() =>
                        cambiar(p.id, esMiembro ? "super_admin" : "miembro")
                      }
                      className="text-[11px] text-dim transition-colors hover:text-turquesa"
                    >
                      {esMiembro ? "→ Admin" : "→ Miembro"}
                    </button>
                  )}
                </div>
              </div>

              {/* Accesos a clientes (solo relevante para miembros; admin ve todo) */}
              {esMiembro && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {accesos.map((c) =>
                    c ? (
                      <Chip
                        key={c.id}
                        label={c.nombre}
                        onRemove={() => quitarAcceso(p.id, c.id).then(onRefrescar)}
                      />
                    ) : null
                  )}
                  {clientesSinAcceso.length > 0 && (
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          asignarAcceso(p.id, e.target.value).then(onRefrescar);
                          e.target.value = "";
                        }
                      }}
                      className="rounded-full border border-line/60 border-dashed bg-transparent px-2.5 py-0.5 text-[11px] text-dim focus:border-turquesa focus:outline-none"
                    >
                      <option value="">+ Asignar cliente…</option>
                      {clientesSinAcceso.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                  {accesos.length === 0 && clientesSinAcceso.length === 0 && (
                    <span className="text-[11px] text-dim">Sin clientes asignados</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── sección: clientes ────────────────────────────────────────────────────────

function SeccionClientes({
  datos,
  onRefrescar,
}: {
  datos: DatosPanel;
  onRefrescar: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [nombreEdit, setNombreEdit] = useState("");

  const crear = async () => {
    if (!nombre.trim()) return;
    setGuardando(true);
    try {
      await crearCliente(nombre.trim());
      setNombre("");
      onRefrescar();
    } catch {
      alert("No se pudo crear el cliente.");
    } finally {
      setGuardando(false);
    }
  };

  const guardarNombre = async (id: string) => {
    if (!nombreEdit.trim()) { setEditando(null); return; }
    try {
      await renombrarCliente(id, nombreEdit.trim());
      setEditando(null);
      onRefrescar();
    } catch {
      alert("No se pudo renombrar.");
    }
  };

  const toggleArchivado = async (id: string, archivado: boolean) => {
    const accion = archivado ? "desarchivar" : "archivar";
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} este cliente?`)) return;
    try {
      await archivarCliente(id, !archivado);
      onRefrescar();
    } catch {
      alert("No se pudo actualizar.");
    }
  };

  const activos = datos.clientes.filter((c) => !c.archivado);
  const archivados = datos.clientes.filter((c) => c.archivado);

  return (
    <section className="rounded-xl border border-line bg-panel p-5">
      <SeccionHeader
        titulo="Clientes"
        desc="Cada cliente tiene su propio tablero aislado. Archivar oculta el tablero sin borrar datos."
      />

      {/* Crear */}
      <div className="flex gap-2">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && crear()}
          placeholder="Nombre del nuevo cliente"
          className="flex-1 rounded-md border border-line bg-panel2 px-3 py-1.5 text-[13px] text-snow placeholder:text-dim focus:border-turquesa focus:outline-none"
        />
        <button
          onClick={crear}
          disabled={guardando || !nombre.trim()}
          className="rounded-md bg-turquesa px-3 py-1.5 text-[12px] font-medium text-ink transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {guardando ? "…" : "Crear"}
        </button>
      </div>

      {/* Lista activos */}
      <div className="mt-4 divide-y divide-line/50">
        {activos.length === 0 && (
          <p className="text-[12px] text-dim">Sin clientes activos.</p>
        )}
        {activos.map((c) => (
          <div key={c.id} className="flex items-center gap-3 py-2.5">
            {editando === c.id ? (
              <input
                autoFocus
                value={nombreEdit}
                onChange={(e) => setNombreEdit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") guardarNombre(c.id);
                  if (e.key === "Escape") setEditando(null);
                }}
                onBlur={() => guardarNombre(c.id)}
                className="flex-1 rounded border border-turquesa bg-panel2 px-2 py-0.5 text-[13px] text-snow focus:outline-none"
              />
            ) : (
              <span
                className="flex-1 cursor-pointer truncate text-[13px] text-snow hover:text-turquesa"
                onClick={() => {
                  setEditando(c.id);
                  setNombreEdit(c.nombre);
                }}
                title="Clic para renombrar"
              >
                {c.nombre}
              </span>
            )}
            <span className="text-[10px] text-dim font-mono">{c.slug}</span>
            <button
              onClick={() => toggleArchivado(c.id, false)}
              className="shrink-0 text-[11px] text-dim transition-colors hover:text-magenta"
            >
              Archivar
            </button>
          </div>
        ))}
      </div>

      {/* Archivados */}
      {archivados.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer select-none text-[11px] text-dim hover:text-mut">
            {archivados.length} cliente{archivados.length > 1 ? "s" : ""} archivado{archivados.length > 1 ? "s" : ""}
          </summary>
          <div className="mt-2 divide-y divide-line/30">
            {archivados.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-2">
                <span className="flex-1 truncate text-[12px] text-dim line-through">
                  {c.nombre}
                </span>
                <button
                  onClick={() => toggleArchivado(c.id, true)}
                  className="text-[11px] text-dim transition-colors hover:text-turquesa"
                >
                  Restaurar
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

// ─── página principal ────────────────────────────────────────────────────────

export default function AdminPage() {
  const [datos, setDatos] = useState<DatosPanel | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { recargar: recargarSidebar } = useClienteActivo();

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const d = await cargarPanel();
      setDatos(d);
    } catch {
      setError("No se pudo cargar el panel. ¿Tienes rol de super admin?");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const refrescar = useCallback(async () => {
    await cargar();
    await recargarSidebar();
  }, [cargar, recargarSidebar]);

  if (cargando) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-[13px] text-dim">Cargando panel…</p>
      </main>
    );
  }

  if (error || !datos) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-[13px] text-magenta">{error ?? "Error desconocido."}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-snow">
          Administración
        </h1>
        <p className="mt-1 text-[12px] text-mut">
          Gestión de accesos, usuarios y clientes.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <SeccionClientes datos={datos} onRefrescar={refrescar} />
        <SeccionInvitaciones datos={datos} miId={datos.miId} onRefrescar={refrescar} />
        <SeccionUsuarios datos={datos} miId={datos.miId} onRefrescar={refrescar} />
      </div>
    </main>
  );
}
