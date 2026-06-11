"use client";

import { useState } from "react";
import { PageHeader, Tabs } from "@/components/ui";
import Plataforma from "@/components/email/Plataforma";
import Campanas from "@/components/email/Campanas";
import Audiencias from "@/components/email/Audiencias";
import Automatizaciones from "@/components/email/Automatizaciones";
import Calendario from "@/components/email/Calendario";
import KanbanTareas from "@/components/KanbanTareas";

const TABS = [
  "Plataforma",
  "Campañas",
  "Audiencias",
  "Automatizaciones",
  "Calendario",
  "ToDo",
] as const;
type Tab = (typeof TABS)[number];

export default function EmailMarketingPage() {
  const [tab, setTab] = useState<Tab>("Plataforma");

  return (
    <>
      <PageHeader
        kicker="07 · Servicio"
        title="Email Marketing"
        desc="Plataforma en uso, campañas con métricas, audiencias, automatizaciones y calendario de envíos."
      />
      <Tabs tabs={TABS} active={tab} onChange={(t) => setTab(t as Tab)} />
      {tab === "Plataforma" && <Plataforma />}
      {tab === "Campañas" && <Campanas />}
      {tab === "Audiencias" && <Audiencias />}
      {tab === "Automatizaciones" && <Automatizaciones />}
      {tab === "Calendario" && <Calendario />}
      {tab === "ToDo" && <KanbanTareas storeKey="email:todo" />}
    </>
  );
}
