import { listarPropias, pendientesDeEquipo } from "./solicitudesService";
import {
  listarVacacionesEmpleado,
  listarVacacionesPendientesPorRol,
} from "./solicitudesVacacionesService";
import {
  listarConstanciasPropias,
  listarConstanciasPendientes,
} from "./constanciasService";
import { formatearFecha } from "./formato";

const leidas = new Set();

const ESTILO = {
  Aprobada: {
    icono: "checkmark-circle-outline",
    colorIcono: "#059669",
    bgIcono: "#D1FAE5",
    estado: "aprobado",
  },
  Rechazada: {
    icono: "close-circle-outline",
    colorIcono: "#DC2626",
    bgIcono: "#FEE2E2",
    estado: "rechazado",
  },
  Pendiente: {
    icono: "time-outline",
    colorIcono: "#D97706",
    bgIcono: "#FEF3C7",
    estado: "pendiente",
  },
};

export function contarPorRevisar(usuario) {
  if (!usuario) return { permisos: 0, vacaciones: 0, constancias: 0, total: 0 };
  const permisos = pendientesDeEquipo(usuario).length;
  const vacaciones = listarVacacionesPendientesPorRol(usuario).length;
  const constancias = listarConstanciasPendientes(usuario).length;
  return {
    permisos,
    vacaciones,
    constancias,
    total: permisos + vacaciones + constancias,
  };
}

const fechaDe = (s) =>
  formatearFecha(
    s.historial?.[s.historial.length - 1]?.fecha ||
      s.fechaEmision ||
      s.creadaEn,
  );

export function listarNotificaciones(usuario) {
  if (!usuario) return [];
  const lista = [];

  // 1) Lo que le toca revisar
  const porRevisar = contarPorRevisar(usuario);
  if (porRevisar.total > 0) {
    const partes = [
      porRevisar.vacaciones && `${porRevisar.vacaciones} de vacaciones`,
      porRevisar.permisos && `${porRevisar.permisos} de permisos`,
      porRevisar.constancias && `${porRevisar.constancias} de constancias`,
    ].filter(Boolean);
    lista.push({
      id: `revisar-${porRevisar.vacaciones}-${porRevisar.permisos}-${porRevisar.constancias}`,
      titulo: "Solicitudes por revisar",
      descripcion: `Tienes ${partes.join(", ")} esperando tu revisión.`,
      fecha: "Ahora",
      ...ESTILO.Pendiente,
    });
  }

  const propias = [
    ...listarPropias(usuario).map((s) => ({
      ...s,
      nombre: "permiso",
      detalle: `del ${formatearFecha(s.fecha)}`,
    })),
    ...listarVacacionesEmpleado(usuario.id).map((s) => ({
      ...s,
      nombre: "vacaciones",
      detalle: `del ${formatearFecha(s.fechaInicio)} al ${formatearFecha(s.fechaFin)}`,
    })),
    ...listarConstanciasPropias(usuario).map((s) => ({
      ...s,
      nombre: "constancia",
      detalle: `dirigida a ${s.destinatario}`,
    })),
  ];

  propias
    .filter((s) => s.estado !== "Pendiente")
    .forEach((s) => {
      const aprobada = s.estado === "Aprobada";
      lista.push({
        id: `${s.id}-${s.estado}`,
        titulo: `Tu solicitud de ${s.nombre} fue ${aprobada ? "aprobada" : "rechazada"}`,
        descripcion:
          `${s.id} ${s.detalle}.` +
          (aprobada
            ? s.nombre === "constancia"
              ? " Ya puedes descargarla en PDF."
              : ""
            : ` Motivo: ${(s.motivoRechazo || s.observacion || "sin detalle").replace(/\.$/, "")}.`),
        fecha: fechaDe(s),
        ...ESTILO[s.estado],
      });
    });

  return lista.map((n) => ({ ...n, leida: leidas.has(n.id) }));
}

export function contarNoLeidas(usuario) {
  return listarNotificaciones(usuario).filter((n) => !n.leida).length;
}

export function marcarTodasLeidas(usuario) {
  listarNotificaciones(usuario).forEach((n) => leidas.add(n.id));
}
