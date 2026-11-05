# Especificación: objetivo semanal de estudio

**Estado: aprobado**

## Problema y objetivo

Las personas que estudian pueden consultar sus minutos, pero no compararlos con una meta semanal propia. El objetivo es permitirles fijar una meta y reconocer su avance para motivarse a cumplirla.

## Alcance

El objetivo y la estadística existente «Esta semana» emplean la semana natural local, de lunes a domingo. Se conservan las sesiones existentes y la compatibilidad con los datos previamente admitidos.

## Historias de usuario

- **P1:** Como estudiante, quiero fijar, cambiar o eliminar mi objetivo de minutos para adaptarlo a mis necesidades.
- **P1:** Como estudiante, quiero comparar mis minutos de la semana con mi objetivo para reconocer mi progreso.

## Requisitos funcionales

- **RF-1. Establecer:** Cuando la persona fije un objetivo expresado en minutos enteros positivos, el sistema deberá guardarlo. No se impone un máximo de producto.
- **RF-2. Validación:** Si el valor introducido no es un número entero positivo de minutos, el sistema deberá impedir que se establezca como objetivo.
- **RF-3. Persistencia:** Mientras no se cambie o elimine el objetivo, el sistema deberá conservarlo al abrir de nuevo el diario y durante las semanas siguientes.
- **RF-4. Cambio:** Cuando la persona cambie el objetivo por otro valor válido, el sistema deberá utilizar el nuevo objetivo.
- **RF-5. Eliminación:** Cuando la persona elimine el objetivo, el sistema deberá dejar de considerarlo establecido.
- **RF-6. Semana natural:** Cuando el sistema calcule los minutos semanales, deberá incluir las sesiones desde el lunes hasta el domingo de la semana local en curso.
- **RF-7. Estadística existente:** Cuando se muestre «Esta semana», el sistema deberá emplear los minutos de la semana natural en curso en lugar de los últimos siete días.
- **RF-8. Progreso:** Mientras exista un objetivo y el total semanal sea completo, el sistema deberá mostrar los minutos conseguidos frente a los minutos del objetivo y una barra de progreso.
- **RF-9. Objetivo superado:** Cuando los minutos conseguidos superen el objetivo y el total sea completo, el sistema deberá mostrar la barra llena y los minutos reales conseguidos.
- **RF-10. Total incompleto:** Si una sesión de la semana tiene minutos que no se pueden interpretar, el sistema deberá indicar «total incompleto» en vez de presentar una cifra semanal definitiva.
- **RF-11. Conservación:** El sistema deberá conservar las sesiones existentes y mantener la compatibilidad con las sesiones previamente admitidas.
- **RF-12. Fechas futuras de la semana:** Cuando una sesión tenga una fecha futura comprendida entre el lunes y el domingo de la semana local en curso, el sistema deberá incluirla en el cálculo semanal. Esta regla no modifica las rachas ni el mapa de calor.
- **RF-13. Minutos interpretables:** Cuando se calcule el total semanal, el sistema deberá considerar interpretables únicamente los minutos numéricos enteros positivos representables con precisión entera segura; los minutos expresados como texto no se convertirán.
- **RF-14. Suma insegura:** Si la suma semanal no puede representarse con precisión entera segura, el sistema deberá indicar «total incompleto» en vez de presentar una cifra definitiva.
- **RF-15. Fechas inválidas:** Si una sesión tiene una fecha inválida, el sistema deberá excluirla del cálculo semanal y advertir de datos que no se han podido interpretar, sin asignarla a una semana ni modificarla.
- **RF-16. Fallo de lectura:** Si no se pueden leer las sesiones, el sistema deberá indicar que no puede calcularse el total semanal, sin presentarlo como cero ni modificar los datos guardados.
- **RF-17. Fallo de persistencia:** Si no se puede guardar, cambiar o eliminar el objetivo, el sistema deberá informar del error y no presentar la operación como completada.
- **RF-18. Actualización:** Cuando se guarde una sesión o se establezca, cambie o elimine correctamente el objetivo, el sistema deberá actualizar la información semanal sin recargar la página.
- **RF-19. Apertura:** Cuando se abra o recargue el diario, el sistema deberá calcular la semana a partir de la fecha local y las sesiones disponibles y recuperar el objetivo guardado.
- **RF-20. Privacidad:** El sistema no deberá enviar las sesiones ni el objetivo fuera del dispositivo.
- **RF-21. Suma semanal:** Cuando varias sesiones interpretables pertenezcan a la semana, el sistema deberá sumar los minutos de cada una, incluidas las registradas en la misma fecha.
- **RF-22. Precisión del objetivo:** Cuando la persona establezca o cambie un objetivo entero positivo, incluso si supera la precisión numérica segura, el sistema deberá admitirlo y conservar su valor exacto sin imponer un máximo de producto.
- **RF-23. Presentación exacta:** Mientras se muestre un objetivo establecido, el sistema deberá mostrar su valor exacto, también después de cerrar y volver a abrir el diario.
- **RF-24. Sin objetivo:** Mientras no exista un objetivo establecido, el sistema deberá mostrar «Aún no tienes un objetivo semanal» y ofrecer la opción de fijarlo.
- **RF-25. Barra con total incompleto:** Mientras el total semanal sea incompleto, el sistema deberá ocultar la barra de progreso y mostrar el aviso «Total incompleto».
- **RF-26. Objetivo guardado corrupto:** Si el objetivo guardado está corrupto o no se puede interpretar, el sistema deberá mostrar un error y no presentarlo como ausencia de objetivo.
- **RF-27. Conservación del objetivo corrupto:** Si el objetivo guardado está corrupto o no se puede interpretar, el sistema no deberá sobrescribirlo automáticamente.
- **RF-28. Recuperación explícita:** Mientras el objetivo guardado esté corrupto o no se pueda interpretar, el sistema deberá permitir sustituirlo por un objetivo válido o eliminarlo únicamente mediante una acción explícita de la persona usuaria.
- **RF-29. Protección de sesiones:** Cuando la persona sustituya o elimine un objetivo corrupto, el sistema no deberá modificar ni eliminar las sesiones guardadas.
- **RF-30. Semana sin sesiones:** Cuando no haya sesiones atribuibles a la semana y el total sea completo, el sistema deberá mostrar cero minutos semanales.
- **RF-31. Fallo de lectura del objetivo:** Si no se puede acceder al objetivo guardado, el sistema deberá mostrar un error y no presentar el fallo como ausencia de objetivo.
- **RF-32. Barra anterior:** Si el total semanal pasa a ser incompleto, el sistema deberá dejar de mostrar cualquier barra de progreso previa.
- **RF-33. Formato de entrada:** Cuando la persona introduzca el objetivo, el sistema deberá aceptar una secuencia de dígitos del 0 al 9 que represente un entero positivo, incluidos los ceros iniciales.
- **RF-34. Formatos no admitidos:** Si la entrada del objetivo contiene signos, separadores decimales o notación exponencial, el sistema deberá rechazarla.
- **RF-35. Caracteres en los extremos:** Cuando la persona introduzca el objetivo, el sistema deberá eliminar los espacios habituales, las tabulaciones y los saltos de línea al principio y al final antes de validar la entrada.
- **RF-36. Espacios internos:** Si la entrada del objetivo contiene espacios entre los dígitos después de eliminar los caracteres indicados en RF-35 al principio y al final, el sistema deberá rechazarla.
- **RF-37. Avisos simultáneos:** Si coinciden un error del objetivo y un problema de las sesiones, el sistema deberá mostrar ambos avisos.
- **RF-38. Progreso no calculable:** Mientras el progreso no pueda calcularse con seguridad, el sistema deberá ocultar la barra de progreso, incluida cualquier barra mostrada previamente.
- **RF-39. Cambio de fecha:** Cuando cambie la fecha local mientras el diario permanezca abierto y la página pueda ejecutarse, el sistema deberá actualizar automáticamente la información semanal, incluido el progreso, sin recargar la página y como máximo un minuto después del cambio.
- **RF-40. Precedencia de minutos:** Cuando una sesión contenga tanto `minutes` como `minutos` con valores distintos, el sistema deberá usar `minutes` por estar presente, incluso si su valor es cero.
- **RF-41. Proporción de la barra:** Mientras exista un objetivo y el total semanal sea completo e inferior a él, el sistema deberá mostrar la barra llena en la proporción de los minutos conseguidos respecto al objetivo.
- **RF-42. Objetivo alcanzado:** Cuando los minutos conseguidos sean iguales al objetivo y el total semanal sea completo, el sistema deberá mostrar la barra llena.
- **RF-43. Reactivación:** Cuando la página suspendida vuelva a activarse, el sistema deberá actualizar la información semanal, incluido el progreso, sin recargar la página.
- **RF-44. Ceros iniciales en la presentación:** Cuando se muestre un objetivo establecido introducido con ceros iniciales, el sistema deberá mostrar su valor sin dichos ceros.

