SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
CREATE VIEW [dbo].[V_INVC_CUADRO_COMPARATIVO_ORDEN]
AS
SELECT DISTINCT 
                         A.CORR_EMPRESA, A.ANIO_PERIODO, A.CORR_CUADRO_COMPARATIVO, A.NUMERO_ORDEN, A.CORR_PROVEEDOR, B.CLINAM AS NOMBRE_PROVEEDOR, A.MONTO_TOTAL_ORDEN, LTRIM(RTRIM(ISNULL(B.CLICTO, ''))) 
                         AS NOMBRE_CONTACTO, A.CORR_CONDICION_PAGO, C.NOMBRE_CONDICION_PAGO, D.CORR_FORMA_PAGO, D.NOMBRE_FORMA_PAGO, A.DETALLE_FORMA_PAGO, E.ORDSTO AS ESTADO_ORDEN_COMPRA, 
                         CASE E.ORDSTS WHEN 'P' THEN 'Pendiente de Compra' WHEN 'A' THEN 'Anulado' ELSE '' END AS NOMBRE_ESTADO_ORDEN_COMPRA, E.ORDFAP, CC.USUARIO_CREA AS GESTOR_COMPRA
FROM            dbo.COM_CUADRO_COMPARATIVO_ORDEN_COMPRA AS A INNER JOIN
                         CLASS_UEES.dbo.CLIENTES AS B ON A.CORR_PROVEEDOR = B.CLIIDU LEFT OUTER JOIN
                         dbo.COM_CONDICION_PAGO AS C ON A.CORR_EMPRESA = C.CORR_EMPRESA AND A.CORR_CONDICION_PAGO = C.CORR_CONDICION_PAGO LEFT OUTER JOIN
                         dbo.V_GEN_FORMA_PAGO AS D ON A.CORR_FORMA_PAGO = D.CORR_FORMA_PAGO INNER JOIN
                         CLASS_UEES.dbo.ORDENCOMPRA AS E ON A.NUMERO_ORDEN = E.ORDNUM INNER JOIN
                         dbo.COM_CUADRO_COMPARATIVO AS CC ON A.CORR_EMPRESA = CC.CORR_EMPRESA AND A.ANIO_PERIODO = CC.ANIO_PERIODO AND A.CORR_CUADRO_COMPARATIVO = CC.CORR_CUADRO_COMPARATIVO
GO

DECLARE @value SQL_VARIANT = CAST(N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[9] 2[33] 3) )"
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
         Top = -576
         Left = 0
      End
      Begin Tables = 
         Begin Table = "A"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 317
               Right = 299
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "B"
            Begin Extent = 
               Top = 6
               Left = 337
               Bottom = 302
               Right = 507
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "C"
            Begin Extent = 
               Top = 6
               Left = 545
               Bottom = 296
               Right = 791
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "D"
            Begin Extent = 
               Top = 6
               Left = 829
               Bottom = 280
               Right = 1050
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "E"
            Begin Extent = 
               Top = 6
               Left = 1088
               Bottom = 335
               Right = 1258
            End
            DisplayFlags = 280
            TopColumn = 0
         End
         Begin Table = "CC"
            Begin Extent = 
               Top = 324
               Left = 184
               Bottom = 613
               Right = 504
            End
            DisplayFlags = 280
            TopColumn = 9
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
    ' COLLATE Modern_Spanish_CI_AS AS nvarchar(3749))
EXEC sys.sp_addextendedproperty N'MS_DiagramPane1', @value, 'SCHEMA', N'dbo', 'VIEW', N'V_INVC_CUADRO_COMPARATIVO_ORDEN'
GO

DECLARE @value SQL_VARIANT = CAST(N'     Output = 720
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
' COLLATE Modern_Spanish_CI_AS AS nvarchar(255))
EXEC sys.sp_addextendedproperty N'MS_DiagramPane2', @value, 'SCHEMA', N'dbo', 'VIEW', N'V_INVC_CUADRO_COMPARATIVO_ORDEN'
GO

EXEC sys.sp_addextendedproperty N'MS_DiagramPaneCount', 2, 'SCHEMA', N'dbo', 'VIEW', N'V_INVC_CUADRO_COMPARATIVO_ORDEN'
GO