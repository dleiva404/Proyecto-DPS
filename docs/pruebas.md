# Pruebas del sistema – Entrega Final

Pruebas funcionales realizadas en la versión web (Vercel) y en la app móvil (emulador Android), con un usuario por rol.

**Realizadas por:** Nelson Mauricio Solano Guardado  
**Fecha:** 21 de noviembre de 2026

## Inicio de sesión

| # | Prueba | Cuenta | Dónde | Resultado esperado | ¿Pasó? | Observaciones |
|---|---|---|---|---|---|---|
| L1 | Entrar con correo y Admin123 | Las 6 cuentas | Web | Entra al Dashboard con su rol | Sí | Las 6 cuentas ingresaron correctamente al Dashboard según su rol. |
| L2 | Entrar con correo y Admin123 | Las 5 cuentas (no AdminTI) | App | Entra a Inicio con su rol | Sí | El inicio de sesión funciona correctamente en la aplicación. |
| L3 | Contraseña incorrecta | Cualquiera | Web y app | Muestra error y no entra | Sí | Se mostró el mensaje “Correo o contraseña incorrectos.” y no permitió el acceso. |
| L4 | Google con una cuenta no registrada | Gmail no registrado | Web y app | “No se encontró tu perfil” / no registrada | Sí | Se mostró “No se encontró tu perfil. Contacta a un Administrador de TI.” |
| L5 | AdminTI en la app | admin.ti@didelco.com | App | No lo deja entrar (rol solo web) | Sí | El rol AdminTI está restringido a la plataforma web. |
| L6 | Cerrar sesión | Cualquiera | Web y app | Regresa al login | Sí | La sesión se cerró correctamente y regresó a la pantalla de inicio de sesión. |

## Permisos

| # | Prueba | Cuenta | Dónde | Resultado esperado | ¿Pasó? | Observaciones |
|---|---|---|---|---|---|---|
| P1 | Pedir permiso para un día hábil | Empleado | Web | Queda “Esperando firma — Jefe inmediato” | Sí | La solicitud quedó pendiente del Jefe inmediato. |
| P2 | Pedir permiso en domingo o día pasado | Empleado | Web y app | Muestra error y no se guarda | Sí | El sistema rechazó correctamente la fecha inválida. |
| P3 | Aprobar el permiso de P1 | Jefe inmediato | Web | Pasa a “Analista de Nómina” | Sí | El permiso pasó correctamente a Analista de Nómina. |
| P4 | Aprobar el mismo permiso | Analista | Web | Queda Aprobada | Sí | El permiso quedó aprobado después de la aprobación del Analista. |
| P5 | Ver el permiso de P1 en el celular | Empleado | App | Sale Aprobada con el historial | Sí | La solicitud aprobada se muestra correctamente en el móvil. |
| P6 | Pedir otro permiso y rechazarlo con motivo | Empleado y Jefe | App y web | Queda Rechazada y se ve el motivo | Sí | La solicitud quedó rechazada y se mostró el motivo registrado. |
| P7 | Intentar aprobar algo que no le toca | Empleado / Analista | Web | Botones desactivados | Sí | Los botones de aprobación no están disponibles para un rol no autorizado. |

## Vacaciones

| # | Prueba | Cuenta | Dónde | Resultado esperado | ¿Pasó? | Observaciones |
|---|---|---|---|---|---|---|
| V1 | Pedir 2 o 3 días de vacaciones | Empleado | App | Muestra saldo y queda con la Analista | Sí | La solicitud muestra el saldo disponible y pasa al flujo de aprobación. |
| V2 | Pedir más días de los que tiene | Empleado | Web | Muestra error de saldo | Sí | El sistema impidió solicitar más días de los disponibles. |
| V3 | Aprobar las vacaciones de V1 | Analista | Web | Pasa al Gerente | Sí | La solicitud pasó correctamente al Gerente. |
| V4 | Aprobar las mismas vacaciones | Gerente | Web | Pasa al Jefe inmediato | Sí | La solicitud pasó correctamente al Jefe inmediato. |
| V5 | Firma final de las vacaciones | Jefe inmediato | App | Queda Aprobada | Sí | La aprobación final deja la solicitud como Aprobada. |
| V6 | Revisar el saldo | Empleado | App | El saldo bajó los días aprobados | Sí | El saldo se actualiza después de la aprobación de las vacaciones. |

## Constancias

| # | Prueba | Cuenta | Dónde | Resultado esperado | ¿Pasó? | Observaciones |
|---|---|---|---|---|---|---|
| C1 | Pedir constancia laboral | Empleado | App | Queda Pendiente | Sí | La solicitud de constancia queda registrada como pendiente. |
| C2 | Autorizar la constancia de C1 | RRHH | Web | Queda Aprobada con código GC-… | Sí | RRHH autoriza correctamente la solicitud y se genera el código correspondiente. |
| C3 | Generar el PDF | RRHH | Web | Se descarga el PDF con QR | Sí | El PDF se genera y descarga correctamente con código QR. |
| C4 | Ver la constancia aprobada | Empleado | App | Sale antigüedad, fecha y quién autorizó | Sí | La constancia aprobada muestra la información correspondiente. |
| C5 | Pedir constancia salarial y rechazarla con observación | Empleado y RRHH | Web | Queda Rechazada con la observación | Sí | La solicitud queda rechazada y muestra la observación registrada. |

## Reportes, dashboard y perfil

| # | Prueba | Cuenta | Dónde | Resultado esperado | ¿Pasó? | Observaciones |
|---|---|---|---|---|---|---|
| R1 | Ver Reportes con gráfica | Gerente | Web | Gráfica y tabla con datos reales | Sí | El reporte muestra la gráfica y los datos reales del sistema. |
| R2 | Exportar CSV | Gerente | Web | Se descarga el CSV | Sí | El archivo CSV se descarga correctamente. |
| R3 | Ver Dashboard | Gerente | Web | Números reales (no 248 empleados) | Sí | El Dashboard muestra números reales del sistema. |
| R4 | Ver Reportes | RRHH | App | Gráfica por departamento | Sí | El reporte muestra la información agrupada por departamento. |
| F1 | Subir foto de perfil | Cualquiera | Web | Se ve la foto en la web y en la app | Sí | La foto de perfil se actualiza correctamente. |
| N1 | Ver notificación de una solicitud nueva | Jefe inmediato | Web (campana) | Aparece la notificación | Sí | La notificación aparece correctamente en la campana. |
| T1 | Abrir el Panel de IT | AdminTI | Web | Muestra la lista de usuarios | Sí | El Panel de IT muestra correctamente la lista de usuarios. |

## API REST y sincronización

| # | Prueba | Cuenta | Dónde | Resultado esperado | ¿Pasó? | Observaciones |
|---|---|---|---|---|---|---|
| A1 | Abrir /integracion-api | Gerente | Web | Muestra las solicitudes reales | Sí | La ruta `/integracion-api` muestra las solicitudes reales. |
| A2 | Abrir /integracion-api | Empleado | Web | Error 403 | Sí | El usuario Empleado recibe correctamente el error 403. |
| S1 | Crear una solicitud en la app con la web abierta | Empleado y Gerente | App y web | Aparece en la web sin recargar | Sí | La información se sincroniza correctamente entre la aplicación y la web. |

## Resumen

- **Pruebas realizadas:** 30
- **Pruebas que pasaron:** 30
- **Errores encontrados:** Ninguno crítico; el comportamiento observado fue el esperado en las pruebas realizadas.