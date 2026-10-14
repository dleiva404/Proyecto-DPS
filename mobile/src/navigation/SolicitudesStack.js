
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HistorialScreen from "../screens/permisos/HistorialScreen";
import SolicitarVacacionesScreen from "../screens/vacaciones/SolicitarVacacionesScreen";

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
        name="SolicitarVacaciones"
        component={SolicitarVacacionesScreen}
        options={{ title: "Solicitar vacaciones" }}
      />
    </Stack.Navigator>
  );
}
