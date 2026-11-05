# Plan técnico: mapa de calor de estudio

## Alcance y estado
Este documento planifica RF-1 a RF-6 de la spec; no implementa la funcionalidad. Las decisiones pendientes al final bloquean la implementación afectada, conforme a la constitución. Cualquier archivo adicional propuesto requiere autorización antes de crearlo.

## Archivos y responsabilidades
- **Modificar `index.html`**: sección del mapa, leyenda, información del día y mensajes de estado accesibles; cargar la lógica antes de la interfaz con scripts clásicos. RF-1, RF-3, RF-4, RF-6.
- **Modificar `styles.css`**: cuadrícula de 12 columnas por siete días, niveles distinguibles, estado incompleto, foco visible y adaptación móvil. RF-1, RF-3, RF-4, RF-6.
- **Crear `heat-map.js`**: cálculos puros del período, validación y agregación; nombres en inglés, sin acceso al DOM, almacenamiento ni reloj. RF-1 a RF-3 y RF-6.
- **Modificar `app.js`**: lectura segura sin pérdida de valores originales, integración del cálculo y pintura, consultas y actualización tras guardar. Mantener la compatibilidad y comportamiento existente para datos válidos. RF-1 a RF-6.
- **Crear `tests/heat-map.test.js`**: pruebas de la lógica pura con el ejecutor integrado de Node, sin paquetes. RF-1 a RF-3 y RF-6; verificar RF-4 y RF-5 en navegador.
- **Modificar `MEMORY.md` al implementar**: resumir resultado y decisiones verificadas. RF-1 a RF-6.
- **`spec.md`**: solo modificar tras resolver y aprobar las decisiones pendientes; no cambiar requisitos unilateralmente.

## Funciones puras propuestas
Entradas explícitas y salida nueva, sin modificar sesiones. El orquestador recibe `today` como texto local AAAA-MM-DD y lo transmite a las funciones que dependen de la fecha; las funciones que no dependen de hoy no lo necesitan. RF-1, RF-2, RF-3, RF-6.

| Función | Responsabilidad | RF |
|---|---|---|
| `buildHeatMap(sessions, today)` | Orquestar validación, período y agregación; devolver días ordenados y aviso global. | 1, 2, 3, 6 |
| `buildDays(today)` | Crear 84 fechas locales consecutivas, desde hoy menos 83 días hasta hoy. | 1 |
| `isValidDate(date)` | Comprobar formato y existencia real de la fecha sin convertir desde texto como UTC. | 2, 6 |
| `classifyMinutes(minutes)` | Clasificar totales completos en 0, 1–29, 30–59, 60–119 o 120+. | 3 |
| `aggregateDays(sessions, days)` | Validar cada registro disponible, sumar por fecha y señalar totales incompletos y aviso global. | 2, 6 |

La obtención de la fecha local actual y la lectura de datos son responsabilidades de la interfaz, no de estas funciones. Aprovechar la lógica existente de fechas cuando sea posible, extrayendo o adaptando únicamente lo necesario para que el cálculo sea puro. No cambiar el comportamiento de las estadísticas existentes sin pruebas de regresión.

## Algoritmo del mapa — pseudocódigo
RF-1, RF-2, RF-3, RF-6:

1. Recibir la fecha local de hoy y las sesiones sin pérdida de campos ni tipos originales; si la lectura de la colección falla, devolver estado de error sin sustituirla por una lista vacía.
2. Construir 84 días locales desde hoy menos 83 hasta hoy, cada uno con suma cero y estado completo. Usar componentes locales y desplazamientos de días de calendario, no UTC ni duraciones fijas.
3. Recorrer todas las sesiones disponibles, también las externas al período. Interpretar los campos anteriores admitidos sin convertir minutos de texto ni alterar los datos originales.
4. Si la fecha es inválida, activar el aviso general y no asignar el registro a un día.
5. Si los minutos son inválidos, activar el aviso general; si la fecha válida está dentro del período, marcar ese día como incompleto. No sumar el registro.
6. Si el registro es válido y su fecha está dentro del período, sumar sus minutos al día; ignorar los registros válidos fuera del período, incluidos los futuros.
7. Para cada día completo, asignar su nivel según los cinco intervalos; para cada día incompleto, conservar su estado diferenciado, sin mostrar cero como total confirmado.
8. Entregar días en orden cronológico, sus totales o estado incompleto y un único indicador de aviso. Si el cálculo falla, comunicar error sin modificar las sesiones.

