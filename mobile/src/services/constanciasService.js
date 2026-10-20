import { generarConstancia } from "../screens/constancias/generarConstancia";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

let almacen = [];
const constanciasRef = collection(db, "constancias");

export function escucharConstancias(usuario, alCambiar) {
  const consulta =
    usuario.rol === "EMPLEADO"
      ? query(constanciasRef, where("empleadoUid", "==", usuario.id))
      : constanciasRef;
  return onSnapshot(
    consulta,
    (snap) => {
      almacen = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      alCambiar?.();
    },
    () => {
      almacen = [];
    },
  );
}

const copia = (c) => ({ ...c });

// código de verificación que va en el QR
const nuevoCodigo = () =>
  `GC-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
    .toString(36)
    .slice(-4)
    .toUpperCase()}`;

export async function crearConstancia(usuario, { tipo, destinatario, motivo }) {
  if (!destinatario?.trim() || !motivo?.trim()) {
    return { ok: false, error: "Completa todos los campos." };
  }

  const nueva = {
    empleadoUid: usuario.id,
    empleado: `${usuario.nombre} ${usuario.apellido}`,
    empleadoRol: usuario.rol,
    cargo: usuario.puesto,
    departamento: usuario.departamento,
    empresa: usuario.empresa,
    fechaIngreso: usuario.fechaIngreso,
    salario: usuario.salario ?? null,
    tipo,
    destinatario: destinatario.trim(),
    motivo: motivo.trim(),
    estado: "Pendiente",
    observacion: "",
    creadaEn: new Date().toISOString(),
  };
  try {
    const ref = await addDoc(constanciasRef, nueva);
    return { ok: true, constancia: { id: ref.id, ...nueva } };
  } catch {
    return { ok: false, error: "No se pudo guardar, intenta de nuevo." };
  }
}

export function listarConstanciasPropias(usuario) {
  return almacen
    .filter((c) => c.empleadoUid === usuario.id)
    .map(copia)
    .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));
}

function puedeAutorizar(usuario, c) {
  if (!usuario || c.empleadoUid === usuario.id) return false;
  if (usuario.rol === "RRHH") return true;
  return usuario.rol === "GERENTE" && c.empleadoRol === "RRHH";
}

export function listarConstanciasPendientes(usuario) {
  return almacen
    .filter((c) => c.estado === "Pendiente" && puedeAutorizar(usuario, c))
    .map(copia)
    .sort((a, b) => a.creadaEn.localeCompare(b.creadaEn));
}

export function obtenerConstancia(id) {
  const encontrada = almacen.find((c) => c.id === id);
  return encontrada ? copia(encontrada) : null;
}

export async function resolverConstancia(
  usuario,
  id,
  decision,
  observacion = "",
) {
  const actual = almacen.find((c) => c.id === id);
  if (!actual) return { ok: false, error: "La constancia no existe." };
  if (!puedeAutorizar(usuario, actual)) {
    return { ok: false, error: "No puedes autorizar esta constancia." };
  }
  if (actual.estado !== "Pendiente") {
    return { ok: false, error: "Esta solicitud ya tiene una decisión." };
  }
  if (decision === "Rechazada" && !observacion.trim()) {
    return { ok: false, error: "Explica por qué se rechaza la constancia." };
  }

  let cambios = { estado: decision, observacion: observacion.trim() };
  if (decision === "Aprobada") {
    try {
      const documento = generarConstancia({
        ...actual,
        autorizadoPor: `${usuario.nombre} ${usuario.apellido}`,
        codigo: nuevoCodigo(),
      });
      const autorizadoRol = usuario.rol === "RRHH" ? "RRHH" : "Gerente";
      cambios = { ...cambios, ...documento, autorizadoRol };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  try {
    await updateDoc(doc(db, "constancias", id), cambios);
  } catch {
    return { ok: false, error: "No se pudo guardar, intenta de nuevo." };
  }
  return { ok: true, constancia: { ...actual, ...cambios } };
}
