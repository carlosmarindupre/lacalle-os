"use client";

import { useState } from "react";
import {
  ESTADOS,
  ESTADO_DOT,
  ESTADO_CHIP,
  REDES_INICIAL,
  type Contenido,
  type Estado,
  type RedConfig,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { Card, Label, Select, EmptyHint } from "@/components/ui";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const pad = (n: number) => String(n).padStart(2, "0");

export default function Calendario() {
  const [contenidos, setContenidos] = usePersistentState<Contenido[]>(
    "redes:contenidos",
    []
  );
  const [redes] = usePersistentState<RedConfig[]>("redes:redes", REDES_INICIAL);
  const redesActivas = redes.filter((r) => r.activa).map((r) => r.red);
  const opcionesRed = redesActivas.length > 0 ? redesActivas : ["Instagram"];

  const now = new Date();
  const [anio, setAnio] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth());
  const [diaSel, setDiaSel] = useState<string | null>(null);

  const primerDia = (new Date(anio, mes, 1).getDay() + 6) % 7; // semana parte lunes
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const hoyStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const fechaDe = (dia: number) => `${anio}-${pad(mes + 1)}-${pad(dia)}`;
  const itemsDe = (fecha: string) => contenidos.filter((c) => c.fecha === fecha);

  const mover = (delta: number) => {
    const d = new Date(anio, mes + delta, 1);
    setAnio(d.getFullYear());
    setMes(d.getMonth());
    setDiaSel(null);
  };

  const agregar = (fecha: string) => {
    const nuevo: Contenido = {
      id: uid(),
      titulo: "Nueva publicación",
      red: opcionesRed[0],
      fecha,
      estado: "No iniciado",
    };
    setContenidos([...contenidos, nuevo]);
    setDiaSel(fecha);
  };

  const actualizar = (id: string, patch: Partial<Contenido>) =>
    setContenidos(contenidos.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const eliminar = (id: string) =>
    setContenidos(contenidos.filter((c) => c.id !== id));

  const seleccionados = diaSel ? itemsDe(diaSel) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            {MESES[mes]} <span className="font-mono text-mut">{anio}</span>
          </h2>
        </div>
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
                      esHoy
                        ? "rounded bg-turquesa px-1 text-ink"
                        : "text-dim"
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
                  {items.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex items-center gap-1">
                      <span
                        className={`h-1 w-1 shrink-0 rounded-full ${ESTADO_DOT[c.estado]}`}
                      />
                      <span className="truncate text-[10px] leading-tight text-mut">
                        {c.titulo}
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

      {diaSel && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <Label>
              Publicaciones · {diaSel.split("-").reverse().join("/")}
            </Label>
            <button
              onClick={() => agregar(diaSel)}
              className="rounded-md border border-line px-3 py-1 text-xs text-mut transition-colors hover:border-turquesa hover:text-turquesa"
            >
              + Añadir publicación
            </button>
          </div>
          {seleccionados.length === 0 ? (
            <EmptyHint>Sin publicaciones para este día.</EmptyHint>
          ) : (
            <ul className="space-y-2">
              {seleccionados.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-panel2 p-2.5"
                >
                  <input
                    value={c.titulo}
                    onChange={(e) => actualizar(c.id, { titulo: e.target.value })}
                    className="min-w-40 flex-1 bg-transparent text-sm focus:text-snow"
                  />
                  <Select
                    value={c.red}
                    onChange={(v) => actualizar(c.id, { red: v })}
                    options={
                      opcionesRed.includes(c.red)
                        ? opcionesRed
                        : [c.red, ...opcionesRed]
                    }
                  />
                  <Select
                    value={c.estado}
                    onChange={(v) => actualizar(c.id, { estado: v as Estado })}
                    options={ESTADOS}
                  />
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${ESTADO_CHIP[c.estado]}`}
                  >
                    {c.estado}
                  </span>
                  <button
                    onClick={() => eliminar(c.id)}
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
