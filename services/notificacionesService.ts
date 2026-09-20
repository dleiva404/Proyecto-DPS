import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Notificacion {
  id: string;
  rolDestino: string;
  mensaje: string;
  leida: boolean;
  fecha: string; // ISO
  solicitudId?: string;
}

const notificacionesRef = collection(db, "notificaciones");

export async function crearNotificacion(
  rolDestino: string,
  mensaje: string,
  solicitudId?: string,
): Promise<void> {
  await addDoc(notificacionesRef, {
    rolDestino,
    mensaje,
    leida: false,
    fecha: new Date().toISOString(),
    ...(solicitudId ? { solicitudId } : {}),
  });
}

export function escucharNotificacionesNoLeidas(
  rol: string,
  callback: (notificaciones: Notificacion[]) => void,
): Unsubscribe {
  const q = query(
    notificacionesRef,
    where("rolDestino", "==", rol),
    where("leida", "==", false),
  );

  return onSnapshot(q, (snapshot) => {
    const lista = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Notificacion[];

    lista.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
    callback(lista);
  });
}

export async function marcarComoLeida(id: string): Promise<void> {
  await updateDoc(doc(db, "notificaciones", id), { leida: true });
}
