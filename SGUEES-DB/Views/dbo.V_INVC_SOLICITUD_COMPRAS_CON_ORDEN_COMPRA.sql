SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
CREATE VIEW [dbo].[V_INVC_SOLICITUD_COMPRAS_CON_ORDEN_COMPRA]
AS
SELECT        A.CORR_EMPRESA, A.ANIO_PERIODO, A.CORR_SOLI_COTIZACION, B.CORR_SOLI_COTIZACION_DETA, B.ANIO_PERIODO_SOLI_COMPRA, B.CORR_SOLI_COMPRA, B.CODIGO_ITEM, I.INVDSC AS NOMBRE_ITEM, B.CANTIDAD, 
                         B.CORR_UNIDAD_MEDIDA, U.NOMBRE_UNIDAD_MEDIDA, B.OBSERVACIONES, 
                         CASE B.ESTADO_SOLI_COTIZACION WHEN 'DI' THEN 'DIGITADO' WHEN 'SO' THEN 'SOLICITADO' WHEN 'AP' THEN 'APLICADO' WHEN 'AN' THEN 'ANULADO' ELSE '' END AS NOMBRE_ESTADO_SOLI_COTIZACION, 
                         B.USUARIO_CREA, B.FECHA_CREA, B.ESTACION_CREA, B.USUARIO_ACTU, B.FECHA_ACTU, B.ESTACION_ACTU, '' AS CORR_DOCUMENTO, 'assets/img/noadjunto1.png' AS IMAGEN_DOCUMENTO, '' AS NOMBRE_ARCHIVO, 
                         CONVERT(VARCHAR, ISNULL(B.ANIO_PERIODO_SOLI_COMPRA, 0)) + '-' + CONVERT(VARCHAR, ISNULL(B.CORR_SOLI_COMPRA, 0)) AS NUMERO_SOLI_COMPRA, ISNULL(B.PRECIO_UNITARIO, 0) AS PRECIO_UNITARIO, 
                         ISNULL(B.MONTO_SUBTOTAL, 0) AS MONTO_SUBTOTAL, D.NUMERO_ORDEN_COMPRA, CAST(NULL AS DATETIME) AS ORDFAP, CC.USUARIO_CREA AS GESTOR_COMPRA, D.ANIO_PERIODO AS ANIO_CUADRO_COMPARATIVO, 
                         D.CORR_CUADRO_COMPARATIVO
FROM            dbo.COM_SOLI_COTIZACION AS A INNER JOIN
                         dbo.COM_SOLI_COTIZACION_DETA AS B ON A.CORR_EMPRESA = B.CORR_EMPRESA AND A.ANIO_PERIODO = B.ANIO_PERIODO AND A.CORR_SOLI_COTIZACION = B.CORR_SOLI_COTIZACION INNER JOIN
                         dbo.COM_CUADRO_COMPARATIVO_SOLI_COTIZACION AS C ON C.CORR_EMPRESA = A.CORR_EMPRESA AND C.ANIO_PERIODO_SOLI_COTI = A.ANIO_PERIODO AND 
                         C.CORR_SOLI_COTIZACION = A.CORR_SOLI_COTIZACION INNER JOIN
                         dbo.V_INVC_ORDEN_COMPRA_DET AS D ON C.ANIO_PERIODO = D.ANIO_PERIODO AND C.CORR_CUADRO_COMPARATIVO = D.CORR_CUADRO_COMPARATIVO AND 
                         B.CODIGO_ITEM = D.ORDCOD COLLATE DATABASE_DEFAULT INNER JOIN
                         dbo.COM_CUADRO_COMPARATIVO AS CC ON C.CORR_EMPRESA = CC.CORR_EMPRESA AND C.ANIO_PERIODO = CC.ANIO_PERIODO AND C.CORR_CUADRO_COMPARATIVO = CC.CORR_CUADRO_COMPARATIVO INNER JOIN
                         CLASS_UEES.dbo.INVENTARIOS AS I ON I.INVCOD = B.CODIGO_ITEM COLLATE DATABASE_DEFAULT AND I.INVREG = 'E' AND I.INVSUC = '001' LEFT OUTER JOIN
                         dbo.COM_UNIDAD_MEDIDA AS U ON B.CORR_EMPRESA = U.CORR_EMPRESA AND B.CORR_UNIDAD_MEDIDA = U.CORR_UNIDAD_MEDIDA
WHERE        (A.ESTADO_SOLI_COTIZACION IN ('SO', 'AP'))
GO

DECLARE @value SQL_VARIANT = CAST(N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[55] 4[5] 2[36] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "A"
            Begin Extent = 
               Top = 252
               Left = 0
               Bottom = 424
               Right = 256
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "B"
            Begin Extent = 
               Top = 0
               Left = 0
               Bottom = 394
               Right = 257
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "C"
            Begin Extent = 
               Top = 7
               Left = 75
               Bottom = 367
               Right = 336
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "CC"
            Begin Extent = 
               Top = 138
               Left = 337
               Bottom = 530
               Right = 657
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "I"
            Begin Extent = 
               Top = 6
               Left = 926
               Bottom = 136
               Right = 1096
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "U"
            Begin Extent = 
               Top = 138
               Left = 695
               Bottom = 268
               Right = 931
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "D"
            Begin Extent = 
               Top = 6
               Left = 374
               Bottom = 136
               Right = 635
            End
            DisplayFlags = 280
            TopColumn = 0
         End
     ' COLLATE Modern_Spanish_CI_AS AS nvarchar(3749))
EXEC sys.sp_addextendedproperty N'MS_DiagramPane1', @value, 'SCHEMA', N'dbo', 'VIEW', N'V_INVC_SOLICITUD_COMPRAS_CON_ORDEN_COMPRA'
GO

DECLARE @value SQL_VARIANT = CAST(N' End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' COLLATE Modern_Spanish_CI_AS AS nvarchar(505))
EXEC sys.sp_addextendedproperty N'MS_DiagramPane2', @value, 'SCHEMA', N'dbo', 'VIEW', N'V_INVC_SOLICITUD_COMPRAS_CON_ORDEN_COMPRA'
GO

EXEC sys.sp_addextendedproperty N'MS_DiagramPaneCount', 2, 'SCHEMA', N'dbo', 'VIEW', N'V_INVC_SOLICITUD_COMPRAS_CON_ORDEN_COMPRA'
GO