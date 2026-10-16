
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function VerConstanciaScreen({ route }) {
  const constancia = route?.params?.constancia;

  if (!constancia) {
    return (
      <View style={styles.contenedorVacio}>
        <Text style={styles.titulo}>Ver constancia</Text>
        <Text style={styles.aviso}>
          No hay una constancia seleccionada.
        </Text>
      </View>
    );
  }

  if (constancia.estado !== "Aprobada") {
    return (
      <View style={styles.contenedorVacio}>
        <Text style={styles.titulo}>Ver constancia</Text>
        <Text style={styles.aviso}>
          La constancia estará disponible cuando
          Recursos Humanos apruebe la solicitud.
        </Text>
      </View>
    );
  }

  const tieneDatosQR =
    Boolean(constancia.codigo) &&
    Boolean(constancia.autorizadoPor);

  const datosQR = tieneDatosQR
    ? JSON.stringify({
        codigo: constancia.codigo,
        autorizadoPor: constancia.autorizadoPor,
        fechaEmision: constancia.fechaEmision || null,
        empresa: "DIDELCO",
      })
    : null;

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Ver constancia</Text>

      <View style={styles.tarjeta}>
        <Text style={styles.empresa}>DIDELCO</Text>

        <Text style={styles.subtitulo}>
          {constancia.tipo || "Constancia"}
        </Text>

        <View style={styles.separador} />

        <Text style={styles.etiqueta}>Empleado</Text>
        <Text style={styles.valor}>
          {constancia.empleado || "No disponible"}
        </Text>

        <Text style={styles.etiqueta}>Estado</Text>
        <Text style={styles.estado}>
          {constancia.estado}
        </Text>

        <Text style={styles.etiqueta}>
          Antigüedad laboral
        </Text>
        <Text style={styles.valor}>
          {constancia.antiguedad || "No disponible"}
        </Text>

        <Text style={styles.etiqueta}>Autorizado por</Text>
        <Text style={styles.valor}>
          {constancia.autorizadoPor || "No disponible"}
        </Text>

        <Text style={styles.etiqueta}>
          Fecha de emisión
        </Text>
        <Text style={styles.valor}>
          {constancia.fechaEmision || "No disponible"}
        </Text>

        <View style={styles.separador} />

        <Text style={styles.qrTitulo}>
          Datos de autorización
        </Text>

        {datosQR ? (
          <View style={styles.qrContenedor}>
            <QRCode value={datosQR} size={140} />
          </View>
        ) : (
          <Text style={styles.qrTexto}>
            Información de autorización no disponible.
          </Text>
        )}

        <Text style={styles.codigo}>
          {constancia.codigo || "Código no disponible"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  contenedorVacio: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
    justifyContent: "center",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 20,
  },
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  empresa: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e3a8a",
  },
  subtitulo: {
    fontSize: 18,
    textAlign: "center",
    color: "#334155",
    marginTop: 8,
  },
  separador: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 22,
  },
  etiqueta: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  valor: {
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 16,
  },
  estado: {
    fontSize: 16,
    color: "#15803d",
    fontWeight: "bold",
    marginBottom: 16,
  },
  qrTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  qrContenedor: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#fff",
  },
  qrTexto: {
    textAlign: "center",
    color: "#64748b",
  },
  codigo: {
    textAlign: "center",
    marginTop: 12,
    color: "#475569",
  },
  aviso: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
  },
});


