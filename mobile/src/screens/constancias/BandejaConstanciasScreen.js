
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";

import {
  listarConstanciasPendientes,
} from "../../services/constanciasService";

// =====================================================
// PARTE 5 - BANDEJA DE CONSTANCIAS DE RRHH
//
// Esta pantalla es independiente de las bandejas
// de permisos y vacaciones.
//
// Consulta las solicitudes pendientes cada vez
// que el usuario entra o regresa a esta pantalla.
//
// Compatible con el servicio actualizado de constancias.
// =====================================================

export default function BandejaConstanciasScreen({ navigation }) {
  const { usuario } = useAuth();

  const [solicitudes, setSolicitudes] = useState([]);

  // Actualizar la bandeja al entrar o regresar
  // después de aprobar/rechazar una constancia.
  useFocusEffect(
    useCallback(() => {
      if (usuario?.rol === "RRHH") {
        // El servicio actualizado necesita recibir
        // el usuario para comprobar las autorizaciones.
        setSolicitudes(listarConstanciasPendientes(usuario));
      } else {
        setSolicitudes([]);
      }
    }, [usuario])
  );

  // Evitar mostrar solicitudes de constancias
  // a usuarios que no pertenecen a RRHH.
  if (usuario?.rol !== "RRHH") {
    return (
      <View style={styles.centrado}>
        <Text style={styles.mensaje}>
          Esta sección es exclusiva de Recursos Humanos.
        </Text>
      </View>
    );
  }

  // Mostrar una solicitud pendiente.
  const renderSolicitud = ({ item }) => (
    <TouchableOpacity
      style={styles.tarjeta}
      onPress={() =>
        navigation.navigate("AutorizarConstancia", {
          solicitud: item,
        })
      }
      accessibilityRole="button"
    >
      <View style={styles.fila}>
        <Text style={styles.codigo}>{item.id}</Text>
        <Text style={styles.estado}>Pendiente</Text>
      </View>

      <Text style={styles.empleado}>{item.empleado}</Text>

      <Text style={styles.detalle}>
        Tipo: {item.tipo === "salarial" ? "Salarial" : "Laboral"}
      </Text>

      <Text style={styles.detalle}>
        Dirigida a: {item.destinatario}
      </Text>

      <Text style={styles.detalle} numberOfLines={2}>
        Motivo: {item.motivo}
      </Text>

      <Text style={styles.enlace}>
        Revisar solicitud →
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>
        Constancias pendientes
      </Text>

      <Text style={styles.descripcion}>
        Solicitudes de constancias que debe revisar
        Recursos Humanos.
      </Text>

      <FlatList
        data={solicitudes}
        keyExtractor={(item) => item.id}
        renderItem={renderSolicitud}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.mensaje}>
              No hay constancias pendientes.
            </Text>
          </View>
        }
      />
    </View>
  );
}

// =====================================================
// ESTILOS DE LA BANDEJA
// =====================================================

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
  lista: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 12,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  codigo: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#475569",
  },
  estado: {
    color: "#92400e",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "bold",
  },
  empleado: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
  },
  detalle: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 6,
  },
  enlace: {
    color: "#1e3a8a",
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "right",
  },
  vacio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  mensaje: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
  },
});
