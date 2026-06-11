"use client";

import { useMemo, useState } from "react";
import {
  TIPOS_OPTIMIZACION,
  TIPO_OPTIMIZACION_STYLE,
  type Campana,
  type Optimizacion,
  type TipoOptimizacion,
} from "@/lib/data";
import { usePersistentState, uid, hoyISO } from "@/lib/store";
import { Select, EmptyHint, Label, StatCard } from "@/components/ui";

const SIN_CAMPANA = "— General";
const TODOS = "Todos";

// Compara fecha ISO (YYYY-MM-DD) con el mes actual
const esEsteMes = (fechaISO: string): boolean => {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  return fechaISO.startsWith(`${año}-${mes}`);
};

export default function Optimizaciones() {
  const [opts, setOpts] = usePersistentState<Optimizacion[]>(
    "paid:optimizaciones",
    []
  );
  const [campanas] = usePersistentState<Campana[]>("paid:campanas", []);

  // Alta rápida
  const [descripcion, setDescripcion] = useState("");
  const [campanaSel, setCampanaSel] = useState(SIN_CAMPANA);
  const [tipoSel, setTipoSel] = useState<TipoOptimizacion>("Cambio de puja");

  // Filtros
  const [fCampana, setFCampana] = useState(TODOS);
  const [fTipo, setFTipo] = useState(TODOS);
  const [fPlataforma, setFPlataforma] = useState(TODOS);

  const nombresCampana = useMemo(
    () => [SIN_CAMPANA, ...campanas.map((c) => c.nombre)],
    [campanas]
  );
  const plataformas = useMemo(
    () => Array.from(new Set(campanas.map((c) => c.plataforma))),
    [campanas]
  );

  const idDeNombre = (nombre: string) =>
    campanas.find((c) => c.nombre === nombre)?.id;
  const nombreDe = (campanaId?: string) =>
    campanas.find((c) => c.id === campanaId)?.nombre;
  const plataformaDe = (campanaId?: string) =>
    campanas.find((c) => c.id === campanaId)?.plataforma;

  const agregar = () => {
    const d = descripcion.trim();
    if (!d) return;
    setOpts([
      ...opts,
      {
        id: uid(),
        fecha: hoyISO(),
        campanaId: idDeNombre(campanaSel),
        tipo: tipoSel,
        descripcion: d,
        resultado: "",
      },
    ]);
    setDescripcion("");
  };

  const actualizar = (id: string, patch: Partial<Optimizacion>) =>
    setOpts(opts.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  // Aplicar filtros
  const filtradas = useMemo(() => {
    return opts.filter((o) => {
      if (fCampana !== TODOS) {
        if (fCampana === SIN_CAMPANA) {
          if (o.campanaId) return false;
        } else if (nombreDe(o.campanaId) !== fCampana) return false;
      }
      if (fTipo !== TODOS && o.tipo !== fTipo) return false;
      if (fPlataforma !== TODOS && plataformaDe(o.campanaId) !== fPlataforma)
        return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts, fCampana, fTipo, fPlataforma, campanas]);

  const ordenadas = useMemo(
    () => [...filtradas].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
    [filtradas]
  );

  // Resumen del mes (sobre TODAS las opts, no filtradas)
  const totalMes = opts.filter((o) => esEsteMes(o.fecha)).length;
  const campanasTocadasMes = new Set(
    opts.filter((o) => esEsteMes(o.fecha) && o.campanaId).map((o) => o.campanaId)
  ).size;
  const creatividadesMes = opts.filter(
    (o) => esEsteMes(o.fecha) && o.tipo === "Nueva creatividad"
  ).length;

  const filtrosActivos =
    (fCampana !== TODOS ? 1 : 0) +
    (fTipo !== TODOS ? 1 : 0) +
    (fPlataforma !== TODOS ? 1 : 0);

  const limpiarFiltros = () => {
    setFCampana(TODOS);
    setFTipo(TODOS);
    setFPlataforma(TODOS);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-mut">
        Bitácora de optimizaciones: cada ajuste queda registrado con su fecha,
        tipo y campaña asociada. Es la evidencia del trabajo de optimización
        continua frente al cliente.
      </p>

      {/* Resumen del mes */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total registradas" value={opts.length} />
        <StatCard label="Este mes" value={totalMes} accent={totalMes > 0} />
        <StatCard label="Campañas tocadas" value={campanasTocadasMes} sub="este mes" />
        <StatCard
          label="Cambios de creatividad"
          value={creatividadesMes}
          sub="este mes"
        />
      </div>

      {/* Alta rápida */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel p-3">
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Qué se optimizó — ej: Excluida audiencia 18–24 por CPA alto…"
          className="min-w-52 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <Select
          value={tipoSel}
          onChange={(v) => setTipoSel(v as TipoOptimizacion)}
          options={TIPOS_OPTIMIZACION}
        />
        <Select
          value={campanaSel}
          onChange={setCampanaSel}
          options={nombresCampana}
        />
        <button
          onClick={agregar}
          className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
        >
          Registrar
        </button>
      </div>

      {/* Filtros */}
      {opts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line2/50 bg-panel/50 p-3">
          <span className="text-[10px] uppercase tracking-wider text-dim">
            Filtrar
          </span>
          <Select
            value={fCampana}
            onChange={setFCampana}
            options={[TODOS, ...nombresCampana]}
          />
          <Select
            value={fTipo}
            onChange={setFTipo}
            options={[TODOS, ...TIPOS_OPTIMIZACION]}
          />
          {plataformas.length > 0 && (
            <Select
              value={fPlataforma}
              onChange={setFPlataforma}
              options={[TODOS, ...plataformas]}
            />
          )}
          <span className="ml-auto text-xs text-mut">
            <span className="text-turquesa">{filtradas.length}</span> de{" "}
            {opts.length} optimizaciones
          </span>
          {filtrosActivos > 0 && (
            <button
              onClick={limpiarFiltros}
              className="rounded-md border border-line px-2.5 py-1 text-[10px] uppercase tracking-wider text-mut transition-colors hover:border-line2 hover:text-snow"
            >
              Limpiar
            </button>
          )}
        </div>
      )}

      {opts.length === 0 ? (
        <EmptyHint>
          Sin optimizaciones registradas todavía. Cada cambio en campañas
          (audiencias, pujas, creativos, presupuestos) se anota aquí con tipo
          y campaña asociada para poder filtrar después.
        </EmptyHint>
      ) : ordenadas.length === 0 ? (
        <EmptyHint>
          Ningún registro coincide con los filtros activos.{" "}
          <button
            onClick={limpiarFiltros}
            className="text-turquesa hover:underline"
          >
            Limpiar filtros
          </button>
          .
        </EmptyHint>
      ) : (
        <div className="relative space-y-0 border-l border-line pl-6">
          {ordenadas.map((o) => {
            const nombre = nombreDe(o.campanaId);
            const plataforma = plataformaDe(o.campanaId);
            return (
              <div key={o.id} className="group relative pb-6">
                <span className="absolute -left-[27.5px] top-1.5 h-2 w-2 rounded-full bg-turquesa" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-turquesa">
                    {o.fecha.split("-").reverse().join("/")}
                  </span>
                  {o.tipo && (
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${TIPO_OPTIMIZACION_STYLE[o.tipo]}`}
                    >
                      {o.tipo}
                    </span>
                  )}
                  {nombre && (
                    <span className="rounded border border-line2 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-mut">
                      {nombre}
                    </span>
                  )}
                  {plataforma && (
                    <span className="font-mono text-[10px] text-dim">
                      · {plataforma}
                    </span>
                  )}
                  <button
                    onClick={() => setOpts(opts.filter((x) => x.id !== o.id))}
                    className="ml-auto text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                    aria-label="Eliminar"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-1.5 text-sm">{o.descripcion}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Label>Resultado</Label>
                  <input
                    value={o.resultado}
                    onChange={(e) =>
                      actualizar(o.id, { resultado: e.target.value })
                    }
                    placeholder="Qué pasó después del cambio — ej: CPA bajó 18% en 7 días…"
                    className="-mt-2 flex-1 bg-transparent text-xs text-mut placeholder:text-dim focus:text-snow"
                  />
                  <Select
                    value={o.tipo ?? "Otro"}
                    onChange={(v) =>
                      actualizar(o.id, { tipo: v as TipoOptimizacion })
                    }
                    options={TIPOS_OPTIMIZACION}
                    className="-mt-2 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
