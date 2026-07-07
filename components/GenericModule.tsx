"use client";

import { useState } from "react";
import { type Servicio } from "@/lib/data";
import { usePersistentState, uid, hoyISO } from "@/lib/store";
import { hrefSeguro } from "@/lib/url";
import {
  PageHeader,
  Card,
  Label,
  Select,
  EmptyHint,
} from "@/components/ui";

const ESTADOS_TAREA = ["Pendiente", "En proceso", "Lista"] as const;
type EstadoTarea = (typeof ESTADOS_TAREA)[number];

type Tarea = {
  id: string;
  texto: string;
  asignado: string;
  fecha: string;
  estado: EstadoTarea;
};

type Entregable = {
  id: string;
  nombre: string;
  url: string;
  fecha: string;
};

const ESTADO_TAREA_STYLE: Record<EstadoTarea, string> = {
  Pendiente: "text-dim",
  "En proceso": "text-snow",
  Lista: "text-turquesa",
};

export default function GenericModule({ servicio }: { servicio: Servicio }) {
  const [tareas, setTareas] = usePersistentState<Tarea[]>(
    `mod:${servicio.slug}:tareas`,
    []
  );
  const [entregables, setEntregables] = usePersistentState<Entregable[]>(
    `mod:${servicio.slug}:entregables`,
    []
  );

  const [draftTarea, setDraftTarea] = useState("");
  const [draftAsignado, setDraftAsignado] = useState("");
  const [draftNombre, setDraftNombre] = useState("");
  const [draftUrl, setDraftUrl] = useState("");

  const agregarTarea = () => {
    const t = draftTarea.trim();
    if (!t) return;
    setTareas([
      ...tareas,
      {
        id: uid(),
        texto: t,
        asignado: draftAsignado.trim(),
        fecha: hoyISO(),
        estado: "Pendiente",
      },
    ]);
    setDraftTarea("");
    setDraftAsignado("");
  };

  const agregarEntregable = () => {
    const n = draftNombre.trim();
    if (!n) return;
    setEntregables([
      ...entregables,
      { id: uid(), nombre: n, url: draftUrl.trim(), fecha: hoyISO() },
    ]);
    setDraftNombre("");
    setDraftUrl("");
  };

  const pendientes = tareas.filter((t) => t.estado !== "Lista").length;

  return (
    <>
      <PageHeader
        kicker={`Servicio ${servicio.num}`}
        title={servicio.nombre}
        desc={servicio.desc}
        right={
          <div className="rounded-md border border-magenta/40 px-3 py-2 text-right">
            <div className="text-[9px] uppercase tracking-[0.18em] text-magenta">
              Módulo base
            </div>
            <div className="mt-0.5 text-[10px] text-dim">
              Profundización en cola
            </div>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tareas */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <Label>Tareas activas</Label>
            <span className="font-mono text-[10px] text-dim">
              {pendientes} pendientes
            </span>
          </div>

          <div className="mb-4 flex gap-2">
            <input
              value={draftTarea}
              onChange={(e) => setDraftTarea(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarTarea()}
              placeholder="Nueva tarea…"
              className="flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
            />
            <input
              value={draftAsignado}
              onChange={(e) => setDraftAsignado(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarTarea()}
              placeholder="Asignado"
              className="w-28 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
            />
            <button
              onClick={agregarTarea}
              className="rounded-md border border-line px-3 text-sm text-mut transition-colors hover:border-turquesa hover:text-turquesa"
            >
              +
            </button>
          </div>

          {tareas.length === 0 ? (
            <EmptyHint>Sin tareas registradas para este servicio.</EmptyHint>
          ) : (
            <ul className="space-y-1.5">
              {tareas.map((t) => (
                <li
                  key={t.id}
                  className="group flex items-center gap-3 rounded-md border border-line bg-panel2 px-3 py-2"
                >
                  <span
                    className={`flex-1 text-sm ${
                      t.estado === "Lista" ? "text-mut line-through" : ""
                    }`}
                  >
                    {t.texto}
                  </span>
                  {t.asignado && (
                    <span className="rounded bg-line px-1.5 py-0.5 text-[10px] text-mut">
                      {t.asignado}
                    </span>
                  )}
                  <Select
                    value={t.estado}
                    onChange={(v) =>
                      setTareas(
                        tareas.map((x) =>
                          x.id === t.id ? { ...x, estado: v as EstadoTarea } : x
                        )
                      )
                    }
                    options={ESTADOS_TAREA}
                    className={ESTADO_TAREA_STYLE[t.estado]}
                  />
                  <button
                    onClick={() => setTareas(tareas.filter((x) => x.id !== t.id))}
                    className="text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                    aria-label="Eliminar"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Entregables */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <Label>Entregables</Label>
            <span className="font-mono text-[10px] text-dim">
              {entregables.length}
            </span>
          </div>

          <div className="mb-4 flex gap-2">
            <input
              value={draftNombre}
              onChange={(e) => setDraftNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarEntregable()}
              placeholder="Nombre del entregable…"
              className="flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
            />
            <input
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarEntregable()}
              placeholder="Link (Drive, Figma…)"
              className="w-40 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
            />
            <button
              onClick={agregarEntregable}
              className="rounded-md border border-line px-3 text-sm text-mut transition-colors hover:border-turquesa hover:text-turquesa"
            >
              +
            </button>
          </div>

          {entregables.length === 0 ? (
            <EmptyHint>
              Archivos, links y outputs del servicio quedarán registrados aquí.
            </EmptyHint>
          ) : (
            <ul className="space-y-1.5">
              {entregables.map((e) => (
                <li
                  key={e.id}
                  className="group flex items-center gap-3 rounded-md border border-line bg-panel2 px-3 py-2"
                >
                  <span className="h-1.5 w-1.5 shrink-0 bg-turquesa" />
                  {e.url ? (
                    <a
                      href={hrefSeguro(e.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 truncate text-sm transition-colors hover:text-turquesa"
                    >
                      {e.nombre} ↗
                    </a>
                  ) : (
                    <span className="flex-1 truncate text-sm">{e.nombre}</span>
                  )}
                  <span className="font-mono text-[10px] text-dim">
                    {e.fecha.slice(5).split("-").reverse().join("/")}
                  </span>
                  <button
                    onClick={() =>
                      setEntregables(entregables.filter((x) => x.id !== e.id))
                    }
                    className="text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                    aria-label="Eliminar"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="mt-8 text-xs text-dim">
        Este servicio opera con el módulo base (tareas + entregables). Su módulo
        de ejecución especializado se construirá a continuación — como ya se hizo
        con <span className="text-turquesa">Redes Sociales</span>.
      </p>
    </>
  );
}
