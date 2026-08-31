SET QUOTED_IDENTIFIER ON
GO
SET ANSI_NULLS ON
GO
-- =============================================================================
-- Procedimiento: dbo.PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO
-- Qué hace: entrega datos para PDF Formato extenso del Descriptor de puesto.
-- Cómo:
--   1) Result set 1: generalidades del descriptor (1 sola fila). Se usa TOP 1
--      porque la vista base devuelve 1 fila por indicador y aquí no se imprimen
--      indicadores ni funciones todavía.
--   2) Result set 2: encabezado/logos desde GEN_EMPRESA (mismo patrón partida).
-- Alcance: por ahora solo las generalidades de SC_DESCRIPTOR_PUESTO. Los bloques
--          uno-a-muchos del extenso (educación, experiencia, etc.) se agregarán
--          como result sets adicionales para los subinformes del .rpt.
-- Uso API: SC_DESCRIPTOR_PUESTO/getPDFFormatoExtenso → SGUEES-RPT SelectionHiring.
-- =============================================================================
CREATE OR ALTER PROCEDURE [dbo].[PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO]
(
	@CORR_EMPRESA INT,
	@CORR_DESCRIPTOR_PUESTO INT
)
AS
BEGIN
	SET NOCOUNT ON;

	-- Generalidades: mismos campos de encabezado que el Formato corto, sin funciones ni KPI.
	SELECT TOP 1
		A.CORR_EMPRESA,
		A.CORR_DESCRIPTOR_PUESTO,
		A.CODIGO_DESCRIPTOR_PUESTO,
		A.FECHA_EMISION,
		A.FECHA_REVISION,
		A.OBJETIVO_PUESTO,
		A.NUM_PERSONAL_CARGO,
		A.CORR_PUESTO,
		A.NOMBRE_PUESTO,
		A.CORR_UNIDAD,
		A.NOMBRE_UNIDAD,
		A.CORR_PUESTO_REPORTA,
		A.NOMBRE_EMPLEADO_REPORTA,
		A.CORR_IMPACTO_ECONOMICO,
		A.DESCRIPCION_IMPACTO_ECONOMICO,
		A.RESPONSABLE,
		A.FORMATO,
		A.VERSION,
		A.CORR_ESTADO,
		A.NOMBRE_ESTADO,
		A.USUARIO_CREA,
		A.ESTACION_CREA,
		A.FECHA_CREA,
		A.USUARIO_ACTU,
		A.ESTACION_ACTU,
		A.FECHA_ACTU
	FROM dbo.V_SC_DESCRIPTOR_PUESTO_IMPR A
	WHERE A.CORR_EMPRESA = @CORR_EMPRESA
	  AND A.CORR_DESCRIPTOR_PUESTO = @CORR_DESCRIPTOR_PUESTO;

	-- Encabezado / logos (GEN_PARAMETRO en Crystal).
	SELECT
		A.CORR_EMPRESA,
		A.NOMBRE_EMPRESA,
		CAST('' AS VARCHAR(100)) AS PERIODO,
		A.LOGO_1 AS LOGO1,
		A.LOGO_2 AS LOGO2,
		CAST(N'Descriptor de Puesto - Formato extenso' AS VARCHAR(150)) AS TITULO_REPORTE,
		CAST('' AS VARCHAR(100)) AS NOMBRE_SISTEMA,
		GETDATE() AS FECHA_IMPRESION
	FROM dbo.GEN_EMPRESA A
	WHERE A.CORR_EMPRESA = @CORR_EMPRESA;
END
GO
