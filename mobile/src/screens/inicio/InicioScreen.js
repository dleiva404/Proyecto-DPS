import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import CustomCard from "../../components/CustomCard";
import CustomHeader from "../../components/CustomHeader";
import { useAuth } from "../../context/AuthContext";
import NotificacionesScreen from "./NotificacionesScreen";

export default function InicioScreen({ route, navigation }) {
  const { usuario, logout } = useAuth();
  const [verNotificaciones, setVerNotificaciones] = useState(false);

  const userRole = (
    usuario?.rol ||
    usuario?.role ||
    route?.params?.role ||
    "empleado"
  ).toLowerCase();

  const userName = usuario?.nombre || usuario?.correo || "Colaborador";

  if (verNotificaciones) {
    return <NotificacionesScreen onBack={() => setVerNotificaciones(false)} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <CustomHeader
        title="Gestión de RRHH"
        subtitle="GRUPO CALMA"
        userName={userName}
        userRole={userRole}
        onLogout={logout}
        onNotificationsPress={() => setVerNotificaciones(true)}
        unreadCount={2}
      />

      {/* Resumen */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Ionicons name="calendar-outline" size={22} color="#2563EB" />
          <Text style={styles.statNumber}>15</Text>
          <Text style={styles.statLabel}>Días Vacaciones</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="document-text-outline" size={22} color="#10B981" />
          <Text style={styles.statNumber}>Activa</Text>
          <Text style={styles.statLabel}>Constancia Salarial</Text>
        </View>
      </View>

      {/* Opciones por rol */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Panel de Control</Text>

        {userRole === "empleado" && (
          <CustomCard
            title="Mis Trámites"
            description="Consulta el estado actual de tus permisos, vacaciones y constancias laborales."
            icon="folder-open-outline"
            iconColor="#2563EB"
            iconBg="#EFF6FF"
            accentColor="#2563EB"
          >
            <CustomButton
              title="Ver Solicitudes"
              type="primary"
              onPress={() => navigation?.navigate?.("Solicitudes")}
            />
          </CustomCard>
        )}

        {(userRole === "jefe" ||
          userRole === "analista" ||
          userRole === "gerente") && (
          <CustomCard
            title="Aprobaciones Pendientes"
            description="Tienes solicitudes recientes de tu personal a la espera de revisión."
            icon="time-outline"
            iconColor="#D97706"
            iconBg="#FEF3C7"
            accentColor="#F59E0B"
          >
            <CustomButton
              title="Revisar Bandeja"
              type="primary"
              onPress={() => navigation?.navigate?.("Bandeja")}
            />
          </CustomCard>
        )}

        {userRole === "rrhh" && (
          <CustomCard
            title="Administración General (RRHH)"
            description="Gestión global de reportes, constancias y estadísticas de la empresa."
            icon="stats-chart-outline"
            iconColor="#059669"
            iconBg="#D1FAE5"
            accentColor="#10B981"
          >
            <CustomButton
              title="Generar Reportes"
              type="primary"
              onPress={() => navigation?.navigate?.("Reportes")}
            />
          </CustomCard>
        )}
      </View>
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "flex-start",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 12,
  },
});