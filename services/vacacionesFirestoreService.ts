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
import { db } from "@/lib/firebase";
import type { UsuarioSistema } from "@/types/usuario";
import {
  ETAPA_DE_ROL,
  type Etapa,
  type Vacacion,
} from "@/types/solicitudesFirestore";
import {
  contarDiasHabiles,
  calcularDiasDisponibles,
  ultimoAniversario,
} from "./vacacionesService";

const vacacionesRef = collection(db, "vacaciones");

const nombreDe = (u: UsuarioSistema) =>
  `${u.nombre} ${u.apellido ?? ""}`.trim();

export function escucharVacaciones(
  usuario: UsuarioSistema,
  alCambiar: (lista: Vacacion[]) => void,
) {
  const consulta =
    usuario.rol === "Empleado"
      ? query(vacacionesRef, where("empleadoUid", "==", usuario.uid))
      : vacacionesRef;
  return onSnapshot(
    consulta,
    (snap) =>
      alCambiar(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Vacacion)),
    () => alCambiar([]),
  );
}

// Analista -> Gerente -> Jefe, sin la etapa del propio solicitante
function etapasPara(usuario: UsuarioSistema): Etapa[] {
  const propia = ETAPA_DE_ROL[usuario.rol];
  return (["ANALISTA", "GERENTE", "JEFE"] as Etapa[]).filter((e) =>
    e === "JEFE" ? Boolean(usuario.jefeId) : e !== propia,
  );
}

export function saldoDisponible(
  usuario: UsuarioSistema,
  lista: Vacacion[],
  hoy = new Date(),
) {
  if (!usuario.fechaIngreso) return 0;
  const aniversario = ultimoAniversario(usuario.fechaIngreso, hoy);
  if (!aniversario) return 0;
  const desde = aniversario.toLocaleDateString("en-CA");
  const tomados = lista
    .filter(
      (v) =>
        v.empleadoUid === usuario.uid &&
        v.estado !== "Rechazada" &&
        v.fechaInicio >= desde,
    )
    .reduce((total, v) => total + Number(v.diasSolicitados || 0), 0);
  return calcularDiasDisponibles(usuario.fechaIngreso, tomados, hoy);
}

export async function crearVacaciones(
  usuario: UsuarioSistema,
  datos: { fechaInicio: string; fechaFin: string; motivo: string },
  lista: Vacacion[],
) {
  const { fechaInicio, fechaFin } = datos;
  const hoy = new Date().toLocaleDateString("en-CA");
  const esDomingo = (f: string) => new Date(`${f}T12:00:00`).getDay() === 0;

  if (!fechaInicio || !fechaFin || !datos.motivo.trim())
    throw new Error("Completa las fechas y el motivo.");
  if (fechaFin < fechaInicio)
    throw new Error("La fecha final no puede ser antes de la inicial.");
  if (fechaInicio < hoy)
    throw new Error("No puedes pedir vacaciones en fechas pasadas.");
  if (esDomingo(fechaInicio) || esDomingo(fechaFin))
    throw new Error("Las vacaciones no pueden iniciar ni terminar en domingo.");

  const diasSolicitados = contarDiasHabiles(fechaInicio, fechaFin);
  const saldo = saldoDisponible(usuario, lista);
  if (diasSolicitados > saldo)
    throw new Error(
      `Pides ${diasSolicitados} días y solo tienes ${saldo} disponibles.`,
    );

  const cruce = lista.find(
    (v) =>
      v.empleadoUid === usuario.uid &&
      v.estado !== "Rechazada" &&
      v.fechaInicio <= fechaFin &&
      fechaInicio <= v.fechaFin,
  );
  if (cruce)
    throw new Error(
      `Se cruza con tu solicitud del ${cruce.fechaInicio} al ${cruce.fechaFin}.`,
    );

  const etapas = etapasPara(usuario);
  const nueva: Omit<Vacacion, "id"> = {
    empleadoUid: usuario.uid,
    empleadoNombre: nombreDe(usuario),
    jefeUid: usuario.jefeId ?? null,
    departamento: usuario.departamento ?? "",
    empresa: usuario.empresa ?? "",
    tipo: "Vacaciones",
    fechaInicio,
    fechaFin,
    diasSolicitados,
    motivo: datos.motivo.trim(),
    estado: "Pendiente",
    etapas,
    etapaActual: etapas[0] ?? null,
    motivoRechazo: null,
    creadaEn: new Date().toISOString(),
    historial: [],
  };
  const ref = await addDoc(vacacionesRef, nueva);
  return { id: ref.id, etapaActual: nueva.etapaActual };
}

export function puedeDecidirVacacion(usuario: UsuarioSistema, v: Vacacion) {
  if (v.estado !== "Pendiente" || v.empleadoUid === usuario.uid) return false;
  if (v.etapaActual !== ETAPA_DE_ROL[usuario.rol]) return false;
  return v.etapaActual !== "JEFE" || v.jefeUid === usuario.uid;
}

export async function decidirVacacion(
  usuario: UsuarioSistema,
  v: Vacacion,
  accion: "Aprobado" | "Rechazado",
  motivo = "",
) {
  const rechazo = accion === "Rechazado";
  if (rechazo && !motivo.trim())
    throw new Error("El motivo del rechazo es obligatorio.");

  const etapas = v.etapas?.length
    ? v.etapas
    : (["ANALISTA", "GERENTE", "JEFE"] as Etapa[]);
  const siguiente = etapas[etapas.indexOf(v.etapaActual as Etapa) + 1] ?? null;

  const registro = {
    rol: v.etapaActual ?? "",
    decision: rechazo ? "Rechazar" : "Aprobar",
    responsable: nombreDe(usuario),
    motivo: motivo.trim(),
    fecha: new Date().toISOString(),
  };
  const cambios: Partial<Vacacion> = rechazo
    ? { estado: "Rechazada", etapaActual: null, motivoRechazo: motivo.trim() }
    : siguiente
      ? { etapaActual: siguiente }
      : { estado: "Aprobada", etapaActual: null };

  await updateDoc(doc(db, "vacaciones", v.id), {
    ...cambios,
    historial: arrayUnion(registro),
  });
  return cambios.etapaActual;
}
