"use client";

import { useState } from "react";
import { type Documento } from "@/lib/data";
import { usePersistentState, uid, hoyISO } from "@/lib/store";
import { hrefSeguro } from "@/lib/url";
import { Card, Label, EmptyHint } from "@/components/ui";

export default function Documentos() {
  const [docs, setDocs] = usePersistentState<Documento[]>(
    "asesoria:documentos",
    []
  );
  const [nombre, setNombre] = useState("");
  const [url, setUrl] = useState("");

  const agregar = () => {
    const n = nombre.trim();
    if (!n) return;
    setDocs([
      ...docs,
      { id: uid(), nombre: n, url: url.trim(), fecha: hoyISO() },
    ]);
    setNombre("");
    setUrl("");
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <Label>Documentos estratégicos</Label>
        <span className="font-mono text-[10px] text-dim">{docs.length}</span>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Nombre — ej: Plan de marketing 2026, Brief de marca…"
          className="flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Link (Drive, Notion, Figma…)"
          className="w-52 rounded-md border border-line bg-panel2 px-3 py-2 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <button
          onClick={agregar}
          className="rounded-md border border-line px-3 text-sm text-mut transition-colors hover:border-turquesa hover:text-turquesa"
        >
          +
        </button>
      </div>

      {docs.length === 0 ? (
        <EmptyHint>
          El repositorio estratégico del cliente: briefs, planes, diagnósticos y
          presentaciones — siempre a un clic, para el equipo y para el cliente.
        </EmptyHint>
      ) : (
        <ul className="space-y-1.5">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="group flex items-center gap-3 rounded-md border border-line bg-panel2 px-3 py-2"
            >
              <span className="h-1.5 w-1.5 shrink-0 bg-turquesa" />
              {doc.url ? (
                <a
                  href={hrefSeguro(doc.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-sm transition-colors hover:text-turquesa"
                >
                  {doc.nombre} ↗
                </a>
              ) : (
                <span className="flex-1 truncate text-sm">{doc.nombre}</span>
              )}
              <span className="font-mono text-[10px] text-dim">
                {doc.fecha.slice(5).split("-").reverse().join("/")}
              </span>
              <button
                onClick={() => setDocs(docs.filter((x) => x.id !== doc.id))}
                className="text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
                aria-label="Eliminar"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
