"use client";

import { useState } from "react";
import { PageHeader, Tabs } from "@/components/ui";
import Dashboards from "@/components/analitica/Dashboards";
import Fuentes from "@/components/analitica/Fuentes";
import Informes from "@/components/analitica/Informes";
import Insights from "@/components/analitica/Insights";
import KanbanTareas from "@/components/KanbanTareas";

const TABS = ["Dashboards", "Fuentes", "Informes", "Insights", "ToDo"] as const;
type Tab = (typeof TABS)[number];

export default function AnaliticaPage() {
  const [tab, setTab] = useState<Tab>("Dashboards");

  return (
    <>
      <PageHeader
        kicker="05 · Servicio"
        title="Analítica"
        desc="Dashboards en vivo, fuentes configuradas, informes entregados e insights clave del cliente."
      />
      <Tabs tabs={TABS} active={tab} onChange={(t) => setTab(t as Tab)} />
      {tab === "Dashboards" && <Dashboards />}
      {tab === "Fuentes" && <Fuentes />}
      {tab === "Informes" && <Informes />}
      {tab === "Insights" && <Insights />}
      {tab === "ToDo" && <KanbanTareas storeKey="analitica:todo" />}
    </>
  );
}
