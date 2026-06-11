"use client";

import { useState } from "react";
import {
  TIPOS_PROYECTO_WEB,
  ESTADOS_PROYECTO_WEB,
  ESTADO_PROYECTO_WEB_CHIP,
  type ProyectoWeb,
  type TipoProyectoWeb,
  type EstadoProyectoWeb,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { Card, Label, Select, EmptyHint, StatCard } from "@/components/ui";

const hoy = () => new Date().toISOString().split("T")[0];

const ESTADO_DOT: Record<EstadoProyectoWeb, string> = {
  Planificado: "bg-dim",
  "En desarrollo": "bg-snow",
  "En staging": "bg-magenta",
  Live: "bg-turquesa",
  "En mantenimiento": "bg-turquesa/60",
  Pausado: "bg-dim",
  Archivado: "bg-dim",
};

export default function Proyectos() {
  const [proyectos, setProyectos] = usePersistentState<ProyectoWeb[]>(
    "web:proyectos",
    []
  );
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const vacio: Omit<ProyectoWeb, "id"> = {
    nombre: "",
    tipo: "Sitio corporativo",
    estado: "Planificado",
    descripcion: "",
    responsable: "",
    fechaInicio: hoy(),
    fechaObjetivo: "",
    fechaLive: "",
  };

  const [form, setForm] = useState<Omit<ProyectoWeb, "id">>(vacio);

  const set = (k: keyof typeof vacio, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const guardar = () => {
    if (!form.nombre.trim()) return;
    if (editandoId) {
      setProyectos(
        proyectos.map((p) =>
          p.id === editandoId ? { ...form, id: editandoId } : p
        )
      );
      setEditandoId(null);
    } else {
      setProyectos([...proyectos, { ...form, id: uid() }]);
    }
    setForm(vacio);
    setAbierto(false);
  };

  const editar = (p: ProyectoWeb) => {
    setForm({ ...p });
    setEditandoId(p.id);
    setAbierto(true);
  };

  const quitar = (id: string) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    setProyectos(proyectos.filter((p) => p.id !== id));
  };

  const cancelar = () => {
    setForm(vacio);
    setEditandoId(null);
    setAbierto(false);
  };

  const activos = proyectos.filter(
    (p) =>
      p.estado !== "Archivado" &&
      p.estado !== "Pausado"
  );
  const live = proyectos.filter((p) => p.estado === "Live").length;
  const enDesarrollo = proyectos.filter(
    (p) => p.estado === "En desarrollo" || p.estado === "En staging"
  ).length;

  const visibles = proyectos.filter((p) => p.estado !== "Archivado");
  const archivados = proyectos.filter((p) => p.estado === "Archivado");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total de proyectos" value={proyectos.length} accent={proyectos.length > 0} />
        <StatCard label="Live" value={live} />
        <StatCard label="En desarrollo" value={enDesarrollo} />
        <StatCard label="Activos" value={activos.length} />
      </div>

      {visibles.length === 0 && !abierto ? (
        <EmptyHint>
          Sin proyectos web. Agrega el primer proyecto para comenzar a rastrear
          su estado, fases y accesos.
        </EmptyHint>
      ) : (
        <div className="space-y-3">
          {visibles.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${ESTADO_DOT[p.estado]}`}
                  />
                  <span className="text-sm font-medium text-snow">
                    {p.nombre}
                  </span>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${ESTADO_PROYECTO_WEB_CHIP[p.estado]}`}
                  >
                    {p.estado}
                  </span>
                  <span className="rounded border border-line2 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-dim">
                    {p.tipo}
                  </span>
                </div>
                {p.descripcion && (
                  <p className="mt-1 text-xs leading-relaxed text-mut">
                    {p.descripcion}
                  </p>
                )}
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-dim">
                  {p.responsable && <span>· {p.responsable}</span>}
                  {p.fechaInicio && <span>Inicio: {p.fechaInicio}</span>}
                  {p.fechaObjetivo && <span>Objetivo: {p.fechaObjetivo}</span>}
                  {p.fechaLive && (
                    <span className="text-turquesa">Live: {p.fechaLive}</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => editar(p)}
                  className="text-[11px] text-dim transition-colors hover:text-turquesa"
                >
                  Editar
                </button>
                <button
                  onClick={() => quitar(p.id)}
                  className="text-[11px] text-dim transition-colors hover:text-magenta"
                >
                  ×
                </button>
              </div>
            </Card>
          ))}

          {archivados.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer select-none text-[11px] text-dim hover:text-mut">
                {archivados.length} proyecto
                {archivados.length > 1 ? "s" : ""} archivado
                {archivados.length > 1 ? "s" : ""}
              </summary>
              <div className="mt-2 space-y-2">
                {archivados.map((p) => (
                  <Card key={p.id} className="flex items-center justify-between gap-3 opacity-50">
                    <span className="text-sm text-dim line-through">
                      {p.nombre}
                    </span>
                    <button
                      onClick={() =>
                        setProyectos(
                          proyectos.map((x) =>
                            x.id === p.id
                              ? { ...x, estado: "Pausado" }
                              : x
                          )
                        )
                      }
                      className="text-[11px] text-dim hover:text-turquesa"
                    >
                      Restaurar
                    </button>
                  </Card>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {!abierto ? (
        <button
          onClick={() => setAbierto(true)}
          className="w-full rounded-md border border-dashed border-line2 px-4 py-3 text-center text-sm text-dim transition-colors hover:border-turquesa hover:text-turquesa"
        >
          + Nuevo proyecto web
        </button>
      ) : (
        <Card className="border-line2/60">
          <Label>{editandoId ? "Editar proyecto" : "Nuevo proyecto"}</Label>
          <div className="space-y-3">
            <input
              autoFocus
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Nombre del proyecto"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              <div className="min-w-32 flex-1">
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onChange={(v) => set("tipo", v)}
                  options={TIPOS_PROYECTO_WEB}
                  className="w-full"
                />
              </div>
              <div className="min-w-36 flex-1">
                <Label>Estado</Label>
                <Select
                  value={form.estado}
                  onChange={(v) => set("estado", v)}
                  options={ESTADOS_PROYECTO_WEB}
                  className="w-full"
                />
              </div>
              <div className="min-w-36 flex-1">
                <Label>Responsable</Label>
                <input
                  value={form.responsable ?? ""}
                  onChange={(e) => set("responsable", e.target.value)}
                  placeholder="Nombre"
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
            </div>
            <textarea
              value={form.descripcion ?? ""}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Descripción · opcional"
              rows={2}
              className="w-full resize-none rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              <div className="min-w-36 flex-1">
                <Label>Fecha de inicio</Label>
                <input
                  type="date"
                  value={form.fechaInicio ?? ""}
                  onChange={(e) => set("fechaInicio", e.target.value)}
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
              <div className="min-w-36 flex-1">
                <Label>Fecha objetivo</Label>
                <input
                  type="date"
                  value={form.fechaObjetivo ?? ""}
                  onChange={(e) => set("fechaObjetivo", e.target.value)}
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
              <div className="min-w-36 flex-1">
                <Label>Fecha live · si aplica</Label>
                <input
                  type="date"
                  value={form.fechaLive ?? ""}
                  onChange={(e) => set("fechaLive", e.target.value)}
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
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
                disabled={!form.nombre.trim()}
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
