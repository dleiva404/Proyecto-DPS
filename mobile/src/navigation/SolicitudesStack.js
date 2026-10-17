import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HistorialScreen from "../screens/permisos/HistorialScreen";
import SolicitarPermisoScreen from "../screens/permisos/SolicitarPermisoScreen";
import EstadoSolicitudScreen from "../screens/permisos/EstadoSolicitudScreen";

import SolicitarVacacionesScreen from "../screens/vacaciones/SolicitarVacacionesScreen";
import DetalleVacacionesScreen from "../screens/vacaciones/DetalleVacacionesScreen";
import SolicitarConstanciaScreen from "../screens/constancias/SolicitarConstanciaScreen";
import VerConstanciaScreen from "../screens/constancias/VerConstanciaScreen";

const Stack = createNativeStackNavigator();

export default function SolicitudesStack() {
  return (
    <Stack.Navigator>
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
    </Stack.Navigator>
  );
}
