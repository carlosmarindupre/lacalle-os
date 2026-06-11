// Registro central de servicios, estados y modelos de datos de laCalle OS.

export type Servicio = {
  slug: string;
  nombre: string;
  corto: string;
  num: string;
  desc: string;
};

export const SERVICIOS: Servicio[] = [
  {
    slug: "asesoria-estrategica",
    nombre: "Asesoría Estratégica",
    corto: "Asesoría",
    num: "01",
    desc: "Documentos de estrategia, objetivos, hoja de ruta y seguimiento de acuerdos.",
  },
  {
    slug: "redes-sociales",
    nombre: "Redes Sociales",
    corto: "RRSS",
    num: "02",
    desc: "Estrategia, calendario editorial, generación de contenidos, flujo de aprobación y KPIs.",
  },
  {
    slug: "paid-media",
    nombre: "Paid Media",
    corto: "Paid",
    num: "03",
    desc: "Campañas activas, presupuesto ejecutado vs. planificado y métricas de rendimiento.",
  },
  {
    slug: "diseno-y-contenidos",
    nombre: "Diseño y Contenidos",
    corto: "Diseño",
    num: "04",
    desc: "Solicitudes de diseño, estado de piezas y biblioteca de assets del cliente.",
  },
  {
    slug: "analitica",
    nombre: "Analítica",
    corto: "Analítica",
    num: "05",
    desc: "Dashboards de datos, reportes periódicos e insights destacados.",
  },
  {
    slug: "carteleria-digital",
    nombre: "Cartelería Digital",
    corto: "Cartelería",
    num: "06",
    desc: "Gestión de pantallas, programación de contenidos e instalaciones.",
  },
  {
    slug: "desarrollo-web",
    nombre: "Desarrollo Web",
    corto: "Web",
    num: "07",
    desc: "Proyectos web activos, backlog, estado de desarrollo y registro de bugs.",
  },
  {
    slug: "email-marketing",
    nombre: "Email Marketing y Automatizaciones",
    corto: "Email & Autom.",
    num: "08",
    desc: "Flujos activos, campañas enviadas, métricas y estado de automatizaciones.",
  },
];

// ---------------------------------------------------------------------------
// Redes Sociales

export const REDES_DISPONIBLES = [
  "Instagram",
  "Facebook",
  "TikTok",
  "LinkedIn",
  "YouTube",
  "X",
] as const;

export const ESTADOS = [
  "No iniciado",
  "En proceso",
  "Aprobado",
  "Rechazado",
  "Publicado",
] as const;

export type Estado = (typeof ESTADOS)[number];

// Metodología expert-content-planning: todo contenido tiene un objetivo en el
// viaje del seguidor (desconocido → curioso → comprometido → lead → cliente).
export const OBJETIVOS_CONTENIDO = ["Atraer", "Nutrir", "Convertir"] as const;
export type ObjetivoContenido = (typeof OBJETIVOS_CONTENIDO)[number];

export const FORMATOS = [
  "Texto",
  "Carrusel",
  "Video",
  "Stories",
  "Encuesta",
] as const;

export type Contenido = {
  id: string;
  titulo: string;
  copy?: string;
  red: string;
  vertical?: string;
  fecha?: string; // YYYY-MM-DD
  estado: Estado;
  objetivo?: ObjetivoContenido;
  formato?: string;
};

export const OBJETIVO_STYLE: Record<ObjetivoContenido, string> = {
  Atraer: "text-turquesa",
  Nutrir: "text-snow",
  Convertir: "text-magenta",
};

export type RedesEstrategia = {
  descripcion: string;
  objetivos: string[];
  pilares: string[];
  tono: string;
};

export const REDES_ESTRATEGIA_INICIAL: RedesEstrategia = {
  descripcion: "",
  objetivos: [],
  pilares: [],
  tono: "",
};

export const ESTADO_CHIP: Record<Estado, string> = {
  "No iniciado": "text-dim border-line2",
  "En proceso": "text-snow border-snow/40",
  Aprobado: "text-turquesa border-turquesa/60",
  Rechazado: "text-magenta border-magenta/60",
  Publicado: "text-ink bg-turquesa border-turquesa",
};

