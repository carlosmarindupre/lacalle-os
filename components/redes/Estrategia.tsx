"use client";

import {
  REDES_ESTRATEGIA_INICIAL,
  type RedesEstrategia,
} from "@/lib/data";
import { usePersistentState } from "@/lib/store";
import { Card, Label, Area, ListEditor } from "@/components/ui";

export default function Estrategia() {
  const [e, setE] = usePersistentState<RedesEstrategia>(
    "redes:estrategia",
    REDES_ESTRATEGIA_INICIAL
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <Label>Descripción de la estrategia</Label>
        <Area
          value={e.descripcion}
          onChange={(v) => setE({ ...e, descripcion: v })}
          rows={5}
          placeholder="Cómo las redes sociales aportan a los objetivos de negocio del cliente: enfoque, territorios de comunicación, rol de cada plataforma…"
        />
      </Card>

      <Card>
        <Label>Objetivos</Label>
        <ListEditor
          items={e.objetivos}
          onChange={(v) => setE({ ...e, objetivos: v })}
          placeholder="Ej: +20% engagement en 6 meses…"
        />
      </Card>

      <Card>
        <Label>Pilares de contenido</Label>
        <ListEditor
          items={e.pilares}
          onChange={(v) => setE({ ...e, pilares: v })}
          placeholder="Ej: Educación, producto, comunidad…"
        />
      </Card>

      <Card className="lg:col-span-2">
        <Label>Tono y estilo de comunicación</Label>
        <Area
          value={e.tono}
          onChange={(v) => setE({ ...e, tono: v })}
          rows={3}
          placeholder="Voz de la marca en redes: cercana, experta, irreverente… qué se dice y qué no se dice."
        />
      </Card>
    </div>
  );
}
