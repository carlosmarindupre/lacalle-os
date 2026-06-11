# laCalle OS — Documentación por Módulo

---

## Dashboard (`/`)

Vista de resumen del cliente activo. Muestra el estado de los servicios configurados en la sidebar. Punto de entrada principal después del login.

---

## Compañía (`/compania`)

**Store key:** `compania` (objeto único `Compania`)

Diagnóstico completo del cliente. 13 secciones de levantamiento de marca:

1. Resumen Ejecutivo
2. Historia y Contexto del Mercado
3. Análisis de Mercado
4. Clientes y Segmentación
5. Análisis de Marca (FODA)
6. Posicionamiento y Ventaja
7. Análisis Comercial y Marketing
8. Funnel y Conversión
9. Factores Críticos de Compra
10. Problema Estratégico
11. Definición Estratégica
12. Plan de Acción
13. Métricas y KPIs

Todos los campos son texto libre. Los datos se fusionan automáticamente con los defaults cuando se agregan nuevos campos al esquema.

---

## 01 · Redes Sociales (`/servicios/redes-sociales`)

**Store keys:** `redes:estrategia`, `redes:redes`, `redes:contenidos`, `redes:generador`, `redes:ideas`, `redes:kpis`, `redes:todo`

**Pestañas:**
- **Estrategia** — objetivos, público, tono, pilares de contenido
- **Redes** — plataformas activas con métricas y estado de conexión
- **Calendario** — contenidos programados por fecha con estado (Idea/En producción/Programado/Publicado/Archivado)
- **Generador** — tablero de pre-aprobación de contenidos (Atraer/Nutrir/Convertir)
- **Ideas** — banco de ideas de contenido
- **KPIs** — métricas por plataforma (seguidores, alcance, engagement)
- **ToDo** — kanban de tareas

---

## 02 · Asesoría Estratégica (`/servicios/asesoria-estrategica`)

**Store keys:** `asesoria:directrices`, `asesoria:roadmap`, `asesoria:actas`, `asesoria:acuerdos`, `asesoria:documentos`, `asesoria:todo`

**Pestañas:**
- **Directrices** — OKRs por área: Marca, Comercial, Producto, Operaciones
- **Hoja de Ruta** — iniciativas en 3 horizontes: 0–3m, 3–12m, +12m
- **Reuniones** — actas con fecha, asistentes, puntos tratados y acuerdos
- **Acuerdos** — compromisos con fecha límite y responsable; alerta automática de vencidos
- **Documentos** — links a Google Drive, Notion u otros recursos externos
- **ToDo** — kanban de tareas

---

## 03 · Paid Media (`/servicios/paid-media`)

**Store keys:** `paid:estrategia`, `paid:campanas`, `paid:briefs`, `paid:metricas`, `paid:optimizaciones`, `paid:plataformas`, `paid:conectores`, `paid:looker`, `paid:todo`

**Pestañas:**
- **Estrategia** — objetivos, presupuesto mensual, plataformas activas
- **Campañas** — CRUD con presupuesto, gasto y estado; alerta de budget agotado
- **Briefs** — resúmenes creativos por campaña
- **Métricas** — registros históricos con CTR, CPC, CPA, ROAS calculados automáticamente
- **Optimizaciones** — log de cambios con fecha y resultado
- **Plataformas** — estado de conexión (Google Ads, Meta, TikTok, etc.)
- **Conectores** — iframes de Looker Studio para dashboards de campañas
- **ToDo** — kanban de tareas

---

## 04 · Diseño y Contenidos (`/servicios/diseno-y-contenidos`)

**Store keys:** `diseno:brandkit`, `diseno:piezas`, `diseno:todo`

Un solo store `diseno:piezas` alimenta las vistas de Solicitudes, Calendario y Biblioteca.

**Pestañas:**
- **Brand Kit** — paleta de colores (HEX+Pantone), tipografías, do's/don'ts, activos en Drive
- **Solicitudes** — pipeline kanban: Recibida → Brief → Diseño → Revisión → Aprobada → Entregada
- **Calendario** — vista de piezas por fecha de entrega
- **Biblioteca** — piezas entregadas con link al archivo final
- **KPIs** — tiempo de aprobación, % a tiempo, carga por diseñador
- **ToDo** — kanban de tareas

