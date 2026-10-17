export const ROLES = {
  EMPLEADO: "EMPLEADO",
  JEFE: "JEFE",
  ANALISTA: "ANALISTA",
  GERENTE: "GERENTE",
  RRHH: "RRHH",
};

export const NOMBRE_ROL = {
  EMPLEADO: "Empleado",
  JEFE: "Jefe inmediato",
  ANALISTA: "Analista de Nómina",
  GERENTE: "Gerente",
  RRHH: "Recursos Humanos",
};

export const APROBADORES = [
  ROLES.JEFE,
  ROLES.ANALISTA,
  ROLES.GERENTE,
  ROLES.RRHH,
];

export const VEN_REPORTES = [ROLES.GERENTE, ROLES.RRHH];
