// Utilidades compartidas para incrustar dashboards de Looker Studio.
// Solo la URL /embed/reporting/ carga dentro de un iframe; el visor normal
// y los enlaces cortos /s/ los bloquea Google con X-Frame-Options.

type MotivoError = "vacio" | "no-looker" | "short-link" | "no-embeddable";
export type LookerParse =
  | { ok: true; url: string }
  | { ok: false; motivo: MotivoError };

export const MENSAJE_ERROR_LOOKER: Record<MotivoError, string> = {
  vacio: "Pega el enlace de inserción de Looker (Compartir → Insertar informe).",
  "no-looker":
    'Ese enlace no parece de Looker Studio. Pega el de "Insertar informe" o el <iframe> completo.',
  "short-link":
    "Pegaste un enlace corto (/s/…). En Looker: Compartir → Insertar informe → activa la inserción y copia el enlace con /embed/reporting/ (o el <iframe> completo).",
  "no-embeddable":
    'El enlace de "ver" no se puede incrustar. En Looker: Compartir → Insertar informe → copia la URL /embed/reporting/ o el <iframe> completo.',
};

export function parseLookerUrl(input: string): LookerParse {
  const t = input.trim();
  if (!t) return { ok: false, motivo: "vacio" };
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
  if (u.pathname.startsWith("/s/")) return { ok: false, motivo: "short-link" };
  const yaEmbed = u.pathname.includes("/embed/reporting/");
  const esReporting = u.pathname.includes("/reporting/");
  if (!yaEmbed && !esReporting) return { ok: false, motivo: "no-embeddable" };
  if (!yaEmbed)
    u.pathname = u.pathname.replace("/reporting/", "/embed/reporting/");
  u.hostname = "lookerstudio.google.com";
  return { ok: true, url: u.toString() };
}

export const urlAbrirLooker = (embedUrl: string): string =>
  embedUrl.replace("/embed/reporting/", "/reporting/");

export const LOOKER_ALTURAS = ["Compacto", "Estándar", "Alto"] as const;

export const alturaDeLabel = (l: string): number =>
  l === "Compacto" ? 480 : l === "Alto" ? 820 : 640;

export const labelDeAltura = (h?: number): string =>
  h && h <= 500 ? "Compacto" : h && h >= 800 ? "Alto" : "Estándar";
