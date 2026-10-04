import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  error,
}) {
  const [mostrarClave, setMostrarClave] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label.toUpperCase()}</Text> : null}

      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry && !mostrarClave}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setMostrarClave(!mostrarClave)}
            style={styles.iconBtn}
          >
            <Ionicons
              name={mostrarClave ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#64748B"
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1E293B",
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  iconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
  },
});