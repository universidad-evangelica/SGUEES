-- Icono del sistema Académico. school no existe en DevExtreme; bookmark sí.
UPDATE dbo.SEG_SISTEMA
SET IMAGEN_SISTEMA = 'bookmark'
WHERE CODIGO_SISTEMA = 'ACADEMICS'
  AND IMAGEN_SISTEMA = 'school';
GO

-- Menú: Documentos por solicitud (Académico / Tablas Generales).
-- El usuario lo ejecuta. No está aplicado en la base.

EXEC dbo.PR_SEG_ASIGNAR_OPCION_MENU
  @CODIGO_SISTEMA = 'ACADEMICS',
  @CODIGO_MENU = 'GENERAL',
  @CODIGO_OPCION = 'ACA_DOCUMENTO_ADMISION_FLUJO',
  @NOMBRE_OPCION = 'Documentos por solicitud',
  @URL_OPCION = '/aca-documento-admision-flujo',
  @LOGIN_ASIGNA = 'juanh',
  @LOGIN_SISTEMA = 'juanh',
  @CODIGO_SUITE = 'SGUEES',
  @ORDEN_SISTEMA = 0,
  @ORDEN_MENU = 1,
  @ORDEN_OPCION = 8,
  @NUEVO = 1,
  @MODIFICAR = 1,
  @ELIMINAR = 1,
  @IMPRIMIR = 1;
GO
