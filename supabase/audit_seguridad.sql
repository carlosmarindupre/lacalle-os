-- ============================================================
-- laCalle OS — Auditoría de seguridad de RLS (solo lectura)
-- ============================================================
-- Cómo usarlo:
--   Supabase Dashboard → SQL Editor → New query → pegar TODO → Run.
-- Devuelve una sola tabla: cada fila es un chequeo con su estado.
-- Revisa que NO haya filas con "⚠". No modifica nada.
--
-- Qué verifica:
--   · RLS habilitado en las 5 tablas del modelo de acceso.
--   · Que cada tabla tenga al menos una política (RLS sin políticas = todo
--     denegado o, peor, comportamiento inesperado).
--   · Que existan las funciones auxiliares SECURITY DEFINER.
--   · Que el trigger de alta (lista blanca) esté instalado.
--   · Quiénes son super_admin hoy.
--   · Perfiles cuyo correo ya NO está en la lista blanca (acceso no revocado,
--     ver pendiente de revocación de acceso).
-- ============================================================

with tablas(tabla) as (
  values ('perfiles'), ('correos_aprobados'), ('clientes'),
         ('acceso_cliente'), ('estado_tablero')
),
reporte as (
  -- 1) RLS habilitado por tabla
  select
    '1. RLS · ' || t.tabla as chequeo,
    case
      when count(c.oid) = 0 then '⚠ TABLA NO EXISTE'
      when bool_or(c.relrowsecurity) then 'OK'
      else '⚠ RLS DESACTIVADO'
    end as estado,
    '' as detalle
  from tablas t
  left join pg_class c
    on c.relname = t.tabla
   and c.relnamespace = (select oid from pg_namespace where nspname = 'public')
  group by t.tabla

  union all
  -- 2) Nº de políticas por tabla (debe ser >= 1)
  select
    '2. Políticas · ' || t.tabla,
    case when count(p.policyname) > 0
         then 'OK (' || count(p.policyname) || ')'
         else '⚠ SIN POLÍTICAS' end,
    coalesce(string_agg(p.policyname, ', ' order by p.policyname), '—')
  from tablas t
  left join pg_policies p
    on p.schemaname = 'public' and p.tablename = t.tabla
  group by t.tabla

  union all
  -- 3) Funciones auxiliares esperadas (deben ser SECURITY DEFINER)
  select
    '3. Función · ' || nombre,
    case
      when not exists (
        select 1 from pg_proc pr
        join pg_namespace n on n.oid = pr.pronamespace
        where n.nspname = 'public' and pr.proname = nombre
      ) then '⚠ FALTA'
      when exists (
        select 1 from pg_proc pr
        join pg_namespace n on n.oid = pr.pronamespace
        where n.nspname = 'public' and pr.proname = nombre and pr.prosecdef
      ) then 'OK'
      else '⚠ NO es SECURITY DEFINER'
    end,
    ''
  from (values ('es_super_admin'), ('puede_ver_cliente'),
               ('manejar_nuevo_usuario')) as f(nombre)

  union all
  -- 4) Trigger de alta contra la lista blanca
  select
    '4. Trigger · al_crear_usuario',
    case when exists (
      select 1 from pg_trigger
      where tgname = 'al_crear_usuario' and not tgisinternal
    ) then 'OK' else '⚠ FALTA' end,
    ''

  union all
  -- 5) Super admins actuales (informativo — confirma que sean los esperados)
  select
    '5. Super admin · ' || correo,
    'INFO',
    coalesce(nombre, '(sin nombre)')
  from perfiles
  where rol = 'super_admin'

  union all
  -- 6) Perfiles cuyo correo ya no está aprobado (acceso no revocado)
  select
    '6. Perfil sin lista blanca · ' || pf.correo,
    '⚠ acceso no revocado',
    'rol=' || pf.rol::text
  from perfiles pf
  where not exists (
    select 1 from correos_aprobados ca
    where lower(ca.correo) = lower(pf.correo)
  )
)
select chequeo, estado, detalle
from reporte
order by chequeo;
