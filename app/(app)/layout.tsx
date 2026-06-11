import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";

// Marco de la app autenticada: sidebar + proveedores + contenedor principal.
// Vive en el grupo (app) para que /login quede fuera de este marco.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Sidebar />
      <main className="pl-[264px]">
        <div className="mx-auto max-w-6xl px-10 py-10">{children}</div>
      </main>
    </Providers>
  );
}
