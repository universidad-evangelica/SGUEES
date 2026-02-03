SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
CREATE AGGREGATE [dbo].[StrConcat] (@input [nvarchar](4000))
RETURNS [nvarchar](4000)
EXTERNAL NAME [e_SQLFunctions].[e_SQLFunctions.e_SQLFunctions.StrConcat]
GO