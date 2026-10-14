import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BandejaAprobacionesScreen from "../screens/bandeja/BandejaAprobacionesScreen";
import DetalleAprobacionScreen from "../screens/bandeja/DetalleAprobacionScreen";

const Stack = createNativeStackNavigator();

// Pestaña Bandeja: pendientes -> detalle para aprobar o rechazar
export default function BandejaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Pendientes" component={BandejaAprobacionesScreen} />
      <Stack.Screen name="DetalleAprobacion" component={DetalleAprobacionScreen} />
    </Stack.Navigator>
  );
}
