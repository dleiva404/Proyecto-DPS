import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CustomCard({
  title,
  description,
  icon,
  iconColor = "#2563EB",
  iconBg = "#EFF6FF",
  accentColor,
  children,
  style,
}) {
  return (
    <View
      style={[
        styles.card,
        accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor },
        style,
      ]}
    >
      {(title || icon) && (
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
              <Ionicons name={icon} size={22} color={iconColor} />
            </View>
          )}
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
      )}

      {description ? <Text style={styles.description}>{description}</Text> : null}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 14,
    lineHeight: 20,
  },
});