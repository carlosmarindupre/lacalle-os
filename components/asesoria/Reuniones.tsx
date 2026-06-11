"use client";

import { useState } from "react";
import {
  TIPOS_REUNION,
  ESTADOS_ACUERDO,
  LADOS,
  acuerdoVencido,
  type Acta,
  type Acuerdo,
  type EstadoAcuerdo,
  type Lado,
  type TipoReunion,
} from "@/lib/data";
import { usePersistentState, uid, hoyISO } from "@/lib/store";
import { Card, Label, Area, Select, EmptyHint } from "@/components/ui";

const fmtFecha = (f: string) => f.split("-").reverse().join("/");

export default function Reuniones() {
  const [actas, setActas] = usePersistentState<Acta[]>("asesoria:actas", []);
  const [acuerdos, setAcuerdos] = usePersistentState<Acuerdo[]>(
    "asesoria:acuerdos",
    []
  );

  const [fecha, setFecha] = useState(hoyISO());
  const [tipo, setTipo] = useState<TipoReunion>("Mensual");
  const [asistentes, setAsistentes] = useState("");

  // borradores de acuerdo por acta
  const [draftAcuerdo, setDraftAcuerdo] = useState<Record<string, string>>({});

  const hoy = hoyISO();

  const crearActa = () => {
    if (!fecha) return;
    setActas([
      ...actas,
      { id: uid(), fecha, tipo, asistentes: asistentes.trim(), temas: "" },
    ]);
    setAsistentes("");
  };

  const actualizarActa = (id: string, patch: Partial<Acta>) =>
    setActas(actas.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const eliminarActa = (id: string) => {
    // los acuerdos se conservan, solo pierden su origen
    setActas(actas.filter((a) => a.id !== id));
  };

  const agregarAcuerdo = (actaId: string) => {
    const texto = (draftAcuerdo[actaId] ?? "").trim();
    if (!texto) return;
    setAcuerdos([
      ...acuerdos,
      {
        id: uid(),
        texto,
        actaId,
        responsable: "",
        lado: "laCalle",
        estado: "Pendiente",
      },
    ]);
    setDraftAcuerdo({ ...draftAcuerdo, [actaId]: "" });
  };

  const actualizarAcuerdo = (id: string, patch: Partial<Acuerdo>) =>
    setAcuerdos(acuerdos.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const ordenadas = [...actas].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  return (
    <div className="space-y-6">
      {/* Nueva acta */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel p-3">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="rounded-md border border-line bg-panel2 px-2 py-2 text-xs text-snow transition-colors focus:border-turquesa"
        />
        <Select
          value={tipo}
          onChange={(v) => setTipo(v as TipoReunion)}
          options={TIPOS_REUNION}
        />
        <input
          value={asistentes}
          onChange={(e) => setAsistentes(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && crearActa()}
          placeholder="Asistentes — ej: C. Pérez (laCalle), M. Soto (cliente)…"
          className="min-w-52 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <button
          onClick={crearActa}
          className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
        >
          Crear acta
        </button>
      </div>

      {ordenadas.length === 0 ? (
        <EmptyHint>
          Cada reunión con el cliente queda registrada como un acta: asistentes,
          temas tratados y acuerdos. Los acuerdos alimentan automáticamente la
          pestaña de seguimiento.
        </EmptyHint>
      ) : (
        <div className="space-y-4">
          {ordenadas.map((acta) => {
            const deActa = acuerdos.filter((ac) => ac.actaId === acta.id);
            const esFutura = acta.fecha >= hoy;
            return (
              <Card
                key={acta.id}
                className={esFutura ? "border-turquesa/40" : ""}
              >
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm text-turquesa">
                    {fmtFecha(acta.fecha)}
                  </span>
                  <span className="rounded border border-line2 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-mut">
                    {acta.tipo}
                  </span>
                  {esFutura && (
                    <span className="rounded border border-turquesa/60 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-turquesa">
                      Programada
                    </span>
                  )}
                  <span className="flex-1 truncate text-xs text-mut">
                    {acta.asistentes || "Sin asistentes registrados"}
                  </span>
                  <button
                    onClick={() => eliminarActa(acta.id)}
                    className="text-dim transition-colors hover:text-magenta"
                    aria-label="Eliminar acta"
                  >
                    ×
                  </button>
                </div>

                <Label>Temas tratados</Label>
                <Area
                  value={acta.temas}
                  onChange={(v) => actualizarActa(acta.id, { temas: v })}
                  rows={3}
                  placeholder="Resumen de la reunión: qué se revisó, qué se decidió, contexto relevante…"
                />

                <div className="mt-4">
                  <Label>Acuerdos de esta reunión · {deActa.length}</Label>
                  {deActa.length > 0 && (
                    <ul className="mb-2 space-y-1.5">
                      {deActa.map((ac) => {
                        const vencido = acuerdoVencido(ac, hoy);
                        return (
                          <li
                            key={ac.id}
                            className={`flex flex-wrap items-center gap-2 rounded-md border bg-panel2 px-3 py-2 ${
                              vencido ? "border-magenta/60" : "border-line"
                            }`}
                          >
                            <span className="min-w-40 flex-1 text-sm">
                              {ac.texto}
                            </span>
                            {vencido && (
                              <span className="rounded border border-magenta/60 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-magenta">
                                Vencido
                              </span>
                            )}
                            <Select
                              value={ac.lado}
                              onChange={(v) =>
                                actualizarAcuerdo(ac.id, { lado: v as Lado })
                              }
                              options={LADOS}
                            />
                            <Select
                              value={ac.estado}
                              onChange={(v) =>
                                actualizarAcuerdo(ac.id, {
                                  estado: v as EstadoAcuerdo,
                                })
                              }
                              options={ESTADOS_ACUERDO}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={draftAcuerdo[acta.id] ?? ""}
                      onChange={(e) =>
                        setDraftAcuerdo({
                          ...draftAcuerdo,
                          [acta.id]: e.target.value,
                        })
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && agregarAcuerdo(acta.id)
                      }
                      placeholder="Nuevo acuerdo — qué se comprometió…"
                      className="flex-1 rounded-md border border-line bg-panel2 px-3 py-1.5 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
                    />
                    <button
                      onClick={() => agregarAcuerdo(acta.id)}
                      className="rounded-md border border-line px-3 text-sm text-mut transition-colors hover:border-turquesa hover:text-turquesa"
                    >
                      +
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
