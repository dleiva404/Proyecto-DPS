"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
      >
        {/* Logo y Encabezado */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <Image src="/LogoGC.png" alt="Logo Grupo Calma" width={40} height={40} className="object-contain" />
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Gestión Recursos Humanos</h1>
            <p className="text-xs text-slate-400">Grupo Calma</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          Ingrese sus credenciales para continuar
        </p>

        <label className="block text-xs font-semibold text-slate-700 mb-1">Correo</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="rrhh@didelco.com"
          className="w-full mb-4 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700"
        />

        <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña / PIN</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full mb-4 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700"
        />

        {error && <p className="text-xs text-rose-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-sm"
        >
          {enviando ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
}