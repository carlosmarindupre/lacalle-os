"use client";

import { ReactNode } from "react";
import { COMPANIA_INICIAL, type Compania } from "@/lib/data";
import { usePersistentState } from "@/lib/store";
import {
  PageHeader,
  Card,
  Label,
  TextInput,
  Area,
  ListEditor,
} from "@/components/ui";

const SECCIONES = [
  { id: "resumen", num: "01", titulo: "Resumen Ejecutivo" },
  { id: "contexto", num: "02", titulo: "Historia y Contexto del Mercado" },
  { id: "mercado", num: "03", titulo: "Análisis de Mercado" },
  { id: "clientes", num: "04", titulo: "Clientes y Segmentación" },
  { id: "foda", num: "05", titulo: "Análisis de Marca (FODA)" },
  { id: "posicionamiento", num: "06", titulo: "Posicionamiento y Ventaja" },
  { id: "comercial", num: "07", titulo: "Análisis Comercial y Marketing" },
  { id: "funnel", num: "08", titulo: "Funnel y Conversión" },
  { id: "factores", num: "09", titulo: "Factores Críticos de Compra" },
  { id: "problema", num: "10", titulo: "Problema Estratégico" },
  { id: "definicion", num: "11", titulo: "Definición Estratégica" },
  { id: "plan", num: "12", titulo: "Plan de Acción" },
  { id: "kpis", num: "13", titulo: "Métricas y KPIs" },
];

function Section({
  id,
  num,
  titulo,
  desc,
  children,
  accent = false,
}: {
  id: string;
  num: string;
  titulo: string;
  desc?: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="mb-3 flex items-baseline gap-3">
        <span
          className={`font-mono text-[11px] tracking-[0.2em] ${
            accent ? "text-magenta" : "text-turquesa"
          }`}
        >
          {num}
        </span>
        <h2 className="text-lg font-semibold tracking-tight">{titulo}</h2>
      </div>
      {desc && <p className="mb-3 text-xs text-dim">{desc}</p>}
      <Card className={accent ? "border-magenta/40" : ""}>{children}</Card>
    </section>
  );
}