export const ESTADO_DOT: Record<Estado, string> = {
  "No iniciado": "bg-dim",
  "En proceso": "bg-snow",
  Aprobado: "bg-turquesa",
  Rechazado: "bg-magenta",
  Publicado: "bg-turquesa",
};

export type RedConfig = {
  red: string;
  activa: boolean;
  handle: string;
  frecuencia: string;
};

export const REDES_INICIAL: RedConfig[] = REDES_DISPONIBLES.map((red) => ({
  red,
  activa: false,
  handle: "",
  frecuencia: "",
}));

// ---------------------------------------------------------------------------
// Compañía — estructura basada en el levantamiento de diagnóstico de marca

export type FunnelEtapa = { etapa: string; valor: string };
export type PlanItem = { texto: string; done: boolean };

export type Compania = {
  nombre: string;
  industria: string;
  web: string;
  contacto: string;
  resumen: string;
  evolucion: string;
  situacion: string;
  tendencias: string;
  estructura: string;
  share: string;
  compDirecta: string[];
  compSecundaria: string[];
  compIndirecta: string[];
  perfilDemo: string;
  perfilGeo: string;
  perfilPsico: string;
  perfilConduct: string;
  tipologias: string;
  segmentos: string[];
  fortalezas: string[];
  debilidades: string[];
  oportunidades: string[];
  amenazas: string[];
  propuestaValor: string;
  difReal: string;
  difComunicada: string;
  difPercibida: string;
  ventaja: string;
  mktEstrategia: string;
  mktAcciones: string;
  mktPlataformas: string;
  campExito: string;
  campFracaso: string;
  funnel: FunnelEtapa[];
  funnelInsight: string;
  factores: string[];
  problema: string;
  estMarca: string;
  estMercado: string;
  estComercial: string;
  plan: PlanItem[];
  kpis: string[];
};

export const COMPANIA_INICIAL: Compania = {
  nombre: "",
  industria: "",
  web: "",
  contacto: "",
  resumen: "",
  evolucion: "",
  situacion: "",
  tendencias: "",
  estructura: "",
  share: "",
  compDirecta: [],
  compSecundaria: [],
  compIndirecta: [],
  perfilDemo: "",
  perfilGeo: "",
  perfilPsico: "",
  perfilConduct: "",
  tipologias: "",
  segmentos: [],
  fortalezas: [],
  debilidades: [],
  oportunidades: [],
  amenazas: [],
  propuestaValor: "",
  difReal: "",
  difComunicada: "",
  difPercibida: "",
  ventaja: "",
  mktEstrategia: "",
  mktAcciones: "",
  mktPlataformas: "",
  campExito: "",
  campFracaso: "",
  funnel: [
    { etapa: "Impresión", valor: "" },
    { etapa: "Clic", valor: "" },
    { etapa: "Sesión", valor: "" },
    { etapa: "Conversión", valor: "" },
    { etapa: "Cierre", valor: "" },
  ],
  funnelInsight: "",
  factores: ["Confianza", "Precio", "Experiencia", "Rapidez", "Recomendación"],
  problema: "",
  estMarca: "",
  estMercado: "",
  estComercial: "",
  plan: [
    { texto: "Campañas digitales (performance + branding)", done: false },
    { texto: "SEO", done: false },
    { texto: "Automatización de marketing", done: false },
    { texto: "Optimización web (UX/UI + CRO)", done: false },
    { texto: "Gestión de contenidos", done: false },
    { texto: "CRM y seguimiento comercial", done: false },
  ],
  kpis: [
    "CAC (Costo de adquisición)",
    "Tasa de conversión",
    "ROI campañas",
    "LTV",
    "Engagement",
    "Share of voice / mind",
  ],
};

export const ESTADOS_SERVICIO = [
  "Activo",
  "En setup",
  "Pausado",
  "No contratado",
] as const;

export type EstadoServicio = (typeof ESTADOS_SERVICIO)[number];

// ---------------------------------------------------------------------------
// Asesoría Estratégica

export type ResultadoClave = { id: string; texto: string; progreso: number }; // 0–100
export type Okr = { id: string; objetivo: string; resultados: ResultadoClave[] };

