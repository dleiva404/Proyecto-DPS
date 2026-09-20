import type { Solicitud } from "@/types/solicitud";

export const solicitudesMock: Solicitud[] = [
  {
    id: "1",
    empleadoId: "E001",
    tipo: "Permiso Personal",
    fechaHorario: "25 Agosto 8:00 - 12:00",
    empresa: "Didelco",
    estado: "Pendiente",
    etapaActual: "JefeInmediato",
    historial: [],
  },
  {
    id: "2",
    empleadoId: "E002",
    tipo: "Vacaciones",
    fechaHorario: "01/Sep/26 - 05/Sep/26",
    empresa: "Steel",
    estado: "Aprobada",
    etapaActual: null,
    historial: [
      {
        rol: "AnalistaNomina",
        accion: "Aprobado",
        fecha: "2026-08-20T10:00:00.000Z",
      },
      { rol: "Gerente", accion: "Aprobado", fecha: "2026-08-21T09:00:00.000Z" },
      {
        rol: "JefeInmediato",
        accion: "Aprobado",
        fecha: "2026-08-21T15:00:00.000Z",
      },
    ],
  },
  {
    id: "3",
    empleadoId: "E003",
    tipo: "Constancia Laboral",
    fechaHorario: "01/Septiembre/26",
    empresa: "EFL",
    estado: "Rechazada",
    etapaActual: null,
    historial: [],
  },
  {
    id: "4",
    empleadoId: "E004",
    tipo: "Constancia Laboral",
    fechaHorario: "15/Agosto/26",
    empresa: "Didelco",
    estado: "Aprobada",
    etapaActual: null,
    historial: [],
  },
];
