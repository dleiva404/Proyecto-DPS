# Sistema de Gestión de Recursos Humanos

Sistema web desarrollado para la **gestión de procesos de Recursos Humanos**, orientado a centralizar solicitudes, vacaciones, permisos, constancias laborales, aprobaciones y consultas relacionadas con los empleados de las empresas contempladas en el proyecto.

El sistema contempla las siguientes **seis empresas**:

- Didelco
- Steel
- EFL
- DCA
- Copro
- Propultran

---

## Objetivo del proyecto

Desarrollar una plataforma web que permita digitalizar y centralizar diferentes procesos de Recursos Humanos, facilitando la interacción entre empleados, jefes inmediatos y personal administrativo.

La aplicación permite gestionar solicitudes, consultar información de empleados, controlar procesos de aprobación y visualizar información relevante mediante un dashboard.

---

## Funcionalidades principales

- Inicio de sesión de usuarios.
- Manejo de diferentes roles.
- Control de acceso según el rol del usuario.
- Gestión de solicitudes de empleados.
- Solicitudes de permisos.
- Solicitudes de vacaciones.
- Solicitudes de constancias laborales.
- Flujo de aprobación y rechazo de solicitudes.
- Registro de observaciones durante los procesos de aprobación.
- Consulta de información de empleados.
- Dashboard con indicadores y gráficas.
- Generación de constancias en formato PDF.
- Generación de códigos QR.
- Exportación de información.
- Integración con Firebase.
- Integración con una API REST.
- Validación y manejo de errores.

---

## Tecnologías utilizadas

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Firebase Authentication**
- **Cloud Firestore**
- **Next.js Route Handlers**
- **API REST**
- **Fetch API**
- **Recharts**
- **PDF-Lib**
- **QRCode**
- **Lucide React**
- **Git**
- **GitHub**
- **Vercel**

---

## Roles del sistema

El sistema contempla diferentes niveles de acceso de acuerdo con las responsabilidades de cada usuario.

### Admin TI

Encargado de funciones administrativas relacionadas con usuarios y acceso al sistema.

### Gerente

Posee acceso administrativo y participa en determinados procesos de aprobación.

### Analista de Nómina

Participa en procesos relacionados con solicitudes, validaciones y gestión administrativa.

### Asistente de Planilla

Cuenta con acceso a información necesaria para procesos administrativos y de empleados.

### Jefe Inmediato

Puede consultar las solicitudes correspondientes y participar en los procesos de aprobación o rechazo.

### Empleado

Puede ingresar al sistema, realizar solicitudes y consultar el estado de sus procesos.

---

## Arquitectura del proyecto

El proyecto utiliza la arquitectura proporcionada por **Next.js**, separando las principales responsabilidades del sistema.

```text
app/
├── api/
│   └── solicitudes/
├── dashboard/
├── solicitudes/
├── reportes/
└── ...

components/
context/
lib/
mocks/
services/
types/
```

La aplicación separa:

- **Interfaz de usuario:** páginas y componentes desarrollados con React y Next.js.
- **Lógica de aplicación:** contextos, validaciones y servicios.
- **Acceso a datos:** servicios de Firebase, Firestore y API REST.
- **Datos de prueba:** mocks utilizados durante el desarrollo.

---

## Firebase

El proyecto utiliza **Firebase Authentication** para la autenticación de usuarios y **Cloud Firestore** para el manejo de información utilizada por diferentes módulos del sistema.

La configuración de Firebase utiliza variables de entorno almacenadas localmente en el archivo:

```text
.env.local
```

Variables utilizadas:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Por seguridad, los valores reales de estas variables **no se almacenan en este README**.

---

# API REST

Como parte de la integración de servicios requerida en la Fase 2, el proyecto incorpora una **API REST para solicitudes**, implementada mediante los Route Handlers de Next.js.

## Endpoint

```text
/api/solicitudes
```

### GET /api/solicitudes

Permite obtener las solicitudes disponibles en los datos de prueba utilizados por el proyecto.

