"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { escucharVacaciones } from "@/services/vacacionesFirestoreService";
import { escucharPermisos } from "@/services/permisosService";
import {
  escucharConstancias,
  type ConstanciaFirestore,
} from "@/services/constanciasFirestoreService";
import type { Vacacion, Permiso } from "@/types/solicitudesFirestore";

interface SolicitudConsolidada {
  id: string;
  categoria: "Vacaciones" | "Permiso" | "Constancia";
  detalleTipo: string;
  empleadoNombre: string;
  departamento: string;
  empresa: string;
  fechaReferencia: string;
  dias: number | null;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
  creadaEn: string;
}

function formatearFecha(fechaISO?: string): string {
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

const badgeEstado: Record<string, string> = {
  Pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  Aprobada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rechazada: "bg-rose-50 text-rose-700 border-rose-200",
};

function descargarReporteCSV(filasDatos: SolicitudConsolidada[]) {
  const encabezados = [
    "ID",
    "Categoria",
    "Tipo",
    "Empleado",
    "Departamento",
    "Empresa",
    "Fecha / Periodo",
    "Dias",
    "Estado",
  ];
  const filas = filasDatos.map((s) => [
    s.id,
    s.categoria,
    s.detalleTipo,
    s.empleadoNombre,
    s.departamento || "Sin departamento",
    s.empresa || "Grupo Calma",
    s.fechaReferencia,
    s.dias != null ? String(s.dias) : "N/A",
    s.estado,
  ]);
  const csv = [encabezados, ...filas]
    .map((fila) =>
      fila.map((valor) => `"${String(valor).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  const url = URL.createObjectURL(
    new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" }),
  );
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `reporte-solicitudes-${new Date().toLocaleDateString("en-CA")}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}

export default function ReportesPage() {
  const { usuario } = useAuth();
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [constancias, setConstancias] = useState<ConstanciaFirestore[]>([]);
  const [cargando, setCargando] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [empresaFiltro, setEmpresaFiltro] = useState("Todas");
  const [deptoFiltro, setDeptoFiltro] = useState("Todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");

  useEffect(() => {
    if (!usuario) return;
    setCargando(true);

    const unsubVac = escucharVacaciones(usuario, (lista) => {
      setVacaciones(lista);
      setCargando(false);
    });
    const unsubPer = escucharPermisos(usuario, (lista) => {
      setPermisos(lista);
    });
    const unsubCon = escucharConstancias(usuario, (lista) => {
      setConstancias(lista);
    });

    return () => {
      unsubVac();
      unsubPer();
      unsubCon();
    };
  }, [usuario]);

  // Consolidar Vacaciones + Permisos + Constancias en una sola estructura
  const solicitudesConsolidadas = useMemo<SolicitudConsolidada[]>(() => {
    const listaVac: SolicitudConsolidada[] = vacaciones.map((v) => ({
      id: v.id,
      categoria: "Vacaciones",
      detalleTipo: "Vacaciones",
      empleadoNombre: v.empleadoNombre || "Sin nombre",
      departamento: v.departamento || "Sin departamento",
      empresa: v.empresa || "Grupo Calma",
      fechaReferencia: `${formatearFecha(v.fechaInicio)} - ${formatearFecha(v.fechaFin)}`,
      dias: Number(v.diasSolicitados || 0),
      estado: v.estado,
      creadaEn: v.creadaEn || "",
    }));

    const listaPer: SolicitudConsolidada[] = permisos.map((p) => ({
      id: p.id,
      categoria: "Permiso",
      detalleTipo: p.tipo || "Permiso Personal",
      empleadoNombre: p.empleadoNombre || "Sin nombre",
      departamento: p.departamento || "Sin departamento",
      empresa: p.empresa || "Grupo Calma",
      fechaReferencia: formatearFecha(p.fecha),
      dias: 1,
      estado: p.estado,
      creadaEn: p.creadaEn || "",
    }));

    const listaCon: SolicitudConsolidada[] = constancias.map((c) => ({
      id: c.id,
      categoria: "Constancia",
      detalleTipo: c.tipo.toLowerCase().startsWith("constancia")
        ? c.tipo
        : `Constancia ${c.tipo}`,
      empleadoNombre: c.empleado || "Sin nombre",
      departamento: c.departamento || "Sin departamento",
      empresa: c.empresa || "Grupo Calma",
      fechaReferencia: formatearFecha(c.creadaEn),
      dias: null,
      estado: c.estado,
      creadaEn: c.creadaEn || "",
    }));

    return [...listaVac, ...listaPer, ...listaCon].sort((a, b) =>
      b.creadaEn.localeCompare(a.creadaEn),
    );
  }, [vacaciones, permisos, constancias]);

  // Opciones dinámicas de empresas y departamentos reales
  const empresasDisponibles = useMemo(() => {
    const set = new Set<string>();
    solicitudesConsolidadas.forEach((s) => {
      if (s.empresa) set.add(s.empresa);
    });
    return Array.from(set).sort();
  }, [solicitudesConsolidadas]);

  const departamentosDisponibles = useMemo(() => {
    const set = new Set<string>();
    solicitudesConsolidadas.forEach((s) => {
      if (s.departamento) set.add(s.departamento);
    });
    return Array.from(set).sort();
  }, [solicitudesConsolidadas]);

  // Filtrado de solicitudes consolidadas
  const solicitudesFiltradas = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return solicitudesConsolidadas.filter((s) => {
      const coincideTexto =
        !q ||
        s.empleadoNombre.toLowerCase().includes(q) ||
        s.departamento.toLowerCase().includes(q) ||
        s.empresa.toLowerCase().includes(q) ||
        s.detalleTipo.toLowerCase().includes(q);

      const coincideEmpresa =
        empresaFiltro === "Todas" ||
        s.empresa.toLowerCase() === empresaFiltro.toLowerCase();

      const coincideDepto =
        deptoFiltro === "Todos" ||
        s.departamento.toLowerCase() === deptoFiltro.toLowerCase();

      const coincideCategoria =
        categoriaFiltro === "Todas" || s.categoria === categoriaFiltro;

      const coincideEstado =
        estadoFiltro === "Todos" || s.estado === estadoFiltro;

      return (
        coincideTexto &&
        coincideEmpresa &&
        coincideDepto &&
        coincideCategoria &&
        coincideEstado
      );
    });
  }, [
    solicitudesConsolidadas,
    searchTerm,
    empresaFiltro,
    deptoFiltro,
    categoriaFiltro,
    estadoFiltro,
  ]);

  // Datos agrupados para la gráfica de Vacaciones por Departamento
  const datosGraficaVacaciones = useMemo(() => {
    const mapa = new Map<
      string,
      {
        departamento: string;
        diasAprobados: number;
        diasPendientes: number;
        solicitudes: number;
      }
    >();

    vacaciones.forEach((v) => {
      const emp = v.empresa || "Grupo Calma";
      if (
        empresaFiltro !== "Todas" &&
        emp.toLowerCase() !== empresaFiltro.toLowerCase()
      ) {
        return;
      }

      const depto = v.departamento?.trim() || "Sin departamento";
      const actual = mapa.get(depto) ?? {
        departamento: depto,
        diasAprobados: 0,
        diasPendientes: 0,
        solicitudes: 0,
      };

      const dias = Number(v.diasSolicitados || 0);
      if (v.estado === "Aprobada") {
        actual.diasAprobados += dias;
      } else if (v.estado === "Pendiente") {
        actual.diasPendientes += dias;
      }
      if (v.estado !== "Rechazada") {
        actual.solicitudes += 1;
      }

      mapa.set(depto, actual);
    });

    return Array.from(mapa.values()).sort(
      (a, b) =>
        b.diasAprobados +
        b.diasPendientes -
        (a.diasAprobados + a.diasPendientes),
    );
  }, [vacaciones, empresaFiltro]);

  // KPIs
  const totalSolicitudes = solicitudesFiltradas.length;
  const totalAprobadas = solicitudesFiltradas.filter(
    (s) => s.estado === "Aprobada",
  ).length;
  const totalPendientes = solicitudesFiltradas.filter(
    (s) => s.estado === "Pendiente",
  ).length;
  const totalRechazadas = solicitudesFiltradas.filter(
    (s) => s.estado === "Rechazada",
  ).length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Reportes y Consolidado de Solicitudes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Análisis en tiempo real de vacaciones, permisos y constancias de
            Grupo Calma
          </p>
        </div>
        <button
          type="button"
          onClick={() => descargarReporteCSV(solicitudesFiltradas)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all text-xs"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Solicitudes Filtradas
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {totalSolicitudes}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            #
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Aprobadas
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {totalAprobadas}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            ✓
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Pendientes
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {totalPendientes}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
            ⏳
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Rechazadas
            </p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">
              {totalRechazadas}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
            ✕
          </div>
        </div>
      </div>

      {/* Gráfica de Vacaciones por Departamento */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-800">
            Días de Vacaciones por Departamento
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparativa de días aprobados y pendientes según las solicitudes en
            Firestore
          </p>
        </div>

        {datosGraficaVacaciones.length === 0 ? (
          <div className="h-60 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            No hay solicitudes de vacaciones registradas para graficar.
          </div>
        ) : (
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosGraficaVacaciones}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="departamento"
                  tick={{ fontSize: 11, fill: "#475569" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#475569" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    borderColor: "#e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar
                  dataKey="diasAprobados"
                  name="Días Aprobados"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="diasPendientes"
                  name="Días Pendientes"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tabla Consolidada de Solicitudes */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="relative w-full lg:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar empleado, depto o tipo..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todas">Todas las categorías</option>
              <option value="Vacaciones">Vacaciones</option>
              <option value="Permiso">Permisos</option>
              <option value="Constancia">Constancias</option>
            </select>

            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </select>

            <select
              value={empresaFiltro}
              onChange={(e) => setEmpresaFiltro(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todas">Todas las empresas</option>
              {empresasDisponibles.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>

            <select
              value={deptoFiltro}
              onChange={(e) => setDeptoFiltro(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todos">Todos los deptos</option>
              {departamentosDisponibles.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4 font-semibold">Empleado</th>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold">Departamento</th>
                <th className="py-3 px-4 font-semibold">Empresa</th>
                <th className="py-3 px-4 font-semibold">Fecha / Periodo</th>
                <th className="py-3 px-4 font-semibold">Días</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {cargando ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-slate-400 text-xs"
                  >
                    Cargando datos desde Firestore...
                  </td>
                </tr>
              ) : solicitudesFiltradas.length > 0 ? (
                solicitudesFiltradas.map((s) => (
                  <tr
                    key={`${s.categoria}-${s.id}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {s.empleadoNombre}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.detalleTipo}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
                        {s.departamento}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {s.empresa}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {s.fechaReferencia}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">
                      {s.dias != null ? s.dias : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          badgeEstado[s.estado] ??
                          "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {s.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-slate-400 text-xs"
                  >
                    No se encontraron solicitudes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}