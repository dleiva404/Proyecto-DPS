import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { APROBADORES, VEN_REPORTES } from "../constants/roles";

import InicioScreen from "../screens/inicio/InicioScreen";
import SolicitudesStack from "./SolicitudesStack";
import BandejaAprobacionesScreen from "../screens/bandeja/BandejaAprobacionesScreen";
import ReportesScreen from "../screens/reportes/ReportesScreen";
import PerfilScreen from "../screens/perfil/PerfilScreen";

const Tab = createBottomTabNavigator();

// icono de cada tab
const iconos = {
  Inicio: "home",
  Solicitudes: "document-text",
  Bandeja: "checkmark-done",
  Reportes: "bar-chart",
  Perfil: "person",
};

export default function TabsNavigator() {
  const { usuario } = useAuth();

  // que puede ver según su rol
  const esAprobador = APROBADORES.includes(usuario.rol);
  const veReportes = VEN_REPORTES.includes(usuario.rol);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // icono relleno
          const nombre = focused
            ? iconos[route.name]
            : `${iconos[route.name]}-outline`;
          return <Ionicons name={nombre} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#1e3a8a",
        tabBarInactiveTintColor: "#9ca3af",
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen
        name="Solicitudes"
        component={SolicitudesStack}
        options={{ headerShown: false }}
      />
      {esAprobador && (
        <Tab.Screen name="Bandeja" component={BandejaAprobacionesScreen} />
      )}
      {veReportes && <Tab.Screen name="Reportes" component={ReportesScreen} />}
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
