export type RolAprobador = "AnalistaNomina" | "Gerente" | "JefeInmediato";

export interface EtapaHistorial {
  rol: RolAprobador;
  accion: "Aprobado" | "Rechazado";
  fecha: string;
}

export interface Solicitud {
  id: string;
  empleadoId: string;
  tipo: string;
  fechaHorario: string;
  empresa: string;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
  etapaActual?: RolAprobador | null;
  historial?: EtapaHistorial[];
}
