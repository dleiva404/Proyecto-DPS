import {
  contarDiasHabiles,
  validarSolicitudVacaciones,
  obtenerPeriodoVacacional,
  obtenerSaldo,
} from "./vacacionesService";

let solicitudesVacaciones = [];
let contador = 1;

function copiarSolicitud(solicitud) {
  return {
    ...solicitud,
    historial: [...(solicitud.historial || [])],
  };
}

export function obtenerSaldoDisponible(usuario, hoy = new Date()) {
  if (!usuario?.id || !usuario?.fechaIngreso) return 0;

  const periodo = obtenerPeriodoVacacional(usuario.fechaIngreso, hoy);
  if (!periodo) return 0;

  const diasReservados = solicitudesVacaciones
    .filter((s) => {
      const mismoEmpleado = s.empleadoUid === usuario.id;
      const noRechazada = s.estado !== "Rechazada";
      const mismoPeriodo =
        s.fechaInicio >= periodo.inicio && s.fechaInicio < periodo.fin;

      return mismoEmpleado && noRechazada && mismoPeriodo;
    })
    .reduce((total, s) => total + Number(s.diasSolicitados || 0), 0);

  return obtenerSaldo(usuario.fechaIngreso, diasReservados, hoy);
}

export function crearSolicitudVacaciones(usuario, datos) {
  if (!usuario?.id) {
    return {
      ok: false,
      errores: { general: "No se identificó al empleado." },
    };
  }

  const saldoDisponible = obtenerSaldoDisponible(usuario);

  const errores = validarSolicitudVacaciones({
    ...datos,
    fechaIngreso: usuario.fechaIngreso,
    saldoDisponible,
  });

  if (Object.keys(errores).length > 0) {
    return { ok: false, errores };
  }

  const diasSolicitados = contarDiasHabiles(datos.fechaInicio, datos.fechaFin);

  const solicitud = {
    id: `VAC-${String(contador++).padStart(3, "0")}`,
    empleadoUid: usuario.id,
    empleadoNombre: `${usuario.nombre} ${usuario.apellido}`,
    departamento: usuario.departamento,
    empresa: usuario.empresa,
    tipo: "Vacaciones",
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    diasSolicitados,
    motivo: datos.motivo.trim(),
    estado: "Pendiente",
    etapaActual: "ANALISTA",
    motivoRechazo: null,
    creadaEn: new Date().toISOString(),
    historial: [],
  };

  solicitudesVacaciones = [...solicitudesVacaciones, solicitud];

  return {
    ok: true,
    solicitud: copiarSolicitud(solicitud),
  };
}

export function listarVacacionesEmpleado(empleadoUid) {
  return solicitudesVacaciones
    .filter((s) => s.empleadoUid === empleadoUid)
    .map(copiarSolicitud)
    .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));
}

export function listarVacacionesPendientes() {
  return solicitudesVacaciones
    .filter((s) => s.estado === "Pendiente")
    .map(copiarSolicitud);
}

export function listarVacacionesPendientesPorRol(rol) {
  return solicitudesVacaciones
    .filter((s) => s.estado === "Pendiente" && s.etapaActual === rol)
    .map(copiarSolicitud);
}

export function reporteVacacionesPorDepartamento() {
  const totales = {};
  solicitudesVacaciones
    .filter((s) => s.estado === "Aprobada")
    .forEach((s) => {
      const depto = s.departamento || "Sin departamento";
      totales[depto] = (totales[depto] || 0) + s.diasSolicitados;
    });
  return Object.entries(totales)
    .map(([departamento, dias]) => ({ departamento, dias }))
    .sort((a, b) => b.dias - a.dias);
}

export function obtenerSolicitudVacaciones(id) {
  const solicitud = solicitudesVacaciones.find((s) => s.id === id);
  return solicitud ? copiarSolicitud(solicitud) : null;
}

export function decidirSolicitudVacaciones(id, rol, decision, motivo = "") {
  const indice = solicitudesVacaciones.findIndex((s) => s.id === id);

  if (indice === -1) {
    return { ok: false, mensaje: "No se encontró la solicitud." };
  }

  const solicitud = solicitudesVacaciones[indice];

  if (solicitud.estado !== "Pendiente") {
    return { ok: false, mensaje: "Esta solicitud ya fue resuelta." };
  }

  const etapas = ["ANALISTA", "GERENTE", "JEFE"];

  if (solicitud.etapaActual !== rol || !etapas.includes(rol)) {
    return { ok: false, mensaje: "No te corresponde revisar esta etapa." };
  }

  if (decision !== "Aprobar" && decision !== "Rechazar") {
    return { ok: false, mensaje: "Selecciona aprobar o rechazar." };
  }

  if (decision === "Rechazar" && !motivo.trim()) {
    return {
      ok: false,
      mensaje: "Debes escribir el motivo del rechazo.",
    };
  }

  const historial = [
    ...solicitud.historial,
    {
      rol,
      decision,
      motivo: motivo.trim(),
      fecha: new Date().toISOString(),
    },
  ];

  let estado = "Pendiente";
  let etapaActual = rol;
  let motivoRechazo = null;

  if (decision === "Rechazar") {
    estado = "Rechazada";
    etapaActual = null;
    motivoRechazo = motivo.trim();
  } else {
    const siguienteIndice = etapas.indexOf(rol) + 1;

    if (siguienteIndice >= etapas.length) {
      estado = "Aprobada";
      etapaActual = null;
    } else {
      etapaActual = etapas[siguienteIndice];
    }
  }

  const actualizada = {
    ...solicitud,
    estado,
    etapaActual,
    motivoRechazo,
    historial,
  };

  solicitudesVacaciones[indice] = actualizada;

  return {
    ok: true,
    solicitud: copiarSolicitud(actualizada),
  };
}
