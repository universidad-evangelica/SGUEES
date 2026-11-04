-- Qué hace: registra Tipos de institución en el menú General.
-- Cómo lo hace: el usuario ejecuta este bloque. La pantalla no aparece hasta entonces.
EXEC dbo.PR_SEG_ASIGNAR_OPCION_MENU
  @CODIGO_SISTEMA = 'GENERAL',
  @CODIGO_MENU = 'GENERAL',
  @CODIGO_OPCION = 'GEN_TIPO_INSTITUCION',
  @NOMBRE_OPCION = 'Tipos de institución',
  @URL_OPCION = '/gen-tipo-institucion',
  @LOGIN_ASIGNA = 'juanh',
  @LOGIN_SISTEMA = 'juanh',
  @CODIGO_SUITE = 'SGUEES',
  @ORDEN_SISTEMA = 0,
  @ORDEN_MENU = 1,
  @ORDEN_OPCION = 17,
  @NUEVO = 1,
  @MODIFICAR = 1,
  @ELIMINAR = 1,
  @IMPRIMIR = 1;
GO