## Requisitos no funcionales

- La información y los controles deben poder utilizarse en móvil y escritorio con teclado, pantalla táctil y lector de pantalla; el progreso no dependerá exclusivamente del color y los textos estarán en español.
- La funcionalidad conservará la apertura directa del diario y no añadirá dependencias ni pasos de compilación.
- Las pruebas de cálculo pasarán con `node --test`; la comprobación en navegador abarcará funcionalidad, consola y vista móvil.

## Casos límite

- El lunes comienza una nueva semana natural y el domingo sigue perteneciendo a esa semana; los cambios de mes y año no alteran esta regla.
- Las sesiones de semanas anteriores no forman parte del total de la semana en curso.
- Con 50 minutos conseguidos y un objetivo de 100 minutos, se muestra la barra llena hasta la mitad.
- Si los minutos semanales son iguales al objetivo, se muestra la barra llena.
- Si hay sesiones interpretables y no interpretables en la misma semana, el total se indica como incompleto, no como una cifra definitiva.
- La eliminación del objetivo no elimina las sesiones de estudio.
- Una sesión futura del domingo cuenta si pertenece a la semana actual; una sesión del lunes siguiente no cuenta.
- Los cambios de año, día bisiesto y hora se interpretan según las fechas locales.
- Los minutos no interpretables, incluidos texto, fracciones, cero y valores negativos, no se presentan como un total semanal completo.
- Un objetivo entero positivo superior a la precisión numérica segura se admite y conserva exactamente.
- Sin objetivo, se muestra «Aún no tienes un objetivo semanal» y la opción de fijarlo.
- Si el total semanal es incompleto, se oculta la barra y se muestra «Total incompleto».
- Un objetivo guardado corrupto o ininterpretable muestra un error y no se sobrescribe automáticamente; la persona puede sustituirlo o eliminarlo mediante una acción explícita sin afectar a las sesiones.
- Una semana sin sesiones atribuibles y sin datos que hagan incompleto su total muestra cero minutos.
- Una entrada compuesta solo por ceros no representa un objetivo positivo y se rechaza; `00025` se acepta y se muestra como `25`.
- Los espacios habituales, las tabulaciones y los saltos de línea iniciales y finales se eliminan antes de validar; los espacios entre dígitos se rechazan.
- Si coinciden un error del objetivo y un problema de las sesiones, se muestran ambos avisos y se oculta la barra mientras el progreso no pueda calcularse con seguridad.
- Si el diario permanece abierto al cambiar de día o semana local y la página puede ejecutarse, la información semanal se actualiza automáticamente sin recargar y como máximo un minuto después del cambio; si la página fue suspendida, se actualiza al volver a activarse.
- Si una sesión de la semana contiene `minutes` igual a cero y un `minutos` distinto, prevalece `minutes` y el total semanal es incompleto.

## Fuera de alcance

- Objetivos por tema o por períodos distintos de la semana.
- Consulta de objetivos históricos o sincronización entre dispositivos.

## Criterios de éxito

- Los requisitos se pueden verificar con sesiones y fechas que cubran los límites de una semana natural y el cambio de objetivo.
- Las sesiones anteriores siguen disponibles y no se pierden por establecer, cambiar o eliminar el objetivo.

## Decisiones y dudas abiertas

- La persona confirmó que no se impone un máximo de producto al objetivo.
- No quedan dudas abiertas identificadas de las señaladas en la revisión.
