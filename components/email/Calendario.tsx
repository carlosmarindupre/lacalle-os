"use client";

import { useState } from "react";
import { ESTADO_CAMPANA_EMAIL_CHIP, type CampanaEmail } from "@/lib/data";
import { usePersistentState } from "@/lib/store";
import { EmptyHint } from "@/components/ui";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

function diasEnMes(anio: number, mes: number) {
  return new Date(anio, mes + 1, 0).getDate();
}

function primerDiaSemana(anio: number, mes: number) {
  // 0=Lunes
  const d = new Date(anio, mes, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export default function Calendario() {
  const [campanas] = usePersistentState<CampanaEmail[]>("email:campanas", []);

  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());

  const prev = () => {
    if (mes === 0) { setAnio(a => a - 1); setMes(11); }
    else setMes(m => m - 1);
  };
  const next = () => {
    if (mes === 11) { setAnio(a => a + 1); setMes(0); }
    else setMes(m => m + 1);
  };

  const total = diasEnMes(anio, mes);
  const offset = primerDiaSemana(anio, mes);

  // Campañas con fechaEnvio en este mes
  const campanasMes = campanas.filter((c) => {
    if (!c.fechaEnvio) return false;
    const d = new Date(c.fechaEnvio + "T12:00:00");
    return d.getFullYear() === anio && d.getMonth() === mes;
  });

  // Por día
  const porDia: Record<number, CampanaEmail[]> = {};
  campanasMes.forEach((c) => {
    const d = new Date(c.fechaEnvio! + "T12:00:00").getDate();
    if (!porDia[d]) porDia[d] = [];
    porDia[d].push(c);
  });

  const celdas = Array.from({ length: offset + total }, (_, i) =>
    i < offset ? null : i - offset + 1
  );
  // Rellenar hasta múltiplo de 7
  while (celdas.length % 7 !== 0) celdas.push(null);

  const esHoy = (dia: number) =>
    dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();

  // Lista de todas las campañas con fecha, ordenadas
  const conFecha = [...campanas]
    .filter((c) => c.fechaEnvio)
    .sort((a, b) => (a.fechaEnvio! > b.fechaEnvio! ? -1 : 1));

  return (
    <div className="space-y-6">
      {/* Nav de mes */}
      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:text-snow"
        >
          ‹ Anterior
        </button>
        <span className="text-sm font-medium text-snow">
          {MESES[mes]} {anio}
        </span>
        <button
          onClick={next}
          className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:text-snow"
        >
          Siguiente ›
        </button>
      </div>

      {campanas.filter((c) => c.fechaEnvio).length === 0 ? (
        <EmptyHint>
          Sin campañas con fecha. Agrega campañas en la pestaña Campañas con
          una fecha de envío para verlas aquí.
        </EmptyHint>
      ) : (
        <>
          {/* Grilla del calendario */}
          <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
            <div className="min-w-[320px]">
              <div className="grid grid-cols-7 gap-px">
                {DIAS_SEMANA.map((d) => (
                  <div
                    key={d}
                    className="py-1.5 text-center text-[10px] uppercase tracking-wider text-dim"
                  >
                    {d}
                  </div>
                ))}
                {celdas.map((dia, i) => (
                  <div
                    key={i}
                    className={`min-h-[64px] rounded p-1.5 transition-colors ${
                      dia === null
                        ? "opacity-0"
                        : esHoy(dia)
                        ? "bg-turquesa/10 ring-1 ring-turquesa/30"
                        : "bg-panel2/40"
                    }`}
                  >
                    {dia !== null && (
                      <>
                        <span
                          className={`block text-right text-[11px] leading-none ${
                            esHoy(dia) ? "font-bold text-turquesa" : "text-dim"
                          }`}
                        >
                          {dia}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {(porDia[dia] ?? []).slice(0, 3).map((c) => (
                            <div
                              key={c.id}
                              title={c.nombre}
                              className={`truncate rounded px-1 py-0.5 text-[9px] leading-tight ${
                                c.estado === "Enviada"
                                  ? "bg-turquesa/15 text-turquesa"
                                  : c.estado === "Programada"
                                  ? "bg-[#4A90D9]/15 text-[#6aaae8]"
                                  : "bg-panel2 text-dim"
                              }`}
                            >
                              {c.nombre}
                            </div>
                          ))}
                          {(porDia[dia]?.length ?? 0) > 3 && (
                            <div className="text-[9px] text-dim">
                              +{porDia[dia].length - 3} más
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap gap-3 border-t border-line pt-3">
            {(
              [
                ["Enviada", "bg-turquesa/15 text-turquesa"],
                ["Programada", "bg-[#4A90D9]/15 text-[#6aaae8]"],
                ["Borrador / Pausada", "bg-panel2 text-dim"],
              ] as const
            ).map(([label, cls]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`h-2 w-4 rounded text-[0px] ${cls.split(" ")[0]}`} />
                <span className="text-[10px] text-dim">{label}</span>
              </div>
            ))}
          </div>

          {/* Lista cronológica */}
          {conFecha.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-wider text-dim">
                Historial de campañas con fecha
              </p>
              <div className="space-y-2">
                {conFecha.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 border-b border-line pb-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="shrink-0 font-mono text-[10px] text-dim">
                        {c.fechaEnvio}
                      </span>
                      <span className="truncate text-xs text-snow">
                        {c.nombre}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${ESTADO_CAMPANA_EMAIL_CHIP[c.estado]}`}
                    >
                      {c.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
