import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";

import { useAuth } from "../../context/AuthContext";
import {
  obtenerConstancia,
  resolverConstancia,
} from "../../services/constanciasService";

export default function AutorizarConstanciaScreen({ route, navigation }) {
  const { usuario } = useAuth();
  const solicitud = obtenerConstancia(route?.params?.id);

  const [observacion, setObservacion] = useState("");
  const [procesando, setProcesando] = useState(false);

  const resolverSolicitud = async (decision) => {
    if (procesando || !solicitud) return;

    if (solicitud.estado !== "Pendiente") {
      Alert.alert(
        "Solicitud procesada",
        "Esta solicitud ya tiene una decisión.",
      );
      return;
    }

    if (decision === "Rechazada" && !observacion.trim()) {
      Alert.alert(
        "Observación obligatoria",
        "Explicá por qué se rechaza la constancia.",
      );
      return;
    }

    try {
      setProcesando(true);

      const resultado = resolverConstancia(
        usuario,
        solicitud.id,
        decision,
        observacion,
      );
      if (!resultado.ok) throw new Error(resultado.error);

      Alert.alert(
        "Solicitud procesada",
        `La solicitud fue ${decision.toLowerCase()} correctamente.`,
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "No se pudo procesar",
        error?.message || "Ocurrió un problema al procesar la solicitud.",
      );
    } finally {
      setProcesando(false);
    }
  };

  if (!solicitud) {
    return (
      <View style={styles.contenedorVacio}>
        <Text style={styles.titulo}>Autorizar constancia</Text>
        <Text style={styles.aviso}>No hay una solicitud seleccionada.</Text>
      </View>
    );
  }

  const pendiente = solicitud.estado === "Pendiente";

  return (
    <ScrollView
      contentContainerStyle={styles.contenedor}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>Autorizar constancia</Text>

      <Text style={styles.descripcion}>
        Revisión de solicitudes por Recursos Humanos.
      </Text>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Código</Text>
        <Text style={styles.valor}>{solicitud.codigo || solicitud.id}</Text>

        <Text style={styles.etiqueta}>Empleado</Text>
        <Text style={styles.valor}>
          {solicitud.empleado || "No disponible"}
        </Text>

        <Text style={styles.etiqueta}>Tipo de constancia</Text>
        <Text style={styles.valor}>{solicitud.tipo || "No disponible"}</Text>

        <Text style={styles.etiqueta}>Motivo</Text>
        <Text style={styles.valor}>{solicitud.motivo || "No disponible"}</Text>

        <Text style={styles.etiqueta}>Estado</Text>
        <Text
          style={[
            styles.estado,
            solicitud.estado === "Aprobada" && styles.aprobada,
            solicitud.estado === "Rechazada" && styles.rechazada,
          ]}
        >
          {solicitud.estado || "No disponible"}
        </Text>
      </View>

      <Text style={styles.etiqueta}>Observación de RRHH</Text>

      <TextInput
        style={styles.campo}
        placeholder="Escribí una observación"
        placeholderTextColor="#94a3b8"
        multiline
        textAlignVertical="top"
        value={pendiente ? observacion : solicitud.observacion || ""}
        onChangeText={setObservacion}
        editable={pendiente && !procesando}
        maxLength={300}
      />

      {pendiente && (
        <View style={styles.botones}>
          <TouchableOpacity
            style={[
              styles.boton,
              styles.botonAprobar,
              procesando && styles.botonDeshabilitado,
            ]}
            onPress={() => resolverSolicitud("Aprobada")}
            disabled={procesando}
          >
            <Text style={styles.textoBoton}>
              {procesando ? "Procesando..." : "Aprobar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.boton,
              styles.botonRechazar,
              procesando && styles.botonDeshabilitado,
            ]}
            onPress={() => resolverSolicitud("Rechazada")}
            disabled={procesando}
          >
            <Text style={styles.textoBoton}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  contenedorVacio: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
    justifyContent: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  valor: {
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 16,
  },
  estado: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#b45309",
  },
  aprobada: {
    color: "#15803d",
  },
  rechazada: {
    color: "#b91c1c",
  },
  campo: {
    minHeight: 110,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    fontSize: 15,
    color: "#0f172a",
  },
  botones: {
    flexDirection: "row",
    gap: 12,
  },
  boton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  botonAprobar: {
    backgroundColor: "#15803d",
  },
  botonRechazar: {
    backgroundColor: "#b91c1c",
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  aviso: {
    color: "#64748b",
    fontSize: 15,
    textAlign: "center",
  },
});
