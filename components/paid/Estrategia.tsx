"use client";

import {
  COMPANIA_INICIAL,
  ESTRATEGIA_PAID_INICIAL,
  PLATAFORMAS_INICIAL,
  type Compania,
  type EstrategiaPaid,
  type PlataformaAds,
} from "@/lib/data";
import { usePersistentState } from "@/lib/store";
import {
  Card,
  Label,
  Area,
  TextInput,
  ListEditor,
  Toggle,
  FilaContexto,
} from "@/components/ui";

export default function Estrategia() {
  const [e, setE] = usePersistentState<EstrategiaPaid>(
    "paid:estrategia",
    ESTRATEGIA_PAID_INICIAL
  );
  const [plataformas, setPlataformas] = usePersistentState<PlataformaAds[]>(
    "paid:plataformas",
    PLATAFORMAS_INICIAL
  );
  const [comp] = usePersistentState<Compania>("compania", COMPANIA_INICIAL);

  const updatePlataforma = (i: number, patch: Partial<PlataformaAds>) => {
    const next = [...plataformas];
    next[i] = { ...next[i], ...patch };
    setPlataformas(next);
  };

  const activas = plataformas.filter((p) => p.activa).length;

  return (
    <div className="space-y-6">
      {/* Contexto conectado desde Compañía */}
      <Card className="border-turquesa/30">
        <div className="mb-3 flex items-center justify-between">
          <Label>Contexto conectado · automático</Label>
          <span className="font-mono text-[9px] uppercase tracking-wider text-turquesa">
            Compañía
          </span>
        </div>
        <div className="grid gap-x-8 md:grid-cols-2">
          <div>
            <FilaContexto
              label="Propuesta de valor"
              valor={comp.propuestaValor}
              href="/compania#posicionamiento"
            />
            <FilaContexto
              label="Segmentos"
              valor={comp.segmentos.join(", ")}
              href="/compania#clientes"
            />
          </div>
          <div>
            <FilaContexto
              label="Funnel · insight"
              valor={comp.funnelInsight}
              href="/compania#funnel"
            />
            <FilaContexto
              label="Factor crítico nº1"
              valor={comp.factores[0] ?? ""}
              href="/compania#factores"
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <Label>Estrategia de inversión</Label>
          <Area
            value={e.descripcion}
            onChange={(v) => setE({ ...e, descripcion: v })}
            rows={4}
            placeholder="Cómo se distribuye la inversión: mix performance vs. branding, embudo, audiencias prioritarias, temporalidad…"
          />
        </Card>
        <Card>
          <Label>Presupuesto mensual</Label>
          <TextInput
            value={e.presupuestoMensual}
            onChange={(v) => setE({ ...e, presupuestoMensual: v })}
            placeholder="Ej: $2.500.000"
            className="font-mono"
          />
          <p className="mt-3 text-xs text-dim">
            Techo de inversión acordado con el cliente. Las campañas activas se
            controlan contra este monto.
          </p>
        </Card>
      </div>

      <Card>
        <Label>Objetivos de paid media</Label>
        <ListEditor
          items={e.objetivos}
          onChange={(v) => setE({ ...e, objetivos: v })}
          placeholder="Ej: CPA bajo $8.000 en campañas de leads…"
        />
      </Card>

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <Label>Plataformas</Label>
          <span className="text-xs text-dim">
            <span className="text-turquesa">{activas}</span> de{" "}
            {plataformas.length} activas
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plataformas.map((p, i) => (
            <Card
              key={p.nombre}
              className={`transition-colors ${
                p.activa ? "border-turquesa/40" : "opacity-70"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium">{p.nombre}</span>
                <Toggle
                  checked={p.activa}
                  onChange={(v) => updatePlataforma(i, { activa: v })}
                />
              </div>
              <Label>Cuenta / ID</Label>
              <TextInput
                value={p.cuenta}
                onChange={(v) => updatePlataforma(i, { cuenta: v })}
                placeholder="ID de cuenta publicitaria"
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
