import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Encabezado de las pantallas de solicitudes, según el Figma:
// "Recursos Humanos" / "Gestión de empleados" / título de la pantalla
export default function CabeceraFigma({ subtitulo }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.titulo}>Recursos Humanos</Text>
      <Text style={styles.gestion}>Gestión de empleados</Text>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    marginBottom: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
  },
  gestion: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 14,
  },
});
