"use client";

import { Search, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Primeras letras de las dos primeras palabras del nombre ("Carlos Calderón" -> "CC")
function obtenerIniciales(nombre?: string): string {
  const palabras = nombre?.trim().split(/\s+/).filter(Boolean) ?? [];
  return palabras.slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";
}

export default function Header() {
  const { usuario } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="relative w-96">
        <Search className="absolute inset-y-0 left-3 my-auto w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar empleado o solicitud..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-700 focus:outline-none focus:border-blue-500"
        />
      </div>
      
      <div className="flex items-center gap-5">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">{usuario?.nombre ?? ""}</p>
            <p className="text-xs text-slate-400">{usuario?.rol ?? ""}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">
            {obtenerIniciales(usuario?.nombre)}
          </div>
        </div>
      </div>
    </header>
  );
}