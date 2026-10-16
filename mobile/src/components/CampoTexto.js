import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

// Campo de formulario del Figma: etiqueta arriba y caja gris redondeada
export default function CampoTexto({ label, error, multilinea = false, ...props }) {
  return (
    <View style={styles.grupo}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          multilinea && styles.multilinea,
          error && styles.inputError,
        ]}
        placeholderTextColor="#94A3B8"
        multiline={multilinea}
        textAlignVertical={multilinea ? "top" : "center"}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#1E293B",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
  },
  multilinea: {
    minHeight: 90,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  error: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
  },
});
