import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import CabeceraFigma from "../../components/CabeceraFigma";
import CampoTexto from "../../components/CampoTexto";
import CustomButton from "../../components/CustomButton";
import { formatearFecha, formatearFechaHora } from "../../services/formato";
import { decidir, obtener } from "../../services/solicitudesService";

// Revisar una solicitud de un empleado del equipo: aprobar o rechazar con motivo.
export default function DetalleAprobacionScreen({ navigation, route }) {
  const { usuario } = useAuth();
  const { id } = route.params;
  const [solicitud, setSolicitud] = useState(null);
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      setSolicitud(obtener(id));
    }, [id]),
  );

  if (!solicitud) {
    return (
      <View style={styles.vacio}>
        <Text style={styles.textoVacio}>Solicitud no encontrada</Text>
      </View>
    );
  }

  const aprobar = async () => {
    const resultado = await decidir(usuario, id, "Aprobado");
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    navigation.goBack();
  };

  const confirmarRechazo = async () => {
    const resultado = await decidir(usuario, id, "Rechazado", motivo);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <CabeceraFigma subtitulo="Revisar solicitud" />

      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>Solicitud de permiso</Text>
        <Text style={styles.linea}>Empleado: {solicitud.empleadoNombre}</Text>
        <Text style={styles.linea}>Departamento: {solicitud.departamento}</Text>
        <Text style={styles.linea}>Empresa: {solicitud.empresa}</Text>
        <Text style={styles.linea}>
          Fecha: {formatearFecha(solicitud.fecha)}
        </Text>
        <Text style={styles.linea}>Motivo: {solicitud.motivo}</Text>
      </View>

      <Text style={styles.seccion}>Historial</Text>
      <Text style={styles.textoSecundario}>
        Creada por {solicitud.empleadoNombre} ·{" "}
        {formatearFechaHora(solicitud.creadaEn)}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!rechazando ? (
        <View style={styles.acciones}>
          <CustomButton
            title="Aprobar"
            onPress={aprobar}
            style={styles.boton}
          />
          <CustomButton
            title="Rechazar"
            type="secondary"
            onPress={() => setRechazando(true)}
            style={styles.boton}
          />
        </View>
      ) : (
        <View style={styles.bloqueRechazo}>
          <CampoTexto
            label="Motivo del rechazo (obligatorio)"
            placeholder="Escribe el motivo"
            value={motivo}
            onChangeText={setMotivo}
            multilinea
          />
          <View style={styles.acciones}>
            <CustomButton
              title="Confirmar rechazo"
              onPress={confirmarRechazo}
              style={[
                styles.boton,
                !motivo.trim() && styles.botonDeshabilitado,
              ]}
            />
            <CustomButton
              title="Cancelar"
              type="secondary"
              onPress={() => {
                setRechazando(false);
                setError("");
              }}
              style={styles.boton}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
  vacio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  textoVacio: {
    color: "#64748B",
  },
  tarjeta: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 6,
  },
  linea: {
    fontSize: 13,
    color: "#1E293B",
    marginTop: 3,
  },
  seccion: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  textoSecundario: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 16,
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
    marginBottom: 12,
  },
  acciones: {
    flexDirection: "row",
    gap: 10,
  },
  boton: {
    flex: 1,
  },
  botonDeshabilitado: {
    opacity: 0.4,
  },
  bloqueRechazo: {
    marginTop: 4,
  },
});
