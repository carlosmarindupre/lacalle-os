"use client";

import { useState } from "react";
import {
  ESTADOS_AUTO_EMAIL,
  ESTADO_AUTO_CHIP,
  TRIGGERS_AUTO_EMAIL,
  type AutomatizacionEmail,
  type EstadoAutoEmail,
  type TriggerAutoEmail,
  type AudienciaEmail,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { Card, Label, Select, EmptyHint, StatCard } from "@/components/ui";

const TRIGGER_ICON: Record<TriggerAutoEmail, string> = {
  Suscripción: "✉",
  Compra: "🛒",
  "Abandono de carrito": "⏸",
  Cumpleaños: "🎂",
  "Fecha específica": "📅",
  Comportamiento: "👁",
  Manual: "▶",
  Otro: "⚙",
};

export default function Automatizaciones() {
  const [autos, setAutos] = usePersistentState<AutomatizacionEmail[]>(
    "email:automatizaciones",
    []
  );
  const [audiencias] = usePersistentState<AudienciaEmail[]>(
    "email:audiencias",
    []
  );
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const vacio = {
    nombre: "",
    trigger: "Suscripción" as TriggerAutoEmail,
    estado: "En desarrollo" as EstadoAutoEmail,
    pasos: "",
    audienciaId: "",
    urlFlujo: "",
    notas: "",
  };
  const [form, setForm] = useState<typeof vacio>(vacio);
  const set = (k: keyof typeof vacio, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const guardar = () => {
    if (!form.nombre.trim()) return;
    const entrada: AutomatizacionEmail = {
      id: editandoId ?? uid(),
      nombre: form.nombre.trim(),
      trigger: form.trigger,
      estado: form.estado,
      pasos: form.pasos ? Number(form.pasos) : undefined,
      audienciaId: form.audienciaId || undefined,
      urlFlujo: form.urlFlujo.trim() || undefined,
      notas: form.notas.trim() || undefined,
    };
    if (editandoId) {
      setAutos(autos.map((a) => (a.id === editandoId ? entrada : a)));
      setEditandoId(null);
    } else {
      setAutos([...autos, entrada]);
    }
    setForm(vacio);
    setAbierto(false);
  };

  const editar = (a: AutomatizacionEmail) => {
    setForm({
      nombre: a.nombre,
      trigger: a.trigger,
      estado: a.estado,
      pasos: a.pasos?.toString() ?? "",
      audienciaId: a.audienciaId ?? "",
      urlFlujo: a.urlFlujo ?? "",
      notas: a.notas ?? "",
    });
    setEditandoId(a.id);
    setAbierto(true);
  };

  const quitar = (id: string) => {
    if (!confirm("¿Eliminar esta automatización?")) return;
    setAutos(autos.filter((a) => a.id !== id));
  };

  const cancelar = () => {
    setForm(vacio);
    setEditandoId(null);
    setAbierto(false);
  };

  const activas = autos.filter((a) => a.estado === "Activa").length;
  const visibles = autos.filter((a) => a.estado !== "Archivada");
  const archivadas = autos.filter((a) => a.estado === "Archivada");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Automatizaciones"
          value={autos.length}
          accent={autos.length > 0}
        />
        <StatCard label="Activas" value={activas} />
        <StatCard
          label="En desarrollo"
          value={autos.filter((a) => a.estado === "En desarrollo").length}
        />
        <StatCard
          label="Pausadas"
          value={autos.filter((a) => a.estado === "Pausada").length}
        />
      </div>

      {visibles.length === 0 && !abierto ? (
        <EmptyHint>
          Sin automatizaciones registradas. Documenta aquí los flujos de
          email — bienvenida, nurturing, reactivación, post-compra y más.
        </EmptyHint>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibles.map((a) => {
            const audiencia = audiencias.find((au) => au.id === a.audienciaId);
            return (
              <Card key={a.id} className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base leading-none">
                        {TRIGGER_ICON[a.trigger]}
                      </span>
                      <span className="text-sm font-medium text-snow">
                        {a.nombre}
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${ESTADO_AUTO_CHIP[a.estado]}`}
                      >
                        {a.estado}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-dim">
                      <span>Trigger: {a.trigger}</span>
                      {a.pasos && <span>{a.pasos} pasos</span>}
                      {audiencia && <span>· {audiencia.nombre}</span>}
                    </div>
                    {a.notas && (
                      <p className="mt-1 text-[11px] leading-relaxed text-mut">
                        {a.notas}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {a.urlFlujo && (
                      <a
                        href={a.urlFlujo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-dim hover:text-turquesa"
                      >
                        Ver flujo ↗
                      </a>
                    )}
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

                {/* Estado toggle rápido */}
                <div className="flex items-center gap-2 border-t border-line pt-2">
                  <span className="text-[10px] text-dim">Estado:</span>
                  {ESTADOS_AUTO_EMAIL.filter((e) => e !== "Archivada").map(
                    (e) => (
                      <button
                        key={e}
                        onClick={() =>
                          setAutos(
                            autos.map((x) =>
                              x.id === a.id ? { ...x, estado: e } : x
                            )
                          )
                        }
                        className={`rounded px-2 py-0.5 text-[9px] uppercase tracking-wider transition-colors ${
                          a.estado === e
                            ? "bg-turquesa/20 text-turquesa"
                            : "text-dim hover:text-mut"
                        }`}
                      >
                        {e}
                      </button>
                    )
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {archivadas.length > 0 && (
        <details>
          <summary className="cursor-pointer select-none text-[11px] text-dim hover:text-mut">
            {archivadas.length} automatización
            {archivadas.length > 1 ? "es" : ""} archivada
            {archivadas.length > 1 ? "s" : ""}
          </summary>
          <div className="mt-2 space-y-2">
            {archivadas.map((a) => (
              <Card
                key={a.id}
                className="flex items-center justify-between gap-3 opacity-50"
              >
                <span className="text-sm text-dim line-through">{a.nombre}</span>
                <button
                  onClick={() => editar(a)}
                  className="text-[11px] text-dim hover:text-turquesa"
                >
                  Restaurar
                </button>
              </Card>
            ))}
          </div>
        </details>
      )}

      {!abierto ? (
        <button
          onClick={() => setAbierto(true)}
          className="w-full rounded-md border border-dashed border-line2 px-4 py-3 text-center text-sm text-dim transition-colors hover:border-turquesa hover:text-turquesa"
        >
          + Nueva automatización
        </button>
      ) : (
        <Card className="border-line2/60">
          <Label>
            {editandoId ? "Editar automatización" : "Nueva automatización"}
          </Label>
          <div className="space-y-3">
            <input
              autoFocus
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Nombre — ej: Bienvenida nuevos suscriptores, Carrito abandonado…"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              <div className="min-w-40 flex-1">
                <Label>Trigger</Label>
                <Select
                  value={form.trigger}
                  onChange={(v) => set("trigger", v)}
                  options={TRIGGERS_AUTO_EMAIL}
                  className="w-full"
                />
              </div>
              <div className="min-w-36 flex-1">
                <Label>Estado</Label>
                <Select
                  value={form.estado}
                  onChange={(v) => set("estado", v)}
                  options={ESTADOS_AUTO_EMAIL}
                  className="w-full"
                />
              </div>
              <div className="min-w-24">
                <Label>Pasos · nº de emails</Label>
                <input
                  type="number"
                  min="1"
                  value={form.pasos}
                  onChange={(e) => set("pasos", e.target.value)}
                  placeholder="3"
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
            </div>
            {audiencias.length > 0 && (
              <div>
                <Label>Audiencia · opcional</Label>
                <select
                  value={form.audienciaId}
                  onChange={(e) => set("audienciaId", e.target.value)}
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
                >
                  <option value="">— Sin audiencia</option>
                  {audiencias.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <input
              value={form.urlFlujo}
              onChange={(e) => set("urlFlujo", e.target.value)}
              placeholder="URL del flujo en la plataforma · opcional"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 font-mono text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <textarea
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              placeholder="Notas · opcional — objetivo, lógica de ramificación, resultados…"
              rows={2}
              className="w-full resize-none rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
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
