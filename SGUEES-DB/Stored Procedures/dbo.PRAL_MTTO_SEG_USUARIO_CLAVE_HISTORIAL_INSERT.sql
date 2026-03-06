SET QUOTED_IDENTIFIER ON
GO
SET ANSI_NULLS ON
GO

-- Procedimiento para registrar contrasena anterior en el historial
CREATE PROCEDURE [dbo].[PRAL_MTTO_SEG_USUARIO_CLAVE_HISTORIAL_INSERT]
(
	@LOGIN_SISTEMA varchar(30),
	@CLAVE_USUARIO varbinary(max),
	@CLAVE_USUARIO_SAL varbinary(max),
	@USUARIO_ACTU varchar(30),
	@ESTACION_ACTU varchar(50) = NULL,
	@SYS_NUMERO_ERROR numeric(38,0) output,
	@SYS_MENSAJE_ERROR nvarchar(4000) output
)
AS
BEGIN
	
	SET NOCOUNT ON
	SELECT @SYS_NUMERO_ERROR = 0, @SYS_MENSAJE_ERROR = ''

	BEGIN TRY

		-- Registrar la contrasena actual en el historial antes de cambiarla
		INSERT INTO [dbo].[SEG_USUARIO_CLAVE_HISTORIAL]
		(
			[LOGIN_SISTEMA],
			[CLAVE_USUARIO],
			[CLAVE_USUARIO_SAL],
			[FECHA_CAMBIO],
			[USUARIO_ACTU],
			[ESTACION_ACTU]
		)
		VALUES
		(
			@LOGIN_SISTEMA,
			@CLAVE_USUARIO,
			@CLAVE_USUARIO_SAL,
			GETDATE(),
			@USUARIO_ACTU,
			@ESTACION_ACTU
		)

		SELECT @SYS_NUMERO_ERROR = 0
		SELECT @SYS_MENSAJE_ERROR = 'Contrasena anterior registrada en historial exitosamente.'

	END TRY
	BEGIN CATCH
		SELECT @SYS_NUMERO_ERROR = ERROR_NUMBER(),
		       @SYS_MENSAJE_ERROR = 'Error al registrar contrasena anterior: ' + ERROR_MESSAGE()
	END CATCH

END
GO

PRINT 'Procedimiento PRAL_MTTO_SEG_USUARIO_CLAVE_HISTORIAL_INSERT creado exitosamente';
