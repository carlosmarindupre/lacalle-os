"use client";

import { useState } from "react";
import {
  BRAND_KIT_INICIAL,
  CATEGORIAS_RECURSO,
  COMPANIA_INICIAL,
  type BrandKit as BrandKitT,
  type CategoriaRecurso,
  type ColorMarca,
  type Compania,
  type RecursoMarca,
} from "@/lib/data";
import { usePersistentState, uid } from "@/lib/store";
import { hrefSeguro } from "@/lib/url";
import {
  Card,
  Label,
  Area,
  ListEditor,
  Select,
  EmptyHint,
  FilaContexto,
} from "@/components/ui";

const HEX_RE = /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;
const normHex = (v: string) => {
  const t = v.trim();
  if (!t) return "";
  return t.startsWith("#") ? t : `#${t}`;
};
const hexValido = (v: string) => HEX_RE.test(v.trim());

// Icono de categoría por recurso (simple, sin librería externa)
const CAT_ICON: Record<CategoriaRecurso, string> = {
  "Manual de marca": "§",
  Logos: "◆",
  Vectores: "✦",
  Tipografías: "Aa",
  Fotografía: "▣",
  Plantillas: "▤",
  Otros: "•",
};

export default function BrandKit() {
  const [kit, setKit] = usePersistentState<BrandKitT>(
    "diseno:brandkit",
    BRAND_KIT_INICIAL
  );
  const [comp] = usePersistentState<Compania>("compania", COMPANIA_INICIAL);

  // alta de recurso
  const [rTitulo, setRTitulo] = useState("");
  const [rUrl, setRUrl] = useState("");
  const [rCat, setRCat] = useState<CategoriaRecurso>("Manual de marca");

  // — colores
  const addColor = () =>
    setKit({
      ...kit,
      colores: [
        ...kit.colores,
        { id: uid(), nombre: "Nuevo color", hex: "#12d9c5", pantone: "" },
      ],
    });
  const setColor = (id: string, patch: Partial<ColorMarca>) =>
    setKit({
      ...kit,
      colores: kit.colores.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  const delColor = (id: string) =>
    setKit({ ...kit, colores: kit.colores.filter((c) => c.id !== id) });

  // — recursos
  const addRecurso = () => {
    const t = rTitulo.trim();
    const u = rUrl.trim();
    if (!t || !u) return;
    const recurso: RecursoMarca = {
      id: uid(),
      titulo: t,
      url: u,
      categoria: rCat,
    };
    setKit({ ...kit, recursos: [...kit.recursos, recurso] });
    setRTitulo("");
    setRUrl("");
  };
  const delRecurso = (id: string) =>
    setKit({ ...kit, recursos: kit.recursos.filter((r) => r.id !== id) });

  return (
    <div className="space-y-8">
      {/* Contexto conectado desde Compañía */}
      <Card className="border-turquesa/30">
        <div className="mb-3 flex items-center justify-between">
          <Label>Contexto conectado · automático</Label>
          <span className="font-mono text-[9px] uppercase tracking-wider text-turquesa">
            Compañía
          </span>
        </div>
        <div className="grid gap-x-8 md:grid-cols-2">
          <FilaContexto
            label="Propuesta de valor"
            valor={comp.propuestaValor}
            href="/compania#posicionamiento"
          />
          <FilaContexto
            label="Ventaja competitiva"
            valor={comp.ventaja}
            href="/compania#posicionamiento"
          />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-dim">
          Este Brand Kit es la fuente única de verdad de la identidad del
          cliente. Lo que definas aquí —colores, tipografías, tono visual— es lo
          que el equipo aplica al producir piezas en este módulo, en Redes y en
          Paid Media.
        </p>
      </Card>

      {/* Paleta de colores */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <Label>Paleta de colores</Label>
          <button
            onClick={addColor}
            className="rounded-md border border-line px-3 py-1 text-xs text-mut transition-colors hover:border-turquesa hover:text-turquesa"
          >
            + Color
          </button>
        </div>
        {kit.colores.length === 0 ? (
          <EmptyHint>
            Sin colores aún. Agrega los colores de marca con su HEX y, si
            aplica, su referencia Pantone.
          </EmptyHint>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {kit.colores.map((c) => {
              const hex = normHex(c.hex);
              const ok = hexValido(c.hex);
              return (
                <Card key={c.id} className="group overflow-hidden p-0">
                  <div
                    className="relative h-24 w-full"
                    style={{ background: ok ? hex : "var(--color-panel2)" }}
                  >
                    {!ok && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-dim">
                        HEX inválido
                      </div>
                    )}
                    <button
                      onClick={() => delColor(c.id)}
                      className="absolute right-1.5 top-1.5 rounded bg-ink/60 px-1.5 text-snow opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                      aria-label="Eliminar color"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-2 p-3">
                    <input
                      value={c.nombre}
                      onChange={(e) => setColor(c.id, { nombre: e.target.value })}
                      placeholder="Nombre"
                      className="w-full bg-transparent text-sm font-medium focus:text-snow"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        value={c.hex}
                        onChange={(e) => setColor(c.id, { hex: e.target.value })}
                        placeholder="#000000"
                        className="w-24 rounded border border-line bg-panel2 px-2 py-1 font-mono text-[11px] uppercase text-snow placeholder:text-dim focus:border-turquesa"
                      />
                      <input
                        value={c.pantone ?? ""}
                        onChange={(e) =>
                          setColor(c.id, { pantone: e.target.value })
                        }
                        placeholder="Pantone"
                        className="w-full rounded border border-line bg-panel2 px-2 py-1 font-mono text-[11px] text-mut placeholder:text-dim focus:border-turquesa"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Tipografías + Línea gráfica */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Label>Tipografías</Label>
          <ListEditor
            items={kit.tipografias}
            onChange={(v) => setKit({ ...kit, tipografias: v })}
            placeholder="Ej: Geist — Titulares / Inter — Cuerpo"
          />
        </Card>
        <Card>
          <Label>Línea gráfica · dirección visual</Label>
          <Area
            value={kit.lineaGrafica}
            onChange={(v) => setKit({ ...kit, lineaGrafica: v })}
            rows={6}
            placeholder="Estilo visual, uso de fotografía vs. ilustración, tratamiento de imagen, iconografía, sensación general que debe transmitir la marca…"
          />
        </Card>
      </div>

      {/* Do's / Don'ts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <Label>Sí hacer</Label>
          <ListEditor
            items={kit.dos}
            onChange={(v) => setKit({ ...kit, dos: v })}
            placeholder="Ej: Usar el logo siempre con su área de protección"
            accent="turquesa"
          />
        </Card>
        <Card>
          <Label>No hacer</Label>
          <ListEditor
            items={kit.donts}
            onChange={(v) => setKit({ ...kit, donts: v })}
            placeholder="Ej: Deformar el logo o cambiarle el color"
            accent="magenta"
          />
        </Card>
      </div>

      {/* Recursos / activos de marca (Drive) */}
      <section>
        <div className="mb-1 flex items-baseline justify-between">
          <Label>Activos de marca · archivos</Label>
          <span className="text-xs text-dim">
            {kit.recursos.length} recurso{kit.recursos.length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="mb-3 text-[11px] text-dim">
          Manual de marca, logos, vectores y plantillas. Pega uno o varios links
          de Google Drive (u otra fuente) y categorízalos.
        </p>

        {/* Alta */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-panel p-3">
          <input
            value={rTitulo}
            onChange={(e) => setRTitulo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRecurso()}
            placeholder="Nombre del recurso · Ej: Logos PNG + SVG"
            className="min-w-48 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
          />
          <input
            value={rUrl}
            onChange={(e) => setRUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRecurso()}
            placeholder="https://drive.google.com/…"
            className="min-w-56 flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
          />
          <Select
            value={rCat}
            onChange={(v) => setRCat(v as CategoriaRecurso)}
            options={CATEGORIAS_RECURSO}
          />
          <button
            onClick={addRecurso}
            className="rounded-md bg-turquesa px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-85"
          >
            Añadir
          </button>
        </div>

        {kit.recursos.length === 0 ? (
          <EmptyHint>Aún no hay activos cargados.</EmptyHint>
        ) : (
          <div className="space-y-5">
            {CATEGORIAS_RECURSO.filter((cat) =>
              kit.recursos.some((r) => r.categoria === cat)
            ).map((cat) => (
              <div key={cat}>
                <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-dim">
                  <span className="font-mono text-turquesa">{CAT_ICON[cat]}</span>
                  {cat}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {kit.recursos
                    .filter((r) => r.categoria === cat)
                    .map((r) => (
                      <div
                        key={r.id}
                        className="group flex items-center gap-3 rounded-md border border-line bg-panel2 p-3 transition-colors hover:border-line2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm text-snow">
                            {r.titulo}
                          </div>
                          <a
                            href={hrefSeguro(r.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-[11px] text-dim underline decoration-line2 transition-colors hover:text-turquesa"
                          >
                            {r.url}
                          </a>
                        </div>
                        <a
                          href={hrefSeguro(r.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded border border-line px-2 py-1 text-[11px] text-mut transition-colors hover:border-turquesa hover:text-turquesa"
                        >
                          Abrir ↗
                        </a>
                        <button
                          onClick={() => delRecurso(r.id)}
                          className="shrink-0 text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                          aria-label="Eliminar recurso"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
