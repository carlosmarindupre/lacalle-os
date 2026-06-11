"use client";

import { useState } from "react";
import { PageHeader, Tabs } from "@/components/ui";
import Estrategia from "@/components/paid/Estrategia";
import Conectores from "@/components/paid/Conectores";
import Briefs from "@/components/paid/Briefs";
import Campanas from "@/components/paid/Campanas";
import Metricas from "@/components/paid/Metricas";
import Optimizaciones from "@/components/paid/Optimizaciones";
import KanbanTareas from "@/components/KanbanTareas";

const TABS = [
  "Estrategia",
  "Conectores",
  "Brief",
  "Campañas",
  "Métricas",
  "Optimizaciones",
  "ToDo",
] as const;

export default function PaidMediaPage() {
  const [tab, setTab] = useState<string>("Estrategia");

  return (
    <>
      <PageHeader
        kicker="Servicio 03"
        title="Paid Media"
        desc="Estrategia de inversión, campañas con control de presupuesto, métricas de rendimiento y bitácora de optimizaciones."
      />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "Estrategia" && <Estrategia />}
      {tab === "Conectores" && <Conectores />}
      {tab === "Brief" && <Briefs />}
      {tab === "Campañas" && <Campanas />}
      {tab === "Métricas" && <Metricas />}
      {tab === "Optimizaciones" && <Optimizaciones />}
      {tab === "ToDo" && (
        <KanbanTareas
          storeKey="paid:todo"
          placeholder="Nueva tarea de paid media…"
        />
      )}
    </>
  );
}
