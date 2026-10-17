
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

// =====================================================
// PARTE 5 - AUTORIZACIÓN DE CONSTANCIAS
//
// Permite revisar solicitudes de constancias,
// aprobarlas o rechazarlas con una observación.
//
// Compatible con la bandeja de constancias y
// con el servicio actualizado del proyecto.
// =====================================================

export default function AutorizarConstanciaScreen({
  route,
  navigation,
}) {
  const { usuario } = useAuth();

  // =====================================================
  // OBTENER LA SOLICITUD
  //
  // Acepta tanto el ID enviado por la navegación
  // como el objeto enviado desde nuestra bandeja.
  // =====================================================

  const idSolicitud =
    route?.params?.id ||
    route?.params?.solicitud?.id;

  const solicitud = idSolicitud
    ? obtenerConstancia(idSolicitud)
    : null;

  const [observacion, setObservacion] = useState("");
  const [procesando, setProcesando] = useState(false);

  // =====================================================
  // APROBAR O RECHAZAR LA SOLICITUD
  // =====================================================

  const resolverSolicitud = async (decision) => {
    if (procesando || !solicitud) return;

    // Evitar procesar una solicitud ya resuelta.
    if (solicitud.estado !== "Pendiente") {
      Alert.alert(
        "Solicitud procesada",
        "Esta solicitud ya tiene una decisión."
      );
      return;
    }

    // El rechazo necesita una explicación.
    if (decision === "Rechazada" && !observacion.trim()) {
      Alert.alert(
        "Observación obligatoria",
        "Explica por qué se rechaza la constancia."
      );
      return;
    }

    try {
      setProcesando(true);

      // Utilizamos el servicio actualizado de Leiva.
      const resultado = await resolverConstancia(
        usuario,
        solicitud.id,
        decision,
        observacion.trim()
      );

      if (!resultado.ok) {
        throw new Error(
          resultado.error ||
          "No se pudo procesar la solicitud."
        );
      }

      Alert.alert(
        "Solicitud procesada",
        `La solicitud fue ${
          decision === "Aprobada" ? "aprobada" : "rechazada"
        } correctamente.`
      );

      // Regresar a la bandeja.
      navigation.goBack();

    } catch (error) {
      Alert.alert(
        "No se pudo procesar",
        error?.message ||
          "Ocurrió un problema al procesar la solicitud."
      );
    } finally {
      setProcesando(false);
    }
  };

  // =====================================================
  // SOLICITUD NO ENCONTRADA
  // =====================================================

  if (!solicitud) {
    return (
      <View style={styles.contenedorVacio}>
        <Text style={styles.aviso}>
          No hay una solicitud seleccionada.
        </Text>
      </View>
    );
  }

  const pendiente = solicitud.estado === "Pendiente";

  // =====================================================
  // DISEÑO DE LA PANTALLA
  // =====================================================

  return (
    <ScrollView
      contentContainerStyle={styles.contenedor}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.descripcion}>
        Revisión de solicitudes por Recursos Humanos.
      </Text>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Código</Text>
        <Text style={styles.valor}>
          {solicitud.codigo || solicitud.id}
        </Text>

        <Text style={styles.etiqueta}>Empleado</Text>
        <Text style={styles.valor}>
          {solicitud.empleado || "No disponible"}
        </Text>

        <Text style={styles.etiqueta}>
          Tipo de constancia
        </Text>
        <Text style={styles.valor}>
          {solicitud.tipo || "No disponible"}
        </Text>

        <Text style={styles.etiqueta}>Motivo</Text>
        <Text style={styles.valor}>
          {solicitud.motivo || "No disponible"}
        </Text>

        <Text style={styles.etiqueta}>Estado</Text>
        <Text
          style={[
            styles.estado,
            solicitud.estado === "Aprobada" &&
              styles.aprobada,
            solicitud.estado === "Rechazada" &&
              styles.rechazada,
          ]}
        >
          {solicitud.estado || "No disponible"}
        </Text>
      </View>

      {/* Observación del responsable */}
      <Text style={styles.etiqueta}>
        Observación de RRHH
      </Text>

      <TextInput
        style={styles.campo}
        placeholder="Escribe una observación"
        placeholderTextColor="#94a3b8"
        multiline
        textAlignVertical="top"
        value={
          pendiente
            ? observacion
            : solicitud.observacion || ""
        }
        onChangeText={setObservacion}
        editable={pendiente && !procesando}
        maxLength={300}
      />

      {/* Acciones disponibles mientras está pendiente */}
      {pendiente && (
        <View style={styles.botones}>
          <TouchableOpacity
            style={[
              styles.boton,
              styles.botonAprobar,
              procesando && styles.botonDeshabilitado,
            ]}
            onPress={() =>
              resolverSolicitud("Aprobada")
            }
            disabled={procesando}
            accessibilityRole="button"
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
            onPress={() =>
              resolverSolicitud("Rechazada")
            }
            disabled={procesando}
            accessibilityRole="button"
          >
            <Text style={styles.textoBoton}>
              Rechazar
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// =====================================================
// ESTILOS ORIGINALES
// =====================================================

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
