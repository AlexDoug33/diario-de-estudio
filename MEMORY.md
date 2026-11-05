# MEMORY.md — Diario de Estudio 

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no 
aporte. 

## Estado actual
- Proyecto publicado en un repositorio Git; rama principal `master`.
- Registrar sesiones (fecha, tema, minutos), racha actual, mejor racha,
minutos de la semana, días de estudio del mes y lista de sesiones.
- Datos en localStorage, clave `diario-estudio-sesiones`, formato `{ date, topic, minutes }`. 
- Fallo resuelto: al cambiar clave/formato, las sesiones previas quedaron invisibles; se 
añadió fallback a la clave antigua y migración de formato. 

## Decisiones (y por qué) 
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic. 
- Principios aprobados del proyecto en `docs/constitution.md`.
- RF-12 implementado: las fechas futuras de la semana natural cuentan para el objetivo y total semanal, no para rachas ni mapa.
- Mapa de calor de 84 días implementado; spec, plan y tareas en `specs/001-heat-map/`.
- Chrome a 375 px: comprobados guardado, 84 días, foco, pulsación emulada, árbol de accesibilidad y protección ante datos ilegibles; faltan lector de pantalla y pantalla táctil reales.
- T3 marcada como implementada a petición del usuario; la validación real de accesibilidad sigue pendiente.
- Corregida la lista: las sesiones con minutos en texto siguen visibles sin cambiar los datos; el mapa señala el total incompleto. 11 tests Node pasan.
- Los días con minutos inválidos o sumas inseguras se marcan incompletos; no se sobrescriben datos ilegibles al guardar.
- Diseño inspirado en un cuaderno, con tipografías locales y adaptación a móvil.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer. 
- La racha se recalcula siempre desde las sesiones guardadas (hoy o ayer si hoy no hay). 
- Actualmente solo se incluyen en las rachas sesiones con fecha válida y minutos numéricos finitos; minutos en texto quedan fuera.
- La estadística semanal usa la semana local natural de lunes a domingo.
- Spec 002, T1 completada: cálculo puro de semana local lunes–domingo en `weekly-goal.js`, con sesiones futuras de esa semana y fecha inyectada.
- Spec 002, T2 completada: formatos antiguos, minutos inválidos, fechas inválidas y sumas inseguras, sin modificar las sesiones. 19 tests Node pasan.
- `calculateWeeklyTotal` devuelve un número sin incidencias; con incidencias devuelve `{ total, incomplete, hasInvalidDate }`, con `total: null` si es incompleto.
- Spec 002, T3 completada: `parseGoal` devuelve cadena decimal normalizada o `null`; `calculateProgress` devuelve proporción visual entre 0 y 1, con comparación exacta mediante `BigInt`. 24 tests Node pasan. La proporción numérica tiene precisión finita; objetivos extremos pueden dar cero visual.
- Spec 002, T4 completada: persistencia del objetivo en `diario-estudio-objetivo-semanal` como cadena decimal normalizada; estados y errores de sesiones y objetivo independientes, sin alterar sesiones.
- Spec 002, T5 completada: interfaz de objetivo y progreso conectada, avisos independientes y semana natural. 32 tests Node pasan; Chrome local y móvil emulado comprobados; lector y táctil reales pendientes.
- Spec 002, T6 completada: un reloj comprueba la fecha local cada minuto y se recalcula al reactivar (visibilidad, resume, pageshow y foco). 34 tests pasan; Chrome comprobado con reloj y reactivación simulados, no suspensión real.
- Spec 002, T7 completada: 37 tests pasan; regresión de claves y formatos, futuro en semana sin afectar racha/mapa y conservación al recuperar objetivo corrupto. Chrome local aislado, recarga y móvil emulado verificados.
- Corrección QA de T3: `textarea` conserva saltos internos para validarlos sin modificar la entrada; espacios y saltos extremos siguen admitidos. 38 tests pasan; Chrome aislado `file://`, recarga y móvil emulado verificados.
- El mes es el mes natural local hasta hoy: se cuentan días distintos y no fechas futuras.

## Aprendizajes y errores a evitar 
- Cambiar clave/formato de localStorage sin migración rompe la lectura de datos viejos. 
- La lógica de racha (conexión consecutiva, hoy/ayer, futuro no cuenta) quedó verificada 
con tests en Node. 
- En Chrome, tres sesiones consecutivas entre octubre y noviembre dieron racha y mejor racha 3; consola sin errores. En móvil se observó «1 días de estudio» (singular pendiente).

## Próximos pasos 
- Spec 002, T8 completada: revisión independiente posterior aprobada, 43/43 pruebas; sensor anterior detectó cinco mutaciones de cinco. Informe y trazabilidad en `specs/002-objetivo-semanal/validacion.md`.
- Chrome no disponible en la revisión actual; se conserva evidencia histórica. No se probaron suspensión, lector de pantalla ni táctil reales; los canales simulados no demuestran ausencia global de tráfico.
- Existen cambios previos ajenos a T8 que deben conservarse.
- `opencode.json` se dejó vacío intencionadamente por decisión del usuario.
- README en español documenta el uso y SDD.
