"use client";

import Link from "next/link";
import {
  SERVICIOS,
  ESTADOS_SERVICIO,
  ESTADO_CHIP,
  ESTADO_DOT,
  COMPANIA_INICIAL,
  acuerdoVencido,
  type Acta,
  type Acuerdo,
  type Compania,
  type Contenido,
  type EstadoServicio,
} from "@/lib/data";
import { usePersistentState, hoyISO } from "@/lib/store";
import { PageHeader, Card, Label, StatCard, Select, EmptyHint } from "@/components/ui";

const ESTADO_SERVICIO_STYLE: Record<EstadoServicio, string> = {
  Activo: "text-turquesa",
  "En setup": "text-snow",
  Pausado: "text-magenta",
  "No contratado": "text-dim",
};

export default function Dashboard() {
  const [contenidos] = usePersistentState<Contenido[]>("redes:contenidos", []);
  const [estados, setEstados] = usePersistentState<Record<string, EstadoServicio>>(
    "servicios:estado",
    {}
  );
  const [compania] = usePersistentState<Compania>("compania", COMPANIA_INICIAL);
  const [actas] = usePersistentState<Acta[]>("asesoria:actas", []);
  const [acuerdos] = usePersistentState<Acuerdo[]>("asesoria:acuerdos", []);

  const hoy = hoyISO();
  const proximaReunion = actas
    .filter((a) => a.fecha >= hoy)
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))[0];
  const acuerdosVencidos = acuerdos.filter((a) => acuerdoVencido(a, hoy));
  const acuerdosAbiertos = acuerdos.filter((a) => a.estado !== "Cumplido");
  const enProceso = contenidos.filter((c) => c.estado === "En proceso").length;
  const aprobados = contenidos.filter((c) => c.estado === "Aprobado").length;
  const publicados = contenidos.filter((c) => c.estado === "Publicado").length;
  const proximas = contenidos
    .filter((c) => c.fecha && c.fecha >= hoy && c.estado !== "Publicado")
    .sort((a, b) => (a.fecha! < b.fecha! ? -1 : 1))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        kicker="Tablero · Matriz base"
        title={compania.nombre ? `Dashboard — ${compania.nombre}` : "Dashboard"}
        desc="Resumen general de la operación: estado de servicios, producción de contenidos y próximas entregas."
        right={
          <div className="text-right font-mono text-xs text-dim">
            {new Date().toLocaleDateString("es-CL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Contenidos totales" value={contenidos.length} />
        <StatCard label="En proceso" value={enProceso} />
        <StatCard label="Aprobados" value={aprobados} accent />
        <StatCard label="Publicados" value={publicados} accent />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          <Label>Servicios contratados</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {SERVICIOS.map((s) => {
              const estado = estados[s.slug] ?? "No contratado";
              return (
                <Card key={s.slug} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.2em] text-dim">
                        {s.num}
                      </div>
                      <Link
                        href={`/servicios/${s.slug}`}
                        className="mt-1 block text-sm font-medium leading-snug transition-colors hover:text-turquesa"
                      >
                        {s.nombre}
                      </Link>
                    </div>
                    <span
                      className={`mt-0.5 text-[10px] uppercase tracking-wider ${ESTADO_SERVICIO_STYLE[estado]}`}
                    >
                      ● {estado}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Select
                      value={estado}
                      onChange={(v) =>
                        setEstados({ ...estados, [s.slug]: v as EstadoServicio })
                      }
                      options={ESTADOS_SERVICIO}
                    />
                    <Link
                      href={`/servicios/${s.slug}`}
                      className="text-xs text-mut transition-colors hover:text-turquesa"
                    >
                      Abrir →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <Label>Próximas publicaciones</Label>
            <Card className="p-3">
              {proximas.length === 0 ? (
                <EmptyHint>
                  Sin publicaciones programadas.
                  <br />
                  Planifícalas en{" "}
                  <Link
                    href="/servicios/redes-sociales"
                    className="text-turquesa hover:underline"
                  >
                    Redes Sociales
                  </Link>
                  .
                </EmptyHint>
              ) : (
                <ul className="divide-y divide-line">
                  {proximas.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 px-2 py-2.5">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${ESTADO_DOT[c.estado]}`}
                      />
                      <span className="font-mono text-[11px] text-dim">
                        {c.fecha?.slice(5)}
                      </span>
                      <span className="flex-1 truncate text-sm">{c.titulo}</span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${ESTADO_CHIP[c.estado]}`}
                      >
                        {c.estado}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div>
            <Label>Asesoría estratégica</Label>
            <Card className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-mut">Próxima reunión</span>
                {proximaReunion ? (
                  <span className="font-mono text-xs text-turquesa">
                    {proximaReunion.fecha.split("-").reverse().join("/")} ·{" "}
                    {proximaReunion.tipo}
                  </span>
                ) : (
                  <span className="text-xs text-dim">Sin programar</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-mut">Acuerdos abiertos</span>
                <span className="font-mono text-xs text-snow">
                  {acuerdosAbiertos.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-mut">Vencidos</span>
                <span
                  className={`font-mono text-xs ${
                    acuerdosVencidos.length > 0 ? "text-magenta" : "text-dim"
                  }`}
                >
                  {acuerdosVencidos.length}
                </span>
              </div>
              <Link
                href="/servicios/asesoria-estrategica"
                className="block border-t border-line pt-3 text-xs text-mut transition-colors hover:text-turquesa"
              >
                Abrir módulo →
              </Link>
            </Card>
          </div>

          <div>
            <Label>Accesos rápidos</Label>
            <Card className="space-y-1 p-3">
              <Link
                href="/compania"
                className="block rounded-md px-3 py-2 text-sm text-mut transition-colors hover:bg-panel2 hover:text-snow"
              >
                <span className="text-turquesa">■</span>&nbsp;&nbsp;Levantamiento de
                compañía
              </Link>
              <Link
                href="/servicios/redes-sociales"
                className="block rounded-md px-3 py-2 text-sm text-mut transition-colors hover:bg-panel2 hover:text-snow"
              >
                <span className="text-turquesa">02</span>&nbsp;&nbsp;Calendario de
                contenidos
              </Link>
              <Link
                href="/servicios/asesoria-estrategica"
                className="block rounded-md px-3 py-2 text-sm text-mut transition-colors hover:bg-panel2 hover:text-snow"
              >
                <span className="text-turquesa">01</span>&nbsp;&nbsp;Asesoría
                estratégica
              </Link>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
