
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import theme from "../../theme/theme";
import { listarVacacionesEmpleado } from "../../services/solicitudesVacacionesService";

export default function HistorialScreen({ navigation }) {
  const { usuario } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (usuario?.id) {
        setSolicitudes(listarVacacionesEmpleado(usuario.id));
      } else {
        setSolicitudes([]);
      }
    }, [usuario?.id]),
  );

  const colorEstado = (estado) => {
    if (estado === "Aprobada") return theme.colors.success;
    if (estado === "Rechazada") return theme.colors.error;
    return theme.colors.warning;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Mis solicitudes</Text>
      <Text style={styles.subtitle}>
        Consulta tus solicitudes y su estado de aprobación.
      </Text>

      <TouchableOpacity
        style={styles.newCard}
        onPress={() => navigation.navigate("SolicitarVacaciones")}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>📅</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Solicitar vacaciones</Text>
          <Text style={styles.cardDescription}>
            Selecciona las fechas y consulta los días hábiles.
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Historial de vacaciones</Text>

      {solicitudes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aún no tienes solicitudes</Text>
          <Text style={styles.emptyText}>
            Cuando envíes una solicitud de vacaciones, aparecerá aquí.
          </Text>
        </View>
      ) : (
        solicitudes.map((solicitud) => (
          <View key={solicitud.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestId}>{solicitud.id}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: colorEstado(solicitud.estado) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: colorEstado(solicitud.estado) },
                  ]}
                >
                  {solicitud.estado}
                </Text>
              </View>
            </View>

            <Text style={styles.requestTitle}>Vacaciones</Text>
            <Text style={styles.detail}>
              Inicio: {solicitud.fechaInicio}
            </Text>
            <Text style={styles.detail}>
              Final: {solicitud.fechaFin}
            </Text>
            <Text style={styles.detail}>
              Días solicitados: {solicitud.diasSolicitados}
            </Text>
            <Text style={styles.detail}>
              Motivo: {solicitud.motivo}
            </Text>
            <Text style={styles.stage}>
              Etapa actual: {solicitud.etapaActual || "Sin asignar"}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 32,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 6,
    marginBottom: 22,
  },
  newCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  arrow: {
    fontSize: 28,
    color: theme.colors.primary,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 25,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    lineHeight: 21,
  },
  requestCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  requestId: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  requestTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  stage: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.primary,
    marginTop: 12,
  },
});
