# Mantenimientos de becas

## Paso 1: iglesias, instituciones y convenios

Se reutilizan las rutas `/aca-bec-entidad-financiadora` y `/aca-bec-convenio`, con sus permisos existentes. Una iglesia se registra como entidad de tipo `IGLESIA`; el convenio selecciona esa entidad y conserva su codigo, nombre, fechas, descripcion y estado.

Las lecturas y escrituras de estas dos pantallas utilizan los catalogos `ACA_BECA_ENTIDAD_FINANCIADORA` y `ACA_BECA_CONVENIO`, relacionados con las becas actuales. Las tablas anteriores `ACA_BEC_*` se conservan. No se sincronizan ni eliminan sus registros.

### Instalacion

1. Respaldar SGUEES y conservar la version anterior de la API y la SPA.
2. Ejecutar `SGUEES-DB/Scripts/ACA_BECA_CONVENIOS_ENTIDADES_MTTO.sql` y despues `SGUEES-DB/Scripts/ACA_BECA_FINANCIADOR_MTTO.sql` en SGUEES antes de arrancar la API actualizada. Son idempotentes y no cargan iglesias, convenios ni permisos particulares.
3. Compilar y arrancar la API y la SPA de esta rama. El script no cambia SIS_ADMISION.
4. Comprobar los permisos existentes de las dos rutas y verificar consulta, creacion y edicion.

El script agrega `VERSION_REGISTRO` de tipo `rowversion` a los dos catalogos, dos vistas de mantenimiento y dos procedimientos. La API devuelve ese token como base64; la SPA lo devuelve al editar, eliminar o cambiar el estado. Una edicion obsoleta se rechaza y requiere actualizar el listado.

### Reglas

- La empresa y el usuario provienen de la sesion. Las referencias se validan nuevamente en el procedimiento.
- Los codigos no se repiten en la misma empresa; las fechas no pueden estar invertidas.
- Solo se permite vincular entidades activas. Un convenio existente puede conservar su entidad inactiva al editar otros datos.
- No se puede desactivar una entidad con convenios en estado VIGENTE, ni reabrir un convenio cuya entidad este inactiva.
- Las claves foraneas impiden eliminar convenios o entidades utilizados; puede cambiarse su estado.
- Todas las escrituras usan procedimientos almacenados con transaccion, auditoria y bloqueo de concurrencia, invocados por el repositorio mediante el framework.

### Uso

1. En Entidades financiadoras, crear la iglesia o institucion con su tipo, codigo, nombre y contactos.
2. En Convenios, crear el convenio, seleccionar la entidad y definir su vigencia y estado.
3. Para editar un convenio, abrirlo desde el listado y guardar. Si otro usuario lo cambio, actualizar el listado y revisar su nueva version.

Las rutas de entidades, convenios y financiadores muestran el encabezado `Convenios y financiamiento` y tres pestanas: `Iglesias e instituciones`, `Convenios` y `Financiadores`. Las pestanas usan las rutas y servicios existentes, y solo se muestran si la sesion tiene permiso R para la opcion correspondiente. Se deshabilitan al editar; guardar o cancelar antes de cambiar. El guard de salida original sigue protegiendo los cambios al navegar por otros medios.

El menu lateral agrupa visualmente esas opciones en una sola entrada. No cambia las asignaciones de permisos ni los registros del menu en la base. Si el usuario solo puede consultar una opcion, la entrada abre esa ruta. Las direcciones anteriores siguen funcionando y el menu conserva la seleccion al cambiar de pestana.

Se conserva el contenedor y la barra comunes del proyecto. Convenios usa una columna exterior para que nombre, entidad y descripcion ocupen todo el ancho; los datos de identificacion y las fechas se agrupan con columnas adaptables. El selector de entidad muestra solo su nombre y conserva su identificador como valor.

### Financiamiento de una beca

La pestana Financiadores utiliza `ACA_BECA_FINANCIADOR`, y los selectores leen `ACA_BECA_TIPO` y `ACA_BECA_ENTIDAD_FINANCIADORA`. Una entidad creada en Iglesias e instituciones queda disponible al abrir Financiadores si esta activa y pertenece a la misma empresa.

