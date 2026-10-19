
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
import { crearConstancia } from "../../services/constanciasService";

// =====================================================
// PARTE 5 - SOLICITAR CONSTANCIA
//
// Permite al empleado solicitar una constancia
// laboral o salarial a Recursos Humanos.
//
// Compatible con el servicio actualizado de Leiva.
// =====================================================

const TIPOS_CONSTANCIA = [
  { id: "laboral", nombre: "Laboral" },
  { id: "salarial", nombre: "Salarial" },
];

export default function SolicitarConstanciaScreen({ navigation }) {
  const { usuario } = useAuth();

  const [tipo, setTipo] = useState("laboral");
  const [destinatario, setDestinatario] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  // =====================================================
  // ENVIAR SOLICITUD
  // =====================================================

  const enviarSolicitud = async () => {
    // Evitar solicitudes duplicadas mientras se procesa.
    if (enviando) return;

    // Comprobar que exista una sesión activa.
    if (!usuario?.id) {
      Alert.alert(
        "Sesión no disponible",
        "Iniciá sesión para solicitar una constancia."
      );
      return;
    }

    const destinatarioLimpio = destinatario.trim();
    const motivoLimpio = motivo.trim();

    // Validar los campos obligatorios.
    if (!destinatarioLimpio || !motivoLimpio) {
      Alert.alert(
        "Campos obligatorios",
        "Completa todos los campos."
      );
      return;
    }

    const datosSolicitud = {
      tipo,
      destinatario: destinatarioLimpio,
      motivo: motivoLimpio,
    };

    try {
      setEnviando(true);

      // Crear la solicitud mediante el servicio actual.
      const resultado = await crearConstancia(
        usuario,
        datosSolicitud
      );

      if (!resultado.ok) {
        throw new Error(
          resultado.error ||
            "No se pudo registrar la solicitud."
        );
      }

      Alert.alert(
        "Solicitud enviada",
        "Tu solicitud de constancia fue enviada a Recursos Humanos."
      );

      // Limpiar el formulario.
      setTipo("laboral");
      setDestinatario("");
      setMotivo("");

      // Regresar a la pantalla anterior.
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "No se pudo enviar",
        error?.message ||
          "Ocurrió un problema al enviar la solicitud."
      );
    } finally {
      setEnviando(false);
    }
  };

  // =====================================================
  // DISEÑO DEL FORMULARIO
  // =====================================================

  return (
    <ScrollView
      contentContainerStyle={styles.contenedor}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.descripcion}>
        Completa la información para solicitar una constancia a Recursos
        Humanos.
      </Text>

      {/* Seleccionar el tipo de constancia */}
      <Text style={styles.etiqueta}>Tipo de constancia</Text>

      <View style={styles.opciones}>
        {TIPOS_CONSTANCIA.map((opcion) => (
          <TouchableOpacity
            key={opcion.id}
            style={[
              styles.opcion,
              tipo === opcion.id && styles.opcionSeleccionada,
            ]}
            onPress={() => setTipo(opcion.id)}
            disabled={enviando}
            accessibilityRole="radio"
            accessibilityState={{
              selected: tipo === opcion.id,
            }}
          >
            <Text
              style={[
                styles.textoOpcion,
                tipo === opcion.id && styles.textoSeleccionado,
              ]}
            >
              {opcion.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Destinatario de la constancia */}
      <Text style={styles.etiqueta}>Dirigida a</Text>

      <TextInput
        style={styles.campo}
        placeholder="Ej. Banco o institución"
        placeholderTextColor="#94a3b8"
        value={destinatario}
        onChangeText={setDestinatario}
        maxLength={100}
        autoCapitalize="sentences"
        editable={!enviando}
      />

      {/* Motivo de la solicitud */}
      <Text style={styles.etiqueta}>Motivo de la solicitud</Text>

      <TextInput
        style={[styles.campo, styles.area]}
        placeholder="Explica para qué necesitas la constancia"
        placeholderTextColor="#94a3b8"
        multiline
        textAlignVertical="top"
        value={motivo}
        onChangeText={setMotivo}
        maxLength={300}
        editable={!enviando}
      />

      {/* Botón para enviar la solicitud */}
      <TouchableOpacity
        style={[
          styles.boton,
          enviando && styles.botonDeshabilitado,
        ]}
        onPress={enviarSolicitud}
        disabled={enviando}
        accessibilityRole="button"
      >
        <Text style={styles.textoBoton}>
          {enviando
            ? "Enviando solicitud..."
            : "Solicitar constancia"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// =====================================================
// ESTILOS ORIGINALES DEL FORMULARIO
// =====================================================

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  descripcion: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  etiqueta: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  opciones: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  opcion: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  opcionSeleccionada: {
    borderColor: "#1e3a8a",
    backgroundColor: "#dbeafe",
  },
  textoOpcion: {
    color: "#475569",
    fontWeight: "500",
  },
  textoSeleccionado: {
    color: "#1e3a8a",
    fontWeight: "bold",
  },
  campo: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#0f172a",
    marginBottom: 20,
  },
  area: {
    height: 110,
  },
  boton: {
    backgroundColor: "#1e3a8a",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
