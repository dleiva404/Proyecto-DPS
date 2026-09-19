"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
// Aquí nos conectamos a la BD de firebase que ya tenemos configurada
import { db } from "@/lib/firebase"; 
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Search, UserPlus } from "lucide-react";

interface Usuario {
  id: string;
  email: string;
  rol: string;
  nombre?: string;
}

export default function AdminITPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Jalamos los usuarios de Firestore apenas carga la página
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        // Consultamos la colección en firebase para traer a todos los usuarios
        const querySnapshot = await getDocs(collection(db, "users"));
        const listaUsuarios: Usuario[] = [];
        
        querySnapshot.forEach((documento) => {
          const data = documento.data();
          listaUsuarios.push({
            id: documento.id,
            email: data.email || data.correo || "Sin correo",
            rol: data.rol || "Empleado",
            nombre: data.name || data.nombre || "Sin nombre",
          });
        });

        setUsuarios(listaUsuarios);
      } catch (error) {
        console.error("Puchica, falló al cargar los usuarios de firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  // Función para cambiar el rol al toque y guardarlo en la base
  const actualizarRol = async (id: string, nuevoRol: string) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { rol: nuevoRol });
      
      // Actualizamos la lista local para que se vea reflejado al instante
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, rol: nuevoRol } : u));
      alert("¡Listos los cambios, rol actualizado!");
    } catch (error) {
      console.error("Error al actualizar el rol:", error);
      alert("No se pudo actualizar el rol, revisa la conexión.");
    }
  };

  // Filtrar usuarios según lo que escriban en el buscador
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      (u.nombre && u.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Panel de Administrador de IT</h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
              Control de accesos y permisos por roles 
            </p>
          </div>

          {/* Tarjetas de métricas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-semibold uppercase">Cuentas Registradas</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{loading ? "..." : usuarios.length}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-semibold uppercase">Incidencias de Acceso</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">0</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs font-semibold uppercase">Estado de Firebase</p>
              <p className="text-3xl font-bold text-blue-600 mt-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                Conectado
              </p>
            </div>
          </div>

          {/* Tabla roles y permisos */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wide">
                  Directorio de Usuarios del Sistema
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {loading ? "Cargando..." : `Total: ${usuariosFiltrados.length} usuario(s)`}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Input Buscador */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 shadow-xs"
                  />
                </div>

                {/* Botón Nuevo Usuario */}
                <button
                  onClick={() => alert("Aquí puedes abrir tu modal de registro de usuario")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  Nuevo usuario
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="p-4">Usuario / Nombre</th>
                    <th className="p-4">Correo Electrónico</th>
                    <th className="p-4">Rol Actual</th>
                    <th className="p-4">Cambiar Rol / Permiso</th>
                    <th className="p-4">Acciones Técnicas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        Cargando usuarios desde la base de datos...
                      </td>
                    </tr>
                  ) : usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        No se encontraron usuarios que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 text-slate-700 font-medium">{user.nombre}</td>
                        <td className="p-4 text-slate-600">{user.email}</td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs border border-blue-200 font-medium">
                            {user.rol}
                          </span>
                        </td>
                        <td className="p-4">
                          <select 
                            value={user.rol}
                            onChange={(e) => actualizarRol(user.id, e.target.value)}
                            className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg p-1.5 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Empleado">Empleado</option>
                            <option value="Gerente">Gerente</option>
                            <option value="RRHH">Recursos Humanos</option>
                            <option value="Admin IT">Admin IT</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => alert(`Enviando correo para resetear clave a ${user.email}`)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition shadow-sm"
                          >
                            Restablecer Clave
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}