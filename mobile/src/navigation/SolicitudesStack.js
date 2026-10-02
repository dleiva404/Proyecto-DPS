import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HistorialScreen from "../screens/permisos/HistorialScreen";

const Stack = createNativeStackNavigator();

// stack de la tab Solicitudes temporal
export default function SolicitudesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Historial"
        component={HistorialScreen}
        options={{ title: "Mis solicitudes" }}
      />
      {/*SolicitarVacaciones, SolicitarPermiso, SolicitarConstancia,
          DetalleSolicitud, VerConstancia */}
    </Stack.Navigator>
  );
}
