"use client";

import { useState } from "react";
import { PLATAFORMAS_EMAIL, type ConfigEmail, type PlataformaEmail } from "@/lib/data";
import { usePersistentState } from "@/lib/store";
import { hrefSeguro } from "@/lib/url";
import { Card, Label, Select, EmptyHint } from "@/components/ui";

const PLATAFORMA_COLOR: Record<PlataformaEmail, string> = {
  Mailchimp: "bg-[#FFE01B]/10 text-[#d4b800]",
  ActiveCampaign: "bg-[#356AE6]/10 text-[#6a96f0]",
  Klaviyo: "bg-[#48C774]/10 text-[#48C774]",
  HubSpot: "bg-[#FF7A59]/10 text-[#FF7A59]",
  Brevo: "bg-turquesa/10 text-turquesa",
  MailerLite: "bg-turquesa/10 text-turquesa",
  ConvertKit: "bg-[#FF4500]/10 text-[#FF7A59]",
  GetResponse: "bg-[#4A90D9]/10 text-[#6aaae8]",
  Otra: "bg-panel2 text-dim",
};

const VACIO: ConfigEmail = {
  plataforma: "Mailchimp",
  cuenta: "",
  urlPanel: "",
  urlTemplates: "",
  apiKey: "",
  notas: "",
};

export default function Plataforma() {
  const [config, setConfig] = usePersistentState<ConfigEmail | null>(
    "email:config",
    null
  );
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<ConfigEmail>(VACIO);
  const set = (k: keyof ConfigEmail, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const abrir = () => {
    setForm(config ?? VACIO);
    setEditando(true);
  };

  const guardar = () => {
    if (!form.cuenta.trim()) return;
    setConfig({
      ...form,
      urlPanel: form.urlPanel.trim(),
      urlTemplates: form.urlTemplates?.trim() || undefined,
      apiKey: form.apiKey?.trim() || undefined,
      notas: form.notas?.trim() || undefined,
    });
    setEditando(false);
  };

  // Se considera "sin configurar" tanto null como un objeto incompleto (p. ej.
  // un backup manipulado sin `plataforma`): así el render principal, que usa
  // config!.plataforma como clave de PLATAFORMA_COLOR, nunca recibe undefined.
  const configCompleta = !!config && config.plataforma in PLATAFORMA_COLOR;

  if (!configCompleta && !editando) {
    return (
      <div className="space-y-6">
        <EmptyHint>
          Sin plataforma configurada. Registra la herramienta de email marketing
          en uso para centralizar accesos y contexto.
        </EmptyHint>
        <button
          onClick={abrir}
          className="w-full rounded-md border border-dashed border-line2 px-4 py-3 text-center text-sm text-dim transition-colors hover:border-turquesa hover:text-turquesa"
        >
          + Configurar plataforma
        </button>
      </div>
    );
  }

  if (editando) {
    return (
      <Card className="border-line2/60">
        <Label>{config ? "Editar plataforma" : "Configurar plataforma"}</Label>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="min-w-44 flex-1">
              <Label>Plataforma</Label>
              <Select
                value={form.plataforma}
                onChange={(v) => set("plataforma", v)}
                options={PLATAFORMAS_EMAIL}
                className="w-full"
              />
            </div>
            <div className="min-w-56 flex-1">
              <Label>Cuenta / correo de acceso</Label>
              <input
                autoFocus
                value={form.cuenta}
                onChange={(e) => set("cuenta", e.target.value)}
                placeholder="correo@agencia.cl"
                className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="min-w-56 flex-1">
              <Label>URL del panel</Label>
              <input
                value={form.urlPanel}
                onChange={(e) => set("urlPanel", e.target.value)}
                placeholder="https://…"
                className="w-full rounded-md border border-line bg-panel2 px-3 py-2 font-mono text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
              />
            </div>
            <div className="min-w-56 flex-1">
              <Label>URL de plantillas · opcional</Label>
              <input
                value={form.urlTemplates ?? ""}
                onChange={(e) => set("urlTemplates", e.target.value)}
                placeholder="https://…"
                className="w-full rounded-md border border-line bg-panel2 px-3 py-2 font-mono text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
              />
            </div>
          </div>
          <div>
            <Label>API Key · opcional (no guardar en texto plano si es sensible)</Label>
            <input
              value={form.apiKey ?? ""}
              onChange={(e) => set("apiKey", e.target.value)}
              placeholder="Solo referencia — guarda la key real en un gestor de secretos"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 font-mono text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
            />
          </div>
          <textarea
            value={form.notas ?? ""}
            onChange={(e) => set("notas", e.target.value)}
            placeholder="Notas · opcional — plan contratado, límite de envíos, contacto de soporte…"
            rows={2}
            className="w-full resize-none rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
            <button
              onClick={() => setEditando(false)}
              className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:text-snow"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={!form.cuenta.trim()}
              className="rounded-md bg-turquesa px-4 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Guardar
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span
              className={`rounded px-2.5 py-1 text-sm font-semibold ${PLATAFORMA_COLOR[config!.plataforma]}`}
            >
              {config!.plataforma}
            </span>
            <span className="text-sm text-mut">{config!.cuenta}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {config!.urlPanel && (
              <a
                href={hrefSeguro(config!.urlPanel)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-dim transition-colors hover:text-turquesa"
              >
                <span className="font-medium text-mut">Panel</span>
                <span className="font-mono truncate max-w-xs">{config!.urlPanel}</span>
                <span>↗</span>
              </a>
            )}
            {config!.urlTemplates && (
              <a
                href={hrefSeguro(config!.urlTemplates)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-dim transition-colors hover:text-turquesa"
              >
                <span className="font-medium text-mut">Plantillas</span>
                <span className="font-mono truncate max-w-xs">{config!.urlTemplates}</span>
                <span>↗</span>
              </a>
            )}
            {config!.apiKey && (
              <div className="flex items-center gap-1.5 text-xs text-dim">
                <span className="font-medium text-mut">API Key</span>
                <span className="font-mono">
                  {config!.apiKey.slice(0, 8)}{"•".repeat(12)}
                </span>
              </div>
            )}
          </div>
          {config!.notas && (
            <p className="text-xs leading-relaxed text-mut">{config!.notas}</p>
          )}
        </div>
        <button
          onClick={abrir}
          className="shrink-0 text-[11px] text-dim transition-colors hover:text-turquesa"
        >
          Editar
        </button>
      </Card>

      <div className="rounded-md border border-line2/40 bg-panel2/40 px-4 py-3">
        <p className="text-[11px] leading-relaxed text-dim">
          Aquí se documenta la plataforma activa. Las métricas reales de campañas
          se registran en la pestaña <span className="text-mut">Campañas</span>.
          Para conectar datos en vivo, usa un iframe de Looker Studio o la API
          de la plataforma.
        </p>
      </div>
    </div>
  );
}
