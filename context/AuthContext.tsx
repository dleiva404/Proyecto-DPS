"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UsuarioSistema } from "@/types/usuario";

const MSG_CUENTA_DESACTIVADA = "Cuenta desactivada. Contacta a un Administrador de TI.";
const MSG_SIN_PERFIL = "No se encontró tu perfil. Contacta a un Administrador de TI.";
const MSG_ERROR_PERFIL =
  "No se pudo cargar tu perfil. Intenta de nuevo o contacta a un Administrador de TI.";

// Cierra la sesión sin propagar errores (el motivo ya quedó registrado en authError)
const cerrarSesion = () => signOut(auth).catch(() => {});

interface AuthContextValue {
  usuario: UsuarioSistema | null;
  firebaseUser: FirebaseUser | null;
  cargando: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);
  const [cargando, setCargando] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Cada evento se numera: si llega uno nuevo (p. ej. el signOut() disparado desde este
    // mismo callback), el anterior queda obsoleto y no debe pisar el estado más reciente
    let ultimoEvento = 0;

    // Se dispara cada vez que cambia el estado de sesión (login/logout/refresh)
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      const evento = ++ultimoEvento;

      // Mientras se resuelve el perfil (también tras un login) la app sigue "cargando"
      setCargando(true);
      setFirebaseUser(fbUser);

      try {
        if (!fbUser) {
          setUsuario(null);
          return;
        }

        // El uid de Firebase Auth es la llave del documento en Firestore
        const ref = doc(db, "usuarios", fbUser.uid);
        const snap = await getDoc(ref);
        if (evento !== ultimoEvento) return;

        if (!snap.exists()) {
          // El usuario existe en Auth pero no tiene documento de rol asignado en Firestore
          console.error(
            `No existe documento en usuarios/${fbUser.uid}. Pide al Administrador de TI que lo cree.`
          );
          setUsuario(null);
          setAuthError(MSG_SIN_PERFIL);
          await cerrarSesion();
          return;
        }

        const data = snap.data();
        if (data.activo === false) {
          setUsuario(null);
          setAuthError(MSG_CUENTA_DESACTIVADA);
          await cerrarSesion();
          return;
        }

        setUsuario({ uid: fbUser.uid, ...data } as UsuarioSistema);
      } catch (error) {
        if (evento !== ultimoEvento) return;

        // Falló la lectura del perfil (red o reglas de Firestore)
        console.error("Error al leer el perfil del usuario:", error);
        setUsuario(null);
        setAuthError(MSG_ERROR_PERFIL);
        await cerrarSesion();
      } finally {
        if (evento === ultimoEvento) setCargando(false);
      }
    });

    return () => {
      ultimoEvento++;
      unsubscribe();
    };
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged se encarga de actualizar el estado tras el login
  }

  async function logout() {
    await signOut(auth);
  }

  function clearAuthError() {
    setAuthError(null);
  }

  return (
    <AuthContext.Provider
      value={{ usuario, firebaseUser, cargando, authError, login, logout, clearAuthError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  return ctx;
}
