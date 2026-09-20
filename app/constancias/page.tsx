"use client";

import React, { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import {
  generarConstanciaPDF,
  descargarPDF,
} from "@/services/constanciasServices";

const constanciasMock = [
  {
    id: "C-001",
    codigo: "EMP-5121",
    nombre: "Carlos Alberto",
    apellido: "Cornejo Calderon",
    cargo: "Gerente",
    area: "Tecnologia",
    empresa: "Didelco",
    tipo: "Constancia Laboral",
    dirigidaA: "Banco Agricola",
    salario: "$1200.00",
    estado: "Aprobada",
    fechaPeticion: "19 Septiembre 2026",
    fechaContratacion: "2018-09-01",
  },
  {
    id: "C-002",
    codigo: "EMP-5121",
    nombre: "Carlos Alberto",
    apellido: "Cornejo Calderon",
    cargo: "Gerente",
    area: "Tecnologia",
    empresa: "Didelco",
    tipo: "Constancia Salarial",
    dirigidaA: "Banco Agricola",
    salario: "$1200.00",
    estado: "Aprobada",
    fechaPeticion: "19 Septiembre 2026",
    fechaContratacion: "2018-09-01",
  },
];

export default function ConstanciasPage() {
  const [seleccionadaId, setSeleccionadaId] = useState(constanciasMock[0].id);
  const [generando, setGenerando] = useState(false);

  const solicitud =
    constanciasMock.find((c) => c.id === seleccionadaId) ?? constanciasMock[0];

  const handleGenerar = async () => {
    setGenerando(true);
    try {
      const { pdfBytes, verificacionId } =
        await generarConstanciaPDF(solicitud);
      const nombreArchivo = `constancia-${solicitud.codigo}-${verificacionId.slice(0, 8)}.pdf`;
      descargarPDF(pdfBytes, nombreArchivo);
      console.log("Constancia generada. ID de verificación:", verificacionId);
    } catch (error) {
      console.error("Error generando la constancia:", error);
      alert("Ocurrió un error al generar la constancia. Revisa la consola.");
    } finally {
      setGenerando(false);
    }
  };

  const handleEliminar = () => {
    if (confirm("¿Estás seguro de eliminar esta constancia?")) {
      alert("Constancia eliminada.");
    }
  };

  const handleNuevaSolicitud = () => {
    alert("Abriendo modal para nueva solicitud...");
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-8 flex-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Gestión de solicitudes
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Viernes 12 de Agosto de 2026
              </p>
            </div>
            <button
              onClick={handleNuevaSolicitud}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition"
            >
              Nueva Solicitud
            </button>
          </div>

          {/* Selector de solicitudes mock — solo para pruebas mientras no hay datos reales de Firestore */}
          <div className="flex gap-3 mb-6">
            {constanciasMock.map((c) => (
              <button
                key={c.id}
                onClick={() => setSeleccionadaId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                  seleccionadaId === c.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {c.tipo} — {c.nombre} {c.apellido.split(" ")[0]}
              </button>
            ))}
          </div>

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
                  <p className="text-xs font-bold text-slate-800">
                    Código de Empleado
                  </p>
                  <p className="text-slate-500 mt-0.5">{solicitud.codigo}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Nombre:</p>
                  <p className="text-slate-500 mt-0.5">{solicitud.nombre}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Apellido</p>
                  <p className="text-slate-500 mt-0.5">{solicitud.apellido}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Cargo</p>
                  <p className="text-slate-500 mt-0.5">{solicitud.cargo}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Área</p>
                  <p className="text-slate-500 mt-0.5">{solicitud.area}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Empresa</p>
                  <p className="text-slate-500 mt-0.5">{solicitud.empresa}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Fecha de contratación
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {solicitud.fechaContratacion}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-bold text-slate-800">Tipo</p>
                  <p className="text-slate-500 mt-0.5">{solicitud.tipo}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Dirigida a:
                  </p>
                  <p className="text-slate-500 mt-0.5">{solicitud.dirigidaA}</p>
                </div>
                {solicitud.tipo.toLowerCase().includes("salari") && (
                  <div>
                    <p className="text-xs font-bold text-slate-800">Salario:</p>
                    <p className="text-slate-500 mt-0.5">{solicitud.salario}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800">Estado</p>
                  <p className="text-slate-500 mt-0.5">{solicitud.estado}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Fecha de la petición
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {solicitud.fechaPeticion}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-slate-100 mt-4">
              <button
                onClick={handleGenerar}
                disabled={generando}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
              >
                {/* Icono de Impresora */}
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
                {generando ? "Generando..." : "Generar Constancia"}
              </button>
              <button
                onClick={handleEliminar}
                className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-5 py-2.5 rounded-xl transition border border-rose-200"
              >
                {/* Icono de Eliminar */}
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Eliminar constancia
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
