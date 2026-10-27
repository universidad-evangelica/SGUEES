-- Qué hace: documentación de GEN_PROVEEDOR (existente en BD).
-- Modelo objetivo: tabla de ROL (código, pago, banco, estados). Datos generales
-- viven en GEN_PERSONA + NATURAL/JURIDICA; el vínculo en GEN_PERSONA_PROVEEDOR.
-- Las columnas generales aún existen por compatibilidad; la vista V_GEN_PROVEEDOR
-- prioriza persona y usa estas como fallback.
-- Estado activo: ESTADO_PROVEEDOR ('A' Activo / 'I' Inactivo).
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
Tabla: dbo.GEN_PROVEEDOR
PK real BD: (CORR_EMPRESA, CORR_PROVEEDOR) — constraint histórico PK_COM_PROVEEDOR.
*/
CREATE TABLE [dbo].[GEN_PROVEEDOR]
(
	[CORR_EMPRESA] [int] NOT NULL,
	[CORR_PROVEEDOR] [int] NOT NULL,
	[CODIGO_PROVEEDOR] [varchar](20) NOT NULL,
	-- --- generales (legacy / fallback; fuente de verdad = persona) ---
	[TIPO_PERSONERIA] [varchar](1) NOT NULL,
	[NOMBRE_PROVEEDOR] [varchar](150) NOT NULL,
	[PRIMER_NOMBRE] [varchar](50) NOT NULL,
	[SEGUNDO_NOMBRE] [varchar](50) NOT NULL,
	[PRIMER_APELLIDO] [varchar](50) NOT NULL,
	[SEGUNDO_APELLIDO] [varchar](50) NOT NULL,
	[NOMBRE_COMERCIAL] [varchar](150) NOT NULL,
	[CORR_TIPO_DIP] [int] NOT NULL,
	[NUMERO_DIP] [varchar](25) NOT NULL,
	[NUMERO_NRC] [varchar](25) NOT NULL,
	[NUMERO_NIT] [varchar](25) NOT NULL,
	[CORR_ACTIVIDAD_ECONOMICA] [varchar](10) NOT NULL,
	[DIRECCION_PROVEEDOR] [varchar](50) NOT NULL,
	[CORR_PAIS] [int] NOT NULL,
	[CORR_DEPTO] [int] NOT NULL,
	[CORR_MUNICIPIO] [int] NOT NULL,
	[NOMBRE_CONTACTO] [varchar](150) NOT NULL,
	[TELEFONO_FIJO] [varchar](25) NOT NULL,
	[TELEFONO_MOVIL] [varchar](25) NOT NULL,
	[CORREO_ELECTRONICO_1] [varchar](255) NOT NULL,
	[CORREO_ELECTRONICO_2] [varchar](255) NOT NULL,
	-- --- rol proveedor ---
	[CORR_FORMA_PAGO] [int] NOT NULL,
	[CUENTA_BANCARIA] [varchar](30) NOT NULL,
	[CORR_BANCO] [int] NOT NULL,
	[ESTADO_PROVEEDOR] [varchar](1) NOT NULL,
	[ESTADO_PROVEEDOR_WEB] [varchar](1) NOT NULL,
	[CORR_CONDICION_PAGO] [int] NULL,
	[USUARIO_CREA] [varchar](30) NOT NULL,
	[FECHA_CREA] [datetime] NOT NULL,
	[ESTACION_CREA] [varchar](50) NOT NULL,
	[USUARIO_ACTU] [varchar](30) NULL,
	[FECHA_ACTU] [datetime] NULL,
	[ESTACION_ACTU] [varchar](50) NULL,
	CONSTRAINT [PK_COM_PROVEEDOR] PRIMARY KEY CLUSTERED ([CORR_EMPRESA] ASC, [CORR_PROVEEDOR] ASC)
);
GO