export type Directrices = {
  vision: string;
  foco: string;
  okrs: Okr[];
};

export const DIRECTRICES_INICIAL: Directrices = {
  vision: "",
  foco: "",
  okrs: [],
};

export const HORIZONTES = ["0–3 meses", "3–6 meses", "6–12 meses"] as const;
export type Horizonte = (typeof HORIZONTES)[number];

export const ESTADOS_INICIATIVA = [
  "Planificada",
  "En curso",
  "Completada",
  "Pausada",
] as const;
export type EstadoIniciativa = (typeof ESTADOS_INICIATIVA)[number];

export const ESTADO_INICIATIVA_CHIP: Record<EstadoIniciativa, string> = {
  Planificada: "text-dim border-line2",
  "En curso": "text-turquesa border-turquesa/60",
  Completada: "text-ink bg-turquesa border-turquesa",
  Pausada: "text-magenta border-magenta/60",
};

export type Iniciativa = {
  id: string;
  titulo: string;
  impacto?: string;
  servicioSlug?: string;
  horizonte: Horizonte;
  estado: EstadoIniciativa;
};

export const TIPOS_REUNION = [
  "Kickoff",
  "Mensual",
  "Quincenal",
  "Extraordinaria",
] as const;
export type TipoReunion = (typeof TIPOS_REUNION)[number];

export type Acta = {
  id: string;
  fecha: string; // YYYY-MM-DD
  tipo: TipoReunion;
  asistentes: string;
  temas: string;
};

export const ESTADOS_ACUERDO = ["Pendiente", "En curso", "Cumplido"] as const;
export type EstadoAcuerdo = (typeof ESTADOS_ACUERDO)[number];

export const LADOS = ["laCalle", "Cliente"] as const;
export type Lado = (typeof LADOS)[number];

export type Acuerdo = {
  id: string;
  texto: string;
  actaId?: string;
  responsable: string;
  lado: Lado;
  fechaLimite?: string; // YYYY-MM-DD
  estado: EstadoAcuerdo;
};

export const acuerdoVencido = (a: Acuerdo, hoy: string) =>
  Boolean(a.fechaLimite && a.fechaLimite < hoy && a.estado !== "Cumplido");

export type Documento = {
  id: string;
  nombre: string;
  url: string;
  fecha: string;
};

// ---------------------------------------------------------------------------
// Paid Media

export const PLATAFORMAS_ADS = [
  "Meta Ads",
  "Google Ads",
  "TikTok Ads",
  "LinkedIn Ads",
  "YouTube Ads",
] as const;

export type PlataformaAds = {
  nombre: string;
  activa: boolean;
  cuenta: string;
};

export const PLATAFORMAS_INICIAL: PlataformaAds[] = PLATAFORMAS_ADS.map(
  (nombre) => ({ nombre, activa: false, cuenta: "" })
);

export type EstrategiaPaid = {
  descripcion: string;
  objetivos: string[];
  presupuestoMensual: string;
};

export const ESTRATEGIA_PAID_INICIAL: EstrategiaPaid = {
  descripcion: "",
  objetivos: [],
  presupuestoMensual: "",
};

export const OBJETIVOS_CAMPANA = [
  "Awareness",
  "Tráfico",
  "Leads",
  "Ventas",
] as const;
export type ObjetivoCampana = (typeof OBJETIVOS_CAMPANA)[number];

export const ESTADOS_CAMPANA = [
  "Borrador",
  "Activa",
  "Pausada",
  "Finalizada",
] as const;
export type EstadoCampana = (typeof ESTADOS_CAMPANA)[number];

export const ESTADO_CAMPANA_CHIP: Record<EstadoCampana, string> = {
  Borrador: "text-dim border-line2",
  Activa: "text-turquesa border-turquesa/60",
  Pausada: "text-magenta border-magenta/60",
  Finalizada: "text-ink bg-turquesa border-turquesa",
};

export type Campana = {
  id: string;
  nombre: string;
  plataforma: string;
  objetivo: ObjetivoCampana;
  estado: EstadoCampana;
  inicio?: string;
  fin?: string;
  presupuesto?: string; // planificado
  ejecutado?: string;
};

