"use client";

import { useMemo, useState } from "react";
import {
  Check,
  X,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  Plus,
} from "lucide-react";
import { solicitudesMock } from "@/mocks/solicitudes";
import { empleadosMock } from "@/mocks/empleados";
import { contarDiasHabiles } from "@/services/vacacionesService";
import type { Solicitud } from "@/types/solicitud";

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(solicitudesMock);
  const [categoria, setCategoria] = useState("Todos");
  const [empresa, setEmpresa] = useState("Todas");
  const [departamento, setDepartamento] = useState("Todos");
  const [fecha, setFecha] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Solicitud | null>(null);

  const [form, setForm] = useState({
    empleadoId: "E001",
    tipo: "Permiso Personal",
    fechaHorario: "",
    empresa: "Didelco",
    estado: "Pendiente",
  });

  const [fechaPermiso, setFechaPermiso] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [fechaInicioVac, setFechaInicioVac] = useState("");
  const [fechaFinVac, setFechaFinVac] = useState("");
  const [tipoConstancia, setTipoConstancia] = useState("Constancia de trabajo");

  const empleados = useMemo(
    () => Object.fromEntries(empleadosMock.map((e) => [e.empleadoId, e])),
    [],
  );

  const solicitudesFiltradas = useMemo(
    () =>
      solicitudes.filter((s) => {
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

        const fechaOK = !fecha || s.fechaHorario.includes(fecha);

        return tipoOK && empresaOK && deptoOK && fechaOK;
      }),
    [solicitudes, categoria, empresa, departamento, fecha, empleados],
  );

  const categorias = [
    {
      nombre: "Todos",
      cantidad: solicitudes.length,
      badge: "bg-blue-500 text-white",
    },
    {
      nombre: "Permisos",
      cantidad: solicitudes.filter((s) => s.tipo.includes("Permiso")).length,
      badge: "bg-orange-100 text-orange-500",
    },
    {
      nombre: "Vacaciones",
      cantidad: solicitudes.filter((s) => s.tipo === "Vacaciones").length,
      badge: "bg-red-100 text-red-500",
    },
    {
      nombre: "Constancias",
      cantidad: solicitudes.filter((s) => s.tipo.includes("Constancia")).length,
      badge: "bg-green-100 text-green-500",
    },
  ];

  const nombreEmpleado = (id: string) => {
    const e = empleados[id];
    return e
      ? `${e.nombres} ${e.apellidoPaterno} ${e.apellidoMaterno}`
      : "Empleado desconocido";
  };

  const resetCamposPorTipo = () => {
    setFechaPermiso("");
    setHoraInicio("");
    setHoraFin("");
    setFechaInicioVac("");
    setFechaFinVac("");
    setTipoConstancia("Constancia de trabajo");
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm({
      empleadoId: "E001",
      tipo: "Permiso Personal",
      fechaHorario: "",
      empresa: "Didelco",
      estado: "Pendiente",
    });
    resetCamposPorTipo();
    setModal(true);
  };

  const abrirEditar = (solicitud: Solicitud) => {
    setEditando(solicitud);
    setForm({
      empleadoId: solicitud.empleadoId,
      tipo: solicitud.tipo,
      fechaHorario: solicitud.fechaHorario,
      empresa: solicitud.empresa,
      estado: solicitud.estado,
    });

    resetCamposPorTipo();
    setModal(true);
  };

  const guardarSolicitud = () => {
    if (!form.fechaHorario.trim()) {
      alert("Ingresa la fecha de la solicitud.");
      return;
    }

    if (editando) {
      setSolicitudes((actuales) =>
        actuales.map((s) => (s.id === editando.id ? { ...s, ...form } : s)),
      );
    } else {
      const nueva: Solicitud = {
        id: Date.now().toString(),
        ...form,
      };

      setSolicitudes((actuales) => [...actuales, nueva]);
    }

    setModal(false);
    setEditando(null);
  };

  const eliminar = (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta solicitud?")) return;
    setSolicitudes((actuales) => actuales.filter((s) => s.id !== id));
  };

  const cambiarEstado = (solicitud: Solicitud, estado: string) => {
    setSolicitudes((actuales) =>
      actuales.map((s) => (s.id === solicitud.id ? { ...s, estado } : s)),
    );
  };

  const verSolicitud = (s: Solicitud) => {
    alert(
      `Solicitud\n\nEmpleado: ${nombreEmpleado(s.empleadoId)}\nTipo: ${s.tipo}\nFecha: ${s.fechaHorario}\nEmpresa: ${s.empresa}\nEstado: ${s.estado}`,
    );
  };

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión de solicitudes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Viernes 12 de Agosto de 2026
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-200 hover:bg-blue-300 text-sm font-semibold text-slate-900"
        >
          <Plus className="w-4 h-4" />
          Nueva Solicitud
        </button>
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        {categorias.map((item) => {
          const activa = categoria === item.nombre;

          return (
            <button
              key={item.nombre}
              onClick={() => setCategoria(item.nombre)}
              className={`h-12 px-6 rounded-xl border flex items-center justify-between text-sm font-semibold ${
                activa
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

      {/* Filtros */}
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

      {/* Tabla */}
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
                    className={`px-6 py-5 text-sm font-semibold text-slate-900 ${
                      titulo === "Acciones" ? "text-center" : "text-left"
                    }`}
                  >
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {solicitudesFiltradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-sm text-slate-500"
                  >
                    No se encontraron solicitudes.
                  </td>
                </tr>
              ) : (
                solicitudesFiltradas.map((s) => {
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
                        {s.fechaHorario}
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-slate-900">
                        {s.empresa}
                      </td>

                      <td
                        className={`px-6 py-5 text-sm font-semibold ${
                          s.estado === "Pendiente"
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
                            onClick={() => cambiarEstado(s, "Aprobada")}
                            className="w-6 h-6 border border-green-500 text-green-500 rounded-md flex items-center justify-center hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          <button
                            title="Rechazar"
                            onClick={() => cambiarEstado(s, "Rechazada")}
                            className="w-6 h-6 border border-red-500 text-red-500 rounded-md flex items-center justify-center hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <button
                            title="Editar"
                            onClick={() => abrirEditar(s)}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            title="Eliminar"
                            onClick={() => eliminar(s.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            title="Ver solicitud"
                            onClick={() => verSolicitud(s)}
                            className="text-orange-500 hover:text-orange-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200">
          <div className="inline-flex items-center border border-slate-400 rounded-lg overflow-hidden">
            <span className="px-4 py-2 text-sm text-slate-900 border-r border-slate-300">
              1 - {solicitudesFiltradas.length} solicitudes
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                {editando ? "Editar Solicitud" : "Nueva Solicitud"}
              </h2>

              <button
                onClick={() => setModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Empleado
                </label>
                <select
                  value={form.empleadoId}
                  onChange={(e) =>
                    setForm({ ...form, empleadoId: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                >
                  {empleadosMock.map((e) => (
                    <option key={e.empleadoId} value={e.empleadoId}>
                      {e.nombres} {e.apellidoPaterno} {e.apellidoMaterno}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tipo de solicitud
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      tipo: e.target.value,
                      fechaHorario: "",
                    });
                    resetCamposPorTipo();
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                >
                  <option>Permiso Personal</option>
                  <option>Vacaciones</option>
                  <option>Constancia Laboral</option>
                </select>
              </div>

              {/* Campos específicos por tipo de solicitud */}
              {form.tipo === "Permiso Personal" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={fechaPermiso}
                      onChange={(e) => {
                        setFechaPermiso(e.target.value);
                        setForm({
                          ...form,
                          fechaHorario:
                            `${e.target.value} ${horaInicio} - ${horaFin}`.trim(),
                        });
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Horario
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={horaInicio}
                        onChange={(e) => {
                          setHoraInicio(e.target.value);
                          setForm({
                            ...form,
                            fechaHorario:
                              `${fechaPermiso} ${e.target.value} - ${horaFin}`.trim(),
                          });
                        }}
                        className="w-1/2 p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                      />
                      <input
                        type="time"
                        value={horaFin}
                        onChange={(e) => {
                          setHoraFin(e.target.value);
                          setForm({
                            ...form,
                            fechaHorario:
                              `${fechaPermiso} ${horaInicio} - ${e.target.value}`.trim(),
                          });
                        }}
                        className="w-1/2 p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                      />
                    </div>
                  </div>
                </>
              )}

              {form.tipo === "Vacaciones" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      value={fechaInicioVac}
                      onChange={(e) => {
                        setFechaInicioVac(e.target.value);
                        setForm({
                          ...form,
                          fechaHorario:
                            `${e.target.value} - ${fechaFinVac}`.trim(),
                        });
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Fecha fin
                    </label>
                    <input
                      type="date"
                      value={fechaFinVac}
                      onChange={(e) => {
                        setFechaFinVac(e.target.value);
                        setForm({
                          ...form,
                          fechaHorario:
                            `${fechaInicioVac} - ${e.target.value}`.trim(),
                        });
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                    />
                  </div>
                  {fechaInicioVac && fechaFinVac && (
                    <p className="text-xs text-slate-500">
                      {contarDiasHabiles(fechaInicioVac, fechaFinVac)} días
                      hábiles solicitados
                    </p>
                  )}
                </>
              )}

              {form.tipo === "Constancia Laboral" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Tipo de constancia
                  </label>
                  <select
                    value={tipoConstancia}
                    onChange={(e) => {
                      setTipoConstancia(e.target.value);
                      setForm({ ...form, fechaHorario: e.target.value });
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                  >
                    <option>Constancia laboral</option>
                    <option>Constancia salarial</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Empresa
                </label>
                <select
                  value={form.empresa}
                  onChange={(e) =>
                    setForm({ ...form, empresa: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                >
                  <option>Didelco</option>
                  <option>Steel</option>
                  <option>EFL</option>
                </select>
              </div>

              {editando && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={form.estado}
                    onChange={(e) =>
                      setForm({ ...form, estado: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                  >
                    <option>Pendiente</option>
                    <option>Aprobada</option>
                    <option>Rechazada</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModal(false)}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                onClick={guardarSolicitud}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
              >
                {editando ? "Guardar cambios" : "Crear solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
