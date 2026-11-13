/*
  Deploy COM_PROVISION / COM_PAGO (SGUEES, sin CORR_SUSCRIPCION/CORR_CONFI_PAIS).
  Ejecutar: sqlcmd -S 192.168.0.250 -d SGUEES -U erp -P ... -f 65001 -i DEPLOY_COM_PROVISION_PAGO.sql
*/
SET NOCOUNT ON;
PRINT N'=== DEPLOY COM_PROVISION / COM_PAGO ===';

-- Nota: este script asume que los archivos DDL/SP/VIEW ya están en el repo
-- y se aplican vía Publish script o sqlcmd individuales. Aquí se listan en orden.

PRINT N'1) Tablas (crear si no existen) — usar archivos Tables/dbo.COM_*.sql';
PRINT N'2) Vistas — Views/dbo.V_COM_PROVISION*.sql y V_COM_PAGO*.sql';
PRINT N'3) SP — Stored Procedures/dbo.PRAL_*COM_PROVISION*.sql y *COM_PAGO*.sql';
PRINT N'Orden sugerido: TABLES -> VIEWS -> DATA SP -> MTTO -> GENE -> APLICAR/ANULAR/DESAPLICAR';
GO
