import { usuariosMock } from "./usuariosMock";
import { solicitudesSeed } from "./solicitudesMock";
import { ESTADOS, ETAPAS } from "../constants/estados";
import { listarVacacionesEmpleado } from "./solicitudesVacacionesService";
import { nombreFeriado } from "./vacacionesService";

// Almacén en memoria: se pierde al recargar. Cuando se conecte Firestore,
// estas funciones cambian de implementación pero no de nombre.
let almacen = solicitudesSeed.map((s) => ({
  ...s,
  historial: [...s.historial],
}));
let contador = almacen.length;

const copia = (s) => ({ ...s, historial: s.historial.map((h) => ({ ...h })) });

// Con jefe asignado, el permiso empieza en el jefe. Sin jefe (Carlos), va directo a la Analista.
export const etapaInicialPara = (usuario) =>
  usuario.jefeId ? ETAPAS.JEFE : ETAPAS.ANALISTA;

function hoyTexto() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function choquePermiso(usuario, fecha, idActual = null) {
  const otroPermiso = almacen.some(
    (s) =>
      s.empleadoUid === usuario.id &&
      s.id !== idActual &&
      s.estado !== ESTADOS.RECHAZADA &&
      s.fecha === fecha,
  );
  if (otroPermiso) return "Ya tienes un permiso para ese día";

  const enVacaciones = listarVacacionesEmpleado(usuario.id).some(
    (v) =>
      v.estado !== "Rechazada" && v.fechaInicio <= fecha && fecha <= v.fechaFin,
  );
  if (enVacaciones) return "Ese día ya está en una solicitud de vacaciones";

  return null;
}
export function validarPermiso({ empresa, motivo, fecha }) {
  const errores = {};
  if (!empresa) errores.empresa = "Elige una empresa";
  if (!motivo || !motivo.trim()) errores.motivo = "Escribe el motivo";
  const formatoOk = /^\d{4}-\d{2}-\d{2}$/.test(fecha || "");
  if (!formatoOk || isNaN(new Date(`${fecha}T00:00:00`).getTime())) {
    errores.fecha = "Usa el formato AAAA-MM-DD";
  } else if (new Date(`${fecha}T12:00:00`).getDay() === 0) {
    errores.fecha = "El domingo no se trabaja, elige otro día";
  } else if (nombreFeriado(fecha)) {
    errores.fecha = `Ese día es feriado (${nombreFeriado(fecha)}), no se trabaja`;
  } else if (fecha < hoyTexto()) {
    errores.fecha = "No puedes pedir permiso para un día que ya pasó";
  }
  return errores;
}

export function crearPermiso(usuario, datos) {
  const errores = validarPermiso(datos);
  if (Object.keys(errores).length) return { ok: false, errores };
  const choque = choquePermiso(usuario, datos.fecha);
  if (choque) return { ok: false, errores: { fecha: choque } };
  contador += 1;
  const nueva = {
    id: `SOL-${String(contador).padStart(3, "0")}`,
    empleadoUid: usuario.id,
    empleadoNombre: `${usuario.nombre} ${usuario.apellido}`,
    departamento: datos.departamento || usuario.departamento,
    empresa: datos.empresa,
    tipo: "Permiso Personal",
    motivo: datos.motivo.trim(),
    fecha: datos.fecha,
    estado: ESTADOS.PENDIENTE,
    etapaActual: etapaInicialPara(usuario),
    motivoRechazo: null,
    creadaEn: new Date().toISOString(),
    historial: [],
  };
  almacen = [...almacen, nueva];
  return { ok: true, solicitud: copia(nueva) };
}

// Para "Modificar": solo el dueño, y solo si fue rechazada. Vuelve a Pendiente; el historial se conserva.
export function actualizarPermiso(usuario, id, datos) {
  const actual = almacen.find((s) => s.id === id);
  if (!actual || actual.empleadoUid !== usuario.id) {
    return {
      ok: false,
      errores: { general: "No puedes modificar esta solicitud" },
    };
  }
  if (actual.estado !== ESTADOS.RECHAZADA) {
    return {
      ok: false,
      errores: { general: "Solo se modifican las solicitudes rechazadas" },
    };
  }
  const errores = validarPermiso(datos);
  if (Object.keys(errores).length) return { ok: false, errores };

  const choque = choquePermiso(usuario, datos.fecha, id);
  if (choque) return { ok: false, errores: { fecha: choque } };
  const cambios = {
    empresa: datos.empresa,
    departamento: datos.departamento || actual.departamento,
    motivo: datos.motivo.trim(),
    fecha: datos.fecha,
    estado: ESTADOS.PENDIENTE,
    etapaActual: etapaInicialPara(usuario),
    motivoRechazo: null,
  };
  almacen = almacen.map((s) => (s.id === id ? { ...s, ...cambios } : s));
  return { ok: true, solicitud: copia({ ...actual, ...cambios }) };
}

export function listarPropias(usuario) {
  return almacen
    .filter((s) => s.empleadoUid === usuario.id)
    .map(copia)
    .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));
}

export function obtener(id) {
  const encontrada = almacen.find((s) => s.id === id);
  return encontrada ? copia(encontrada) : null;
}

// Personas cuyo jefe inmediato es este usuario
export function equipoDe(jefe) {
  return usuariosMock.filter((u) => u.jefeId === jefe.id).map((u) => u.id);
}

// Nadie decide sobre su propia solicitud.
function puedeDecidirPermiso(usuario, s) {
  if (s.estado !== ESTADOS.PENDIENTE || s.empleadoUid === usuario.id)
    return false;
  if (s.etapaActual === ETAPAS.JEFE) {
    return usuario.rol === "JEFE" && equipoDe(usuario).includes(s.empleadoUid);
  }
  if (s.etapaActual === ETAPAS.ANALISTA) {
    return usuario.rol === "ANALISTA" || usuario.rol === "GERENTE";
  }
  return false;
}

// Pendientes que le tocan a este usuario según la etapa
export function pendientesDeEquipo(jefe) {
  return almacen
    .filter((s) => puedeDecidirPermiso(jefe, s))
    .map(copia)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function decidir(usuario, id, accion, motivo = "") {
  const actual = almacen.find((s) => s.id === id);
  if (!actual) return { ok: false, error: "La solicitud no existe" };
  if (actual.estado !== ESTADOS.PENDIENTE) {
    return { ok: false, error: "Esta solicitud ya no está pendiente" };
  }
  const puedeDecidir = puedeDecidirPermiso(usuario, actual);
  if (!puedeDecidir) {
    return { ok: false, error: "No puedes decidir sobre esta solicitud" };
  }
  const esRechazo = accion === "Rechazado";
  if (esRechazo && !motivo.trim()) {
    return { ok: false, error: "El motivo del rechazo es obligatorio" };
  }

  const registro = {
    rol: usuario.rol === "JEFE" ? ETAPAS.JEFE : usuario.rol,
    accion,
    responsable: `${usuario.nombre} ${usuario.apellido}`,
    fecha: new Date().toISOString(),
    ...(esRechazo ? { motivo: motivo.trim() } : {}),
  };
  const cambios = esRechazo
    ? {
        estado: ESTADOS.RECHAZADA,
        etapaActual: null,
        motivoRechazo: motivo.trim(),
      }
    : actual.etapaActual === ETAPAS.JEFE
      ? { etapaActual: ETAPAS.ANALISTA }
      : { estado: ESTADOS.APROBADA, etapaActual: null };

  almacen = almacen.map((s) =>
    s.id === id
      ? { ...s, ...cambios, historial: [...s.historial, registro] }
      : s,
  );
  return { ok: true };
}
