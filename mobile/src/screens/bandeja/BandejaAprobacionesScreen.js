import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import CabeceraFigma from "../../components/CabeceraFigma";
import CustomButton from "../../components/CustomButton";
import PantallaPendiente from "../../components/PantallaPendiente";
import { formatearFecha } from "../../services/formato";
import {
  decidir,
  pendientesDeEquipo,
} from "../../services/solicitudesService";

// Pendientes de aprobar (jefe inmediato). Los demás roles todavía no tienen bandeja.
export default function BandejaAprobacionesScreen({ navigation }) {
  const { usuario } = useAuth();
  const [pendientes, setPendientes] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useFocusEffect(
    useCallback(() => {
      setPendientes(pendientesDeEquipo(usuario));
    }, [usuario]),
  );

  if (usuario.rol !== "JEFE") {
    return <PantallaPendiente titulo="Bandeja de aprobaciones" parte="Pendiente" />;
  }

  const aprobar = (id) => {
    const resultado = decidir(usuario, id, "Aprobado");
    if (!resultado.ok) {
      setMensaje(resultado.error);
      return;
    }
    setMensaje("");
    setPendientes(pendientesDeEquipo(usuario));
  };

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
    >
      <CabeceraFigma subtitulo="Pendientes de aprobar" />

      {mensaje ? <Text style={styles.error}>{mensaje}</Text> : null}

      {pendientes.length === 0 ? (
        <Text style={styles.vacio}>
          No tienes solicitudes pendientes de tu personal.
        </Text>
      ) : (
        pendientes.map((s) => (
          <View key={s.id} style={styles.tarjeta}>
            <Text style={styles.titulo}>Solicitud de permiso</Text>
            <Text style={styles.linea}>Empleado: {s.empleadoNombre}</Text>
            <Text style={styles.linea}>Empresa: {s.empresa}</Text>
            <Text style={styles.linea}>Fecha: {formatearFecha(s.fecha)}</Text>
            <Text style={styles.linea}>Motivo: {s.motivo}</Text>

            <View style={styles.acciones}>
              <CustomButton
                title="Aprobar"
                onPress={() => aprobar(s.id)}
                style={styles.boton}
              />
              <CustomButton
                title="Rechazar"
                type="secondary"
                onPress={() => navigation.navigate("DetalleAprobacion", { id: s.id })}
                style={styles.boton}
              />
            </View>
          </View>
        ))
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
  error: {
    color: "#DC2626",
    fontSize: 13,
    marginBottom: 12,
  },
  vacio: {
    textAlign: "center",
    color: "#64748B",
    marginVertical: 30,
  },
  tarjeta: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginTop: 2,
  },
  acciones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  boton: {
    flex: 1,
  },
});
