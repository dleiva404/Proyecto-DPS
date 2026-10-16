import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Módulo de solicitudes: historial general.
import HistorialScreen from "../screens/permisos/HistorialScreen";

// Parte 3 - Vacaciones: pantalla para registrar solicitudes.
import SolicitarVacacionesScreen from "../screens/vacaciones/SolicitarVacacionesScreen";

// Parte 5 - Constancias: solicitud y visualización del documento.
import SolicitarConstanciaScreen from "../screens/constancias/SolicitarConstanciaScreen";
import VerConstanciaScreen from "../screens/constancias/VerConstanciaScreen";

const Stack = createNativeStackNavigator();

export default function SolicitudesStack() {
  return (
    <Stack.Navigator>
      {/* Historial general de solicitudes del empleado. */}
      <Stack.Screen
        name="Historial"
        component={HistorialScreen}
        options={{ title: "Mis solicitudes" }}
      />

      {/* Parte 3 - Vacaciones: formulario de solicitud. */}
      <Stack.Screen
        name="SolicitarVacaciones"
        component={SolicitarVacacionesScreen}
        options={{ title: "Solicitar vacaciones" }}
      />

      {/* Parte 5 - Constancias: formulario de solicitud. */}
      <Stack.Screen
        name="SolicitarConstancia"
        component={SolicitarConstanciaScreen}
        options={{ title: "Solicitar constancia" }}
      />

      {/* Parte 5 - Constancias: documento autorizado con código QR. */}
      <Stack.Screen
        name="VerConstancia"
        component={VerConstanciaScreen}
        options={{ title: "Ver constancia" }}
      />
    </Stack.Navigator>
  );
}