---

## 05 · Analítica (`/servicios/analitica`)

**Store keys:** `analitica:looker`, `analitica:fuentes`, `analitica:informes`, `analitica:insights`, `analitica:todo`

Datos de analytics embebidos vía Looker Studio. No requiere API directa.

**Pestañas:**
- **Dashboards** — iframes de Looker Studio con altura configurable
- **Fuentes** — GA4, Search Console, GTM, Hotjar, Clarity con Property ID documentado
- **Informes** — histórico de reportes entregados (Mensual/Quincenal/Trimestral/Ad hoc)
- **Insights** — timeline de hallazgos con categoría (Tráfico/SEO/UX…), impacto (Alto/Medio/Bajo) y acción recomendada
- **ToDo** — kanban de tareas

**Cómo agregar un dashboard de Looker:** En la plataforma, usa "Archivo → Insertar informe" y copia el `<iframe>` o la URL `/embed/reporting/…`. La URL de visualización estándar no funciona como embed.

---

## 06 · Desarrollo Web (`/servicios/desarrollo-web`)

**Store keys:** `web:proyectos`, `web:fases`, `web:stack`, `web:accesos`, `web:todo`

**Pestañas:**
- **Proyectos** — CRUD con tipo (Sitio corporativo/E-commerce/Landing/App…), estado y fechas (inicio, objetivo, live)
- **Fases** — etapas por proyecto con dos vistas: Lista (con barra de progreso por proyecto) y Línea de tiempo (Gantt con barras CSS)
- **Stack** — tecnologías agrupadas por categoría (Frontend/Backend/DB/CMS/Hosting…) con versión y URL de documentación
- **Accesos** — links a entornos (Producción/Staging/Repositorio/CMS/Hosting/Dominio) con filtro por proyecto
- **ToDo** — kanban de tareas

---

## 07 · Email Marketing y Automatizaciones (`/servicios/email-marketing`)

**Store keys:** `email:config`, `email:campanas`, `email:audiencias`, `email:automatizaciones`, `email:todo`

**Pestañas:**
- **Plataforma** — herramienta en uso (Mailchimp/ActiveCampaign/Klaviyo/HubSpot/Brevo…), cuenta, URLs de panel y plantillas
- **Campañas** — CRUD con tipo, estado, asunto, audiencia asignada, fecha de envío y métricas (enviados, aperturas, clics, conversiones). Tasas calculadas automáticamente
- **Audiencias** — listas y segmentos con tamaño, tasa de baja (coloreada por salud) y etiquetas
- **Automatizaciones** — flujos con trigger (Suscripción/Compra/Carrito abandonado/…), estado con toggle rápido y link al flujo en la plataforma
- **Calendario** — grilla mensual navegable con campañas coloreadas por estado + lista cronológica histórica
- **ToDo** — kanban de tareas

---

## Componentes compartidos

### `KanbanTareas`

Kanban de 4 columnas (Por hacer / En curso / Bloqueado / Listo). Se instancia en todos los módulos con una `storeKey` diferente. Las tarjetas tienen: título, descripción, asignado, prioridad (Alta/Media/Baja), fecha y link a archivo.

### `usePersistentState`

Hook central de persistencia. Firma: `usePersistentState<T>(key: string, initial: T): [T, Setter, loaded]`. El tercer elemento `loaded` indica si los datos ya fueron hidratados desde el backend.

### `Tabs` y `PageHeader`

Componentes de navegación y cabecera en `components/ui.tsx`. Responsive: `text-2xl md:text-3xl`, padding adaptado.

---

## Responsividad móvil

Implementada con `AppShell.tsx`:
- Barra superior fija `h-[52px] md:hidden` con hamburger y logo
- Sidebar como drawer: `-translate-x-full md:translate-x-0` con transición
- Backdrop semi-transparente al abrir el drawer
- Contenido: `pt-[52px] md:pt-0 md:pl-[264px]`
- Kanban con `overflow-x-auto` + `min-w-[560px]` para scroll horizontal en móvil
- Gantt/Timeline con scroll horizontal en móvil: `-mx-4 overflow-x-auto px-4`
