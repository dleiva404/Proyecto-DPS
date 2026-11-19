"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  escucharConstancias,
  crearConstancia,
  puedeAutorizar,
  resolverConstancia,
  type ConstanciaFirestore,
  type TipoConstancia,
} from "@/services/constanciasFirestoreService";
import {
  generarConstanciaPDF,
  descargarPDF,
} from "@/services/constanciasServices";

function formatearFechaHoy(): string {
  const texto = new Date().toLocaleDateString("es-SV", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatearFechaCorta(fechaISO?: string): string {
  if (!fechaISO) return "—";
  const fecha = new Date(
    fechaISO.includes("T") ? fechaISO : `${fechaISO}T12:00:00`,
  );
  if (Number.isNaN(fecha.getTime())) return fechaISO;
  return fecha.toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatearTipoConstancia(tipo: string): string {
  return tipo.toLowerCase().startsWith("constancia")
    ? tipo
    : `Constancia ${tipo}`;
}

const badgeEstado: Record<string, string> = {
  Pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  Aprobada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rechazada: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function ConstanciasPage() {
  const { usuario } = useAuth();
  const [constancias, setConstancias] = useState<ConstanciaFirestore[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);

  // Estado del formulario de nueva solicitud
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipo, setTipo] = useState<TipoConstancia>("laboral");
  const [destinatario, setDestinatario] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Estado para aprobar / rechazar y generar PDF
  const [rechazando, setRechazando] = useState(false);
  const [observacionRechazo, setObservacionRechazo] = useState("");
  const [procesandoDecision, setProcesandoDecision] = useState(false);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    setCargando(true);
    const unsub = escucharConstancias(usuario, (lista) => {
      setConstancias(lista);
      setCargando(false);
    });
    return () => unsub();
  }, [usuario]);

  const solicitud =
    constancias.find((c) => c.id === seleccionadaId) ?? constancias[0] ?? null;

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    setEnviando(true);
    try {
      const creada = await crearConstancia(usuario, {
        tipo,
        destinatario,
        motivo,
      });
      setSeleccionadaId(creada.id);
      setDestinatario("");
      setMotivo("");
      setTipo("laboral");
      setMostrarForm(false);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo crear la solicitud.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleAprobar = async () => {
    if (!usuario || !solicitud) return;
    setProcesandoDecision(true);
    try {
      await resolverConstancia(usuario, solicitud, "Aprobada");
      setRechazando(false);
      setObservacionRechazo("");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo aprobar la constancia.",
      );
    } finally {
      setProcesandoDecision(false);
    }
  };

  const handleConfirmarRechazo = async () => {
    if (!usuario || !solicitud) return;
    setProcesandoDecision(true);
    try {
      await resolverConstancia(
        usuario,
        solicitud,
        "Rechazada",
        observacionRechazo,
      );
      setRechazando(false);
      setObservacionRechazo("");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo rechazar la constancia.",
      );
    } finally {
      setProcesandoDecision(false);
    }
  };

  const handleGenerar = async () => {
    if (!solicitud || solicitud.estado !== "Aprobada") return;
    setGenerando(true);
    try {
      const partesNombre = solicitud.empleado.trim().split(" ");
      const nombre = partesNombre[0] ?? solicitud.empleado;
      const apellido = partesNombre.slice(1).join(" ");

      const { pdfBytes, verificacionId } = await generarConstanciaPDF({
        codigo: solicitud.codigo || "SIN-CODIGO",
        nombre,
        apellido,
        cargo: solicitud.cargo || "Colaborador",
        area: solicitud.departamento || "General",
        empresa: solicitud.empresa || "Grupo Calma",
        tipo: solicitud.tipo.toLowerCase().includes("salari")
          ? "Constancia Salarial"
          : "Constancia Laboral",
        dirigidaA: solicitud.destinatario,
        salario:
          solicitud.salario != null
            ? `$${Number(solicitud.salario).toFixed(2)}`
            : "$0.00",
        fechaPeticion: formatearFechaCorta(solicitud.creadaEn),
        fechaContratacion: solicitud.fechaIngreso || undefined,
        aprobadoPor: solicitud.autorizadoPor,
      });

      const nombreArchivo = `constancia-${solicitud.codigo || solicitud.id}-${verificacionId.slice(0, 8)}.pdf`;
      descargarPDF(pdfBytes, nombreArchivo);
    } catch (error) {
      console.error("Error generando la constancia:", error);
      alert("Ocurrió un error al generar la constancia.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="p-8 flex-1">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestión de constancias
          </h1>
          <p className="text-xs text-slate-500 mt-1">{formatearFechaHoy()}</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          {mostrarForm ? "Cerrar formulario" : "Nueva Solicitud"}
        </button>
      </div>

      {/* Formulario de Nueva Solicitud */}
      {mostrarForm && (
        <form
          onSubmit={handleCrear}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-6 space-y-4"
        >
          <h2 className="text-sm font-bold text-slate-800">
            Solicitar nueva constancia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de constancia
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoConstancia)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="laboral">Constancia Laboral</option>
                <option value="salarial">Constancia Salarial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dirigida a (Destinatario)
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Banco Agrícola, Embajada, A quien corresponda"
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo de la solicitud
            </label>
            <textarea
              rows={2}
              required
              placeholder="Describe brevemente para qué necesitas la constancia..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold px-5 py-2 rounded-xl transition"
            >
              {enviando ? "Enviando..." : "Enviar solicitud"}
            </button>
          </div>
        </form>
      )}

      {/* Lista de constancias reales */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800">
            Solicitudes registradas ({constancias.length})
          </h2>
        </div>

        {cargando ? (
          <p className="p-6 text-xs text-slate-500">Cargando constancias...</p>
        ) : constancias.length === 0 ? (
          <p className="p-6 text-xs text-slate-500">
            No hay constancias registradas todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase text-slate-400">
                  <th className="py-3 px-6">Empleado</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Destinatario</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-6">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {constancias.map((c) => {
                  const activa = solicitud?.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => {
                        setSeleccionadaId(c.id);
                        setRechazando(false);
                        setObservacionRechazo("");
                      }}
                      className={`cursor-pointer transition ${
                        activa ? "bg-blue-50/60" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        {c.empleado}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 capitalize">
                        {formatearTipoConstancia(c.tipo)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {c.destinatario}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatearFechaCorta(c.creadaEn)}
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            badgeEstado[c.estado] ??
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {c.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detalle de la constancia seleccionada */}
      {solicitud && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">
              Información del empleado:
            </h2>
            <h2 className="text-base font-bold text-slate-800">
              Detalles de la petición:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-800">Empleado</p>
                <p className="text-slate-500 mt-0.5">{solicitud.empleado}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Cargo</p>
                <p className="text-slate-500 mt-0.5">
                  {solicitud.cargo || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Departamento</p>
                <p className="text-slate-500 mt-0.5">
                  {solicitud.departamento || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Empresa</p>
                <p className="text-slate-500 mt-0.5">
                  {solicitud.empresa || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Fecha de ingreso
                </p>
                <p className="text-slate-500 mt-0.5">
                  {solicitud.fechaIngreso || "—"}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-800">Tipo</p>
                <p className="text-slate-500 mt-0.5 capitalize">
                  {formatearTipoConstancia(solicitud.tipo)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Dirigida a</p>
                <p className="text-slate-500 mt-0.5">
                  {solicitud.destinatario}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Motivo</p>
                <p className="text-slate-500 mt-0.5">{solicitud.motivo}</p>
              </div>
              {solicitud.tipo.toLowerCase().includes("salari") && (
                <div>
                  <p className="text-xs font-bold text-slate-800">Salario</p>
                  <p className="text-slate-500 mt-0.5">
                    {solicitud.salario != null
                      ? `$${Number(solicitud.salario).toFixed(2)}`
                      : "No especificado"}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-800">Estado</p>
                <p className="text-slate-500 mt-0.5">{solicitud.estado}</p>
              </div>
              {solicitud.observacion && (
                <div>
                  <p className="text-xs font-bold text-rose-700">
                    Observación
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    {solicitud.observacion}
                  </p>
                </div>
              )}
              {solicitud.autorizadoPor && (
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Autorizado por
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {solicitud.autorizadoPor} ({solicitud.codigo})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Campo de observación al rechazar */}
          {rechazando && (
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 mb-4 space-y-3">
              <label className="block text-xs font-bold text-rose-800">
                Motivo del rechazo (obligatorio)
              </label>
              <input
                type="text"
                placeholder="Escribe por qué se rechaza esta constancia..."
                value={observacionRechazo}
                onChange={(e) => setObservacionRechazo(e.target.value)}
                className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-rose-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRechazando(false);
                    setObservacionRechazo("");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={procesandoDecision}
                  onClick={handleConfirmarRechazo}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition"
                >
                  {procesandoDecision ? "Guardando..." : "Confirmar rechazo"}
                </button>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
            {puedeAutorizar(usuario, solicitud) && (
              <>
                <button
                  onClick={handleAprobar}
                  disabled={procesandoDecision}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
                >
                  Autorizar
                </button>
                <button
                  onClick={() => setRechazando(true)}
                  disabled={procesandoDecision}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-5 py-2.5 rounded-xl transition border border-rose-200"
                >
                  Rechazar
                </button>
              </>
            )}

            {solicitud.estado === "Aprobada" && (
              <button
                onClick={handleGenerar}
                disabled={generando}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-16 0h16v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z"
                  />
                </svg>
                {generando ? "Generando..." : "Generar PDF"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}