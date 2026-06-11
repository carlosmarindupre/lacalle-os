"use client";

import { useState } from "react";
import {
  CATEGORIAS_INSIGHT,
  IMPACTOS_INSIGHT,
  IMPACTO_INSIGHT_CHIP,
  CATEGORIA_INSIGHT_COLOR,
  type InsightAnalitica,
  type CategoriaInsight,
  type ImpactoInsight,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { Card, Label, Select, EmptyHint, StatCard } from "@/components/ui";

const hoy = () => new Date().toISOString().split("T")[0];

type FiltroCategoria = CategoriaInsight | "Todas";
type FiltroImpacto = ImpactoInsight | "Todos";

export default function Insights() {
  const [insights, setInsights] = usePersistentState<InsightAnalitica[]>(
    "analitica:insights",
    []
  );

  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState(hoy());
  const [categoria, setCategoria] = useState<CategoriaInsight>("Tráfico");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [impacto, setImpacto] = useState<ImpactoInsight>("Medio");
  const [accion, setAccion] = useState("");

  const [filtroCategoria, setFiltroCategoria] =
    useState<FiltroCategoria>("Todas");
  const [filtroImpacto, setFiltroImpacto] = useState<FiltroImpacto>("Todos");

  const resetFormulario = () => {
    setAbierto(false);
    setTitulo("");
    setDescripcion("");
    setAccion("");
    setFecha(hoy());
    setCategoria("Tráfico");
    setImpacto("Medio");
  };

  const guardar = () => {
    if (!titulo.trim() || !descripcion.trim()) return;
    setInsights([
      {
        id: uid(),
        fecha,
        categoria,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        impacto,
        accionRecomendada: accion.trim() || undefined,
      },
      ...insights,
    ]);
    resetFormulario();
  };

  const quitar = (id: string) => {
    if (!confirm("¿Eliminar este insight?")) return;
    setInsights(insights.filter((i) => i.id !== id));
  };

  const filtrados = insights.filter((i) => {
    if (filtroCategoria !== "Todas" && i.categoria !== filtroCategoria)
      return false;
    if (filtroImpacto !== "Todos" && i.impacto !== filtroImpacto) return false;
    return true;
  });

  const porImpacto = (imp: ImpactoInsight) =>
    insights.filter((i) => i.impacto === imp).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total de insights"
          value={insights.length}
          accent={insights.length > 0}
        />
        <StatCard label="Impacto alto" value={porImpacto("Alto")} />
        <StatCard label="Impacto medio" value={porImpacto("Medio")} />
        <StatCard label="Impacto bajo" value={porImpacto("Bajo")} />
      </div>

      {insights.length > 2 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-dim">Filtrar:</span>
          <select
            value={filtroCategoria}
            onChange={(e) =>
              setFiltroCategoria(e.target.value as FiltroCategoria)
            }
            className="rounded-md border border-line bg-panel2 px-2.5 py-1.5 text-xs text-snow transition-colors focus:border-turquesa focus:outline-none"
          >
            <option value="Todas">Todas las categorías</option>
            {CATEGORIAS_INSIGHT.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filtroImpacto}
            onChange={(e) => setFiltroImpacto(e.target.value as FiltroImpacto)}
            className="rounded-md border border-line bg-panel2 px-2.5 py-1.5 text-xs text-snow transition-colors focus:border-turquesa focus:outline-none"
          >
            <option value="Todos">Todos los impactos</option>
            {IMPACTOS_INSIGHT.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      )}

      {filtrados.length === 0 && !abierto ? (
        <EmptyHint>
          {insights.length === 0
            ? "Sin insights registrados. Documenta aquí los hallazgos clave y las acciones recomendadas para el cliente."
            : "Sin resultados para el filtro activo."}
        </EmptyHint>
      ) : (
        <div className="relative space-y-4 pl-5 before:absolute before:bottom-2 before:left-1.5 before:top-2 before:w-px before:bg-line">
          {filtrados.map((ins) => (
            <div key={ins.id} className="relative">
              <span className="absolute -left-5 top-3 h-2.5 w-2.5 rounded-full border-2 border-ink bg-panel2" />
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`font-mono text-[11px] uppercase tracking-wider ${CATEGORIA_INSIGHT_COLOR[ins.categoria]}`}
                      >
                        {ins.categoria}
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${IMPACTO_INSIGHT_CHIP[ins.impacto]}`}
                      >
                        {ins.impacto}
                      </span>
                      <span className="text-[10px] text-dim">{ins.fecha}</span>
                    </div>
                    <p className="text-sm font-medium text-snow">{ins.titulo}</p>
                    <p className="mt-1 text-xs leading-relaxed text-mut">
                      {ins.descripcion}
                    </p>
                    {ins.accionRecomendada && (
                      <div className="mt-2.5 rounded-md border border-turquesa/20 bg-turquesa/5 px-3 py-1.5 text-xs text-turquesa">
                        <span className="font-mono text-[9px] uppercase tracking-wider opacity-70">
                          Acción recomendada ·{" "}
                        </span>
                        {ins.accionRecomendada}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => quitar(ins.id)}
                    className="shrink-0 text-[11px] text-dim transition-colors hover:text-magenta"
                  >
                    ×
                  </button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {!abierto ? (
        <button
          onClick={() => setAbierto(true)}
          className="w-full rounded-md border border-dashed border-line2 px-4 py-3 text-center text-sm text-dim transition-colors hover:border-turquesa hover:text-turquesa"
        >
          + Registrar insight
        </button>
      ) : (
        <Card className="border-line2/60">
          <Label>Nuevo insight</Label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <div className="min-w-28 flex-1">
                <Label>Categoría</Label>
                <Select
                  value={categoria}
                  onChange={(v) => setCategoria(v as CategoriaInsight)}
                  options={CATEGORIAS_INSIGHT}
                  className="w-full"
                />
              </div>
              <div className="min-w-28 flex-1">
                <Label>Impacto</Label>
                <Select
                  value={impacto}
                  onChange={(v) => setImpacto(v as ImpactoInsight)}
                  options={IMPACTOS_INSIGHT}
                  className="w-full"
                />
              </div>
              <div className="min-w-36 flex-1">
                <Label>Fecha</Label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
            </div>
            <input
              autoFocus
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Hallazgo clave — ej: El tráfico orgánico creció 40 % con el nuevo blog"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción con datos concretos — qué pasó, cuánto, en qué período…"
              rows={3}
              className="w-full resize-none rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <textarea
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              placeholder="Acción recomendada · opcional — qué hacer con este hallazgo"
              rows={2}
              className="w-full resize-none rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
              <button
                onClick={resetFormulario}
                className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:text-snow"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={!titulo.trim() || !descripcion.trim()}
                className="rounded-md bg-turquesa px-4 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Guardar
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
