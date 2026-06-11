"use client";

import { useState } from "react";
import {
  BRIEF_VACIO,
  ESTADOS_BRIEF,
  ESTADO_BRIEF_CHIP,
  PLATAFORMAS_INICIAL,
  type BriefCampana,
  type Campana,
  type EstadoBrief,
  type ObjetivoCampana,
  type PlataformaAds,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import {
  Card,
  Label,
  Area,
  TextInput,
  Select,
  EmptyHint,
  StatCard,
} from "@/components/ui";
import BrandKitPanel from "@/components/diseno/BrandKitPanel";

const hoyISO = () => new Date().toISOString().slice(0, 10);

const inferirObjetivo = (kpi: string): ObjetivoCampana => {
  const k = kpi.toLowerCase();
  if (k.includes("venta") || k.includes("revenue") || k.includes("roas"))
    return "Ventas";
  if (k.includes("lead") || k.includes("cpa") || k.includes("formulario"))
    return "Leads";
  if (k.includes("tráfico") || k.includes("trafico") || k.includes("clic"))
    return "Tráfico";
  return "Awareness";
};

export default function Briefs() {
  const [briefs, setBriefs] = usePersistentState<BriefCampana[]>(
    "paid:briefs",
    []
  );
  const [campanas, setCampanas] = usePersistentState<Campana[]>(
    "paid:campanas",
    []
  );
  const [plataformas] = usePersistentState<PlataformaAds[]>(
    "paid:plataformas",
    PLATAFORMAS_INICIAL
  );
  const [abierto, setAbierto] = useState<string | null>(null);
  const [nombreNuevo, setNombreNuevo] = useState("");

  const plataformasActivas = plataformas.filter((p) => p.activa).map((p) => p.nombre);
  const opcionesPlataforma =
    plataformasActivas.length > 0 ? plataformasActivas : ["Meta Ads"];

  const agregar = () => {
    const n = nombreNuevo.trim();
    if (!n) return;
    const nuevo: BriefCampana = {
      ...BRIEF_VACIO,
      id: uid(),
      nombre: n,
      creadoEn: hoyISO(),
    };
    setBriefs([nuevo, ...briefs]);
    setAbierto(nuevo.id);
    setNombreNuevo("");
  };

  const actualizar = (id: string, patch: Partial<BriefCampana>) =>
    setBriefs(briefs.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const eliminar = (id: string) => {
    setBriefs(briefs.filter((b) => b.id !== id));
    if (abierto === id) setAbierto(null);
  };

  const togglePlataforma = (id: string, nombre: string) => {
    const b = briefs.find((x) => x.id === id);
    if (!b) return;
    const yaEsta = b.plataformasObjetivo.includes(nombre);
    actualizar(id, {
      plataformasObjetivo: yaEsta
        ? b.plataformasObjetivo.filter((p) => p !== nombre)
        : [...b.plataformasObjetivo, nombre],
    });
  };

  const convertirEnCampana = (b: BriefCampana) => {
    if (b.estado !== "Aprobado") return;
    const plataforma = b.plataformasObjetivo[0] ?? opcionesPlataforma[0];
    const objetivo: ObjetivoCampana = inferirObjetivo(b.kpiPrincipal ?? "");
    const nuevaCampana: Campana = {
      id: uid(),
      nombre: b.nombre,
      plataforma,
      objetivo,
      estado: "Borrador",
      inicio: b.fechaInicio || undefined,
      fin: b.fechaFin || undefined,
      presupuesto: b.presupuestoEstimado || undefined,
    };
    setCampanas([...campanas, nuevaCampana]);
    actualizar(b.id, {
      estado: "Convertido",
      campanaIdGenerada: nuevaCampana.id,
    });
  };

  const briefsActivos = briefs.filter((b) => b.estado !== "Convertido");
  const enRevision = briefs.filter((b) => b.estado === "En revisión").length;
  const aprobados = briefs.filter((b) => b.estado === "Aprobado").length;
  const convertidos = briefs.filter((b) => b.estado === "Convertido").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Briefs activos" value={briefsActivos.length} />
        <StatCard label="En revisión" value={enRevision} />
        <StatCard label="Aprobados pendientes" value={aprobados} accent />
        <StatCard label="Convertidos en campaña" value={convertidos} />
      </div>

      {/* Alta rápida */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel p-3">
        <input
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Nuevo brief — ej: Captación de leads, septiembre…"
          className="min-w-52 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <button
          onClick={agregar}
          className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
        >
          + Brief
        </button>
      </div>

      <BrandKitPanel nota="Lineamientos de marca para las creatividades de cada campaña. Refléjalos en el campo Restricciones del brief." />

      {briefs.length === 0 ? (
        <EmptyHint>
          El brief precede a la campaña: aquí se documenta el objetivo de
          negocio, la audiencia, la oferta y las restricciones antes de armar
          el setup técnico. Al aprobar un brief, conviértelo en campaña y
          arrastra el setup recomendado por la skill{" "}
          <span className="font-mono text-turquesa">
            lacalle-os-brief-campania
          </span>
          .
        </EmptyHint>
      ) : (
        <div className="space-y-3">
          {briefs.map((b) => {
            const expandido = abierto === b.id;
            return (
              <div
                key={b.id}
                className={`group rounded-lg border bg-panel transition-colors ${
                  expandido ? "border-turquesa/40" : "border-line"
                }`}
              >
                {/* Cabecera */}
                <div
                  className="flex flex-wrap items-center gap-2.5 p-4"
                  onClick={() => setAbierto(expandido ? null : b.id)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="font-mono text-[10px] text-dim">
                    {b.creadoEn}
                  </span>
                  <span className="min-w-48 flex-1 text-sm font-medium">
                    {b.nombre || "(sin nombre)"}
                  </span>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${ESTADO_BRIEF_CHIP[b.estado]}`}
                  >
                    {b.estado}
                  </span>
                  {b.plataformasObjetivo.length > 0 && (
                    <span className="font-mono text-[10px] text-mut">
                      {b.plataformasObjetivo.join(" · ")}
                    </span>
                  )}
                  {b.responsable && (
                    <span className="font-mono text-[10px] text-dim">
                      · {b.responsable}
                    </span>
                  )}
                  <span className="text-dim">
                    {expandido ? "▾" : "▸"}
                  </span>
                </div>

                {/* Detalle */}
                {expandido && (
                  <div className="border-t border-line px-4 py-5 space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Nombre del brief</Label>
                        <TextInput
                          value={b.nombre}
                          onChange={(v) => actualizar(b.id, { nombre: v })}
                          placeholder="Nombre interno"
                        />
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Label>Estado</Label>
                          <Select
                            value={b.estado}
                            onChange={(v) =>
                              actualizar(b.id, { estado: v as EstadoBrief })
                            }
                            options={ESTADOS_BRIEF}
                            className="w-full"
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Responsable</Label>
                          <TextInput
                            value={b.responsable ?? ""}
                            onChange={(v) =>
                              actualizar(b.id, { responsable: v })
                            }
                            placeholder="Ejecutivo de cuenta"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Estratégico */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <Label>Objetivo de negocio</Label>
                        <Area
                          value={b.objetivoNegocio}
                          onChange={(v) =>
                            actualizar(b.id, { objetivoNegocio: v })
                          }
                          rows={3}
                          placeholder="Qué quiere lograr el cliente con esta campaña, en lenguaje de negocio (no de paid media). Ej: 'recuperar la base que dejó de comprar hace +6 meses'."
                        />
                      </Card>
                      <Card>
                        <Label>Público objetivo</Label>
                        <Area
                          value={b.publicoObjetivo}
                          onChange={(v) =>
                            actualizar(b.id, { publicoObjetivo: v })
                          }
                          rows={3}
                          placeholder="Demográfico + psicográfico + behavioral. Si conecta con un segmento de Compañía, mencionarlo."
                        />
                      </Card>
                      <Card>
                        <Label>Oferta / propuesta</Label>
                        <Area
                          value={b.oferta}
                          onChange={(v) => actualizar(b.id, { oferta: v })}
                          rows={3}
                          placeholder="Qué se ofrece al público: producto, descuento, lead magnet, demo. Mensaje central."
                        />
                      </Card>
                      <Card>
                        <Label>Restricciones</Label>
                        <Area
                          value={b.restricciones}
                          onChange={(v) =>
                            actualizar(b.id, { restricciones: v })
                          }
                          rows={3}
                          placeholder="Lo que no se puede hacer: tono, marca, prohibiciones legales, exclusiones, presupuesto tope, plataformas vetadas."
                        />
                      </Card>
                    </div>

                    {/* Operativo */}
                    <div className="grid gap-4 md:grid-cols-4">
                      <Card>
                        <Label>Presupuesto estimado</Label>
                        <TextInput
                          value={b.presupuestoEstimado ?? ""}
                          onChange={(v) =>
                            actualizar(b.id, { presupuestoEstimado: v })
                          }
                          placeholder="Ej: $500.000"
                          className="font-mono"
                        />
                      </Card>
                      <Card>
                        <Label>KPI principal</Label>
                        <TextInput
                          value={b.kpiPrincipal ?? ""}
                          onChange={(v) =>
                            actualizar(b.id, { kpiPrincipal: v })
                          }
                          placeholder="Ej: CPA &lt; $8.000"
                        />
                      </Card>
                      <Card>
                        <Label>Inicio</Label>
                        <input
                          type="date"
                          value={b.fechaInicio ?? ""}
                          onChange={(e) =>
                            actualizar(b.id, {
                              fechaInicio: e.target.value || undefined,
                            })
                          }
                          className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa"
                        />
                      </Card>
                      <Card>
                        <Label>Fin</Label>
                        <input
                          type="date"
                          value={b.fechaFin ?? ""}
                          onChange={(e) =>
                            actualizar(b.id, {
                              fechaFin: e.target.value || undefined,
                            })
                          }
                          className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa"
                        />
                      </Card>
                    </div>

                    {/* Plataformas */}
                    <Card>
                      <Label>Plataformas objetivo</Label>
                      <div className="flex flex-wrap gap-2">
                        {opcionesPlataforma.map((p) => {
                          const activa = b.plataformasObjetivo.includes(p);
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => togglePlataforma(b.id, p)}
                              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                                activa
                                  ? "border-turquesa bg-turquesa/15 text-turquesa"
                                  : "border-line text-mut hover:border-line2"
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-[10px] text-dim">
                        Solo aparecen las plataformas activas de Estrategia. La
                        primera marcada se usa al convertir en campaña.
                      </p>
                    </Card>

                    {/* OKR vinculado */}
                    <Card>
                      <Label>OKR vinculado · opcional</Label>
                      <TextInput
                        value={b.okrVinculado ?? ""}
                        onChange={(v) =>
                          actualizar(b.id, { okrVinculado: v })
                        }
                        placeholder="Ej: OKR Q3 — Aumentar conversión de la base existente +20%"
                      />
                      <p className="mt-2 text-[10px] text-dim">
                        Conecta el brief con un OKR de Asesoría Estratégica. Si
                        el brief no sirve a ningún OKR vigente, vale la pena
                        cuestionarlo antes de aprobarlo.
                      </p>
                    </Card>

                    {/* Acciones */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                      <div className="text-xs text-dim">
                        {b.estado === "Convertido" && b.campanaIdGenerada ? (
                          <>
                            <span className="text-turquesa">●</span> Convertido
                            en campaña. Sigue la ejecución en la pestaña
                            Campañas.
                          </>
                        ) : b.estado === "Aprobado" ? (
                          <>
                            Listo para convertir en campaña. Antes, invoca{" "}
                            <span className="font-mono text-turquesa">
                              /lacalle-os-brief-campania
                            </span>{" "}
                            para generar el setup técnico recomendado.
                          </>
                        ) : (
                          <>
                            Completa el brief y cambia el estado a{" "}
                            <span className="text-turquesa">Aprobado</span>{" "}
                            para poder convertirlo en campaña.
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => eliminar(b.id)}
                          className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:border-magenta/60 hover:text-magenta"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={() => convertirEnCampana(b)}
                          disabled={b.estado !== "Aprobado"}
                          className="rounded-md bg-turquesa px-4 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Convertir en campaña →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
