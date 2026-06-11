# laCalle OS — Funcionalidades

Sistema operacional interno de Agencia laCalle: una aplicación web que centraliza
la ejecución, seguimiento y métricas de los servicios de la agencia, organizada
por cliente.

## Modelo multi-cliente
- Cada cliente de laCalle es un **tablero aislado**: sus datos no se mezclan con los de otro.
- Se elige el cliente activo desde un **selector en el sidebar**; todo lo que se ve y edita pertenece a ese cliente.
- Las reglas de acceso están a nivel de base de datos: un usuario solo ve los clientes que tiene asignados.

## Acceso y roles
- **Login con Google** (registro cerrado: solo correos aprobados por el super admin pueden entrar).
- **Super admin:** ve y gestiona todo — usuarios, clientes y asignaciones.
- **Miembro:** ve solo los clientes que el super admin le asigna.

## Navegación
Sidebar fijo con dos grupos:
- **General:** Dashboard, Compañía.
- **Servicios (01–08):** Asesoría Estratégica, Redes Sociales, Paid Media, Diseño y Contenidos, Analítica, Cartelería Digital, Desarrollo Web, Email Marketing.

Al pie: selector de cliente activo, correo del usuario y botón Salir.

## Módulos

### Dashboard
Resumen del cliente: stats de producción de contenidos, grilla de los 8 servicios con
estado editable (Activo / En setup / Pausado / No contratado), próximas publicaciones,
próxima reunión y acuerdos vencidos.

### Compañía
Levantamiento estratégico de marca en 13 secciones editables: resumen, contexto,
mercado, competencia, segmentación, FODA, posicionamiento, análisis comercial,
funnel (5 etapas), factores críticos, problema estratégico, definición estratégica,
plan de acción (checklist) y KPIs. Es la fuente que alimenta de contexto a los demás módulos.

### Asesoría Estratégica · 6 pestañas
- **Directrices:** contexto desde Compañía + visión/foco + OKRs con % de avance computado.
- **Hoja de Ruta:** iniciativas en columnas por horizonte (0–3 / 3–6 / 6–12 meses), drag & drop, vinculadas al servicio que las ejecuta.
- **Reuniones:** actas con tipo/asistentes/temas y acuerdos anidados; actas futuras = "Programada".
- **Acuerdos:** seguimiento con responsable, lado (laCalle/Cliente), fecha límite, vencidos en magenta, filtros.
- **ToDo** (kanban) y **Documentos**.

### Redes Sociales · 6 pestañas
- **Estrategia:** objetivos, pilares de contenido, tono.
- **Redes:** toggle por plataforma con handle y frecuencia.
- **Calendario** editorial mensual.
- **Generador de contenidos:** lee contexto de Compañía y Estrategia y genera ideas balanceadas (Atraer / Nutrir / Convertir) → caen en un tablero de pre-aprobación; al aprobarlas pasan al ToDo. Respeta la identidad visual del Brand Kit.
- **ToDo** (kanban) y **KPIs** por red + producción.

### Paid Media · 5 pestañas
- **Estrategia:** contexto desde Compañía (funnel + factor crítico) + estrategia de inversión + presupuesto + plataformas.
- **Campañas:** presupuesto planificado vs. ejecutado con alerta de excedido, objetivo y estado.
- **Métricas:** registro por plataforma → CTR, CPC, CPA y ROAS calculados automáticamente.
- **Optimizaciones:** bitácora tipo timeline (evidencia del trabajo continuo).
- **Briefs** de campaña (reflejan los lineamientos del Brand Kit) y **ToDo**.

### Diseño y Contenidos · 6 pestañas
- **Brand Kit:** paleta HEX/Pantone, tipografías, línea gráfica, do's/don'ts y activos de marca (links de Drive categorizados). Es la **fuente única de identidad** del cliente y alimenta a Redes (Generador) y Paid (Briefs).
- **Solicitudes:** pipeline de producción kanban de 6 estados (En cola → En proceso → Revisión interna → Aprobación cliente → Aprobado → Entregado), con brief, tipo, canal, responsable, deadline, rondas de revisión y link al archivo. Sella fechas de aprobación/entrega automáticamente.
- **Calendario** de producción (por deadline; vencidos en magenta).
- **Biblioteca:** las piezas Entregadas se gradúan solas a una galería filtrable.
- **KPIs:** tiempo de aprobación, % a tiempo, rondas promedio, carga por diseñador — todo computado.
- **ToDo** (kanban).

### Módulos base (en profundización pendiente)
Analítica, Cartelería Digital, Desarrollo Web y Email Marketing operan hoy con un
**módulo base genérico**: tareas con asignado y estado + entregables con links.

## Funcionalidades transversales
- **Selector de cliente** (sidebar): cambia todo el tablero al cliente elegido.
- **ToDo kanban compartido** (Asesoría / Paid / Diseño): 4 estados, drag & drop, y un **campo de link a la pieza** (Drive/Figma) en cada tarjeta para subir o visualizar el entregable.
- **Brand Kit como fuente única:** la identidad se define una vez y viaja a Redes y Paid sin recopiarla.
- **Flujo de contenidos con pre-aprobación:** Generador → tablero de ideas → ToDo → Calendario.
- **Conexión entre módulos:** Compañía alimenta a Asesoría, Redes y Paid; Diseño produce las piezas, Redes las publica.
- **Persistencia por cliente:** todo se guarda en la nube (Supabase), aislado por cliente, compartido por el equipo.

## Estado de los módulos
| Módulo | Estado |
|---|---|
| Dashboard | ✅ Completo |
| Compañía | ✅ Completo |
| Asesoría Estratégica | ✅ Completo |
| Redes Sociales | ✅ Completo |
| Paid Media | ✅ Completo |
| Diseño y Contenidos | ✅ Completo |
| Analítica | ⏳ Base genérico |
| Cartelería Digital | ⏳ Base genérico |
| Desarrollo Web | ⏳ Base genérico |
| Email Marketing | ⏳ Base genérico |
