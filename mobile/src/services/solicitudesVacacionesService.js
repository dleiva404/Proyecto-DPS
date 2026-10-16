import {
  contarDiasHabiles,
  validarSolicitudVacaciones,
  obtenerPeriodoVacacional,
  obtenerSaldo,
  DIAS_ANUALES,
} from "./vacacionesService";
import { usuariosMock } from "./usuariosMock";

let solicitudesVacaciones = [];
let contador = 1;

function copiarSolicitud(solicitud) {
  return {
    ...solicitud,
    historial: [...(solicitud.historial || [])],
  };
}

function etapasPara(usuario) {
  return ["ANALISTA", "GERENTE", "JEFE"].filter((etapa) =>
    etapa === "JEFE" ? Boolean(usuario.jefeId) : etapa !== usuario.rol,
  );
}

function puedeDecidirVacacion(usuario, s) {
  if (!usuario || s.estado !== "Pendiente") return false;
  if (s.etapaActual !== usuario.rol || s.empleadoUid === usuario.id) {
    return false;
  }
  if (usuario.rol === "JEFE") {
    const empleado = usuariosMock.find((u) => u.id === s.empleadoUid);
    return empleado?.jefeId === usuario.id;
  }
  return true;
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

export function obtenerResumenSaldo(usuario, hoy = new Date()) {
  const vacio = { total: 0, aprobados: 0, enTramite: 0, disponible: 0 };
  if (!usuario?.id || !usuario?.fechaIngreso) return vacio;

  const periodo = obtenerPeriodoVacacional(usuario.fechaIngreso, hoy);
  if (!periodo) return vacio;

  const delPeriodo = solicitudesVacaciones.filter(
    (s) =>
      s.empleadoUid === usuario.id &&
      s.fechaInicio >= periodo.inicio &&
      s.fechaInicio < periodo.fin,
  );
  const sumar = (estado) =>
    delPeriodo
      .filter((s) => s.estado === estado)
      .reduce((total, s) => total + Number(s.diasSolicitados || 0), 0);

  const aprobados = sumar("Aprobada");
  const enTramite = sumar("Pendiente");

  return {
    total: DIAS_ANUALES,
    aprobados,
    enTramite,
    disponible: Math.max(0, DIAS_ANUALES - aprobados - enTramite),
  };
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

  const traslape = solicitudesVacaciones.find(
    (s) =>
      s.empleadoUid === usuario.id &&
      s.estado !== "Rechazada" &&
      s.fechaInicio <= datos.fechaFin &&
      datos.fechaInicio <= s.fechaFin,
  );
  if (traslape) {
    return {
      ok: false,
      errores: {
        fechas: `Esas fechas se cruzan con tu solicitud ${traslape.id} (${traslape.fechaInicio} al ${traslape.fechaFin}).`,
      },
    };
  }

  const diasSolicitados = contarDiasHabiles(datos.fechaInicio, datos.fechaFin);
  const etapas = etapasPara(usuario);
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
    etapas,
    etapaActual: etapas[0],
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

export function listarVacacionesPendientesPorRol(usuario) {
  return solicitudesVacaciones
    .filter((s) => puedeDecidirVacacion(usuario, s))
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

export function decidirSolicitudVacaciones(id, usuario, decision, motivo = "") {
  const rol = usuario?.rol;
  const indice = solicitudesVacaciones.findIndex((s) => s.id === id);

  if (indice === -1) {
    return { ok: false, mensaje: "No se encontró la solicitud." };
  }

  const solicitud = solicitudesVacaciones[indice];

  if (solicitud.estado !== "Pendiente") {
    return { ok: false, mensaje: "Esta solicitud ya fue resuelta." };
  }

  const etapas = solicitud.etapas || ["ANALISTA", "GERENTE", "JEFE"];

  if (!puedeDecidirVacacion(usuario, solicitud)) {
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
