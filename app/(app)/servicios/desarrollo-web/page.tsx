"use client";

import { useState } from "react";
import { PageHeader, Tabs } from "@/components/ui";
import Proyectos from "@/components/web/Proyectos";
import Fases from "@/components/web/Fases";
import Stack from "@/components/web/Stack";
import Accesos from "@/components/web/Accesos";
import KanbanTareas from "@/components/KanbanTareas";

const TABS = ["Proyectos", "Fases", "Stack", "Accesos", "ToDo"] as const;
type Tab = (typeof TABS)[number];

export default function DesarrolloWebPage() {
  const [tab, setTab] = useState<Tab>("Proyectos");

  return (
    <>
      <PageHeader
        kicker="06 · Servicio"
        title="Desarrollo Web"
        desc="Proyectos activos, fases de desarrollo, stack tecnológico y accesos a entornos."
      />
      <Tabs tabs={TABS} active={tab} onChange={(t) => setTab(t as Tab)} />
      {tab === "Proyectos" && <Proyectos />}
      {tab === "Fases" && <Fases />}
      {tab === "Stack" && <Stack />}
      {tab === "Accesos" && <Accesos />}
      {tab === "ToDo" && <KanbanTareas storeKey="web:todo" />}
    </>
  );
}
