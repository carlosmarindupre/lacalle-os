"use client";

import { useState } from "react";
import { PageHeader, Tabs } from "@/components/ui";
import BrandKit from "@/components/diseno/BrandKit";
import Solicitudes from "@/components/diseno/Solicitudes";
import Calendario from "@/components/diseno/Calendario";
import Biblioteca from "@/components/diseno/Biblioteca";
import Kpis from "@/components/diseno/Kpis";
import KanbanTareas from "@/components/KanbanTareas";

const TABS = [
  "Brand Kit",
  "Solicitudes",
  "Calendario",
  "Biblioteca",
  "KPIs",
  "ToDo",
] as const;

export default function DisenoContenidosPage() {
  const [tab, setTab] = useState<string>("Brand Kit");

  return (
    <>
      <PageHeader
        kicker="Servicio 04"
        title="Diseño y Contenidos"
        desc="Brand Kit del cliente como fuente única de verdad, pipeline de producción con control de aprobaciones, calendario de entregas y biblioteca de piezas."
      />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "Brand Kit" && <BrandKit />}
      {tab === "Solicitudes" && <Solicitudes />}
      {tab === "Calendario" && <Calendario />}
      {tab === "Biblioteca" && <Biblioteca />}
      {tab === "KPIs" && <Kpis />}
      {tab === "ToDo" && (
        <KanbanTareas
          storeKey="diseno:todo"
          placeholder="Nueva tarea interna de diseño…"
        />
      )}
    </>
  );
}
