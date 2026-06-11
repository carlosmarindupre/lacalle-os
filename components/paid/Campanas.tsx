"use client";

import { useState } from "react";
import {
  ESTADOS_CAMPANA,
  ESTADO_CAMPANA_CHIP,
  OBJETIVOS_CAMPANA,
  PLATAFORMAS_INICIAL,
  type Campana,
  type EstadoCampana,
  type ObjetivoCampana,
  type PlataformaAds,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { Select, EmptyHint, StatCard } from "@/components/ui";

const num = (v?: string) => {
  const n = Number((v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");

export default function Campanas() {
  const [campanas, setCampanas] = usePersistentState<Campana[]>(
    "paid:campanas",
    []
  );
  const [plataformas] = usePersistentState<PlataformaAds[]>(
    "paid:plataformas",
    PLATAFORMAS_INICIAL
  );

  const activas = plataformas.filter((p) => p.activa).map((p) => p.nombre);
  const opciones = activas.length > 0 ? activas : ["Meta Ads"];

  const [nombre, setNombre] = useState("");
  const [plataforma, setPlataforma] = useState(opciones[0]);
  const [objetivo, setObjetivo] = useState<ObjetivoCampana>("Leads");

  const agregar = () => {
    const n = nombre.trim();
    if (!n) return;
    setCampanas([
      ...campanas,
      {
        id: uid(),
        nombre: n,
        plataforma: opciones.includes(plataforma) ? plataforma : opciones[0],
        objetivo,
        estado: "Borrador",
      },
    ]);
    setNombre("");
  };

  const actualizar = (id: string, patch: Partial<Campana>) =>
    setCampanas(campanas.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const eliminar = (id: string) =>
    setCampanas(campanas.filter((c) => c.id !== id));

  const enCurso = campanas.filter((c) => c.estado === "Activa");
  const planificadoTotal = campanas.reduce((a, c) => a + num(c.presupuesto), 0);
  const ejecutadoTotal = campanas.reduce((a, c) => a + num(c.ejecutado), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Campañas totales" value={campanas.length} />
        <StatCard label="Activas" value={enCurso.length} accent />
        <StatCard
          label="Presupuesto planificado"
          value={fmt(planificadoTotal)}
        />
        <StatCard
          label="Ejecutado"
          value={fmt(ejecutadoTotal)}
          sub={
            planificadoTotal > 0
              ? `${Math.round((ejecutadoTotal / planificadoTotal) * 100)}% del plan`
              : undefined
          }
          accent={ejecutadoTotal <= planificadoTotal}
        />
      </div>

      {/* Alta rápida */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel p-3">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Nueva campaña — ej: Leads · Remarketing junio…"
          className="min-w-52 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <Select value={plataforma} onChange={setPlataforma} options={opciones} />
        <Select
          value={objetivo}
          onChange={(v) => setObjetivo(v as ObjetivoCampana)}
          options={OBJETIVOS_CAMPANA}
        />
        <button
          onClick={agregar}
          className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
        >
          Añadir
        </button>
      </div>

      {campanas.length === 0 ? (
        <EmptyHint>
          Registra cada campaña con su presupuesto planificado y ejecutado — el
          consumo se visualiza automáticamente.
        </EmptyHint>
      ) : (
        <div className="space-y-3">
          {campanas.map((c) => {
            const plan = num(c.presupuesto);
            const ejec = num(c.ejecutado);
            const pct = plan > 0 ? Math.round((ejec / plan) * 100) : 0;
            const excedida = plan > 0 && ejec > plan;
            return (
              <div
                key={c.id}
                className={`group rounded-lg border bg-panel p-4 ${
                  excedida ? "border-magenta/60" : "border-line"
                }`}
              >
                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                  <input
                    value={c.nombre}
                    onChange={(e) =>
                      actualizar(c.id, { nombre: e.target.value })
                    }
                    className="min-w-48 flex-1 bg-transparent text-sm font-medium"
                  />
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${ESTADO_CAMPANA_CHIP[c.estado]}`}
                  >
                    {c.estado}
                  </span>
                  {excedida && (
                    <span className="rounded border border-magenta/60 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-magenta">
                      Presupuesto excedido
                    </span>
                  )}
                  <Select
                    value={c.plataforma}
                    onChange={(v) => actualizar(c.id, { plataforma: v })}
                    options={
                      opciones.includes(c.plataforma)
                        ? opciones
                        : [c.plataforma, ...opciones]
                    }
                  />
                  <Select
                    value={c.objetivo}
                    onChange={(v) =>
                      actualizar(c.id, { objetivo: v as ObjetivoCampana })
                    }
                    options={OBJETIVOS_CAMPANA}
                  />
                  <Select
                    value={c.estado}
                    onChange={(v) =>
                      actualizar(c.id, { estado: v as EstadoCampana })
                    }
                    options={ESTADOS_CAMPANA}
                  />
                  <button
                    onClick={() => eliminar(c.id)}
                    className="text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                    aria-label="Eliminar"
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-mut">
                    <input
                      type="date"
                      value={c.inicio ?? ""}
                      onChange={(e) =>
                        actualizar(c.id, { inicio: e.target.value || undefined })
                      }
                      className="rounded-md border border-line bg-panel2 px-2 py-1 text-xs text-snow transition-colors focus:border-turquesa"
                    />
                    →
                    <input
                      type="date"
                      value={c.fin ?? ""}
                      onChange={(e) =>
                        actualizar(c.id, { fin: e.target.value || undefined })
                      }
                      className="rounded-md border border-line bg-panel2 px-2 py-1 text-xs text-snow transition-colors focus:border-turquesa"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-dim">
                      Plan
                    </span>
                    <input
                      value={c.presupuesto ?? ""}
                      onChange={(e) =>
                        actualizar(c.id, { presupuesto: e.target.value })
                      }
                      placeholder="$0"
                      className="w-28 rounded-md border border-line bg-panel2 px-2 py-1 text-right font-mono text-xs text-snow placeholder:text-dim transition-colors focus:border-turquesa"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-dim">
                      Ejecutado
                    </span>
                    <input
                      value={c.ejecutado ?? ""}
                      onChange={(e) =>
                        actualizar(c.id, { ejecutado: e.target.value })
                      }
                      placeholder="$0"
                      className={`w-28 rounded-md border bg-panel2 px-2 py-1 text-right font-mono text-xs placeholder:text-dim transition-colors focus:border-turquesa ${
                        excedida
                          ? "border-magenta/60 text-magenta"
                          : "border-line text-turquesa"
                      }`}
                    />
                  </div>
                  {plan > 0 && (
                    <div className="flex min-w-32 flex-1 items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                        <div
                          className={`h-full rounded-full transition-all ${
                            excedida ? "bg-magenta" : "bg-turquesa"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span
                        className={`font-mono text-[10px] ${
                          excedida ? "text-magenta" : "text-mut"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
