import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomCard from "../../components/CustomCard";
import StatusBadge from "../../components/StatusBadge";
import CustomButton from "../../components/CustomButton";
import { useAuth } from "../../context/AuthContext";

// Datos de prueba según el rol
const obtenerNotificaciones = (rol, nombre) => {
  const roleKey = (rol || "empleado").toLowerCase();

  if (roleKey === "rrhh") {
    return [
      {
        id: "rrhh-1",
        titulo: "Nuevas Solicitudes en Cola RRHH",
        descripcion: `${nombre}, hay 3 constancias salariales y 2 vacaciones aprobadas listas para validación.`,
        fecha: "Hace 10 min",
        estado: "pendiente",
        icono: "file-tray-full-outline",
        colorIcono: "#D97706",
        bgIcono: "#FEF3C7",
        leida: false,
      },
      {
        id: "rrhh-2",
        titulo: "Reporte Mensual Generado",
        descripcion: "El consolidado de ausencias y permisos de Grupo Calma se exportó bien.",
        fecha: "Hace 1 hora",
        estado: "aprobado",
        icono: "stats-chart-outline",
        colorIcono: "#059669",
        bgIcono: "#D1FAE5",
        leida: false,
      },
      {
        id: "rrhh-3",
        titulo: "Expediente Pendiente de Firma",
        descripcion: "Falta comprobante del ISSS en el trámite #1042 de Operaciones.",
        fecha: "Ayer, 3:15 PM",
        estado: "urgente",
        icono: "alert-circle-outline",
        colorIcono: "#DC2626",
        bgIcono: "#FEE2E2",
        leida: true,
      },
    ];
  }

  if (roleKey === "jefe" || roleKey === "gerente" || roleKey === "analista") {
    return [
      {
        id: "jefe-1",
        titulo: "Aprobación Requerida",
        descripcion: `${nombre}, tienes 2 solicitudes de permiso de tu equipo esperando visto bueno.`,
        fecha: "Hace 20 min",
        estado: "pendiente",
        icono: "time-outline",
        colorIcono: "#D97706",
        bgIcono: "#FEF3C7",
        leida: false,
      },
      {
        id: "jefe-2",
        titulo: "Vacaciones Programadas",
        descripcion: "Se actualizó el calendario de turnos del área para la otra semana.",
        fecha: "Hace 3 horas",
        estado: "info",
        icono: "calendar-outline",
        colorIcono: "#2563EB",
        bgIcono: "#EFF6FF",
        leida: false,
      },
    ];
  }

  // Vista empleado
  return [
    {
      id: "emp-1",
      titulo: "Solicitud de Vacaciones Aprobada",
      descripcion: `Hola ${nombre}, tus vacaciones del 12 al 19 de noviembre ya fueron aprobadas.`,
      fecha: "Hace 15 min",
      estado: "aprobado",
      icono: "checkmark-circle-outline",
      colorIcono: "#059669",
      bgIcono: "#D1FAE5",
      leida: false,
    },
    {
      id: "emp-2",
      titulo: "Constancia Salarial Disponible",
      descripcion: "Tu constancia con firma y QR ya está lista para descargar.",
      fecha: "Hace 2 horas",
      estado: "activo",
      icono: "document-text-outline",
      colorIcono: "#2563EB",
      bgIcono: "#EFF6FF",
      leida: false,
    },
    {
      id: "emp-3",
      titulo: "Observación en Permiso Médico",
      descripcion: "Falta subir el comprobante del ISSS para completar el trámite.",
      fecha: "02 Oct 2026",
      estado: "rechazado",
      icono: "alert-circle-outline",
      colorIcono: "#DC2626",
      bgIcono: "#FEE2E2",
      leida: true,
    },
  ];
};

export default function NotificacionesScreen({ onBack }) {
  const { usuario } = useAuth();
  const userRole = usuario?.rol || usuario?.role || "empleado";
  const userName = usuario?.nombre || usuario?.correo || "Colaborador";

  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    setNotificaciones(obtenerNotificaciones(userRole, userName));
  }, [userRole, userName]);

  const marcarTodasLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#1E293B" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>Notificaciones</Text>
            <Text style={styles.subtitle}>
              {userName} • {userRole.toUpperCase()}
            </Text>
          </View>
        </View>
        <StatusBadge
          label={noLeidas > 0 ? `${noLeidas} NUEVAS` : "AL DÍA"}
          status={noLeidas > 0 ? "pendiente" : "aprobado"}
        />
      </View>

      {noLeidas > 0 && (
        <CustomButton
          title="Marcar todas como leídas"
          type="secondary"
          onPress={marcarTodasLeidas}
          style={styles.markReadBtn}
        />
      )}

      {notificaciones.map((item) => (
        <CustomCard
          key={item.id}
          title={item.titulo}
          description={item.descripcion}
          icon={item.icono}
          iconColor={item.colorIcono}
          iconBg={item.bgIcono}
          accentColor={!item.leida ? "#2563EB" : "#CBD5E1"}
        >
          <View style={styles.cardFooter}>
            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={14} color="#64748B" />
              <Text style={styles.dateText}>{item.fecha}</Text>
            </View>
            <StatusBadge label={item.estado} status={item.estado} />
          </View>
        </CustomCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  backBtn: {
    padding: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    marginRight: 12,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  markReadBtn: {
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
  },
});