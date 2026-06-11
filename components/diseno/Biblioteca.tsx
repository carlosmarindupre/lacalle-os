"use client";

import { useState } from "react";
import { TIPOS_PIEZA, type Pieza } from "@/lib/data";
import { usePersistentState } from "@/lib/store";
import { Label, Select, EmptyHint } from "@/components/ui";

const fmtFecha = (f?: string) =>
  f ? f.split("-").reverse().join("/") : "—";

export default function Biblioteca() {
  const [piezas] = usePersistentState<Pieza[]>("diseno:piezas", []);

  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("Todos");

  const entregadas = piezas.filter((p) => p.estado === "Entregado");

  const filtradas = entregadas
    .filter((p) => (tipo === "Todos" ? true : p.tipo === tipo))
    .filter((p) =>
      q.trim()
        ? `${p.titulo} ${p.canal ?? ""} ${p.responsable ?? ""}`
            .toLowerCase()
            .includes(q.trim().toLowerCase())
        : true
    )
    .sort((a, b) => (b.entregadaEn ?? "").localeCompare(a.entregadaEn ?? ""));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Label>Piezas entregadas</Label>
          <div className="font-mono text-2xl text-turquesa">
            {entregadas.length}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar…"
            className="w-44 rounded-md border border-line bg-panel2 px-3 py-1.5 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
          />
          <Select
            value={tipo}
            onChange={setTipo}
            options={["Todos", ...TIPOS_PIEZA]}
          />
        </div>
      </div>

      {entregadas.length === 0 ? (
        <EmptyHint>
          Aún no hay piezas entregadas. Cuando muevas una pieza a{" "}
          <span className="text-turquesa">Entregado</span> en Solicitudes,
          aparece aquí automáticamente.
        </EmptyHint>
      ) : filtradas.length === 0 ? (
        <EmptyHint>Ninguna pieza coincide con el filtro.</EmptyHint>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-lg border border-line bg-panel p-4 transition-colors hover:border-line2"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="text-sm font-medium leading-snug">
                  {p.titulo}
                </span>
                <span className="shrink-0 rounded border border-turquesa/60 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-turquesa">
                  {p.tipo}
                </span>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-dim">
                {p.canal && <span className="text-turquesa">{p.canal}</span>}
                {p.responsable && <span>{p.responsable}</span>}
                <span className="font-mono">
                  Entregada {fmtFecha(p.entregadaEn)}
                </span>
                {p.rondas > 0 && (
                  <span className="font-mono">{p.rondas} rondas</span>
                )}
              </div>
              <div className="mt-auto">
                {p.archivoUrl ? (
                  <a
                    href={p.archivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:border-turquesa hover:text-turquesa"
                  >
                    Abrir archivo ↗
                  </a>
                ) : (
                  <span className="text-[11px] text-dim">
                    Sin link de archivo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
