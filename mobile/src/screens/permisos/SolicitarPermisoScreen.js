import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import CabeceraFigma from "../../components/CabeceraFigma";
import CampoTexto from "../../components/CampoTexto";
import CampoFecha from "../../components/CampoFecha";
import CustomButton from "../../components/CustomButton";
import { EMPRESAS } from "../../constants/empresas";
import {
  actualizarPermiso,
  crearPermiso,
} from "../../services/solicitudesService";

// Pantalla "Solicitud de permiso" (Figma 1).
// Si llega una solicitud en params, es "Modificar" de una rechazada.
export default function SolicitarPermisoScreen({ navigation, route }) {
  const { usuario } = useAuth();
  const existente = route?.params?.solicitud ?? null;

  const [empresa, setEmpresa] = useState(
    existente?.empresa ?? usuario.empresa ?? null,
  );
  const [departamento, setDepartamento] = useState(
    existente?.departamento ?? usuario.departamento,
  );
  const [motivo, setMotivo] = useState(existente?.motivo ?? "");
  const [fecha, setFecha] = useState(existente?.fecha ?? "");
  const [errores, setErrores] = useState({});

  const nombreEmpleado = `${usuario.nombre} ${usuario.apellido}`;

  const enviar = async () => {
    const datos = { empresa, departamento, motivo, fecha };
    const resultado = existente
      ? await actualizarPermiso(usuario, existente.id, datos)
      : await crearPermiso(usuario, datos);

    if (!resultado.ok) {
      setErrores(resultado.errores);
      return;
    }
    // replace: al volver atrás no regresa al formulario
    navigation.replace("EstadoSolicitud", { id: resultado.solicitud.id });
  };

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <CabeceraFigma subtitulo="Solicitud de permiso" />

      <Text style={styles.etiquetaSeccion}>EMPRESA</Text>
      <View style={styles.grillaEmpresas}>
        {EMPRESAS.map((nombre) => {
          const activa = empresa === nombre;
          return (
            <TouchableOpacity
              key={nombre}
              style={styles.opcionEmpresa}
              onPress={() => setEmpresa(nombre)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={activa ? "checkbox" : "square-outline"}
                size={22}
                color={activa ? "#2563EB" : "#64748B"}
              />
              <Text style={styles.nombreEmpresa}>{nombre}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {errores.empresa ? (
        <Text style={styles.error}>{errores.empresa}</Text>
      ) : null}

      <CampoTexto
        label="Nombre del Depto."
        value={departamento}
        onChangeText={setDepartamento}
      />
      <CampoTexto
        label="Nombre del Empleado"
        value={nombreEmpleado}
        editable={false}
      />
      <CampoTexto
        label="Motivo del permiso"
        placeholder="Escriba el motivo"
        value={motivo}
        onChangeText={setMotivo}
        multilinea
        error={errores.motivo}
      />
      <CampoFecha
        label="Fecha del permiso"
        value={fecha}
        onChange={setFecha}
        error={errores.fecha}
        minimumDate={new Date()}
      />

      {errores.general ? (
        <Text style={styles.error}>{errores.general}</Text>
      ) : null}

      <CustomButton
        title="Enviar solicitud"
        onPress={enviar}
        style={styles.boton}
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
  etiquetaSeccion: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  grillaEmpresas: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  opcionEmpresa: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingRight: 8,
  },
  nombreEmpresa: {
    fontSize: 13,
    color: "#1E293B",
    marginLeft: 8,
    flexShrink: 1,
  },
  error: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 8,
  },
  boton: {
    alignSelf: "flex-end",
    paddingHorizontal: 24,
    marginTop: 8,
  },
});
