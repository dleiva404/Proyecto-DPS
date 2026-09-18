"use client";

import { useMemo, useState } from "react";
import { Check, X, Eye, CalendarDays } from "lucide-react";
import { solicitudesMock } from "../../mocks/solicitudes";
import { empleadosMock } from "../../mocks/empleados";

export default function SolicitudesPage() {
    const [categoria, setCategoria] = useState("Todos");
    const [empresa, setEmpresa] = useState("Todas");
    const [departamento, setDepartamento] = useState("Todos");
    const [fecha, setFecha] = useState("");

    const empleados = useMemo(
        () => Object.fromEntries(empleadosMock.map((e) => [e.empleadoId, e])),
        []
    );

    const solicitudes = useMemo(
        () =>
            solicitudesMock.filter((s) => {
                const e = empleados[s.empleadoId];
                if (!e) return false;

                const tipoOK =
                    categoria === "Todos" ||
                    (categoria === "Permisos" && s.tipo.includes("Permiso")) ||
                    (categoria === "Vacaciones" && s.tipo === "Vacaciones") ||
                    (categoria === "Constancias" && s.tipo.includes("Constancia"));

                const empresaOK = empresa === "Todas" || s.empresa === empresa;
                const deptoOK =
                    departamento === "Todos" || e.departamentoId === departamento;

                return tipoOK && empresaOK && deptoOK && !fecha;
            }),
        [categoria, empresa, departamento, fecha, empleados]
    );

    const categorias = [
        {
            nombre: "Todos",
            cantidad: solicitudesMock.length,
            badge: "bg-blue-500 text-white",
        },
        {
            nombre: "Permisos",
            cantidad: solicitudesMock.filter((s) => s.tipo.includes("Permiso")).length,
            badge: "bg-orange-100 text-orange-500",
        },
        {
            nombre: "Vacaciones",
            cantidad: solicitudesMock.filter((s) => s.tipo === "Vacaciones").length,
            badge: "bg-red-100 text-red-500",
        },
        {
            nombre: "Constancias",
            cantidad: solicitudesMock.filter((s) => s.tipo.includes("Constancia")).length,
            badge: "bg-green-100 text-green-500",
        },
    ];

    const nombreEmpleado = (id: string) => {
        const e = empleados[id];
        return e
            ? `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno}`
            : "Empleado desconocido";
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Gestión de solicitudes
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Viernes 12 de Agosto de 2026
                    </p>
                </div>

                <button className="px-6 py-3 rounded-xl bg-blue-200 hover:bg-blue-300 text-sm font-semibold text-slate-900">
                    Nueva Solicitud
                </button>
            </div>

            <div className="grid grid-cols-4 gap-5 mb-6">
                {categorias.map((item) => {
                    const activa = categoria === item.nombre;

                    return (
                        <button
                            key={item.nombre}
                            onClick={() => setCategoria(item.nombre)}
                            className={`h-12 px-6 rounded-xl border flex items-center justify-between text-sm font-semibold ${activa
                                ? "bg-blue-200 border-blue-200 text-slate-900"
                                : "bg-white border-slate-300 text-slate-900 hover:bg-slate-50"
                                }`}
                        >
                            <span>{item.nombre}</span>
                            <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${item.badge}`}
                            >
                                {item.cantidad}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-3 mb-6">
                <select
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    className="w-44 h-10 px-4 rounded-lg border border-slate-300 bg-white text-sm text-slate-900"
                >
                    <option>Todas</option>
                    <option>Didelco</option>
                    <option>Steel</option>
                    <option>EFL</option>
                </select>

                <select
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-44 h-10 px-4 rounded-lg border border-slate-300 bg-white text-sm text-slate-900"
                >
                    <option value="Todos">Todos</option>
                    <option value="01">Depto 01</option>
                    <option value="02">Depto 02</option>
                    <option value="03">Depto 03</option>
                    <option value="04">Depto 04</option>
                    <option value="05">Depto 05</option>
                </select>

                <div className="relative">
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-44 h-10 px-4 rounded-lg border border-slate-300 bg-white text-sm text-slate-900"
                    />
                    <CalendarDays className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
            </div>

            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-300">
                                {[
                                    "Empleado / Área",
                                    "Tipo",
                                    "Fecha / Horario",
                                    "Empresa",
                                    "Estado",
                                    "Acciones",
                                ].map((titulo) => (
                                    <th
                                        key={titulo}
                                        className={`px-6 py-5 text-sm font-semibold text-slate-900 ${titulo === "Acciones" ? "text-center" : "text-left"
                                            }`}
                                    >
                                        {titulo}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {solicitudes.map((s) => {
                                const e = empleados[s.empleadoId];

                                return (
                                    <tr
                                        key={s.id}
                                        className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {nombreEmpleado(s.empleadoId)}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Depto {e?.departamentoId}
                                            </p>
                                        </td>

                                        <td className="px-6 py-5 text-sm font-semibold text-slate-900">
                                            {s.tipo}
                                        </td>

                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {s.fechaHorario.split(" ").slice(0, 2).join(" ")}
                                        </td>

                                        <td className="px-6 py-5 text-sm font-bold text-slate-900">
                                            {s.empresa}
                                        </td>

                                        <td
                                            className={`px-6 py-5 text-sm font-semibold ${s.estado === "Pendiente"
                                                ? "text-orange-500"
                                                : s.estado === "Aprobada"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                                }`}
                                        >
                                            {s.estado}
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex justify-center items-center gap-3">
                                                <button
                                                    title="Aprobar"
                                                    className="w-6 h-6 border border-green-500 text-green-500 rounded-md flex items-center justify-center hover:bg-green-50"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>

                                                <button
                                                    title="Rechazar"
                                                    className="w-6 h-6 border border-red-500 text-red-500 rounded-md flex items-center justify-center hover:bg-red-50"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>

                                                <button
                                                    title="Ver solicitud"
                                                    className="text-orange-500 hover:text-orange-600"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {solicitudes.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-10 text-center text-sm text-slate-500"
                                    >
                                        No se encontraron solicitudes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-slate-200">
                    <div className="inline-flex items-center border border-slate-400 rounded-lg overflow-hidden">
                        <span className="px-4 py-2 text-sm text-slate-900 border-r border-slate-300">
                            1 - {solicitudes.length} solicitudes
                        </span>
                        <button className="w-10 h-9 text-slate-900 hover:bg-slate-100">
                            ‹
                        </button>
                        <button className="w-10 h-9 border-l border-slate-300 text-slate-900 hover:bg-slate-100">
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}