"use client";

import { useState } from "react";
import { PageHeader, Tabs } from "@/components/ui";
import Estrategia from "@/components/redes/Estrategia";
import Redes from "@/components/redes/Redes";
import Calendario from "@/components/redes/Calendario";
import Generador from "@/components/redes/Generador";
import Todo from "@/components/redes/Todo";
import Kpis from "@/components/redes/Kpis";

const TABS = [
  "Estrategia",
  "Redes",
  "Calendario",
  "Generador",
  "ToDo",
  "KPIs",
] as const;

export default function RedesSocialesPage() {
  const [tab, setTab] = useState<string>("Estrategia");

  return (
    <>
      <PageHeader
        kicker="Servicio 02"
        title="Redes Sociales"
        desc="Estrategia de social media, calendario editorial, generación de contenidos, flujo de aprobación y KPIs."
      />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "Estrategia" && <Estrategia />}
      {tab === "Redes" && <Redes />}
      {tab === "Calendario" && <Calendario />}
      {tab === "Generador" && <Generador />}
      {tab === "ToDo" && <Todo />}
      {tab === "KPIs" && <Kpis />}
    </>
  );
}
