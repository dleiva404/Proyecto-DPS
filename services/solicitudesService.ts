import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Solicitud } from "@/types/solicitud";

const solicitudesRef = collection(db, "solicitudes");

export async function obtenerSolicitudes(): Promise<Solicitud[]> {
    const snapshot = await getDocs(solicitudesRef);

    return snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
    })) as Solicitud[];
}

export async function crearSolicitud(
    solicitud: Omit<Solicitud, "id">
): Promise<string> {
    const documento = await addDoc(solicitudesRef, solicitud);
    return documento.id;
}

export async function editarSolicitud(
    id: string,
    cambios: Partial<Omit<Solicitud, "id">>
): Promise<void> {
    await updateDoc(doc(db, "solicitudes", id), cambios);
}

export async function eliminarSolicitud(id: string): Promise<void> {
    await deleteDoc(doc(db, "solicitudes", id));
}