## Interfaz y comportamiento
- Representar 84 controles de día en orden cronológico, agrupados de siete en siete en 12 columnas; identificar el día de la semana de cada fila según las fechas reales, no suponer que la primera columna empieza en lunes. RF-1.
- Añadir leyenda con los cinco intervalos; además de intensidad, usar señales distinguibles sin depender del color. Diferenciar el estado incompleto y explicar su significado. RF-3, RF-4, RF-6.
- Cada control tendrá nombre accesible en español con fecha completa y minutos o «total incompleto». Mostrar la misma información al señalar, enfocar o pulsar; conservarla hasta cambiar de día, retirar el foco o cerrar la consulta. Usar controles accesibles con teclado y pantalla táctil. RF-4.
- Una región de estado mostrará un único aviso si hay registros inválidos. Ante fallo de lectura o recálculo mostrar error, sin presentar un mapa de ceros como datos reales. RF-6, RF-5.
- Recalcular al abrir, recargar y después de guardar una sesión, usando la fecha local del momento; no vigilar cambios externos ni programar actualización a medianoche. RF-5.
- A 375 px comprobar que los 84 días y la leyenda sean accesibles sin perder información, con foco visible y lectura con tecnología asistida. RF-1, RF-3, RF-4.

## Decisiones técnicas y alternativas
- **Lógica en un script clásico separado:** permite probar cálculos sin DOM y abrir la página directamente. Alternativa descartada: módulos ES o servidor, incompatibles con la apertura directa. RF-1 a RF-3 y RF-6.
- **Exportación condicional para Node del mismo script:** una única implementación de la lógica para navegador y pruebas, sin dependencias. Alternativa descartada: duplicar cálculos en los tests, por riesgo de divergencia. RF-1 a RF-3 y RF-6.
- **Cálculo por componentes locales y días de calendario:** respeta cambios de hora y fecha local; reutilizar la función existente de desplazamiento si se puede hacer disponible sin duplicación. Alternativa descartada: analizar fechas como UTC o sumar milisegundos fijos. RF-1, RF-2.
- **Lectura con resultado explícito de éxito o error y valores originales:** permite distinguir cero sesiones de datos ilegibles y detectar valores inválidos. Alternativa descartada: usar directamente `obtenerSesiones()` sin cambios, pues convierte algunos valores a cero, descarta información y trata colecciones no válidas como vacías. RF-2, RF-6.
- **Mantener prioridad actual de claves y compatibilidad con campos antiguos:** evita migraciones inesperadas o datos duplicados. Alternativa descartada: fusionar automáticamente ambas claves, lo que cambiaría el comportamiento actual. RF-2, RF-6.
- **Controles de día accesibles y detalle textual:** permiten ratón, teclado, tacto y lectura sin color. Alternativa descartada: depender solo de colores o de un tooltip de ratón. RF-3, RF-4.

## Estrategia de pruebas
- Ejecutar `node --test` sin instalar paquetes y no avanzar si falla. Las pruebas verificarán resultados definidos por la spec, no detalles de implementación.
- **RF-1:** exactamente 84 fechas únicas y ordenadas; límites incluidos; cambio de mes y año, 29 de febrero y cambios de hora; fechas locales cerca de las 00:30 y zonas horarias distintas.
- **RF-2 y RF-3:** cero, suma de varias sesiones y duplicados; límites 0, 1, 29, 30, 59, 60, 119 y 120; sesiones válidas antes del período y futuras; conservación de entrada.
- **RF-6:** fecha inexistente, ausente o mal formada; minutos cero, negativos, decimales, nulos o texto; registros inválidos dentro y fuera del período; día con sesiones válidas e inválidas; aviso único y total incompleto; compatibilidad con registros anteriores. Comprobar errores de lectura y que no se reescriben datos mediante pruebas de integración o navegador.
- **RF-4 y RF-5:** en Chrome DevTools, abrir con doble clic o `file://`, registrar sesiones y comprobar actualización sin recargar; consultar días con ratón, teclado y tacto; revisar nombres accesibles, leyenda, estado incompleto y errores. Probar a 375 px, revisar consola y comprobar persistencia tras recarga en un contexto aislado.
- **Regresión:** racha actual, mejor racha, minutos semanales y días mensuales sin cambios para datos válidos; almacenamiento y compatibilidad anteriores intactos.

## Decisiones aprobadas
- Las sumas numéricamente inseguras producen un día incompleto sin borrar sesiones.
- Si la lectura o escritura falla, no se guarda y se muestra un error.
- Un día incompleto muestra su estado sin suma parcial ni nivel de intensidad.
