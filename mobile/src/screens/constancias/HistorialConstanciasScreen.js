
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
  listarConstanciasPropias,
} from "../../services/constanciasService";

// =====================================================
// PARTE 5 - HISTORIAL DE CONSTANCIAS
//
// Muestra únicamente las solicitudes del empleado
// que inició sesión.
//
// Permite consultar:
// - Constancias pendientes.
// - Constancias aprobadas.
// - Constancias rechazadas.
// - Observaciones de rechazo.
// - Constancias aprobadas y su descarga en PDF.
//
// Compatible con el servicio actualizado del proyecto
// y con VerConstanciaScreen.
// =====================================================

export default function HistorialConstanciasScreen({ navigation }) {
  const { usuario } = useAuth();

  const [solicitudes, setSolicitudes] = useState([]);

  // =====================================================
  // ACTUALIZAR HISTORIAL
  //
  // Consulta nuevamente las constancias cuando
  // el usuario entra o regresa a esta pantalla.
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      if (usuario?.id) {
        // El servicio recibe el objeto completo
        // del usuario, no solamente su ID.
        const resultado = listarConstanciasPropias(usuario);

        setSolicitudes(
          Array.isArray(resultado) ? resultado : []
        );
      } else {
        setSolicitudes([]);
      }
    }, [usuario])
  );

  // =====================================================
  // ABRIR CONSTANCIA APROBADA
  //
  // CORRECCIÓN DE INTEGRACIÓN:
  // VerConstanciaScreen consulta la constancia mediante
  // obtenerConstancia(route?.params?.id).
  //
  // Por eso enviamos el ID y no el objeto completo.
  // =====================================================

  const abrirConstancia = (solicitud) => {
    if (solicitud.estado !== "Aprobada") {
      return;
    }

    navigation.navigate("VerConstancia", {
      id: solicitud.id,
    });
  };

  // =====================================================
  // MOSTRAR CADA SOLICITUD DEL HISTORIAL
  // =====================================================

  const renderSolicitud = ({ item }) => {
    const aprobada = item.estado === "Aprobada";
    const rechazada = item.estado === "Rechazada";

    // Reconoce tanto "salarial" como "Constancia salarial",
    // sin importar mayúsculas o minúsculas.
    const esSalarial = String(item.tipo ?? "")
      .toLowerCase()
      .includes("salarial");

    return (
      <View style={styles.tarjeta}>
        <View style={styles.fila}>
          <Text style={styles.codigo}>
            {item.id}
          </Text>

          <Text
            style={[
              styles.estado,
              aprobada
                ? styles.aprobada
                : rechazada
                  ? styles.rechazada
                  : styles.pendiente,
            ]}
          >
            {item.estado || "Pendiente"}
          </Text>
        </View>

        {/* Tipo de constancia */}
        <Text style={styles.tipo}>
          Constancia{" "}
          {esSalarial ? "salarial" : "laboral"}
        </Text>

        {/* Destinatario */}
        <Text style={styles.detalle}>
          Dirigida a: {item.destinatario}
        </Text>

        {/* Motivo de la solicitud */}
        <Text style={styles.detalle}>
          Motivo: {item.motivo}
        </Text>

        {/* Observación cuando la solicitud fue rechazada */}
        {rechazada && !!item.observacion && (
          <Text style={styles.observacion}>
            Motivo del rechazo: {item.observacion}
          </Text>
        )}

        {/* Acceso al documento cuando está aprobado */}
        {aprobada && (
          <TouchableOpacity
            style={styles.boton}
            onPress={() => abrirConstancia(item)}
            accessibilityRole="button"
          >
            <Text style={styles.textoBoton}>
              Ver constancia y descargar PDF
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // =====================================================
  // DISEÑO PRINCIPAL DEL HISTORIAL
  // =====================================================

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>
        Mis constancias
      </Text>

      <Text style={styles.descripcion}>
        Consultá el estado de tus solicitudes
        y abrí las constancias aprobadas.
      </Text>

      {/* Acceso directo para crear otra solicitud */}
      <TouchableOpacity
        style={styles.botonNueva}
        onPress={() =>
          navigation.navigate("SolicitarConstancia")
        }
        accessibilityRole="button"
      >
        <Text style={styles.textoBoton}>
          + Solicitar nueva constancia
        </Text>
      </TouchableOpacity>

      {/* Listado de solicitudes del empleado */}
      <FlatList
        data={solicitudes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSolicitud}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.mensaje}>
              Todavía no tenés solicitudes de constancias.
            </Text>
          </View>
        }
      />
    </View>
  );
}

// =====================================================
// ESTILOS DEL HISTORIAL
//
// Se conserva el diseño original.
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
    marginBottom: 18,
  },

  botonNueva: {
    backgroundColor: "#1e3a8a",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 18,
  },

  lista: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  tarjeta: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
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
    color: "#475569",
    fontWeight: "bold",
  },

  estado: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
  },

  pendiente: {
    color: "#92400e",
    backgroundColor: "#fef3c7",
  },

  aprobada: {
    color: "#166534",
    backgroundColor: "#dcfce7",
  },

  rechazada: {
    color: "#991b1b",
    backgroundColor: "#fee2e2",
  },

  tipo: {
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

  observacion: {
    color: "#991b1b",
    fontSize: 14,
    marginTop: 8,
  },

  boton: {
    backgroundColor: "#15803d",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  vacio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  mensaje: {
    color: "#64748b",
    textAlign: "center",
    fontSize: 14,
  },
});
