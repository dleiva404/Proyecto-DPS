import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";

export default function PerfilScreen() {
  const { usuario, logout, actualizarFoto } = useAuth();

  // abre la galeria para elegir la foto
  const cambiarFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a la galeria para cambiar la foto",
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!resultado.canceled) {
      actualizarFoto(resultado.assets[0].uri);
    }
  };

  const confirmarSalir = () => {
    Alert.alert("Cerrar sesion", "¿Seguro que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: logout },
    ]);
  };

  // iniciales por si no tiene foto
  const iniciales = `${usuario.nombre[0]}${usuario.apellido[0]}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={cambiarFoto}>
        {usuario.fotoUrl ? (
          <Image source={{ uri: usuario.fotoUrl }} style={styles.foto} />
        ) : (
          <View style={[styles.foto, styles.sinFoto]}>
            <Text style={styles.iniciales}>{iniciales}</Text>
          </View>
        )}
        <Text style={styles.cambiar}>Cambiar foto</Text>
      </TouchableOpacity>

      <Text style={styles.nombre}>
        {usuario.nombre} {usuario.apellido}
      </Text>
      <Text style={styles.rol}>{usuario.rol}</Text>

      <View style={styles.tarjeta}>
        <Dato label="Codigo" valor={usuario.codigo} />
        <Dato label="Correo" valor={usuario.correo} />
        <Dato label="Puesto" valor={usuario.puesto} />
        <Dato label="Departamento" valor={usuario.departamento} />
        <Dato label="Empresa" valor={usuario.empresa} />
        <Dato label="Fecha de ingreso" valor={usuario.fechaIngreso} />
      </View>

      <TouchableOpacity style={styles.btnSalir} onPress={confirmarSalir}>
        <Text style={styles.txtSalir}>Cerrar sesion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// fila de dato del perfil
function Dato({ label, valor }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

// colores temporales, la parte 2 los cambia por el tema
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  foto: { width: 110, height: 110, borderRadius: 55 },
  sinFoto: {
    backgroundColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
  },
  iniciales: { color: "#fff", fontSize: 36, fontWeight: "bold" },
  cambiar: {
    color: "#1e3a8a",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  nombre: { fontSize: 22, fontWeight: "bold", marginTop: 16 },
  rol: { fontSize: 14, color: "#6b7280", marginBottom: 24 },
  tarjeta: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  label: { color: "#6b7280" },
  valor: {
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  btnSalir: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: "#dc2626",
    borderRadius: 8,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  txtSalir: { color: "#dc2626", fontWeight: "bold" },
});
