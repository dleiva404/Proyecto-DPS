import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HistorialScreen from "../screens/permisos/HistorialScreen";
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
