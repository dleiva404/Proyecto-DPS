// Campos guardados en la app
export type EstadoSolicitud = "Pendiente" | "Aprobada" | "Rechazada";
export type Etapa = "JEFE" | "ANALISTA" | "GERENTE";

export interface RegistroHistorial {
  rol: string;
  accion?: "Aprobado" | "Rechazado";
  decision?: "Aprobar" | "Rechazar";
  responsable: string;
  motivo?: string;
  fecha: string;
}

interface SolicitudBase {
  id: string;
  empleadoUid: string;
  empleadoNombre: string;
  jefeUid: string | null;
  departamento: string;
  empresa: string;
  motivo: string;
  estado: EstadoSolicitud;
  motivoRechazo: string | null;
  creadaEn: string;
  historial: RegistroHistorial[];
}

export interface Permiso extends SolicitudBase {
  tipo: "Permiso Personal";
  fecha: string;
  etapaActual: "JEFE" | "ANALISTA" | null;
}

export interface Vacacion extends SolicitudBase {
  tipo: "Vacaciones";
  fechaInicio: string;
  fechaFin: string;
  diasSolicitados: number;
  etapas: Etapa[];
  etapaActual: Etapa | null;
}

export const ETAPA_DE_ROL: Record<string, Etapa | undefined> = {
  JefeInmediato: "JEFE",
  AnalistaNomina: "ANALISTA",
  Gerente: "GERENTE",
};
