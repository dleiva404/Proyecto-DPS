
/*
 * HISTORIAL DE SOLICITUDES - PROYECTO DPS
 *
 * PARTE 3: muestra las solicitudes de vacaciones.
 * PARTE 4: muestra los permisos personales.
 *
 * Se conservan los filtros por estado y la navegación
 * hacia el detalle de los permisos.
 */

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

// PARTE 3 - Consulta las vacaciones del empleado.
import { listarVacacionesEmpleado } from "../../services/solicitudesVacacionesService";

// PARTE 4 - Consulta los permisos del empleado.
import { listarPropias } from "../../services/solicitudesService";

/*
 * Filtros compartidos por ambos tipos de solicitudes.
 * Cada filtro muestra únicamente las solicitudes
 * que coinciden con el estado seleccionado.
 */
const FILTROS = [
  { clave: "todas", texto: "Todas" },
  { clave: "Pendiente", texto: "En revisión" },
  { clave: "Aprobada", texto: "Aprobadas" },
  { clave: "Rechazada", texto: "Rechazadas" },
];

const COLORES_ESTADO = {
  Pendiente: "#D97706",
  Aprobada: "#16A34A",
  Rechazada: "#DC2626",
};

export default function HistorialScreen({ navigation }) {
  const { usuario } = useAuth();

  // PARTE 3 - Vacaciones del empleado.
  const [vacaciones, setVacaciones] = useState([]);

  // PARTE 4 - Permisos del empleado.
  const [permisos, setPermisos] = useState([]);

  // INTEGRACIÓN - Filtro aplicado a ambos módulos.
  const [filtro, setFiltro] = useState("todas");

  /*
   * Actualiza las solicitudes cada vez que el empleado
   * regresa a la pantalla "Mis solicitudes".
   */
  useFocusEffect(
    useCallback(() => {
      if (!usuario?.id) {
        setVacaciones([]);
        setPermisos([]);
        return;
      }

      setVacaciones(listarVacacionesEmpleado(usuario.id));
      setPermisos(listarPropias(usuario));
    }, [usuario]),
  );

  /*
   * Aplica el mismo filtro a vacaciones y permisos,
   * sin mezclar sus servicios ni sus identificadores.
   */
  const vacacionesVisibles =
    filtro === "todas"
      ? vacaciones
      : vacaciones.filter((s) => s.estado === filtro);

  const permisosVisibles =
    filtro === "todas"
      ? permisos
      : permisos.filter((s) => s.estado === filtro);

  /*
   * Devuelve el color correspondiente al estado.
   * Si existe una configuración visual del módulo
   * de permisos, se aprovecha para ambos módulos.
   */
  const obtenerColorEstado = (estado) =>
    VISUAL_ESTADO[estado]?.color ||
    COLORES_ESTADO[estado] ||
    "#64748B";

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
    >
      {/* Encabezado compartido. */}
      <CabeceraFigma subtitulo="Mis solicitudes" />

      <Text style={styles.tituloPrincipal}>
        Mis solicitudes
      </Text>

      <Text style={styles.subtitulo}>
        Consulta tus permisos y vacaciones, junto con su estado.
      </Text>

      {/* INTEGRACIÓN - Filtros para los dos módulos. */}
      <View style={styles.filtros}>
        {FILTROS.map((item) => {
          const activo = filtro === item.clave;

          return (
            <TouchableOpacity
              key={item.clave}
              onPress={() => setFiltro(item.clave)}
              style={[
                styles.chip,
                activo && styles.chipActivo,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipTexto,
                  activo && styles.chipTextoActivo,
                ]}
              >
                {item.texto}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ========================================== */}
      {/* PARTE 3 - HISTORIAL DE VACACIONES          */}
      {/* ========================================== */}

      <Text style={styles.tituloSeccion}>
        Vacaciones
      </Text>

      <TouchableOpacity
        style={styles.accesoVacaciones}
        onPress={() => navigation.navigate("SolicitarVacaciones")}
        activeOpacity={0.8}
      >
        <Text style={styles.accesoTitulo}>
          + Solicitar vacaciones
        </Text>

        <Text style={styles.accesoDescripcion}>
          Selecciona las fechas y consulta los días hábiles.
        </Text>
      </TouchableOpacity>

      {vacacionesVisibles.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>
            {vacaciones.length === 0
              ? "Todavía no tienes solicitudes de vacaciones."
              : "No tienes vacaciones en este estado."}
          </Text>
        </View>
      ) : (
        vacacionesVisibles.map((solicitud) => (
          <View
            key={solicitud.id}
            style={styles.tarjeta}
          >
            <View style={styles.filaEstado}>
              <Text style={styles.identificador}>
                {solicitud.id}
              </Text>

              <Text
                style={[
                  styles.estado,
                  {
                    color: obtenerColorEstado(
                      solicitud.estado,
                    ),
                  },
                ]}
              >
                {solicitud.estado}
              </Text>
            </View>

            <Text style={styles.tituloTarjeta}>
              Solicitud de vacaciones
            </Text>

            <Text style={styles.detalle}>
              Inicio: {solicitud.fechaInicio}
            </Text>

            <Text style={styles.detalle}>
              Final: {solicitud.fechaFin}
            </Text>

            <Text style={styles.detalle}>
              Días solicitados: {solicitud.diasSolicitados}
            </Text>

            <Text style={styles.detalle}>
              Motivo: {solicitud.motivo}
            </Text>

            <Text style={styles.detalle}>
              Etapa actual:{" "}
              {solicitud.etapaActual || "Sin etapa pendiente"}
            </Text>

            {solicitud.motivoRechazo ? (
              <Text style={styles.observacion}>
                Observación: {solicitud.motivoRechazo}
              </Text>
            ) : null}
          </View>
        ))
      )}

      {/* ========================================== */}
      {/* PARTE 4 - HISTORIAL DE PERMISOS            */}
      {/* ========================================== */}

      <Text style={styles.tituloSeccion}>
        Permisos personales
      </Text>

      {permisosVisibles.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>
            {permisos.length === 0
              ? "Todavía no tienes solicitudes de permisos."
              : "No tienes permisos en este estado."}
          </Text>
        </View>
      ) : (
        permisosVisibles.map((solicitud) => {
          const visual = VISUAL_ESTADO[solicitud.estado];

          return (
            <TouchableOpacity
              key={solicitud.id}
              style={styles.tarjeta}
              onPress={() =>
                navigation.navigate("EstadoSolicitud", {
                  id: solicitud.id,
                })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.tituloTarjeta}>
                Solicitud de permiso
              </Text>

              <Text style={styles.detalle}>
                {formatearFecha(solicitud.fecha)}
              </Text>

              <View style={styles.filaEstado}>
                <View
                  style={[
                    styles.punto,
                    {
                      backgroundColor:
                        visual?.color ||
                        obtenerColorEstado(solicitud.estado),
                    },
                  ]}
                />

                <Text style={styles.estadoPermiso}>
                  Estado:{" "}
                  {visual?.label || solicitud.estado}
                </Text>
              </View>

              {solicitud.estado === "Rechazada" && (
                <Text style={styles.observacion}>
                  Toca para ver la observación y modificar
                  tu solicitud.
                </Text>
              )}
            </TouchableOpacity>
          );
        })
      )}

      {/*
       * PARTE 4 - El empleado puede crear un permiso.
       * La modificación de permisos rechazados se
       * realiza desde EstadoSolicitud.
       */}
      <CustomButton
        title="+ Solicitar permiso"
        type="secondary"
        onPress={() => navigation.navigate("SolicitarPermiso")}
        style={styles.botonNueva}
      />
    </ScrollView>
  );
}

/*
 * ESTILOS
 * Mantienen una presentación consistente para
 * vacaciones y permisos dentro del historial.
 */
const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
  tituloPrincipal: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 18,
  },
  filtros: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 20,
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
  tituloSeccion: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 12,
    marginBottom: 12,
  },
  accesoVacaciones: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  accesoTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1D4ED8",
  },
  accesoDescripcion: {
    fontSize: 13,
    color: "#475569",
    marginTop: 5,
  },
  tarjeta: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  filaEstado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  identificador: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563EB",
  },
  tituloTarjeta: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  detalle: {
    fontSize: 13,
    color: "#475569",
    marginTop: 4,
  },
  estado: {
    fontSize: 13,
    fontWeight: "bold",
  },
  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  estadoPermiso: {
    fontSize: 13,
    color: "#1E293B",
  },
  observacion: {
    fontSize: 13,
    color: "#B45309",
    marginTop: 10,
  },
  vacio: {
    padding: 18,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 12,
  },
  vacioTexto: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
  },
  botonNueva: {
    marginTop: 8,
  },
});
