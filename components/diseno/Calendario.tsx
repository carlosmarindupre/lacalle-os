"use client";

import { useState } from "react";
import {
  ESTADOS_PIEZA,
  ESTADO_PIEZA_CHIP,
  type EstadoPieza,
  type Pieza,
} from "@/lib/data";
import { usePersistentState, uid, hoyISO } from "@/lib/store";
import { Card, Label, Select, EmptyHint } from "@/components/ui";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const DOT: Record<EstadoPieza, string> = {
  "En cola": "bg-dim",
  "En proceso": "bg-snow",
  "Revisión interna": "bg-mut",
  "Aprobación cliente": "bg-magenta",
  Aprobado: "bg-turquesa",
  Entregado: "bg-turquesa",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function Calendario() {
  const [piezas, setPiezas] = usePersistentState<Pieza[]>("diseno:piezas", []);

  const now = new Date();
  const [anio, setAnio] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth());
  const [diaSel, setDiaSel] = useState<string | null>(null);

  const primerDia = (new Date(anio, mes, 1).getDay() + 6) % 7; // semana parte lunes
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const hoyStr = hoyISO();

  const fechaDe = (dia: number) => `${anio}-${pad(mes + 1)}-${pad(dia)}`;
  // El calendario de producción agenda por fecha de ENTREGA (deadline).
  const itemsDe = (fecha: string) =>
    piezas.filter((p) => p.fechaEntrega === fecha);

  const mover = (delta: number) => {
    const d = new Date(anio, mes + delta, 1);
    setAnio(d.getFullYear());
    setMes(d.getMonth());
    setDiaSel(null);
  };

  const agregar = (fecha: string) => {
    const nueva: Pieza = {
      id: uid(),
      titulo: "Nueva pieza",
      tipo: "Post / Feed",
      fechaSolicitud: hoyStr,
      fechaEntrega: fecha,
      estado: "En cola",
      rondas: 0,
    };
    setPiezas([...piezas, nueva]);
    setDiaSel(fecha);
  };

  const actualizar = (id: string, patch: Partial<Pieza>) =>
    setPiezas(piezas.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const eliminar = (id: string) =>
    setPiezas(piezas.filter((p) => p.id !== id));

  const seleccionadas = diaSel ? itemsDe(diaSel) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          {MESES[mes]} <span className="font-mono text-mut">{anio}</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => mover(-1)}
            className="rounded-md border border-line px-3 py-1.5 text-sm text-mut transition-colors hover:border-turquesa hover:text-turquesa"
          >
            ←
          </button>
          <button
            onClick={() => {
              setAnio(now.getFullYear());
              setMes(now.getMonth());
            }}
            className="rounded-md border border-line px-3 py-1.5 text-xs uppercase tracking-wider text-mut transition-colors hover:border-turquesa hover:text-turquesa"
          >
            Hoy
          </button>
          <button
            onClick={() => mover(1)}
            className="rounded-md border border-line px-3 py-1.5 text-sm text-mut transition-colors hover:border-turquesa hover:text-turquesa"
          >
            →
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <div className="grid grid-cols-7 border-b border-line bg-panel">
          {DIAS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-[10px] uppercase tracking-[0.18em] text-dim"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: primerDia }).map((_, i) => (
            <div key={`v-${i}`} className="min-h-24 border-b border-r border-line/50 bg-ink" />
          ))}
          {Array.from({ length: diasEnMes }).map((_, i) => {
            const dia = i + 1;
            const fecha = fechaDe(dia);
            const items = itemsDe(fecha);
            const esHoy = fecha === hoyStr;
            const sel = fecha === diaSel;
            const hayVencida = items.some(
              (p) => fecha < hoyStr && p.estado !== "Entregado"
            );
            return (
              <button
                key={fecha}
                onClick={() => setDiaSel(sel ? null : fecha)}
                className={`group min-h-24 border-b border-r border-line/50 p-1.5 text-left align-top transition-colors ${
                  sel ? "bg-panel2" : "bg-panel hover:bg-panel2"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`font-mono text-[11px] ${
                      esHoy ? "rounded bg-turquesa px-1 text-ink" : "text-dim"
                    }`}
                  >
                    {pad(dia)}
                  </span>
                  <span
                    onClick={(ev) => {
                      ev.stopPropagation();
                      agregar(fecha);
                    }}
                    className="cursor-pointer px-1 text-dim opacity-0 transition-opacity hover:text-turquesa group-hover:opacity-100"
                  >
                    +
                  </span>
                </div>
                <div className="space-y-0.5">
                  {items.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center gap-1">
                      <span
                        className={`h-1 w-1 shrink-0 rounded-full ${DOT[p.estado]}`}
                      />
                      <span
                        className={`truncate text-[10px] leading-tight ${
                          hayVencida && p.estado !== "Entregado"
                            ? "text-magenta"
                            : "text-mut"
                        }`}
                      >
                        {p.titulo}
                      </span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-[9px] text-dim">+{items.length - 3} más</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-dim">
        <span className="uppercase tracking-wider">Entregas por estado:</span>
        {ESTADOS_PIEZA.map((e) => (
          <span key={e} className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${DOT[e]}`} />
            {e}
          </span>
        ))}
      </div>

      {diaSel && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <Label>Entregas · {diaSel.split("-").reverse().join("/")}</Label>
            <button
              onClick={() => agregar(diaSel)}
              className="rounded-md border border-line px-3 py-1 text-xs text-mut transition-colors hover:border-turquesa hover:text-turquesa"
            >
              + Añadir pieza
            </button>
          </div>
          {seleccionadas.length === 0 ? (
            <EmptyHint>Sin entregas comprometidas para este día.</EmptyHint>
          ) : (
            <ul className="space-y-2">
              {seleccionadas.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-panel2 p-2.5"
                >
                  <input
                    value={p.titulo}
                    onChange={(e) => actualizar(p.id, { titulo: e.target.value })}
                    className="min-w-40 flex-1 bg-transparent text-sm focus:text-snow"
                  />
                  <Select
                    value={p.estado}
                    onChange={(v) => actualizar(p.id, { estado: v as EstadoPieza })}
                    options={ESTADOS_PIEZA}
                  />
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${ESTADO_PIEZA_CHIP[p.estado]}`}
                  >
                    {p.estado}
                  </span>
                  <button
                    onClick={() => eliminar(p.id)}
                    className="px-1 text-dim transition-colors hover:text-magenta"
                    aria-label="Eliminar"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
