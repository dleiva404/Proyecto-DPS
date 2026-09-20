"use client";

import { useCallback, useEffect, useState } from "react";

type Solicitud = {
  id: string;
  empleadoId?: string;
  tipo?: string;
  fechaHorario?: string;
  empresa?: string;
  estado?: string;
};

type ApiResponse = {
  success: boolean;
  total: number;
  data: Solicitud[];
};

export default function IntegracionApiPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarSolicitudes = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const respuesta = await fetch("/api/solicitudes", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!respuesta.ok) {
        throw new Error(
          `Error ${respuesta.status}: no se pudieron obtener las solicitudes`
        );
      }

      const resultado: ApiResponse = await respuesta.json();

      if (!resultado.success || !Array.isArray(resultado.data)) {
        throw new Error("La API devolvió una respuesta no válida");
      }

      setSolicitudes(resultado.data);
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado al consultar la API.";

      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Integración API REST
        </h1>

        <p className="mb-6 text-gray-600">
          Consumo del endpoint GET /api/solicitudes mediante Fetch API.
        </p>

        {cargando && (
          <div className="rounded-lg border bg-white p-6 text-center">
            <p className="font-medium text-gray-700">
              Cargando solicitudes...
            </p>
          </div>
        )}

        {!cargando && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-700">
              Error al consultar la API
            </h2>

            <p className="mt-2 text-red-600">{error}</p>

            <button
              type="button"
              onClick={cargarSolicitudes}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
            >
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && (
          <>
            <div className="mb-4 rounded-lg border bg-white p-4">
              <p className="font-semibold text-green-700">
                API consultada correctamente
              </p>
              <p className="text-gray-600">
                Solicitudes recibidas: {solicitudes.length}
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full text-left">
                <thead className="border-b bg-gray-100 text-gray-900">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Empleado</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Empresa</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>

                <tbody className="text-gray-900">
                  {solicitudes.map((solicitud) => (
                    <tr key={solicitud.id} className="border-b">
                      <td className="p-3">{solicitud.id}</td>
                      <td className="p-3">{solicitud.empleadoId ?? "-"}</td>
                      <td className="p-3">{solicitud.tipo ?? "-"}</td>
                      <td className="p-3">
                        {solicitud.fechaHorario ?? "-"}
                      </td>
                      <td className="p-3">{solicitud.empresa ?? "-"}</td>
                      <td className="p-3">{solicitud.estado ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={cargarSolicitudes}
              className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-white"
            >
              Actualizar datos
            </button>
          </>
        )}
      </div>
    </main>
  );
}