SET QUOTED_IDENTIFIER ON
GO
SET ANSI_NULLS ON
GO

CREATE VIEW [dbo].[V_GEN_TIPO_DOCUMENTO]
AS
SELECT A.CORR_EMPRESA
      ,A.CORR_TIPO_DOC
      ,A.NOMBRE_TIPO_DOC
      ,A.NOMBRE_CORTO_TIPO_DOC
      ,A.USAR_COMPRAS 
      ,A.USAR_VENTAS 
      ,A.CLASE_DOCUMENTO 
      ,CASE A.CLASE_DOCUMENTO 
       WHEN 'FAC' THEN 'No Contribuyente'
       WHEN 'CCF' THEN 'Contribuyente'
       WHEN 'FEX' THEN 'Factura de Exportación'
       WHEN 'ING' THEN 'Ingreso'
       WHEN 'NCR' THEN 'Nota de Crédito'
       WHEN 'NDB' THEN 'Nota de Débito'
       WHEN 'AJU' THEN 'Ajuste'
       WHEN 'ANT' THEN 'Anticipo'
       WHEN 'CRT' THEN 'Comp. Retención'
       WHEN 'INT' THEN 'Internación'
       WHEN 'IMP' THEN 'Importación'
       ELSE '' END AS NOMBRE_CLASE_DOCUMENTO
      ,A.SUMA_RESTA 
      ,CASE A.SUMA_RESTA
		WHEN 1 THEN 'Suma'
		WHEN -1 THEN 'Resta'
		ELSE 'N/A' END AS NOMBRE_SUMA_RESTA 
	  ,ISNULL(A.LIBRO_IVA,'NIN') LIBRO_IVA
	  ,CASE A.LIBRO_IVA 
       WHEN 'VCO' THEN 'Ventas Contribuyentes'
       WHEN 'VNC' THEN 'Ventas No Contribuyentes'
       WHEN 'CCO' THEN 'Compras Contribuyentes'
       ELSE 'Ninguno' END AS NOMBRE_LIBRO_IVA
	   ,ISNULL(A.ES_ELECTRONICO,0)ES_ELECTRONICO
FROM GEN_TIPO_DOCUMENTO A

GO
