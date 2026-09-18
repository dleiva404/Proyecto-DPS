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

interface AuthContextValue {
  usuario: UsuarioSistema | null;
  firebaseUser: FirebaseUser | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [usuario, setUsuario] = useState<UsuarioSistema | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Se dispara cada vez que cambia el estado de sesión (login/logout/refresh)
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        // El uid de Firebase Auth es la llave del documento en Firestore
        const ref = doc(db, "usuarios", fbUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setUsuario({ uid: fbUser.uid, ...snap.data() } as UsuarioSistema);
        } else {
          // El usuario existe en Auth pero no tiene documento de rol asignado en Firestore
          console.error(
            `No existe documento en usuarios/${fbUser.uid}. Pide al Administrador de TI que lo cree.`
          );
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }

      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged se encarga de actualizar el estado tras el login
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ usuario, firebaseUser, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  return ctx;
}
