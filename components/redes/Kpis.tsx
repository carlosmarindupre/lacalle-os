"use client";

import {
  REDES_INICIAL,
  type Contenido,
  type RedConfig,
} from "@/lib/data";
import { usePersistentState } from "@/lib/store";
import { Card, Label, TextInput, StatCard, EmptyHint } from "@/components/ui";

type KpiRed = {
  seguidores: string;
  alcance: string;
  engagement: string;
  clics: string;
};

type KpisData = {
  periodo: string;
  porRed: Record<string, KpiRed>;
};

const KPI_VACIO: KpiRed = { seguidores: "", alcance: "", engagement: "", clics: "" };

const CAMPOS: { key: keyof KpiRed; label: string }[] = [
  { key: "seguidores", label: "Seguidores" },
  { key: "alcance", label: "Alcance mensual" },
  { key: "engagement", label: "Engagement %" },
  { key: "clics", label: "Clics / Tráfico" },
];

export default function Kpis() {
  const [kpis, setKpis] = usePersistentState<KpisData>("redes:kpis", {
    periodo: "",
    porRed: {},
  });
  const [redes] = usePersistentState<RedConfig[]>("redes:redes", REDES_INICIAL);
  const [contenidos] = usePersistentState<Contenido[]>("redes:contenidos", []);

  const activas = redes.filter((r) => r.activa);
  const publicados = contenidos.filter((c) => c.estado === "Publicado").length;
  const aprobados = contenidos.filter((c) => c.estado === "Aprobado").length;
  const rechazados = contenidos.filter((c) => c.estado === "Rechazado").length;

  const setCampo = (red: string, key: keyof KpiRed, value: string) =>
    setKpis({
      ...kpis,
      porRed: {
        ...kpis.porRed,
        [red]: { ...(kpis.porRed[red] ?? KPI_VACIO), [key]: value },
      },
    });

  return (
    <div className="space-y-8">
      {/* Producción interna (automático) */}
      <div>
        <Label>Producción de contenidos · automático desde el ToDo</Label>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total en pipeline" value={contenidos.length} />
          <StatCard label="Aprobados" value={aprobados} accent />
          <StatCard label="Publicados" value={publicados} accent />
          <StatCard
            label="Rechazados"
            value={rechazados}
            sub={rechazados > 0 ? "Revisar feedback del cliente" : undefined}
          />
        </div>
      </div>

      {/* KPIs por red (manual, luego integraciones) */}
      <div>
        <div className="mb-3 flex items-end justify-between">
          <Label>KPIs por red · registro del período</Label>
          <div className="w-44">
            <TextInput
              value={kpis.periodo}
              onChange={(v) => setKpis({ ...kpis, periodo: v })}
              placeholder="Período · Ej: Junio 2026"
              className="text-center font-mono text-xs"
            />
          </div>
        </div>

        {activas.length === 0 ? (
          <EmptyHint>
            No hay redes activas. Actívalas en la pestaña{" "}
            <span className="text-turquesa">Redes</span> para registrar sus KPIs.
          </EmptyHint>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activas.map((r) => {
              const datos = kpis.porRed[r.red] ?? KPI_VACIO;
              return (
                <Card key={r.red}>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium">{r.red}</span>
                    <span className="font-mono text-[10px] text-dim">
                      {r.handle || "—"}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {CAMPOS.map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-xs text-mut">{label}</span>
                        <input
                          value={datos[key]}
                          onChange={(e) => setCampo(r.red, key, e.target.value)}
                          placeholder="—"
                          className="w-28 rounded-md border border-line bg-panel2 px-2 py-1.5 text-right font-mono text-xs text-turquesa placeholder:text-dim transition-colors focus:border-turquesa"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        <p className="mt-4 text-xs text-dim">
          Registro manual por ahora — en Fase 5 estos datos se alimentan
          automáticamente desde las APIs de Meta, TikTok y LinkedIn.
        </p>
      </div>
    </div>
  );
}
