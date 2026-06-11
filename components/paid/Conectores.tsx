"use client";

import { useState } from "react";
import {
  CONECTORES_INICIAL,
  CONECTOR_ESTADO_CHIP,
  ESTADOS_CONECTOR,
  METRICAS_POR_CONECTOR,
  PLATAFORMAS_INICIAL,
  LOOKER_INICIAL,
  type Conector,
  type ConectorPlataforma,
  type EstadoConector,
  type LookerEmbed,
  type PlataformaAds,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { Card, Label, Select, EmptyHint, StatCard, TextInput } from "@/components/ui";

// Mapeo conector → nombre de plataforma en Estrategia.
// Meta Ads cubre Facebook + Instagram (no hay conector separado de IG).
const PLATAFORMA_EN_ESTRATEGIA: Record<ConectorPlataforma, string> = {
  "Meta Ads": "Meta Ads",
  "Google Ads": "Google Ads",
  "TikTok Ads": "TikTok Ads",
  "Google Analytics 4": "Google Analytics 4",
};

const inicialLetra = (p: ConectorPlataforma): string => {
  if (p === "Meta Ads") return "M";
  if (p === "Google Ads") return "G";
  if (p === "TikTok Ads") return "T";
  return "A";
};

const colorPlataforma = (p: ConectorPlataforma): string => {
  if (p === "Meta Ads") return "bg-[#1877F2]/15 text-[#5b8eff]";
  if (p === "Google Ads") return "bg-[#FBBC04]/15 text-[#f5c64a]";
  if (p === "TikTok Ads") return "bg-magenta/15 text-magenta";
  return "bg-turquesa/15 text-turquesa";
};

// ── Looker Studio ───────────────────────────────────────────────────────────
// Solo la URL de inserción (/embed/reporting/) carga dentro de un iframe; el
// visor normal y los enlaces cortos /s/ los bloquea Google con X-Frame-Options.
// parseLookerUrl acepta el enlace de "Insertar informe", la URL /reporting/ (la
// convierte) o el <iframe> completo, y rechaza con motivo lo que no se puede embeber.
type MotivoError = "vacio" | "no-looker" | "short-link" | "no-embeddable";
type LookerParse = { ok: true; url: string } | { ok: false; motivo: MotivoError };

const MENSAJE_ERROR: Record<MotivoError, string> = {
  vacio: "Pega el enlace de inserción de Looker (Compartir → Insertar informe).",
  "no-looker":
    "Ese enlace no parece de Looker Studio. Pega el de “Insertar informe” o el <iframe> completo.",
  "short-link":
    "Pegaste un enlace corto de compartir (/s/…). Ese no se puede incrustar. En Looker: Compartir → Insertar informe → activa la inserción y copia el enlace que tiene /embed/reporting/ (o el <iframe> completo).",
  "no-embeddable":
    "Falta el enlace de inserción. El enlace normal de “ver” no se puede incrustar. En Looker: Compartir → Insertar informe → copia la URL /embed/reporting/ o el <iframe> completo.",
};

function parseLookerUrl(input: string): LookerParse {
  const t = input.trim();
  if (!t) return { ok: false, motivo: "vacio" };
  // Si pegan el iframe completo, extraer el src.
  const m = t.match(/src=["']([^"']+)["']/i);
  const raw = m ? m[1] : t;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { ok: false, motivo: "no-looker" };
  }
  const host = u.hostname.toLowerCase();
  const esLooker =
    host === "lookerstudio.google.com" ||
    host === "datastudio.google.com" ||
    host.endsWith(".lookerstudio.google.com") ||
    host.endsWith(".datastudio.google.com");
  if (!esLooker) return { ok: false, motivo: "no-looker" };
  // Enlace corto /s/ — no se puede resolver a /embed/ desde el browser.
  if (u.pathname.startsWith("/s/")) return { ok: false, motivo: "short-link" };
  const yaEmbed = u.pathname.includes("/embed/reporting/");
  const esReporting = u.pathname.includes("/reporting/");
  if (!yaEmbed && !esReporting) return { ok: false, motivo: "no-embeddable" };
  if (!yaEmbed) u.pathname = u.pathname.replace("/reporting/", "/embed/reporting/");
  // Dominio canónico de inserción.
  u.hostname = "lookerstudio.google.com";
  return { ok: true, url: u.toString() };
}

const urlAbrir = (embedUrl: string): string =>
  embedUrl.replace("/embed/reporting/", "/reporting/");

const ALTURAS = ["Compacto", "Estándar", "Alto"] as const;
const alturaDeLabel = (l: string): number =>
  l === "Compacto" ? 480 : l === "Alto" ? 820 : 640;
const labelDeAltura = (h?: number): string =>
  h && h <= 500 ? "Compacto" : h && h >= 800 ? "Alto" : "Estándar";

