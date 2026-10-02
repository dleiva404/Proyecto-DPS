import { View, Text, StyleSheet } from "react-native";

// pantalla temporal
export default function PantallaPendiente({ titulo, parte }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.texto}>Pendiente - {parte}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  titulo: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  texto: { color: "#6b7280" },
});