Ejemplo de respuesta:

```json
{
  "success": true,
  "total": 4,
  "data": []
}
```

La respuesta contiene:

- `success`: indica si la petición fue procesada correctamente.
- `total`: cantidad de solicitudes encontradas.
- `data`: listado de solicitudes.

### POST /api/solicitudes

Permite recibir y validar una nueva solicitud mediante una petición HTTP.

La API valida los siguientes campos principales:

```text
empleadoId
tipo
fechaHorario
empresa
```

Si la información es correcta, la API genera un identificador único para la solicitud y devuelve una respuesta satisfactoria.

Ejemplo:

```json
{
  "success": true,
  "message": "Solicitud recibida correctamente.",
  "data": {
    "id": "identificador-generado"
  }
}
```

Durante esta fase, el endpoint POST utiliza los datos mock existentes para demostrar el flujo REST y la validación de información. La solicitud recibida **no se almacena permanentemente** en el arreglo mock.

---

## Manejo de respuestas HTTP

La API utiliza diferentes códigos HTTP según el resultado de la petición:

| Código | Descripción |
|---|---|
| `200` | Consulta realizada correctamente |
| `201` | Solicitud recibida correctamente |
| `400` | Información de la solicitud incompleta o incorrecta |
| `500` | Error interno durante el procesamiento |

La implementación también contempla manejo de excepciones para evitar respuestas sin estructura cuando ocurre un error.

---

## Pruebas realizadas a la API

Durante el desarrollo se realizaron pruebas de los principales escenarios del endpoint:

- Consulta `GET` satisfactoria.
- Envío `POST` satisfactorio.
- Generación de identificador único para nuevas solicitudes.
- Validación de campos obligatorios.
- Respuesta `400` ante información incompleta.
- Manejo de errores internos mediante respuesta `500`.

Estas pruebas permiten verificar el funcionamiento básico del servicio REST antes de su integración definitiva con los demás módulos del sistema.

---

## Ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/dleiva404/Proyecto-DPS.git
```

### 2. Ingresar al proyecto

```bash
cd Proyecto-DPS
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar las variables de entorno

Crear el archivo `.env.local` en la raíz del proyecto y configurar las variables necesarias de Firebase.

### 5. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible localmente en:

```text
http://localhost:3000
```

La API REST puede consultarse en:

```text
http://localhost:3000/api/solicitudes
```

---

## Control de versiones

El proyecto utiliza **Git y GitHub** para el control de versiones y el trabajo colaborativo.

Cada integrante trabaja mediante ramas y commits para mantener organizados los cambios realizados durante el desarrollo.

Repositorio:

```text
https://github.com/dleiva404/Proyecto-DPS
```

---

## Despliegue

El proyecto será desplegado mediante **Vercel**.

El enlace público de producción se agregará en esta sección una vez finalizado el despliegue:

```text
URL de Vercel: Pendiente
```

---

## Evidencias y documentación

Durante el desarrollo se realizaron pruebas y capturas de los principales procesos del sistema, incluyendo:

- Inicio de sesión.
- Dashboard.
- Gestión de solicitudes.
- Reportes.
- Generación de constancias.
- API REST mediante GET.
- API REST mediante POST.
- Validación de solicitudes incorrectas.
- Control de versiones mediante Git y GitHub.

---

## Integrantes

- Carlos Alberto Cornejo Calderón
- David Antonio Leiva Martínez
- Moisés David García Casco
- Alcyr Alexander Figueroa Landaverde
- Nelson Mauricio Solano Guardado

---

## Asignatura

**DPS941 – Desarrollo de aplicaciones**

**Etapa 2 – Desarrollo Base del Proyecto Web**

---

## Estado del proyecto

Proyecto desarrollado como parte de la **Fase 2**, incluyendo la estructura base de la aplicación web, autenticación, roles, módulos principales, integración con servicios, API REST, manejo de datos, documentación y preparación para despliegue.