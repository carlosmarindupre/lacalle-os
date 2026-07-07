// Saneamiento de URLs provistas por el usuario antes de usarlas como href.
//
// Las URLs se guardan en el tablero (compartido por el equipo vía Supabase) y
// se importan desde archivos de backup. Un valor como `javascript:…` o
// `data:text/html,…` renderizado en `<a href>` ejecuta código en el origen de
// la app al hacer clic (XSS almacenado). Este helper solo deja pasar esquemas
// de navegación seguros; cualquier otra cosa devuelve undefined, y React omite
// el atributo href (el enlace deja de navegar en lugar de ejecutar el payload).

const ESQUEMAS_SEGUROS = new Set(["http:", "https:", "mailto:", "tel:"]);

export function hrefSeguro(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  const t = url.trim();
  if (!t) return undefined;

  // Rutas relativas y anclas internas son seguras tal cual.
  if (
    t.startsWith("/") ||
    t.startsWith("#") ||
    t.startsWith("./") ||
    t.startsWith("../")
  ) {
    return t;
  }

  const parse = (candidata: string): URL | null => {
    try {
      return new URL(candidata);
    } catch {
      return null;
    }
  };

  // Un dominio pegado sin esquema (p. ej. "figma.com/x") se asume https.
  const u = parse(t) ?? parse(`https://${t}`);
  if (!u) return undefined;

  if (ESQUEMAS_SEGUROS.has(u.protocol.toLowerCase())) return u.toString();
  return undefined;
}
