import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import { ESTADOS, ETAPAS } from "../constants/estados";
import { listarVacacionesEmpleado } from "./solicitudesVacacionesService";
import { nombreFeriado } from "./vacacionesService";

let almacen = [];
const permisosRef = collection(db, "permisos");

export function escucharPermisos(usuario, alCambiar) {
  const consulta =
    usuario.rol === "EMPLEADO"
      ? query(permisosRef, where("empleadoUid", "==", usuario.id))
      : permisosRef;
  return onSnapshot(
    consulta,
    (snap) => {
      almacen = snap.docs.map((d) => ({
        id: d.id,
        historial: [],
        ...d.data(),
      }));
      alCambiar?.();
    },
    () => {
      almacen = [];
    },
  );
}

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

export async function crearPermiso(usuario, datos) {
  const errores = validarPermiso(datos);
  if (Object.keys(errores).length) return { ok: false, errores };
  const choque = choquePermiso(usuario, datos.fecha);
  if (choque) return { ok: false, errores: { fecha: choque } };
  const nueva = {
    empleadoUid: usuario.id,
    empleadoNombre: `${usuario.nombre} ${usuario.apellido}`.trim(),
    jefeUid: usuario.jefeId || null,
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
  try {
    const ref = await addDoc(permisosRef, nueva);
    return { ok: true, solicitud: { id: ref.id, ...nueva } };
  } catch {
    return {
      ok: false,
      errores: { general: "No se pudo guardar, intenta de nuevo" },
    };
  }
}

// Para "Modificar": solo el dueño, y solo si fue rechazada. Vuelve a Pendiente; el historial se conserva.
export async function actualizarPermiso(usuario, id, datos) {
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
  try {
    await updateDoc(doc(db, "permisos", id), cambios);
    return { ok: true, solicitud: copia({ ...actual, ...cambios }) };
  } catch {
    return {
      ok: false,
      errores: { general: "No se pudo guardar, intenta de nuevo" },
    };
  }
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

// Nadie decide sobre su propia solicitud.
function puedeDecidirPermiso(usuario, s) {
  if (s.estado !== ESTADOS.PENDIENTE || s.empleadoUid === usuario.id)
    return false;
  if (s.etapaActual === ETAPAS.JEFE) {
    return usuario.rol === "JEFE" && s.jefeUid === usuario.id;
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

export async function decidir(usuario, id, accion, motivo = "") {
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

  try {
    await updateDoc(doc(db, "permisos", id), {
      ...cambios,
      historial: arrayUnion(registro),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo guardar, intenta de nuevo" };
  }
}
