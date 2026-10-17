
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// =====================================================
// PANTALLAS DE PERMISOS
// =====================================================

import HistorialScreen from "../screens/permisos/HistorialScreen";
import SolicitarPermisoScreen from "../screens/permisos/SolicitarPermisoScreen";
import EstadoSolicitudScreen from "../screens/permisos/EstadoSolicitudScreen";

// =====================================================
// PANTALLAS DE VACACIONES
// =====================================================

import SolicitarVacacionesScreen from "../screens/vacaciones/SolicitarVacacionesScreen";
import DetalleVacacionesScreen from "../screens/vacaciones/DetalleVacacionesScreen";

// =====================================================
// PANTALLAS DE CONSTANCIAS
// =====================================================

import SolicitarConstanciaScreen from "../screens/constancias/SolicitarConstanciaScreen";
import VerConstanciaScreen from "../screens/constancias/VerConstanciaScreen";
import HistorialConstanciasScreen from "../screens/constancias/HistorialConstanciasScreen";
import AutorizarConstanciaScreen from "../screens/constancias/AutorizarConstanciaScreen";

// La bandeja de constancias se quitó de aquí porque
// las solicitudes pendientes ya se atienden desde
// la bandeja general, según el rol del usuario.

// =====================================================
// NAVEGADOR PRINCIPAL DE SOLICITUDES
// =====================================================

const Stack = createNativeStackNavigator();

export default function SolicitudesStack() {
  return (
    <Stack.Navigator>
      {/* ================================================
          PERMISOS
      ================================================= */}

      <Stack.Screen
        name="Historial"
        component={HistorialScreen}
        options={{ title: "Mis solicitudes" }}
      />

      <Stack.Screen
        name="SolicitarPermiso"
        component={SolicitarPermisoScreen}
        options={{ title: "Solicitar permiso" }}
      />

      <Stack.Screen
        name="EstadoSolicitud"
        component={EstadoSolicitudScreen}
        options={{ title: "Estado de la solicitud" }}
      />

      {/* ================================================
          VACACIONES
      ================================================= */}

      <Stack.Screen
        name="SolicitarVacaciones"
        component={SolicitarVacacionesScreen}
        options={{ title: "Solicitar vacaciones" }}
      />

      <Stack.Screen
        name="DetalleVacaciones"
        component={DetalleVacacionesScreen}
        options={{ title: "Detalle de vacaciones" }}
      />

      {/* ================================================
          CONSTANCIAS
      ================================================= */}

      <Stack.Screen
        name="SolicitarConstancia"
        component={SolicitarConstanciaScreen}
        options={{ title: "Solicitar constancia" }}
      />

      <Stack.Screen
        name="VerConstancia"
        component={VerConstanciaScreen}
        options={{ title: "Ver constancia" }}
      />

      {/* Desde aquí el empleado puede consultar sus constancias. */}
      <Stack.Screen
        name="HistorialConstancias"
        component={HistorialConstanciasScreen}
        options={{ title: "Mis constancias" }}
      />

      {/* Se mantiene la pantalla de autorización para el flujo de revisión. */}
      <Stack.Screen
        name="AutorizarConstancia"
        component={AutorizarConstanciaScreen}
        options={{ title: "Autorizar constancia" }}
      />
    </Stack.Navigator>
  );
}