Seleccionar la beca, la entidad, el concepto, el porcentaje y el monto maximo opcional. El guardado valida nuevamente las referencias, el rango de cobertura y los duplicados por beca, entidad y concepto. Se conserva el control de concurrencia mediante `VERSION_REGISTRO` y se impide eliminar financiamientos utilizados por solicitudes.

Si falla la carga de catalogos, la pantalla presenta el error; no lo convierte en un selector vacio sin explicacion. Los catalogos antiguos `ACA_BEC_*` se conservan y no reciben copias de las nuevas entidades.

## Pasos siguientes

Este paso no modifica cuestionarios ni vincula automaticamente el texto de iglesia declarado por un aspirante con un convenio. El paso 2 conecta origenes, tipos, requisitos y documentos con los catalogos actuales, como se describe a continuacion.

Los pasos 2, 3 y 4 se describen abajo. El paso 4 incorpora el editor de contenido y la vista previa. Las versiones publicadas y las solicitudes existentes conservan su historial.

Los documentos firmados del convenio y la asociacion de varias iglesias a un convenio general requieren una etapa posterior; no se presentan como funciones disponibles en este primer paso.

## Paso 2: continuidad de la configuracion de becas

Ejecutar `SGUEES-DB/Scripts/ACA_BECA_CATALOGOS_CONTINUIDAD_MTTO.sql` despues de los dos scripts del paso 1, antes de cargar la API y SPA actualizadas. Respaldar primero los catalogos y las definiciones. No ejecutarlo en SIS_ADMISION.

Las rutas, permisos y servicios `ACA_BEC_*` existentes se conservan, pero estos cuatro mantenimientos ahora leen vistas `V_ACA_BECA_*_MTTO` y escriben por `PRAL_MTTO_ACA_BECA_*` mediante el framework. No se copian ni eliminan registros de las tablas antiguas. Las solicitudes siguen utilizando sus identificadores actuales.

El script agrega rowversion a origenes, tipos, requisitos y documentos. La SPA conserva el token al consultar y editar, y lo envia tambien al eliminar o cambiar el estado. Una edicion obsoleta obliga a actualizar el listado.

El menu separa `Configuracion de becas` (Tipos y Origenes) de `Cuestionario de becas` (Formularios y versiones, Documentos requeridos y Requisitos). El listado general del cuestionario es el punto de seleccion de beca. El identificador viaja como parametro `beca`, filtra requisitos y documentos y se asigna al crear registros dependientes. Durante una edicion se bloquean las pestañas y permanece el guard de salida original. Las rutas directas anteriores siguen disponibles con sus permisos.

Financiadores permanece en Convenios y financiamiento, junto a Iglesias e instituciones y Convenios. Conserva el filtro por beca cuando recibe ese contexto, sin repetir las pestañas de Configuracion ni Cuestionario.

Tipos muestra el numero de formularios activos y vigentes asociados. Cero indica que falta esa configuracion; este paso no crea ni asigna versiones automaticamente, ni cambia el estado de las becas existentes. La publicacion y asignacion se describen en el paso 3, y la creacion y edicion de contenido en el paso 4.

Las validaciones del procedimiento incluyen empresa, referencias, codigos duplicados, cobertura, CUM, poblacion aplicable, convenio y entidad vigentes para activar una beca, y proteccion de origenes utilizados por becas activas. Requisitos y documentos controlan duplicados por beca. Los documentos solo permiten las areas BECAS, CONTRAPARTE, FINANZAS, REGISTRO y TALENTO_HUMANO, iguales a la restriccion de base de datos. Los errores al cargar catalogos se notifican al usuario.

Los requisitos documentales y las preguntas DOCUMENTO del cuestionario aun requieren una vinculacion explicita en la siguiente etapa. Este paso tampoco modifica las validaciones de envio de la API de SIS_ADMISION, ni presenta un flujo nuevo de publicacion como disponible. No modifica versiones ni respuestas de solicitudes existentes.

## Paso 3: formularios, versiones y asignaciones

Despues del paso 2, respaldar los catalogos, cuestionarios, solicitudes y definiciones. Ejecutar en SGUEES, en orden:

1. `ACA_BECA_FORMULARIOS_VERSIONES_MTTO.sql`.
2. `ACA_BECA_FORMULARIOS_ADMISION_VALIDACIONES.sql`.

