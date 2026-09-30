/*
================================================================================
  SGUEES — Backup / reload de GEN_EMPLEADO_PUESTO hacia la nueva estructura
================================================================================
  Origen: datos actuales en dbo.GEN_EMPLEADO_PUESTO (8 filas al 2026-09-22)
  Destino: nueva tabla con HORARIO_LABORAL y CORR_TIPO_MODALIDAD (NULL en carga)

  Uso sugerido (después de recrear la tabla con la nueva definición):
    1) Crear GEN_EMPLEADO_PUESTO con el DDL nuevo.
    2) Ejecutar este script de INSERT.
    3) Completar HORARIO_LABORAL / CORR_TIPO_MODALIDAD cuando existan datos.

  Nota: fechas con CONVERT(style) para evitar error 242 por idioma/DATEFORMAT.
================================================================================
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

INSERT INTO dbo.GEN_EMPLEADO_PUESTO
(
	CORR_EMPRESA,
	CORR_EMPLEADO,
	CORR_UNIDAD,
	CORR_PUESTO,
	FECHA_INGRESO,
	SUELDO,
	HORARIO_LABORAL,
	CORR_TIPO_CONTRATACION,
	CORR_TIPO_MODALIDAD,
	USUARIO_CREA,
	ESTACION_CREA,
	FECHA_CREA,
	USUARIO_ACTU,
	ESTACION_ACTU,
	FECHA_ACTU
)
VALUES
	(1, 1, 6, 6, CONVERT(date, '20200101', 112), 1000.00, NULL, 1, NULL, N'juanh', N'PRUEBA', CONVERT(datetime, '2026-08-14 16:47:37.173', 121), NULL, NULL, NULL),
	(1, 2, 5, 3, CONVERT(date, '20190101', 112), 1500.00, NULL, 1, NULL, N'juanh', N'PRUEBA', CONVERT(datetime, '2026-08-14 16:47:37.177', 121), NULL, NULL, NULL),
	(1, 3, 4, 1, CONVERT(date, '20210601', 112), 1200.00, NULL, 1, NULL, N'juanh', N'PRUEBA', CONVERT(datetime, '2026-08-14 16:47:37.177', 121), NULL, NULL, NULL),
	(1, 4, 6, 7, CONVERT(date, '20180315', 112), 1800.00, NULL, 1, NULL, N'juanh', N'PRUEBA', CONVERT(datetime, '2026-08-14 16:47:37.177', 121), NULL, NULL, NULL),
	(1, 5, 5, 2, CONVERT(date, '20220201', 112), 1100.00, NULL, 1, NULL, N'juanh', N'PRUEBA', CONVERT(datetime, '2026-08-14 16:47:37.177', 121), NULL, NULL, NULL),
	(1, 6, 6, 2, CONVERT(date, '20200910', 112), 1150.00, NULL, 1, NULL, N'juanh', N'PRUEBA', CONVERT(datetime, '2026-08-14 16:47:37.177', 121), NULL, NULL, NULL),
	(1, 7, 6, 6, CONVERT(date, '20180315', 112), 1800.00, NULL, 1, NULL, N'juanh', N'PRUEBA', CONVERT(datetime, '2026-08-14 16:45:38.803', 121), NULL, NULL, NULL),
	(1, 10, 7, 2, CONVERT(date, '20260824', 112), 1000.00, NULL, 1, NULL, N'juanh', N'CURSOR', CONVERT(datetime, '2026-08-24 21:23:47.373', 121), NULL, NULL, NULL);

COMMIT TRANSACTION;
GO

PRINT N'GEN_EMPLEADO_PUESTO: 8 filas insertadas (HORARIO_LABORAL y CORR_TIPO_MODALIDAD en NULL).';
GO
