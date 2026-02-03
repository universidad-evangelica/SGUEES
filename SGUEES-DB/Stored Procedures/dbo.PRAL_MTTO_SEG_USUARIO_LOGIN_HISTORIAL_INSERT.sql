SET QUOTED_IDENTIFIER ON
GO
SET ANSI_NULLS ON
GO

-- SP para registrar login exitoso
CREATE PROCEDURE [dbo].[PRAL_MTTO_SEG_USUARIO_LOGIN_HISTORIAL_INSERT]
(
    @LOGIN_SISTEMA varchar(30),
    @FECHA_LOGIN datetime,
    @IP_ADDRESS varchar(50) = NULL,
    @NAVEGADOR varchar(255) = NULL,
    @CODIGO_SUITE varchar(20) = NULL,
    @EXITOSO bit = 1,
    @MENSAJE varchar(500) = NULL,
    @ES_CAMBIO_CLAVE bit = 0,
    @CORR_LOGIN int OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO [dbo].[SEG_USUARIO_LOGIN_HISTORIAL]
    (
        LOGIN_SISTEMA,
        FECHA_LOGIN,
        IP_ADDRESS,
        NAVEGADOR,
        CODIGO_SUITE,
        EXITOSO,
        MENSAJE,
        ES_CAMBIO_CLAVE
    )
    VALUES
    (
        @LOGIN_SISTEMA,
        @FECHA_LOGIN,
        @IP_ADDRESS,
        @NAVEGADOR,
        @CODIGO_SUITE,
        @EXITOSO,
        @MENSAJE,
        @ES_CAMBIO_CLAVE
    );
    
    SET @CORR_LOGIN = SCOPE_IDENTITY();
    
    RETURN 0;
END
GO