Son scripts repetibles. No escriben en SIS_ADMISION ni copian solicitudes. Agregan metadatos de estado y concurrencia a formularios, versiones y asignaciones; las versiones preexistentes se reconocen como PUBLICADA y conservan su estado ACTIVO y sus fechas. Las asignaciones anteriores permanecen generales, sin ciclo explicito. No se publican formularios ni se asignan versiones nuevas durante la instalacion.

### Recorrido de uso

En Cuestionario de becas, seleccionar una fila y abrir Formularios y versiones. Se reutilizan los permisos de Tipos de beca: R para consultar, C para crear formularios y versiones, U para editar borradores, publicar y asignar. No se crean permisos particulares.

- Elegir un formulario existente o crear uno con codigo, nombre y descripcion. Un formulario con versiones publicadas conserva su encabezado historico; crear otro si debe cambiar.
- Usar Copiar una version existente, indicar identificador de version, inicio y fin opcional, version publicada de origen y beca plantilla. Se copian las secciones y preguntas de esa beca, sus opciones, dependencias y puntajes, con identificadores nuevos. Se vinculan a la beca seleccionada, sin copiar respuestas ni archivos.
- El resultado queda BORRADOR e inactivo para postulaciones. Cambiar nombre y fechas de version permite modificar esos metadatos; Editar preguntas y opciones abre el contenido del paso 4. Se exige el token de concurrencia.
- Publicar valida preguntas, opciones, puntajes y dependencias y deja la version PUBLICADA, en solo lectura. La publicacion no la asigna automaticamente.
- Crear una asignacion de esa version a la beca, para un ciclo de SIS_ADMISION o como asignacion general. La asignacion especifica tiene prioridad sobre la general. La vigencia de la version se verifica al ofrecer nuevas postulaciones.
- Seleccionar una asignacion para cambiarla o retirarla. No se eliminan solicitudes, respuestas ni la version historica. La nueva configuracion afecta las solicitudes nuevas.

Los listados muestran los estados de las versiones, fechas, cantidades de secciones y preguntas y solicitudes que las utilizan. Se conserva el identificador de la beca entre pesta?as. Guardar o cancelar antes de navegar; el guard de salida tambien protege el editor.

### Disponibilidad e historial

El catalogo de admision selecciona una version publicada, activa y vigente, priorizando la asignacion del ciclo actual sobre la general. No se interpreta el ciclo a partir del texto del identificador de version. Guardar una solicitud nueva exige esa version disponible.

Las solicitudes existentes conservan el ciclo y la version almacenados. No se reubican respuestas automaticamente al cambiar el ciclo activo o publicar otra version. Se puede seguir consultando la version de una solicitud aunque su asignacion haya sido retirada; un borrador existente puede conservarla al guardar. La apertura de una solicitud nueva de otro ciclo no migra ni borra un borrador anterior: cualquier flujo explicito de traslado o nueva solicitud se trata por separado.

### Validacion de envio

`ACA_SP_BECA_ADMISION_ENVIAR` mantiene la comprobacion de titular, empresa y estado BORRADOR y ahora invoca `ACA_SP_BECA_ADMISION_VALIDAR_ENVIO` antes de cambiar el estado. Comprueba tambien que la beca y la version esten activas y la vigencia de envio no haya vencido. Exige las respuestas obligatorias visibles segun las dependencias del cuestionario, una opcion valida en las preguntas de seleccion, valores numericos validos, fecha o texto segun corresponda, consentimiento Acepto/true, y una carga registrada con nombre y ruta para cada pregunta DOCUMENTO obligatoria. Un nombre escrito como respuesta no sustituye un archivo cargado.

La validacion SQL comprueba el registro de la carga, no la existencia fisica posterior del archivo en disco. La carga sigue realizandose por la API existente. No exige preguntas condicionales ocultas ni reemplaza la revision administrativa de requisitos y documentos del catalogo. La vinculacion explicita de esos requisitos documentales con preguntas es una etapa posterior.

### Limites de esta etapa

