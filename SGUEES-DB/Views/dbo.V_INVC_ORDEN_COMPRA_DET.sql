SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
CREATE VIEW [dbo].[V_INVC_ORDEN_COMPRA_DET]
AS
SELECT        A.CORR_EMPRESA, A.ANIO_PERIODO, A.CORR_CUADRO_COMPARATIVO, B.ORDFAP AS FECHA_ORDEN_COMPRA, B.ORDNUM AS NUMERO_ORDEN_COMPRA, B.ORDCAN AS CANTIDAD, '' AS NOMBRE_UNIDAD_MEDIDA, 
                         E.INVDSC AS NOMBRE_ITEM, B.ORDMUN AS PRECIO_UNITARIO, B.ORDAMT AS MONTO_SUBTOTAL, B.ORDCOD
FROM            dbo.COM_CUADRO_COMPARATIVO_ORDEN_COMPRA AS A INNER JOIN
                         CLASS_UEES.dbo.ORDENCOMPRA AS B ON A.NUMERO_ORDEN = B.ORDNUM INNER JOIN
                         CLASS_UEES.dbo.INVENTARIOS AS E ON E.INVCOD = B.ORDCOD AND E.INVREG = 'E' AND E.INVSUC = '001'
GO

DECLARE @value SQL_VARIANT = CAST(N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
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
               Top = 6
               Left = 38
               Bottom = 247
               Right = 299
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "B"
            Begin Extent = 
               Top = 6
               Left = 337
               Bottom = 310
               Right = 507
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "E"
            Begin Extent = 
               Top = 6
               Left = 545
               Bottom = 269
               Right = 715
            End
            DisplayFlags = 280
            TopColumn = 0
         End
      End
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
' COLLATE Modern_Spanish_CI_AS AS nvarchar(3231))
EXEC sys.sp_addextendedproperty N'MS_DiagramPane1', @value, 'SCHEMA', N'dbo', 'VIEW', N'V_INVC_ORDEN_COMPRA_DET'
GO

EXEC sys.sp_addextendedproperty N'MS_DiagramPaneCount', 1, 'SCHEMA', N'dbo', 'VIEW', N'V_INVC_ORDEN_COMPRA_DET'
GO