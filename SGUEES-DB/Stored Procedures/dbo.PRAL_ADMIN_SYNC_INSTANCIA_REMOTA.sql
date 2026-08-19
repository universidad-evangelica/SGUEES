SET QUOTED_IDENTIFIER ON
GO
SET ANSI_NULLS ON
GO
/*
  Crea/actualiza linked servers en la instancia SQL local leyendo SYS_INSTANCIA_REMOTA.
  Requiere permisos para ejecutar sp_addlinkedserver / sp_addlinkedsrvlogin (sysadmin o setupadmin).

  Ejemplos:
    EXEC dbo.PRAL_ADMIN_SYNC_INSTANCIA_REMOTA @CODIGO_INSTANCIA = 'CLASS_UEES';
    EXEC dbo.PRAL_ADMIN_SYNC_INSTANCIA_REMOTA;  -- todas las activas
*/
CREATE PROCEDURE [dbo].[PRAL_ADMIN_SYNC_INSTANCIA_REMOTA]
(
	@CODIGO_INSTANCIA VARCHAR(30) = NULL,
	@SYS_LOGIN_USUARIO VARCHAR(30) = NULL,
	@SYS_ESTACION VARCHAR(50) = NULL
)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE
		@Codigo VARCHAR(30),
		@LinkedServer SYSNAME,
		@Servidor VARCHAR(128),
		@BaseDatos VARCHAR(128),
		@UsuarioSql VARCHAR(128),
		@ClaveSql VARCHAR(256),
		@Proveedor VARCHAR(50),
		@TrustCert BIT,
		@Rpc BIT,
		@ProvStr NVARCHAR(4000),
		@Sql NVARCHAR(MAX),
		@ErrMsg NVARCHAR(4000);

	DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
		SELECT
			CODIGO_INSTANCIA,
			NOMBRE_LINKED_SERVER,
			SERVIDOR,
			NOMBRE_BASE_DATOS,
			USUARIO_SQL,
			CLAVE_SQL,
			PROVEEDOR_OLEDB,
			TRUST_SERVER_CERTIFICATE,
			RPC_HABILITADO
		FROM dbo.SYS_INSTANCIA_REMOTA
		WHERE ACTIVO = 1
		  AND (@CODIGO_INSTANCIA IS NULL OR CODIGO_INSTANCIA = @CODIGO_INSTANCIA);

	OPEN cur;
	FETCH NEXT FROM cur INTO @Codigo, @LinkedServer, @Servidor, @BaseDatos, @UsuarioSql, @ClaveSql, @Proveedor, @TrustCert, @Rpc;

	WHILE @@FETCH_STATUS = 0
	BEGIN
		BEGIN TRY
			SET @ProvStr = N'Server=' + @Servidor + N';Initial Catalog=' + @BaseDatos + N';';
			IF @TrustCert = 1
				SET @ProvStr = @ProvStr + N'TrustServerCertificate=Yes;';

			IF EXISTS (SELECT 1 FROM sys.servers WHERE name = @LinkedServer AND is_linked = 1)
				EXEC master.dbo.sp_dropserver @server = @LinkedServer, @droplogins = 'droplogins';

			EXEC master.dbo.sp_addlinkedserver
				@server = @LinkedServer,
				@srvproduct = N'',
				@provider = @Proveedor,
				@provstr = @ProvStr,
				@catalog = @BaseDatos;

			IF @Rpc = 1
			BEGIN
				EXEC master.dbo.sp_serveroption @server = @LinkedServer, @optname = N'rpc', @optvalue = N'true';
				EXEC master.dbo.sp_serveroption @server = @LinkedServer, @optname = N'rpc out', @optvalue = N'true';
			END

			EXEC master.dbo.sp_addlinkedsrvlogin
				@rmtsrvname = @LinkedServer,
				@useself = N'false',
				@locallogin = NULL,
				@rmtuser = @UsuarioSql,
				@rmtpassword = @ClaveSql;

			EXEC sp_testlinkedserver @servername = @LinkedServer;

			UPDATE dbo.SYS_INSTANCIA_REMOTA
			SET USUARIO_ACTU = @SYS_LOGIN_USUARIO,
				FECHA_ACTU = GETDATE(),
				ESTACION_ACTU = @SYS_ESTACION
			WHERE CODIGO_INSTANCIA = @Codigo;

			PRINT N'Linked server sincronizado: ' + @LinkedServer + N' -> ' + @Servidor + N'/' + @BaseDatos;
		END TRY
		BEGIN CATCH
			SET @ErrMsg = ERROR_MESSAGE();
			RAISERROR(N'Error sincronizando instancia [%s]: %s', 16, 1, @Codigo, @ErrMsg);
		END CATCH

		FETCH NEXT FROM cur INTO @Codigo, @LinkedServer, @Servidor, @BaseDatos, @UsuarioSql, @ClaveSql, @Proveedor, @TrustCert, @Rpc;
	END

	CLOSE cur;
	DEALLOCATE cur;
END
GO
