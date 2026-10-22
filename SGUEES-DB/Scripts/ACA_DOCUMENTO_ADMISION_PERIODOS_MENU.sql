-- Qué hace: registra Documentos por período en el menú Académico.
-- Cómo lo hace: el usuario ejecuta este bloque. La pantalla no aparece hasta entonces.
EXEC dbo.PR_SEG_ASIGNAR_OPCION_MENU
  @CODIGO_SISTEMA = 'ACADEMICS',
  @CODIGO_MENU = 'GENERAL',
  @CODIGO_OPCION = 'ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOS',
  @NOMBRE_OPCION = 'Documentos por período',
  @URL_OPCION = '/aca-documento-admision-periodos-academicos',
  @LOGIN_ASIGNA = 'juanh',
  @LOGIN_SISTEMA = 'juanh',
  @CODIGO_SUITE = 'SGUEES',
  @ORDEN_SISTEMA = 0,
  @ORDEN_MENU = 1,
  @ORDEN_OPCION = 9,
  @NUEVO = 1,
  @MODIFICAR = 1,
  @ELIMINAR = 1,
  @IMPRIMIR = 1;
GO
