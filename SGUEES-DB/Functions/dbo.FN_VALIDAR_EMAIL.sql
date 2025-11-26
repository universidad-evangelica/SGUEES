SET QUOTED_IDENTIFIER ON
GO
SET ANSI_NULLS ON
GO
CREATE FUNCTION [dbo].[FN_VALIDAR_EMAIL]
(
    @Email varchar(255)
)
RETURNS BIT
AS
BEGIN
    DECLARE @Valid BIT = 0
    
    IF @Email LIKE '%_@__%.__%'  
        SET @Valid = 1
    
    RETURN @Valid
END
GO
