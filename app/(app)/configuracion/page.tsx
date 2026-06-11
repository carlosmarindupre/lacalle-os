"use client";

import { useRef, useState } from "react";
import {
  MODULOS_BACKUP,
  exportarBackup,
  importarBackup,
  descargarJSON,
  contarDatos,
  type BackupPayload,
} from "@/lib/backup";
import { useClienteActivo } from "@/lib/cliente-context";
import { PageHeader, Card, Label } from "@/components/ui";

type EstadoImport =
  | { tipo: "idle" }
  | { tipo: "leyendo" }
  | { tipo: "preview"; payload: BackupPayload }
  | { tipo: "importando" }
  | { tipo: "ok"; keys: number }
  | { tipo: "error"; msg: string };

export default function ConfiguracionPage() {
  const { clienteId } = useClienteActivo();
  const [exportando, setExportando] = useState(false);
  const [ultimoExport, setUltimoExport] = useState<string | null>(null);
  const [estadoImport, setEstadoImport] = useState<EstadoImport>({
    tipo: "idle",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── EXPORT ─────────────────────────────────────────────────────────── */
  const exportar = async () => {
    if (!clienteId) return;
    setExportando(true);
    try {
      const payload = await exportarBackup(clienteId);
      descargarJSON(payload);
      setUltimoExport(new Date().toLocaleString("es-CL"));
    } catch (e) {
      alert("Error al exportar: " + String(e));
    } finally {
      setExportando(false);
    }
  };

  /* ── IMPORT ─────────────────────────────────────────────────────────── */
  const leerArchivo = (file: File) => {
    setEstadoImport({ tipo: "leyendo" });
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target?.result as string) as BackupPayload;
        if (!payload.datos || !payload.exportado) throw new Error("Archivo inválido");
        setEstadoImport({ tipo: "preview", payload });
      } catch {
        setEstadoImport({ tipo: "error", msg: "El archivo no es un backup válido de laCalle OS." });
      }
    };
    reader.readAsText(file);
  };

  const confirmarImport = async (payload: BackupPayload) => {
    if (!clienteId) return;
    setEstadoImport({ tipo: "importando" });
    try {
      await importarBackup(clienteId, payload);
      const keys = Object.keys(payload.datos).length;
      setEstadoImport({ tipo: "ok", keys });
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setEstadoImport({ tipo: "error", msg: String(e) });
    }
  };

  const cancelarImport = () => {
    setEstadoImport({ tipo: "idle" });
    if (fileRef.current) fileRef.current.value = "";
  };

  const preview =
    estadoImport.tipo === "preview" ? estadoImport.payload : null;

  return (
    <div className="space-y-10">
      <PageHeader
        kicker="Sistema"
        title="Configuración"
        desc="Exporta e importa el estado completo del tablero. El backup incluye todos los módulos del cliente activo."
      />

      {/* ── EXPORT ─────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-snow">Exportar backup</h2>
          <p className="mt-0.5 text-xs text-mut">
            Descarga un archivo <span className="font-mono">.json</span> con
            toda la información del cliente activo. Guárdalo en un lugar seguro.
          </p>
        </div>

        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-snow">Backup completo — todos los módulos</p>
            <p className="text-[11px] text-dim">
              {MODULOS_BACKUP.reduce((n, m) => n + m.keys.length, 0)} secciones ·{" "}
              {MODULOS_BACKUP.length} módulos
            </p>
            {ultimoExport && (
              <p className="text-[10px] text-turquesa">
                Último export: {ultimoExport}
              </p>
            )}
          </div>
          <button
            onClick={exportar}
            disabled={exportando || !clienteId}
            className="shrink-0 rounded-md bg-turquesa px-5 py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exportando ? "Exportando…" : "Descargar backup"}
          </button>
        </Card>

        {/* Mapa de módulos */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {MODULOS_BACKUP.map((m) => (
            <div
              key={m.id}
              className="rounded-md border border-line bg-panel2/40 px-3 py-2.5"
            >
              <p className="text-xs font-medium text-snow">{m.nombre}</p>
              <p className="mt-0.5 font-mono text-[10px] text-dim">
                {m.keys.length} sección{m.keys.length > 1 ? "es" : ""}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-line" />

      {/* ── IMPORT ─────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-snow">Importar backup</h2>
          <p className="mt-0.5 text-xs text-mut">
            Restaura el estado del tablero desde un archivo de backup. Los
            datos existentes se sobrescriben con los del archivo.
          </p>
        </div>

        {estadoImport.tipo === "idle" || estadoImport.tipo === "leyendo" ? (
          <div
            className="cursor-pointer rounded-lg border border-dashed border-line2 bg-panel p-5 transition-colors hover:border-turquesa/60"
            onClick={() => fileRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <div className="text-2xl text-dim">↑</div>
              <p className="text-sm text-mut">
                {estadoImport.tipo === "leyendo"
                  ? "Leyendo archivo…"
                  : "Haz clic para seleccionar un archivo de backup"}
              </p>
              <p className="font-mono text-[10px] text-dim">
                lacalle-os-backup-*.json
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) leerArchivo(f);
              }}
            />
          </div>
        ) : estadoImport.tipo === "preview" && preview ? (
          <Card className="space-y-4 border-[#4A90D9]/30">
            <div>
              <Label>Archivo seleccionado</Label>
              <div className="mt-1 space-y-1 text-xs text-mut">
                <p>
                  Exportado el{" "}
                  <span className="text-snow">
                    {new Date(preview.exportado).toLocaleString("es-CL")}
                  </span>
                </p>
                <p>
                  Cliente ID:{" "}
                  <span className="font-mono text-snow">{preview.clienteId}</span>
                </p>
                <p>
                  Secciones con datos:{" "}
                  <span className="text-snow">
                    {contarDatos(preview.datos)} de{" "}
                    {Object.keys(preview.datos).length}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {MODULOS_BACKUP.map((m) => {
                const tieneData = m.keys.some((k) => {
                  const v = preview.datos[k];
                  if (Array.isArray(v)) return v.length > 0;
                  if (v && typeof v === "object") return Object.keys(v).length > 0;
                  return v != null;
                });
                return (
                  <div
                    key={m.id}
                    className={`rounded border px-2.5 py-1.5 text-[11px] ${
                      tieneData
                        ? "border-turquesa/30 text-snow"
                        : "border-line2 text-dim"
                    }`}
                  >
                    <span
                      className={`mr-1.5 ${tieneData ? "text-turquesa" : "text-dim"}`}
                    >
                      {tieneData ? "✓" : "·"}
                    </span>
                    {m.nombre}
                  </div>
                );
              })}
            </div>

            <div className="rounded-md bg-magenta/10 px-3 py-2.5">
              <p className="text-xs text-magenta">
                Los datos actuales del cliente activo serán reemplazados. Esta
                acción no se puede deshacer — exporta un backup antes si quieres
                conservar el estado actual.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
              <button
                onClick={cancelarImport}
                className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:text-snow"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmarImport(preview)}
                className="rounded-md bg-turquesa px-4 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-85"
              >
                Restaurar datos
              </button>
            </div>
          </Card>
        ) : estadoImport.tipo === "importando" ? (
          <Card className="py-6 text-center text-sm text-mut">
            Importando datos…
          </Card>
        ) : estadoImport.tipo === "ok" ? (
          <Card className="space-y-3 border-turquesa/30">
            <div className="flex items-center gap-2.5">
              <span className="text-turquesa">✓</span>
              <p className="text-sm text-snow">
                Backup restaurado correctamente —{" "}
                {estadoImport.tipo === "ok" ? estadoImport.keys : 0} secciones
                importadas.
              </p>
            </div>
            <p className="text-xs text-mut">
              Recarga la página para ver los datos actualizados en todos los módulos.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-turquesa px-4 py-1.5 text-xs font-medium text-ink transition-opacity hover:opacity-85"
              >
                Recargar página
              </button>
              <button
                onClick={cancelarImport}
                className="rounded-md border border-line px-3 py-1.5 text-xs text-mut transition-colors hover:text-snow"
              >
                Importar otro
              </button>
            </div>
          </Card>
        ) : estadoImport.tipo === "error" ? (
          <Card className="border-magenta/30">
            <p className="text-sm text-magenta">
              Error: {estadoImport.msg}
            </p>
            <button
              onClick={cancelarImport}
              className="mt-3 text-xs text-dim hover:text-snow"
            >
              Intentar de nuevo
            </button>
          </Card>
        ) : null}
      </section>

      <div className="border-t border-line" />

      {/* ── INFO ────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-snow">Sobre laCalle OS</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Versión", "1.0.0"],
            ["Stack", "Next.js 16 · React 19 · Tailwind 4 · TypeScript"],
            ["Base de datos", "Supabase PostgreSQL + Auth + RLS"],
            ["Módulos", `${MODULOS_BACKUP.length} servicios + Dashboard + Compañía`],
            ["Persistencia", "Supabase en producción · localStorage en desarrollo"],
            ["Deploy", "Vercel (lacalle-os-v2.vercel.app)"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md border border-line bg-panel2/40 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-dim">{k}</p>
              <p className="mt-0.5 text-xs text-mut">{v}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
