# laCalle OS — Stack, plataformas, pasos y roles

## Stack técnico
| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Lenguaje | TypeScript |
| Runtime local | Node 22 (binario en `~/.local/node/node-v22.14.0-darwin-x64/bin`; el Node del sistema es 16.10 y no sirve) |
| Datos / Auth | Supabase (PostgreSQL + Auth + RLS) |
| Identidad | Google OAuth |
| Hosting (planificado) | Vercel |
| Repositorio (planificado) | GitHub |

## Plataformas y su rol

### Supabase — base de datos, autenticación y seguridad
- **Rol:** guarda todos los datos compartidos del equipo, gestiona el login y aplica las reglas de acceso.
- **Proyecto:** `laCalle OS` · ref `vxhnogkfavtgczblamua` · URL `https://vxhnogkfavtgczblamua.supabase.co` · plan Free.
- **Qué hace:**
  - **PostgreSQL:** las 5 tablas del modelo (ver abajo).
  - **Auth:** login con Google; el correo debe estar en la lista blanca.
  - **RLS (Row Level Security):** un usuario solo lee/escribe datos de los clientes que puede ver — aunque manipule el navegador.

### Google Cloud (OAuth) — proveedor de identidad
- **Rol:** verifica la identidad del usuario al iniciar sesión con Google. No guarda datos de la app.
- **Proyecto:** `laCalle OS` (propio, no de un cliente).
- **Cliente OAuth:** `laCalle OS Web` (Aplicación web).
- **Redirect URI:** `https://vxhnogkfavtgczblamua.supabase.co/auth/v1/callback`
- **Pantalla de consentimiento:** modo *Testing* — solo entran el dueño y los usuarios de prueba agregados. (Suficiente para equipo interno; evita el proceso de verificación de Google.)

### Vercel (planificado) — hosting
- **Rol:** servir la app en una URL pública para que el equipo entre sin depender de una máquina local.
- **Nota:** uso comercial requiere plan Pro (~US$20/mes).

### GitHub (planificado) — repositorio
- **Rol:** alojar el código y conectarlo a Vercel para desplegar en cada cambio. (El proyecto aún no es un repo Git.)

### Entorno local — desarrollo
- **Rol:** desarrollar y probar antes de desplegar.
- **Cómo correr:**
  ```bash
  export PATH="$HOME/.local/node/node-v22.14.0-darwin-x64/bin:$PATH"
  cd motor-app && npm run dev   # http://localhost:3000
  ```

## Variables de entorno (`motor-app/.env.local`, NO se comitea)
| Variable | Para qué | Estado |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave pública (segura en el navegador) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave secreta para acciones de admin del lado del servidor | ⏳ Fase 3 |

> La app detecta sola: si las variables de Supabase están, guarda en la nube; si no, cae a modo local (localStorage). Único punto de contacto: el hook `usePersistentState`.

## Modelo de datos (5 tablas)
| Tabla | Qué guarda |
|---|---|
| `perfiles` | Un perfil por usuario (correo, nombre, rol). |
| `correos_aprobados` | Lista blanca de correos autorizados a entrar + su rol inicial. |
| `clientes` | Cada cliente de laCalle (un tablero aislado). |
| `acceso_cliente` | Qué miembro puede ver qué cliente. |
| `estado_tablero` | Los datos de cada módulo, por cliente, en JSON (reemplaza al localStorage). |

## Modelo de seguridad
- **Registro cerrado:** un trigger valida cada alta contra `correos_aprobados`; si el correo no está, bloquea el ingreso.
- **RLS** en todas las tablas: el acceso a `estado_tablero` exige `puede_ver_cliente(cliente_id)`.
- **Secretos:** la llave pública puede ir al navegador; la `service_role` jamás (solo servidor). `.env.local` está en `.gitignore`.

## Roles de usuario
| Rol | Puede |
|---|---|
| `super_admin` | Todo: usuarios, clientes, asignaciones, todos los tableros. (cmarind@gmail.com) |
| `miembro` | Solo los clientes asignados. |

## Pasos de setup ya realizados (runbook)
1. **Supabase:** crear proyecto → correr el SQL de `supabase/migrations/0001_esquema_inicial.sql` (tablas + RLS + trigger + semillas).
2. **Google Cloud:** proyecto propio → pantalla de consentimiento (Testing) → crear cliente OAuth web con el redirect URI de Supabase → copiar Client ID + Secret.
3. **Supabase Auth:** activar proveedor Google con ese Client ID + Secret; Site URL `http://localhost:3000` + Redirect URL `http://localhost:3000/**`.
4. **App:** credenciales en `.env.local`; super admin sembrado (`cmarind@gmail.com`).

## Fases del proyecto
| Fase | Qué incluye | Estado |
|---|---|---|
| 1 | Base de datos multi-cliente + capa de persistencia (hook → Supabase) + selector de cliente | ✅ Hecha |
| 2 | Login con Google + lista blanca + protección de rutas | ✅ Hecha y probada en vivo |
| 3 | Panel de super admin: invitar correos, crear/renombrar clientes, asignar miembros, roles | ⏳ Pendiente |
| 4 | Deploy a Vercel (Git → GitHub → Vercel) + Exportar/Importar JSON de respaldo | ⏳ Pendiente |

## Arquitectura de carpetas (clave)
- `app/(app)/` — páginas autenticadas (con sidebar). `app/login/` — login standalone. `app/auth/callback/` — retorno de Google.
- `lib/supabase/` — config, cliente, middleware de sesión. `lib/cliente-context.tsx` — cliente activo. `lib/store.ts` — hook de persistencia.
- `middleware.ts` — candado de rutas. `supabase/migrations/` — esquema SQL.
