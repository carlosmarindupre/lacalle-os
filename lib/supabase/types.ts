// Tipos compartidos del modelo de datos (espejo del esquema en Supabase).
export type RolUsuario = "super_admin" | "miembro";

export type Cliente = {
  id: string;
  nombre: string;
  slug: string;
  archivado?: boolean;
};

export type Perfil = {
  id: string;
  correo: string;
  nombre: string | null;
  rol: RolUsuario;
};

// Correo en la lista blanca (gestionado por el super admin).
export type CorreoAprobado = {
  correo: string;
  rol_inicial: RolUsuario;
  creado_en?: string;
};

// Asignación de un miembro a un cliente.
export type AccesoCliente = {
  usuario_id: string;
  cliente_id: string;
};
