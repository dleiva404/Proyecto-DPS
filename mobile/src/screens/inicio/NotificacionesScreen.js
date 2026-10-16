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
import {
  listarNotificaciones,
  marcarTodasLeidas as marcarLeidasServicio,
} from "../../services/notificacionesService";

export default function NotificacionesScreen({ onBack }) {
  const { usuario } = useAuth();
  const userRole = usuario?.rol || usuario?.role || "empleado";
  const userName = usuario?.nombre || usuario?.correo || "Colaborador";

  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    setNotificaciones(listarNotificaciones(usuario));
  }, [usuario]);

  const marcarTodasLeidas = () => {
    marcarLeidasServicio(usuario);
    setNotificaciones(listarNotificaciones(usuario));
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

      {notificaciones.length === 0 && (
        <Text style={styles.vacio}>No tienes notificaciones por ahora.</Text>
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
  vacio: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 30,
  },
});
