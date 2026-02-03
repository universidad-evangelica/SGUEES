SET QUOTED_IDENTIFIER ON
GO
SET ANSI_NULLS ON
GO

-- SP para verificar si el usuario ya ha iniciado sesión alguna vez
CREATE PROCEDURE [dbo].[PRAL_DATA_SEG_USUARIO_PRIMER_LOGIN]
(
    @LOGIN_SISTEMA varchar(30),
    @ES_PRIMER_LOGIN bit OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @COUNT_LOGINS int;
    
    -- Contar logins exitosos del usuario
    SELECT @COUNT_LOGINS = COUNT(*)
    FROM [dbo].[SEG_USUARIO_LOGIN_HISTORIAL]
    WHERE LOGIN_SISTEMA = @LOGIN_SISTEMA
      AND EXITOSO = 1;
    
    -- Si no tiene logins, es primera vez
    IF @COUNT_LOGINS = 0
        SET @ES_PRIMER_LOGIN = 1;
    ELSE
        SET @ES_PRIMER_LOGIN = 0;
    
    RETURN 0;
END
GO
