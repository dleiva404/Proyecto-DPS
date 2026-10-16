
import { createNativeStackNavigator } from "@react-navigation/native-stack";

/*
 * Navegación general de solicitudes.
 * Integra los módulos de permisos, vacaciones y constancias.
 */

// Parte 4 - Permisos: historial, solicitud y estado.
import HistorialScreen from "../screens/permisos/HistorialScreen";
import SolicitarPermisoScreen from "../screens/permisos/SolicitarPermisoScreen";
import EstadoSolicitudScreen from "../screens/permisos/EstadoSolicitudScreen";

// Parte 3 - Vacaciones: formulario de solicitud.
import SolicitarVacacionesScreen from "../screens/vacaciones/SolicitarVacacionesScreen";

// Parte 5 - Constancias: solicitud y visualización.
import SolicitarConstanciaScreen from "../screens/constancias/SolicitarConstanciaScreen";
import VerConstanciaScreen from "../screens/constancias/VerConstanciaScreen";

const Stack = createNativeStackNavigator();

export default function SolicitudesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Parte 4: historial general de solicitudes. */}
      <Stack.Screen
        name="Historial"
        component={HistorialScreen}
      />

      {/* Parte 4: formulario de solicitud de permisos. */}
      <Stack.Screen
        name="SolicitarPermiso"
        component={SolicitarPermisoScreen}
      />

      {/* Parte 4: consulta del estado de una solicitud. */}
      <Stack.Screen
        name="EstadoSolicitud"
        component={EstadoSolicitudScreen}
      />

      {/* Parte 3: formulario de solicitud de vacaciones. */}
      <Stack.Screen
        name="SolicitarVacaciones"
        component={SolicitarVacacionesScreen}
      />

      {/* Parte 5: formulario de solicitud de constancias. */}
      <Stack.Screen
        name="SolicitarConstancia"
        component={SolicitarConstanciaScreen}
      />

      {/* Parte 5: visualización de constancia autorizada con QR. */}
      <Stack.Screen
        name="VerConstancia"
        component={VerConstanciaScreen}
      />
    </Stack.Navigator>
  );
}