El paso 3 mantiene encabezados y fechas, clona cuestionarios existentes, publica y asigna versiones. El paso 4 agrega la creacion desde cero y el editor individual. Las bandas globales de calculo existentes no se duplican como si fueran configuracion por version.

Si se reinstalan procedimientos anteriores de admision, reaplicar los dos scripts del paso 3 al final para conservar las reglas de disponibilidad e integridad de esta etapa.

## Paso 4: crear y editar el cuestionario

Despues de los scripts del paso 3, ejecutar `ACA_BECA_CUESTIONARIO_EDITOR.sql` en SGUEES. Reaplicar tambien la version actual de `ACA_BECA_FORMULARIOS_VERSIONES_MTTO.sql` si ya estaba instalado: incorpora la creacion atomica del formulario y su primer borrador y permite versiones vacias. Publicar API y SPA juntas. No ejecutarlo en SIS_ADMISION.

### Crear desde cero

1. Entrar en Cuestionario de becas, seleccionar una beca en el listado y abrir Formularios y versiones.
2. Pulsar Crear formulario desde cero. Indicar codigo, nombre, descripcion opcional, nombre de la version inicial y vigencia. Guardar crea formulario y version BORRADOR en una transaccion y abre el editor vacio.
3. En Secciones, pulsar Agregar seccion, indicar nombre, orden, descripcion opcional, puntaje maximo y peso porcentual.
4. Seleccionar la seccion y entrar en Preguntas. Agregar la pregunta, elegir como respondera el aspirante, su orden, ayuda opcional y si es obligatoria. Se admiten texto corto/largo, entero, decimal, fecha, seleccion unica/multiple, Si/No, documento y aceptacion.
5. Si la pregunta es de seleccion, entrar en Opciones de respuesta y agregar cada alternativa con su texto y orden. Si/No crea sus dos alternativas automaticamente. Estas son las respuestas disponibles; las respuestas reales las completa el aspirante.
6. En Puntajes, agregar las reglas y vigencias para la pregunta seleccionada. Las preguntas de seleccion puntuan por alternativa; los demas tipos utilizan puntaje general. No se permiten vigencias superpuestas para la misma pregunta y opcion.
7. Condiciones es opcional: seleccionar una pregunta hija e indicar la pregunta anterior y la respuesta que la muestra. Varias condiciones funcionan como alternativas (OR). No se permiten ciclos ni referencias fuera de la version.
8. Probar en Vista previa. Las respuestas de simulacion permanecen en memoria; no guardan solicitudes ni cargan archivos.
9. Publicar despues de revisar el contenido y volver a Versiones para asignarlo a la beca y ciclo. Publicar por si solo no habilita postulaciones.

### Cambiar un formulario

Seleccionar una version BORRADOR y pulsar Editar preguntas y opciones. Seleccionar la seccion, pregunta u opcion correspondiente y usar Editar o Quitar. El contenido publicado es de solo lectura: usar Copiar una version existente para cambiarlo conservando el historial. Crear version vacia permite empezar otro cuestionario dentro de un formulario existente.

Se respetan los permisos de Tipos de beca: R para leer, C para agregar, U para editar/publicar y D para quitar elementos. La empresa y auditoria provienen de la sesion. Las vistas y el procedimiento del editor se invocan mediante el repositorio y framework existentes. Cada escritura verifica el token de concurrencia de la version y lo renueva; una pantalla obsoleta debe actualizarse. No se modifican versiones con solicitudes ni se borran respuestas historicas.

La vista previa representa los tipos y condiciones del cuestionario; no reproduce el diseno exacto del portal del aspirante. El editor no mantiene bandas globales de calculo ni sustituye la vinculacion pendiente entre documentos requeridos del catalogo y preguntas DOCUMENTO.

## Organizacion de pantallas y listado general

Ejecutar `ACA_BECA_CUESTIONARIOS_LISTADO.sql` despues del editor en SGUEES. Define una vista de lectura; no cambia registros de negocio. Publicar API y SPA de esta rama juntas.

- Configuracion de becas contiene solo Tipos de beca y Origenes de beca.
- Cuestionario de becas contiene Formularios y versiones, Documentos requeridos y Requisitos.
- Convenios y financiamiento conserva sus tres mantenimientos.

