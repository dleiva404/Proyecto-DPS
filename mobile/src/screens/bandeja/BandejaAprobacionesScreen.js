import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { theme } from "../../theme/theme";
import { formatearFecha } from "../../services/formato";
import {
  listarVacacionesPendientesPorRol,
  decidirSolicitudVacaciones,
} from "../../services/solicitudesVacacionesService";
import {
  pendientesDeEquipo,
  decidir as decidirPermiso,
} from "../../services/solicitudesService";

const ETIQUETAS = {
  ANALISTA: "Analista de Nómina",
  GERENTE: "Gerente",
  JEFE: "Jefe inmediato",
};

export default function BandejaAprobacionesScreen({ navigation }) {
  const { usuario } = useAuth();
  const [vacaciones, setVacaciones] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [rechazoId, setRechazoId] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const rol = usuario?.rol;

  const cargar = useCallback(() => {
    if (["ANALISTA", "GERENTE", "JEFE"].includes(rol)) {
      setVacaciones(listarVacacionesPendientesPorRol(rol));
    } else {
      setVacaciones([]);
    }
    setPermisos(usuario ? pendientesDeEquipo(usuario) : []);
  }, [rol, usuario]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  // ---- vacaciones ----
  const decidirVacacion = (solicitud, decision) => {
    if (decision === "Rechazar" && !motivoRechazo.trim()) {
      Alert.alert(
        "Motivo requerido",
        "Escribe el motivo del rechazo antes de continuar.",
      );
      return;
    }

    Alert.alert(
      `${decision} solicitud`,
      `¿Deseas ${decision.toLowerCase()} ${solicitud.id}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: decision,
          style: decision === "Rechazar" ? "destructive" : "default",
          onPress: () => {
            const resultado = decidirSolicitudVacaciones(
              solicitud.id,
              rol,
              decision,
              decision === "Rechazar" ? motivoRechazo : "",
            );

            if (!resultado.ok) {
              Alert.alert("No se pudo procesar", resultado.mensaje);
              return;
            }

            setRechazoId(null);
            setMotivoRechazo("");
            cargar();

            Alert.alert(
              "Solicitud actualizada",
              decision === "Rechazar"
                ? "La solicitud fue rechazada."
                : resultado.solicitud.estado === "Aprobada"
                  ? "La solicitud fue aprobada en todas las etapas."
                  : `La solicitud pasó a la etapa: ${ETIQUETAS[resultado.solicitud.etapaActual]}.`,
            );
          },
        },
      ],
    );
  };

  // ---- permisos ----
  const aprobarPermiso = (id) => {
    const resultado = decidirPermiso(usuario, id, "Aprobado");
    if (!resultado.ok) {
      Alert.alert("No se pudo procesar", resultado.error);
      return;
    }
    cargar();
    Alert.alert(
      "Permiso aprobado",
      "Pasa a revisión de la Analista de Nómina.",
    );
  };

  const sinPendientes = vacaciones.length === 0 && permisos.length === 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
    >
      <Text style={styles.subtitulo}>
        {ETIQUETAS[rol] || "Usuario"} · Solicitudes pendientes
      </Text>

      {sinPendientes && (
        <View style={styles.vacio}>
          <Text style={styles.vacioTitulo}>No hay solicitudes pendientes</Text>
          <Text style={styles.vacioTexto}>
            Cuando haya solicitudes para tu etapa, aparecerán aquí.
          </Text>
        </View>
      )}

      {vacaciones.length > 0 && (
        <Text style={styles.seccion}>Vacaciones ({vacaciones.length})</Text>
      )}

      {vacaciones.map((solicitud) => (
        <View key={solicitud.id} style={styles.tarjeta}>
          <View style={styles.fila}>
            <Text style={styles.id}>{solicitud.id}</Text>
            <Text style={styles.estado}>Pendiente</Text>
          </View>

          <Text style={styles.empleado}>{solicitud.empleadoNombre}</Text>
          <Text style={styles.detalle}>
            Departamento: {solicitud.departamento || "No indicado"}
          </Text>
          <Text style={styles.detalle}>
            Del {formatearFecha(solicitud.fechaInicio)} al{" "}
            {formatearFecha(solicitud.fechaFin)}
          </Text>
          <Text style={styles.detalle}>
            Días hábiles: {solicitud.diasSolicitados}
          </Text>
          <Text style={styles.motivoTitulo}>Motivo de la solicitud</Text>
          <Text style={styles.detalle}>{solicitud.motivo}</Text>

          {rechazoId === solicitud.id && (
            <View style={styles.formRechazo}>
              <Text style={styles.motivoTitulo}>Motivo del rechazo</Text>
              <TextInput
                style={styles.input}
                value={motivoRechazo}
                onChangeText={setMotivoRechazo}
                placeholder="Explica por qué se rechaza"
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => {
                  setRechazoId(null);
                  setMotivoRechazo("");
                }}
              >
                <Text style={styles.textoCancelar}>Cancelar rechazo</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.botones}>
            <TouchableOpacity
              style={styles.botonAprobar}
              onPress={() => decidirVacacion(solicitud, "Aprobar")}
            >
              <Text style={styles.textoBoton}>Aprobar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonRechazar}
              onPress={() => {
                if (rechazoId === solicitud.id) {
                  decidirVacacion(solicitud, "Rechazar");
                } else {
                  setRechazoId(solicitud.id);
                  setMotivoRechazo("");
                }
              }}
            >
              <Text style={styles.textoBoton}>
                {rechazoId === solicitud.id ? "Confirmar rechazo" : "Rechazar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {permisos.length > 0 && (
        <Text style={styles.seccion}>Permisos ({permisos.length})</Text>
      )}

      {permisos.map((s) => (
        <View key={s.id} style={styles.tarjeta}>
          <View style={styles.fila}>
            <Text style={styles.id}>{s.id}</Text>
            <Text style={styles.estado}>Pendiente</Text>
          </View>

          <Text style={styles.empleado}>{s.empleadoNombre}</Text>
          <Text style={styles.detalle}>Empresa: {s.empresa}</Text>
          <Text style={styles.detalle}>Fecha: {formatearFecha(s.fecha)}</Text>
          <Text style={styles.motivoTitulo}>Motivo</Text>
          <Text style={styles.detalle}>{s.motivo}</Text>

          <View style={styles.botones}>
            <TouchableOpacity
              style={styles.botonAprobar}
              onPress={() => aprobarPermiso(s.id)}
            >
              <Text style={styles.textoBoton}>Aprobar</Text>
            </TouchableOpacity>

            {/* el rechazo se hace en el detalle porque pide motivo */}
            <TouchableOpacity
              style={styles.botonRechazar}
              onPress={() =>
                navigation.navigate("DetalleAprobacion", { id: s.id })
              }
            >
              <Text style={styles.textoBoton}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contenido: {
    padding: theme.spacing.md,
    paddingBottom: 32,
  },
  subtitulo: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  seccion: {
    fontSize: 17,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 10,
    marginTop: 4,
  },
  tarjeta: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  id: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  estado: {
    color: theme.colors.warning,
    fontWeight: "bold",
  },
  empleado: {
    fontSize: 17,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 10,
  },
  detalle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 7,
  },
  motivoTitulo: {
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 6,
  },
  botones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  botonAprobar: {
    flex: 1,
    backgroundColor: theme.colors.success,
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
  },
  botonRechazar: {
    flex: 1,
    backgroundColor: theme.colors.error,
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  vacio: {
    padding: 24,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  vacioTitulo: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  vacioTexto: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
  formRechazo: {
    marginTop: 12,
  },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    color: theme.colors.text,
    backgroundColor: "#FFFFFF",
  },
  botonCancelar: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginTop: 4,
  },
  textoCancelar: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
});
