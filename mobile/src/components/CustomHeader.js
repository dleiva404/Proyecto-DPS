import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";

export default function CustomHeader({
  title = "Gestión de RRHH",
  subtitle = "GRUPO CALMA",
  userName,
  userRole,
  onLogout,
  onNotificationsPress,
  unreadCount = 0,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.brandRow}>
          <Image
            source={require("../../assets/LogoGC.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.companySub}>{subtitle}</Text>
            <Text style={styles.welcomeText}>{title}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {onNotificationsPress && (
            <TouchableOpacity
              onPress={onNotificationsPress}
              style={styles.iconBtn}
            >
              <Ionicons name="notifications-outline" size={22} color="#1E293B" />
              {unreadCount > 0 && (
                <View style={styles.dot}>
                  <Text style={styles.dotText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {onLogout && (
            <TouchableOpacity onPress={onLogout} style={styles.iconBtn}>
              <Ionicons name="log-out-outline" size={22} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {(userName || userRole) && (
        <View style={styles.userInfoRow}>
          <View>
            <Text style={styles.greetingText}>Bienvenido(a),</Text>
            <Text style={styles.userNameText}>{userName || "Colaborador"}</Text>
          </View>
          {userRole && <StatusBadge label={userRole} status="info" />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  companySub: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.8,
  },
  welcomeText: {
    color: "#1E293B",
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    position: "relative",
  },
  dot: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  dotText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  userInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  greetingText: {
    fontSize: 13,
    color: "#64748B",
  },
  userNameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 2,
  },
});