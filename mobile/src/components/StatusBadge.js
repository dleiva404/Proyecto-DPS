import React from "react";
import { View, Text, StyleSheet } from "react-native";

const STATUS_STYLES = {
  aprobado: { bg: "#D1FAE5", border: "#A7F3D0", text: "#059669" },
  activo: { bg: "#D1FAE5", border: "#A7F3D0", text: "#059669" },
  pendiente: { bg: "#FEF3C7", border: "#FDE68A", text: "#D97706" },
  rechazado: { bg: "#FEE2E2", border: "#FECACA", text: "#DC2626" },
  urgente: { bg: "#FEE2E2", border: "#FECACA", text: "#DC2626" },
  info: { bg: "#EFF6FF", border: "#BFDBFE", text: "#2563EB" },
};

export default function StatusBadge({ label = "INFO", status = "info" }) {
  const key = status.toLowerCase();
  const palette = STATUS_STYLES[key] || STATUS_STYLES.info;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      <Text style={[styles.text, { color: palette.text }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});