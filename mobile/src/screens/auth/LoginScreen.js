import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

// valida formato de correo
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
      <Text style={styles.titulo}>RRHH Didelco</Text>
      <Text style={styles.subtitulo}>Inicia sesion para continuar</Text>

      <Text style={styles.label}>Correo</Text>
      <TextInput
        style={[styles.input, errores.correo && styles.inputError]}
        placeholder="usuario@didelco.com"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errores.correo && <Text style={styles.error}>{errores.correo}</Text>}

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.filaClave}>
        <TextInput
          style={[
            styles.input,
            { flex: 1 },
            errores.clave && styles.inputError,
          ]}
          placeholder="******"
          value={clave}
          onChangeText={setClave}
          secureTextEntry={!verClave}
        />
        <TouchableOpacity
          onPress={() => setVerClave(!verClave)}
          style={styles.btnVer}
        >
          <Text style={styles.txtVer}>{verClave ? "Ocultar" : "Ver"}</Text>
        </TouchableOpacity>
      </View>
      {errores.clave && <Text style={styles.error}>{errores.clave}</Text>}

      {errorGeneral ? (
        <Text style={styles.errorGeneral}>{errorGeneral}</Text>
      ) : null}

      <TouchableOpacity style={styles.boton} onPress={handleLogin}>
        <Text style={styles.txtBoton}>Iniciar sesion</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// colores temporales
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e3a8a",
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputError: { borderColor: "#dc2626" },
  filaClave: { flexDirection: "row", alignItems: "center" },
  btnVer: { marginLeft: 8, padding: 8 },
  txtVer: { color: "#1e3a8a", fontWeight: "600" },
  error: { color: "#dc2626", fontSize: 12, marginTop: 4 },
  errorGeneral: { color: "#dc2626", textAlign: "center", marginTop: 16 },
  boton: {
    backgroundColor: "#1e3a8a",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 28,
    alignItems: "center",
  },
  txtBoton: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
