import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/auth/LoginScreen";
import TabsNavigator from "./TabsNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { usuario } = useAuth();

  return (
    <NavigationContainer>
      {usuario ? (
        <TabsNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