export const ESTADOS_BRIEF = [
  "Borrador",
  "En revisión",
  "Aprobado",
  "Convertido",
] as const;
export type EstadoBrief = (typeof ESTADOS_BRIEF)[number];

export const ESTADO_BRIEF_CHIP: Record<EstadoBrief, string> = {
  Borrador: "text-dim border-line2",
  "En revisión": "text-magenta border-magenta/60",
  Aprobado: "text-turquesa border-turquesa/60",
  Convertido: "text-ink bg-turquesa border-turquesa",
};

export type BriefCampana = {
  id: string;
  nombre: string;
  estado: EstadoBrief;
  creadoEn: string; // ISO date string YYYY-MM-DD
  responsable?: string;
  // Estratégicos
  objetivoNegocio: string;
  publicoObjetivo: string;
  oferta: string;
  restricciones: string;
  // Operativos
  presupuestoEstimado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  plataformasObjetivo: string[];
  kpiPrincipal?: string;
  // Conexión a Asesoría (opcional)
  okrVinculado?: string;
  // Trazabilidad post-conversión
  campanaIdGenerada?: string;
};

export const BRIEF_VACIO: Omit<BriefCampana, "id" | "creadoEn"> = {
  nombre: "",
  estado: "Borrador",
  responsable: "",
  objetivoNegocio: "",
  publicoObjetivo: "",
  oferta: "",
  restricciones: "",
  presupuestoEstimado: "",
  fechaInicio: "",
  fechaFin: "",
  plataformasObjetivo: [],
  kpiPrincipal: "",
  okrVinculado: "",
};

// ── Conectores / integraciones de Paid Media ────────────────────────────────
// Vía actual: Looker Studio. Cada informe se conecta nativo a GA4 / Google Ads /
// Meta dentro de Looker y se incrusta vía iframe (sin backend, sin OAuth propio).
// Las cards de plataforma documentan qué cuenta alimenta cada dashboard.
// API directa (REST + OAuth por plataforma) queda como fase futura si el volumen lo justifica.

export const CONECTORES_DISPONIBLES = [
  "Meta Ads",
  "Google Ads",
  "TikTok Ads",
  "Google Analytics 4",
] as const;
export type ConectorPlataforma = (typeof CONECTORES_DISPONIBLES)[number];

export const ESTADOS_CONECTOR = [
  "No configurado",
  "Conectado",
  "Reautenticar",
  "Error",
  "Sin datos",
] as const;
export type EstadoConector = (typeof ESTADOS_CONECTOR)[number];

export const CONECTOR_ESTADO_CHIP: Record<EstadoConector, string> = {
  "No configurado": "text-dim border-line2",
  Conectado: "text-turquesa border-turquesa/60",
  Reautenticar: "text-magenta border-magenta/60",
  Error: "text-magenta border-magenta bg-magenta/10",
  "Sin datos": "text-mut border-line2",
};

export const FRECUENCIAS_SINCRO = [
  "Cada hora",
  "Cada 6 horas",
  "Diaria",
  "Manual",
] as const;
export type FrecuenciaSincro = (typeof FRECUENCIAS_SINCRO)[number];

export const METRICAS_POR_CONECTOR: Record<ConectorPlataforma, readonly string[]> = {
  "Meta Ads": [
    "Inversión",
    "Impresiones",
    "Alcance",
    "Frecuencia",
    "Clics",
    "CTR",
    "CPC",
    "Conversiones",
    "CPA",
    "ROAS",
  ],
  "Google Ads": [
    "Inversión",
    "Impresiones",
    "Clics",
    "CTR",
    "CPC",
    "Conversiones",
    "CPA",
    "ROAS",
    "Tasa de conversión",
  ],
  "TikTok Ads": [
    "Inversión",
    "Impresiones",
    "Vistas de video",
    "Clics",
    "CTR",
    "CPC",
    "Conversiones",
    "CPA",
  ],
  "Google Analytics 4": [
    "Usuarios",
    "Sesiones",
    "Tasa de conversión",
    "Conversiones",
    "Ingresos",
    "Tasa de rebote",
  ],
};

