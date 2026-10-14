
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function ReportesScreen({ datos = [] }) {
  const departamentos = Array.isArray(datos)
    ? datos
        .filter(
          (item) =>
            item &&
            typeof item.departamento === "string" &&
            item.departamento.trim() !== ""
        )
        .map((item) => ({
          departamento: item.departamento.trim(),
          dias: Math.max(0, Number(item.dias) || 0),
        }))
    : [];

  const totalDias = departamentos.reduce(
    (suma, item) => suma + item.dias,
    0
  );

  const maximo = Math.max(
    1,
    ...departamentos.map((item) => item.dias)
  );

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>
        Reportes de vacaciones
      </Text>

      <Text style={styles.descripcion}>
        Resumen de días de vacaciones por departamento.
      </Text>

      <View style={styles.resumen}>
        <Text style={styles.resumenEtiqueta}>
          Total de días registrados
        </Text>

        <Text style={styles.resumenNumero}>
          {totalDias}
        </Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>
          Días de vacaciones por departamento
        </Text>

        {departamentos.length === 0 ? (
          <Text style={styles.sinDatos}>
            No hay datos de vacaciones disponibles.
          </Text>
        ) : (
          departamentos.map((item, index) => (
            <View
              key={`${item.departamento}-${index}`}
              style={styles.fila}
            >
              <View style={styles.encabezadoFila}>
                <Text style={styles.departamento}>
                  {item.departamento}
                </Text>

                <Text style={styles.cantidad}>
                  {item.dias} días
                </Text>
              </View>

              <View style={styles.barraFondo}>
                <View
                  style={[
                    styles.barra,
                    {
                      width: `${
                        (item.dias / maximo) * 100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))
        )}
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
  resumen: {
    backgroundColor: "#1e3a8a",
    padding: 22,
    borderRadius: 12,
    marginBottom: 20,
  },
  resumenEtiqueta: {
    color: "#dbeafe",
    fontSize: 14,
  },
  resumenNumero: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 6,
  },
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  subtitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 22,
  },
  fila: {
    marginBottom: 20,
  },
  encabezadoFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 12,
  },
  departamento: {
    color: "#334155",
    fontSize: 14,
    flexShrink: 1,
  },
  cantidad: {
    color: "#1e3a8a",
    fontWeight: "bold",
    fontSize: 14,
  },
  barraFondo: {
    height: 14,
    backgroundColor: "#e2e8f0",
    borderRadius: 7,
    overflow: "hidden",
  },
  barra: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 7,
  },
  sinDatos: {
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 24,
    fontSize: 14,
  },
});

