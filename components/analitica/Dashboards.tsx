"use client";

import { useState } from "react";
import {
  parseLookerUrl,
  urlAbrirLooker,
  esUrlLookerEmbed,
  LOOKER_ALTURAS,
  alturaDeLabel,
  labelDeAltura,
  MENSAJE_ERROR_LOOKER,
} from "@/lib/looker";
import { usePersistentState, uid } from "@/lib/store";
import { hrefSeguro } from "@/lib/url";
import { Card, Label, Select, EmptyHint, TextInput } from "@/components/ui";
import { LOOKER_INICIAL, type LookerEmbed } from "@/lib/data";

export default function Dashboards() {
  const [looker, setLooker] = usePersistentState<LookerEmbed[]>(
    "analitica:looker",
    LOOKER_INICIAL
  );

  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaUrl, setNuevaUrl] = useState("");
  const [nuevaFuente, setNuevaFuente] = useState("");
  const [errorUrl, setErrorUrl] = useState("");

  const agregar = () => {
    const titulo = nuevoTitulo.trim();
    if (!titulo) {
      setErrorUrl("Ponle un título al dashboard.");
      return;
    }
    const parsed = parseLookerUrl(nuevaUrl);
    if (!parsed.ok) {
      setErrorUrl(MENSAJE_ERROR_LOOKER[parsed.motivo]);
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

  const actualizar = (id: string, patch: Partial<LookerEmbed>) =>
    setLooker(looker.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const quitar = (id: string) =>
    setLooker(looker.filter((d) => d.id !== id));

  return (
    <div className="space-y-6">
      {looker.length === 0 ? (
        <EmptyHint>
          Sin dashboards todavía. En Looker Studio abre tu informe →{" "}
          <span className="text-snow">Compartir</span> →{" "}
          <span className="text-snow">Insertar informe</span> → copia el enlace
          y agrégalo abajo.
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
                      actualizar(d.id, { altura: alturaDeLabel(v) })
                    }
                    options={LOOKER_ALTURAS}
                  />
                  <a
                    href={hrefSeguro(urlAbrirLooker(d.url))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-line px-2.5 py-1 text-[10px] uppercase tracking-wider text-mut transition-colors hover:border-turquesa hover:text-turquesa"
                  >
                    Abrir ↗
                  </a>
                  <button
                    onClick={() => quitar(d.id)}
                    className="rounded-md border border-line px-2 py-1 text-mut transition-colors hover:border-magenta/60 hover:text-magenta"
                    aria-label="Quitar dashboard"
                  >
                    ×
                  </button>
                </div>
              </div>
              {esUrlLookerEmbed(d.url) ? (
                <iframe
                  src={d.url}
                  title={d.titulo}
                  className="w-full border-0 bg-panel2"
                  style={{ height: d.altura ?? 640 }}
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
                />
              ) : (
                <div className="px-4 py-8 text-center text-xs text-magenta">
                  Enlace de Looker inválido — vuelve a incrustar el dashboard.
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Card className="border-line2/60">
        <Label>Incrustar un dashboard de Looker Studio</Label>
        <div className="space-y-3">
          <TextInput
            value={nuevoTitulo}
            onChange={setNuevoTitulo}
            placeholder="Título — ej: GA4 + Search Console · Cliente"
          />
          <TextInput
            value={nuevaUrl}
            onChange={(v) => {
              setNuevaUrl(v);
              if (errorUrl) setErrorUrl("");
            }}
            placeholder='Enlace de "Insertar informe" o el <iframe> completo de Looker'
            className="font-mono text-xs"
          />
          <div className="flex flex-wrap items-center gap-2">
            <TextInput
              value={nuevaFuente}
              onChange={setNuevaFuente}
              placeholder="Fuente · opcional — ej: GA4 + Search Console"
              className="min-w-48 flex-1"
            />
            <button
              onClick={agregar}
              className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
            >
              Incrustar
            </button>
          </div>
          {errorUrl && <p className="text-xs text-magenta">{errorUrl}</p>}
          <div className="space-y-1 text-[10px] leading-relaxed text-dim">
            <p>
              <span className="text-mut">Importante:</span> usar el enlace de
              inserción, no el de compartir normal. En Looker Studio:{" "}
              <span className="text-mut">Compartir</span> →{" "}
              <span className="text-mut">Insertar informe</span> → activa{" "}
              <span className="text-mut">Habilitar inserción</span> → copia la
              URL con{" "}
              <span className="font-mono">/embed/reporting/</span> o el{" "}
              <span className="font-mono">&lt;iframe&gt;</span> completo.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
