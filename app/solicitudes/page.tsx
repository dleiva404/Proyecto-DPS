"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X, Eye, CalendarDays, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { contarDiasHabiles } from "@/services/vacacionesService";
import {
  etiquetaEtapa,
  type RolAprobador,
} from "@/services/aprobacionesService";
import { crearNotificacion } from "@/services/notificacionesService";
import {
  escucharPermisos,
  crearPermiso,
  puedeDecidirPermiso,
  decidirPermiso,
} from "@/services/permisosService";
import {
  escucharVacaciones,
  crearVacaciones,
  puedeDecidirVacacion,
  decidirVacacion,
  saldoDisponible,
} from "@/services/vacacionesFirestoreService";
import type {
  Etapa,
  EstadoSolicitud,
  Permiso,
  Vacacion,
} from "@/types/solicitudesFirestore";

const ROL_DE_ETAPA: Record<Etapa, RolAprobador> = {
  JEFE: "JefeInmediato",
  ANALISTA: "AnalistaNomina",
  GERENTE: "Gerente",
};

// Fila de la tabla: permisos y vacaciones juntos
interface Fila {
  id: string;
  origen: "permiso" | "vacacion";
  empleadoNombre: string;
  departamento: string;
  tipo: string;
  fechaHorario: string;
  empresa: string;
  estado: EstadoSolicitud;
  etapaActual: Etapa | null;
  motivo: string;
  creadaEn: string;
  datos: Permiso | Vacacion;
}

