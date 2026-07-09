


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."rol_usuario" AS ENUM (
    'super_admin',
    'miembro'
);


ALTER TYPE "public"."rol_usuario" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."es_super_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (select 1 from perfiles where id = auth.uid() and rol = 'super_admin');
$$;


ALTER FUNCTION "public"."es_super_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."manejar_nuevo_usuario"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  fila correos_aprobados%rowtype;
begin
  select * into fila from correos_aprobados where lower(correo) = lower(new.email);
  if not found then
    raise exception 'El correo % no está autorizado para acceder a laCalle OS.', new.email;
  end if;
  insert into perfiles (id, correo, nombre, rol)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          fila.rol_inicial)
  on conflict (id) do nothing;
  return new;
end;
$$;


ALTER FUNCTION "public"."manejar_nuevo_usuario"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."puede_ver_cliente"("c" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select es_super_admin() or exists (
    select 1 from acceso_cliente where usuario_id = auth.uid() and cliente_id = c
  );
$$;


ALTER FUNCTION "public"."puede_ver_cliente"("c" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."acceso_cliente" (
    "usuario_id" "uuid" NOT NULL,
    "cliente_id" "uuid" NOT NULL,
    "creado_en" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."acceso_cliente" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clientes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "archivado" boolean DEFAULT false NOT NULL,
    "creado_por" "uuid",
    "creado_en" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."clientes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."correos_aprobados" (
    "correo" "text" NOT NULL,
    "rol_inicial" "public"."rol_usuario" DEFAULT 'miembro'::"public"."rol_usuario" NOT NULL,
    "invitado_por" "uuid",
    "creado_en" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."correos_aprobados" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."estado_tablero" (
    "cliente_id" "uuid" NOT NULL,
    "clave" "text" NOT NULL,
    "valor" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "actualizado_por" "uuid",
    "actualizado_en" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."estado_tablero" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfiles" (
    "id" "uuid" NOT NULL,
    "correo" "text" NOT NULL,
    "nombre" "text",
    "rol" "public"."rol_usuario" DEFAULT 'miembro'::"public"."rol_usuario" NOT NULL,
    "creado_en" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."perfiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."acceso_cliente"
    ADD CONSTRAINT "acceso_cliente_pkey" PRIMARY KEY ("usuario_id", "cliente_id");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."correos_aprobados"
    ADD CONSTRAINT "correos_aprobados_pkey" PRIMARY KEY ("correo");



ALTER TABLE ONLY "public"."estado_tablero"
    ADD CONSTRAINT "estado_tablero_pkey" PRIMARY KEY ("cliente_id", "clave");



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_correo_key" UNIQUE ("correo");



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."acceso_cliente"
    ADD CONSTRAINT "acceso_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."acceso_cliente"
    ADD CONSTRAINT "acceso_cliente_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."perfiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "public"."perfiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."correos_aprobados"
    ADD CONSTRAINT "correos_aprobados_invitado_por_fkey" FOREIGN KEY ("invitado_por") REFERENCES "public"."perfiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."estado_tablero"
    ADD CONSTRAINT "estado_tablero_actualizado_por_fkey" FOREIGN KEY ("actualizado_por") REFERENCES "public"."perfiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."estado_tablero"
    ADD CONSTRAINT "estado_tablero_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "acceso_admin" ON "public"."acceso_cliente" USING ("public"."es_super_admin"()) WITH CHECK ("public"."es_super_admin"());



ALTER TABLE "public"."acceso_cliente" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "acceso_select" ON "public"."acceso_cliente" FOR SELECT USING (("public"."es_super_admin"() OR ("usuario_id" = "auth"."uid"())));



ALTER TABLE "public"."clientes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "clientes_admin" ON "public"."clientes" USING ("public"."es_super_admin"()) WITH CHECK ("public"."es_super_admin"());



CREATE POLICY "clientes_select" ON "public"."clientes" FOR SELECT USING ("public"."puede_ver_cliente"("id"));



CREATE POLICY "correos_admin" ON "public"."correos_aprobados" USING ("public"."es_super_admin"()) WITH CHECK ("public"."es_super_admin"());



ALTER TABLE "public"."correos_aprobados" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "estado_delete" ON "public"."estado_tablero" FOR DELETE USING ("public"."puede_ver_cliente"("cliente_id"));



CREATE POLICY "estado_insert" ON "public"."estado_tablero" FOR INSERT WITH CHECK ("public"."puede_ver_cliente"("cliente_id"));



CREATE POLICY "estado_select" ON "public"."estado_tablero" FOR SELECT USING ("public"."puede_ver_cliente"("cliente_id"));



ALTER TABLE "public"."estado_tablero" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "estado_update" ON "public"."estado_tablero" FOR UPDATE USING ("public"."puede_ver_cliente"("cliente_id")) WITH CHECK ("public"."puede_ver_cliente"("cliente_id"));



ALTER TABLE "public"."perfiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "perfiles_admin" ON "public"."perfiles" USING ("public"."es_super_admin"()) WITH CHECK ("public"."es_super_admin"());



CREATE POLICY "perfiles_select" ON "public"."perfiles" FOR SELECT USING ((("id" = "auth"."uid"()) OR "public"."es_super_admin"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."es_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."es_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."es_super_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."manejar_nuevo_usuario"() TO "anon";
GRANT ALL ON FUNCTION "public"."manejar_nuevo_usuario"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."manejar_nuevo_usuario"() TO "service_role";



GRANT ALL ON FUNCTION "public"."puede_ver_cliente"("c" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."puede_ver_cliente"("c" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."puede_ver_cliente"("c" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."acceso_cliente" TO "anon";
GRANT ALL ON TABLE "public"."acceso_cliente" TO "authenticated";
GRANT ALL ON TABLE "public"."acceso_cliente" TO "service_role";



GRANT ALL ON TABLE "public"."clientes" TO "anon";
GRANT ALL ON TABLE "public"."clientes" TO "authenticated";
GRANT ALL ON TABLE "public"."clientes" TO "service_role";



GRANT ALL ON TABLE "public"."correos_aprobados" TO "anon";
GRANT ALL ON TABLE "public"."correos_aprobados" TO "authenticated";
GRANT ALL ON TABLE "public"."correos_aprobados" TO "service_role";



GRANT ALL ON TABLE "public"."estado_tablero" TO "anon";
GRANT ALL ON TABLE "public"."estado_tablero" TO "authenticated";
GRANT ALL ON TABLE "public"."estado_tablero" TO "service_role";



GRANT ALL ON TABLE "public"."perfiles" TO "anon";
GRANT ALL ON TABLE "public"."perfiles" TO "authenticated";
GRANT ALL ON TABLE "public"."perfiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































