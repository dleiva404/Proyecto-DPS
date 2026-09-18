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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-3xl shadow-md border border-slate-200/80 p-10"
      >
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <Image src="/LogoGC.png" alt="Logo Grupo Calma" width={68} height={68} className="object-contain" />
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Gestión Recursos Humanos</h1>
            <p className="text-xs text-slate-400 mt-0.5">Grupo Calma</p>
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-6">
          Ingrese sus credenciales para continuar
        </p>

        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Correo</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="rrhh@didelco.com"
          className="w-full mb-5 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700"
        />

        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Contraseña / PIN</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full mb-6 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700"
        />

        {error && <p className="text-xs text-rose-600 mb-4 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition shadow-sm"
        >
          {enviando ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
}