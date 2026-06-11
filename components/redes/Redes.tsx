"use client";

import { REDES_INICIAL, type RedConfig } from "@/lib/data";
import { usePersistentState } from "@/lib/store";
import { Card, Label, TextInput, Toggle } from "@/components/ui";

export default function Redes() {
  const [redes, setRedes] = usePersistentState<RedConfig[]>(
    "redes:redes",
    REDES_INICIAL
  );

  const update = (i: number, patch: Partial<RedConfig>) => {
    const next = [...redes];
    next[i] = { ...next[i], ...patch };
    setRedes(next);
  };

  const activas = redes.filter((r) => r.activa).length;

  return (
    <>
      <p className="mb-6 text-sm text-mut">
        Plataformas donde la marca tiene presencia activa.{" "}
        <span className="text-turquesa">{activas}</span> de {redes.length}{" "}
        activadas — el calendario, el generador y los KPIs trabajan sobre las
        redes activas.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {redes.map((r, i) => (
          <Card
            key={r.red}
            className={`transition-colors ${
              r.activa ? "border-turquesa/40" : "opacity-70"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">{r.red}</span>
              <Toggle
                checked={r.activa}
                onChange={(v) => update(i, { activa: v })}
              />
            </div>
            <div className="space-y-3">
              <div>
                <Label>Cuenta / Handle</Label>
                <TextInput
                  value={r.handle}
                  onChange={(v) => update(i, { handle: v })}
                  placeholder="@marca"
                />
              </div>
              <div>
                <Label>Frecuencia</Label>
                <TextInput
                  value={r.frecuencia}
                  onChange={(v) => update(i, { frecuencia: v })}
                  placeholder="Ej: 3 posts / semana"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
