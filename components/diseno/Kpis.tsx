"use client";

import { ESTADOS_PIEZA, type EstadoPieza, type Pieza } from "@/lib/data";
import { usePersistentState } from "@/lib/store";
import { Card, Label, StatCard, EmptyHint } from "@/components/ui";

const diasEntre = (a: string, b: string) =>
  Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000));

// Color de barra por estado (clases literales para que Tailwind las genere).
const BAR: Record<EstadoPieza, string> = {
  "En cola": "bg-line2",
  "En proceso": "bg-snow",
  "Revisión interna": "bg-mut",
  "Aprobación cliente": "bg-magenta",
  Aprobado: "bg-turquesa",
  Entregado: "bg-turquesa",
};

export default function Kpis() {
  const [piezas] = usePersistentState<Pieza[]>("diseno:piezas", []);

  const entregadas = piezas.filter((p) => p.estado === "Entregado");
  // En curso = todo lo activo (ni en cola ni entregado). Etiqueta distinta a la
  // del resumen de Solicitudes ("En producción"), que cuenta solo el trabajo en
  // ejecución, para que no se lean como el mismo número.
  const enCurso = piezas.filter(
    (p) => p.estado !== "En cola" && p.estado !== "Entregado"
  );

  // Ciclo cerrado = piezas que llegaron a aprobación (tienen sello aprobadaEn)
  const cerradas = piezas.filter((p) => p.aprobadaEn);

  const tiempoAprob =
    cerradas.length > 0
      ? Math.round(
          (cerradas.reduce(
            (a, p) => a + diasEntre(p.fechaSolicitud, p.aprobadaEn!),
            0
          ) /
            cerradas.length) *
            10
        ) / 10
      : null;

  const rondasProm =
    cerradas.length > 0
      ? Math.round(
          (cerradas.reduce((a, p) => a + p.rondas, 0) / cerradas.length) * 10
        ) / 10
      : null;

  // % entregado a tiempo (sobre las que tienen deadline y fecha real de entrega)
  const conPlazo = entregadas.filter((p) => p.fechaEntrega && p.entregadaEn);
  const aTiempo = conPlazo.filter((p) => p.entregadaEn! <= p.fechaEntrega!).length;
  const pctATiempo =
    conPlazo.length > 0 ? Math.round((aTiempo / conPlazo.length) * 100) : null;

  // Distribución por estado
  const porEstado = ESTADOS_PIEZA.map((e) => ({
    estado: e,
    n: piezas.filter((p) => p.estado === e).length,
  }));
  const maxEstado = Math.max(1, ...porEstado.map((x) => x.n));

  // Carga por diseñador (piezas activas, sin contar entregadas)
  const activas = piezas.filter((p) => p.estado !== "Entregado");
  const cargaMap = new Map<string, number>();
  activas.forEach((p) => {
    const r = p.responsable?.trim() || "Sin asignar";
    cargaMap.set(r, (cargaMap.get(r) ?? 0) + 1);
  });
  const carga = [...cargaMap.entries()].sort((a, b) => b[1] - a[1]);
  const maxCarga = Math.max(1, ...carga.map(([, n]) => n));

  if (piezas.length === 0) {
    return (
      <EmptyHint>
        Sin datos aún. Crea piezas en{" "}
        <span className="text-turquesa">Solicitudes</span> y los KPIs de
        producción se calculan automáticamente a medida que avanzan.
      </EmptyHint>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Entregadas" value={entregadas.length} accent />
        <StatCard
          label="En curso"
          value={enCurso.length}
          sub="piezas activas sin entregar"
        />
        <StatCard
          label="Aprobación promedio"
          value={tiempoAprob === null ? "—" : `${tiempoAprob} d`}
          sub="desde solicitud a aprobado"
        />
        <StatCard
          label="Entregado a tiempo"
          value={pctATiempo === null ? "—" : `${pctATiempo}%`}
          sub={
            conPlazo.length > 0
              ? `${aTiempo}/${conPlazo.length} con deadline`
              : "sin deadlines aún"
          }
          accent
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribución por estado */}
        <Card>
          <Label>Pipeline · piezas por estado</Label>
          <div className="mt-3 space-y-2.5">
            {porEstado.map(({ estado, n }) => (
              <div key={estado} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-[11px] text-mut">
                  {estado}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-panel2">
                  <div
                    className={`h-full rounded-full ${BAR[estado as EstadoPieza]}`}
                    style={{ width: `${(n / maxEstado) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right font-mono text-xs text-dim">
                  {n}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Carga por diseñador + rondas */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <Label>Carga por diseñador</Label>
            <span className="text-[11px] text-dim">
              Rondas prom.{" "}
              <span className="font-mono text-snow">
                {rondasProm === null ? "—" : rondasProm}
              </span>
            </span>
          </div>
          {carga.length === 0 ? (
            <EmptyHint>Sin piezas activas asignadas.</EmptyHint>
          ) : (
            <div className="space-y-2.5">
              {carga.map(([nombre, n]) => (
                <div key={nombre} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-[11px] text-mut">
                    {nombre}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-panel2">
                    <div
                      className="h-full rounded-full bg-turquesa"
                      style={{ width: `${(n / maxCarga) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-mono text-xs text-dim">
                    {n}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <p className="text-[11px] text-dim">
        Tiempo de aprobación y rondas promedio se calculan sobre las piezas que
        ya pasaron por aprobación. El % a tiempo compara la fecha real de
        entrega contra el deadline comprometido.
      </p>
    </div>
  );
}
