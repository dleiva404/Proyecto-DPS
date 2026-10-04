import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import CustomButton from "../../components/CustomButton";

const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { login } = useAuth();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");

  const validar = () => {
    const e = {};
    if (!correo.trim()) e.correo = "El correo es obligatorio";
    else if (!regexCorreo.test(correo.trim()))
      e.correo = "Formato de correo no valido";

    if (!clave) e.clave = "La contraseña es obligatoria";
    else if (clave.length < 6) e.clave = "Minimo 6 caracteres";

    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = () => {
    setErrorGeneral("");
    if (!validar()) return;

    const res = login(correo, clave);
    if (!res.ok) setErrorGeneral(res.mensaje);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Image 
            source={require("../../../assets/LogoGC.png")} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.titulo}>Gestión Recursos Humanos</Text>
            <Text style={styles.subtitulo}>Grupo Calma</Text>
          </View>
        </View>

        <Text style={styles.instructions}>Ingrese sus credenciales para continuar</Text>

        <Text style={styles.label}>CORREO</Text>
        <TextInput
          style={[styles.input, errores.correo && styles.inputError]}
          placeholder="rrhh@didelco.com"
          placeholderTextColor="#94a3b8"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errores.correo && <Text style={styles.error}>{errores.correo}</Text>}

        <Text style={styles.label}>CONTRASEÑA / PIN</Text>
        <View style={[styles.inputWrapper, errores.clave && styles.inputError]}>
          <TextInput
            style={styles.inputClave}
            placeholder="********"
            placeholderTextColor="#94a3b8"
            value={clave}
            onChangeText={setClave}
            secureTextEntry={!verClave}
          />
          <TouchableOpacity
            onPress={() => setVerClave(!verClave)}
            style={styles.btnVer}
          >
            <Ionicons
              name={verClave ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
        {errores.clave && <Text style={styles.error}>{errores.clave}</Text>}

        {errorGeneral ? (
          <Text style={styles.errorGeneral}>{errorGeneral}</Text>
        ) : null}

        <CustomButton
          title="Iniciar Sesión"
          type="primary"
          onPress={handleLogin}
          style={styles.boton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: "#ffffff",
  },
  content: {
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  logoImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    marginRight: 14,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subtitulo: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  instructions: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 20,
  },
  label: { 
    fontSize: 12, 
    fontWeight: "bold", 
    color: "#475569", 
    marginBottom: 6, 
    marginTop: 14,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    paddingRight: 8,
  },
  inputClave: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
  },
  inputError: { borderColor: "#dc2626" },
  btnVer: { padding: 8 },
  error: { color: "#dc2626", fontSize: 12, marginTop: 4 },
  errorGeneral: { color: "#dc2626", textAlign: "center", marginTop: 16 },
  boton: {
    marginTop: 28,
  },
});