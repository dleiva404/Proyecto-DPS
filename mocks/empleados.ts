export interface Empleado {
  empleadoId: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  departamentoId: string;
  fechaContratacion: string;
  fechaUltVacacion: string | null;
  diasAntVacacion: number;
  ultAsignacionVacac: string | null;
  jefe: string | null;
  estadoEmpleado: string;
}

export const empleadosMock: Empleado[] = [
  {
    empleadoId: "E001",
    nombres: "Carlos Alberto",
    apellidoPaterno: "Cornejo",
    apellidoMaterno: "Calderón",
    departamentoId: "01",
    fechaContratacion: "2018-09-01",
    fechaUltVacacion: "2026-02-20",
    diasAntVacacion: 15,
    ultAsignacionVacac: "2025-09-01",
    jefe: "E010",
    estadoEmpleado: "A",
  },
  {
    empleadoId: "E002",
    nombres: "David Antonio",
    apellidoPaterno: "Leiva",
    apellidoMaterno: "Martínez",
    departamentoId: "01",
    fechaContratacion: "2020-03-15",
    fechaUltVacacion: "2025-04-10",
    diasAntVacacion: 10,
    ultAsignacionVacac: "2026-03-15",
    jefe: "E010",
    estadoEmpleado: "A",
  },
  {
    empleadoId: "E003",
    nombres: "Moisés David",
    apellidoPaterno: "García",
    apellidoMaterno: "Casco",
    departamentoId: "02",
    fechaContratacion: "2024-01-10",
    fechaUltVacacion: null,
    diasAntVacacion: 15,
    ultAsignacionVacac: "2026-01-10",
    jefe: "E010",
    estadoEmpleado: "A",
  },
  {
    empleadoId: "E004",
    nombres: "Alcyr Alexander",
    apellidoPaterno: "Figueroa",
    apellidoMaterno: "Landaverde",
    departamentoId: "02",
    fechaContratacion: "2022-07-01",
    fechaUltVacacion: "2025-12-15",
    diasAntVacacion: 0,
    ultAsignacionVacac: "2025-07-01",
    jefe: "E010",
    estadoEmpleado: "A",
  },
  {
    empleadoId: "E005",
    nombres: "Nelson Mauricio",
    apellidoPaterno: "Solano",
    apellidoMaterno: "Guardado",
    departamentoId: "03",
    fechaContratacion: "2025-11-20",
    fechaUltVacacion: null,
    diasAntVacacion: 0,
    ultAsignacionVacac: null,
    jefe: "E010",
    estadoEmpleado: "A",
  },
  // cuentas (E001-E005) destinadas a los roles empleados en Firebase Authentication
  {
    empleadoId: "E006",
    nombres: "Cristiano Lionel",
    apellidoPaterno: "Perez",
    apellidoMaterno: "Rivas",
    departamentoId: "04",
    fechaContratacion: "2019-02-11",
    fechaUltVacacion: "2025-08-01",
    diasAntVacacion: 15,
    ultAsignacionVacac: "2026-02-11",
    jefe: null,
    estadoEmpleado: "A",
    // Cuenta destinada al rol AdminTI en Firebase Authentication
  },
  {
    empleadoId: "E007",
    nombres: "Maria Josefina",
    apellidoPaterno: "Hernández",
    apellidoMaterno: "Vásquez",
    departamentoId: "05",
    fechaContratacion: "2015-06-01",
    fechaUltVacacion: "2026-01-15",
    diasAntVacacion: 15,
    ultAsignacionVacac: "2026-06-01",
    jefe: null,
    estadoEmpleado: "A",
    // Cuenta destinada al rol Gerente en Firebase Authentication
  },
  {
    empleadoId: "E008",
    nombres: "Dolores Olimpia",
    apellidoPaterno: "Ramírez",
    apellidoMaterno: "Alas",
    departamentoId: "05",
    fechaContratacion: "2021-04-05",
    fechaUltVacacion: "2025-11-20",
    diasAntVacacion: 15,
    ultAsignacionVacac: "2026-04-05",
    jefe: "E007",
    estadoEmpleado: "A",
    // Cuenta destinada al rol AnalistaNomina en Firebase Authentication
  },
  {
    empleadoId: "E009",
    nombres: "Jeremy Alexander",
    apellidoPaterno: "Portillo",
    apellidoMaterno: "Reyes",
    departamentoId: "05",
    fechaContratacion: "2023-09-18",
    fechaUltVacacion: null,
    diasAntVacacion: 15,
    ultAsignacionVacac: "2026-09-18",
    jefe: "E008",
    estadoEmpleado: "A",
    // Cuenta destinada al rol AsistentePlanilla en Firebase Authentication
  },
  {
    empleadoId: "E010",
    nombres: "Juan Carlos",
    apellidoPaterno: "Castellanos",
    apellidoMaterno: "Pineda",
    departamentoId: "01",
    fechaContratacion: "2017-05-22",
    fechaUltVacacion: "2026-03-01",
    diasAntVacacion: 15,
    ultAsignacionVacac: "2026-05-22",
    jefe: "E007",
    estadoEmpleado: "A",
    // Cuenta destinada al rol JefeInmediato en Firebase Authentication
  },
];
