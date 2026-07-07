"use client";

import { useState } from "react";
import {
  ESTADOS_FASE_WEB,
  ESTADO_FASE_WEB_CHIP,
  ESTADO_FASE_WEB_BAR,
  type FaseWeb,
  type ProyectoWeb,
  type EstadoFaseWeb,
} from "@/lib/data";
import { usePersistentState, uid, hoyISO } from "@/lib/store";
import { Card, Label, Select, EmptyHint, StatCard } from "@/components/ui";

// Fecha local (Chile). new Date().toISOString() es UTC y adelanta un día por
// las noches; hoyISO usa la fecha local. Ver lib/store.
const hoy = hoyISO;

// Devuelve el rango total en días y el offset/ancho de cada fase dentro de él.
function calcTimeline(fases: FaseWeb[]) {
  const conFechas = fases.filter((f) => f.inicio && f.fin);
  if (conFechas.length === 0) return null;
  const fechas = conFechas.flatMap((f) => [f.inicio!, f.fin!]).sort();
  const minMs = new Date(fechas[0]).getTime();
  const maxMs = new Date(fechas[fechas.length - 1]).getTime();
  const totalMs = maxMs - minMs || 1;
  return { minMs, totalMs };
}

function pct(date: string, minMs: number, totalMs: number) {
  return ((new Date(date).getTime() - minMs) / totalMs) * 100;
}

function FaseBar({
  fase,
  minMs,
  totalMs,
}: {
  fase: FaseWeb;
  minMs: number;
  totalMs: number;
}) {
  if (!fase.inicio || !fase.fin) return null;
  const left = pct(fase.inicio, minMs, totalMs);
  const right = pct(fase.fin, minMs, totalMs);
  const width = Math.max(right - left, 2);
  return (
    <div className="relative h-5 w-full rounded bg-panel2">
      <div
        className={`absolute top-0 h-full rounded ${ESTADO_FASE_WEB_BAR[fase.estado]}`}
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  );
}

