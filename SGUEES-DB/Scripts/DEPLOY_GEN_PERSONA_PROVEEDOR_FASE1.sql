/*
  Fase 1 — Proveedores desde GEN_PERSONA (intermedia + vistas sin CLASS).

  - Crea GEN_PERSONA_PROVEEDOR (etiqueta persona ↔ proveedor)
  - Recrea V_GEN_PROVEEDOR (LEFT JOIN natural/jurídica → TIPO_PERSONERIA N/J)
  - Recrea V_COM_PROVEEDOR / DISPONIBLE / COMPRAS sin linked server CLASS
    (SQL CLASS queda comentado en los archivos de vista; no se elimina)

  Uso:
    sqlcmd -S <srv> -d SGUEES -U <user> -P <pwd> -f 65001 -i DEPLOY_GEN_PERSONA_PROVEEDOR_FASE1.sql
*/
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== 1) GEN_PERSONA_PROVEEDOR ===';
GO

:r ..\Tables\dbo.GEN_PERSONA_PROVEEDOR.sql
GO

PRINT N'=== 2) V_GEN_PERSONA_LOOKUP ===';
GO

:r ..\Views\dbo.V_GEN_PERSONA_LOOKUP.sql
GO

PRINT N'=== 3) V_GEN_PROVEEDOR ===';
GO

:r ..\Views\dbo.V_GEN_PROVEEDOR.sql
GO

PRINT N'=== 3b) PRAL_MTTO_GEN_PROVEEDOR ===';
GO

:r ..\Stored Procedures\dbo.PRAL_MTTO_GEN_PROVEEDOR.sql
GO

PRINT N'=== 4) V_COM_PROVEEDOR (sin CLASS) ===';
GO

:r ..\Views\dbo.V_COM_PROVEEDOR.sql
GO

PRINT N'=== 4) V_COM_PROVEEDOR_DISPONIBLE (sin CLASS) ===';
GO

:r ..\Views\dbo.V_COM_PROVEEDOR_DISPONIBLE.sql
GO

PRINT N'=== 5) V_COM_PROVEEDOR_COMPRAS (sin CLASS) ===';
GO

:r ..\Views\dbo.V_COM_PROVEEDOR_COMPRAS.sql
GO

PRINT N'=== Verificación ===';
GO

SELECT
	OBJECT_ID(N'dbo.GEN_PERSONA_PROVEEDOR', N'U') AS tbl_intermedia,
	OBJECT_ID(N'dbo.V_GEN_PROVEEDOR', N'V') AS v_gen,
	OBJECT_ID(N'dbo.V_COM_PROVEEDOR', N'V') AS v_com,
	OBJECT_ID(N'dbo.V_COM_PROVEEDOR_DISPONIBLE', N'V') AS v_disp,
	OBJECT_ID(N'dbo.V_COM_PROVEEDOR_COMPRAS', N'V') AS v_compras;

SELECT COUNT(*) AS filas_v_com_proveedor FROM dbo.V_COM_PROVEEDOR;
SELECT COUNT(*) AS filas_v_gen_proveedor FROM dbo.V_GEN_PROVEEDOR;

PRINT N'=== DEPLOY_GEN_PERSONA_PROVEEDOR_FASE1 completado ===';
GO
