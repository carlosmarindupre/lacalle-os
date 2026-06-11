"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HORIZONTES,
  ESTADOS_INICIATIVA,
  ESTADO_INICIATIVA_CHIP,
  SERVICIOS,
  type EstadoIniciativa,
  type Horizonte,
  type Iniciativa,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { Select } from "@/components/ui";

const SIN_SERVICIO = "— Sin servicio";
const NOMBRES_SERVICIO = [SIN_SERVICIO, ...SERVICIOS.map((s) => s.corto)];

const porCorto = (corto: string) => SERVICIOS.find((s) => s.corto === corto);
const porSlug = (slug?: string) => SERVICIOS.find((s) => s.slug === slug);

export default function Roadmap() {
  const [iniciativas, setIniciativas] = usePersistentState<Iniciativa[]>(
    "asesoria:roadmap",
    []
  );
  const [titulo, setTitulo] = useState("");
  const [servicio, setServicio] = useState(SIN_SERVICIO);
  const [horizonte, setHorizonte] = useState<Horizonte>(HORIZONTES[0]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Horizonte | null>(null);

  const agregar = () => {
    const t = titulo.trim();
    if (!t) return;
    setIniciativas([
      ...iniciativas,
      {
        id: uid(),
        titulo: t,
        servicioSlug: porCorto(servicio)?.slug,
        horizonte,
        estado: "Planificada",
      },
    ]);
    setTitulo("");
    setServicio(SIN_SERVICIO);
  };

  const actualizar = (id: string, patch: Partial<Iniciativa>) =>
    setIniciativas(
      iniciativas.map((i) => (i.id === id ? { ...i, ...patch } : i))
    );

  const eliminar = (id: string) =>
    setIniciativas(iniciativas.filter((i) => i.id !== id));

  const empezarDrag = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    // Diferido: re-renderizar durante dragstart cancela el arrastre en Chrome
    setTimeout(() => setDragId(id), 0);
  };

  const soltar = (e: React.DragEvent, h: Horizonte) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    if (id) actualizar(id, { horizonte: h });
    setDragId(null);
    setOverCol(null);
  };

  return (
    <div className="space-y-6">
      {/* Alta rápida */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel p-3">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Nueva iniciativa estratégica…"
          className="min-w-52 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <Select
          value={servicio}
          onChange={setServicio}
          options={NOMBRES_SERVICIO}
        />
        <Select
          value={horizonte}
          onChange={(v) => setHorizonte(v as Horizonte)}
          options={HORIZONTES}
        />
        <button
          onClick={agregar}
          className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
        >
          Añadir
        </button>
      </div>

      {/* Columnas por horizonte */}
      <div className="grid gap-3 md:grid-cols-3">
        {HORIZONTES.map((h) => {
          const items = iniciativas.filter((i) => i.horizonte === h);
          return (
            <div
              key={h}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (overCol !== h) setOverCol(h);
              }}
              onDrop={(e) => soltar(e, h)}
              className={`flex min-h-72 flex-col rounded-lg border border-t-2 border-t-turquesa/50 bg-panel transition-colors ${
                overCol === h && dragId
                  ? "border-turquesa/60 bg-panel2"
                  : "border-line"
              }`}
            >
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-mut">
                  {h}
                </span>
                <span className="font-mono text-[10px] text-dim">
                  {items.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 px-2 pb-2">
                {items.map((i) => {
                  const sv = porSlug(i.servicioSlug);
                  return (
                    <div
                      key={i.id}
                      draggable
                      onDragStart={(e) => empezarDrag(e, i.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                      className={`group cursor-grab rounded-md border border-line bg-panel2 p-3 transition-colors hover:border-line2 active:cursor-grabbing ${
                        dragId === i.id ? "opacity-40" : ""
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <input
                          value={i.titulo}
                          onChange={(e) =>
                            actualizar(i.id, { titulo: e.target.value })
                          }
                          className="w-full bg-transparent text-sm font-medium leading-snug"
                        />
                        <button
                          onClick={() => eliminar(i.id)}
                          className="text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                          aria-label="Eliminar"
                        >
                          ×
                        </button>
                      </div>
                      <input
                        value={i.impacto ?? ""}
                        onChange={(e) =>
                          actualizar(i.id, { impacto: e.target.value })
                        }
                        placeholder="Impacto esperado…"
                        className="mb-2.5 w-full bg-transparent text-xs text-mut placeholder:text-dim"
                      />
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Select
                          value={i.estado}
                          onChange={(v) =>
                            actualizar(i.id, {
                              estado: v as EstadoIniciativa,
                            })
                          }
                          options={ESTADOS_INICIATIVA}
                        />
                        <Select
                          value={sv?.corto ?? SIN_SERVICIO}
                          onChange={(v) =>
                            actualizar(i.id, {
                              servicioSlug: porCorto(v)?.slug,
                            })
                          }
                          options={NOMBRES_SERVICIO}
                        />
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${ESTADO_INICIATIVA_CHIP[i.estado]}`}
                        >
                          {i.estado}
                        </span>
                        {sv && (
                          <Link
                            href={`/servicios/${sv.slug}`}
                            className="text-[10px] text-mut transition-colors hover:text-turquesa"
                          >
                            {sv.num} →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div className="rounded-md border border-dashed border-line px-2 py-4 text-center text-[10px] text-dim">
                    Arrastra iniciativas aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
