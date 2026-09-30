-- Qué hace: vista de vínculo empresa-persona para API anidada en gen-empleado.
-- Cómo lo hace: proyecta llave compuesta y auditoría.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER VIEW [dbo].[V_GEN_EMPRESA_PERSONA]
AS
SELECT
	A.CORR_EMPRESA,
	A.CORR_PERSONA,
	A.USUARIO_CREA,
	A.ESTACION_CREA,
	A.FECHA_CREA,
	A.USUARIO_ACTU,
	A.ESTACION_ACTU,
	A.FECHA_ACTU
FROM dbo.GEN_EMPRESA_PERSONA AS A;
GO
