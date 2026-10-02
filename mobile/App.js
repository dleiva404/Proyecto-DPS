import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/auth/LoginScreen";
import PerfilScreen from "./src/screens/perfil/PerfilScreen";

// prueba temporal hasta tener la navegacion
function Contenido() {
  const { usuario } = useAuth();
  return usuario ? <PerfilScreen /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <Contenido />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
