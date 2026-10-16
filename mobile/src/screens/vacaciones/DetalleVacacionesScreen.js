import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import theme from "../../theme/theme";
import { VISUAL_ESTADO } from "../../constants/estados";
import { formatearFecha, formatearFechaHora } from "../../services/formato";
import { obtenerSolicitudVacaciones } from "../../services/solicitudesVacacionesService";

const ETAPAS = ["ANALISTA", "GERENTE", "JEFE"];

const NOMBRE_ETAPA = {
  ANALISTA: "Analista de Nómina",
  GERENTE: "Gerente",
  JEFE: "Jefe inmediato",
};

// detalle de una solicitud de vacaciones con su avance por etapas
export default function DetalleVacacionesScreen({ route }) {
  const { id } = route.params;
  const [solicitud, setSolicitud] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setSolicitud(obtenerSolicitudVacaciones(id));
    }, [id]),
  );

  if (!solicitud) {
    return (
      <View style={styles.vacio}>
        <Text style={styles.textoVacio}>No se encontró la solicitud.</Text>
      </View>
    );
  }

  const visual = VISUAL_ESTADO[solicitud.estado];

  // estado de cada etapa segun el historial
  const etapas = ETAPAS.map((etapa) => {
    const registro = solicitud.historial.find((h) => h.rol === etapa);
    let texto = "En espera";
    let color = theme.colors.border;

    if (registro) {
      const aprobo = registro.decision === "Aprobar";
      texto = `${aprobo ? "Aprobó" : "Rechazó"} · ${formatearFechaHora(registro.fecha)}`;
      color = aprobo ? theme.colors.success : theme.colors.error;
    } else if (solicitud.etapaActual === etapa) {
      texto = "Revisando ahora";
      color = theme.colors.warning;
    }

    return { etapa, texto, color };
  });

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
    >
      <View style={styles.tarjeta}>
        <View style={styles.fila}>
          <Text style={styles.id}>{solicitud.id}</Text>
          <Text style={[styles.estado, { color: visual.color }]}>
            {visual.label}
          </Text>
        </View>

        <Text style={styles.linea}>
          Del {formatearFecha(solicitud.fechaInicio)} al{" "}
          {formatearFecha(solicitud.fechaFin)}
        </Text>
        <Text style={styles.linea}>
          Días hábiles: {solicitud.diasSolicitados}
        </Text>
        <Text style={styles.subtitulo}>Motivo</Text>
        <Text style={styles.linea}>{solicitud.motivo}</Text>

        {solicitud.motivoRechazo ? (
          <>
            <Text style={styles.subtitulo}>Motivo del rechazo</Text>
            <Text style={[styles.linea, { color: theme.colors.error }]}>
              {solicitud.motivoRechazo}
            </Text>
          </>
        ) : null}
      </View>

      <Text style={styles.seccion}>Avance de la aprobación</Text>

      {etapas.map((e, i) => (
        <View key={e.etapa} style={styles.paso}>
          <View style={[styles.punto, { backgroundColor: e.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pasoTitulo}>
              {i + 1}. {NOMBRE_ETAPA[e.etapa]}
            </Text>
            <Text style={styles.pasoTexto}>{e.texto}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: theme.colors.background },
  contenido: { padding: theme.spacing.md, paddingBottom: 40 },
  tarjeta: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: 20,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  id: { fontSize: 16, fontWeight: "bold", color: theme.colors.primary },
  estado: { fontWeight: "bold" },
  linea: { fontSize: 14, color: theme.colors.text, marginBottom: 6 },
  subtitulo: {
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  seccion: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 12,
  },
  paso: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  punto: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
    marginTop: 3,
  },
  pasoTitulo: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
  pasoTexto: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  vacio: { flex: 1, alignItems: "center", justifyContent: "center" },
  textoVacio: { color: theme.colors.textSecondary },
});
