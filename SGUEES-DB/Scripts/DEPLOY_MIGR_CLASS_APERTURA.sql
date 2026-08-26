/*
  Despliega objetos necesarios para partida de apertura CLASS -> SGUEES.
  Ejecutar desde la carpeta Scripts (usa :r relativos).
*/
SET NOCOUNT ON;
GO

PRINT '=== 1. Clase APE y rubros catalogo ===';
:r SETUP_CON_CLASE_PARTIDA_APE.sql
GO
:r FIX_CLASE_RUBRO_CATALOGO.sql
GO

PRINT '=== 2. SP saldo inicial balance (CLASS -> partida APE) ===';
:r MIGRATE_CLASS_SALDO_INICIAL_BALANCE_GENERAL.sql
GO

PRINT '=== 3. SP orquestador apertura completa ===';
:r MIGRATE_CLASS_APERTURA_COMPLETA.sql
GO

PRINT '=== DEPLOY apertura CLASS listo ===';
GO
