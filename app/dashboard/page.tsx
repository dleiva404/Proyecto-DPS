"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { escucharVacaciones } from "@/services/vacacionesFirestoreService";
import { escucharPermisos } from "@/services/permisosService";
import {
  escucharConstancias,
  type ConstanciaFirestore,
} from "@/services/constanciasFirestoreService";
import type { Vacacion, Permiso } from "@/types/solicitudesFirestore";

const COLORES_EMPRESA = [
  "#2563eb",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function porcentajeAtendido(lista: { estado: string }[]): number {
  if (lista.length === 0) return 0;
  const atendidas = lista.filter((item) => item.estado !== "Pendiente").length;
  return Math.round((atendidas / lista.length) * 100);
}

function nombreCorto(nombreCompleto: string): string {
  const partes = nombreCompleto.trim().split(/\s+/);
  if (partes.length <= 1) return nombreCompleto || "Empleado";
  return `${partes[0]} ${partes[1][0]}.`;
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [constancias, setConstancias] = useState<ConstanciaFirestore[]>([]);
  const [cargando, setCargando] = useState(true);

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

  // 1. KPIs Superiores reales
  const kpis = useMemo(() => {
    const totalTrámites =
      vacaciones.length + permisos.length + constancias.length;

    const pendientes =
      vacaciones.filter((v) => v.estado === "Pendiente").length +
      permisos.filter((p) => p.estado === "Pendiente").length +
      constancias.filter((c) => c.estado === "Pendiente").length;

    const vacAprobadas = vacaciones.filter((v) => v.estado === "Aprobada");
    const diasVacAprobados = vacAprobadas.reduce(
      (acc, v) => acc + Number(v.diasSolicitados || 0),
      0,
    );

    const constanciasEmitidas = constancias.filter(
      (c) => c.estado === "Aprobada",
    ).length;

    return [
      {
        titulo: "Total Solicitudes",
        valor: cargando ? "..." : String(totalTrámites),
        cambio: "Registradas en Firestore",
        positivo: true,
        alerta: false,
      },
      {
        titulo: "Solicitudes Pendientes",
        valor: cargando ? "..." : String(pendientes),
        cambio: pendientes > 0 ? "Requieren atención" : "Todo al día",
        positivo: pendientes === 0,
        alerta: pendientes > 0,
      },
      {
        titulo: "Vacaciones Aprobadas",
        valor: cargando ? "..." : String(vacAprobadas.length),
        cambio: `${diasVacAprobados} días aprobados`,
        positivo: false,
        alerta: false,
      },
      {
        titulo: "Constancias Emitidas",
        valor: cargando ? "..." : String(constanciasEmitidas),
        cambio: `${constancias.length} solicitadas`,
        positivo: true,
        alerta: false,
      },
    ];
  }, [vacaciones, permisos, constancias, cargando]);

  // 2. Histórico mensual (últimos 6 meses reales)
  const tendenciaMensual = useMemo(() => {
    const hoy = new Date();
    const meses: {
      clave: string;
      mes: string;
      vacaciones: number;
      permisos: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
      meses.push({
        clave,
        mes: MESES_CORTOS[fecha.getMonth()],
        vacaciones: 0,
        permisos: 0,
      });
    }

    const mapa = new Map(meses.map((m) => [m.clave, m]));

    vacaciones.forEach((v) => {
      const ref = (v.creadaEn || v.fechaInicio || "").slice(0, 7);
      const item = mapa.get(ref);
      if (item) item.vacaciones += 1;
    });

    permisos.forEach((p) => {
      const ref = (p.creadaEn || p.fecha || "").slice(0, 7);
      const item = mapa.get(ref);
      if (item) item.permisos += 1;
    });

    return meses;
  }, [vacaciones, permisos]);

  // 3. Distribución real por empresa
  const resumenEmpresas = useMemo(() => {
    const conteo = new Map<string, number>();

    const sumar = (empresa?: string) => {
      const nombre = empresa?.trim() || "Grupo Calma";
      conteo.set(nombre, (conteo.get(nombre) ?? 0) + 1);
    };

    vacaciones.forEach((v) => sumar(v.empresa));
    permisos.forEach((p) => sumar(p.empresa));
    constancias.forEach((c) => sumar(c.empresa));

    return Array.from(conteo.entries())
      .map(([name, value], idx) => ({
        name,
        value,
        color: COLORES_EMPRESA[idx % COLORES_EMPRESA.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [vacaciones, permisos, constancias]);

  // 4. Porcentajes reales de atención
  const pctVacaciones = useMemo(
    () => porcentajeAtendido(vacaciones),
    [vacaciones],
  );
  const pctPermisos = useMemo(() => porcentajeAtendido(permisos), [permisos]);
  const pctConstancias = useMemo(
    () => porcentajeAtendido(constancias),
    [constancias],
  );

  // 5. Vacaciones registradas (para listado y gráfica de días)
  const vacacionesDestacadas = useMemo(() => {
    return [...vacaciones]
      .filter((v) => v.estado !== "Rechazada")
      .sort((a, b) => (b.creadaEn || "").localeCompare(a.creadaEn || ""))
      .slice(0, 5);
  }, [vacaciones]);

  const datosGraficaDias = useMemo(() => {
    return vacacionesDestacadas.map((v) => ({
      name: nombreCorto(v.empleadoNombre || "Empleado"),
      dias: Number(v.diasSolicitados || 0),
    }));
  }, [vacacionesDestacadas]);

  return (
    <div className="p-6 bg-slate-50 flex flex-col space-y-6">
      {/* KPIs Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <span className="text-xs font-medium text-slate-400">
              {kpi.titulo}
            </span>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="text-xl font-bold text-slate-800">
                {kpi.valor}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  kpi.alerta
                    ? "bg-amber-50 text-amber-600"
                    : kpi.positivo
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {kpi.cambio}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Secciones Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Histórico de Solicitudes
                </h2>
                <p className="text-[11px] text-slate-400">
                  Volumen mensual de trámites registrados (últimos 6 meses)
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>{" "}
                  Vacaciones
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>{" "}
                  Permisos
                </span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tendenciaMensual}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis dataKey="mes" stroke="#94a3b8" fontSize={10} />
                  <YAxis
                    allowDecimals={false}
                    stroke="#94a3b8"
                    fontSize={10}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="vacaciones"
                    name="Vacaciones"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="permisos"
                    name="Permisos"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Pastel de Empresas */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-0.5">
              Distribución por Empresa
            </h2>
            <p className="text-[11px] text-slate-400 mb-3">
              Proporción de solicitudes registradas por compañía
            </p>

            {resumenEmpresas.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Sin solicitudes registradas todavía.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resumenEmpresas}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                      >
                        {resumenEmpresas.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                  {resumenEmpresas.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[11px] bg-slate-50 px-2 py-1 rounded-lg"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="font-medium text-slate-700 truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-slate-800 ml-1">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800">
              Atención de Trámites
            </h3>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Vacaciones Atendidas</span>
                <span>{pctVacaciones}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${pctVacaciones}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Permisos Personales</span>
                <span>{pctPermisos}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${pctPermisos}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Constancias Laborales</span>
                <span>{pctConstancias}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${pctConstancias}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-2.5">
              Vacaciones Recientes
            </h3>
            {vacacionesDestacadas.length === 0 ? (
              <p className="text-[11px] text-slate-400">
                No hay solicitudes de vacaciones activas.
              </p>
            ) : (
              <div className="space-y-2">
                {vacacionesDestacadas.slice(0, 3).map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50"
                  >
                    <div>
                      <p className="text-[11px] font-bold text-slate-800">
                        {v.empleadoNombre}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {v.departamento || "General"} •{" "}
                        {v.empresa || "Grupo Calma"} ({v.fechaInicio})
                      </p>
                    </div>
                    <span
                      title={v.estado}
                      className={`w-2 h-2 rounded-full ${
                        v.estado === "Aprobada"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-2">
              Días Solicitados por Colaborador
            </h3>
            {datosGraficaDias.length === 0 ? (
              <p className="text-[11px] text-slate-400 py-8 text-center">
                Sin vacaciones para graficar.
              </p>
            ) : (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosGraficaDias}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis
                      allowDecimals={false}
                      stroke="#94a3b8"
                      fontSize={9}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="dias"
                      name="Días"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}