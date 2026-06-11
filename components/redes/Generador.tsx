"use client";

import {
  BRAND_KIT_INICIAL,
  COMPANIA_INICIAL,
  REDES_INICIAL,
  REDES_ESTRATEGIA_INICIAL,
  FORMATOS,
  OBJETIVO_STYLE,
  OBJETIVOS_CONTENIDO,
  type BrandKit as BrandKitT,
  type Compania,
  type Contenido,
  type ObjetivoContenido,
  type RedConfig,
  type RedesEstrategia,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import {
  Card,
  Label,
  Area,
  ListEditor,
  Select,
  EmptyHint,
  FilaContexto,
} from "@/components/ui";
import BrandKitPanel from "@/components/diseno/BrandKitPanel";

type GeneradorConfig = {
  contexto: string;
  audiencia: string;
  verticales: string[];
};

const INICIAL: GeneradorConfig = { contexto: "", audiencia: "", verticales: [] };

// Plantillas según la metodología expert-content-planning: cada idea tiene un
// objetivo en el viaje del seguidor. En fase posterior, este motor se conecta
// a la API de Claude usando el prompt completo de la skill con estos inputs.
const PLANTILLAS: Record<ObjetivoContenido, ((v: string) => string)[]> = {
  Atraer: [
    (v) => `Dato clave sobre ${v} que tu audiencia no conoce`,
    (v) => `Mito vs. realidad: ${v}`,
    (v) => `Pregunta a la comunidad sobre ${v}`,
  ],
  Nutrir: [
    (v) => `Tip práctico: ${v}`,
    (v) => `Detrás de escena — cómo trabajamos ${v}`,
    (v) => `Guía rápida: ${v} paso a paso`,
  ],
  Convertir: [
    (v) => `Caso real: resultados en ${v}`,
    (v) => `Antes / después: ${v}`,
    (v) => `Cómo abordamos ${v} con nuestros clientes`,
  ],
};

export default function Generador() {
  const [config, setConfig] = usePersistentState<GeneradorConfig>(
    "redes:generador",
    INICIAL
  );
  // Tablero de pre-aprobación: las ideas viven aquí hasta ser aprobadas
  const [ideas, setIdeas] = usePersistentState<Contenido[]>("redes:ideas", []);
  const [contenidos, setContenidos] = usePersistentState<Contenido[]>(
    "redes:contenidos",
    []
  );
  const [redes] = usePersistentState<RedConfig[]>("redes:redes", REDES_INICIAL);
  const [comp] = usePersistentState<Compania>("compania", COMPANIA_INICIAL);
  const [estr] = usePersistentState<RedesEstrategia>(
    "redes:estrategia",
    REDES_ESTRATEGIA_INICIAL
  );
  const [kit] = usePersistentState<BrandKitT>(
    "diseno:brandkit",
    BRAND_KIT_INICIAL
  );

  const redesActivas = redes.filter((r) => r.activa).map((r) => r.red);
  const opcionesRed = redesActivas.length > 0 ? redesActivas : ["Instagram"];
  const listo = config.verticales.length > 0;

  // Pilares de Estrategia aún no importados como verticales
  const pilaresNuevos = estr.pilares.filter(
    (p) => !config.verticales.includes(p)
  );

  // Audiencia efectiva: manual, o derivada de los segmentos de Compañía
  const audienciaEfectiva =
    config.audiencia.trim() ||
    (comp.segmentos.length > 0 ? comp.segmentos.join(", ") : "");

  const balance = OBJETIVOS_CONTENIDO.map((o) => ({
    objetivo: o,
    n: contenidos.filter((c) => c.objetivo === o).length,
  }));

  const generar = () => {
    const nuevas: Contenido[] = [];
    config.verticales.forEach((vertical, vi) => {
      // 3 ideas por vertical: una por objetivo, para mantener el balance
      // atracción / nutrición / conversión de la metodología.
      OBJETIVOS_CONTENIDO.forEach((objetivo, oi) => {
        const opciones = PLANTILLAS[objetivo];
        const plantilla = opciones[(vi + oi) % opciones.length];
        nuevas.push({
          id: uid(),
          titulo: plantilla(vertical),
          copy: [
            audienciaEfectiva && `Audiencia: ${audienciaEfectiva}.`,
            comp.propuestaValor && `Ángulo: ${comp.propuestaValor.slice(0, 120)}`,
            estr.tono && `Tono: ${estr.tono.slice(0, 80)}`,
            kit.lineaGrafica.trim() &&
              `Identidad visual: ${kit.lineaGrafica.slice(0, 90)}`,
          ]
            .filter(Boolean)
            .join(" ") || undefined,
          red: opcionesRed[(vi + oi) % opcionesRed.length],
          vertical,
          estado: "No iniciado",
          objetivo,
          formato: FORMATOS[(vi + oi) % FORMATOS.length],
        });
      });
    });
    setIdeas([...ideas, ...nuevas]);
  };

  const editarIdea = (id: string, patch: Partial<Contenido>) =>
    setIdeas(ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const aprobar = (id: string) => {
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return;
    setContenidos([...contenidos, { ...idea, estado: "No iniciado" }]);
    setIdeas(ideas.filter((i) => i.id !== id));
  };

  const aprobarTodas = () => {
    if (ideas.length === 0) return;
    setContenidos([
      ...contenidos,
      ...ideas.map((i) => ({ ...i, estado: "No iniciado" as const })),
    ]);
    setIdeas([]);
  };

  const descartar = (id: string) => setIdeas(ideas.filter((i) => i.id !== id));
  const descartarTodas = () => setIdeas([]);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Contexto conectado desde Compañía y Estrategia */}
          <Card className="border-turquesa/30">
            <div className="mb-3 flex items-center justify-between">
              <Label>Contexto conectado · automático</Label>
              <span className="font-mono text-[9px] uppercase tracking-wider text-turquesa">
                Compañía + Estrategia
              </span>
            </div>
            <div className="grid gap-x-8 md:grid-cols-2">
              <div>
                <FilaContexto
                  label="Compañía"
                  valor={[comp.nombre, comp.industria]
                    .filter(Boolean)
                    .join(" · ")}
                  href="/compania"
                />
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
                <FilaContexto
                  label="Problema estratégico"
                  valor={comp.problema}
                  href="/compania#problema"
                />
              </div>
              <div>
                <FilaContexto
                  label="Objetivos RRSS"
                  valor={estr.objetivos.join(" · ")}
                  href="/servicios/redes-sociales"
                />
                <FilaContexto
                  label="Pilares"
                  valor={estr.pilares.join(" · ")}
                  href="/servicios/redes-sociales"
                />
                <FilaContexto
                  label="Tono"
                  valor={estr.tono}
                  href="/servicios/redes-sociales"
                />
              </div>
            </div>
          </Card>

          <BrandKitPanel nota="La línea gráfica viaja en el mini-brief de cada idea generada, para que el diseño respete la identidad del cliente." />

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <Label>Verticales de contenido</Label>
              {pilaresNuevos.length > 0 && (
                <button
                  onClick={() =>
                    setConfig({
                      ...config,
                      verticales: [...config.verticales, ...pilaresNuevos],
                    })
                  }
                  className="rounded-md border border-turquesa/50 px-2.5 py-1 text-[10px] uppercase tracking-wider text-turquesa transition-colors hover:bg-turquesa hover:text-ink"
                >
                  Importar {pilaresNuevos.length} pilares de Estrategia
                </button>
              )}
            </div>
            <ListEditor
              items={config.verticales}
              onChange={(v) => setConfig({ ...config, verticales: v })}
              placeholder="Ej: Educación financiera, lifestyle, producto…"
            />
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <Label>Audiencia objetivo</Label>
              <Area
                value={config.audiencia}
                onChange={(v) => setConfig({ ...config, audiencia: v })}
                rows={3}
                placeholder={
                  comp.segmentos.length > 0
                    ? `Vacío = segmentos de Compañía: ${comp.segmentos.join(", ")}`
                    : "A quién le hablamos: edad, intereses, dolores…"
                }
              />
            </Card>
            <Card>
              <Label>Contexto adicional · opcional</Label>
              <Area
                value={config.contexto}
                onChange={(v) => setConfig({ ...config, contexto: v })}
                rows={3}
                placeholder="Foco del mes: lanzamiento, fecha especial, campaña en curso…"
              />
            </Card>
          </div>

          <button
            onClick={generar}
            disabled={!listo}
            className="w-full rounded-lg bg-turquesa px-4 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Generar ideas → Tablero de pre-aprobación
          </button>
          {!listo && (
            <p className="text-center text-xs text-dim">
              Agrega al menos una vertical (o importa los pilares de Estrategia).
            </p>
          )}
        </div>

        <div>
          <Label>Balance del pipeline</Label>
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              {balance.map(({ objetivo, n }) => (
                <div key={objetivo}>
                  <div
                    className={`font-mono text-2xl font-medium ${OBJETIVO_STYLE[objetivo]}`}
                  >
                    {n}
                  </div>
                  <div className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-dim">
                    {objetivo}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[10px] leading-relaxed text-dim">
              Contenidos aprobados en el ToDo. Un plan sano balancea atracción
              (nuevos seguidores), nutrición (autoridad) y conversión (leads).
            </p>
          </Card>
        </div>
      </div>

      {/* Tablero de ideas — pre-aprobación */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <Label>Tablero de ideas · pre-aprobación</Label>
            <span className="font-mono text-xs text-turquesa">
              {ideas.length}
            </span>
          </div>
          {ideas.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={aprobarTodas}
                className="rounded-md border border-turquesa/50 px-3 py-1.5 text-[10px] uppercase tracking-wider text-turquesa transition-colors hover:bg-turquesa hover:text-ink"
              >
                ✓ Aprobar todas → ToDo
              </button>
              <button
                onClick={descartarTodas}
                className="rounded-md border border-line px-3 py-1.5 text-[10px] uppercase tracking-wider text-dim transition-colors hover:border-magenta hover:text-magenta"
              >
                Descartar todas
              </button>
            </div>
          )}
        </div>

        {ideas.length === 0 ? (
          <EmptyHint>
            Las ideas generadas quedan aquí para revisión. Ajusta título, red,
            formato u objetivo — y aprueba las que pasan al ToDo.
            <br />
            <span className="mt-2 block text-magenta">
              Fase siguiente: generación con IA real (metodología
              expert-content-planning + contexto de Compañía).
            </span>
          </EmptyHint>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="flex flex-col gap-3 rounded-lg border border-line bg-panel p-3.5"
              >
                <input
                  value={idea.titulo}
                  onChange={(e) => editarIdea(idea.id, { titulo: e.target.value })}
                  className="w-full bg-transparent text-sm leading-snug transition-colors focus:text-snow"
                />
                {idea.copy && (
                  <p className="text-[10px] leading-relaxed text-dim">
                    {idea.copy}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-1.5">
                  <Select
                    value={idea.red}
                    onChange={(v) => editarIdea(idea.id, { red: v })}
                    options={
                      opcionesRed.includes(idea.red)
                        ? opcionesRed
                        : [idea.red, ...opcionesRed]
                    }
                  />
                  <Select
                    value={idea.formato ?? "Texto"}
                    onChange={(v) => editarIdea(idea.id, { formato: v })}
                    options={FORMATOS}
                  />
                  <Select
                    value={idea.objetivo ?? "Atraer"}
                    onChange={(v) =>
                      editarIdea(idea.id, { objetivo: v as ObjetivoContenido })
                    }
                    options={OBJETIVOS_CONTENIDO}
                    className={
                      OBJETIVO_STYLE[idea.objetivo ?? "Atraer"]
                    }
                  />
                  {idea.vertical && (
                    <span className="text-[10px] text-turquesa">
                      {idea.vertical}
                    </span>
                  )}
                </div>
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => aprobar(idea.id)}
                    className="flex-1 rounded-md border border-turquesa/50 bg-turquesa/10 py-1.5 text-xs font-medium text-turquesa transition-colors hover:bg-turquesa hover:text-ink"
                  >
                    ✓ Aprobar → ToDo
                  </button>
                  <button
                    onClick={() => descartar(idea.id)}
                    className="rounded-md border border-line px-3 text-xs text-dim transition-colors hover:border-magenta hover:text-magenta"
                    aria-label="Descartar"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
