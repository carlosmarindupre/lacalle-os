"use client";

import { useState } from "react";
import {
  ESTADOS,
  ESTADO_DOT,
  OBJETIVO_STYLE,
  REDES_INICIAL,
  type Contenido,
  type Estado,
  type RedConfig,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { Select } from "@/components/ui";

const COL_ACCENT: Record<Estado, string> = {
  "No iniciado": "border-t-line2",
  "En proceso": "border-t-snow/50",
  Aprobado: "border-t-turquesa",
  Rechazado: "border-t-magenta",
  Publicado: "border-t-turquesa",
};

export default function Todo() {
  const [contenidos, setContenidos] = usePersistentState<Contenido[]>(
    "redes:contenidos",
    []
  );
  const [redes] = usePersistentState<RedConfig[]>("redes:redes", REDES_INICIAL);
  const redesActivas = redes.filter((r) => r.activa).map((r) => r.red);
  const opcionesRed = redesActivas.length > 0 ? redesActivas : ["Instagram"];

  const [titulo, setTitulo] = useState("");
  const [red, setRed] = useState(opcionesRed[0]);
  const [fecha, setFecha] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Estado | null>(null);

  const agregar = () => {
    const t = titulo.trim();
    if (!t) return;
    setContenidos([
      ...contenidos,
      {
        id: uid(),
        titulo: t,
        red: opcionesRed.includes(red) ? red : opcionesRed[0],
        fecha: fecha || undefined,
        estado: "No iniciado",
      },
    ]);
    setTitulo("");
    setFecha("");
  };

  const actualizar = (id: string, patch: Partial<Contenido>) =>
    setContenidos(contenidos.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const eliminar = (id: string) =>
    setContenidos(contenidos.filter((c) => c.id !== id));

  const empezarDrag = (e: React.DragEvent, id: string) => {
    // Firefox no inicia el drag sin setData
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    // Diferido: re-renderizar el nodo de forma síncrona durante dragstart
    // hace que Chrome cancele el arrastre de inmediato.
    setTimeout(() => setDragId(id), 0);
  };

  const soltar = (e: React.DragEvent, estado: Estado) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    if (id) actualizar(id, { estado });
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
          placeholder="Nueva tarea de contenido…"
          className="min-w-52 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <Select value={red} onChange={setRed} options={opcionesRed} />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="rounded-md border border-line bg-panel2 px-2 py-1.5 text-xs text-snow transition-colors focus:border-turquesa"
        />
        <button
          onClick={agregar}
          className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
        >
          Añadir
        </button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {ESTADOS.map((estado) => {
          const items = contenidos.filter((c) => c.estado === estado);
          return (
            <div
              key={estado}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (overCol !== estado) setOverCol(estado);
              }}
              onDrop={(e) => soltar(e, estado)}
              className={`flex min-h-64 flex-col rounded-lg border border-t-2 bg-panel transition-colors ${COL_ACCENT[estado]} ${
                overCol === estado && dragId
                  ? "border-turquesa/60 bg-panel2"
                  : "border-line"
              }`}
            >
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-[10px] uppercase tracking-[0.15em] text-mut">
                  {estado}
                </span>
                <span className="font-mono text-[10px] text-dim">
                  {items.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 px-2 pb-2">
                {items.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => empezarDrag(e, c.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    className={`group cursor-grab rounded-md border border-line bg-panel2 p-2.5 transition-colors hover:border-line2 active:cursor-grabbing ${
                      dragId === c.id ? "opacity-40" : ""
                    }`}
                  >
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <span className="text-xs leading-snug">{c.titulo}</span>
                      <button
                        onClick={() => eliminar(c.id)}
                        className="text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                        aria-label="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-dim">
                      <span
                        className={`h-1 w-1 rounded-full ${ESTADO_DOT[c.estado]}`}
                      />
                      <span>{c.red}</span>
                      {c.fecha && (
                        <span className="font-mono">
                          · {c.fecha.slice(5).split("-").reverse().join("/")}
                        </span>
                      )}
                      {c.vertical && (
                        <span className="truncate text-turquesa">
                          · {c.vertical}
                        </span>
                      )}
                      {c.objetivo && (
                        <span className={OBJETIVO_STYLE[c.objetivo]}>
                          · {c.objetivo}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Select
                        value={c.estado}
                        onChange={(v) => actualizar(c.id, { estado: v as Estado })}
                        options={ESTADOS}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="rounded-md border border-dashed border-line px-2 py-4 text-center text-[10px] text-dim">
                    Arrastra tarjetas aquí
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
