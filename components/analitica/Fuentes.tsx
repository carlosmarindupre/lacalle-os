"use client";

import { useState } from "react";
import {
  FUENTES_ANALITICA_DISPONIBLES,
  FUENTES_ANALITICA_INICIAL,
  METRICAS_POR_FUENTE_ANALITICA,
  ESTADOS_CONECTOR,
  CONECTOR_ESTADO_CHIP,
  type FuenteAnalitica,
  type FuenteAnaliticaPlataforma,
  type EstadoConector,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { Card, Label, Select, EmptyHint, StatCard } from "@/components/ui";

const COLOR_FUENTE: Record<FuenteAnaliticaPlataforma, string> = {
  "Google Analytics 4": "bg-turquesa/15 text-turquesa",
  "Google Search Console": "bg-[#F5A623]/15 text-[#d4900f]",
  "Google Tag Manager": "bg-[#4A90D9]/15 text-[#6aaae8]",
  Hotjar: "bg-magenta/15 text-magenta",
  "Microsoft Clarity": "bg-[#0078D4]/15 text-[#69a8e8]",
  Otra: "bg-panel2 text-mut",
};

const INICIAL_FUENTE: Record<FuenteAnaliticaPlataforma, string> = {
  "Google Analytics 4": "GA4",
  "Google Search Console": "SC",
  "Google Tag Manager": "GTM",
  Hotjar: "HJ",
  "Microsoft Clarity": "MC",
  Otra: "?",
};

const DESCRIPCION_FUENTE: Record<FuenteAnaliticaPlataforma, string> = {
  "Google Analytics 4": "analítica web · medición de eventos",
  "Google Search Console": "SEO · búsqueda orgánica",
  "Google Tag Manager": "gestión de etiquetas · disparadores",
  Hotjar: "comportamiento del usuario · mapas de calor",
  "Microsoft Clarity": "comportamiento del usuario · sesiones grabadas",
  Otra: "fuente personalizada",
};

const PLACEHOLDER_PROPIEDAD: Record<FuenteAnaliticaPlataforma, string> = {
  "Google Analytics 4": "G-XXXXXXXXXX o 123456789",
  "Google Search Console": "https://tudominio.com",
  "Google Tag Manager": "GTM-XXXXXXX",
  Hotjar: "Site ID — ej: 1234567",
  "Microsoft Clarity": "Project ID — ej: abc123xyz",
  Otra: "ID o URL de la cuenta",
};

export default function Fuentes() {
  const [fuentes, setFuentes] = usePersistentState<FuenteAnalitica[]>(
    "analitica:fuentes",
    FUENTES_ANALITICA_INICIAL
  );
  const [nuevaPlataforma, setNuevaPlataforma] =
    useState<FuenteAnaliticaPlataforma>("Google Analytics 4");
  const [configurandoId, setConfigurandoId] = useState<string | null>(null);
  const [propiedadTmp, setPropiedadTmp] = useState("");
  const [propiedadNombreTmp, setPropiedadNombreTmp] = useState("");

  const actualizar = (id: string, patch: Partial<FuenteAnalitica>) =>
    setFuentes(fuentes.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const agregar = () => {
    const yaExiste = fuentes.some((f) => f.plataforma === nuevaPlataforma);
    if (yaExiste) return;
    const disponibles = FUENTES_ANALITICA_DISPONIBLES.filter(
      (p) => !fuentes.some((f) => f.plataforma === p)
    );
    setFuentes([
      ...fuentes,
      { id: uid(), plataforma: nuevaPlataforma, estado: "No configurado" },
    ]);
    const siguiente = disponibles.find((p) => p !== nuevaPlataforma);
    if (siguiente) setNuevaPlataforma(siguiente);
  };

  const quitar = (id: string) => {
    if (!confirm("¿Quitar esta fuente?")) return;
    setFuentes(fuentes.filter((f) => f.id !== id));
  };

  const guardar = (id: string) => {
    if (!propiedadTmp.trim()) return;
    actualizar(id, {
      estado: "Conectado",
      propiedad: propiedadTmp.trim(),
      propiedadNombre: propiedadNombreTmp.trim() || undefined,
      notaError: undefined,
    });
    setConfigurandoId(null);
    setPropiedadTmp("");
    setPropiedadNombreTmp("");
  };

  const limpiar = (id: string) =>
    actualizar(id, {
      estado: "No configurado",
      propiedad: undefined,
      propiedadNombre: undefined,
    });

  const conectadas = fuentes.filter((f) => f.estado === "Conectado").length;
  const conAlerta = fuentes.filter(
    (f) => f.estado === "Error" || f.estado === "Reautenticar"
  ).length;
  const disponiblesAgregar = FUENTES_ANALITICA_DISPONIBLES.filter(
    (p) => !fuentes.some((f) => f.plataforma === p)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Fuentes configuradas"
          value={conectadas}
          accent={conectadas > 0}
        />
        <StatCard label="Total de fuentes" value={fuentes.length} />
        <StatCard label="Con alerta" value={conAlerta} />
        <StatCard label="Por configurar" value={fuentes.length - conectadas} />
      </div>

      {fuentes.length === 0 ? (
        <EmptyHint>
          Agrega al menos una fuente para documentar las cuentas de analítica
          del cliente.
        </EmptyHint>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {fuentes.map((f) => {
            const configurando = configurandoId === f.id;
            const conectada = f.estado === "Conectado";
            const metricas = METRICAS_POR_FUENTE_ANALITICA[f.plataforma] ?? [];

            return (
              <Card
                key={f.id}
                className={
                  f.estado === "Error" || f.estado === "Reautenticar"
                    ? "border-magenta/40"
                    : conectada
                      ? "border-turquesa/40"
                      : ""
                }
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-semibold ${COLOR_FUENTE[f.plataforma]}`}
                  >
                    {INICIAL_FUENTE[f.plataforma]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {f.plataforma}
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${CONECTOR_ESTADO_CHIP[f.estado]}`}
                      >
                        {f.estado}
                      </span>
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-dim">
                      {DESCRIPCION_FUENTE[f.plataforma]}
                    </div>
                  </div>
                </div>

                {configurando ? (
                  <div className="space-y-3 rounded-md border border-line bg-panel2 p-3">
                    <div>
                      <Label>Propiedad / ID</Label>
                      <input
                        autoFocus
                        value={propiedadTmp}
                        onChange={(e) => setPropiedadTmp(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && guardar(f.id)}
                        placeholder={PLACEHOLDER_PROPIEDAD[f.plataforma]}
                        className="w-full rounded-md border border-line bg-panel px-3 py-2 font-mono text-xs text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
                      />
                    </div>
                    <div>
                      <Label>Nombre amigable · opcional</Label>
                      <input
                        value={propiedadNombreTmp}
                        onChange={(e) => setPropiedadNombreTmp(e.target.value)}
                        placeholder="Ej: Sitio principal cliente"
                        className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] leading-relaxed text-dim">
                      Documenta la propiedad que alimenta los dashboards de
                      Looker. No abre conexión técnica desde aquí.
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setConfigurandoId(null);
                          setPropiedadTmp("");
                          setPropiedadNombreTmp("");
                        }}
                        className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:text-snow"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => guardar(f.id)}
                        disabled={!propiedadTmp.trim()}
                        className="rounded-md bg-turquesa px-3 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : conectada ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-dim">
                          Propiedad
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-snow">
                          {f.propiedad ?? "—"}
                        </div>
                        {f.propiedadNombre && (
                          <div className="text-[10px] text-mut">
                            {f.propiedadNombre}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-dim">
                          Estado
                        </div>
                        <Select
                          value={f.estado}
                          onChange={(v) =>
                            actualizar(f.id, { estado: v as EstadoConector })
                          }
                          options={ESTADOS_CONECTOR}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    {metricas.length > 0 && (
                      <div>
                        <Label>Métricas disponibles vía Looker</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {metricas.map((m) => (
                            <span
                              key={m}
                              className="rounded border border-line bg-panel2 px-1.5 py-0.5 font-mono text-[10px] text-mut"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1.5 border-t border-line pt-3">
                      <button
                        onClick={() => {
                          setConfigurandoId(f.id);
                          setPropiedadTmp(f.propiedad ?? "");
                          setPropiedadNombreTmp(f.propiedadNombre ?? "");
                        }}
                        className="rounded-md border border-line px-2.5 py-1.5 text-xs text-mut transition-colors hover:border-turquesa/60 hover:text-turquesa"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => limpiar(f.id)}
                        className="rounded-md border border-line px-2.5 py-1.5 text-xs text-mut transition-colors hover:border-magenta/60 hover:text-magenta"
                      >
                        Quitar config
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metricas.length > 0 && (
                      <p className="text-xs text-mut">
                        {metricas.length} métricas disponibles vía Looker
                      </p>
                    )}
                    {f.notaError && (
                      <div className="rounded-md border border-magenta/40 bg-magenta/5 p-2 text-[10px] text-magenta">
                        {f.notaError}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => quitar(f.id)}
                        className="text-[11px] text-dim transition-colors hover:text-magenta"
                      >
                        Quitar
                      </button>
                      <button
                        onClick={() => {
                          setConfigurandoId(f.id);
                          setPropiedadTmp("");
                          setPropiedadNombreTmp("");
                        }}
                        className="rounded-md bg-turquesa px-3 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-85"
                      >
                        {f.estado === "Reautenticar"
                          ? "Reautenticar →"
                          : "Configurar →"}
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {disponiblesAgregar.length > 0 && (
        <Card className="border-line2/60">
          <Label>Agregar fuente de analítica</Label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={nuevaPlataforma}
              onChange={(e) =>
                setNuevaPlataforma(e.target.value as FuenteAnaliticaPlataforma)
              }
              className="flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
            >
              {disponiblesAgregar.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              onClick={agregar}
              className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
            >
              Agregar
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
