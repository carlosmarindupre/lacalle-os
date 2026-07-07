"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SERVICIOS } from "@/lib/data";
import { useClienteActivo } from "@/lib/cliente-context";
import { useSesion } from "@/lib/sesion-context";
import { SUPABASE_HABILITADO } from "@/lib/supabase/config";
import { getSupabase } from "@/lib/supabase/client";

function NavItem({
  href,
  active,
  mark,
  children,
}: {
  href: string;
  active: boolean;
  mark: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
        active
          ? "bg-panel text-snow"
          : "text-mut hover:bg-panel/60 hover:text-snow"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-turquesa" />
      )}
      <span
        className={`w-5 shrink-0 font-mono text-[10px] tracking-wider ${
          active ? "text-turquesa" : "text-dim group-hover:text-turquesa"
        }`}
      >
        {mark}
      </span>
      <span className="truncate">{children}</span>
    </Link>
  );
}

export default function Sidebar({
  isOpen = false,
  onClose = () => {},
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { clientes, clienteId, setClienteId, cargando } = useClienteActivo();
  const { correo, esSuperAdmin } = useSesion();

  const salir = async () => {
    if (SUPABASE_HABILITADO) await getSupabase().auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-line bg-ink transition-transform duration-200 ease-in-out md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="relative border-b border-line px-5 pb-5 pt-6">
        <div className="text-lg font-semibold leading-none tracking-tight">
          laCalle<span className="text-turquesa">OS</span>
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-mut">
          sistema operacional
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar menú"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-lg text-mut transition-colors hover:bg-panel hover:text-snow md:hidden"
        >
          ×
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-2 px-3 text-[10px] uppercase tracking-[0.18em] text-dim">
          General
        </div>
        <NavItem href="/" active={pathname === "/"} mark="◆">
          Dashboard
        </NavItem>
        <NavItem href="/compania" active={pathname === "/compania"} mark="■">
          Compañía
        </NavItem>

        <div className="mb-2 mt-6 px-3 text-[10px] uppercase tracking-[0.18em] text-dim">
          Servicios
        </div>
        {SERVICIOS.map((s) => (
          <NavItem
            key={s.slug}
            href={`/servicios/${s.slug}`}
            active={pathname === `/servicios/${s.slug}`}
            mark={s.num}
          >
            {s.nombre}
          </NavItem>
        ))}

        <div className="mb-2 mt-6 px-3 text-[10px] uppercase tracking-[0.18em] text-dim">
          Sistema
        </div>
        <NavItem
          href="/configuracion"
          active={pathname === "/configuracion"}
          mark="↓"
        >
          Configuración
        </NavItem>
        {esSuperAdmin && (
          <NavItem
            href="/admin"
            active={pathname === "/admin"}
            mark="⚙"
          >
            Administración
          </NavItem>
        )}
      </nav>

      <div className="border-t border-line px-5 py-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-turquesa" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-mut">
            Tablero · Cliente
          </span>
        </div>
        {cargando ? (
          <div className="text-[11px] text-dim">Cargando clientes…</div>
        ) : clientes.length === 0 ? (
          <div className="text-[11px] text-dim">Sin clientes asignados</div>
        ) : (
          <select
            value={clienteId ?? ""}
            onChange={(e) => setClienteId(e.target.value)}
            aria-label="Cliente activo"
            className="w-full rounded-md border border-line bg-panel px-2.5 py-1.5 text-[12px] text-snow transition-colors focus:border-turquesa focus:outline-none"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        )}
        {SUPABASE_HABILITADO && (
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
            <span
              className="truncate text-[10px] text-dim"
              title={correo ?? ""}
            >
              {correo ?? "—"}
            </span>
            <button
              onClick={salir}
              className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-mut transition-colors hover:text-magenta"
            >
              Salir
            </button>
          </div>
        )}
        <div className="mt-3 text-[10px] text-dim">laCalle © 2026 · v0.1</div>
      </div>
    </aside>
  );
}
