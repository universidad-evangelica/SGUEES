/*
  GEN_PERSONA_BANCO — cuentas bancarias por persona.
  - Crea tabla + vista
  - Actualiza PRAL_MTTO_GEN_PROVEEDOR y V_GEN_PROVEEDOR (sin banco/cuenta en proveedor)
  - Dropea CORR_BANCO / CUENTA_BANCARIA de GEN_PROVEEDOR (sin migración)

  Uso:
    sqlcmd -S <srv> -d SGUEES -U <user> -P <pwd> -f 65001 -i DEPLOY_GEN_PERSONA_BANCO.sql
*/
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT N'=== 1) GEN_PERSONA_BANCO ===';
GO

:r ..\Tables\dbo.GEN_PERSONA_BANCO.sql
GO

PRINT N'=== 2) V_GEN_PERSONA_BANCO ===';
GO

:r ..\Views\dbo.V_GEN_PERSONA_BANCO.sql
GO

PRINT N'=== 3) V_GEN_PROVEEDOR (sin banco) ===';
GO

:r ..\Views\dbo.V_GEN_PROVEEDOR.sql
GO

PRINT N'=== 4) Drop CORR_BANCO / CUENTA_BANCARIA de GEN_PROVEEDOR ===';
GO

IF COL_LENGTH(N'dbo.GEN_PROVEEDOR', N'CUENTA_BANCARIA') IS NOT NULL
BEGIN
	DECLARE @dfCuenta SYSNAME;
	SELECT @dfCuenta = dc.name
	FROM sys.default_constraints dc
	INNER JOIN sys.columns c
		ON c.object_id = dc.parent_object_id
		AND c.column_id = dc.parent_column_id
	WHERE dc.parent_object_id = OBJECT_ID(N'dbo.GEN_PROVEEDOR')
	  AND c.name = N'CUENTA_BANCARIA';

	IF @dfCuenta IS NOT NULL
		EXEC(N'ALTER TABLE dbo.GEN_PROVEEDOR DROP CONSTRAINT [' + @dfCuenta + N']');

	ALTER TABLE dbo.GEN_PROVEEDOR DROP COLUMN [CUENTA_BANCARIA];
	PRINT N'Columna CUENTA_BANCARIA eliminada.';
END
ELSE
	PRINT N'CUENTA_BANCARIA ya no existe.';
GO

IF COL_LENGTH(N'dbo.GEN_PROVEEDOR', N'CORR_BANCO') IS NOT NULL
BEGIN
	DECLARE @fkBanco SYSNAME;
	SELECT TOP (1) @fkBanco = fk.name
	FROM sys.foreign_keys fk
	INNER JOIN sys.foreign_key_columns fkc
		ON fkc.constraint_object_id = fk.object_id
	INNER JOIN sys.columns c
		ON c.object_id = fkc.parent_object_id
		AND c.column_id = fkc.parent_column_id
	WHERE fk.parent_object_id = OBJECT_ID(N'dbo.GEN_PROVEEDOR')
	  AND c.name = N'CORR_BANCO';

	IF @fkBanco IS NOT NULL
		EXEC(N'ALTER TABLE dbo.GEN_PROVEEDOR DROP CONSTRAINT [' + @fkBanco + N']');

	DECLARE @dfBanco SYSNAME;
	SELECT @dfBanco = dc.name
	FROM sys.default_constraints dc
	INNER JOIN sys.columns c
		ON c.object_id = dc.parent_object_id
		AND c.column_id = dc.parent_column_id
	WHERE dc.parent_object_id = OBJECT_ID(N'dbo.GEN_PROVEEDOR')
	  AND c.name = N'CORR_BANCO';

	IF @dfBanco IS NOT NULL
		EXEC(N'ALTER TABLE dbo.GEN_PROVEEDOR DROP CONSTRAINT [' + @dfBanco + N']');

	ALTER TABLE dbo.GEN_PROVEEDOR DROP COLUMN [CORR_BANCO];
	PRINT N'Columna CORR_BANCO eliminada.';
END
ELSE
	PRINT N'CORR_BANCO ya no existe.';
GO

PRINT N'=== 5) PRAL_MTTO_GEN_PROVEEDOR (sin banco) ===';
GO

:r ..\Stored Procedures\dbo.PRAL_MTTO_GEN_PROVEEDOR.sql
GO

PRINT N'=== Verificación ===';
GO

SELECT
	OBJECT_ID(N'dbo.GEN_PERSONA_BANCO', N'U') AS tbl_persona_banco,
	OBJECT_ID(N'dbo.V_GEN_PERSONA_BANCO', N'V') AS v_persona_banco,
	COL_LENGTH(N'dbo.GEN_PROVEEDOR', N'CORR_BANCO') AS col_corr_banco,
	COL_LENGTH(N'dbo.GEN_PROVEEDOR', N'CUENTA_BANCARIA') AS col_cuenta;

PRINT N'=== DEPLOY_GEN_PERSONA_BANCO completado ===';
GO
