"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cerrar sidebar al cambiar de ruta (navegación móvil)
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <>
      {/* Barra superior móvil */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-[52px] items-center gap-3 border-b border-line bg-ink px-4 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
          className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] rounded-md transition-colors hover:bg-panel"
        >
          <span className="h-px w-5 bg-mut" />
          <span className="h-px w-5 bg-mut" />
          <span className="h-px w-5 bg-mut" />
        </button>
        <span className="text-base font-semibold leading-none tracking-tight">
          laCalle<span className="text-turquesa">OS</span>
        </span>
      </header>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-[52px] md:pt-0 md:pl-[264px]">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-10 md:py-10">
          {children}
        </div>
      </main>
    </>
  );
}
