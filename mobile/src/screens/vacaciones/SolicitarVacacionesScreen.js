import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import theme from "../../theme/theme";
import CampoFecha from "../../components/CampoFecha";
import {
  contarDiasHabiles,
  validarSolicitudVacaciones,
} from "../../services/vacacionesService";
import {
  crearSolicitudVacaciones,
  obtenerSaldoDisponible,
  obtenerResumenSaldo,
} from "../../services/solicitudesVacacionesService";

export default function SolicitarVacacionesScreen({ navigation }) {
  const { usuario } = useAuth();

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [motivo, setMotivo] = useState("");

  const dias = contarDiasHabiles(fechaInicio, fechaFin);
  const saldo = obtenerSaldoDisponible(usuario);
  const resumen = obtenerResumenSaldo(usuario);
  const errores = validarSolicitudVacaciones({
    fechaInicio,
    fechaFin,
    motivo,
    fechaIngreso: usuario?.fechaIngreso,
    saldoDisponible: saldo,
  });

  const enviarSolicitud = () => {
    if (Object.keys(errores).length > 0) {
      Alert.alert("Revisa tu solicitud", Object.values(errores).join("\n"));
      return;
    }

    const resultado = crearSolicitudVacaciones(usuario, {
      fechaInicio,
      fechaFin,
      motivo,
    });

    if (!resultado.ok) {
      Alert.alert(
        "No se pudo crear la solicitud",
        Object.values(resultado.errores).join("\n"),
      );
      return;
    }

    Alert.alert(
      "Solicitud registrada",
      `Código: ${resultado.solicitud.id}\n` +
        `Empleado: ${resultado.solicitud.empleadoNombre}\n` +
        `Días solicitados: ${resultado.solicitud.diasSolicitados}\n` +
        `Saldo restante: ${obtenerSaldoDisponible(usuario)} días\n` +
        "Estado: Pendiente de aprobación.",
      [
        {
          text: "Aceptar",
          onPress: () => {
            setFechaInicio("");
            setFechaFin("");
            setMotivo("");
            navigation.navigate("Historial");
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Solicitar vacaciones</Text>
      <Text style={styles.subtitle}>Completa los datos de tu solicitud.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Empleado</Text>
        <Text style={styles.value}>
          {usuario?.nombre} {usuario?.apellido}
        </Text>

        <Text style={styles.label}>Empresa</Text>
        <Text style={styles.value}>{usuario?.empresa}</Text>

        <Text style={styles.label}>Departamento</Text>
        <Text style={styles.value}>{usuario?.departamento}</Text>

        <View style={styles.balance}>
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceNumber}>{resumen.disponible} días</Text>
          <Text style={styles.helper}>
            Tomados: {resumen.aprobados} · En trámite: {resumen.enTramite} ·
            Total del período: {resumen.total}
          </Text>
          <Text style={styles.helper}>
            Los días en trámite quedan apartados mientras se revisan; si la
            solicitud se rechaza, se liberan.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <CampoFecha
          label="Fecha inicial"
          value={fechaInicio}
          onChange={setFechaInicio}
          minimumDate={new Date()}
        />

        <CampoFecha
          label="Fecha final"
          value={fechaFin}
          onChange={setFechaFin}
          minimumDate={
            fechaInicio ? new Date(`${fechaInicio}T12:00:00`) : new Date()
          }
        />

        <Text style={styles.label}>Motivo</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={motivo}
          onChangeText={setMotivo}
          placeholder="Describe el motivo de tu solicitud"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.daysBox}>
          <Text style={styles.daysLabel}>Días hábiles solicitados</Text>
          <Text style={styles.daysNumber}>{dias}</Text>
          <Text style={styles.helper}>Los domingos no se descuentan.</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={enviarSolicitud}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Enviar solicitud</Text>
        </TouchableOpacity>

        {navigation?.canGoBack?.() && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 32,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 20,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 7,
    marginTop: 10,
  },
  value: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  textArea: {
    minHeight: 100,
  },
  balance: {
    backgroundColor: "#EFF6FF",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: 18,
  },
  balanceLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  balanceNumber: {
    color: theme.colors.primary,
    fontSize: 26,
    fontWeight: "700",
    marginVertical: 4,
  },
  helper: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },
  daysBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: 18,
  },
  daysLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  daysNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  backButton: {
    padding: 13,
    alignItems: "center",
    marginTop: 6,
  },
  backText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
});
