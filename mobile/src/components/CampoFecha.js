import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import theme from "../theme/theme";

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

// Date -> "AAAA-MM-DD" con la hora local para que no se corra un dia
function aTexto(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

// "AAAA-MM-DD" -> Date a mediodia
function aFecha(texto) {
  return texto ? new Date(`${texto}T12:00:00`) : new Date();
}

// campo que abre un calendario y devuelve la fecha como "AAAA-MM-DD"
export default function CampoFecha({
  label,
  value,
  onChange,
  error,
  minimumDate,
}) {
  const [abierto, setAbierto] = useState(false);

  const alCambiar = (evento, fecha) => {
    // en android el calendario se cierra solo al elegir o cancelar
    if (Platform.OS === "android") setAbierto(false);
    if (evento.type === "set" && fecha) onChange(aTexto(fecha));
  };

  const textoFecha = value
    ? `${DIAS[aFecha(value).getDay()]} ${value.split("-").reverse().join("/")}`
    : "Seleccionar fecha";

  return (
    <View style={styles.grupo}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        style={[styles.caja, error && styles.cajaError]}
        onPress={() => setAbierto(!abierto)}
        activeOpacity={0.8}
      >
        <Text style={[styles.texto, !value && styles.placeholder]}>
          {textoFecha}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={theme.colors.primary}
        />
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {abierto && (
        <View>
          <DateTimePicker
            value={aFecha(value)}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            minimumDate={minimumDate}
            onChange={alCambiar}
            locale="es-SV"
          />
          {/* en iphone el calendario queda abierto, se cierra con Listo */}
          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={styles.listo}
              onPress={() => setAbierto(false)}
            >
              <Text style={styles.textoListo}>Listo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 7,
  },
  caja: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
  },
  cajaError: { borderColor: theme.colors.error },
  texto: { fontSize: 15, color: theme.colors.text },
  placeholder: { color: theme.colors.textMuted },
  error: { color: theme.colors.error, fontSize: 12, marginTop: 4 },
  listo: { alignSelf: "flex-end", paddingVertical: 8, paddingHorizontal: 12 },
  textoListo: { color: theme.colors.primary, fontWeight: "700", fontSize: 15 },
});
