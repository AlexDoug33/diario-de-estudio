# Diario de Estudio

Diario de Estudio es una aplicación web sencilla y didáctica para registrar el tiempo dedicado a estudiar y observar la constancia. También es un proyecto para aprender **desarrollo guiado por especificaciones** (SDD, *Spec-Driven Development*): primero se acuerda qué debe hacer una funcionalidad y después se planifica, implementa y comprueba.

## Qué permite hacer

- Registrar sesiones con fecha, tema y minutos, y consultar la lista de sesiones.
- Ver la racha actual, la mejor racha, los minutos de la semana y los días de estudio del mes.
- Consultar un mapa de calor de los últimos 84 días, incluido hoy. Cada casilla muestra la intensidad del estudio y permite consultar el detalle del día.
- Establecer, cambiar o eliminar un objetivo semanal de minutos y ver el progreso cuando el total puede calcularse.
- Recibir avisos si algunos datos no se pueden interpretar o guardar, sin presentar un total incompleto como definitivo.

## Cómo abrirlo

1. Descarga o copia los archivos del proyecto en una misma carpeta.
2. Abre `index.html` con doble clic en tu navegador.
3. Introduce una fecha, un tema y minutos en «Nueva sesión» y guarda. Si quieres, añade un objetivo semanal.

Para usar la aplicación no hace falta instalar paquetes, ejecutar un servidor ni compilar nada. Está hecha con HTML, CSS y JavaScript puros y se abre directamente mediante `file://`.

## Dónde se guardan los datos

Las sesiones y el objetivo se guardan en el **almacenamiento local del navegador** (`localStorage`), en el dispositivo; la aplicación no los sincroniza entre dispositivos. Las sesiones usan la clave `diario-estudio-sesiones`, con registros como `{ date: "AAAA-MM-DD", topic, minutes }`; el objetivo usa la clave independiente `diario-estudio-objetivo-semanal`. Se mantiene la lectura de datos anteriores admitidos.

Los datos dependen del navegador y su almacenamiento: otro navegador o dispositivo puede no verlos. Borrar los datos del navegador, usar navegación privada o cambiar la forma de abrir el archivo puede hacer que dejen de estar disponibles. Ten precaución antes de limpiar el almacenamiento: se pueden perder las sesiones y el objetivo.

## Fechas y estadísticas

- Las fechas se interpretan según el calendario local del usuario.
- La racha actual cuenta días consecutivos con sesión hasta hoy; si hoy no hay sesión pero ayer sí, se cuenta desde ayer. Varias sesiones del mismo día cuentan como un solo día.
- Las fechas futuras no cuentan para las rachas ni para el mapa. Sí cuentan para los minutos y el objetivo semanal si pertenecen a la semana natural actual, de lunes a domingo.
- Los días del mes son días distintos de estudio del mes local hasta hoy. Los cálculos pueden señalar datos inválidos o totales incompletos en lugar de asumir que son cero.

## Cómo trabajamos con SDD

SDD significa desarrollar a partir de una especificación acordada. En este proyecto seguimos, de forma resumida, este recorrido:

1. **Especificación:** describir el problema, el comportamiento esperado, sus requisitos y casos límite.
2. **Clarificación y aprobación:** resolver dudas y acordar la especificación antes de avanzar.
3. **Plan y tareas:** decidir cómo implementar los requisitos y dividir el trabajo; revisar y aprobar el plan y las tareas antes de implementarlos.
4. **Implementación con pruebas:** realizar una tarea cada vez, escribiendo primero las pruebas de la lógica y después el código necesario para que pasen.
5. **Validación y corrección:** contrastar el resultado con la especificación, ejecutar las pruebas y comprobar la interfaz; corregir las desviaciones antes del cierre.

Los documentos de `specs/` conservan los requisitos, el plan y el estado de las tareas. Una tarea marcada como implementada no sustituye por sí sola las comprobaciones pendientes.

## Estado del proyecto

- **Mapa de calor:** implementado; las tareas están marcadas como completadas. Sigue pendiente la validación con lector de pantalla y pantalla táctil reales.
- **Objetivo semanal:** implementadas las tareas T1–T7 y aplicada una corrección de QA. Se realizaron una revisión independiente aprobada y un sensor independiente que detectó cinco mutaciones, con 38/38 pruebas base superadas. La **T8 permanece pendiente de cierre** y la spec no se presenta como cerrada. Las comprobaciones de lector de pantalla y pantalla táctil reales también están pendientes.

Consulta `MEMORY.md` y los archivos de tareas para conocer el estado y las limitaciones de verificación más recientes.

## Archivos principales

| Ruta | Contenido |
| --- | --- |
| `index.html` | Estructura de la página. |
| `styles.css` | Apariencia y adaptación a móvil. |
| `app.js` | Coordinación de la interfaz, almacenamiento y estadísticas. |
| `heat-map.js` | Cálculos del mapa de calor. |
| `weekly-goal.js` | Cálculos del objetivo y de la semana. |
| `tests/` | Pruebas automáticas con el ejecutor de Node. |
| `docs/constitution.md` | Principios del proyecto. |
| `AGENTS.md` y `MEMORY.md` | Reglas de trabajo y memoria del estado. |
| `specs/001-heat-map/` | Especificación, plan y tareas del mapa. |
| `specs/002-objetivo-semanal/` | Especificación, plan y tareas del objetivo semanal. |

Cada carpeta de `specs/` contiene `spec.md`, `plan.md` y `tasks.md`.

## Pruebas y contribución

Si tienes Node.js disponible, ejecuta desde la carpeta del proyecto:

```sh
node --test
```

No hace falta instalar dependencias para las pruebas. Node.js no es necesario para abrir la aplicación. Para cambios de interfaz o comportamiento, comprueba también el funcionamiento en el navegador, la consola y la vista móvil; una emulación no reemplaza las pruebas con lector de pantalla o pantalla táctil reales.

Antes de contribuir, lee `AGENTS.md`, `MEMORY.md`, `docs/constitution.md` y la spec correspondiente. Trabaja sobre requisitos y tareas aprobados, conserva la compatibilidad de los datos y evita sobrescribir registros que no puedas interpretar. Al tratar fechas, usa componentes y días locales: evita `toISOString()` y `new Date("AAAA-MM-DD")`, que pueden desplazar el día por UTC. No añadas dependencias ni pasos de compilación; pregunta antes de crear archivos o cambiar el formato de los datos guardados.
