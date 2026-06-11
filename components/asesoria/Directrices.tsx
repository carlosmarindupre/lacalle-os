"use client";

import {
  COMPANIA_INICIAL,
  DIRECTRICES_INICIAL,
  type Compania,
  type Directrices as DirectricesData,
  type Okr,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { Card, Label, Area, EmptyHint, FilaContexto } from "@/components/ui";

function progresoDe(okr: Okr) {
  if (okr.resultados.length === 0) return 0;
  return Math.round(
    okr.resultados.reduce((acc, r) => acc + r.progreso, 0) /
      okr.resultados.length
  );
}

export default function Directrices() {
  const [d, setD] = usePersistentState<DirectricesData>(
    "asesoria:directrices",
    DIRECTRICES_INICIAL
  );
  const [comp] = usePersistentState<Compania>("compania", COMPANIA_INICIAL);

  const editarOkr = (id: string, patch: Partial<Okr>) =>
    setD({
      ...d,
      okrs: d.okrs.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    });

  const definicion = [comp.estMarca, comp.estMercado, comp.estComercial]
    .filter(Boolean)
    .join(" · ");

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
              label="Problema estratégico"
              valor={comp.problema}
              href="/compania#problema"
            />
            <FilaContexto
              label="Propuesta de valor"
              valor={comp.propuestaValor}
              href="/compania#posicionamiento"
            />
            <FilaContexto
              label="Ventaja competitiva"
              valor={comp.ventaja}
              href="/compania#posicionamiento"
            />
          </div>
          <div>
            <FilaContexto
              label="Definición estratégica"
              valor={definicion}
              href="/compania#definicion"
            />
            <FilaContexto
              label="Segmentos"
              valor={comp.segmentos.join(", ")}
              href="/compania#clientes"
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <Label>Visión del trabajo</Label>
          <Area
            value={d.vision}
            onChange={(v) => setD({ ...d, vision: v })}
            rows={4}
            placeholder="Hacia dónde llevamos la marca con esta asesoría: el cambio que el cliente debería ver en 12 meses…"
          />
        </Card>
        <Card>
          <Label>Foco del período</Label>
          <Area
            value={d.foco}
            onChange={(v) => setD({ ...d, foco: v })}
            rows={4}
            placeholder="La prioridad de este trimestre: dónde se concentra el esfuerzo y qué queda deliberadamente fuera…"
          />
        </Card>
      </div>

      {/* OKRs */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <Label>Objetivos estratégicos · OKR</Label>
          <button
            onClick={() =>
              setD({
                ...d,
                okrs: [...d.okrs, { id: uid(), objetivo: "", resultados: [] }],
              })
            }
            className="rounded-md border border-turquesa/50 px-3 py-1.5 text-[10px] uppercase tracking-wider text-turquesa transition-colors hover:bg-turquesa hover:text-ink"
          >
            + Nuevo objetivo
          </button>
        </div>

        {d.okrs.length === 0 ? (
          <EmptyHint>
            Define objetivos con resultados clave medibles. El avance del
            objetivo se calcula automáticamente desde sus resultados.
          </EmptyHint>
        ) : (
          <div className="space-y-4">
            {d.okrs.map((okr, oi) => {
              const progreso = progresoDe(okr);
              return (
                <Card key={okr.id}>
                  <div className="mb-1 flex items-start gap-3">
                    <span className="mt-1.5 font-mono text-[11px] tracking-[0.2em] text-turquesa">
                      O{oi + 1}
                    </span>
                    <input
                      value={okr.objetivo}
                      onChange={(e) =>
                        editarOkr(okr.id, { objetivo: e.target.value })
                      }
                      placeholder="Objetivo — ej: Posicionar la marca como referente de moda consciente"
                      className="flex-1 bg-transparent text-base font-medium placeholder:text-dim"
                    />
                    <span className="font-mono text-sm text-turquesa">
                      {progreso}%
                    </span>
                    <button
                      onClick={() =>
                        setD({
                          ...d,
                          okrs: d.okrs.filter((o) => o.id !== okr.id),
                        })
                      }
                      className="px-1 text-dim transition-colors hover:text-magenta"
                      aria-label="Eliminar objetivo"
                    >
                      ×
                    </button>
                  </div>

                  {/* Barra de progreso del objetivo */}
                  <div className="mb-4 ml-8 h-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-turquesa transition-all"
                      style={{ width: `${progreso}%` }}
                    />
                  </div>

                  <div className="ml-8 space-y-2">
                    {okr.resultados.map((r) => (
                      <div key={r.id} className="group flex items-center gap-3">
                        <span className="h-1.5 w-1.5 shrink-0 bg-turquesa" />
                        <input
                          value={r.texto}
                          onChange={(e) =>
                            editarOkr(okr.id, {
                              resultados: okr.resultados.map((x) =>
                                x.id === r.id
                                  ? { ...x, texto: e.target.value }
                                  : x
                              ),
                            })
                          }
                          placeholder="Resultado clave medible — ej: Subir engagement de 2% a 4%"
                          className="flex-1 bg-transparent text-sm placeholder:text-dim"
                        />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={r.progreso}
                          onChange={(e) =>
                            editarOkr(okr.id, {
                              resultados: okr.resultados.map((x) =>
                                x.id === r.id
                                  ? { ...x, progreso: Number(e.target.value) }
                                  : x
                              ),
                            })
                          }
                          className="w-28 accent-turquesa"
                        />
                        <span className="w-10 text-right font-mono text-xs text-mut">
                          {r.progreso}%
                        </span>
                        <button
                          onClick={() =>
                            editarOkr(okr.id, {
                              resultados: okr.resultados.filter(
                                (x) => x.id !== r.id
                              ),
                            })
                          }
                          className="text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                          aria-label="Eliminar resultado"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        editarOkr(okr.id, {
                          resultados: [
                            ...okr.resultados,
                            { id: uid(), texto: "", progreso: 0 },
                          ],
                        })
                      }
                      className="text-xs text-dim transition-colors hover:text-turquesa"
                    >
                      + Agregar resultado clave
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
