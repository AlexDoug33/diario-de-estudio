# Tareas: objetivo semanal

Secuencia dependiente: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8. En cada tarea escribir primero las pruebas del comportamiento, ejecutar `node --test` y no avanzar con pruebas en rojo; actualizar `MEMORY.md` al terminar durante la ejecución. El usuario aprobó el plan y las tareas, autorizó crear `weekly-goal.js` y `tests/weekly-goal.test.js` y autorizó avanzar tras T1, completada con 15 tests en verde.

## Test Coverage Matrix

Fuentes: `docs/constitution.md`, `AGENTS.md`, `spec.md`, `plan.md` y `tests/heat-map.test.js`.

| Capa | Tipo | Cobertura | Ubicación | Ejecución |
| --- | --- | --- | --- | --- |
| Cálculos y validación | Unitaria | RF y casos límite de T1–T3 | `tests/weekly-goal.test.js` | `node --test` |
| Persistencia y coordinación | Integración | Estados, errores y conservación de T4–T7 | `tests/weekly-goal.test.js` | `node --test` |
| Interfaz y regresión | Integración y navegador | Estados, accesibilidad y regresiones de T5–T8 | Pruebas y Chrome | `node --test` y Chrome |

## Gate Check Commands

| Puerta | Comando o comprobación |
| --- | --- |
| Automática | `node --test` |
| Navegador, cuando corresponda | Chrome con `file://`, consola, teclado y móvil según cada tarea |
| Cierre | Pruebas verdes y evidencia de revisión independiente de T8 |

## Execution Plan

```text
T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8
```

## Task Breakdown

### T1: Cálculo de semana local
**Estado:** completada.
**RF:** RF-6, RF-7, RF-12, RF-21, RF-30.
Depends on: none
Tests: lunes/domingo, futuro en semana, fuera de semana, cero y sesiones múltiples; cambios de mes, año, bisiesto, zona horaria y hora.
Gate: `node --test`.
**Hecho cuando:** las funciones puras reciben `today`, los límites y totales probados coinciden con la spec y no alteran sesiones.

### T2: Datos semanales inválidos
**Estado:** completada.
**RF:** RF-10, RF-11, RF-13–RF-15, RF-40.
Depends on: T1
Tests: formato antiguo y actual, `minutes: 0` frente a `minutos`, texto, negativos, fracciones, fechas inválidas y suma insegura; datos originales intactos.
Gate: `node --test`.
**Hecho cuando:** total incompleto y avisos se calculan sin ocultar datos defectuosos ni alterar rachas y mapa.

### T3: Objetivo exacto y proporción
**Estado:** completada.
**RF:** RF-1, RF-2, RF-8, RF-9, RF-22, RF-23, RF-33–RF-36, RF-41, RF-42, RF-44.
Depends on: T2
Tests: `00025` se acepta y se presenta como `25`, también tras recuperar el objetivo; espacios habituales, tabulaciones y saltos de línea en ambos extremos se eliminan, pero entre dígitos se rechazan; solo ceros, signos, decimal y exponente se rechazan; enteros enormes exactos y barras 0/50/100/superación.
Gate: `node --test`.
**Hecho cuando:** validación y progreso puros producen los resultados exigidos sin pérdida de precisión del objetivo y la presentación elimina los ceros iniciales.
**Corrección de QA:** el control conserva saltos de línea para rechazarlos entre dígitos y admitirlos en los extremos; 38 tests Node y comprobación de formulario real en Chrome aislado, con recarga y móvil emulado de 375 px.

### T4: Persistencia y errores aislados
**Estado:** completada.
**RF:** RF-3–RF-5, RF-11, RF-16, RF-17, RF-20, RF-26–RF-29, RF-31, RF-37.
Depends on: T3
Tests: almacenamiento ausente, válido, corrupto e inaccesible; fallos de lectura/escritura/eliminación, recuperación explícita, errores simultáneos y bytes de sesiones intactos.
Gate: `node --test`.
**Hecho cuando:** los estados se distinguen, los fallos no parecen éxito y no se sobrescriben datos automáticamente.

### T5: Interfaz y renderizado
**Estado:** completada.
**RF:** RF-7–RF-10, RF-16–RF-18, RF-23–RF-25, RF-30, RF-32, RF-37, RF-38, RF-41, RF-42, RF-44.
Depends on: T4
Tests: estados sin objetivo, válido, incompleto e inaccesible; avisos simultáneos, barra previa oculta, texto exacto, `00025` mostrado como `25` y acciones sin recarga.
Gate: `node --test` y Chrome con `file://`, consola, teclado y móvil.
**Hecho cuando:** la vista refleja los estados y es usable sin depender solo del color; registrar límites de comprobación de lector y táctil.
**Verificación:** 32 tests Node en verde; Chrome `file://` aislado, objetivo con teclado, sesión y progreso, consola limpia y móvil emulado de 375 px. Sin lector de pantalla ni pantalla táctil físicos.

### T6: Actualización por fecha local
**Estado:** completada.
**RF:** RF-18, RF-19, RF-39, RF-43.
Depends on: T5
Tests: reloj simulado para cambio de día y semana mientras la página puede ejecutarse, con actualización en un minuto; suspensión y reactivación sin recarga, sin temporizadores duplicados.
Gate: `node --test` y comprobación Chrome viable de cambio de fecha y reactivación.
**Hecho cuando:** la información semanal se recalcula sin recarga dentro del plazo aplicable y al reactivar tras suspensión; se documenta la evidencia y cualquier limitación de la comprobación en navegador.
**Verificación:** 34 tests Node en verde; Chrome `file://` aislado con fecha y temporizador simulados: cambio de semana 50→20 minutos y reactivación `pageshow` 20→0, progreso actualizado, un temporizador de 60 segundos, consola limpia y vista móvil de 375 px. No se suspendió realmente el navegador ni se esperó al cambio real de fecha.

### T7: Regresión y compatibilidad
**Estado:** completada.
**RF:** RF-6, RF-7, RF-11, RF-12, RF-19–RF-21, RF-29, RF-40.
Depends on: T6
Tests: formatos y claves existentes, sesiones futuras solo para semana, racha y mapa sin cambios, apertura y recarga.
Gate: `node --test` y Chrome, consola y móvil.
**Hecho cuando:** pasan las regresiones y se demuestra conservación de sesiones y funcionamiento local.
**Verificación:** 37 tests Node en verde y validador de tareas sin errores ni avisos; Chrome `file://` aislado, clave antigua y formatos mixtos: 35 minutos semanales incluyendo 20 futuros, racha 1 y mapa de 84 días hasta hoy, datos y objetivo conservados tras recarga, consola limpia y móvil emulado de 375 px. No se probaron lector de pantalla ni táctil físicos.

### T8: Verificación independiente y cierre
**RF:** RF-1–RF-44.
Depends on: T7
Tests: verificación independiente de cada RF contra la spec y pruebas discriminantes aisladas; `node --test`.
Gate: pruebas verdes, evidencia de Chrome, consola y móvil y revisión independiente sin fallos.
**Hecho cuando:** se registra evidencia, se resuelven desviaciones y `MEMORY.md` refleja el estado y las decisiones sin datos sensibles.
