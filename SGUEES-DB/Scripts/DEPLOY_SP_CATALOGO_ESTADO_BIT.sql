/*

  Despliegue: SP genérico activar/desactivar catálogos (bit).

  Ejecutar: sqlcmd -S <srv> -d SGUEES -U <user> -f 65001 -i DEPLOY_SP_CATALOGO_ESTADO_BIT.sql

*/

SET NOCOUNT ON;

GO



IF OBJECT_ID(N'dbo.PRAL_MTTO_CATALOGO_ESTADO_BIT', N'P') IS NOT NULL

	DROP PROCEDURE dbo.PRAL_MTTO_CATALOGO_ESTADO_BIT;

GO



:r ..\Programmability\Procedures\dbo.PRAL_MTTO_CATALOGO_ESTADO_BIT.sql

GO



PRINT N'DEPLOY_SP_CATALOGO_ESTADO_BIT — OK';

GO

