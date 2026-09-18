export interface Solicitud {
    id: string;
    empleadoId: string;
    tipo: string;
    fechaHorario: string;
    empresa: string;
    estado: string;
}

export const solicitudesMock: Solicitud[] = [
    { id: "1", empleadoId: "E001", tipo: "Permiso Personal", fechaHorario: "25 Agosto 8:00 - 12:00", empresa: "Didelco", estado: "Pendiente" },
    { id: "2", empleadoId: "E002", tipo: "Vacaciones", fechaHorario: "01/Sep/26 - 05/Sep/26", empresa: "Steel", estado: "Aprobada" },
    { id: "3", empleadoId: "E003", tipo: "Constancia Laboral", fechaHorario: "01/Septiembre/26", empresa: "EFL", estado: "Rechazada" },
    { id: "4", empleadoId: "E004", tipo: "Constancia Laboral", fechaHorario: "15/Agosto/26", empresa: "Didelco", estado: "Aprobada" },
];