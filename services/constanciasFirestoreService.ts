import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UsuarioSistema } from "@/types/usuario";
import { calcularTiempoServicio } from "./constanciasServices";

export type TipoConstancia = "laboral" | "salarial";
export type EstadoConstancia = "Pendiente" | "Aprobada" | "Rechazada";

export interface ConstanciaFirestore {
  id: string;
  empleadoUid: string;
  empleado: string;
  empleadoRol: string;
  cargo: string;
  departamento: string;
  empresa: string;
  fechaIngreso: string;
  salario: number | null;
  tipo: TipoConstancia;
  destinatario: string;
  motivo: string;
  estado: EstadoConstancia;
  observacion: string;
  creadaEn: string;
  autorizadoPor?: string;
  autorizadoRol?: string;
  codigo?: string;
  fechaEmision?: string;
  antiguedad?: string | null;
}

const constanciasRef = collection(db, "constancias");

// Mapeo de roles web -> app móvil
const ROL_APP: Record<string, string> = {
  Empleado: "EMPLEADO",
  JefeInmediato: "JEFE",
  AnalistaNomina: "ANALISTA",
  Gerente: "GERENTE",
  AsistentePlanilla: "RRHH",
};

const nombreDe = (u: UsuarioSistema) =>
  `${u.nombre} ${u.apellido ?? ""}`.trim();

// Código de verificación para el QR (GC-XXXX-XXXX)
const nuevoCodigo = () =>
  `GC-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
    .toString(36)
    .slice(-4)
    .toUpperCase()}`;

export function escucharConstancias(
  usuario: UsuarioSistema,
  alCambiar: (lista: ConstanciaFirestore[]) => void,
) {
  const consulta =
    usuario.rol === "Empleado"
      ? query(constanciasRef, where("empleadoUid", "==", usuario.uid))
      : constanciasRef;

  return onSnapshot(
    consulta,
    (snap) => {
      const lista = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as ConstanciaFirestore)
        .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));
      alCambiar(lista);
    },
    () => alCambiar([]),
  );
}

export async function crearConstancia(
  usuario: UsuarioSistema,
  datos: { tipo: TipoConstancia; destinatario: string; motivo: string },
) {
  if (!datos.destinatario.trim() || !datos.motivo.trim()) {
    throw new Error("Completa el destinatario y el motivo.");
  }

  const nueva: Omit<ConstanciaFirestore, "id"> = {
    empleadoUid: usuario.uid,
    empleado: nombreDe(usuario),
    empleadoRol: ROL_APP[usuario.rol] ?? usuario.rol.toUpperCase(),
    cargo: usuario.puesto ?? "",
    departamento: usuario.departamento ?? "",
    empresa: usuario.empresa ?? "",
    fechaIngreso: usuario.fechaIngreso ?? "",
    salario: usuario.salario ?? null,
    tipo: datos.tipo,
    destinatario: datos.destinatario.trim(),
    motivo: datos.motivo.trim(),
    estado: "Pendiente",
    observacion: "",
    creadaEn: new Date().toISOString(),
  };

  const ref = await addDoc(constanciasRef, nueva);
  return { id: ref.id, ...nueva };
}

export function puedeAutorizar(
  usuario: UsuarioSistema | null,
  c: ConstanciaFirestore,
) {
  if (!usuario || c.estado !== "Pendiente" || c.empleadoUid === usuario.uid) {
    return false;
  }
  if (usuario.rol === "AsistentePlanilla") return true;
  return usuario.rol === "Gerente" && c.empleadoRol === "RRHH";
}

export async function resolverConstancia(
  usuario: UsuarioSistema,
  c: ConstanciaFirestore,
  decision: "Aprobada" | "Rechazada",
  observacion = "",
) {
  if (!puedeAutorizar(usuario, c)) {
    throw new Error("No tienes permiso para resolver esta constancia.");
  }
  if (decision === "Rechazada" && !observacion.trim()) {
    throw new Error("La observación es obligatoria al rechazar.");
  }

  const cambios: Partial<ConstanciaFirestore> = {
    estado: decision,
    observacion: observacion.trim(),
  };

  if (decision === "Aprobada") {
    cambios.autorizadoPor = nombreDe(usuario);
    cambios.autorizadoRol =
      usuario.rol === "AsistentePlanilla" ? "RRHH" : "Gerente";
    cambios.codigo = nuevoCodigo();
    cambios.fechaEmision = new Date().toLocaleDateString("en-CA");
    cambios.antiguedad = c.fechaIngreso ? calcularTiempoServicio(c.fechaIngreso) : null;
    
  }

  await updateDoc(doc(db, "constancias", c.id), cambios);
  return { ...c, ...cambios };
}