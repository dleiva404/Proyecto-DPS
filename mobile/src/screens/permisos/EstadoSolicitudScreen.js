import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import CabeceraFigma from "../../components/CabeceraFigma";
import CustomButton from "../../components/CustomButton";
import { ESTADOS, ETAPA_TEXTO, VISUAL_ESTADO } from "../../constants/estados";
import { formatearFecha, formatearFechaHora } from "../../services/formato";
import { obtener } from "../../services/solicitudesService";

// Pantalla "Estado de solicitudes" (Figma 2).
// Muestra solo el estado actual. También se abre desde Mis solicitudes.
export default function EstadoSolicitudScreen({ navigation, route }) {
  const { id } = route.params;
  const [solicitud, setSolicitud] = useState(null);

  // se vuelve a leer cada vez que la pantalla gana el foco (p. ej. tras cambiar una decisión)
  useFocusEffect(
    useCallback(() => {
      setSolicitud(obtener(id));
    }, [id]),
  );

  if (!solicitud) {
    return (
      <View style={styles.vacio}>
        <Text style={styles.textoVacio}>Solicitud no encontrada</Text>
      </View>
    );
  }

  const visual = VISUAL_ESTADO[solicitud.estado];
  const rechazada = solicitud.estado === ESTADOS.RECHAZADA;

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
    >
      <CabeceraFigma subtitulo="Estado de solicitudes" />

      <View style={[styles.tarjeta, { borderLeftColor: visual.color }]}>
        <View style={styles.filaTitulo}>
          <View style={[styles.punto, { backgroundColor: visual.color }]} />
          <Text style={styles.tituloEstado}>
            {solicitud.estado === ESTADOS.PENDIENTE
              ? "Solicitud en revisión"
              : solicitud.estado === ESTADOS.APROBADA
                ? "Solicitud aprobada"
                : "Solicitud rechazada"}
          </Text>
        </View>

        {solicitud.estado === ESTADOS.PENDIENTE && (
          <>
            <Text style={styles.texto}>Su solicitud está siendo revisada.</Text>
            <Text style={styles.textoSecundario}>
              Etapa actual: {ETAPA_TEXTO[solicitud.etapaActual] ?? "—"}
            </Text>
          </>
        )}

        {solicitud.estado === ESTADOS.APROBADA && (
          <Text style={styles.texto}>Su solicitud fue aprobada correctamente.</Text>
        )}

        {rechazada && (
          <Text style={styles.texto}>
            Motivo del rechazo: {solicitud.motivoRechazo}
          </Text>
        )}

        <View style={styles.acciones}>
          {rechazada && (
            <CustomButton
              title="Modificar"
              onPress={() =>
                navigation.navigate("SolicitarPermiso", { solicitud })
              }
              style={styles.botonAccion}
            />
          )}
          <CustomButton
            title="Cerrar"
            type="secondary"
            onPress={() => navigation.goBack()}
            style={styles.botonAccion}
          />
        </View>
      </View>

      <Text style={styles.seccion}>Datos de la solicitud</Text>
      <View style={styles.tarjetaDatos}>
        <Dato etiqueta="Tipo" valor={solicitud.tipo} />
        <Dato etiqueta="Empresa" valor={solicitud.empresa} />
        <Dato etiqueta="Departamento" valor={solicitud.departamento} />
        <Dato etiqueta="Fecha" valor={formatearFecha(solicitud.fecha)} />
        <Dato etiqueta="Motivo" valor={solicitud.motivo} />
      </View>

      <Text style={styles.seccion}>Historial</Text>
      {solicitud.historial.length === 0 ? (
        <Text style={styles.textoSecundario}>Todavía no hay decisiones.</Text>
      ) : (
        solicitud.historial.map((h, i) => (
          <View key={i} style={styles.tarjetaDatos}>
            <Text style={styles.historialTitulo}>
              {h.accion} por {h.responsable}
            </Text>
            <Text style={styles.textoSecundario}>
              {ETAPA_TEXTO[h.rol] ?? h.rol} · {formatearFechaHora(h.fecha)}
            </Text>
            {h.motivo ? <Text style={styles.texto}>Motivo: {h.motivo}</Text> : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text style={styles.datoValor}>{valor}</Text>
    </View>
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
  vacio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  textoVacio: {
    color: "#64748B",
  },
  tarjeta: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 20,
  },
  filaTitulo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  punto: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  tituloEstado: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
  },
  texto: {
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 20,
  },
  textoSecundario: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  acciones: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  botonAccion: {
    paddingHorizontal: 18,
  },
  seccion: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  tarjetaDatos: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  dato: {
    marginBottom: 8,
  },
  datoEtiqueta: {
    fontSize: 11,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  datoValor: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },
  historialTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
});
