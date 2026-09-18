"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Rol } from "@/types/usuario";

interface Props {
  children: React.ReactNode;
  rolesPermitidos?: Rol[]; // si se omite, solo exige sesión iniciada (cualquier rol)
}

export default function ProtectedRoute({ children, rolesPermitidos }: Props) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;

    if (!usuario) {
      router.replace("/login");
      return;
    }

    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
      router.replace("/"); // o una página de "no autorizado"
    }
  }, [usuario, cargando, rolesPermitidos, router]);

  if (cargando) {
    return <div className="p-6 text-center text-gray-600">Verificando sesión...</div>;
  }

  if (!usuario) return null;
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) return null;

  return <>{children}</>;
}
