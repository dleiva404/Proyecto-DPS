import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";

const TAMANO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function subirFotoPerfil(
  uid: string,
  archivo: File,
): Promise<string> {
  if (!archivo.type.startsWith("image/")) {
    throw new Error(
      "Selecciona un archivo de imagen válido (JPG, PNG o WebP).",
    );
  }

  if (archivo.size > TAMANO_MAX_BYTES) {
    throw new Error("La imagen no debe superar los 5 MB.");
  }

  // Se guarda en una ruta fija por usuario para reemplazar la foto anterior sin acumular archivos
  const storageRef = ref(storage, `fotos_perfil/${uid}.jpg`);
  await uploadBytes(storageRef, archivo, {
    contentType: archivo.type,
  });

  const url = await getDownloadURL(storageRef);

  await updateDoc(doc(db, "usuarios", uid), {
    fotoUrl: url,
  });

  return url;
}