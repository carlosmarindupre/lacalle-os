import { notFound } from "next/navigation";
import { SERVICIOS } from "@/lib/data";
import GenericModule from "@/components/GenericModule";

// Servicios con módulo propio (ruta estática); el resto usa el módulo base
const MODULOS_PROPIOS = [
  "redes-sociales",
  "asesoria-estrategica",
  "paid-media",
  "diseno-y-contenidos",
  "analitica",
  "desarrollo-web",
  "email-marketing",
];

export function generateStaticParams() {
  return SERVICIOS.filter((s) => !MODULOS_PROPIOS.includes(s.slug)).map(
    (s) => ({ slug: s.slug })
  );
}

export default async function ServicioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const servicio = SERVICIOS.find((s) => s.slug === slug);
  if (!servicio) notFound();
  return <GenericModule servicio={servicio} />;
}
