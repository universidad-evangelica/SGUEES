SET QUOTED_IDENTIFIER ON;
GO
SET ANSI_NULLS ON;
GO
-- =============================================================================
-- Procedimiento: dbo.PRAL_IMPR_SC_MOVIMIENTO_PERSONAL
-- Qué hace: devuelve TODAS las columnas de la fila de SC_MOVIMIENTO_PERSONAL.
--           El XtraReport enlaza las que use; el resto se asigna en el diseñador.
-- Parámetros: @CORR_EMPRESA, @CORR_MOVIMIENTO_PERSONAL
-- Consumo: SGUEES-RPT Layouts/SelectionHiring/SelectionHiring.aspx
--   ?fuente=sc-movimiento-personal&report=rptMovimientoPersonal&...
-- =============================================================================
CREATE OR ALTER PROCEDURE [dbo].[PRAL_IMPR_SC_MOVIMIENTO_PERSONAL]
(
	@CORR_EMPRESA INT,
	@CORR_MOVIMIENTO_PERSONAL INT
)
AS
BEGIN
	SET NOCOUNT ON;

	SELECT M.*
	FROM dbo.SC_MOVIMIENTO_PERSONAL AS M
	WHERE M.CORR_EMPRESA = @CORR_EMPRESA
	  AND M.CORR_MOVIMIENTO_PERSONAL = @CORR_MOVIMIENTO_PERSONAL;
END
GO
