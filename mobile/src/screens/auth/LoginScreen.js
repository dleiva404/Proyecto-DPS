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
  StatusBar,
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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.headerContainer}>
        <Image 
          source={require("../../../assets/LogoGC.png")} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.titulo}>Gestión Recursos Humanos</Text>
        <Text style={styles.subtitulo}>Grupo Calma</Text>
        <Text style={styles.instructions}>Ingrese sus credenciales para continuar</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
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
            placeholder="••••••••"
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
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoImage: {
    width: 84,
    height: 84,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  instructions: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 10,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  label: { 
    fontSize: 12, 
    fontWeight: "700", 
    color: "#334155", 
    marginBottom: 8, 
    marginTop: 18,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1E293B",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingRight: 10,
  },
  inputClave: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1E293B",
  },
  inputError: { 
    borderWidth: 1,
    borderColor: "#dc2626",
    backgroundColor: "#FEF2F2",
  },
  btnVer: { padding: 8 },
  error: { color: "#dc2626", fontSize: 12, marginTop: 4 },
  errorGeneral: { color: "#dc2626", textAlign: "center", marginTop: 16 },
  boton: {
    marginTop: 32,
    paddingVertical: 15,
    borderRadius: 12,
  },
});