# Configuración de Firebase Authentication + roles

## 1. Crear el proyecto (solo una persona del equipo, una sola vez)

1. Ir a https://console.firebase.google.com y crear un proyecto (ej. `dps-rrhh-didelco`).
2. En **Authentication > Sign-in method**, habilitar el proveedor **Correo/contraseña**.
3. En **Firestore Database**, crear la base de datos (modo producción, no modo de prueba).
4. En **Configuración del proyecto > Tus apps**, agregar una app web y copiar la config
   (`apiKey`, `authDomain`, `projectId`, etc.).
5. Compartir esos valores con el equipo por un canal privado (no por el repo).
   Cada quien los pega en su propio `.env.local` (ver `.env.local.example`).

## 2. Publicar las reglas de seguridad

Copiar el contenido de `firestore.rules` en **Firestore Database > Reglas** y publicar.

## 3. Crear los usuarios de prueba

Por ahora esto se hace manualmente desde la consola (más adelante se puede automatizar
con un script del Admin SDK si hace falta).

### a) Crear las cuentas en Authentication

En **Authentication > Users > Add user**, crear una cuenta por cada rol, por ejemplo:

| Correo                      | Contraseña   | Rol               |
|------------------------------|--------------|-------------------|
| admin@didelco.com            | (definir)    | AdminTI           |
| gerente@didelco.com          | (definir)    | Gerente           |
| nomina@didelco.com           | (definir)    | AnalistaNomina    |
| planilla@didelco.com         | (definir)    | AsistentePlanilla |
| jefe@didelco.com             | (definir)    | JefeInmediato     |
| empleado@didelco.com         | (definir)    | Empleado          |

Después de crear cada usuario, Firebase le asigna un **UID** (se ve en la lista de usuarios).

### b) Crear el documento de rol en Firestore

En **Firestore Database > Datos**, crear la colección `usuarios` y, por cada persona de la
tabla anterior, un documento cuyo **ID sea exactamente el UID** que Firebase le asignó:

```
usuarios/{uid}
  email: "gerente@didelco.com"
  nombre: "Nombre de prueba"
  rol: "Gerente"
  empleadoId: "E001"   // opcional, si se quiere vincular con empleadosMock
```

Repetir para los 6 roles. Sin este documento, el login funciona pero la app no sabrá
qué rol tiene la persona (ver `AuthContext.tsx`).

## 4. Probar

1. `npm run dev`
2. Entrar a `/login` con cualquiera de las cuentas de prueba.
3. Debería redirigir a `/dashboard` y mostrar el nombre/rol en la esquina superior.
4. Si el rol no está en `rolesPermitidos` de `ProtectedRoute`, debe redirigir fuera del dashboard.
