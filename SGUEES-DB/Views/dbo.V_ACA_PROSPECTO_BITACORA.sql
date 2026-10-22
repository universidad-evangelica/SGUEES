-- Qué hace: vista de la bitácora de cambios de una solicitud.
-- Cómo lo hace: expone la tabla y deja el tipo para filtrar nuevo ingreso, socioeconómico o beca.
-- El usuario ejecuta este script. No se corre desde la aplicación.
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER VIEW [dbo].[V_ACA_PROSPECTO_BITACORA]
AS
SELECT
	B.CORR_PROSPECTO_BITACORA,
	B.LOGIN_SISTEMA,
	B.CORR_PROSPECTO,
	B.COMENTARIO,
	B.TIPO_PROSPECTO,
	B.FECHA_ACCION,
	B.USUARIO_CREA,
	B.ESTACION_CREA,
	B.FECHA_CREA,
	B.USUARIO_ACTU,
	B.ESTACION_ACTU,
	B.FECHA_ACTU,
	P.CODIGO_PROSPECTO
FROM dbo.ACA_PROSPECTO_BITACORA AS B
LEFT JOIN dbo.ACA_PROSPECTO AS P
	ON P.CORR_PROSPECTO = B.CORR_PROSPECTO;
GO
