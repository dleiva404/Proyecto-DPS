import type { Timestamp } from "firebase/firestore";

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
  empleadoId: string; // referencia al empleado (obligatorio para todos los roles)
  activo: boolean; // false = cuenta desactivada (los usuarios no se borran)
  creadoPor: string; // uid del AdminTI que creó la cuenta
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