export default function Conectores() {
  const [looker, setLooker] = usePersistentState<LookerEmbed[]>(
    "paid:looker",
    LOOKER_INICIAL
  );
  const [conectores, setConectores] = usePersistentState<Conector[]>(
    "paid:conectores",
    CONECTORES_INICIAL
  );
  const [plataformas] = usePersistentState<PlataformaAds[]>(
    "paid:plataformas",
    PLATAFORMAS_INICIAL
  );

  // Alta de dashboard Looker
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaUrl, setNuevaUrl] = useState("");
  const [nuevaFuente, setNuevaFuente] = useState("");
  const [errorUrl, setErrorUrl] = useState("");

  // Registro de cuenta por plataforma (fuente que alimenta Looker)
  const [conectandoId, setConectandoId] = useState<string | null>(null);
  const [cuentaTmp, setCuentaTmp] = useState("");
  const [cuentaNombreTmp, setCuentaNombreTmp] = useState("");

  // ── Acciones Looker ──
  const agregarLooker = () => {
    const titulo = nuevoTitulo.trim();
    if (!titulo) {
      setErrorUrl("Ponle un título al dashboard.");
      return;
    }
    const parsed = parseLookerUrl(nuevaUrl);
    if (!parsed.ok) {
      setErrorUrl(MENSAJE_ERROR[parsed.motivo]);
      return;
    }
    setLooker([
      ...looker,
      {
        id: uid(),
        titulo,
        url: parsed.url,
        fuente: nuevaFuente.trim() || undefined,
        altura: 640,
      },
    ]);
    setNuevoTitulo("");
    setNuevaUrl("");
    setNuevaFuente("");
    setErrorUrl("");
  };

  const actualizarLooker = (id: string, patch: Partial<LookerEmbed>) =>
    setLooker(looker.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const quitarLooker = (id: string) =>
    setLooker(looker.filter((d) => d.id !== id));

  // ── Acciones fuentes (plataformas) ──
  const actualizar = (id: string, patch: Partial<Conector>) =>
    setConectores(conectores.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const registrar = (id: string) => {
    if (!cuentaTmp.trim()) return;
    actualizar(id, {
      estado: "Conectado",
      cuenta: cuentaTmp.trim(),
      cuentaNombre: cuentaNombreTmp.trim() || undefined,
      notaError: undefined,
    });
    setConectandoId(null);
    setCuentaTmp("");
    setCuentaNombreTmp("");
  };

  const limpiarCuenta = (id: string) =>
    actualizar(id, {
      estado: "No configurado",
      cuenta: undefined,
      cuentaNombre: undefined,
      notaError: undefined,
    });

  // Solo surface conectores cuya plataforma está activa en Estrategia.
  const plataformasActivas = new Set(
    plataformas.filter((p) => p.activa).map((p) => p.nombre)
  );
  const visibles = conectores.filter((c) => {
    const enEstrategia = PLATAFORMA_EN_ESTRATEGIA[c.plataforma];
    return (
      plataformasActivas.has(enEstrategia) ||
      c.plataforma === "Google Analytics 4"
    );
  });
  // GA4 siempre visible — es analítica web, no plataforma de pauta.

  const registradas = visibles.filter((c) => c.estado === "Conectado").length;
  const conError = visibles.filter(
    (c) => c.estado === "Error" || c.estado === "Reautenticar"
  ).length;

  return (
    <div className="space-y-8">
      {/* ════════ Hero: Looker Studio ════════ */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-turquesa">
              Dashboards en vivo
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              Looker Studio
            </h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-mut">
            Looker se conecta de forma nativa a GA4, Google Ads y Meta. Arma el
            informe una vez por cliente e incrústalo aquí: datos en vivo, sin
            backend ni OAuth propio.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Dashboards en vivo"
            value={looker.length}
            accent={looker.length > 0}
          />
          <StatCard label="Fuentes en scope" value={visibles.length} />
          <StatCard
            label="Cuentas registradas"
            value={registradas}
            sub={`de ${visibles.length} fuentes`}
          />
          <StatCard label="Con alerta" value={conError} />
        </div>

        {/* Lista de dashboards */}
        {looker.length === 0 ? (
          <EmptyHint>
            Todavía no hay dashboards. En Looker Studio abre tu informe →{" "}
            <span className="text-snow">Compartir</span> →{" "}
            <span className="text-snow">Insertar informe</span> → copia el enlace
            (o el <span className="font-mono text-snow">&lt;iframe&gt;</span>{" "}
            completo) y pégalo abajo.
          </EmptyHint>
        ) : (
          <div className="space-y-5">
            {looker.map((d) => (
              <Card key={d.id} className="overflow-hidden p-0">
                <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />
                  <span className="text-sm font-medium">{d.titulo}</span>
                  {d.fuente && (
                    <span className="rounded border border-line2 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-mut">
                      {d.fuente}
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1.5">
                    <Select
                      value={labelDeAltura(d.altura)}
                      onChange={(v) =>
                        actualizarLooker(d.id, { altura: alturaDeLabel(v) })
                      }
                      options={ALTURAS}
                    />
                    <a
                      href={urlAbrir(d.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-line px-2.5 py-1 text-[10px] uppercase tracking-wider text-mut transition-colors hover:border-turquesa hover:text-turquesa"
                    >
                      Abrir ↗
                    </a>
                    <button
                      onClick={() => quitarLooker(d.id)}
                      className="rounded-md border border-line px-2 py-1 text-mut transition-colors hover:border-magenta/60 hover:text-magenta"
                      aria-label="Quitar dashboard"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <iframe
                  src={d.url}
                  title={d.titulo}
                  className="w-full border-0 bg-panel2"
                  style={{ height: d.altura ?? 640 }}
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
                />
              </Card>
            ))}
          </div>
        )}

        {/* Alta de dashboard */}
        <Card className="border-line2/60">
          <Label>Incrustar un dashboard de Looker Studio</Label>
          <div className="space-y-3">
            <TextInput
              value={nuevoTitulo}
              onChange={setNuevoTitulo}
              placeholder="Título — ej: Performance Paid · Cliente X"
            />
            <TextInput
              value={nuevaUrl}
              onChange={(v) => {
                setNuevaUrl(v);
                if (errorUrl) setErrorUrl("");
              }}
              placeholder="Enlace de “Insertar informe” o el <iframe> completo de Looker"
              className="font-mono text-xs"
            />
            <div className="flex flex-wrap items-center gap-2">
              <TextInput
                value={nuevaFuente}
                onChange={setNuevaFuente}
                placeholder="Fuente · opcional — ej: GA4 + Google Ads"
                className="min-w-48 flex-1"
              />
              <button
                onClick={agregarLooker}
                className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
              >
                Incrustar
              </button>
            </div>
            {errorUrl && <p className="text-xs text-magenta">{errorUrl}</p>}
            <div className="space-y-1 text-[10px] leading-relaxed text-dim">
              <p>
                <span className="text-mut">Importante:</span> el enlace de
                “Compartir → Copiar” <span className="text-mut">no</span> sirve
                (Google bloquea su framing). Tiene que ser el de inserción.
              </p>
              <p>
                En Looker Studio: <span className="text-mut">Compartir</span> → {""}
                <span className="text-mut">Insertar informe</span> → activa {""}
                <span className="text-mut">Habilitar inserción</span> → copia el
                enlace (tiene <span className="font-mono">/embed/reporting/</span>)
                o el <span className="font-mono">&lt;iframe&gt;</span> completo, y
                pégalo arriba.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ════════ Fuentes de datos ════════ */}
      <section className="space-y-4">
        <div>
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-mut">
            Fuentes de datos
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-mut">
            Las plataformas activas en Estrategia. Documenta qué cuenta de cada
            una alimenta tus dashboards de Looker — es la trazabilidad para el
            equipo y el cliente, no una conexión técnica.
          </p>
        </div>

        {visibles.length === 0 ? (
          <EmptyHint>
            Activa al menos una plataforma en{" "}
            <span className="text-turquesa">Estrategia → Plataformas</span> para
            registrar sus cuentas aquí.
          </EmptyHint>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibles.map((c) => {
              const registrada = c.estado === "Conectado";
              const enFormulario = conectandoId === c.id;
              const metricas = METRICAS_POR_CONECTOR[c.plataforma] ?? [];
              return (
                <Card
                  key={c.id}
                  className={
                    c.estado === "Error" || c.estado === "Reautenticar"
                      ? "border-magenta/40"
                      : registrada
                        ? "border-turquesa/40"
                        : ""
                  }
                >
                  {/* Cabecera */}
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-mono text-sm font-medium ${colorPlataforma(c.plataforma)}`}
                    >
                      {inicialLetra(c.plataforma)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {c.plataforma}
                        </span>
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${CONECTOR_ESTADO_CHIP[c.estado]}`}
                        >
                          {c.estado}
                        </span>
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-dim">
                        {c.plataforma === "Google Analytics 4"
                          ? "analítica web"
                          : "plataforma de pauta"}
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo según estado */}
                  {enFormulario ? (
                    <div className="space-y-3 rounded-md border border-line bg-panel2 p-3">
                      <div>
                        <Label>
                          {c.plataforma === "Google Analytics 4"
                            ? "Property ID"
                            : "ID de cuenta publicitaria"}
                        </Label>
                        <input
                          autoFocus
                          value={cuentaTmp}
                          onChange={(e) => setCuentaTmp(e.target.value)}
                          placeholder={
                            c.plataforma === "Meta Ads"
                              ? "act_123456789"
                              : c.plataforma === "Google Ads"
                                ? "123-456-7890"
                                : c.plataforma === "TikTok Ads"
                                  ? "7123456789012345678"
                                  : "properties/123456789"
                          }
                          className="w-full rounded-md border border-line bg-panel px-3 py-2 font-mono text-xs text-snow placeholder:text-dim transition-colors focus:border-turquesa"
                        />
                      </div>
                      <div>
                        <Label>Nombre amigable · opcional</Label>
                        <input
                          value={cuentaNombreTmp}
                          onChange={(e) => setCuentaNombreTmp(e.target.value)}
                          placeholder="Ej: Cuenta principal Cliente"
                          className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa"
                        />
                      </div>
                      <p className="text-[10px] leading-relaxed text-dim">
                        Registra la cuenta que conectaste dentro de Looker
                        Studio. Queda como documentación — no abre ninguna
                        conexión desde el tablero.
                      </p>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setConectandoId(null);
                            setCuentaTmp("");
                            setCuentaNombreTmp("");
                          }}
                          className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:border-line2 hover:text-snow"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => registrar(c.id)}
                          disabled={!cuentaTmp.trim()}
                          className="rounded-md bg-turquesa px-3 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : registrada ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-dim">
                            Cuenta
                          </div>
                          <div className="mt-0.5 font-mono text-snow">
                            {c.cuenta ?? "—"}
                          </div>
                          {c.cuentaNombre && (
                            <div className="text-[10px] text-mut">
                              {c.cuentaNombre}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-dim">
                            Estado
                          </div>
                          <Select
                            value={c.estado}
                            onChange={(v) =>
                              actualizar(c.id, { estado: v as EstadoConector })
                            }
                            options={ESTADOS_CONECTOR}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Métricas que el informe puede traer */}
                      <div>
                        <Label>Métricas disponibles en Looker</Label>
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

                      <div className="flex items-center justify-end gap-1.5 border-t border-line pt-3">
                        <button
                          onClick={() => {
                            setConectandoId(c.id);
                            setCuentaTmp(c.cuenta ?? "");
                            setCuentaNombreTmp(c.cuentaNombre ?? "");
                          }}
                          className="rounded-md border border-line px-2.5 py-1.5 text-xs text-mut transition-colors hover:border-turquesa/60 hover:text-turquesa"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => limpiarCuenta(c.id)}
                          className="rounded-md border border-line px-2.5 py-1.5 text-xs text-mut transition-colors hover:border-magenta/60 hover:text-magenta"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs leading-relaxed text-mut">
                        {c.plataforma === "Google Analytics 4"
                          ? "Conecta GA4 dentro de Looker para sumar la atribución de conversiones del sitio a tus dashboards."
                          : `Registra la cuenta de ${c.plataforma} que alimenta el informe de Looker.`}
                      </p>
                      {c.notaError && (
                        <div className="rounded-md border border-magenta/40 bg-magenta/5 p-2 text-[10px] text-magenta">
                          {c.notaError}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-dim">
                          {metricas.length} métricas disponibles vía Looker
                        </span>
                        <button
                          onClick={() => {
                            setConectandoId(c.id);
                            setCuentaTmp(c.cuenta ?? "");
                            setCuentaNombreTmp(c.cuentaNombre ?? "");
                          }}
                          className="rounded-md bg-turquesa px-3 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-85"
                        >
                          {c.estado === "Reautenticar"
                            ? "Reautenticar →"
                            : "Registrar cuenta →"}
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Nota de arquitectura */}
        <Card className="border-line2/60">
          <Label>Cómo fluye la data</Label>
          <div className="space-y-1.5 text-xs text-mut">
            <div>
              <span className="font-mono text-turquesa">Meta Ads</span> ·
              Facebook + Instagram · conector nativo de Looker
            </div>
            <div>
              <span className="font-mono text-turquesa">Google Ads</span> ·
              Search + Display + Performance Max · conector nativo de Looker
            </div>
            <div>
              <span className="font-mono text-turquesa">TikTok Ads</span> ·
              requiere conector de partner en Looker (no hay nativo de Google)
            </div>
            <div>
              <span className="font-mono text-turquesa">Google Analytics 4</span>{" "}
              · conector nativo de Looker
            </div>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-dim">
            La visualización vive en Looker Studio; cada fuente se conecta dentro
            de Looker. Google Tag Manager queda fuera de scope (es configuración,
            no fuente de métricas). La integración por API directa de cada
            plataforma es una fase futura, si el volumen de clientes la justifica.
          </p>
        </Card>
      </section>
    </div>
  );
}
