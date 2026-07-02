/*
  Linked server CLASS_UEES en instancia SGUEES (192.168.0.250)
  -> CLASS_UEES en 192.168.1.129 (sa)

  Incluye TrustServerCertificate por certificado no confiable en 1.129.
*/
SET NOCOUNT ON;
GO

IF EXISTS (SELECT 1 FROM sys.servers WHERE name = N'CLASS_UEES' AND is_linked = 1)
BEGIN
    EXEC master.dbo.sp_dropserver @server = N'CLASS_UEES', @droplogins = 'droplogins';
END
GO

EXEC master.dbo.sp_addlinkedserver
    @server     = N'CLASS_UEES',
    @srvproduct = N'',
    @provider   = N'MSOLEDBSQL',
    @provstr    = N'Server=192.168.1.129;TrustServerCertificate=Yes;Initial Catalog=CLASS_UEES;',
    @catalog    = N'CLASS_UEES';
GO

EXEC master.dbo.sp_serveroption @server = N'CLASS_UEES', @optname = N'rpc', @optvalue = N'true';
EXEC master.dbo.sp_serveroption @server = N'CLASS_UEES', @optname = N'rpc out', @optvalue = N'true';
GO

EXEC master.dbo.sp_addlinkedsrvlogin
    @rmtsrvname  = N'CLASS_UEES',
    @useself     = N'false',
    @locallogin  = NULL,
    @rmtuser     = N'sa',
    @rmtpassword = N'UEES.1234';
GO

EXEC sp_testlinkedserver @servername = N'CLASS_UEES';
GO

SELECT TOP 3 TRAGLN
FROM CLASS_UEES.CLASS_UEES.dbo.TRANSAC;
GO
