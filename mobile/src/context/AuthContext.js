import { createContext, useContext, useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { escucharPermisos } from "../services/solicitudesService";
import { escucharVacaciones } from "../services/solicitudesVacacionesService";
import { escucharConstancias } from "../services/constanciasService";

const AuthContext = createContext(null);

const ROLES_APP = {
  Empleado: "EMPLEADO",
  JefeInmediato: "JEFE",
  AnalistaNomina: "ANALISTA",
  Gerente: "GERENTE",
  AsistentePlanilla: "RRHH",
};

const cargarPerfil = async (uid) => {
  const snap = await getDoc(doc(db, "usuarios", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  const rol = ROLES_APP[d.rol];
  if (!rol || d.activo === false) return null;
  return {
    ...d,
    id: uid,
    correo: d.email,
    codigo: d.empleadoId,
    rol,
    apellido: d.apellido || "",
    jefeId: d.jefeId || null,
    fotoUrl: d.fotoUrl || null,
    notificacionesLeidas: d.notificacionesLeidas || [],
  };
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, async (user) => {
      const perfil = user
        ? await cargarPerfil(user.uid).catch(() => null)
        : null;
      setUsuario(perfil);
      setCargando(false);
    });
    return cancelar;
  }, []);

  useEffect(() => {
    if (!usuario) return;
    const refrescar = () => setUsuario((u) => (u ? { ...u } : u));
    const dejarPermisos = escucharPermisos(usuario, refrescar);
    const dejarVacaciones = escucharVacaciones(usuario, refrescar);
    const dejarConstancias = escucharConstancias(usuario, refrescar);
    return () => {
      dejarPermisos();
      dejarVacaciones();
      dejarConstancias();
    };
  }, [usuario?.id]);

  const login = async (correo, clave) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, correo.trim(), clave);
      const perfil = await cargarPerfil(cred.user.uid);
      if (!perfil) {
        await signOut(auth);
        return { ok: false, mensaje: "Este usuario no tiene acceso a la app" };
      }
      setUsuario(perfil);
      return { ok: true };
    } catch (e) {
      if (e.code === "auth/network-request-failed") {
        return { ok: false, mensaje: "Sin conexión a internet" };
      }
      if (e.code === "auth/too-many-requests") {
        return { ok: false, mensaje: "Demasiados intentos, espere un momento" };
      }
      return { ok: false, mensaje: "Correo o contraseña incorrectos" };
    }
  };

  const logout = () => signOut(auth);

  const actualizarFoto = (uri) => {
    setUsuario((prev) => ({ ...prev, fotoUrl: uri }));
  };

  const actualizarNotificacionesLeidas = (nuevasLeidas) => {
    setUsuario((prev) => ({ ...prev, notificacionesLeidas: nuevasLeidas }));
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }
  return (
    <AuthContext.Provider value={{ usuario, login, logout, actualizarFoto, actualizarNotificacionesLeidas }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);