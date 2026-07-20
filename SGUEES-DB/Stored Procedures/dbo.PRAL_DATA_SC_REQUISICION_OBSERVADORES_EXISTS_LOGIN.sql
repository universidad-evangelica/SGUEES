SET QUOTED_IDENTIFIER ON
GO
SET ANSI_NULLS ON
GO
-- =============================================
-- Procedimiento: PRAL_DATA_SC_REQUISICION_OBSERVADORES_EXISTS_LOGIN
-- Descripción: Valida si un LOGIN_SISTEMA ya está registrado como observador
-- Parámetros:
--   @CORR_EMPRESA              Empresa del usuario en sesión
--   @CORR_REQUISICION_PERSONAL  Contexto de requisición (0 = observadores por defecto)
--   @LOGIN_SISTEMA              Usuario a validar
--   @EXCLUDE_CORR               Correlativo a excluir en actualización (0 en alta)
-- Retorno:
--   1 fila con FOUND = 1 si ya existe; sin filas si no existe
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[PRAL_DATA_SC_REQUISICION_OBSERVADORES_EXISTS_LOGIN]
(
	@CORR_EMPRESA INT,
	@CORR_REQUISICION_PERSONAL INT = 0,
	@LOGIN_SISTEMA VARCHAR(30),
	@EXCLUDE_CORR INT = 0
)
AS
BEGIN
	SET NOCOUNT ON;

	SELECT TOP 1
		FOUND = CAST(1 AS BIT)
	FROM dbo.V_SC_REQUISICION_OBSERVADORES
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND ISNULL(CORR_REQUISICION_PERSONAL, 0) = ISNULL(@CORR_REQUISICION_PERSONAL, 0)
	  AND UPPER(LTRIM(RTRIM(LOGIN_SISTEMA))) = UPPER(LTRIM(RTRIM(@LOGIN_SISTEMA)))
	  AND (@EXCLUDE_CORR <= 0 OR CORR_REQUISICION_OBSERVADORES <> @EXCLUDE_CORR);
END
GO

PRINT 'Procedimiento PRAL_DATA_SC_REQUISICION_OBSERVADORES_EXISTS_LOGIN creado exitosamente';
GO
