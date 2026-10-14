import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HistorialScreen from "../screens/permisos/HistorialScreen";
import SolicitarPermisoScreen from "../screens/permisos/SolicitarPermisoScreen";
import EstadoSolicitudScreen from "../screens/permisos/EstadoSolicitudScreen";

const Stack = createNativeStackNavigator();

// Pestaña Solicitudes: Mis solicitudes -> Solicitar / Estado.
// Los encabezados los dibuja cada pantalla (estilo Figma), por eso el header del stack va oculto.
export default function SolicitudesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Historial" component={HistorialScreen} />
      <Stack.Screen name="SolicitarPermiso" component={SolicitarPermisoScreen} />
      <Stack.Screen name="EstadoSolicitud" component={EstadoSolicitudScreen} />
    </Stack.Navigator>
  );
}
