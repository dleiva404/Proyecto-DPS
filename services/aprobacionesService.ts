export type RolAprobador = "AnalistaNomina" | "Gerente" | "JefeInmediato";

export type EstadoSolicitud = "Pendiente" | "Aprobada" | "Rechazada";

export interface EtapaHistorial {
  rol: RolAprobador;
  accion: "Aprobado" | "Rechazado";
  fecha: string; // ISO
}

export interface SolicitudConFlujo {
  id: string;
  empleadoId: string;
  tipo: string; // "Vacaciones" | "Permiso Personal" | otros (sin flujo multi-etapa)
  fechaHorario: string;
  empresa: string;
  estado: EstadoSolicitud;
  etapaActual: RolAprobador | null; // null = todavía no inicia flujo, o ya terminó
  historial: EtapaHistorial[];
}

function tieneFlujo(tipo: string): boolean {
  return tipo === "Vacaciones" || tipo.toLowerCase().includes("permiso");
}

export function etapaInicial(tipo: string): RolAprobador | null {
  if (tipo === "Vacaciones") return "AnalistaNomina";
  if (tipo.toLowerCase().includes("permiso")) return "JefeInmediato";
  return null;
}

export function siguienteEtapa(
  tipo: string,
  etapaActual: RolAprobador,
): RolAprobador | null {
  if (tipo === "Vacaciones") {
    if (etapaActual === "AnalistaNomina") return "Gerente";
    if (etapaActual === "Gerente") return "JefeInmediato";
    if (etapaActual === "JefeInmediato") return null; // fin: se descuenta el saldo
  }

  if (tipo.toLowerCase().includes("permiso")) {
    if (etapaActual === "JefeInmediato") return "AnalistaNomina";
    if (etapaActual === "AnalistaNomina") return null; // fin
  }

  return null;
}

export function puedeActuar(
  tipo: string,
  rolUsuario: RolAprobador,
  etapaActual: RolAprobador | null,
  analistaDisponible: boolean = true,
): boolean {
  if (etapaActual === null) return false;
  if (rolUsuario === etapaActual) return true;

  const esRevisionFinalDePermiso =
    tipo.toLowerCase().includes("permiso") && etapaActual === "AnalistaNomina";

  if (
    esRevisionFinalDePermiso &&
    rolUsuario === "Gerente" &&
    !analistaDisponible
  ) {
    return true;
  }

  return false;
}

export function crearSolicitudConFlujo(
  datos: Omit<SolicitudConFlujo, "estado" | "etapaActual" | "historial">,
): SolicitudConFlujo {
  const inicio = etapaInicial(datos.tipo);
  return {
    ...datos,
    estado: "Pendiente",
    etapaActual: inicio,
    historial: [],
  };
}

export function avanzarSolicitud(
  solicitud: SolicitudConFlujo,
  accion: "Aprobado" | "Rechazado",
  rolQueActua: RolAprobador,
  analistaDisponible: boolean = true,
): SolicitudConFlujo {
  if (!tieneFlujo(solicitud.tipo)) {
    throw new Error(
      `El tipo "${solicitud.tipo}" no tiene flujo de aprobación multi-etapa.`,
    );
  }

  if (solicitud.estado !== "Pendiente") {
    throw new Error(
      `La solicitud ${solicitud.id} ya está en estado "${solicitud.estado}" y no puede modificarse.`,
    );
  }

  if (
    !puedeActuar(
      solicitud.tipo,
      rolQueActua,
      solicitud.etapaActual,
      analistaDisponible,
    )
  ) {
    throw new Error(
      `El rol ${rolQueActua} no puede actuar sobre esta solicitud en su etapa actual (${solicitud.etapaActual}).`,
    );
  }

  const nuevoHistorial: EtapaHistorial[] = [
    ...solicitud.historial,
    { rol: rolQueActua, accion, fecha: new Date().toISOString() },
  ];

  if (accion === "Rechazado") {
    return {
      ...solicitud,
      estado: "Rechazada",
      etapaActual: null,
      historial: nuevoHistorial,
    };
  }

  const siguiente = siguienteEtapa(
    solicitud.tipo,
    solicitud.etapaActual as RolAprobador,
  );

  if (siguiente === null) {
    return {
      ...solicitud,
      estado: "Aprobada",
      etapaActual: null,
      historial: nuevoHistorial,
    };
  }

  return {
    ...solicitud,
    etapaActual: siguiente,
    historial: nuevoHistorial,
  };
}

export function etiquetaEtapa(
  etapaActual: RolAprobador | null,
  estado: EstadoSolicitud,
): string {
  if (estado === "Aprobada") return "Aprobada";
  if (estado === "Rechazada") return "Rechazada";
  if (etapaActual === "AnalistaNomina")
    return "Esperando revisión — Analista de Nómina";
  if (etapaActual === "Gerente") return "Esperando aprobación — Gerente";
  if (etapaActual === "JefeInmediato")
    return "Esperando firma — Jefe inmediato";
  return "Pendiente";
}
