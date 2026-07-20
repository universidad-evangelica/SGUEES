/* ============================================================================
   BAN_PARAMETRO — vista consulta + menú SPA
   Ejecutar:
     sqlcmd -S 192.168.0.250 -U erp -P 'Uees$$2026' -d SGUEES -f 65001 -i DEPLOY_BAN_PARAMETRO.sql
   ============================================================================ */
SET NOCOUNT ON;

IF OBJECT_ID(N'dbo.V_BAN_PARAMETRO', N'V') IS NOT NULL
	DROP VIEW dbo.V_BAN_PARAMETRO;
GO

:r ..\Views\dbo.V_BAN_PARAMETRO.sql
GO

PRINT N'Vista V_BAN_PARAMETRO desplegada.';
GO

:r MENU_BAN_PARAMETRO.sql
GO
