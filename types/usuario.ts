// Roles definidos en la propuesta de Etapa 1 (sección 5.2 "Usuarios del sistema")
export type Rol =
  | "AdminTI"
  | "Gerente"
  | "AnalistaNomina"
  | "AsistentePlanilla"
  | "JefeInmediato"
  | "Empleado";

// Documento que vive en Firestore: usuarios/{uid}
export interface UsuarioSistema {
  uid: string;
  email: string;
  nombre: string;
  rol: Rol;
  empleadoId?: string; // referencia opcional al empleado en empleadosMock/colección empleados
}
