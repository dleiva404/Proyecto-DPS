import { usuariosMock } from "./usuariosMock";
import { solicitudesSeed } from "./solicitudesMock";
import { ESTADOS, ETAPAS } from "../constants/estados";

// Almacén en memoria: se pierde al recargar. Cuando se conecte Firestore,
// estas funciones cambian de implementación pero no de nombre.
let almacen = solicitudesSeed.map((s) => ({ ...s, historial: [...s.historial] }));
let contador = almacen.length;

const copia = (s) => ({ ...s, historial: s.historial.map((h) => ({ ...h })) });

// Con jefe asignado, el permiso empieza en el jefe. Sin jefe (Carlos), va directo a la Analista.
export const etapaInicialPara = (usuario) =>
  usuario.jefeId ? ETAPAS.JEFE : ETAPAS.ANALISTA;

export function validarPermiso({ empresa, motivo, fecha }) {
  const errores = {};
  if (!empresa) errores.empresa = "Elige una empresa";
  if (!motivo || !motivo.trim()) errores.motivo = "Escribe el motivo";
  const formatoOk = /^\d{4}-\d{2}-\d{2}$/.test(fecha || "");
  if (!formatoOk || isNaN(new Date(`${fecha}T00:00:00`).getTime())) {
    errores.fecha = "Usa el formato AAAA-MM-DD";
  }
  return errores;
}

export function crearPermiso(usuario, datos) {
  const errores = validarPermiso(datos);
  if (Object.keys(errores).length) return { ok: false, errores };

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
    return { ok: false, errores: { general: "No puedes modificar esta solicitud" } };
  }
  if (actual.estado !== ESTADOS.RECHAZADA) {
    return { ok: false, errores: { general: "Solo se modifican las solicitudes rechazadas" } };
  }
  const errores = validarPermiso(datos);
  if (Object.keys(errores).length) return { ok: false, errores };

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

// Solo las pendientes de su personal que están en la etapa del jefe
export function pendientesDeEquipo(jefe) {
  if (jefe.rol !== "JEFE") return [];
  const equipo = equipoDe(jefe);
  return almacen
    .filter(
      (s) =>
        s.estado === ESTADOS.PENDIENTE &&
        s.etapaActual === ETAPAS.JEFE &&
        equipo.includes(s.empleadoUid),
    )
    .map(copia)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

// Decide en la etapa del jefe. Devuelve { ok, error }.
export function decidir(usuario, id, accion, motivo = "") {
  const actual = almacen.find((s) => s.id === id);
  if (!actual) return { ok: false, error: "La solicitud no existe" };
  if (actual.estado !== ESTADOS.PENDIENTE) {
    return { ok: false, error: "Esta solicitud ya no está pendiente" };
  }
  const puedeDecidir =
    usuario.rol === "JEFE" &&
    actual.etapaActual === ETAPAS.JEFE &&
    equipoDe(usuario).includes(actual.empleadoUid);
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
    : { etapaActual: ETAPAS.ANALISTA };

  almacen = almacen.map((s) =>
    s.id === id
      ? { ...s, ...cambios, historial: [...s.historial, registro] }
      : s,
  );
  return { ok: true };
}
