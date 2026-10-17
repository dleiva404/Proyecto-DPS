import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BandejaAprobacionesScreen from "../screens/bandeja/BandejaAprobacionesScreen";
import DetalleAprobacionScreen from "../screens/bandeja/DetalleAprobacionScreen";
import AutorizarConstanciaScreen from "../screens/constancias/AutorizarConstanciaScreen";

const Stack = createNativeStackNavigator();

export default function BandejaStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Pendientes"
        component={BandejaAprobacionesScreen}
        options={{ title: "Bandeja de aprobaciones" }}
      />
      <Stack.Screen
        name="DetalleAprobacion"
        component={DetalleAprobacionScreen}
        options={{ title: "Detalle de la solicitud" }}
      />
      <Stack.Screen
        name="AutorizarConstancia"
        component={AutorizarConstanciaScreen}
        options={{ title: "Autorizar constancia" }}
      />
    </Stack.Navigator>
  );
}
