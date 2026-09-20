"use client";

import { useEffect, useState } from "react";
import { Search, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  escucharNotificacionesNoLeidas,
  marcarComoLeida,
  type Notificacion,
} from "@/services/notificacionesService";

// Primeras letras de las dos primeras palabras del nombre ("Carlos Calderón" -> "CC")
function obtenerIniciales(nombre?: string): string {
  const palabras = nombre?.trim().split(/\s+/).filter(Boolean) ?? [];
  return (
    palabras
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export default function Header() {
  const { usuario } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [panelAbierto, setPanelAbierto] = useState(false);

  useEffect(() => {
    if (!usuario?.rol) return;
    const cancelar = escucharNotificacionesNoLeidas(
      usuario.rol,
      setNotificaciones,
    );
    return () => cancelar();
  }, [usuario?.rol]);

  const abrirNotificacion = async (n: Notificacion) => {
    await marcarComoLeida(n.id);
  };

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
        <div className="relative">
          <button
            onClick={() => setPanelAbierto((v) => !v)}
            className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notificaciones.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                {notificaciones.length}
              </span>
            )}
          </button>

          {panelAbierto && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setPanelAbierto(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-800">
                    Notificaciones
                  </p>
                </div>

                {notificaciones.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-slate-400">
                    No tienes notificaciones nuevas.
                  </p>
                ) : (
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notificaciones.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => abrirNotificacion(n)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <p className="text-xs text-slate-700">{n.mensaje}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.fecha).toLocaleString("es-SV", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">
              {usuario?.nombre ?? ""}
            </p>
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
