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
import { ETAPA_DE_ROL, type Permiso } from "@/types/solicitudesFirestore";

const permisosRef = collection(db, "permisos");

const nombreDe = (u: UsuarioSistema) =>
  `${u.nombre} ${u.apellido ?? ""}`.trim();

export function escucharPermisos(
  usuario: UsuarioSistema,
  alCambiar: (lista: Permiso[]) => void,
) {
  const consulta =
    usuario.rol === "Empleado"
      ? query(permisosRef, where("empleadoUid", "==", usuario.uid))
      : permisosRef;
  return onSnapshot(
    consulta,
    (snap) =>
      alCambiar(
        snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Permiso,
        ),
      ),
    () => alCambiar([]),
  );
}

export async function crearPermiso(
  usuario: UsuarioSistema,
  datos: { fecha: string; motivo: string; empresa: string },
) {
  const hoy = new Date().toLocaleDateString("en-CA");
  if (!datos.fecha || !datos.motivo.trim())
    throw new Error("Completa la fecha y el motivo.");
  if (new Date(`${datos.fecha}T12:00:00`).getDay() === 0)
    throw new Error("El domingo no se trabaja.");
  if (datos.fecha < hoy)
    throw new Error("No puedes pedir permiso para un día que ya pasó.");

  const nuevo: Omit<Permiso, "id"> = {
    empleadoUid: usuario.uid,
    empleadoNombre: nombreDe(usuario),
    jefeUid: usuario.jefeId ?? null,
    departamento: usuario.departamento ?? "",
    empresa: datos.empresa || usuario.empresa || "",
    tipo: "Permiso Personal",
    motivo: datos.motivo.trim(),
    fecha: datos.fecha,
    estado: "Pendiente",
    etapaActual: usuario.jefeId ? "JEFE" : "ANALISTA",
    motivoRechazo: null,
    creadaEn: new Date().toISOString(),
    historial: [],
  };
  const ref = await addDoc(permisosRef, nuevo);
  return { id: ref.id, etapaActual: nuevo.etapaActual };
}

export function puedeDecidirPermiso(
  usuario: UsuarioSistema,
  p: Permiso,
  analistaDisponible = true,
) {
  if (p.estado !== "Pendiente" || p.empleadoUid === usuario.uid) return false;
  if (p.etapaActual === "JEFE")
    return usuario.rol === "JefeInmediato" && p.jefeUid === usuario.uid;
  if (p.etapaActual === "ANALISTA")
    return (
      usuario.rol === "AnalistaNomina" ||
      (usuario.rol === "Gerente" && !analistaDisponible)
    );
  return false;
}

export async function decidirPermiso(
  usuario: UsuarioSistema,
  p: Permiso,
  accion: "Aprobado" | "Rechazado",
  motivo = "",
) {
  const rechazo = accion === "Rechazado";
  if (rechazo && !motivo.trim())
    throw new Error("El motivo del rechazo es obligatorio.");

  const registro = {
    rol: ETAPA_DE_ROL[usuario.rol] ?? usuario.rol,
    accion,
    responsable: nombreDe(usuario),
    fecha: new Date().toISOString(),
    ...(rechazo ? { motivo: motivo.trim() } : {}),
  };
  const cambios: Partial<Permiso> = rechazo
    ? { estado: "Rechazada", etapaActual: null, motivoRechazo: motivo.trim() }
    : p.etapaActual === "JEFE"
      ? { etapaActual: "ANALISTA" }
      : { estado: "Aprobada", etapaActual: null };

  await updateDoc(doc(db, "permisos", p.id), {
    ...cambios,
    historial: arrayUnion(registro),
  });
  return cambios.etapaActual;
}
