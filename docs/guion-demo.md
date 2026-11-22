# Guion de la demostración – Defensa Final

**Duración aproximada:** 15 minutos.

**Antes de empezar:** web abierta en Vercel, app abierta en el emulador y las cuentas de prueba a la mano.

| # | Tiempo | Quién | Qué se muestra | Cuenta |
|---|---|---|---|---|
| 1 | 1 min | Moisés | Problema de Grupo Calma (trámites en papel) y la solución multiplataforma | — |
| 2 | 2 min | Moisés | Arquitectura: web, app y Firebase compartido; README y licencia | — |
| 3 | 1 min | Alcyr | Mockups de Figma y cómo se reflejan en las pantallas | — |
| 4 | 2 min | David | Login con correo y con Google en web y app | Empleado y cuenta Google |
| 5 | 3 min | David | Permiso: el Empleado lo pide en la app, el Jefe y la Analista lo aprueban en la web | Empleado, Jefe, Analista |
| 6 | 1 min | David | Vacaciones: saldo y aprobación Analista → Gerente → Jefe | Analista, Gerente, Jefe |
| 7 | 2 min | Carlos | Constancia: se pide, RRHH la autoriza y se genera el PDF con QR | Empleado, RRHH |
| 8 | 1 min | Carlos | Reportes con gráfica, CSV, dashboard y foto de perfil | Gerente |
| 9 | 1 min | David | API REST con token (200 con Gerente, 403 con Empleado) | Gerente, Empleado |
| 10 | 1 min | Nelson | Resumen de las pruebas realizadas (`docs/pruebas.md`) | — |

## Parte de Nelson – Resumen de pruebas

Durante las pruebas funcionales se verificó el comportamiento del sistema utilizando los diferentes roles disponibles, tanto en los flujos de inicio de sesión como en solicitudes, aprobaciones, vacaciones, constancias, reportes, perfil, notificaciones y acceso a la API.

Se comprobó que los diferentes roles respetan sus permisos y que los flujos de aprobación funcionan correctamente:

- **Permisos:** Empleado → Jefe inmediato → Analista de Nómina.
- **Vacaciones:** Analista de Nómina → Gerente → Jefe inmediato.
- **Constancias:** solicitud del Empleado y autorización por RRHH.
- **API:** acceso permitido para el Gerente y restringido para el Empleado mediante error 403.

En total se registraron **30 pruebas realizadas**, con **30 pruebas satisfactorias** y sin errores críticos encontrados durante las pruebas.

También se verificó el manejo de errores, como contraseñas incorrectas, fechas inválidas, solicitudes que superan el saldo disponible y accesos no autorizados.

## Recomendaciones

- Entrar siempre con correo y `Admin123` en las cuentas de prueba; Google solo con la cuenta de David.
- Tener una solicitud ya creada por si falla el internet.
- Si algo falla, explicar qué debería pasar y seguir con el siguiente punto.

Si el equipo decide otro orden u otros tiempos, cámbialo antes del commit. Lo importante es que cada quien presente lo que programó, porque en la defensa el docente puede preguntar sobre el código de cada integrante.