function Grid2({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}

export default function CompaniaPage() {
  const [c, setC] = usePersistentState<Compania>("compania", COMPANIA_INICIAL);
  const set = <K extends keyof Compania>(key: K, value: Compania[K]) =>
    setC((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHeader
        kicker="Levantamiento"
        title="Compañía"
        desc="Diagnóstico y análisis estratégico de marca. Este documento es la base de contexto que alimenta todos los módulos de servicio."
      />

      {/* Identidad */}
      <Card className="mb-10">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label>Nombre de la compañía</Label>
            <TextInput
              value={c.nombre}
              onChange={(v) => set("nombre", v)}
              placeholder="Ej: Empresa SpA"
            />
          </div>
          <div>
            <Label>Industria / Categoría</Label>
            <TextInput
              value={c.industria}
              onChange={(v) => set("industria", v)}
              placeholder="Ej: Retail deportivo"
            />
          </div>
          <div>
            <Label>Sitio web</Label>
            <TextInput
              value={c.web}
              onChange={(v) => set("web", v)}
              placeholder="https://"
            />
          </div>
          <div>
            <Label>Contacto principal</Label>
            <TextInput
              value={c.contacto}
              onChange={(v) => set("contacto", v)}
              placeholder="Nombre · cargo · email"
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
        {/* Índice */}
        <nav className="top-8 hidden self-start lg:sticky lg:block">
          <Label>Índice</Label>
          <ul className="space-y-0.5 border-l border-line">
            {SECCIONES.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block px-3 py-1 text-[11px] leading-snug text-dim transition-colors hover:text-turquesa"
                >
                  <span className="font-mono">{s.num}</span> · {s.titulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contenido */}
        <div className="min-w-0 space-y-12">
          <Section
            id="resumen"
            num="01"
            titulo="Resumen Ejecutivo"
            desc="Situación actual en el mercado, posicionamiento competitivo y principales oportunidades de crecimiento."
          >
            <Area
              value={c.resumen}
              onChange={(v) => set("resumen", v)}
              rows={5}
              placeholder="Diagnóstico integral de la marca: contexto de mercado, competencia, cliente actual y potencial, desempeño comunicacional, estrategia comercial…"
            />
          </Section>

          <Section id="contexto" num="02" titulo="Historia y Contexto del Mercado">
            <div className="space-y-5">
              <div>
                <Label>2.1 — Evolución del mercado</Label>
                <Area
                  value={c.evolucion}
                  onChange={(v) => set("evolucion", v)}
                  placeholder="Desarrollo histórico del mercado, hitos relevantes, cambios estructurales, evolución de la categoría…"
                />
              </div>
              <div>
                <Label>2.2 — Situación reciente</Label>
                <Area
                  value={c.situacion}
                  onChange={(v) => set("situacion", v)}
                  placeholder="Cambios en comportamiento del consumidor, nuevos competidores, transformación digital, presión en precios…"
                />
              </div>
              <div>
                <Label>2.3 — Tendencias actuales</Label>
                <Area
                  value={c.tendencias}
                  onChange={(v) => set("tendencias", v)}
                  placeholder="Digitalización del proceso de compra, automatización, experiencia de usuario como diferenciador, integración de servicios…"
                />
              </div>
            </div>
          </Section>

          <Section id="mercado" num="03" titulo="Análisis de Mercado">
            <div className="space-y-5">
              <Grid2>
                <div>
                  <Label>3.1 — Estructura del mercado</Label>
                  <Area
                    value={c.estructura}
                    onChange={(v) => set("estructura", v)}
                    placeholder="Principales actores, tamaño del mercado, nivel de concentración…"
                  />
                </div>
                <div>
                  <Label>3.2 — Participación (Market Share)</Label>
                  <Area
                    value={c.share}
                    onChange={(v) => set("share", v)}
                    placeholder="Posición relativa de la marca, comparación con líderes, evolución reciente…"
                  />
                </div>
              </Grid2>
              <div>
                <Label>3.3 — Competencia</Label>
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <div className="mb-2 text-xs text-snow">Directa primaria</div>
                    <ListEditor
                      items={c.compDirecta}
                      onChange={(v) => set("compDirecta", v)}
                      placeholder="Competidor directo…"
                      accent="magenta"
                    />
                  </div>
                  <div>
                    <div className="mb-2 text-xs text-snow">Secundaria</div>
                    <ListEditor
                      items={c.compSecundaria}
                      onChange={(v) => set("compSecundaria", v)}
                      placeholder="Alternativa o sustituto…"
                      accent="gris"
                    />
                  </div>
                  <div>
                    <div className="mb-2 text-xs text-snow">Indirecta</div>
                    <ListEditor
                      items={c.compIndirecta}
                      onChange={(v) => set("compIndirecta", v)}
                      placeholder="Solución distinta, misma necesidad…"
                      accent="gris"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section id="clientes" num="04" titulo="Clientes y Segmentación">
            <div className="space-y-5">
              <div>
                <Label>4.1 — Perfil del consumidor actual</Label>
                <Grid2>
                  <TextInput
                    value={c.perfilDemo}
                    onChange={(v) => set("perfilDemo", v)}
                    placeholder="Demográfico"
                  />
                  <TextInput
                    value={c.perfilGeo}
                    onChange={(v) => set("perfilGeo", v)}
                    placeholder="Geográfico"
                  />
                  <TextInput
                    value={c.perfilPsico}
                    onChange={(v) => set("perfilPsico", v)}
                    placeholder="Psicográfico"
                  />
                  <TextInput
                    value={c.perfilConduct}
                    onChange={(v) => set("perfilConduct", v)}
                    placeholder="Conductual"
                  />
                </Grid2>
              </div>
              <Grid2>
                <div>
                  <Label>4.2 — Tipologías de clientes</Label>
                  <Area
                    value={c.tipologias}
                    onChange={(v) => set("tipologias", v)}
                    placeholder="Actuales (fuertes, débiles, fieles, infieles), potenciales, latentes…"
                  />
                </div>
                <div>
                  <Label>4.3 — Segmentos priorizados</Label>
                  <ListEditor
                    items={c.segmentos}
                    onChange={(v) => set("segmentos", v)}
                    placeholder="Segmento con potencial de crecimiento…"
                  />
                </div>
              </Grid2>
            </div>
          </Section>

          <Section
            id="foda"
            num="05"
            titulo="Análisis de Marca (FODA)"
            desc="Interno: fortalezas y debilidades. Externo: oportunidades y amenazas."
          >
            <Grid2>
              <div className="rounded-md border border-turquesa/30 bg-panel2 p-4">
                <div className="mb-3 text-xs font-medium uppercase tracking-wider text-turquesa">
                  Fortalezas
                </div>
                <ListEditor
                  items={c.fortalezas}
                  onChange={(v) => set("fortalezas", v)}
                  placeholder="Propuesta de valor, capacidades, marca…"
                />
              </div>
              <div className="rounded-md border border-magenta/30 bg-panel2 p-4">
                <div className="mb-3 text-xs font-medium uppercase tracking-wider text-magenta">
                  Debilidades
                </div>
                <ListEditor
                  items={c.debilidades}
                  onChange={(v) => set("debilidades", v)}
                  placeholder="Brechas internas…"
                  accent="magenta"
                />
              </div>
              <div className="rounded-md border border-turquesa/30 bg-panel2 p-4">
                <div className="mb-3 text-xs font-medium uppercase tracking-wider text-turquesa">
                  Oportunidades
                </div>
                <ListEditor
                  items={c.oportunidades}
                  onChange={(v) => set("oportunidades", v)}
                  placeholder="Tendencias de mercado, cambios culturales…"
                />
              </div>
              <div className="rounded-md border border-magenta/30 bg-panel2 p-4">
                <div className="mb-3 text-xs font-medium uppercase tracking-wider text-magenta">
                  Amenazas
                </div>
                <ListEditor
                  items={c.amenazas}
                  onChange={(v) => set("amenazas", v)}
                  placeholder="Competencia, contexto externo…"
                  accent="magenta"
                />
              </div>
            </Grid2>
          </Section>

          <Section id="posicionamiento" num="06" titulo="Posicionamiento y Ventaja Competitiva">
            <div className="space-y-5">
              <div>
                <Label>6.1 — Propuesta de valor actual</Label>
                <Area
                  value={c.propuestaValor}
                  onChange={(v) => set("propuestaValor", v)}
                  rows={3}
                  placeholder="Qué promete la marca hoy…"
                />
              </div>
              <div>
                <Label>6.2 — Diferenciación real vs. percibida</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <TextInput
                    value={c.difReal}
                    onChange={(v) => set("difReal", v)}
                    placeholder="Objetiva"
                  />
                  <TextInput
                    value={c.difComunicada}
                    onChange={(v) => set("difComunicada", v)}
                    placeholder="Comunicada"
                  />
                  <TextInput
                    value={c.difPercibida}
                    onChange={(v) => set("difPercibida", v)}
                    placeholder="Percibida"
                  />
                </div>
              </div>
              <div>
                <Label>6.3 — Ventaja competitiva</Label>
                <Area
                  value={c.ventaja}
                  onChange={(v) => set("ventaja", v)}
                  rows={3}
                  placeholder="La ventaja defendible de la marca…"
                />
              </div>
            </div>
          </Section>

          <Section id="comercial" num="07" titulo="Análisis Comercial y de Marketing">
            <div className="space-y-5">
              <Grid2>
                <div>
                  <Label>7.1 — Estrategia de marketing actual</Label>
                  <Area
                    value={c.mktEstrategia}
                    onChange={(v) => set("mktEstrategia", v)}
                    placeholder="Canales utilizados, mensajes, enfoque (performance vs. branding)…"
                  />
                </div>
                <div>
                  <Label>7.2 — Acciones realizadas</Label>
                  <Area
                    value={c.mktAcciones}
                    onChange={(v) => set("mktAcciones", v)}
                    placeholder="Campañas digitales, SEO, mailing, gestión de redes…"
                  />
                </div>
              </Grid2>
              <div>
                <Label>7.3 — Plataformas de comunicación</Label>
                <Area
                  value={c.mktPlataformas}
                  onChange={(v) => set("mktPlataformas", v)}
                  rows={3}
                  placeholder="Digital (RRSS, web, ads), offline, canales propios vs. pagados…"
                />
              </div>
              <div>
                <Label>7.4 — Campañas exitosas y no exitosas</Label>
                <Grid2>
                  <Area
                    value={c.campExito}
                    onChange={(v) => set("campExito", v)}
                    rows={3}
                    placeholder="Qué funcionó y por qué…"
                  />
                  <Area
                    value={c.campFracaso}
                    onChange={(v) => set("campFracaso", v)}
                    rows={3}
                    placeholder="Qué no funcionó y por qué…"
                  />
                </Grid2>
              </div>
            </div>
          </Section>

          <Section
            id="funnel"
            num="08"
            titulo="Análisis de Funnel y Conversión"
            desc="El problema no siempre está en atraer tráfico, sino en conversión, proceso comercial y cierre."
          >
            <div className="mb-5 grid grid-cols-5 gap-2">
              {c.funnel.map((f, i) => (
                <div
                  key={f.etapa}
                  className="rounded-md border border-line bg-panel2 p-3 text-center"
                >
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-dim">
                    {f.etapa}
                  </div>
                  <input
                    value={f.valor}
                    onChange={(e) => {
                      const funnel = [...c.funnel];
                      funnel[i] = { ...f, valor: e.target.value };
                      set("funnel", funnel);
                    }}
                    placeholder="—"
                    className="w-full bg-transparent text-center font-mono text-sm text-turquesa placeholder:text-dim"
                  />
                </div>
              ))}
            </div>
            <Label>Insight clave</Label>
            <Area
              value={c.funnelInsight}
              onChange={(v) => set("funnelInsight", v)}
              rows={3}
              placeholder="Dónde se pierde la conversión y por qué…"
            />
          </Section>

          <Section
            id="factores"
            num="09"
            titulo="Factores Críticos de Compra"
            desc="Drivers ordenados del más relevante al menos relevante según el cliente. Usa las flechas para reordenar."
          >
            <ul className="space-y-1.5">
              {c.factores.map((f, i) => (
                <li
                  key={f}
                  className="flex items-center gap-3 rounded-md border border-line bg-panel2 px-3 py-2"
                >
                  <span className="w-6 font-mono text-xs text-turquesa">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-sm">{f}</span>
                  <button
                    disabled={i === 0}
                    onClick={() => {
                      const fs = [...c.factores];
                      [fs[i - 1], fs[i]] = [fs[i], fs[i - 1]];
                      set("factores", fs);
                    }}
                    className="px-1 text-mut transition-colors hover:text-turquesa disabled:opacity-20"
                  >
                    ↑
                  </button>
                  <button
                    disabled={i === c.factores.length - 1}
                    onClick={() => {
                      const fs = [...c.factores];
                      [fs[i + 1], fs[i]] = [fs[i], fs[i + 1]];
                      set("factores", fs);
                    }}
                    className="px-1 text-mut transition-colors hover:text-turquesa disabled:opacity-20"
                  >
                    ↓
                  </button>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            id="problema"
            num="10"
            titulo="Problema Estratégico"
            desc="La formulación central del diagnóstico: la brecha que la estrategia debe resolver."
            accent
          >
            <Area
              value={c.problema}
              onChange={(v) => set("problema", v)}
              rows={4}
              placeholder='Ej: "La marca no logra diferenciarse claramente en la mente del consumidor, lo que genera baja preferencia y alta sensibilidad al precio."'
            />
          </Section>

          <Section id="definicion" num="11" titulo="Definición Estratégica">
            <div className="space-y-5">
              <div>
                <Label>11.1 — Estrategia de marca</Label>
                <Area
                  value={c.estMarca}
                  onChange={(v) => set("estMarca", v)}
                  rows={3}
                  placeholder="Posicionamiento deseado, territorio comunicacional, promesa…"
                />
              </div>
              <div>
                <Label>11.2 — Estrategia hacia el mercado objetivo</Label>
                <Area
                  value={c.estMercado}
                  onChange={(v) => set("estMercado", v)}
                  rows={3}
                  placeholder="Segmentos a priorizar, enfoque de captación vs. fidelización…"
                />
              </div>
              <div>
                <Label>11.3 — Estrategia comercial</Label>
                <Area
                  value={c.estComercial}
                  onChange={(v) => set("estComercial", v)}
                  rows={3}
                  placeholder="Optimización del funnel, mejora en conversión, integración marketing + ventas…"
                />
              </div>
            </div>
          </Section>

          <Section
            id="plan"
            num="12"
            titulo="Plan de Acción"
            desc="Frentes de trabajo derivados del diagnóstico. Marca los que están en ejecución."
          >
            <ul className="space-y-1.5">
              {c.plan.map((p, i) => (
                <li
                  key={p.texto}
                  className="flex items-center gap-3 rounded-md border border-line bg-panel2 px-3 py-2"
                >
                  <button
                    onClick={() => {
                      const plan = [...c.plan];
                      plan[i] = { ...p, done: !p.done };
                      set("plan", plan);
                    }}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border text-[10px] transition-colors ${
                      p.done
                        ? "border-turquesa bg-turquesa text-ink"
                        : "border-line2 text-transparent hover:border-turquesa"
                    }`}
                  >
                    ✓
                  </button>
                  <span
                    className={`flex-1 text-sm ${p.done ? "text-mut line-through" : ""}`}
                  >
                    {p.texto}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            id="kpis"
            num="13"
            titulo="Métricas y KPIs"
            desc="Indicadores que medirán el éxito de la estrategia."
          >
            <ListEditor
              items={c.kpis}
              onChange={(v) => set("kpis", v)}
              placeholder="Agregar KPI…"
            />
          </Section>
        </div>
      </div>
    </>
  );
}
