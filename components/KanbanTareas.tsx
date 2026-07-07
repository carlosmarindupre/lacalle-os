"use client";

import { useState } from "react";
import {
  ESTADOS_TAREA_KANBAN,
  type EstadoTareaKanban,
  type TareaKanban,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { hrefSeguro } from "@/lib/url";
import { Select } from "@/components/ui";

const COL_ACCENT: Record<EstadoTareaKanban, string> = {
  "No iniciado": "border-t-line2",
  "En proceso": "border-t-snow/50",
  "En revisión": "border-t-magenta",
  Completado: "border-t-turquesa",
};

// Kanban de tareas genérico: cada módulo lo instancia con su propio storeKey.
export default function KanbanTareas({
  storeKey,
  placeholder = "Nueva tarea…",
}: {
  storeKey: string;
  placeholder?: string;
}) {
  const [tareas, setTareas] = usePersistentState<TareaKanban[]>(storeKey, []);

  const [titulo, setTitulo] = useState("");
  const [asignado, setAsignado] = useState("");
  const [fecha, setFecha] = useState("");
  const [archivoUrl, setArchivoUrl] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<EstadoTareaKanban | null>(null);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    titulo: "",
    asignado: "",
    fecha: "",
    archivoUrl: "",
    estado: "No iniciado" as EstadoTareaKanban,
  });

  const agregar = () => {
    const t = titulo.trim();
    if (!t) return;
    setTareas([
      ...tareas,
      {
        id: uid(),
        titulo: t,
        asignado: asignado.trim() || undefined,
        fecha: fecha || undefined,
        archivoUrl: archivoUrl.trim() || undefined,
        estado: "No iniciado",
      },
    ]);
    setTitulo("");
    setAsignado("");
    setFecha("");
    setArchivoUrl("");
  };

  const actualizar = (id: string, patch: Partial<TareaKanban>) =>
    setTareas(tareas.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const eliminar = (id: string) =>
    setTareas(tareas.filter((t) => t.id !== id));

  const empezarEdicion = (t: TareaKanban) => {
    setEditandoId(t.id);
    setDraft({
      titulo: t.titulo,
      asignado: t.asignado ?? "",
      fecha: t.fecha ?? "",
      archivoUrl: t.archivoUrl ?? "",
      estado: t.estado,
    });
  };

  const guardarEdicion = () => {
    const tit = draft.titulo.trim();
    if (!editandoId || !tit) return;
    actualizar(editandoId, {
      titulo: tit,
      asignado: draft.asignado.trim() || undefined,
      fecha: draft.fecha || undefined,
      archivoUrl: draft.archivoUrl.trim() || undefined,
      estado: draft.estado,
    });
    setEditandoId(null);
  };

  const empezarDrag = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    // Diferido: re-renderizar durante dragstart cancela el arrastre en Chrome
    setTimeout(() => setDragId(id), 0);
  };

  const soltar = (e: React.DragEvent, estado: EstadoTareaKanban) => {
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
          placeholder={placeholder}
          className="min-w-52 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <input
          value={asignado}
          onChange={(e) => setAsignado(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Asignado"
          className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa sm:w-28"
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="rounded-md border border-line bg-panel2 px-2 py-1.5 text-xs text-snow transition-colors focus:border-turquesa"
        />
        <input
          value={archivoUrl}
          onChange={(e) => setArchivoUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Link de la pieza (Drive / Figma)"
          className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa sm:w-52"
        />
        <button
          onClick={agregar}
          className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
        >
          Añadir
        </button>
      </div>

      {/* Kanban */}
      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <div className="grid min-w-[560px] grid-cols-4 gap-3">
        {ESTADOS_TAREA_KANBAN.map((estado) => {
          const items = tareas.filter((t) => t.estado === estado);
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
                {items.map((t) => (
                  <div
                    key={t.id}
                    draggable={editandoId !== t.id}
                    onDragStart={(e) => empezarDrag(e, t.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    className={`group rounded-md border border-line bg-panel2 p-2.5 transition-colors hover:border-line2 ${
                      editandoId === t.id
                        ? "border-turquesa/60"
                        : "cursor-grab active:cursor-grabbing"
                    } ${dragId === t.id ? "opacity-40" : ""}`}
                  >
                    {editandoId === t.id ? (
                      <div
                        className="space-y-1.5"
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setEditandoId(null);
                        }}
                      >
                        <input
                          value={draft.titulo}
                          onChange={(e) =>
                            setDraft({ ...draft, titulo: e.target.value })
                          }
                          onKeyDown={(e) => e.key === "Enter" && guardarEdicion()}
                          autoFocus
                          placeholder="Título"
                          className="w-full rounded-md border border-line bg-panel px-2 py-1.5 text-xs placeholder:text-dim transition-colors focus:border-turquesa"
                        />
                        <input
                          value={draft.asignado}
                          onChange={(e) =>
                            setDraft({ ...draft, asignado: e.target.value })
                          }
                          onKeyDown={(e) => e.key === "Enter" && guardarEdicion()}
                          placeholder="Asignado"
                          className="w-full rounded-md border border-line bg-panel px-2 py-1.5 text-xs placeholder:text-dim transition-colors focus:border-turquesa"
                        />
                        <input
                          type="date"
                          value={draft.fecha}
                          onChange={(e) =>
                            setDraft({ ...draft, fecha: e.target.value })
                          }
                          className="w-full rounded-md border border-line bg-panel px-2 py-1.5 text-xs text-snow transition-colors focus:border-turquesa"
                        />
                        <input
                          value={draft.archivoUrl}
                          onChange={(e) =>
                            setDraft({ ...draft, archivoUrl: e.target.value })
                          }
                          onKeyDown={(e) => e.key === "Enter" && guardarEdicion()}
                          placeholder="Link de la pieza…"
                          className="w-full rounded-md border border-line bg-panel px-2 py-1.5 text-xs placeholder:text-dim transition-colors focus:border-turquesa"
                        />
                        <Select
                          value={draft.estado}
                          onChange={(v) =>
                            setDraft({
                              ...draft,
                              estado: v as EstadoTareaKanban,
                            })
                          }
                          options={ESTADOS_TAREA_KANBAN}
                          className="w-full"
                        />
                        <div className="space-y-1.5 pt-0.5">
                          <button
                            onClick={guardarEdicion}
                            disabled={!draft.titulo.trim()}
                            className="w-full rounded-md bg-turquesa px-2 py-1.5 text-[11px] font-medium text-ink transition-opacity hover:opacity-85 disabled:opacity-40"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditandoId(null)}
                            className="w-full rounded-md border border-line px-2 py-1.5 text-[11px] text-mut transition-colors hover:border-line2 hover:text-snow"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <span className="text-xs leading-snug">{t.titulo}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => empezarEdicion(t)}
                          className="text-dim opacity-0 transition-opacity hover:text-turquesa group-hover:opacity-100"
                          aria-label="Editar"
                        >
                          ✎
                        </button>
                      <button
                        onClick={() => eliminar(t.id)}
                        className="text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                        aria-label="Eliminar"
                      >
                        ×
                      </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-dim">
                      {t.asignado && (
                        <span className="rounded bg-line px-1.5 py-0.5 text-mut">
                          {t.asignado}
                        </span>
                      )}
                      {t.fecha && (
                        <span className="font-mono">
                          {t.fecha.slice(5).split("-").reverse().join("/")}
                        </span>
                      )}
                      {t.archivoUrl && (
                        <a
                          href={hrefSeguro(t.archivoUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          draggable={false}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-0.5 rounded bg-turquesa/10 px-1.5 py-0.5 font-medium text-turquesa transition-colors hover:bg-turquesa/20"
                        >
                          ↗ Pieza
                        </a>
                      )}
                    </div>
                    <div className="mt-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Select
                        value={t.estado}
                        onChange={(v) =>
                          actualizar(t.id, { estado: v as EstadoTareaKanban })
                        }
                        options={ESTADOS_TAREA_KANBAN}
                        className="w-full"
                      />
                    </div>
                      </>
                    )}
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
    </div>
  );
}
