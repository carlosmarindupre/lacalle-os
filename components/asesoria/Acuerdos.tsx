"use client";

import { useState } from "react";
import {
  ESTADOS_ACUERDO,
  LADOS,
  acuerdoVencido,
  type Acta,
  type Acuerdo,
  type EstadoAcuerdo,
  type Lado,
} from "@/lib/data";
import { usePersistentState, uid, hoyISO } from "@/lib/store";
import { Select, EmptyHint, StatCard } from "@/components/ui";

const FILTROS = ["Todos", "Pendientes", "En curso", "Vencidos", "Cumplidos"];

const fmtFecha = (f?: string) =>
  f ? f.split("-").reverse().join("/") : null;

export default function Acuerdos() {
  const [acuerdos, setAcuerdos] = usePersistentState<Acuerdo[]>(
    "asesoria:acuerdos",
    []
  );
  const [actas] = usePersistentState<Acta[]>("asesoria:actas", []);

  const [filtro, setFiltro] = useState("Todos");
  const [texto, setTexto] = useState("");
  const [responsable, setResponsable] = useState("");
  const [lado, setLado] = useState<Lado>("laCalle");
  const [fechaLimite, setFechaLimite] = useState("");

  const hoy = hoyISO();

  const agregar = () => {
    const t = texto.trim();
    if (!t) return;
    setAcuerdos([
      ...acuerdos,
      {
        id: uid(),
        texto: t,
        responsable: responsable.trim(),
        lado,
        fechaLimite: fechaLimite || undefined,
        estado: "Pendiente",
      },
    ]);
    setTexto("");
    setResponsable("");
    setFechaLimite("");
  };

  const actualizar = (id: string, patch: Partial<Acuerdo>) =>
    setAcuerdos(acuerdos.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const eliminar = (id: string) =>
    setAcuerdos(acuerdos.filter((a) => a.id !== id));

  const origenDe = (actaId?: string) => {
    const acta = actas.find((a) => a.id === actaId);
    return acta ? `${acta.tipo} · ${fmtFecha(acta.fecha)}` : null;
  };

  const vencidos = acuerdos.filter((a) => acuerdoVencido(a, hoy));
  const pendientes = acuerdos.filter((a) => a.estado !== "Cumplido");

  const visibles = acuerdos.filter((a) => {
    if (filtro === "Pendientes") return a.estado === "Pendiente";
    if (filtro === "En curso") return a.estado === "En curso";
    if (filtro === "Vencidos") return acuerdoVencido(a, hoy);
    if (filtro === "Cumplidos") return a.estado === "Cumplido";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Acuerdos abiertos" value={pendientes.length} />
        <StatCard
          label="Vencidos"
          value={vencidos.length}
          sub={vencidos.length > 0 ? "Requieren acción inmediata" : undefined}
        />
        <StatCard
          label="Cumplidos"
          value={acuerdos.length - pendientes.length}
          accent
        />
      </div>

      {/* Alta rápida */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel p-3">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Nuevo acuerdo…"
          className="min-w-52 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <input
          value={responsable}
          onChange={(e) => setResponsable(e.target.value)}
          placeholder="Responsable"
          className="w-32 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <Select
          value={lado}
          onChange={(v) => setLado(v as Lado)}
          options={LADOS}
        />
        <input
          type="date"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
          className="rounded-md border border-line bg-panel2 px-2 py-2 text-xs text-snow transition-colors focus:border-turquesa"
        />
        <button
          onClick={agregar}
          className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
        >
          Añadir
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded-md border px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${
              filtro === f
                ? f === "Vencidos"
                  ? "border-magenta bg-magenta/10 text-magenta"
                  : "border-turquesa bg-turquesa/10 text-turquesa"
                : "border-line text-mut hover:border-line2 hover:text-snow"
            }`}
          >
            {f}
            {f === "Vencidos" && vencidos.length > 0 && (
              <span className="ml-1.5 font-mono text-magenta">
                {vencidos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <EmptyHint>
          {acuerdos.length === 0
            ? "Los acuerdos se crean aquí o directamente desde las actas de reunión."
            : "Sin acuerdos en este filtro."}
        </EmptyHint>
      ) : (
        <ul className="space-y-2">
          {visibles.map((a) => {
            const vencido = acuerdoVencido(a, hoy);
            const origen = origenDe(a.actaId);
            return (
              <li
                key={a.id}
                className={`group flex flex-wrap items-center gap-2.5 rounded-md border bg-panel px-3.5 py-2.5 ${
                  vencido ? "border-magenta/60" : "border-line"
                }`}
              >
                <input
                  value={a.texto}
                  onChange={(e) => actualizar(a.id, { texto: e.target.value })}
                  className={`min-w-48 flex-1 bg-transparent text-sm ${
                    a.estado === "Cumplido" ? "text-mut line-through" : ""
                  }`}
                />
                {vencido && (
                  <span className="rounded border border-magenta/60 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-magenta">
                    Vencido
                  </span>
                )}
                {origen && (
                  <span className="font-mono text-[10px] text-dim">
                    {origen}
                  </span>
                )}
                <span
                  className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${
                    a.lado === "laCalle"
                      ? "border-turquesa/60 text-turquesa"
                      : "border-snow/40 text-snow"
                  }`}
                >
                  {a.lado}
                </span>
                <input
                  value={a.responsable}
                  onChange={(e) =>
                    actualizar(a.id, { responsable: e.target.value })
                  }
                  placeholder="Responsable"
                  className="w-28 rounded-md border border-line bg-panel2 px-2 py-1 text-xs placeholder:text-dim transition-colors focus:border-turquesa"
                />
                <input
                  type="date"
                  value={a.fechaLimite ?? ""}
                  onChange={(e) =>
                    actualizar(a.id, {
                      fechaLimite: e.target.value || undefined,
                    })
                  }
                  className={`rounded-md border bg-panel2 px-2 py-1 text-xs transition-colors focus:border-turquesa ${
                    vencido ? "border-magenta/60 text-magenta" : "border-line text-snow"
                  }`}
                />
                <Select
                  value={a.estado}
                  onChange={(v) =>
                    actualizar(a.id, { estado: v as EstadoAcuerdo })
                  }
                  options={ESTADOS_ACUERDO}
                />
                <button
                  onClick={() => eliminar(a.id)}
                  className="text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                  aria-label="Eliminar"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