export default function Fases() {
  const [fases, setFases] = usePersistentState<FaseWeb[]>("web:fases", []);
  const [proyectos] = usePersistentState<ProyectoWeb[]>("web:proyectos", []);

  const [filtroProyecto, setFiltroProyecto] = useState<string>("todos");
  const [vista, setVista] = useState<"lista" | "timeline">("lista");
  const [abierto, setAbierto] = useState(false);

  const vacio = {
    proyectoId: proyectos[0]?.id ?? "",
    nombre: "",
    estado: "Pendiente" as EstadoFaseWeb,
    inicio: hoy(),
    fin: "",
    notas: "",
  };
  const [form, setForm] = useState<typeof vacio>(vacio);
  const set = (k: keyof typeof vacio, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const guardar = () => {
    if (!form.nombre.trim()) return;
    setFases([...fases, { ...form, id: uid() }]);
    setForm({ ...vacio, proyectoId: form.proyectoId });
    setAbierto(false);
  };

  const actualizar = (id: string, patch: Partial<FaseWeb>) =>
    setFases(fases.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const quitar = (id: string) => {
    if (!confirm("¿Eliminar esta fase?")) return;
    setFases(fases.filter((f) => f.id !== id));
  };

  const fasesVisibles =
    filtroProyecto === "todos"
      ? fases
      : fases.filter((f) => f.proyectoId === filtroProyecto);

  // Proyectos que tienen fases
  const proyectosConFases = proyectos.filter((p) =>
    fases.some((f) => f.proyectoId === p.id)
  );

  const completadas = fases.filter((f) => f.estado === "Completada").length;
  const enCurso = fases.filter((f) => f.estado === "En curso").length;
  const bloqueadas = fases.filter((f) => f.estado === "Bloqueada").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total de fases" value={fases.length} accent={fases.length > 0} />
        <StatCard label="Completadas" value={completadas} />
        <StatCard label="En curso" value={enCurso} />
        <StatCard label="Bloqueadas" value={bloqueadas} />
      </div>

      {/* Controles */}
      {fases.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {proyectos.length > 1 && (
            <select
              value={filtroProyecto}
              onChange={(e) => setFiltroProyecto(e.target.value)}
              className="rounded-md border border-line bg-panel2 px-2.5 py-1.5 text-xs text-snow transition-colors focus:border-turquesa focus:outline-none"
            >
              <option value="todos">Todos los proyectos</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          )}
          <div className="flex rounded-md border border-line overflow-hidden">
            {(["lista", "timeline"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVista(v)}
                className={`px-3 py-1.5 text-xs capitalize transition-colors ${
                  vista === v
                    ? "bg-turquesa text-ink"
                    : "text-mut hover:text-snow"
                }`}
              >
                {v === "lista" ? "Lista" : "Línea de tiempo"}
              </button>
            ))}
          </div>
        </div>
      )}

      {fasesVisibles.length === 0 && !abierto ? (
        <EmptyHint>
          {proyectos.length === 0
            ? "Primero agrega un proyecto en la pestaña Proyectos."
            : "Sin fases registradas. Agrega las etapas del proyecto para visualizar el progreso."}
        </EmptyHint>
      ) : vista === "lista" ? (
        /* ── Vista lista ─────────────────────────────────────────── */
        <div className="space-y-6">
          {(filtroProyecto === "todos" ? proyectosConFases : proyectos.filter((p) => p.id === filtroProyecto)).map((p) => {
            const fasesProyecto = fases.filter((f) => f.proyectoId === p.id);
            if (fasesProyecto.length === 0) return null;
            const completadasP = fasesProyecto.filter((f) => f.estado === "Completada").length;
            const pctCompletado = Math.round((completadasP / fasesProyecto.length) * 100);
            return (
              <div key={p.id}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-sm font-medium text-snow">{p.nombre}</span>
                  <div className="flex-1 h-1 rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full rounded-full bg-turquesa transition-all"
                      style={{ width: `${pctCompletado}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-dim">{pctCompletado}%</span>
                </div>
                <div className="space-y-2">
                  {fasesProyecto.map((f) => (
                    <Card key={f.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-3">
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider shrink-0 ${ESTADO_FASE_WEB_CHIP[f.estado]}`}
                        >
                          {f.estado}
                        </span>
                        <span className="truncate text-sm text-snow">{f.nombre}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-dim">
                          {f.inicio && <span>{f.inicio}</span>}
                          {f.inicio && f.fin && <span>→</span>}
                          {f.fin && <span>{f.fin}</span>}
                        </div>
                        <Select
                          value={f.estado}
                          onChange={(v) => actualizar(f.id, { estado: v as EstadoFaseWeb })}
                          options={ESTADOS_FASE_WEB}
                          className="w-28"
                        />
                        <button
                          onClick={() => quitar(f.id)}
                          className="text-dim transition-colors hover:text-magenta"
                        >
                          ×
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Vista timeline ──────────────────────────────────────── */
        <div className="space-y-8">
          {(filtroProyecto === "todos" ? proyectosConFases : proyectos.filter((p) => p.id === filtroProyecto)).map((p) => {
            const fasesProyecto = fases.filter((f) => f.proyectoId === p.id);
            if (fasesProyecto.length === 0) return null;
            const timeline = calcTimeline(fasesProyecto);
            const sinFechas = fasesProyecto.filter((f) => !f.inicio || !f.fin);
            const conFechas = fasesProyecto.filter((f) => f.inicio && f.fin);
            return (
              <div key={p.id}>
                <div className="mb-3 text-sm font-medium text-snow">{p.nombre}</div>
                {conFechas.length > 0 && timeline ? (
                  <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
                    <div className="min-w-[480px] space-y-2">
                      {conFechas.map((f) => (
                        <div key={f.id} className="flex items-center gap-3">
                          <span className="w-32 shrink-0 truncate text-right text-[11px] text-mut">
                            {f.nombre}
                          </span>
                          <div className="flex-1">
                            <FaseBar fase={f} minMs={timeline.minMs} totalMs={timeline.totalMs} />
                          </div>
                          <span
                            className={`w-20 shrink-0 rounded border px-1.5 py-0.5 text-center text-[9px] uppercase tracking-wider ${ESTADO_FASE_WEB_CHIP[f.estado]}`}
                          >
                            {f.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-dim">
                    Agrega fechas de inicio y fin para ver la línea de tiempo.
                  </p>
                )}
                {sinFechas.length > 0 && (
                  <div className="mt-2 text-[10px] text-dim">
                    {sinFechas.length} fase{sinFechas.length > 1 ? "s" : ""} sin fechas: {sinFechas.map((f) => f.nombre).join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Formulario alta */}
      {proyectos.length > 0 && (
        !abierto ? (
          <button
            onClick={() => {
              setForm({ ...vacio, proyectoId: proyectos[0]?.id ?? "" });
              setAbierto(true);
            }}
            className="w-full rounded-md border border-dashed border-line2 px-4 py-3 text-center text-sm text-dim transition-colors hover:border-turquesa hover:text-turquesa"
          >
            + Agregar fase
          </button>
        ) : (
          <Card className="border-line2/60">
            <Label>Nueva fase</Label>
            <div className="space-y-3">
              {proyectos.length > 1 && (
                <div>
                  <Label>Proyecto</Label>
                  <select
                    value={form.proyectoId}
                    onChange={(e) => set("proyectoId", e.target.value)}
                    className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
                  >
                    {proyectos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <input
                  autoFocus
                  value={form.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  placeholder="Nombre de la fase — ej: Diseño UX, Desarrollo Frontend, QA…"
                  className="min-w-48 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
                />
                <div className="min-w-28">
                  <Select
                    value={form.estado}
                    onChange={(v) => set("estado", v)}
                    options={ESTADOS_FASE_WEB}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="min-w-36 flex-1">
                  <Label>Inicio</Label>
                  <input
                    type="date"
                    value={form.inicio}
                    onChange={(e) => set("inicio", e.target.value)}
                    className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
                  />
                </div>
                <div className="min-w-36 flex-1">
                  <Label>Fin</Label>
                  <input
                    type="date"
                    value={form.fin}
                    onChange={(e) => set("fin", e.target.value)}
                    className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
                  />
                </div>
              </div>
              <textarea
                value={form.notas}
                onChange={(e) => set("notas", e.target.value)}
                placeholder="Notas · opcional"
                rows={2}
                className="w-full resize-none rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
                <button onClick={() => setAbierto(false)} className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:text-snow">
                  Cancelar
                </button>
                <button
                  onClick={guardar}
                  disabled={!form.nombre.trim() || !form.proyectoId}
                  className="rounded-md bg-turquesa px-4 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Guardar
                </button>
              </div>
            </div>
          </Card>
        )
      )}
    </div>
  );
}