export default function SolicitudesPage() {
  const { usuario } = useAuth();

  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [categoria, setCategoria] = useState("Todos");
  const [empresa, setEmpresa] = useState("Todas");
  const [departamento, setDepartamento] = useState("Todos");
  const [fecha, setFecha] = useState("");
  const [modal, setModal] = useState(false);
  const [analistaDisponible, setAnalistaDisponible] = useState(true);

  const [form, setForm] = useState({
    tipo: "Permiso Personal",
    empresa: "Didelco",
    motivo: "",
  });

  const [fechaPermiso, setFechaPermiso] = useState("");
  const [fechaInicioVac, setFechaInicioVac] = useState("");
  const [fechaFinVac, setFechaFinVac] = useState("");

  useEffect(() => {
    if (!usuario) return;
    const cancelarPermisos = escucharPermisos(usuario, setPermisos);
    const cancelarVacaciones = escucharVacaciones(usuario, setVacaciones);
    return () => {
      cancelarPermisos();
      cancelarVacaciones();
    };
  }, [usuario]);

  const solicitudes = useMemo<Fila[]>(
    () =>
      [
        ...permisos.map((p) => ({
          id: p.id,
          origen: "permiso" as const,
          empleadoNombre: p.empleadoNombre,
          departamento: p.departamento,
          tipo: p.tipo,
          fechaHorario: p.fecha,
          empresa: p.empresa,
          estado: p.estado,
          etapaActual: p.etapaActual,
          motivo: p.motivo,
          creadaEn: p.creadaEn ?? "",
          datos: p,
        })),
        ...vacaciones.map((v) => ({
          id: v.id,
          origen: "vacacion" as const,
          empleadoNombre: v.empleadoNombre,
          departamento: v.departamento,
          tipo: v.tipo,
          fechaHorario: `${v.fechaInicio} - ${v.fechaFin}`,
          empresa: v.empresa,
          estado: v.estado,
          etapaActual: v.etapaActual,
          motivo: v.motivo,
          creadaEn: v.creadaEn ?? "",
          datos: v,
        })),
      ].sort((a, b) => b.creadaEn.localeCompare(a.creadaEn)),
    [permisos, vacaciones],
  );

  const departamentos = useMemo(
    () => [...new Set(solicitudes.map((s) => s.departamento).filter(Boolean))],
    [solicitudes],
  );

  const solicitudesFiltradas = useMemo(
    () =>
      solicitudes.filter((s) => {
        const tipoOK =
          categoria === "Todos" ||
          (categoria === "Permisos" && s.origen === "permiso") ||
          (categoria === "Vacaciones" && s.origen === "vacacion");

        const empresaOK = empresa === "Todas" || s.empresa === empresa;
        const deptoOK =
          departamento === "Todos" || s.departamento === departamento;

        const fechaOK = !fecha || s.fechaHorario.includes(fecha);

        return tipoOK && empresaOK && deptoOK && fechaOK;
      }),
    [solicitudes, categoria, empresa, departamento, fecha],
  );

  const categorias = [
    {
      nombre: "Todos",
      cantidad: solicitudes.length,
      badge: "bg-blue-500 text-white",
    },
    {
      nombre: "Permisos",
      cantidad: permisos.length,
      badge: "bg-orange-100 text-orange-500",
    },
    {
      nombre: "Vacaciones",
      cantidad: vacaciones.length,
      badge: "bg-red-100 text-red-500",
    },
  ];

  const resetCamposPorTipo = () => {
    setFechaPermiso("");
    setFechaInicioVac("");
    setFechaFinVac("");
  };

  const abrirNuevo = () => {
    setForm({
      tipo: "Permiso Personal",
      empresa: usuario?.empresa || "Didelco",
      motivo: "",
    });
    resetCamposPorTipo();
    setModal(true);
  };

  const notificar = async (
    etapa: Etapa | null | undefined,
    mensaje: string,
    id: string,
  ) => {
    if (!etapa) return;
    try {
      await crearNotificacion(ROL_DE_ETAPA[etapa], mensaje, id);
    } catch (error) {
      console.error("No se pudo crear la notificación:", error);
    }
  };

  const guardarSolicitud = async () => {
    if (!usuario) return;
    try {
      const nueva =
        form.tipo === "Vacaciones"
          ? await crearVacaciones(
              usuario,
              {
                fechaInicio: fechaInicioVac,
                fechaFin: fechaFinVac,
                motivo: form.motivo,
              },
              vacaciones,
            )
          : await crearPermiso(usuario, {
              fecha: fechaPermiso,
              motivo: form.motivo,
              empresa: form.empresa,
            });
      await notificar(
        nueva.etapaActual,
        `Nueva solicitud de ${form.tipo} pendiente de revisión`,
        nueva.id,
      );
      setModal(false);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la solicitud.",
      );
    }
  };

  const puedeDecidir = (s: Fila) =>
    !!usuario &&
    (s.origen === "permiso"
      ? puedeDecidirPermiso(usuario, s.datos as Permiso, analistaDisponible)
      : puedeDecidirVacacion(usuario, s.datos as Vacacion));

  const actuarSobreSolicitud = async (
    s: Fila,
    accion: "Aprobado" | "Rechazado",
  ) => {
    if (!usuario) return;
    let motivo = "";
    if (accion === "Rechazado") {
      motivo = prompt("Motivo del rechazo:")?.trim() ?? "";
      if (!motivo) return;
    }

    try {
      const siguiente =
        s.origen === "permiso"
          ? await decidirPermiso(usuario, s.datos as Permiso, accion, motivo)
          : await decidirVacacion(usuario, s.datos as Vacacion, accion, motivo);
      await notificar(
        siguiente,
        `Tienes una solicitud de ${s.tipo} pendiente de tu revisión`,
        s.id,
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo procesar la solicitud.",
      );
    }
  };

  const verSolicitud = (s: Fila) => {
    alert(
      `Solicitud\n\nEmpleado: ${s.empleadoNombre}\nTipo: ${s.tipo}\nFecha: ${s.fechaHorario}\nEmpresa: ${s.empresa}\nMotivo: ${s.motivo}\nEstado: ${s.estado}` +
        (s.datos.motivoRechazo
          ? `\nMotivo del rechazo: ${s.datos.motivoRechazo}`
          : ""),
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
            Actuando como: <strong>{usuario?.nombre}</strong> ({usuario?.rol})
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

      {usuario?.rol === "Gerente" && (
        <div className="flex items-center gap-3 mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <input
              type="checkbox"
              checked={analistaDisponible}
              onChange={(e) => setAnalistaDisponible(e.target.checked)}
            />
            Analista de Nómina disponible (si se desmarca, tú puedes sustituirla
            en permisos)
          </label>
        </div>
      )}

      {/* Categorías */}
      <div className="grid grid-cols-3 gap-5 mb-6">
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
          {departamentos.map((d) => (
            <option key={d}>{d}</option>
          ))}
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
                  "Estado / Etapa",
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
                  const puedeAprobar = puedeDecidir(s);

                  return (
                    <tr
                      key={s.id}
                      className="border-b border-slate-200 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-900">
                          {s.empleadoNombre}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {s.departamento}
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
                        {etiquetaEtapa(
                          s.etapaActual ? ROL_DE_ETAPA[s.etapaActual] : null,
                          s.estado,
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-center items-center gap-3">
                          <button
                            title={
                              puedeAprobar
                                ? "Aprobar"
                                : "No puedes actuar en esta etapa"
                            }
                            onClick={() => actuarSobreSolicitud(s, "Aprobado")}
                            disabled={!puedeAprobar}
                            className="w-6 h-6 border border-green-500 text-green-500 rounded-md flex items-center justify-center hover:bg-green-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          <button
                            title={
                              puedeAprobar
                                ? "Rechazar"
                                : "No puedes actuar en esta etapa"
                            }
                            onClick={() => actuarSobreSolicitud(s, "Rechazado")}
                            disabled={!puedeAprobar}
                            className="w-6 h-6 border border-red-500 text-red-500 rounded-md flex items-center justify-center hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
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
                Nueva Solicitud
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
                  Tipo de solicitud
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => {
                    setForm({ ...form, tipo: e.target.value });
                    resetCamposPorTipo();
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                >
                  <option>Permiso Personal</option>
                  <option>Vacaciones</option>
                </select>
              </div>

              {/* Campos específicos por tipo de solicitud */}
              {form.tipo === "Permiso Personal" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={fechaPermiso}
                    onChange={(e) => setFechaPermiso(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                  />
                </div>
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
                      onChange={(e) => setFechaInicioVac(e.target.value)}
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
                      onChange={(e) => setFechaFinVac(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                    />
                  </div>
                  {usuario && (
                    <p className="text-xs text-slate-500">
                      Saldo disponible: {saldoDisponible(usuario, vacaciones)}{" "}
                      días
                    </p>
                  )}
                  {fechaInicioVac && fechaFinVac && (
                    <p className="text-xs text-slate-500">
                      {contarDiasHabiles(fechaInicioVac, fechaFinVac)} días
                      hábiles solicitados
                    </p>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Motivo
                </label>
                <textarea
                  value={form.motivo}
                  onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm text-slate-900"
                />
              </div>

              {form.tipo === "Permiso Personal" && (
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
                Crear solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
