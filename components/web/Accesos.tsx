"use client";

import { useState } from "react";
import {
  TIPOS_ACCESO_WEB,
  type AccesoWeb,
  type TipoAccesoWeb,
  type ProyectoWeb,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { hrefSeguro } from "@/lib/url";
import { Card, Label, Select, EmptyHint, StatCard } from "@/components/ui";

const TIPO_ICON: Record<TipoAccesoWeb, string> = {
  "Producción": "🌐",
  Staging: "🧪",
  Repositorio: "🗂",
  "CMS / Admin": "⚙️",
  Hosting: "☁️",
  Dominio: "🔗",
  Otro: "📌",
};

const TIPO_COLOR: Record<TipoAccesoWeb, string> = {
  "Producción": "border-turquesa/40 text-turquesa",
  Staging: "border-magenta/40 text-magenta",
  Repositorio: "border-line2 text-snow",
  "CMS / Admin": "border-line2 text-snow",
  Hosting: "border-line2 text-mut",
  Dominio: "border-line2 text-mut",
  Otro: "border-line2 text-dim",
};

export default function Accesos() {
  const [accesos, setAccesos] = usePersistentState<AccesoWeb[]>(
    "web:accesos",
    []
  );
  const [proyectos] = usePersistentState<ProyectoWeb[]>("web:proyectos", []);

  const [filtroProyecto, setFiltroProyecto] = useState<string>("todos");
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const vacio = {
    proyectoId: "",
    tipo: "Producción" as TipoAccesoWeb,
    nombre: "",
    url: "",
    notas: "",
  };
  const [form, setForm] = useState<typeof vacio>(vacio);
  const set = (k: keyof typeof vacio, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const guardar = () => {
    if (!form.nombre.trim() || !form.url.trim()) return;
    const entrada: AccesoWeb = {
      id: editandoId ?? uid(),
      tipo: form.tipo,
      nombre: form.nombre.trim(),
      url: form.url.trim(),
      notas: form.notas.trim() || undefined,
      proyectoId: form.proyectoId || undefined,
    };
    if (editandoId) {
      setAccesos(accesos.map((a) => (a.id === editandoId ? entrada : a)));
      setEditandoId(null);
    } else {
      setAccesos([...accesos, entrada]);
    }
    setForm(vacio);
    setAbierto(false);
  };

  const editar = (a: AccesoWeb) => {
    setForm({
      proyectoId: a.proyectoId ?? "",
      tipo: a.tipo,
      nombre: a.nombre,
      url: a.url,
      notas: a.notas ?? "",
    });
    setEditandoId(a.id);
    setAbierto(true);
  };

  const quitar = (id: string) => {
    if (!confirm("¿Eliminar este acceso?")) return;
    setAccesos(accesos.filter((a) => a.id !== id));
  };

  const cancelar = () => {
    setForm(vacio);
    setEditandoId(null);
    setAbierto(false);
  };

  const visibles =
    filtroProyecto === "todos"
      ? accesos
      : filtroProyecto === "general"
      ? accesos.filter((a) => !a.proyectoId)
      : accesos.filter((a) => a.proyectoId === filtroProyecto);

  const produccion = accesos.filter((a) => a.tipo === "Producción").length;
  const staging = accesos.filter((a) => a.tipo === "Staging").length;
  const repos = accesos.filter((a) => a.tipo === "Repositorio").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total de accesos"
          value={accesos.length}
          accent={accesos.length > 0}
        />
        <StatCard label="Producción" value={produccion} />
        <StatCard label="Staging" value={staging} />
        <StatCard label="Repositorios" value={repos} />
      </div>

      {/* Filtro por proyecto */}
      {proyectos.length > 0 && accesos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "todos", nombre: "Todos" },
              { id: "general", nombre: "Generales" },
              ...proyectos,
            ] as { id: string; nombre: string }[]
          ).map((op) => (
            <button
              key={op.id}
              onClick={() => setFiltroProyecto(op.id)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                filtroProyecto === op.id
                  ? "border-turquesa bg-turquesa/10 text-turquesa"
                  : "border-line text-dim hover:border-line2 hover:text-mut"
              }`}
            >
              {op.nombre}
            </button>
          ))}
        </div>
      )}

      {visibles.length === 0 && !abierto ? (
        <EmptyHint>
          Sin accesos registrados. Centraliza aquí los links a entornos de
          producción, staging, repositorios, CMS y hosting de cada proyecto.
        </EmptyHint>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((a) => {
            const proyecto = proyectos.find((p) => p.id === a.proyectoId);
            return (
              <Card key={a.id} className="flex flex-col gap-2.5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-base leading-none">
                        {TIPO_ICON[a.tipo]}
                      </span>
                      <span className="text-sm font-medium text-snow">
                        {a.nombre}
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${TIPO_COLOR[a.tipo]}`}
                      >
                        {a.tipo}
                      </span>
                    </div>
                    {proyecto && (
                      <p className="mt-0.5 text-[10px] text-dim">
                        {proyecto.nombre}
                      </p>
                    )}
                    {a.notas && (
                      <p className="mt-0.5 text-[11px] leading-relaxed text-mut">
                        {a.notas}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => editar(a)}
                      className="text-[10px] text-dim hover:text-turquesa"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => quitar(a.id)}
                      className="text-[10px] text-dim hover:text-magenta"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <a
                  href={hrefSeguro(a.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate rounded bg-panel2 px-2.5 py-1.5 font-mono text-[10px] text-dim transition-colors hover:text-turquesa"
                >
                  {a.url}
                </a>
              </Card>
            );
          })}
        </div>
      )}

      {!abierto ? (
        <button
          onClick={() => setAbierto(true)}
          className="w-full rounded-md border border-dashed border-line2 px-4 py-3 text-center text-sm text-dim transition-colors hover:border-turquesa hover:text-turquesa"
        >
          + Agregar acceso
        </button>
      ) : (
        <Card className="border-line2/60">
          <Label>{editandoId ? "Editar acceso" : "Nuevo acceso"}</Label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <input
                autoFocus
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="Nombre — ej: laCalle.cl Producción, Panel WordPress…"
                className="min-w-48 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
              />
              <div className="min-w-36">
                <Select
                  value={form.tipo}
                  onChange={(v) => set("tipo", v)}
                  options={TIPOS_ACCESO_WEB}
                  className="w-full"
                />
              </div>
            </div>
            <input
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="URL — https://…"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 font-mono text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              {proyectos.length > 0 && (
                <div className="min-w-44 flex-1">
                  <Label>Proyecto · opcional</Label>
                  <select
                    value={form.proyectoId}
                    onChange={(e) => set("proyectoId", e.target.value)}
                    className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
                  >
                    <option value="">General (sin proyecto)</option>
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="min-w-48 flex-1">
                <Label>Notas · opcional</Label>
                <input
                  value={form.notas}
                  onChange={(e) => set("notas", e.target.value)}
                  placeholder="Usuario, contexto, credenciales en…"
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
              <button
                onClick={cancelar}
                className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:text-snow"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={!form.nombre.trim() || !form.url.trim()}
                className="rounded-md bg-turquesa px-4 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Guardar
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
