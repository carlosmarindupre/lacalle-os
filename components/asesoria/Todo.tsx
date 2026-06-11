"use client";

import KanbanTareas from "@/components/KanbanTareas";

export default function Todo() {
  return (
    <KanbanTareas
      storeKey="asesoria:todo"
      placeholder="Nueva tarea de asesoría…"
    />
  );
}
