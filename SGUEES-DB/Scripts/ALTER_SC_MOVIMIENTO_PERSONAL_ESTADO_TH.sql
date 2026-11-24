/* Estado TH: 0=En evaluación, 1=Procesado, 2=Confirmado. */
SET NOCOUNT ON;
GO

IF COL_LENGTH(N'dbo.SC_MOVIMIENTO_PERSONAL', N'CONFIRMADO') IS NOT NULL
BEGIN
	DECLARE @TipoConfirmado SYSNAME;
	SELECT @TipoConfirmado = ty.name
	FROM sys.columns c
	JOIN sys.types ty ON ty.user_type_id = c.user_type_id
	WHERE c.object_id = OBJECT_ID(N'dbo.SC_MOVIMIENTO_PERSONAL')
	  AND c.name = N'CONFIRMADO';

	/* Elimina la restricción por defecto del tipo anterior si existe. */
	DECLARE @DefaultName SYSNAME;
	SELECT @DefaultName = dc.name
	FROM sys.default_constraints dc
	JOIN sys.tables t ON t.object_id = dc.parent_object_id
	JOIN sys.columns c ON c.object_id = t.object_id AND c.column_id = dc.parent_column_id
	WHERE t.name = N'SC_MOVIMIENTO_PERSONAL'
	  AND c.name = N'CONFIRMADO';

	IF @DefaultName IS NOT NULL
	BEGIN
		EXEC(N'ALTER TABLE dbo.SC_MOVIMIENTO_PERSONAL DROP CONSTRAINT [' + @DefaultName + N']');
	END;

	ALTER TABLE dbo.SC_MOVIMIENTO_PERSONAL
		ALTER COLUMN CONFIRMADO TINYINT NOT NULL;

	IF @TipoConfirmado = N'bit'
	BEGIN
		UPDATE dbo.SC_MOVIMIENTO_PERSONAL
		SET CONFIRMADO = CASE WHEN CONFIRMADO = 1 THEN 2 ELSE 0 END;
	END;

	IF NOT EXISTS (
		SELECT 1
		FROM sys.default_constraints dc
		JOIN sys.tables t ON t.object_id = dc.parent_object_id
		JOIN sys.columns c ON c.object_id = t.object_id AND c.column_id = dc.parent_column_id
		WHERE t.name = N'SC_MOVIMIENTO_PERSONAL'
		  AND c.name = N'CONFIRMADO'
	)
	BEGIN
		ALTER TABLE dbo.SC_MOVIMIENTO_PERSONAL
			ADD CONSTRAINT DF_SC_MOVIMIENTO_PERSONAL_CONFIRMADO DEFAULT (0) FOR CONFIRMADO;
	END;
END;
GO

