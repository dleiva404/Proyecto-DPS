export const ROLES = {
  EMPLEADO: "EMPLEADO",
  JEFE: "JEFE",
  ANALISTA: "ANALISTA",
  GERENTE: "GERENTE",
  RRHH: "RRHH",
};

// RRHH (asistente de planilla) consulta y registra, pero no aprueba: sale de esta lista.
export const APROBADORES = [
  ROLES.JEFE,
  ROLES.ANALISTA,
  ROLES.GERENTE,
];

export const VEN_REPORTES = [ROLES.GERENTE, ROLES.RRHH];
