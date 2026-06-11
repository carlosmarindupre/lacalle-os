"use client";

import { useState } from "react";
import {
  ESTADOS_AUDIENCIA_EMAIL,
  ESTADO_AUDIENCIA_CHIP,
  type AudienciaEmail,
  type EstadoAudienciaEmail,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { Card, Label, Select, EmptyHint, StatCard } from "@/components/ui";

export default function Audiencias() {
  const [audiencias, setAudiencias] = usePersistentState<AudienciaEmail[]>(
    "email:audiencias",
    []
  );
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const vacio = {
    nombre: "",
    descripcion: "",
    estado: "Activa" as EstadoAudienciaEmail,
    tamanio: "",
    tasaBaja: "",
    etiquetas: "",
    notas: "",
  };
  const [form, setForm] = useState<typeof vacio>(vacio);
  const set = (k: keyof typeof vacio, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const guardar = () => {
    if (!form.nombre.trim()) return;
    const entrada: AudienciaEmail = {
      id: editandoId ?? uid(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      estado: form.estado,
      tamanio: form.tamanio ? Number(form.tamanio) : undefined,
      tasaBaja: form.tasaBaja ? Number(form.tasaBaja) : undefined,
      etiquetas: form.etiquetas.trim() || undefined,
      notas: form.notas.trim() || undefined,
    };
    if (editandoId) {
      setAudiencias(audiencias.map((a) => (a.id === editandoId ? entrada : a)));
      setEditandoId(null);
    } else {
      setAudiencias([...audiencias, entrada]);
    }
    setForm(vacio);
    setAbierto(false);
  };

  const editar = (a: AudienciaEmail) => {
    setForm({
      nombre: a.nombre,
      descripcion: a.descripcion ?? "",
      estado: a.estado,
      tamanio: a.tamanio?.toString() ?? "",
      tasaBaja: a.tasaBaja?.toString() ?? "",
      etiquetas: a.etiquetas ?? "",
      notas: a.notas ?? "",
    });
    setEditandoId(a.id);
    setAbierto(true);
  };

  const quitar = (id: string) => {
    if (!confirm("¿Eliminar esta audiencia?")) return;
    setAudiencias(audiencias.filter((a) => a.id !== id));
  };

  const cancelar = () => {
    setForm(vacio);
    setEditandoId(null);
    setAbierto(false);
  };

  const visibles = audiencias.filter((a) => a.estado !== "Archivada");
  const archivadas = audiencias.filter((a) => a.estado === "Archivada");
  const totalSuscriptores = audiencias
    .filter((a) => a.estado !== "Archivada")
    .reduce((s, a) => s + (a.tamanio ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Listas / segmentos"
          value={audiencias.length}
          accent={audiencias.length > 0}
        />
        <StatCard
          label="Suscriptores totales"
          value={totalSuscriptores > 0 ? totalSuscriptores.toLocaleString() : "—"}
        />
        <StatCard
          label="Activas"
          value={audiencias.filter((a) => a.estado === "Activa").length}
        />
        <StatCard
          label="En crecimiento"
          value={
            audiencias.filter((a) => a.estado === "En crecimiento").length
          }
        />
      </div>

      {visibles.length === 0 && !abierto ? (
        <EmptyHint>
          Sin audiencias registradas. Documenta las listas y segmentos de
          suscriptores para tener visibilidad del estado de cada base.
        </EmptyHint>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibles.map((a) => (
            <Card key={a.id} className="flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-snow">
                      {a.nombre}
                    </span>
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${ESTADO_AUDIENCIA_CHIP[a.estado]}`}
                    >
                      {a.estado}
                    </span>
                  </div>
                  {a.descripcion && (
                    <p className="mt-0.5 text-[11px] leading-relaxed text-mut">
                      {a.descripcion}
                    </p>
                  )}
                  {a.etiquetas && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {a.etiquetas.split(",").map((t) => (
                        <span
                          key={t}
                          className="rounded bg-panel2 px-1.5 py-0.5 text-[9px] text-dim"
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
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

              {(a.tamanio || a.tasaBaja) && (
                <div className="flex gap-5 border-t border-line pt-2">
                  {a.tamanio && (
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-medium text-snow">
                        {a.tamanio.toLocaleString()}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-dim">
                        Suscriptores
                      </span>
                    </div>
                  )}
                  {a.tasaBaja !== undefined && (
                    <div className="flex flex-col">
                      <span
                        className={`font-mono text-xs font-medium ${
                          a.tasaBaja > 2
                            ? "text-magenta"
                            : a.tasaBaja > 1
                            ? "text-[#d4900f]"
                            : "text-turquesa"
                        }`}
                      >
                        {a.tasaBaja}%
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-dim">
                        Tasa de baja
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {archivadas.length > 0 && (
        <details>
          <summary className="cursor-pointer select-none text-[11px] text-dim hover:text-mut">
            {archivadas.length} audiencia{archivadas.length > 1 ? "s" : ""} archivada
            {archivadas.length > 1 ? "s" : ""}
          </summary>
          <div className="mt-2 space-y-2">
            {archivadas.map((a) => (
              <Card key={a.id} className="flex items-center justify-between gap-3 opacity-50">
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
          + Nueva audiencia
        </button>
      ) : (
        <Card className="border-line2/60">
          <Label>{editandoId ? "Editar audiencia" : "Nueva audiencia"}</Label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <input
                autoFocus
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="Nombre — ej: Newsletter general, Clientes activos…"
                className="min-w-48 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
              />
              <div className="min-w-36">
                <Select
                  value={form.estado}
                  onChange={(v) => set("estado", v)}
                  options={ESTADOS_AUDIENCIA_EMAIL}
                  className="w-full"
                />
              </div>
            </div>
            <input
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Descripción del segmento · opcional"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              <div className="min-w-32 flex-1">
                <Label>Suscriptores</Label>
                <input
                  type="number"
                  min="0"
                  value={form.tamanio}
                  onChange={(e) => set("tamanio", e.target.value)}
                  placeholder="0"
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
              <div className="min-w-32 flex-1">
                <Label>Tasa de baja % · opcional</Label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.tasaBaja}
                  onChange={(e) => set("tasaBaja", e.target.value)}
                  placeholder="0.5"
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
              <div className="min-w-48 flex-1">
                <Label>Etiquetas · separadas por coma</Label>
                <input
                  value={form.etiquetas}
                  onChange={(e) => set("etiquetas", e.target.value)}
                  placeholder="leads, compradores, VIP…"
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
            </div>
            <textarea
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              placeholder="Notas · origen, criterios de segmentación, frecuencia…"
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
