
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import theme from "../../theme/theme";
import CustomButton from "../../components/CustomButton";
import { VISUAL_ESTADO } from "../../constants/estados";
import { formatearFecha } from "../../services/formato";
import { listarPropias } from "../../services/solicitudesService";
import { listarVacacionesEmpleado } from "../../services/solicitudesVacacionesService";
import { listarConstanciasPropias } from "../../services/constanciasService";

const FILTROS = [
  { clave: "todas", texto: "Todas" },
  { clave: "Pendiente", texto: "En revisión" },
  { clave: "Aprobada", texto: "Aprobadas" },
  { clave: "Rechazada", texto: "Rechazadas" },
];

function armarLista(usuario) {
  const permisos = listarPropias(usuario).map((s) => ({
    id: s.id,
    tipo: "permiso",
    titulo: "Permiso",
    detalle: formatearFecha(s.fecha),
    estado: s.estado,
    creadaEn: s.creadaEn,
  }));

  const vacaciones = listarVacacionesEmpleado(usuario.id).map((s) => ({
    id: s.id,
    tipo: "vacaciones",
    titulo: "Vacaciones",
    detalle: `${formatearFecha(s.fechaInicio)} al ${formatearFecha(s.fechaFin)} · ${s.diasSolicitados} días`,
    estado: s.estado,
    creadaEn: s.creadaEn,
  }));

  const constancias = listarConstanciasPropias(usuario).map((s) => ({
    id: s.id,
    tipo: "constancia",
    titulo: String(s.tipo ?? "").toLowerCase().includes("salarial")
      ? "Constancia salarial"
      : "Constancia laboral",
    detalle: `Dirigida a: ${s.destinatario}`,
    estado: s.estado,
    creadaEn: s.creadaEn,
  }));

  return [...permisos, ...vacaciones, ...constancias].sort((a, b) =>
    b.creadaEn.localeCompare(a.creadaEn),
  );
}

export default function HistorialScreen({ navigation }) {
  const { usuario } = useAuth();
  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState("todas");

  useFocusEffect(
    useCallback(() => {
      setLista(usuario ? armarLista(usuario) : []);
    }, [usuario]),
  );

  const visibles =
    filtro === "todas" ? lista : lista.filter((s) => s.estado === filtro);

  const abrir = (s) => {
    if (s.tipo === "permiso") {
      navigation.navigate("EstadoSolicitud", { id: s.id });
    } else if (s.tipo === "constancia") {
      navigation.navigate("VerConstancia", { id: s.id });
    } else {
      navigation.navigate("DetalleVacaciones", { id: s.id });
    }
  };

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
    >
      <View style={styles.acciones}>
        <CustomButton
          title="Solicitar permiso"
          onPress={() => navigation.navigate("SolicitarPermiso")}
          style={styles.boton}
        />
        <CustomButton
          title="Solicitar vacaciones"
          type="secondary"
          onPress={() => navigation.navigate("SolicitarVacaciones")}
          style={styles.boton}
        />
      </View>

      <CustomButton
        title="Mis constancias"
        type="secondary"
        onPress={() => navigation.navigate("HistorialConstancias")}
        style={styles.botonConstancia}
      />

      <View style={styles.filtros}>
        {FILTROS.map((f) => {
          const activo = filtro === f.clave;
          return (
            <TouchableOpacity
              key={f.clave}
              onPress={() => setFiltro(f.clave)}
              style={[styles.chip, activo && styles.chipActivo]}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.chipTexto, activo && styles.chipTextoActivo]}
              >
                {f.texto}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {visibles.length === 0 ? (
        <Text style={styles.vacio}>
          {lista.length === 0
            ? "Todavía no tienes solicitudes."
            : "No tienes solicitudes en este estado."}
        </Text>
      ) : (
        visibles.map((s) => {
          const visual = VISUAL_ESTADO[s.estado];
          return (
            <TouchableOpacity
              key={s.id}
              style={styles.tarjeta}
              onPress={() => abrir(s)}
              activeOpacity={0.8}
            >
              <View style={styles.filaTitulo}>
                <Text style={styles.titulo}>{s.titulo}</Text>
                <Text style={styles.id}>{s.id}</Text>
              </View>
              <Text style={styles.detalle}>{s.detalle}</Text>
              <View style={styles.estadoFila}>
                <View
                  style={[styles.punto, { backgroundColor: visual.color }]}
                />
                <Text style={styles.estado}>{visual.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contenido: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  acciones: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  boton: {
    flex: 1,
  },
  botonConstancia: {
    marginBottom: 16,
  },
  filtros: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  chipActivo: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipTexto: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  chipTextoActivo: {
    color: "#FFFFFF",
  },
  tarjeta: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: 12,
  },
  filaTitulo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titulo: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  id: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  detalle: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
  },
  estadoFila: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  estado: {
    fontSize: 13,
    color: theme.colors.text,
  },
  vacio: {
    textAlign: "center",
    color: theme.colors.textSecondary,
    marginVertical: 30,
  },
});
