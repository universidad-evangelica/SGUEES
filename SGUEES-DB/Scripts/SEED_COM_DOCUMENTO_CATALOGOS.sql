/*
  Catálogos mínimos para lookups de com-documento (CORR_EMPRESA = 1).
  Idempotente — no duplica si ya existen filas.

  Uso:
    sqlcmd -S 192.168.0.250 -U erp -d SGUEES -f 65001 -i SEED_COM_DOCUMENTO_CATALOGOS.sql
*/
SET NOCOUNT ON;
GO

DECLARE @EMP INT = 1;

IF NOT EXISTS (SELECT 1 FROM dbo.GEN_TIPO_DOCUMENTO WHERE CORR_EMPRESA = @EMP)
BEGIN
	INSERT INTO dbo.GEN_TIPO_DOCUMENTO
	(CORR_EMPRESA, CORR_TIPO_DOC, NOMBRE_TIPO_DOC, NOMBRE_CORTO_TIPO_DOC, USAR_VENTAS, USAR_COMPRAS, CLASE_DOCUMENTO, SUMA_RESTA, LIBRO_IVA, ES_ELECTRONICO)
	VALUES
	(@EMP, 1, N'Crédito Fiscal', N'CCF', 0, 1, 'CCF', 1, 'CCO', 1),
	(@EMP, 2, N'Factura', N'FAC', 0, 1, 'FAC', 1, 'CCO', 1),
	(@EMP, 3, N'Factura de Exportación', N'FEX', 0, 1, 'FEX', 1, 'CCO', 1),
	(@EMP, 4, N'Nota de Crédito', N'NCR', 0, 1, 'NCR', -1, 'CCO', 1),
	(@EMP, 5, N'Nota de Débito', N'NDB', 0, 1, 'NDB', 1, 'CCO', 1),
	(@EMP, 6, N'Comprobante de Retención', N'CRT', 0, 1, 'CRT', 1, 'NIN', 1),
	(@EMP, 7, N'Sujeto Excluido', N'FSE', 0, 1, 'FAC', 1, 'CCO', 1);
	PRINT N'GEN_TIPO_DOCUMENTO: 7 tipos insertados.';
END
ELSE
	PRINT N'GEN_TIPO_DOCUMENTO: ya tiene datos — omitido.';
GO

DECLARE @EMP INT = 1;

IF NOT EXISTS (SELECT 1 FROM dbo.GEN_TIPO_GASTO WHERE CORR_EMPRESA = @EMP)
BEGIN
	INSERT INTO dbo.GEN_TIPO_GASTO (CORR_EMPRESA, CORR_TIPO_GASTO, NOMBRE_TIPO_GASTO, ES_SERVICIO, ES_INTANGIBLE)
	VALUES
	(@EMP, 1, N'Bienes / mercadería', 0, 0),
	(@EMP, 2, N'Servicios', 1, 0),
	(@EMP, 3, N'Gastos operativos', 0, 0),
	(@EMP, 4, N'Activos intangibles', 0, 1);
	PRINT N'GEN_TIPO_GASTO: 4 tipos insertados.';
END
ELSE
	PRINT N'GEN_TIPO_GASTO: ya tiene datos — omitido.';
GO

DECLARE @EMP INT = 1;

IF NOT EXISTS (SELECT 1 FROM dbo.COM_CONDICION_PAGO WHERE CORR_EMPRESA = @EMP)
BEGIN
	INSERT INTO dbo.COM_CONDICION_PAGO (CORR_EMPRESA, CORR_CONDICION_PAGO, NOMBRE_CONDICION_PAGO, DIAS_CREDITO)
	VALUES
	(@EMP, 1, N'Contado', 0),
	(@EMP, 2, N'Crédito 15 días', 15),
	(@EMP, 3, N'Crédito 30 días', 30),
	(@EMP, 4, N'Crédito 45 días', 45),
	(@EMP, 5, N'Crédito 60 días', 60);
	PRINT N'COM_CONDICION_PAGO: 5 condiciones insertadas.';
END
ELSE
	PRINT N'COM_CONDICION_PAGO: ya tiene datos — omitido.';
GO

SELECT N'GEN_TIPO_DOCUMENTO' AS catalogo, COUNT(*) AS filas FROM dbo.GEN_TIPO_DOCUMENTO WHERE CORR_EMPRESA = 1
UNION ALL
SELECT N'GEN_TIPO_GASTO', COUNT(*) FROM dbo.GEN_TIPO_GASTO WHERE CORR_EMPRESA = 1
UNION ALL
SELECT N'COM_CONDICION_PAGO', COUNT(*) FROM dbo.COM_CONDICION_PAGO WHERE CORR_EMPRESA = 1;
GO
