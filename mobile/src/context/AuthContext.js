import { createContext, useContext, useState } from "react";
import { usuariosMock } from "../services/usuariosMock";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  // busca el usuario en los datos de prueba
  const login = (correo, clave) => {
    const encontrado = usuariosMock.find(
      (u) =>
        u.correo.toLowerCase() === correo.trim().toLowerCase() &&
        u.clave === clave,
    );

    if (!encontrado) {
      return { ok: false, mensaje: "Correo o contraseña incorrectos" };
    }

    // no guardamos la clave en el estado
    const { clave: _clave, ...datos } = encontrado;
    setUsuario(datos);
    return { ok: true };
  };

  const logout = () => setUsuario(null);

  // se usa en Perfil para cambiar la foto
  const actualizarFoto = (uri) => {
    setUsuario((prev) => ({ ...prev, fotoUrl: uri }));
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, actualizarFoto }}>
      {children}
    </AuthContext.Provider>
  );
}

// hook para usar la sesion en cualquier pantalla
export const useAuth = () => useContext(AuthContext);