export type Conector = {
  id: string;
  plataforma: ConectorPlataforma;
  estado: EstadoConector;
  cuenta?: string;
  cuentaNombre?: string;
  ultimaSincro?: string; // ISO timestamp
  frecuencia: FrecuenciaSincro;
  notaError?: string;
  via: "Looker Studio" | "API directa" | "Manual";
};

export const CONECTORES_INICIAL: Conector[] = CONECTORES_DISPONIBLES.map(
  (plataforma) => ({
    id: `conector-${plataforma.toLowerCase().replace(/\s+/g, "-")}`,
    plataforma,
    estado: "No configurado" as EstadoConector,
    frecuencia: "Cada 6 horas" as FrecuenciaSincro,
    via: "Looker Studio" as const,
  })
);

// Dashboards de Looker Studio incrustados en la pestaña Conectores.
// Looker se conecta de forma nativa a GA4 / Google Ads / Meta; aquí solo guardamos el
// enlace "Insertar informe" normalizado a su forma /embed/reporting/.
export type LookerEmbed = {
  id: string;
  titulo: string;
  url: string; // URL de inserción normalizada (lookerstudio.google.com/embed/reporting/…)
  fuente?: string; // etiqueta libre: qué alimenta el informe (GA4 / Google Ads / Meta / Mixto)
  altura?: number; // alto del iframe en px (default 640)
};

export const LOOKER_INICIAL: LookerEmbed[] = [];

export type MetricaPlataforma = {
  inversion: string;
  impresiones: string;
  clics: string;
  conversiones: string;
  ingresos: string;
};

export const METRICA_VACIA: MetricaPlataforma = {
  inversion: "",
  impresiones: "",
  clics: "",
  conversiones: "",
  ingresos: "",
};

export const TIPOS_OPTIMIZACION = [
  "Cambio de puja",
  "Nueva creatividad",
  "Exclusión de audiencia",
  "Cambio de objetivo",
  "Aumento de presupuesto",
  "Reducción de presupuesto",
  "Pausa de campaña",
  "Otro",
] as const;
export type TipoOptimizacion = (typeof TIPOS_OPTIMIZACION)[number];

export const TIPO_OPTIMIZACION_STYLE: Record<TipoOptimizacion, string> = {
  "Cambio de puja": "text-turquesa border-turquesa/40",
  "Nueva creatividad": "text-turquesa border-turquesa/40",
  "Exclusión de audiencia": "text-turquesa border-turquesa/40",
  "Cambio de objetivo": "text-snow border-line2",
  "Aumento de presupuesto": "text-turquesa border-turquesa/40",
  "Reducción de presupuesto": "text-mut border-line2",
  "Pausa de campaña": "text-magenta border-magenta/50",
  Otro: "text-dim border-line2",
};

export type Optimizacion = {
  id: string;
  fecha: string;
  campanaId?: string;
  tipo?: TipoOptimizacion;
  descripcion: string;
  resultado: string;
};

// ---------------------------------------------------------------------------
// Diseño y Contenidos
//
// Este módulo es el motor de producción creativa de la agencia. Tiene tres
// piezas centrales:
//   1. Brand Kit — la identidad del cliente como fuente única de verdad
//      (colores, tipografías, línea gráfica, logos/vectores/manual vía Drive).
//   2. Pipeline de producción — cada pieza con su brief, estado y trazabilidad
//      de rondas de revisión y tiempos de aprobación.
//   3. Biblioteca — las piezas ya entregadas, como archivo navegable.
//
// Límite con Redes Sociales: aquí se PRODUCE el activo (brief → diseño →
// archivo final); en Redes se PUBLICA (calendario editorial, copy, aprobación
// de publicación). Una pieza "se gradúa" de Diseño hacia Redes.

// — Brand Kit ————————————————————————————————————————————————————————————————

export type ColorMarca = {
  id: string;
  nombre: string;
  hex: string;
  pantone?: string;
};

export const CATEGORIAS_RECURSO = [
  "Manual de marca",
  "Logos",
  "Vectores",
  "Tipografías",
  "Fotografía",
  "Plantillas",
  "Otros",
] as const;
export type CategoriaRecurso = (typeof CATEGORIAS_RECURSO)[number];

