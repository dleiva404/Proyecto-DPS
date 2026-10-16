import theme from "../theme/theme";

// Estados de una solicitud (mismos nombres que usa la web en types/solicitud.ts)
export const ESTADOS = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
};

// Etapas del flujo de permisos: Jefe -> Analista
export const ETAPAS = {
  JEFE: "JEFE",
  ANALISTA: "ANALISTA",
};

export const ETAPA_TEXTO = {
  JEFE: "Jefe inmediato",
  ANALISTA: "Analista de Nómina",
  GERENTE: "Gerente (suplente)",
};

// Texto, badge y color de cada estado, según la captura de Figma
export const VISUAL_ESTADO = {
  Pendiente: {
    label: "En revisión",
    status: "pendiente",
    color: theme.colors.warning,
  },
  Aprobada: {
    label: "Aprobada",
    status: "aprobado",
    color: theme.colors.success,
  },
  Rechazada: {
    label: "Rechazada",
    status: "rechazado",
    color: theme.colors.error,
  },
};
