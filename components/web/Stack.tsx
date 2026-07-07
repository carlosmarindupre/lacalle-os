"use client";

import { useState } from "react";
import {
  CATEGORIAS_STACK_WEB,
  type TecnologiaStack,
  type CategoriaStackWeb,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { hrefSeguro } from "@/lib/url";
import { Card, Label, Select, EmptyHint, StatCard } from "@/components/ui";

const CATEGORIA_COLOR: Record<CategoriaStackWeb, string> = {
  Frontend: "bg-turquesa/15 text-turquesa",
  Backend: "bg-[#4A90D9]/15 text-[#6aaae8]",
  "Base de datos": "bg-[#F5A623]/15 text-[#d4900f]",
  CMS: "bg-magenta/15 text-magenta",
  "Hosting / Infraestructura": "bg-turquesa/10 text-turquesa/80",
  Autenticación: "bg-panel2 text-mut",
  Pagos: "bg-turquesa/15 text-turquesa",
  Analytics: "bg-panel2 text-mut",
  Otro: "bg-panel2 text-dim",
};

export default function Stack() {
  const [stack, setStack] = usePersistentState<TecnologiaStack[]>(
    "web:stack",
    []
  );
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const vacio = {
    nombre: "",
    version: "",
    categoria: "Frontend" as CategoriaStackWeb,
    url: "",
    notas: "",
  };
  const [form, setForm] = useState<typeof vacio>(vacio);
  const set = (k: keyof typeof vacio, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const guardar = () => {
    if (!form.nombre.trim()) return;
    const entrada: TecnologiaStack = {
      id: editandoId ?? uid(),
      nombre: form.nombre.trim(),
      version: form.version.trim() || undefined,
      categoria: form.categoria,
      url: form.url.trim() || undefined,
      notas: form.notas.trim() || undefined,
    };
    if (editandoId) {
      setStack(stack.map((t) => (t.id === editandoId ? entrada : t)));
      setEditandoId(null);
    } else {
      setStack([...stack, entrada]);
    }
    setForm(vacio);
    setAbierto(false);
  };

  const editar = (t: TecnologiaStack) => {
    setForm({
      nombre: t.nombre,
      version: t.version ?? "",
      categoria: t.categoria,
      url: t.url ?? "",
      notas: t.notas ?? "",
    });
    setEditandoId(t.id);
    setAbierto(true);
  };

  const quitar = (id: string) => {
    if (!confirm("¿Eliminar esta tecnología del stack?")) return;
    setStack(stack.filter((t) => t.id !== id));
  };

  const cancelar = () => {
    setForm(vacio);
    setEditandoId(null);
    setAbierto(false);
  };

  // Agrupar por categoría
  const categorias = CATEGORIAS_STACK_WEB.filter((c) =>
    stack.some((t) => t.categoria === c)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Tecnologías en uso"
          value={stack.length}
          accent={stack.length > 0}
        />
        <StatCard
          label="Frontend"
          value={stack.filter((t) => t.categoria === "Frontend").length}
        />
        <StatCard
          label="Backend"
          value={stack.filter((t) => t.categoria === "Backend").length}
        />
        <StatCard
          label="Infraestructura"
          value={
            stack.filter((t) => t.categoria === "Hosting / Infraestructura")
              .length
          }
        />
      </div>

      {stack.length === 0 && !abierto ? (
        <EmptyHint>
          Sin tecnologías documentadas. Agrega el stack del proyecto para
          mantener un registro claro de qué se usa y cómo.
        </EmptyHint>
      ) : (
        <div className="space-y-6">
          {categorias.map((cat) => {
            const items = stack.filter((t) => t.categoria === cat);
            return (
              <div key={cat}>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${CATEGORIA_COLOR[cat]}`}
                  >
                    {cat}
                  </span>
                  <span className="font-mono text-[10px] text-dim">
                    {items.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((t) => (
                    <Card key={t.id} className="flex flex-col gap-2 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium text-snow">
                              {t.nombre}
                            </span>
                            {t.version && (
                              <span className="font-mono text-[10px] text-dim">
                                v{t.version}
                              </span>
                            )}
                          </div>
                          {t.notas && (
                            <p className="mt-0.5 text-[11px] leading-relaxed text-mut">
                              {t.notas}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            onClick={() => editar(t)}
                            className="text-[10px] text-dim hover:text-turquesa"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => quitar(t.id)}
                            className="text-[10px] text-dim hover:text-magenta"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      {t.url && (
                        <a
                          href={hrefSeguro(t.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-dim transition-colors hover:text-turquesa"
                        >
                          Documentación ↗
                        </a>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!abierto ? (
        <button
          onClick={() => setAbierto(true)}
          className="w-full rounded-md border border-dashed border-line2 px-4 py-3 text-center text-sm text-dim transition-colors hover:border-turquesa hover:text-turquesa"
        >
          + Agregar tecnología al stack
        </button>
      ) : (
        <Card className="border-line2/60">
          <Label>
            {editandoId ? "Editar tecnología" : "Agregar al stack"}
          </Label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <input
                autoFocus
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="Nombre — ej: Next.js, Supabase, Tailwind CSS…"
                className="min-w-40 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
              />
              <input
                value={form.version}
                onChange={(e) => set("version", e.target.value)}
                placeholder="Versión · opcional"
                className="w-32 rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="min-w-44 flex-1">
                <Label>Categoría</Label>
                <Select
                  value={form.categoria}
                  onChange={(v) => set("categoria", v)}
                  options={CATEGORIAS_STACK_WEB}
                  className="w-full"
                />
              </div>
              <div className="min-w-64 flex-1">
                <Label>URL de documentación · opcional</Label>
                <input
                  value={form.url}
                  onChange={(e) => set("url", e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
                />
              </div>
            </div>
            <input
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              placeholder="Notas · opcional — para qué se usa, contexto, limitaciones…"
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa focus:outline-none"
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
