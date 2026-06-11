"use client";

import Link from "next/link";
import {
  BRAND_KIT_INICIAL,
  type BrandKit as BrandKitT,
} from "@/lib/data";
import { usePersistentState } from "@/lib/store";
import { Card, Label } from "@/components/ui";

const HEX_RE = /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;
const normHex = (v: string) => (v.trim().startsWith("#") ? v.trim() : `#${v.trim()}`);

const HREF = "/servicios/diseno-y-contenidos";

// Panel de solo lectura que expone la identidad del cliente (definida en el
// Brand Kit del módulo Diseño y Contenidos) como contexto conectado en otros
// módulos que producen creatividad — Redes y Paid. Fuente única de verdad.
export default function BrandKitPanel({ nota }: { nota?: string }) {
  const [kit] = usePersistentState<BrandKitT>(
    "diseno:brandkit",
    BRAND_KIT_INICIAL
  );

  const vacio =
    kit.colores.length === 0 &&
    kit.tipografias.length === 0 &&
    !kit.lineaGrafica.trim();

  return (
    <Card className="border-turquesa/30">
      <div className="mb-3 flex items-center justify-between">
        <Label>Identidad visual · desde Brand Kit</Label>
        <Link
          href={HREF}
          className="font-mono text-[9px] uppercase tracking-wider text-turquesa transition-opacity hover:opacity-70"
        >
          Diseño →
        </Link>
      </div>

      {vacio ? (
        <p className="text-xs text-dim">
          La marca de este cliente aún no está definida.{" "}
          <Link
            href={HREF}
            className="text-dim underline decoration-line2 transition-colors hover:text-turquesa"
          >
            Definir el Brand Kit →
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {/* Paleta */}
          {kit.colores.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-[10px] uppercase tracking-wider text-dim">
                Paleta
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {kit.colores.map((c) =>
                  HEX_RE.test(c.hex.trim()) ? (
                    <span
                      key={c.id}
                      title={`${c.nombre} · ${normHex(c.hex)}${
                        c.pantone ? ` · ${c.pantone}` : ""
                      }`}
                      className="h-5 w-5 rounded border border-line2"
                      style={{ background: normHex(c.hex) }}
                    />
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Tipografías */}
          {kit.tipografias.length > 0 && (
            <div className="flex items-baseline gap-2">
              <span className="w-20 shrink-0 text-[10px] uppercase tracking-wider text-dim">
                Tipografías
              </span>
              <span className="text-xs text-snow">
                {kit.tipografias.join(" · ")}
              </span>
            </div>
          )}

          {/* Línea gráfica */}
          {kit.lineaGrafica.trim() && (
            <div className="flex items-baseline gap-2">
              <span className="w-20 shrink-0 text-[10px] uppercase tracking-wider text-dim">
                Línea
              </span>
              <span className="line-clamp-2 text-xs text-mut">
                {kit.lineaGrafica}
              </span>
            </div>
          )}

          {/* Evitar (primer don't, como recordatorio) */}
          {kit.donts.length > 0 && (
            <div className="flex items-baseline gap-2">
              <span className="w-20 shrink-0 text-[10px] uppercase tracking-wider text-dim">
                Evitar
              </span>
              <span className="text-xs text-magenta/90">{kit.donts[0]}</span>
            </div>
          )}
        </div>
      )}

      {nota && (
        <p className="mt-3 border-t border-line pt-2.5 text-[10px] leading-relaxed text-dim">
          {nota}
        </p>
      )}
    </Card>
  );
}
