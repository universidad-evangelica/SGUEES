CREATE ROLE [db_owner] AUTHORIZATION [dbo]
GO

EXEC sp_addrolemember N'db_owner', N'dbo'
GO