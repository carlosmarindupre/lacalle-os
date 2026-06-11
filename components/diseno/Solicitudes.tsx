"use client";

import { useState } from "react";
import {
  ESTADOS_PIEZA,
  ESTADO_PIEZA_COL,
  CANALES_PIEZA,
  TIPOS_PIEZA,
  type EstadoPieza,
  type Pieza,
  type TipoPieza,
} from "@/lib/data";
import { usePersistentState, uid, hoyISO } from "@/lib/store";
import { Select, EmptyHint } from "@/components/ui";

const fmtFecha = (f?: string) =>
  f ? f.slice(5).split("-").reverse().join("/") : "";

export default function Solicitudes() {
  const [piezas, setPiezas] = usePersistentState<Pieza[]>("diseno:piezas", []);

  // alta rápida
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoPieza>("Post / Feed");
  const [canal, setCanal] = useState<string>("Instagram");
  const [responsable, setResponsable] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");

  // ui
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<EstadoPieza | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);

  const hoy = hoyISO();

  const agregar = () => {
    const t = titulo.trim();
    if (!t) return;
    setPiezas([
      ...piezas,
      {
        id: uid(),
        titulo: t,
        tipo,
        canal: canal || undefined,
        responsable: responsable.trim() || undefined,
        fechaSolicitud: hoy,
        fechaEntrega: fechaEntrega || undefined,
        estado: "En cola",
        rondas: 0,
      },
    ]);
    setTitulo("");
    setResponsable("");
    setFechaEntrega("");
  };

  const actualizar = (id: string, patch: Partial<Pieza>) =>
    setPiezas(piezas.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  // Cambia el estado y sella fechas de aprobación / entrega la primera vez.
  const cambiarEstado = (id: string, estado: EstadoPieza) => {
    const pieza = piezas.find((p) => p.id === id);
    if (!pieza) return;
    const patch: Partial<Pieza> = { estado };
    if (estado === "Aprobado" && !pieza.aprobadaEn) patch.aprobadaEn = hoy;
    if (estado === "Entregado") {
      if (!pieza.aprobadaEn) patch.aprobadaEn = hoy;
      if (!pieza.entregadaEn) patch.entregadaEn = hoy;
    }
    actualizar(id, patch);
  };

  const eliminar = (id: string) =>
    setPiezas(piezas.filter((p) => p.id !== id));

  const empezarDrag = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => setDragId(id), 0);
  };

  const soltar = (e: React.DragEvent, estado: EstadoPieza) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    if (id) cambiarEstado(id, estado);
    setDragId(null);
    setOverCol(null);
  };

  // resumen
  const enCola = piezas.filter((p) => p.estado === "En cola").length;
  const enProduccion = piezas.filter((p) =>
    ["En proceso", "Revisión interna"].includes(p.estado)
  ).length;
  const esperandoCliente = piezas.filter(
    (p) => p.estado === "Aprobación cliente"
  ).length;
  const entregadas = piezas.filter((p) => p.estado === "Entregado").length;

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["En cola", enCola, "text-mut"],
          ["En producción", enProduccion, "text-snow"],
          ["Esperando cliente", esperandoCliente, "text-magenta"],
          ["Entregadas", entregadas, "text-turquesa"],
        ].map(([label, val, color]) => (
          <div
            key={label as string}
            className="rounded-lg border border-line bg-panel px-4 py-3"
          >
            <div className="text-[10px] uppercase tracking-[0.15em] text-dim">
              {label}
            </div>
            <div className={`mt-1 font-mono text-2xl ${color}`}>{val}</div>
          </div>
        ))}
      </div>

      {/* Alta rápida */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel p-3">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Nueva pieza · Ej: Reel lanzamiento temporada"
          className="min-w-52 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <Select value={tipo} onChange={(v) => setTipo(v as TipoPieza)} options={TIPOS_PIEZA} />
        <Select value={canal} onChange={setCanal} options={CANALES_PIEZA} />
        <input
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Diseñador"
          className="w-28 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <input
          type="date"
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
          className="rounded-md border border-line bg-panel2 px-2 py-1.5 text-xs text-snow transition-colors focus:border-turquesa"
        />
        <button
          onClick={agregar}
          className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
        >
          Añadir
        </button>
      </div>

      {piezas.length === 0 && (
        <EmptyHint>
          Sin solicitudes aún. Agrega la primera pieza y arrástrala por el
          pipeline a medida que avanza.
        </EmptyHint>
      )}

      {/* Pipeline */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {ESTADOS_PIEZA.map((estado) => {
          const items = piezas.filter((p) => p.estado === estado);
          return (
            <div
              key={estado}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (overCol !== estado) setOverCol(estado);
              }}
              onDrop={(e) => soltar(e, estado)}
              className={`flex min-h-72 w-[230px] shrink-0 flex-col rounded-lg border border-t-2 bg-panel transition-colors ${ESTADO_PIEZA_COL[estado]} ${
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
                {items.map((p) => {
                  const vencida =
                    p.fechaEntrega &&
                    p.fechaEntrega < hoy &&
                    p.estado !== "Entregado";
                  const exp = abierta === p.id;
                  return (
                    <div
                      key={p.id}
                      draggable={!exp}
                      onDragStart={(e) => empezarDrag(e, p.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                      className={`group rounded-md border border-line bg-panel2 p-2.5 transition-colors hover:border-line2 ${
                        dragId === p.id ? "opacity-40" : ""
                      } ${exp ? "" : "cursor-grab active:cursor-grabbing"}`}
                    >
                      <div className="mb-1.5 flex items-start justify-between gap-2">
                        <span className="text-xs leading-snug">{p.titulo}</span>
                        <button
                          onClick={() => eliminar(p.id)}
                          className="text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                          aria-label="Eliminar"
                        >
                          ×
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-dim">
                        <span className="rounded bg-line px-1.5 py-0.5 text-mut">
                          {p.tipo}
                        </span>
                        {p.canal && <span className="text-turquesa">{p.canal}</span>}
                      </div>

                      <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                        {p.responsable && (
                          <span className="text-mut">{p.responsable}</span>
                        )}
                        {p.fechaEntrega && (
                          <span
                            className={`font-mono ${
                              vencida ? "text-magenta" : "text-dim"
                            }`}
                          >
                            {vencida ? "⚠ " : ""}
                            {fmtFecha(p.fechaEntrega)}
                          </span>
                        )}
                        {p.rondas > 0 && (
                          <span className="font-mono text-dim">
                            {p.rondas}↺
                          </span>
                        )}
                      </div>

                      {/* Detalle expandible */}
                      {exp && (
                        <div className="mt-2.5 space-y-2 border-t border-line pt-2.5">
                          <textarea
                            value={p.brief ?? ""}
                            onChange={(e) =>
                              actualizar(p.id, { brief: e.target.value })
                            }
                            placeholder="Brief: qué se necesita, mensaje, referencias…"
                            rows={3}
                            className="w-full resize-y rounded border border-line bg-panel px-2 py-1.5 text-[11px] leading-relaxed placeholder:text-dim focus:border-turquesa"
                          />
                          <input
                            value={p.solicitadoPor ?? ""}
                            onChange={(e) =>
                              actualizar(p.id, { solicitadoPor: e.target.value })
                            }
                            placeholder="Solicitado por (servicio / persona)"
                            className="w-full rounded border border-line bg-panel px-2 py-1.5 text-[11px] placeholder:text-dim focus:border-turquesa"
                          />
                          <input
                            value={p.archivoUrl ?? ""}
                            onChange={(e) =>
                              actualizar(p.id, { archivoUrl: e.target.value })
                            }
                            placeholder="Link al archivo final (Drive / Figma)"
                            className="w-full rounded border border-line bg-panel px-2 py-1.5 text-[11px] placeholder:text-dim focus:border-turquesa"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider text-dim">
                              Rondas de revisión
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  actualizar(p.id, {
                                    rondas: Math.max(0, p.rondas - 1),
                                  })
                                }
                                className="h-5 w-5 rounded border border-line text-mut transition-colors hover:border-turquesa hover:text-turquesa"
                              >
                                −
                              </button>
                              <span className="w-5 text-center font-mono text-xs">
                                {p.rondas}
                              </span>
                              <button
                                onClick={() =>
                                  actualizar(p.id, { rondas: p.rondas + 1 })
                                }
                                className="h-5 w-5 rounded border border-line text-mut transition-colors hover:border-turquesa hover:text-turquesa"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <Select
                            value={p.estado}
                            onChange={(v) =>
                              cambiarEstado(p.id, v as EstadoPieza)
                            }
                            options={ESTADOS_PIEZA}
                            className="w-full"
                          />
                        </div>
                      )}

                      <button
                        onClick={() => setAbierta(exp ? null : p.id)}
                        className="mt-2 w-full text-center text-[10px] text-dim transition-colors hover:text-turquesa"
                      >
                        {exp ? "Cerrar" : "Editar brief / detalle"}
                      </button>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div className="rounded-md border border-dashed border-line px-2 py-4 text-center text-[10px] text-dim">
                    Arrastra piezas aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-dim">
        Las piezas en <span className="text-turquesa">Entregado</span> aparecen
        automáticamente en la Biblioteca. Las fechas de aprobación y entrega se
        registran solas para calcular los KPIs de producción.
      </p>
    </div>
  );
}