El menu deriva esos accesos de las opciones ya autorizadas de la sesion, sin duplicar Documentos ni Requisitos. La ruta del cuestionario es `/aca-bec-tipo/cuestionarios`; reutiliza el permiso `/aca-bec-tipo` tanto en el guard como en la API. El componente base permite declarar `opcionPermiso` en los datos de una ruta para estas subpantallas; las rutas que no lo declaran conservan su comportamiento.

El listado muestra una fila por beca y version relacionada mediante preguntas o asignaciones activas. Incluye las becas sin formulario, para poder configurarlas. Cuenta las preguntas aplicables a esa beca, no el total compartido de la version. Las asignaciones activas son un conteo informativo: no equivalen por si solas a disponibilidad en un ciclo y fecha concretos.

Seleccionar una fila carga sus preguntas y opciones. Formularios y versiones abre el gestor existente con ese formulario y version seleccionados. Desde alli tambien se pueden recuperar formularios vacios y crear otros. Al cambiar a Documentos requeridos o Requisitos se conserva la beca; al regresar se selecciona esa beca en el listado. Un borrador vacio todavia no tiene preguntas ni una asignacion que lo relacione en el listado; sigue disponible en el selector del gestor. La URL anterior `aca-bec-tipo?seccion=formularios&beca=...` redirige al nuevo acceso.

No se puede cambiar de beca, vista o pestaña mientras hay una edicion pendiente. Las versiones publicadas conservan la restriccion de solo lectura y las solicitudes su historial.

### Acciones simplificadas

Seleccionar una beca en el listado y elegir una de las tres acciones principales:

- Crear cuestionario solicita nombre, descripcion opcional y vigencia. El codigo y la primera version se generan automaticamente. Guardar abre el editor vacio.
- Modificar cuestionario abre directamente el borrador. Para uno publicado prepara una copia de las preguntas de la beca seleccionada; el usuario confirma guardando antes de abrir el editor. La nueva referencia de version se genera automaticamente.
- Asignar a esta beca utiliza el cuestionario publicado seleccionado y solicita el ciclo. Si ese ciclo ya tiene asignacion activa, informa que se reemplazara para nuevas solicitudes y envia el identificador y token de esa asignacion. Si otra sesion la cambio, el procedimiento conserva el rechazo por concurrencia. La asignacion general sigue siendo una opcion explicita.

Usar otro cuestionario como base permite elegir una version publicada y la beca de origen, y crea una copia en borrador para la beca seleccionada. Es necesario revisar, publicar y asignar esa copia. No se cambia el cuestionario de la beca de origen. El historial, los codigos manuales, las versiones vacias y la administracion completa de asignaciones se mantienen en Historial y opciones de versiones.

El listado muestra estados legibles: Sin cuestionario, Borrador, Publicado sin asignar y Asignado. Asignado indica que existe una asignacion activa; las fechas, la actividad de la beca y el ciclo todavia determinan su disponibilidad efectiva. Al consultar preguntas se muestran tambien los nombres de las becas con asignacion activa para esa misma version.

### Resumen y catalogos por beca

El acceso principal utiliza un selector buscable de beca y cuestionario, sin grid de seleccion. Cada opcion identifica la beca, el formulario y su version. Debajo se muestra un solo panel de acciones, estado y cantidad de preguntas correspondiente a la seleccion. Cambiar la opcion actualiza el editor y el contexto de Documentos y Requisitos. El selector se bloquea mientras existe una edicion pendiente.

Requisitos y Documentos requeridos muestran el nombre de la beca y permiten cambiarla con un selector. El cambio actualiza el parametro `beca` y recarga el listado filtrado en la API; una respuesta tardia del contexto anterior se descarta. Sin beca seleccionada no se consulta el listado general. Los catalogos de nombres incluyen las becas de la empresa, tambien las inactivas para poder identificar registros historicos; las validaciones de escritura siguen en los procedimientos existentes.

Los formularios de ambos catalogos tienen una columna exterior, campos de ancho completo y casillas adaptables. La beca se conserva bloqueada al crear o editar. Cada formulario contiene su boton Guardar requisito o Guardar documento y su cancelacion especifica; la barra superior no muestra otro guardado. Los cambios pendientes siguen bloqueando las pestañas y la salida.
