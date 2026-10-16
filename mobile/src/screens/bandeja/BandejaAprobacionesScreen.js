/*
 * BANDEJA DE APROBACIONES - PROYECTO DPS
 *
 * Integra dos procesos independientes:
 * PARTE 3: aprobación de vacaciones.
 * PARTE 4: aprobación de permisos personales.
 *
 * Cada proceso conserva su propio servicio y sus reglas.
 */

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

// Componentes utilizados por la parte 4 (Permisos).
import CabeceraFigma from "../../components/CabeceraFigma";
import CustomButton from "../../components/CustomButton";
import { formatearFecha } from "../../services/formato";

// PARTE 3 - Servicio de solicitudes de vacaciones.
import {
  listarVacacionesPendientesPorRol,
  decidirSolicitudVacaciones,
} from "../../services/solicitudesVacacionesService";

// PARTE 4 - Servicio de solicitudes de permisos.
import {
  decidir as decidirPermiso,
  pendientesDeEquipo,
} from "../../services/solicitudesService";

/*
 * Nombres visibles de los roles que participan
 * en el proceso de aprobación de vacaciones.
 */
const ETIQUETAS = {
  ANALISTA: "Analista de Nómina",
  GERENTE: "Gerente",
  JEFE: "Jefe inmediato",
};

