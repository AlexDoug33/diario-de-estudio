# Especificación: mapa de calor de estudio

## Contexto y objetivo
El Diario de Estudio ya registra sesiones y muestra estadísticas. El mapa permitirá reconocer de un vistazo la constancia y la intensidad del estudio reciente, sin sustituir las estadísticas existentes.

## Usuarios
Personas que registran sus sesiones y quieren consultar su progreso reciente.

## Historias de usuario
- Como estudiante, quiero distinguir los días en los que estudié para reconocer mi constancia.
- Como estudiante, quiero conocer los minutos de cada día para interpretar la intensidad del mapa.

## Requisitos funcionales

### RF-1. Período visible
El mapa cubre 84 días consecutivos: hoy y los 83 días anteriores, según la fecha local.
- **Criterio de aceptación:** Cuando se muestra el mapa, el sistema deberá representar una vez cada uno de los 84 días, incluido hoy, sin incluir fechas futuras.
- **Criterio de aceptación:** Mientras se muestra el mapa, el sistema deberá organizar los días en 12 columnas de siete días, en orden cronológico, con el más reciente al final e identificando los días de la semana.

### RF-2. Minutos por día
Se suman los minutos de todas las sesiones válidas de cada fecha; una sesión válida tiene una fecha real en formato AAAA-MM-DD y minutos numéricos enteros mayores que cero. Los minutos expresados como texto no se consideran válidos sin una decisión específica sobre su conversión.
- **Criterio de aceptación:** Cuando un día tiene varias sesiones válidas, el sistema deberá representar la suma de sus minutos.
- **Criterio de aceptación:** Cuando un día no tiene sesiones asociadas ni datos que hagan incompleto su total, el sistema deberá representarlo con cero minutos.

### RF-3. Intensidad y leyenda
La intensidad aumenta con los minutos diarios. Los niveles son: 0, 1–29, 30–59, 60–119 y 120 o más minutos.
- **Criterio de aceptación:** Cuando se representa un día con total completo, el sistema deberá asignarle el nivel correspondiente a sus minutos y distinguir visualmente los cinco niveles.
- **Criterio de aceptación:** Mientras el mapa esté visible, el sistema deberá mostrar una leyenda con los cinco intervalos y su significado.

### RF-4. Consulta de un día
- **Criterio de aceptación:** Cuando una persona consulte un día mediante ratón, teclado o pantalla táctil, el sistema deberá mostrar su fecha completa y sus minutos totales, incluido el valor cero, o indicar que el total es incompleto.
- **Criterio de aceptación:** Mientras se muestra el mapa, el sistema deberá permitir identificar la fecha y los minutos o el estado incompleto de cada día sin depender exclusivamente del color.
- **Criterio de aceptación:** Cuando se enfoca, pulsa o señala un día, el sistema deberá mostrar su información hasta seleccionar otro día, retirar el foco o cerrar la consulta.
- **Criterio de aceptación:** Mientras se muestra el mapa, cada día deberá tener un nombre accesible que incluya su fecha y sus minutos o indique que el total es incompleto.

### RF-5. Actualización
- **Criterio de aceptación:** Cuando se guarda una sesión válida, el sistema deberá actualizar el mapa y sus totales sin recargar la página.
- **Criterio de aceptación:** Cuando se abre o recarga el diario, el sistema deberá calcular el mapa a partir de las sesiones disponibles y de la fecha local de ese momento.
- **Criterio de aceptación:** Si falla el recálculo, el sistema deberá indicar el error sin alterar los datos guardados.

### RF-6. Datos inválidos y errores
- **Criterio de aceptación:** Cuando cualquier sesión disponible tenga fecha o minutos inválidos, incluso fuera del período visible, el sistema deberá excluirla del cálculo y mostrar un único aviso de datos que no se han podido interpretar, sin modificarla ni borrarla.
- **Criterio de aceptación:** Cuando una sesión tenga una fecha válida dentro del período y minutos inválidos, el sistema deberá marcar ese día como «total incompleto», sin presentarlo como cero confirmado.
- **Criterio de aceptación:** Cuando una sesión tenga una fecha inválida, el sistema deberá mostrar el aviso general sin atribuirla a un día concreto.
- **Criterio de aceptación:** Si no se pueden leer las sesiones, el sistema deberá indicar que no se puede mostrar el mapa, sin presentar el error como ausencia de estudio ni modificar los datos guardados.
- **Criterio de aceptación:** Cuando los minutos o su suma excedan la precisión numérica segura, el sistema deberá marcar el día afectado como total incompleto y conservar las sesiones.
- **Criterio de aceptación:** Si no se pueden leer las sesiones al guardar, el sistema deberá impedir el guardado e informar del error sin sobrescribir los datos existentes.
- **Criterio de aceptación:** Cuando un día tenga total incompleto, el sistema deberá mostrar «total incompleto» sin suma parcial ni nivel de intensidad.

## Requisitos no funcionales
- El mapa y su leyenda deben poder usarse en móvil y escritorio, con teclado, pantalla táctil y lector de pantalla. Los niveles deben distinguirse también sin depender del color.
- La información no debe depender exclusivamente del color; los textos deben estar en español.
- El mapa no debe enviar ni alterar las sesiones existentes. Su funcionamiento debe respetar la fecha local y la lectura de las claves y formatos anteriores ya admitidos por el diario.
- Las reglas de cálculo deben poder verificarse sin instalar dependencias; la funcionalidad, la consola y la vista móvil deben comprobarse en el navegador.

## Casos límite
- Sin sesiones: se muestran 84 días de cero minutos, sin aviso de error.
- Una sesión en el primer o último día del período cuenta; una inmediatamente anterior o futura no cuenta.
- Sesiones duplicadas válidas suman sus minutos, pues son registros separados.
- Los cambios de mes, año, año bisiesto y hora se interpretan en fecha local, sin omitir ni repetir días.
- Una sesión inválida no impide representar las demás; un fallo de lectura impide conocer los totales y muestra el error correspondiente.
- Si hay sesiones válidas e inválidas con la misma fecha, el total de ese día se marca como incompleto; también cuando solo hay sesiones con minutos inválidos.
- El período se recalcula al abrir, recargar o guardar una sesión; no se exige una actualización automática a medianoche.

## Fuera de alcance
- Consultar períodos anteriores, navegar entre semanas o cambiar el número de semanas.
- Editar, borrar o crear sesiones desde el mapa.
- Filtros por tema, objetivos, comparaciones, exportación y personalización de intervalos o colores.
- Sincronización entre dispositivos y detección automática de cambios externos o de fecha mientras la página permanece abierta.

## Criterios de finalización
- Todos los requisitos funcionales y no funcionales están verificados, incluidos los límites de cada intervalo y los casos límite.
- Las pruebas de cálculo pasan con `node --test` sin instalar dependencias; no se avanza con pruebas en rojo. La comprobación del navegador cubre funcionalidad, consola y vista móvil.
- Se confirma que las sesiones existentes y las estadísticas actuales se conservan sin cambios no previstos.

## Dudas abiertas
Ninguna: las decisiones de esta versión se han elegido por delegación y se han incorporado tras la revisión QA.
