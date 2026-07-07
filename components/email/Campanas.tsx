"use client";

import { useState } from "react";
import {
  TIPOS_CAMPANA_EMAIL,
  ESTADOS_CAMPANA_EMAIL,
  ESTADO_CAMPANA_EMAIL_CHIP,
  type CampanaEmail,
  type TipoCampanaEmail,
  type EstadoCampanaEmail,
  type AudienciaEmail,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { hrefSeguro } from "@/lib/url";
import { Card, Label, Select, EmptyHint, StatCard } from "@/components/ui";

function pct(n?: number, total?: number) {
  if (!n || !total || total === 0) return null;
  return ((n / total) * 100).toFixed(1);
}

export default function Campanas() {
  const [campanas, setCampanas] = usePersistentState<CampanaEmail[]>(
    "email:campanas",
    []
  );
  const [audiencias] = usePersistentState<AudienciaEmail[]>(
    "email:audiencias",
    []
  );

  const [filtro, setFiltro] = useState<EstadoCampanaEmail | "todas">("todas");
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const vacio = {
    nombre: "",
    tipo: "Newsletter" as TipoCampanaEmail,
    estado: "Borrador" as EstadoCampanaEmail,
    asunto: "",
    audienciaId: "",
    fechaEnvio: "",
    enviados: "",
    aperturas: "",
    clics: "",
    conversiones: "",
    urlCampana: "",
    notas: "",
  };
  const [form, setForm] = useState<typeof vacio>(vacio);
  const set = (k: keyof typeof vacio, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const guardar = () => {
    if (!form.nombre.trim()) return;
    const entrada: CampanaEmail = {
      id: editandoId ?? uid(),
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      estado: form.estado,
      asunto: form.asunto.trim() || undefined,
      audienciaId: form.audienciaId || undefined,
      fechaEnvio: form.fechaEnvio || undefined,
      enviados: form.enviados ? Number(form.enviados) : undefined,
      aperturas: form.aperturas ? Number(form.aperturas) : undefined,
      clics: form.clics ? Number(form.clics) : undefined,
      conversiones: form.conversiones ? Number(form.conversiones) : undefined,
      urlCampana: form.urlCampana.trim() || undefined,
      notas: form.notas.trim() || undefined,
    };
    if (editandoId) {
      setCampanas(campanas.map((c) => (c.id === editandoId ? entrada : c)));
      setEditandoId(null);
    } else {
      setCampanas([...campanas, entrada]);
    }
    setForm(vacio);
    setAbierto(false);
  };

  const editar = (c: CampanaEmail) => {
    setForm({
      nombre: c.nombre,
      tipo: c.tipo,
      estado: c.estado,
      asunto: c.asunto ?? "",
      audienciaId: c.audienciaId ?? "",
      fechaEnvio: c.fechaEnvio ?? "",
      enviados: c.enviados?.toString() ?? "",
      aperturas: c.aperturas?.toString() ?? "",
      clics: c.clics?.toString() ?? "",
      conversiones: c.conversiones?.toString() ?? "",
      urlCampana: c.urlCampana ?? "",
      notas: c.notas ?? "",
    });
    setEditandoId(c.id);
    setAbierto(true);
  };

  const quitar = (id: string) => {
    if (!confirm("¿Eliminar esta campaña?")) return;
    setCampanas(campanas.filter((c) => c.id !== id));
  };

  const cancelar = () => {
    setForm(vacio);
    setEditandoId(null);
    setAbierto(false);
  };

  const enviadas = campanas.filter((c) => c.estado === "Enviada");
  const totalEnviados = enviadas.reduce((s, c) => s + (c.enviados ?? 0), 0);
  const totalAperturas = enviadas.reduce((s, c) => s + (c.aperturas ?? 0), 0);
  const aperturaProm = pct(totalAperturas, totalEnviados);

  const visibles =
    filtro === "todas" ? campanas : campanas.filter((c) => c.estado === filtro);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total de campañas"
          value={campanas.length}
          accent={campanas.length > 0}
        />
        <StatCard label="Enviadas" value={enviadas.length} />
        <StatCard
          label="Emails enviados"
          value={totalEnviados > 0 ? totalEnviados.toLocaleString() : "—"}
        />
        <StatCard
          label="Tasa apertura prom."
          value={aperturaProm ? `${aperturaProm}%` : "—"}
        />
      </div>

      {/* Filtro rápido por estado */}
      {campanas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(["todas", ...ESTADOS_CAMPANA_EMAIL] as const).map((e) => (
            <button
              key={e}
              onClick={() => setFiltro(e as typeof filtro)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors capitalize ${
                filtro === e
                  ? "border-turquesa bg-turquesa/10 text-turquesa"
                  : "border-line text-dim hover:border-line2 hover:text-mut"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {visibles.length === 0 && !abierto ? (
        <EmptyHint>
          Sin campañas registradas. Agrega aquí cada envío para llevar el
          histórico de métricas y rendimiento.
        </EmptyHint>
      ) : (
        <div className="space-y-3">
          {visibles.map((c) => {
            const audiencia = audiencias.find((a) => a.id === c.audienciaId);
            const tasaA = pct(c.aperturas, c.enviados);
            const tasaC = pct(c.clics, c.enviados);
            return (
              <Card key={c.id} className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-snow">
                        {c.nombre}
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${ESTADO_CAMPANA_EMAIL_CHIP[c.estado]}`}
                      >
                        {c.estado}
                      </span>
                      <span className="rounded border border-line2 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-dim">
                        {c.tipo}
                      </span>
                    </div>
                    {c.asunto && (
                      <p className="mt-0.5 text-xs text-mut">
                        Asunto: {c.asunto}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-dim">
                      {audiencia && <span>· {audiencia.nombre}</span>}
                      {c.fechaEnvio && <span>{c.fechaEnvio}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {c.urlCampana && (
                      <a
                        href={hrefSeguro(c.urlCampana)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-dim hover:text-turquesa"
                      >
                        Ver ↗
                      </a>
                    )}
                    <button
                      onClick={() => editar(c)}
                      className="text-[10px] text-dim hover:text-turquesa"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => quitar(c.id)}
                      className="text-[10px] text-dim hover:text-magenta"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Métricas */}
                {(c.enviados || c.aperturas || c.clics || c.conversiones) && (
                  <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-2">
                    {c.enviados && (
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-medium text-snow">
                          {c.enviados.toLocaleString()}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-dim">
                          Enviados
                        </span>
                      </div>
                    )}
                    {c.aperturas && (
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-medium text-snow">
                          {c.aperturas.toLocaleString()}
                          {tasaA && (
                            <span className="ml-1 text-[10px] text-turquesa">
                              {tasaA}%
                            </span>
                          )}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-dim">
                          Aperturas
                        </span>
                      </div>
                    )}
                    {c.clics && (
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-medium text-snow">
                          {c.clics.toLocaleString()}
                          {tasaC && (
                            <span className="ml-1 text-[10px] text-turquesa">
                              {tasaC}%
                            </span>
                          )}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-dim">
                          Clics
                        </span>
                      </div>
                    )}
                    {c.conversiones && (
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-medium text-snow">
                          {c.conversiones.toLocaleString()}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-dim">
                          Conv.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {!abierto ? (
        <button
          onClick={() => setAbierto(true)}
          className="w-full rounded-md border border-dashed border-line2 px-4 py-3 text-center text-sm text-dim transition-colors hover:border-turquesa hover:text-turquesa"
        >
          + Nueva campaña
        </button>
      ) : (
        <Card className="border-line2/60">
          <Label>{editandoId ? "Editar campaña" : "Nueva campaña"}</Label>
          <div className="space-y-3">
            <input
              autoFocus
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Nombre de la campaña"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <input
              value={form.asunto}
              onChange={(e) => set("asunto", e.target.value)}
              placeholder="Línea de asunto · opcional"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              <div className="min-w-36 flex-1">
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onChange={(v) => set("tipo", v)}
                  options={TIPOS_CAMPANA_EMAIL}
                  className="w-full"
                />
              </div>
              <div className="min-w-36 flex-1">
                <Label>Estado</Label>
                <Select
                  value={form.estado}
                  onChange={(v) => set("estado", v)}
                  options={ESTADOS_CAMPANA_EMAIL}
                  className="w-full"
                />
              </div>
              {audiencias.length > 0 && (
                <div className="min-w-40 flex-1">
                  <Label>Audiencia · opcional</Label>
                  <select
                    value={form.audienciaId}
                    onChange={(e) => set("audienciaId", e.target.value)}
                    className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
                  >
                    <option value="">— Sin audiencia</option>
                    {audiencias.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="min-w-36 flex-1">
                <Label>Fecha de envío</Label>
                <input
                  type="date"
                  value={form.fechaEnvio}
                  onChange={(e) => set("fechaEnvio", e.target.value)}
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  ["enviados", "Enviados"],
                  ["aperturas", "Aperturas"],
                  ["clics", "Clics"],
                  ["conversiones", "Conversiones"],
                ] as const
              ).map(([k, label]) => (
                <div key={k}>
                  <Label>{label}</Label>
                  <input
                    type="number"
                    min="0"
                    value={form[k]}
                    onChange={(e) => set(k, e.target.value)}
                    placeholder="0"
                    className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <input
              value={form.urlCampana}
              onChange={(e) => set("urlCampana", e.target.value)}
              placeholder="URL del reporte en plataforma · opcional"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 font-mono text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <textarea
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              placeholder="Notas · opcional"
              rows={2}
              className="w-full resize-none rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
              <button
                onClick={cancelar}
                className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:text-snow"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={!form.nombre.trim()}
                className="rounded-md bg-turquesa px-4 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Guardar
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
