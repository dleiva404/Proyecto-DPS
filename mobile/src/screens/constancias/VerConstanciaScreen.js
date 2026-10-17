import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { descargarConstanciaPdf } from "../../services/constanciaPdf";
import { obtenerConstancia } from "../../services/constanciasService";

export default function VerConstanciaScreen({ route }) {
  const constancia = obtenerConstancia(route?.params?.id);
  const [generando, setGenerando] = useState(false);
  if (!constancia) {
    return (
      <View style={styles.contenedorVacio}>
        <Text style={styles.aviso}>No hay una constancia seleccionada.</Text>
      </View>
    );
  }

  if (constancia.estado !== "Aprobada") {
    return (
      <View style={styles.contenedorVacio}>
        <Text style={styles.aviso}>
          {constancia.estado === "Rechazada"
            ? `RRHH rechazó la solicitud: ${constancia.observacion}`
            : "La constancia estará disponible cuando Recursos Humanos apruebe la solicitud."}
        </Text>
      </View>
    );
  }

  const descargar = async () => {
    try {
      setGenerando(true);
      await descargarConstanciaPdf(constancia);
    } catch (error) {
      Alert.alert(
        "No se pudo generar el PDF",
        error?.message || "Intenta de nuevo.",
      );
    } finally {
      setGenerando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View style={styles.tarjeta}>
        <Text style={styles.empresa}>DIDELCO</Text>

        <Text style={styles.subtitulo}>{constancia.tipo || "Constancia"}</Text>

        <View style={styles.separador} />

        <Text style={styles.etiqueta}>Empleado</Text>
        <Text style={styles.valor}>
          {constancia.empleado || "No disponible"}
        </Text>

        <Text style={styles.etiqueta}>Estado</Text>
        <Text style={styles.estado}>{constancia.estado}</Text>

        <Text style={styles.etiqueta}>Antigüedad laboral</Text>
        <Text style={styles.valor}>
          {constancia.antiguedad || "No disponible"}
        </Text>

        <Text style={styles.etiqueta}>Autorizado por</Text>
        <Text style={styles.valor}>
          {constancia.autorizadoPor || "No disponible"}
        </Text>

        <Text style={styles.etiqueta}>Fecha de emisión</Text>
        <Text style={styles.valor}>
          {constancia.fechaEmision || "No disponible"}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.boton, generando && styles.botonDeshabilitado]}
        onPress={descargar}
        disabled={generando}
      >
        <Text style={styles.textoBoton}>
          {generando ? "Generando PDF..." : "Descargar PDF"}
        </Text>
      </TouchableOpacity>
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
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  empresa: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e3a8a",
  },
  subtitulo: {
    fontSize: 18,
    textAlign: "center",
    color: "#334155",
    marginTop: 8,
  },
  separador: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 22,
  },
  etiqueta: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  valor: {
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 16,
  },
  estado: {
    fontSize: 16,
    color: "#15803d",
    fontWeight: "bold",
    marginBottom: 16,
  },
  boton: {
    backgroundColor: "#1e3a8a",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  aviso: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
  },
});
