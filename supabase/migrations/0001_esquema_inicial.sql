-- ============================================================
-- laCalle OS — Esquema inicial multi-cliente (Fase 1)
-- ============================================================
-- Ejecuta este archivo completo en Supabase:
--   Dashboard → SQL Editor → New query → pegar y "Run".
-- (o vía Supabase CLI: supabase db push)
--
-- Modelo de acceso:
--   · super_admin  → ve y gestiona TODO (usuarios, clientes, accesos).
--   · miembro      → ve SOLO los clientes que el super admin le asigne.
--   · Registro cerrado: solo entran los correos en `correos_aprobados`.
-- ============================================================

-- ---------- Tipos ----------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'rol_usuario') then
    create type rol_usuario as enum ('super_admin', 'miembro');
  end if;
end $$;

-- ---------- Tablas ----------

-- Perfil de cada usuario (1:1 con auth.users). El rol vive aquí.
create table if not exists perfiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  correo      text not null unique,
  nombre      text,
  rol         rol_usuario not null default 'miembro',
  creado_en   timestamptz not null default now()
);

-- Lista blanca de correos autorizados a iniciar sesión (gestiona el super admin).
create table if not exists correos_aprobados (
  correo        text primary key,
  rol_inicial   rol_usuario not null default 'miembro',
  invitado_por  uuid references perfiles(id) on delete set null,
  creado_en     timestamptz not null default now()
);

-- Clientes de laCalle. Cada cliente = un tablero aislado.
create table if not exists clientes (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  slug        text not null unique,
  archivado   boolean not null default false,
  creado_por  uuid references perfiles(id) on delete set null,
  creado_en   timestamptz not null default now()
);

-- Qué miembro puede ver qué cliente. El super_admin NO necesita filas aquí (ve todos).
create table if not exists acceso_cliente (
  usuario_id  uuid not null references perfiles(id) on delete cascade,
  cliente_id  uuid not null references clientes(id) on delete cascade,
  creado_en   timestamptz not null default now(),
  primary key (usuario_id, cliente_id)
);

-- Estado de cada módulo del tablero, por cliente. Reemplaza al localStorage:
-- `clave` es el mismo identificador que usaban las claves locales (ej. "diseno:todo").
create table if not exists estado_tablero (
  cliente_id      uuid not null references clientes(id) on delete cascade,
  clave           text not null,
  valor           jsonb not null default '{}'::jsonb,
  actualizado_por uuid references perfiles(id) on delete set null,
  actualizado_en  timestamptz not null default now(),
  primary key (cliente_id, clave)
);

-- ---------- Funciones auxiliares (SECURITY DEFINER: evitan recursión en las políticas) ----------

create or replace function es_super_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from perfiles where id = auth.uid() and rol = 'super_admin'
  );
$$;

create or replace function puede_ver_cliente(c uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select es_super_admin() or exists (
    select 1 from acceso_cliente where usuario_id = auth.uid() and cliente_id = c
  );
$$;

-- ---------- Alta de usuario: solo correos aprobados ----------
-- Al crearse un usuario en auth (login con Google), se valida contra la lista blanca.
-- Si no está aprobado, se aborta la creación (no puede entrar).
create or replace function manejar_nuevo_usuario()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  fila correos_aprobados%rowtype;
begin
  select * into fila from correos_aprobados where lower(correo) = lower(new.email);
  if not found then
    raise exception 'El correo % no está autorizado para acceder a laCalle OS.', new.email;
  end if;

  insert into perfiles (id, correo, nombre, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    fila.rol_inicial
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function manejar_nuevo_usuario();
-- Nota: para un rechazo más elegante (mensaje propio antes de crear el usuario)
-- se puede migrar luego al "Before User Created" Auth Hook de Supabase.

-- ---------- Row Level Security ----------
alter table perfiles          enable row level security;
alter table correos_aprobados enable row level security;
alter table clientes          enable row level security;
alter table acceso_cliente    enable row level security;
alter table estado_tablero    enable row level security;

-- perfiles: cada uno ve el suyo; el super admin ve y administra todos.
drop policy if exists perfiles_select on perfiles;
create policy perfiles_select on perfiles for select
  using (id = auth.uid() or es_super_admin());
drop policy if exists perfiles_admin on perfiles;
create policy perfiles_admin on perfiles for all
  using (es_super_admin()) with check (es_super_admin());

-- correos_aprobados: solo el super admin.
drop policy if exists correos_admin on correos_aprobados;
create policy correos_admin on correos_aprobados for all
  using (es_super_admin()) with check (es_super_admin());

-- clientes: el super admin todo; el miembro solo los que tiene asignados (lectura).
drop policy if exists clientes_select on clientes;
create policy clientes_select on clientes for select
  using (puede_ver_cliente(id));
drop policy if exists clientes_admin on clientes;
create policy clientes_admin on clientes for all
  using (es_super_admin()) with check (es_super_admin());

-- acceso_cliente: el super admin lo gestiona; el miembro ve sus propias asignaciones.
drop policy if exists acceso_select on acceso_cliente;
create policy acceso_select on acceso_cliente for select
  using (es_super_admin() or usuario_id = auth.uid());
drop policy if exists acceso_admin on acceso_cliente;
create policy acceso_admin on acceso_cliente for all
  using (es_super_admin()) with check (es_super_admin());

-- estado_tablero: leer/escribir solo si puedes ver ese cliente.
-- Esta es la barrera real: un miembro NO puede tocar datos de un cliente no asignado,
-- aunque manipule el navegador.
drop policy if exists estado_select on estado_tablero;
create policy estado_select on estado_tablero for select
  using (puede_ver_cliente(cliente_id));
drop policy if exists estado_insert on estado_tablero;
create policy estado_insert on estado_tablero for insert
  with check (puede_ver_cliente(cliente_id));
drop policy if exists estado_update on estado_tablero;
create policy estado_update on estado_tablero for update
  using (puede_ver_cliente(cliente_id)) with check (puede_ver_cliente(cliente_id));
drop policy if exists estado_delete on estado_tablero;
create policy estado_delete on estado_tablero for delete
  using (puede_ver_cliente(cliente_id));

-- ---------- Semillas ----------
-- Super admins iniciales. cmarind@gmail.com es la cuenta de Google con la que
-- entra Carlos (login real); carlos@lacalle.cl queda habilitado por si se usa.
insert into correos_aprobados (correo, rol_inicial) values
  ('cmarind@gmail.com', 'super_admin'),
  ('carlos@lacalle.cl', 'super_admin')
on conflict (correo) do update set rol_inicial = excluded.rol_inicial;

-- Un primer cliente para arrancar (puedes renombrarlo o borrarlo luego desde el panel).
insert into clientes (nombre, slug)
values ('Matriz base', 'matriz')
on conflict (slug) do nothing;
