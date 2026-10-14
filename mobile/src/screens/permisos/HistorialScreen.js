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
import CabeceraFigma from "../../components/CabeceraFigma";
import CustomButton from "../../components/CustomButton";
import { VISUAL_ESTADO } from "../../constants/estados";
import { formatearFecha } from "../../services/formato";
import { listarPropias } from "../../services/solicitudesService";

// Filtros: el equipo lo pidió en el plan. La captura de Figma no lo incluye.
const FILTROS = [
  { clave: "todas", texto: "Todas" },
  { clave: "Pendiente", texto: "En revisión" },
  { clave: "Aprobada", texto: "Aprobadas" },
  { clave: "Rechazada", texto: "Rechazadas" },
];

// Pantalla "Mis solicitudes" (Figma 3). Solo muestra las del usuario que inició sesión.
export default function HistorialScreen({ navigation }) {
  const { usuario } = useAuth();
  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState("todas");

  useFocusEffect(
    useCallback(() => {
      setLista(listarPropias(usuario));
    }, [usuario]),
  );

  const visibles =
    filtro === "todas" ? lista : lista.filter((s) => s.estado === filtro);

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
    >
      <CabeceraFigma subtitulo="Mis solicitudes" />

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
              <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
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
              onPress={() => navigation.navigate("EstadoSolicitud", { id: s.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.titulo}>Solicitud de permiso</Text>
              <Text style={styles.fecha}>{formatearFecha(s.fecha)}</Text>
              <View style={styles.estadoFila}>
                <View style={[styles.punto, { backgroundColor: visual.color }]} />
                <Text style={styles.estado}>Estado: {visual.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      <CustomButton
        title="+ Nueva solicitud"
        type="secondary"
        onPress={() => navigation.navigate("SolicitarPermiso")}
        style={styles.botonNueva}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
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
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  chipActivo: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  chipTexto: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  chipTextoActivo: {
    color: "#FFFFFF",
  },
  tarjeta: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E293B",
  },
  fecha: {
    fontSize: 14,
    color: "#1E293B",
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
    color: "#1E293B",
  },
  vacio: {
    textAlign: "center",
    color: "#64748B",
    marginVertical: 30,
  },
  botonNueva: {
    marginTop: 8,
  },
});
