# Plan: objetivo semanal

Base: `spec.md`, aprobada por el usuario según la comunicación del coordinador. Este plan no autoriza por sí mismo implementación.

## Archivos previstos

- `weekly-goal.js` (nuevo): cálculos puros compartidos mediante script clásico y exportación condicional para Node, como `heat-map.js`.
- `tests/weekly-goal.test.js` (nuevo): pruebas unitarias y de integración con `node --test` y dobles de navegador/almacenamiento sin dependencias.
- `app.js`: persistencia aislada del objetivo, coordinación de lectura, escritura, presentación y reloj; mantener las rutas existentes de racha, mapa y sesiones.
- `index.html`, `styles.css`: formulario, mensajes y barra accesible y adaptable.
- `MEMORY.md`: actualizar en ejecución tras cada tarea, sin datos sensibles; no se modifica en esta fase de planificación.

El usuario autorizó la creación de `weekly-goal.js` y `tests/weekly-goal.test.js`. No cambiar el formato ni la clave de las sesiones: nueva clave independiente para el objetivo, sin migración destructiva. **RF-1–RF-5, RF-11, RF-20, RF-27–RF-29.**

## Funciones y límites

- `getWeekBounds(today)` calcula lunes y domingo con fecha local y `setDate`, sin UTC ni sumar milisegundos por día. `calculateWeeklyTotal(sessions, today)` recibe datos originales y fecha local inyectada; devuelve total completo o incompleto y aviso por fecha inválida. El campo `minutes` presente tiene prioridad sobre `minutos`; se admite fecha y formato antiguo existentes sin modificar los registros. **RF-6, RF-7, RF-10–RF-15, RF-21, RF-30, RF-40.**
- `parseGoal(input)` valida texto tras quitar exclusivamente espacios habituales, tabulaciones y saltos de línea extremos; rechaza caracteres internos no admitidos y conserva el valor exacto del entero positivo sin conversión a `Number`. La presentación elimina ceros iniciales sin alterar el valor; `calculateProgress(minutes, goal, today)` calcula una proporción visual acotada comparando enteros exactos. Inyectar `today` donde corresponda a cálculos temporales; estas funciones no temporales no consultan reloj. La proporción para objetivos enormes debe evitar desbordamiento y aproximaciones que conviertan el objetivo en infinito o lo muestren incorrectamente. **RF-1, RF-2, RF-8, RF-9, RF-22, RF-23, RF-33–RF-36, RF-41, RF-42, RF-44.**
- En `app.js`, lectura de sesiones y objetivo independientes, estados explícitos para ausente, válido, corrupto e inaccesible; errores simultáneos no se ocultan mutuamente y nunca se conserva una barra inválida. Guardar/eliminar únicamente por acción explícita, capturando errores y sin sobrescritura automática. **RF-3–RF-5, RF-16–RF-19, RF-24–RF-29, RF-31, RF-32, RF-37, RF-38.**
- Un único reloj de comprobación de fecha local recalcula al detectar cambio dentro de un minuto mientras la página pueda ejecutarse; al reactivarse tras una suspensión se recalcula sin recargar. Se cubren los eventos pertinentes de reactivación, no solo la vuelta a primer plano. **RF-18, RF-19, RF-39, RF-43.**

## Decisiones y alternativas

1. Cadena decimal para el objetivo y aritmética entera exacta para comparaciones/proporción; descartado `Number` para el objetivo por pérdida de precisión. El tamaño físico disponible puede limitar almacenamiento: informar errores sin presentar éxito, no imponer máximo de producto. **RF-17, RF-22, RF-23.**
2. Clave de objetivo separada; descartado añadir campos al array de sesiones por compatibilidad y riesgo de pérdida. **RF-11, RF-20, RF-29.**
3. Calcular la semana desde datos originales, no desde el filtrado actual de racha: este descarta valores inválidos y `obtenerSesiones` usa `||`, ocultando `minutes: 0`. No cambiar el comportamiento de racha ni mapa. **RF-10–RF-15, RF-40.**
4. Barra semántica accesible con valor limitado y texto exacto independiente; descartado representar el valor enorme como número de la barra. **RF-8, RF-9, RF-23, RF-25, RF-38, RF-41, RF-42.**

## Estrategia de verificación

Pruebas antes de cada implementación y `node --test` como puerta al finalizar cada tarea; no avanzar en rojo. Cubrir lunes/domingo, futuro de la semana y exclusión de la siguiente, zonas horarias, 00:30, cambios de hora, mes, año y bisiesto; varias sesiones, legado, fecha inválida, texto, cero, `minutes` presente, suma insegura y datos intactos. Cubrir objetivo enorme exacto, `00025` mostrado como `25`, espacios habituales, tabulaciones y saltos de línea en extremos y rechazo de estos caracteres entre dígitos, validación, persistencia y fallos, 0/50/100/superación, errores simultáneos, reloj simulado dentro del minuto mientras se ejecuta y reactivación tras suspensión sin recarga. Comprobar con Chrome `file://`, guardado, recarga, errores, consola, teclado y móvil; no afirmar comprobación real de lector o táctil si solo se emulan. Verificación independiente final frente a la spec y pruebas discriminantes aisladas, sin alterar datos reales.

## Bloqueos y revisión

- El usuario aprobó el plan y las tareas y autorizó explícitamente la creación de `weekly-goal.js` y `tests/weekly-goal.test.js`. T1 está completada, con 15 tests en verde; el usuario autorizó avanzar.
