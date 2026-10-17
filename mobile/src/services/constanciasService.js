import { generarConstancia } from "../screens/constancias/generarConstancia";

let almacen = [];
let contador = 0;

const copia = (c) => ({ ...c });

// código de verificación que va en el QR
const nuevoCodigo = () =>
  `GC-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
    .toString(36)
    .slice(-4)
    .toUpperCase()}`;

export function crearConstancia(usuario, { tipo, destinatario, motivo }) {
  if (!destinatario?.trim() || !motivo?.trim()) {
    return { ok: false, error: "Completa todos los campos." };
  }
  contador += 1;
  const nueva = {
    id: `CON-${String(contador).padStart(3, "0")}`,
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
  almacen = [...almacen, nueva];
  return { ok: true, constancia: copia(nueva) };
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

export function resolverConstancia(usuario, id, decision, observacion = "") {
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

  almacen = almacen.map((c) => (c.id === id ? { ...c, ...cambios } : c));
  return { ok: true, constancia: obtenerConstancia(id) };
}
