"use client";

import {
  METRICA_VACIA,
  PLATAFORMAS_INICIAL,
  type MetricaPlataforma,
  type PlataformaAds,
} from "@/lib/data";
import { usePersistentState } from "@/lib/store";
import { Card, Label, TextInput, EmptyHint, StatCard } from "@/components/ui";

type MetricasData = {
  periodo: string;
  porPlataforma: Record<string, MetricaPlataforma>;
};

const num = (v?: string) => {
  const n = Number((v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const fmtMoney = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");

const CAMPOS: { key: keyof MetricaPlataforma; label: string }[] = [
  { key: "inversion", label: "Inversión" },
  { key: "impresiones", label: "Impresiones" },
  { key: "clics", label: "Clics" },
  { key: "conversiones", label: "Conversiones" },
  { key: "ingresos", label: "Ingresos atribuidos" },
];

// Métricas derivadas según los datos cargados
function derivadas(m: MetricaPlataforma) {
  const inv = num(m.inversion);
  const imp = num(m.impresiones);
  const cl = num(m.clics);
  const conv = num(m.conversiones);
  const ing = num(m.ingresos);
  return {
    ctr: imp > 0 ? ((cl / imp) * 100).toFixed(2) + "%" : "—",
    cpc: cl > 0 ? fmtMoney(inv / cl) : "—",
    cpa: conv > 0 ? fmtMoney(inv / conv) : "—",
    roas: inv > 0 && ing > 0 ? (ing / inv).toFixed(2) + "x" : "—",
  };
}

export default function Metricas() {
  const [metricas, setMetricas] = usePersistentState<MetricasData>(
    "paid:metricas",
    { periodo: "", porPlataforma: {} }
  );
  const [plataformas] = usePersistentState<PlataformaAds[]>(
    "paid:plataformas",
    PLATAFORMAS_INICIAL
  );

  const activas = plataformas.filter((p) => p.activa);

  const setCampo = (
    plataforma: string,
    key: keyof MetricaPlataforma,
    value: string
  ) =>
    setMetricas({
      ...metricas,
      porPlataforma: {
        ...metricas.porPlataforma,
        [plataforma]: {
          ...(metricas.porPlataforma[plataforma] ?? METRICA_VACIA),
          [key]: value,
        },
      },
    });

  // Totales del período
  const datos = activas.map(
    (p) => metricas.porPlataforma[p.nombre] ?? METRICA_VACIA
  );
  const invTotal = datos.reduce((a, m) => a + num(m.inversion), 0);
  const convTotal = datos.reduce((a, m) => a + num(m.conversiones), 0);
  const ingTotal = datos.reduce((a, m) => a + num(m.ingresos), 0);
  const roasGlobal =
    invTotal > 0 && ingTotal > 0 ? (ingTotal / invTotal).toFixed(2) + "x" : "—";
  const cpaGlobal = convTotal > 0 ? fmtMoney(invTotal / convTotal) : "—";

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex items-end justify-between">
          <Label>Resumen del período</Label>
          <div className="w-44">
            <TextInput
              value={metricas.periodo}
              onChange={(v) => setMetricas({ ...metricas, periodo: v })}
              placeholder="Período · Ej: Junio 2026"
              className="text-center font-mono text-xs"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Inversión total" value={fmtMoney(invTotal)} />
          <StatCard label="Conversiones" value={convTotal} accent />
          <StatCard label="CPA global" value={cpaGlobal} />
          <StatCard label="ROAS global" value={roasGlobal} accent />
        </div>
      </div>

      {activas.length === 0 ? (
        <EmptyHint>
          No hay plataformas activas. Actívalas en la pestaña{" "}
          <span className="text-turquesa">Estrategia</span> para registrar sus
          métricas.
        </EmptyHint>
      ) : (
        <div>
          <Label>Métricas por plataforma</Label>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activas.map((p) => {
              const m = metricas.porPlataforma[p.nombre] ?? METRICA_VACIA;
              const d = derivadas(m);
              return (
                <Card key={p.nombre}>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium">{p.nombre}</span>
                    <span className="font-mono text-[10px] text-dim">
                      {p.cuenta || "—"}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {CAMPOS.map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-xs text-mut">{label}</span>
                        <input
                          value={m[key]}
                          onChange={(e) =>
                            setCampo(p.nombre, key, e.target.value)
                          }
                          placeholder="—"
                          className="w-28 rounded-md border border-line bg-panel2 px-2 py-1.5 text-right font-mono text-xs text-snow placeholder:text-dim transition-colors focus:border-turquesa"
                        />
                      </div>
                    ))}
                  </div>
                  {/* Derivadas */}
                  <div className="mt-4 grid grid-cols-4 gap-1 border-t border-line pt-3 text-center">
                    {[
                      ["CTR", d.ctr],
                      ["CPC", d.cpc],
                      ["CPA", d.cpa],
                      ["ROAS", d.roas],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="text-[9px] uppercase tracking-wider text-dim">
                          {k}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-turquesa">
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-dim">
            CTR, CPC, CPA y ROAS se calculan automáticamente. Registro manual
            por ahora — en Fase 5 estos datos llegan desde las APIs de Meta y
            Google Ads.
          </p>
        </div>
      )}
    </div>
  );
}