export default function BandejaAprobacionesScreen({ navigation }) {
  const { usuario } = useAuth();

  /*
   * PARTE 3 - VACACIONES
   * Guarda las solicitudes pendientes para el rol actual
   * y controla el formulario de rechazo.
   */
  const [vacaciones, setVacaciones] = useState([]);
  const [rechazoId, setRechazoId] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  /*
   * PARTE 4 - PERMISOS
   * Guarda los permisos pendientes del equipo del jefe.
   */
  const [permisos, setPermisos] = useState([]);
  const [mensajePermisos, setMensajePermisos] = useState("");

  const rol = usuario?.rol;

  /*
   * INTEGRACIÓN - CARGA DE SOLICITUDES
   *
   * Vacaciones: se consultan según la etapa y el rol.
   * Permisos: solamente el jefe ve los de su equipo.
   */
  const cargarSolicitudes = useCallback(() => {
    if (["ANALISTA", "GERENTE", "JEFE"].includes(rol)) {
      setVacaciones(listarVacacionesPendientesPorRol(rol));
    } else {
      setVacaciones([]);
    }

    if (usuario?.id && rol === "JEFE") {
      setPermisos(pendientesDeEquipo(usuario));
    } else {
      setPermisos([]);
    }
  }, [usuario, rol]);

  /*
   * Actualiza ambas listas cada vez que el usuario
   * entra o regresa a la bandeja de aprobaciones.
   */
  useFocusEffect(
    useCallback(() => {
      cargarSolicitudes();
    }, [cargarSolicitudes]),
  );

  /*
   * PARTE 3 - VACACIONES
   *
   * Confirma la decisión y utiliza el servicio original.
   * Una aprobación puede avanzar a la siguiente etapa;
   * no necesariamente finaliza toda la solicitud.
   */
  const gestionarVacacion = (solicitud, decision) => {
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
            cargarSolicitudes();

            if (decision === "Rechazar") {
              Alert.alert(
                "Solicitud actualizada",
                "La solicitud de vacaciones fue rechazada.",
              );
              return;
            }

            if (resultado.solicitud.estado === "Aprobada") {
              Alert.alert(
                "Solicitud aprobada",
                "La solicitud fue aprobada en todas las etapas.",
              );
              return;
            }

            Alert.alert(
              "Solicitud actualizada",
              `La solicitud pasó a la etapa: ${
                ETIQUETAS[resultado.solicitud.etapaActual] ||
                resultado.solicitud.etapaActual
              }.`,
            );
          },
        },
      ],
    );
  };

  /*
   * PARTE 4 - PERMISOS
   *
   * El jefe puede aprobar directamente desde la bandeja.
   * Al aprobar, el permiso avanza a la etapa de Analista.
   */
  const aprobarPermiso = (id) => {
    const resultado = decidirPermiso(usuario, id, "Aprobado");

    if (!resultado.ok) {
      setMensajePermisos(resultado.error);
      return;
    }

    setMensajePermisos("");
    cargarSolicitudes();
  };

  /*
   * PARTE 4 - PERMISOS
   *
   * El rechazo se realiza desde DetalleAprobacion,
   * donde el jefe debe explicar el motivo.
   *
   * El empleado podrá consultar esa observación
   * y modificar la solicitud rechazada.
   */
  const abrirDetallePermiso = (id) => {
    navigation.navigate("DetalleAprobacion", { id });
  };

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      {/* Encabezado general compartido por ambos módulos. */}
      <CabeceraFigma subtitulo="Bandeja de aprobaciones" />

      <Text style={styles.tituloPrincipal}>
        Bandeja de aprobaciones
      </Text>

      <Text style={styles.subtitulo}>
        {ETIQUETAS[rol] || "Usuario"} · Solicitudes pendientes
      </Text>

      {/* ============================================= */}
      {/* PARTE 3 - SECCIÓN DE VACACIONES               */}
      {/* ============================================= */}

      {["ANALISTA", "GERENTE", "JEFE"].includes(rol) && (
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>
            Solicitudes de vacaciones
          </Text>

          <Text style={styles.descripcionSeccion}>
            Solicitudes correspondientes a tu etapa de aprobación.
          </Text>

          {vacaciones.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioTitulo}>
                No hay vacaciones pendientes
              </Text>
              <Text style={styles.vacioTexto}>
                Las solicitudes de tu etapa aparecerán aquí.
              </Text>
            </View>
          ) : (
            vacaciones.map((solicitud) => (
              <View key={solicitud.id} style={styles.tarjeta}>
                <View style={styles.fila}>
                  <Text style={styles.identificador}>
                    {solicitud.id}
                  </Text>
                  <Text style={styles.estado}>
                    Pendiente
                  </Text>
                </View>

                <Text style={styles.empleado}>
                  {solicitud.empleadoNombre}
                </Text>

                <Text style={styles.detalle}>
                  Tipo: {solicitud.tipo}
                </Text>

                <Text style={styles.detalle}>
                  Departamento:{" "}
                  {solicitud.departamento || "No indicado"}
                </Text>

                <Text style={styles.detalle}>
                  Inicio: {solicitud.fechaInicio}
                </Text>

                <Text style={styles.detalle}>
                  Fin: {solicitud.fechaFin}
                </Text>

                <Text style={styles.detalle}>
                  Días hábiles: {solicitud.diasSolicitados}
                </Text>

                <Text style={styles.motivoTitulo}>
                  Motivo de la solicitud
                </Text>

                <Text style={styles.detalle}>
                  {solicitud.motivo}
                </Text>

                {/*
                 * El formulario de rechazo solamente se muestra
                 * cuando se selecciona rechazar esta solicitud.
                 */}
                {rechazoId === solicitud.id && (
                  <View style={styles.formRechazo}>
                    <Text style={styles.motivoTitulo}>
                      Motivo del rechazo
                    </Text>

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
                      <Text style={styles.textoCancelar}>
                        Cancelar rechazo
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.acciones}>
                  <TouchableOpacity
                    style={styles.botonAprobar}
                    onPress={() =>
                      gestionarVacacion(solicitud, "Aprobar")
                    }
                  >
                    <Text style={styles.textoBoton}>
                      Aprobar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.botonRechazar}
                    onPress={() => {
                      if (rechazoId === solicitud.id) {
                        gestionarVacacion(solicitud, "Rechazar");
                      } else {
                        setRechazoId(solicitud.id);
                        setMotivoRechazo("");
                      }
                    }}
                  >
                    <Text style={styles.textoBoton}>
                      {rechazoId === solicitud.id
                        ? "Confirmar rechazo"
                        : "Rechazar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* ============================================= */}
      {/* PARTE 4 - SECCIÓN DE PERMISOS                 */}
      {/* ============================================= */}

      {rol === "JEFE" && (
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>
            Solicitudes de permisos
          </Text>

          <Text style={styles.descripcionSeccion}>
            Permisos personales solicitados por tu equipo.
          </Text>

          {mensajePermisos ? (
            <Text style={styles.error}>
              {mensajePermisos}
            </Text>
          ) : null}

          {permisos.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioTitulo}>
                No hay permisos pendientes
              </Text>
              <Text style={styles.vacioTexto}>
                Las solicitudes de tu personal aparecerán aquí.
              </Text>
            </View>
          ) : (
            permisos.map((solicitud) => (
              <View key={solicitud.id} style={styles.tarjeta}>
                <Text style={styles.identificador}>
                  {solicitud.id}
                </Text>

                <Text style={styles.empleado}>
                  Solicitud de permiso
                </Text>

                <Text style={styles.linea}>
                  Empleado: {solicitud.empleadoNombre}
                </Text>

                <Text style={styles.linea}>
                  Empresa: {solicitud.empresa}
                </Text>

                <Text style={styles.linea}>
                  Fecha: {formatearFecha(solicitud.fecha)}
                </Text>

                <Text style={styles.linea}>
                  Motivo: {solicitud.motivo}
                </Text>

                <View style={styles.acciones}>
                  <CustomButton
                    title="Aprobar"
                    onPress={() => aprobarPermiso(solicitud.id)}
                    style={styles.botonPermiso}
                  />

                  <CustomButton
                    title="Rechazar"
                    type="secondary"
                    onPress={() =>
                      abrirDetallePermiso(solicitud.id)
                    }
                    style={styles.botonPermiso}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Mensaje para roles sin bandeja habilitada. */}
      {!["ANALISTA", "GERENTE", "JEFE"].includes(rol) && (
        <View style={styles.vacio}>
          <Text style={styles.vacioTitulo}>
            No tienes aprobaciones asignadas
          </Text>
          <Text style={styles.vacioTexto}>
            Esta bandeja está disponible para los roles autorizados.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

/*
 * ESTILOS GENERALES
 *
 * Se conserva la apariencia del proyecto y se separan
 * visualmente las solicitudes de vacaciones y permisos.
 */
const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
  tituloPrincipal: {
    fontSize: 23,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 20,
  },
  seccion: {
    marginBottom: 24,
  },
  tituloSeccion: {
    fontSize: 19,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 6,
  },
  descripcionSeccion: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
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
  identificador: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 6,
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
  linea: {
    color: theme.colors.text,
    fontSize: 13,
    marginTop: 3,
  },
  motivoTitulo: {
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 6,
  },
  acciones: {
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
  botonPermiso: {
    flex: 1,
  },
  vacio: {
    padding: 24,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  vacioTitulo: {
    color: theme.colors.text,
    fontSize: 16,
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
  error: {
    color: theme.colors.error,
    fontSize: 13,
    marginBottom: 12,
  },
});
