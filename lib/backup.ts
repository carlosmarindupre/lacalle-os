import { SUPABASE_HABILITADO } from "./supabase/config";
import { getSupabase } from "./supabase/client";

const PREFIJO = "motor2026";

export type ModuloBackup = {
  id: string;
  nombre: string;
  keys: string[];
};

export const MODULOS_BACKUP: ModuloBackup[] = [
  {
    id: "compania",
    nombre: "Compañía",
    keys: ["compania"],
  },
  {
    id: "redes",
    nombre: "Redes Sociales",
    keys: [
      "redes:estrategia",
      "redes:redes",
      "redes:contenidos",
      "redes:generador",
      "redes:ideas",
      "redes:kpis",
      "redes:todo",
    ],
  },
  {
    id: "asesoria",
    nombre: "Asesoría Estratégica",
    keys: [
      "asesoria:directrices",
      "asesoria:roadmap",
      "asesoria:actas",
      "asesoria:acuerdos",
      "asesoria:documentos",
      "asesoria:todo",
    ],
  },
  {
    id: "paid",
    nombre: "Paid Media",
    keys: [
      "paid:estrategia",
      "paid:campanas",
      "paid:briefs",
      "paid:metricas",
      "paid:optimizaciones",
      "paid:plataformas",
      "paid:conectores",
      "paid:looker",
      "paid:todo",
    ],
  },
  {
    id: "diseno",
    nombre: "Diseño y Contenidos",
    keys: ["diseno:brandkit", "diseno:piezas", "diseno:todo"],
  },
  {
    id: "analitica",
    nombre: "Analítica",
    keys: [
      "analitica:looker",
      "analitica:fuentes",
      "analitica:informes",
      "analitica:insights",
      "analitica:todo",
    ],
  },
  {
    id: "web",
    nombre: "Desarrollo Web",
    keys: [
      "web:proyectos",
      "web:fases",
      "web:stack",
      "web:accesos",
      "web:todo",
    ],
  },
  {
    id: "email",
    nombre: "Email Marketing",
    keys: [
      "email:config",
      "email:campanas",
      "email:audiencias",
      "email:automatizaciones",
      "email:todo",
    ],
  },
];

export type BackupPayload = {
  version: string;
  app: string;
  exportado: string;
  clienteId: string;
  datos: Record<string, unknown>;
};

export async function exportarBackup(
  clienteId: string
): Promise<BackupPayload> {
  const datos: Record<string, unknown> = {};

  if (SUPABASE_HABILITADO) {
    const sb = getSupabase();
    const { data } = await sb
      .from("estado_tablero")
      .select("clave, valor")
      .eq("cliente_id", clienteId);

    if (data) {
      for (const row of data) {
        datos[row.clave] = row.valor;
      }
    }
  } else {
    const prefijo = `${PREFIJO}:${clienteId}:`;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(prefijo)) {
        const clave = k.slice(prefijo.length);
        try {
          datos[clave] = JSON.parse(localStorage.getItem(k) ?? "null");
        } catch {
          // skip corrupt entry
        }
      }
    }
  }

  return {
    version: "1.0",
    app: "laCalle OS",
    exportado: new Date().toISOString(),
    clienteId,
    datos,
  };
}

export async function importarBackup(
  clienteId: string,
  payload: BackupPayload
): Promise<void> {
  const { datos } = payload;

  if (SUPABASE_HABILITADO) {
    const sb = getSupabase();
    const rows = Object.entries(datos).map(([clave, valor]) => ({
      cliente_id: clienteId,
      clave,
      valor: valor as unknown,
      actualizado_en: new Date().toISOString(),
    }));
    if (rows.length > 0) {
      await sb
        .from("estado_tablero")
        .upsert(rows, { onConflict: "cliente_id,clave" });
    }
  } else {
    const prefijo = `${PREFIJO}:${clienteId}:`;
    for (const [clave, valor] of Object.entries(datos)) {
      try {
        localStorage.setItem(`${prefijo}${clave}`, JSON.stringify(valor));
      } catch {
        // storage lleno
      }
    }
  }
}

export function descargarJSON(payload: BackupPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fecha = new Date(payload.exportado)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  a.href = url;
  a.download = `lacalle-os-backup-${fecha}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function contarDatos(datos: Record<string, unknown>): number {
  return Object.values(datos).filter((v) => {
    if (Array.isArray(v)) return v.length > 0;
    if (v !== null && typeof v === "object") return Object.keys(v as object).length > 0;
    return v !== null && v !== undefined;
  }).length;
}