// Link a un recurso de marca alojado fuera de la app (típicamente Google Drive).
export type RecursoMarca = {
  id: string;
  titulo: string;
  url: string;
  categoria: CategoriaRecurso;
};

export type BrandKit = {
  colores: ColorMarca[];
  tipografias: string[]; // "Geist — Titulares", "Inter — Cuerpo", …
  lineaGrafica: string; // dirección visual / estilo
  dos: string[]; // qué sí hacer con la marca
  donts: string[]; // qué no hacer
  recursos: RecursoMarca[]; // links de Drive categorizados
};

export const BRAND_KIT_INICIAL: BrandKit = {
  colores: [],
  tipografias: [],
  lineaGrafica: "",
  dos: [],
  donts: [],
  recursos: [],
};

// — Pipeline de producción ————————————————————————————————————————————————————

export const TIPOS_PIEZA = [
  "Post / Feed",
  "Story",
  "Reel / Video",
  "Banner / Display",
  "Flyer / Afiche",
  "Key Visual",
  "Landing / Web",
  "Presentación",
  "Email",
  "Otro",
] as const;
export type TipoPieza = (typeof TIPOS_PIEZA)[number];

export const CANALES_PIEZA = [
  "Instagram",
  "Facebook",
  "TikTok",
  "LinkedIn",
  "Web",
  "Paid Media",
  "Cartelería",
  "Email",
  "Otro",
] as const;

export const ESTADOS_PIEZA = [
  "En cola",
  "En proceso",
  "Revisión interna",
  "Aprobación cliente",
  "Aprobado",
  "Entregado",
] as const;
export type EstadoPieza = (typeof ESTADOS_PIEZA)[number];

export const ESTADO_PIEZA_CHIP: Record<EstadoPieza, string> = {
  "En cola": "text-dim border-line2",
  "En proceso": "text-snow border-snow/40",
  "Revisión interna": "text-snow border-line2",
  "Aprobación cliente": "text-magenta border-magenta/60",
  Aprobado: "text-turquesa border-turquesa/60",
  Entregado: "text-ink bg-turquesa border-turquesa",
};

export const ESTADO_PIEZA_COL: Record<EstadoPieza, string> = {
  "En cola": "border-t-line2",
  "En proceso": "border-t-snow/50",
  "Revisión interna": "border-t-mut",
  "Aprobación cliente": "border-t-magenta",
  Aprobado: "border-t-turquesa/60",
  Entregado: "border-t-turquesa",
};

export type Pieza = {
  id: string;
  titulo: string;
  tipo: TipoPieza;
  canal?: string; // destino: dónde se publica/usa la pieza
  brief?: string;
  responsable?: string; // diseñador a cargo
  solicitadoPor?: string; // de qué servicio/persona viene la solicitud
  fechaSolicitud: string; // YYYY-MM-DD
  fechaEntrega?: string; // deadline comprometido
  estado: EstadoPieza;
  rondas: number; // rondas de revisión acumuladas
  archivoUrl?: string; // link al archivo final (Drive / Figma)
  aprobadaEn?: string; // fecha en que pasó a "Aprobado" (para tiempo de aprobación)
  entregadaEn?: string; // fecha real de entrega (para % a tiempo)
};

export const PIEZA_VACIA: Omit<Pieza, "id" | "fechaSolicitud"> = {
  titulo: "",
  tipo: "Post / Feed",
  canal: "",
  brief: "",
  responsable: "",
  solicitadoPor: "",
  fechaEntrega: "",
  estado: "En cola",
  rondas: 0,
};

// Tareas genéricas (kanban compartido entre módulos)
export const ESTADOS_TAREA_KANBAN = [
  "No iniciado",
  "En proceso",
  "En revisión",
  "Completado",
] as const;
export type EstadoTareaKanban = (typeof ESTADOS_TAREA_KANBAN)[number];

export type TareaKanban = {
  id: string;
  titulo: string;
  asignado?: string;
  fecha?: string;
  estado: EstadoTareaKanban;
  archivoUrl?: string; // Link a la pieza (Drive, Figma, etc.) para subir/visualizar
};
