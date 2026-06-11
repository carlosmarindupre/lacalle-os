"use client";

import { useState } from "react";
import { PageHeader, Tabs } from "@/components/ui";
import Directrices from "@/components/asesoria/Directrices";
import Roadmap from "@/components/asesoria/Roadmap";
import Reuniones from "@/components/asesoria/Reuniones";
import Acuerdos from "@/components/asesoria/Acuerdos";
import Todo from "@/components/asesoria/Todo";
import Documentos from "@/components/asesoria/Documentos";

const TABS = [
  "Directrices",
  "Hoja de Ruta",
  "Reuniones",
  "Acuerdos",
  "ToDo",
  "Documentos",
] as const;

export default function AsesoriaEstrategicaPage() {
  const [tab, setTab] = useState<string>("Directrices");

  return (
    <>
      <PageHeader
        kicker="Servicio 01"
        title="Asesoría Estratégica"
        desc="Directrices estratégicas, hoja de ruta, gobernanza de reuniones y seguimiento de acuerdos — el módulo que convierte el diagnóstico de Compañía en dirección."
      />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "Directrices" && <Directrices />}
      {tab === "Hoja de Ruta" && <Roadmap />}
      {tab === "Reuniones" && <Reuniones />}
      {tab === "Acuerdos" && <Acuerdos />}
      {tab === "ToDo" && <Todo />}
      {tab === "Documentos" && <Documentos />}
    </>
  );
}
