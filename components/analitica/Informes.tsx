"use client";

import { useState } from "react";
import {
  TIPOS_INFORME_ANALITICA,
  type InformeAnalitica,
  type TipoInformeAnalitica,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { Card, Label, Select, EmptyHint, StatCard } from "@/components/ui";

const hoy = () => new Date().toISOString().split("T")[0];

export default function Informes() {
  const [informes, setInformes] = usePersistentState<InformeAnalitica[]>(
    "analitica:informes",
    []
  );

  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoInformeAnalitica>("Mensual");
  const [periodo, setPeriodo] = useState("");
  const [fecha, setFecha] = useState(hoy());
  const [url, setUrl] = useState("");
  const [notas, setNotas] = useState("");

  const agregar = () => {
    if (!titulo.trim() || !periodo.trim()) return;
    const nuevo: InformeAnalitica = {
      id: uid(),
      titulo: titulo.trim(),
      tipo,
      periodo: periodo.trim(),
      fecha,
      url: url.trim() || undefined,
      notas: notas.trim() || undefined,
    };
    setInformes([nuevo, ...informes]);
    setTitulo("");
    setPeriodo("");
    setUrl("");
    setNotas("");
    setFecha(hoy());
    setAbierto(false);
  };

  const quitar = (id: string) => {
    if (!confirm("¿Eliminar este informe?")) return;
    setInformes(informes.filter((i) => i.id !== id));
  };

  const mensuales = informes.filter((i) => i.tipo === "Mensual").length;
  const trimestrales = informes.filter((i) => i.tipo === "Trimestral").length;
  const adhoc = informes.filter((i) => i.tipo === "Ad hoc").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total de informes"
          value={informes.length}
          accent={informes.length > 0}
        />
        <StatCard label="Mensuales" value={mensuales} />
        <StatCard label="Trimestrales" value={trimestrales} />
        <StatCard label="Ad hoc" value={adhoc} />
      </div>

      {informes.length === 0 && !abierto ? (
        <EmptyHint>
          Sin informes registrados. Agrega el primer reporte de analítica
          entregado al cliente.
        </EmptyHint>
      ) : (
        <div className="space-y-3">
          {informes.map((inf) => (
            <Card
              key={inf.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-snow">
                    {inf.titulo}
                  </span>
                  <span className="rounded border border-line2 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-mut">
                    {inf.tipo}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-dim">
                  <span>{inf.periodo}</span>
                  <span>·</span>
                  <span>{inf.fecha}</span>
                </div>
                {inf.notas && (
                  <p className="mt-1.5 text-xs leading-relaxed text-mut">
                    {inf.notas}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {inf.url && (
                  <a
                    href={inf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-line px-2.5 py-1.5 text-[11px] text-mut transition-colors hover:border-turquesa hover:text-turquesa"
                  >
                    Ver ↗
                  </a>
                )}
                <button
                  onClick={() => quitar(inf.id)}
                  className="rounded-md border border-line px-2 py-1.5 text-[11px] text-dim transition-colors hover:border-magenta/60 hover:text-magenta"
                >
                  ×
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!abierto ? (
        <button
          onClick={() => setAbierto(true)}
          className="w-full rounded-md border border-dashed border-line2 px-4 py-3 text-center text-sm text-dim transition-colors hover:border-turquesa hover:text-turquesa"
        >
          + Registrar informe
        </button>
      ) : (
        <Card className="border-line2/60">
          <Label>Nuevo informe</Label>
          <div className="space-y-3">
            <input
              autoFocus
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título — ej: Reporte de Analítica Web · Junio 2026"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              <div className="min-w-28 flex-1">
                <Label>Tipo</Label>
                <Select
                  value={tipo}
                  onChange={(v) => setTipo(v as TipoInformeAnalitica)}
                  options={TIPOS_INFORME_ANALITICA}
                  className="w-full"
                />
              </div>
              <div className="min-w-36 flex-1">
                <Label>Período</Label>
                <input
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  placeholder="Junio 2026 / Q2 2026"
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
              <div className="min-w-36 flex-1">
                <Label>Fecha de entrega</Label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
            </div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Link al informe · opcional (Drive, Looker, Slides…)"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas · opcional"
              rows={2}
              className="w-full resize-none rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
              <button
                onClick={() => setAbierto(false)}
                className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:text-snow"
              >
                Cancelar
              </button>
              <button
                onClick={agregar}
                disabled={!titulo.trim() || !periodo.trim()}
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
