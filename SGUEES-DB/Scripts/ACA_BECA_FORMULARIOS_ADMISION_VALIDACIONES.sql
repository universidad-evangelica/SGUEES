-- Disponibilidad de nuevas postulaciones y validacion del envio en SGUEES.
-- Instalar despues de ACA_BECA_FORMULARIOS_VERSIONES_MTTO.sql. No modifica SIS_ADMISION.
SET XACT_ABORT ON;
IF DB_NAME()<>'SGUEES' THROW 51000,N'Este script requiere SGUEES.',1;
GO
CREATE OR ALTER VIEW dbo.V_ACA_BECA_FORMULARIO_CICLO
AS SELECT CORR_PERIODO_ACADEMICO,ANIO,NUMERO_PERIODO,ACTIVO FROM dbo.V_ACA_BECA_ADMISION_PERIODO;
GO
CREATE OR ALTER FUNCTION dbo.ACA_FN_BECA_PREGUNTAS_VISIBLES(@Solicitud int,@Empresa int)
RETURNS @Visibles TABLE(CORR_PREGUNTA_BECA int PRIMARY KEY,TIPO_RESPUESTA varchar(30),REQUERIDO bit)
AS
BEGIN
 DECLARE @Beca int,@Version int;
 SELECT @Beca=CORR_BECA,@Version=CORR_FORMULARIO_VERSION FROM dbo.ACA_PROSPECTO_BECA WHERE CORR_PROSPECTO_BECA=@Solicitud AND CORR_EMPRESA=@Empresa;
 DECLARE @Preguntas TABLE(Id int PRIMARY KEY,Tipo varchar(30),Requerido bit);
 INSERT @Preguntas
 SELECT P.CORR_PREGUNTA_BECA,P.TIPO_RESPUESTA,P.REQUERIDO FROM dbo.ACA_PROSPECTO_BECA_PREGUNTA P
 JOIN dbo.ACA_PROSPECTO_BECA_SECCION S ON S.CORR_SECCION_BECA=P.CORR_SECCION_BECA AND S.CORR_EMPRESA=P.CORR_EMPRESA
 WHERE S.CORR_EMPRESA=@Empresa AND S.CORR_FORMULARIO_VERSION=@Version AND S.ACTIVO=1 AND P.ACTIVO=1
  AND EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_PREGUNTA_TIPO PT WHERE PT.CORR_PREGUNTA_BECA=P.CORR_PREGUNTA_BECA AND PT.CORR_EMPRESA=@Empresa AND PT.CORR_BECA=@Beca AND PT.ACTIVO=1);
 INSERT @Visibles SELECT Id,Tipo,Requerido FROM @Preguntas P
 WHERE NOT EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_DEPENDENCIA D WHERE D.CORR_PREGUNTA_HIJA=P.Id AND D.CORR_EMPRESA=@Empresa AND D.ACTIVO=1);
 WHILE 1=1
 BEGIN
  INSERT @Visibles SELECT P.Id,P.Tipo,P.Requerido FROM @Preguntas P WHERE NOT EXISTS(SELECT 1 FROM @Visibles V WHERE V.CORR_PREGUNTA_BECA=P.Id)
   AND EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_DEPENDENCIA D JOIN @Visibles V ON V.CORR_PREGUNTA_BECA=D.CORR_PREGUNTA_PADRE
    JOIN dbo.ACA_PROSPECTO_BECA_RESPUESTA R ON R.CORR_PREGUNTA_BECA=D.CORR_PREGUNTA_PADRE AND R.CORR_OPCION_BECA=D.CORR_OPCION_PADRE
    WHERE D.CORR_PREGUNTA_HIJA=P.Id AND D.CORR_EMPRESA=@Empresa AND D.ACTIVO=1 AND R.CORR_EMPRESA=@Empresa AND R.CORR_PROSPECTO_BECA=@Solicitud);
  IF @@ROWCOUNT=0 BREAK;
 END;
 RETURN;
END;
GO
CREATE OR ALTER PROCEDURE dbo.ACA_SP_BECA_ADMISION_VALIDAR_ENVIO @Solicitud int,@Empresa int
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA B JOIN dbo.ACA_PROSPECTO_BECA_FORMULARIO_VERSION V ON V.CORR_FORMULARIO_VERSION=B.CORR_FORMULARIO_VERSION AND V.CORR_EMPRESA=B.CORR_EMPRESA
  WHERE B.CORR_PROSPECTO_BECA=@Solicitud AND B.CORR_EMPRESA=@Empresa AND V.ESTADO_VERSION='PUBLICADA')
  THROW 51028,N'La solicitud no tiene una version publicada valida.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA B JOIN dbo.ACA_BECA_TIPO T ON T.CORR_BECA=B.CORR_BECA AND T.CORR_EMPRESA=B.CORR_EMPRESA
  JOIN dbo.ACA_PROSPECTO_BECA_FORMULARIO_VERSION V ON V.CORR_FORMULARIO_VERSION=B.CORR_FORMULARIO_VERSION AND V.CORR_EMPRESA=B.CORR_EMPRESA
  WHERE B.CORR_PROSPECTO_BECA=@Solicitud AND B.CORR_EMPRESA=@Empresa AND T.ESTADO_BECA='ACTIVA' AND V.ACTIVO=1
   AND V.FECHA_INICIO<=CONVERT(date,GETDATE()) AND (V.FECHA_FIN IS NULL OR V.FECHA_FIN>=CONVERT(date,GETDATE())))
  THROW 51028,N'La beca o la version no esta activa o el plazo de envio no esta vigente.',1;
 IF NOT EXISTS(SELECT 1 FROM dbo.ACA_FN_BECA_PREGUNTAS_VISIBLES(@Solicitud,@Empresa))
  THROW 51028,N'La solicitud no tiene preguntas configuradas para esta beca.',1;
 IF EXISTS(SELECT 1 FROM dbo.ACA_FN_BECA_PREGUNTAS_VISIBLES(@Solicitud,@Empresa) P WHERE P.REQUERIDO=1 AND NOT EXISTS(
  SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R WHERE R.CORR_PROSPECTO_BECA=@Solicitud AND R.CORR_EMPRESA=@Empresa AND R.CORR_PREGUNTA_BECA=P.CORR_PREGUNTA_BECA AND (
   (P.TIPO_RESPUESTA='DOCUMENTO' AND NULLIF(LTRIM(RTRIM(R.ARCHIVO_RUTA)),'') IS NOT NULL AND NULLIF(LTRIM(RTRIM(R.ARCHIVO_NOMBRE)),'') IS NOT NULL)
   OR (P.TIPO_RESPUESTA IN('NUMERO','DECIMAL') AND R.RESPUESTA_NUMERO IS NOT NULL AND R.RESPUESTA_NUMERO>=0)
   OR (P.TIPO_RESPUESTA='FECHA' AND R.RESPUESTA_FECHA IS NOT NULL)
   OR (P.TIPO_RESPUESTA IN('OPCION_UNICA','OPCION_MULTIPLE','SI_NO') AND EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_OPCION O WHERE O.CORR_OPCION_BECA=R.CORR_OPCION_BECA AND O.CORR_PREGUNTA_BECA=P.CORR_PREGUNTA_BECA AND O.CORR_EMPRESA=@Empresa AND O.ACTIVO=1))
   OR (P.TIPO_RESPUESTA='ACEPTACION' AND LTRIM(RTRIM(R.RESPUESTA_TEXTO)) IN('Acepto','true'))
   OR (P.TIPO_RESPUESTA IN('TEXTO','TEXTO_LARGO') AND NULLIF(LTRIM(RTRIM(REPLACE(REPLACE(REPLACE(R.RESPUESTA_TEXTO,CHAR(9),''),CHAR(10),''),CHAR(13),''))),'') IS NOT NULL))))
  THROW 51028,N'Complete las preguntas y adjunte los documentos obligatorios antes de enviar la solicitud de beca.',1;
END;
GO

CREATE OR ALTER PROCEDURE dbo.ACA_SP_BECA_ADMISION_ENVIAR
    @UsuarioId int,@CorrEmpresa int,@CorrProspectoBeca int,@Estacion varchar(50)=NULL
AS
BEGIN
    SET @Estacion=COALESCE(NULLIF(@Estacion,''),CONVERT(varchar(50),HOST_NAME()));
    SET NOCOUNT ON; SET XACT_ABORT ON;
    DECLARE @InformationId int,@Usuario varchar(100),@Fuente nvarchar(max),@Periodo int,@Anio smallint,@Numero tinyint,@Json nvarchar(max),@Lock int,@Recurso nvarchar(255);
    EXEC dbo.ACA_SP_BECA_ADMISION_IDENTIDAD @UsuarioId,@InformationId OUTPUT,@Usuario OUTPUT,@Fuente OUTPUT,@Periodo OUTPUT,@Anio OUTPUT,@Numero OUTPUT,@CorrEmpresa=@CorrEmpresa;
    SET @Recurso=CONCAT('BECA_ADMISION:',@CorrEmpresa,':',@InformationId);
    BEGIN TRY
        BEGIN TRANSACTION;
        EXEC @Lock=sys.sp_getapplock @Resource=@Recurso,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
        IF @Lock<0 THROW 51013,'Otra operacion esta actualizando la solicitud.',1;
        IF NOT EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA WITH(UPDLOCK,HOLDLOCK) WHERE CORR_PROSPECTO_BECA=@CorrProspectoBeca AND INFORMATION_ID_SIS_ADMISION=@InformationId AND CORR_EMPRESA=@CorrEmpresa AND ACTIVO=1 AND ESTADO_BECA='BORRADOR')
            THROW 51022,'La solicitud no pertenece al usuario o no esta en borrador.',1;
        EXEC dbo.ACA_SP_BECA_ADMISION_VALIDAR_ENVIO @CorrProspectoBeca,@CorrEmpresa;
        UPDATE dbo.ACA_PROSPECTO_BECA SET ESTADO_BECA='ENVIADA',FECHA_SOLICITUD=GETDATE(),
            USUARIO_ACTU=@Usuario,ESTACION_ACTU=@Estacion,FECHA_ACTU=GETDATE()
        WHERE CORR_PROSPECTO_BECA=@CorrProspectoBeca AND INFORMATION_ID_SIS_ADMISION=@InformationId
            AND CORR_EMPRESA=@CorrEmpresa AND ACTIVO=1 AND ESTADO_BECA='BORRADOR';
        IF @@ROWCOUNT=0 THROW 51022,'La solicitud no pertenece al usuario o no esta en borrador.',1;
        UPDATE dbo.ACA_PROSPECTO_BECA SET ACTIVO=0,USUARIO_ACTU=@Usuario,ESTACION_ACTU=@Estacion,FECHA_ACTU=GETDATE()
        WHERE INFORMATION_ID_SIS_ADMISION=@InformationId AND CORR_EMPRESA=@CorrEmpresa
            AND CORR_PROSPECTO_BECA<>@CorrProspectoBeca AND ACTIVO=1 AND ESTADO_BECA='BORRADOR';
        EXEC dbo.ACA_SP_BECA_ADMISION_RESULTADO @CorrProspectoBeca,N'Solicitud de beca enviada correctamente.',@Json OUTPUT;
        COMMIT;
        SELECT @Json Json;
    END TRY
    BEGIN CATCH
        IF XACT_STATE()<>0 ROLLBACK;
        THROW;
    END CATCH;
END;

GO
CREATE OR ALTER PROCEDURE dbo.ACA_SP_BECA_ADMISION_CONSULTAR
    @Operacion varchar(20),@UsuarioId int,@CorrEmpresa int,@InformationId int=NULL,
    @CorrBeca int=NULL,@CorrProspectoBeca int=NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Fuente nvarchar(max),@Usuario varchar(100),@Periodo int,@Anio smallint,@Numero tinyint;
    DECLARE @ValidarAcceso bit=CASE WHEN @Operacion='ACCESO' THEN 0 ELSE 1 END,@PuedeAccederBecas bit;
    EXEC dbo.ACA_SP_BECA_ADMISION_IDENTIDAD @UsuarioId,@InformationId OUTPUT,@Usuario OUTPUT,@Fuente OUTPUT,@Periodo OUTPUT,@Anio OUTPUT,@Numero OUTPUT,
        @CorrEmpresa=@CorrEmpresa,@ValidarAcceso=@ValidarAcceso,@PuedeAccederBecas=@PuedeAccederBecas OUTPUT;
    IF @CorrEmpresa<=0 THROW 51003,'La empresa de la sesion no es valida.',1;
    IF @Operacion='ACCESO'
    BEGIN
        SELECT (SELECT @PuedeAccederBecas PuedeAccederBecas,
            CONVERT(bit,CASE WHEN EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_INTERES
                WHERE INFORMATION_ID_SIS_ADMISION=@InformationId AND CORR_EMPRESA=@CorrEmpresa AND ACTIVO=1)
                OR EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA WHERE INFORMATION_ID_SIS_ADMISION=@InformationId
                    AND CORR_EMPRESA=@CorrEmpresa AND ACTIVO=1 AND ESTADO_BECA IN('BORRADOR','ENVIADA'))
                THEN 1 ELSE 0 END) InteresActivo FOR JSON PATH,WITHOUT_ARRAY_WRAPPER) Json;
        RETURN;
    END;
    DECLARE @X xml=CONVERT(xml,@Fuente),@Json nvarchar(max),@Contexto nvarchar(max),@Tipos nvarchar(max),@Borrador nvarchar(max),@Formulario nvarchar(max),@Version int;
    SET @Contexto=(SELECT @InformationId CorrProspecto,
        COALESCE(NULLIF(@X.value('(/Prospecto/CareerName/text())[1]','nvarchar(200)'),''),@X.value('(/Prospecto/CareerCode/text())[1]','nvarchar(20)')) NombreCarrera,
        @X.value('(/Prospecto/HasDisability/text())[1]','bit') PoseeDiscapacidad,
        COALESCE(NULLIF(@X.value('(/Prospecto/OtherPhysicalLimitation/text())[1]','nvarchar(100)'),''),
            @X.value('(/Prospecto/PhysicalLimitationId/text())[1]','nvarchar(20)')) Discapacidad
        FOR JSON PATH,WITHOUT_ARRAY_WRAPPER);
    IF @Operacion IN ('TIPOS','INICIO')
        SET @Tipos=(SELECT T.CORR_BECA CorrBeca,T.CODIGO_BECA CodigoBeca,T.NOMBRE_BECA NombreBeca,
            T.PORCENTAJE_COBERTURA_REFERENCIAL PorcentajeCoberturaReferencial,T.CUM_MINIMO_RENOVACION CumMinimoRenovacion,
            T.REQUIERE_ESTUDIO_SOCIOECONOMICO RequiereEstudioSocioeconomico,
            FV.CORR_FORMULARIO_VERSION CorrFormularioVersion,FV.VERSION_FORMULARIO VersionFormulario,
            @X.value('(/Prospecto/HasDisability/text())[1]','bit') PoseeDiscapacidadProspecto,
            COALESCE(NULLIF(@X.value('(/Prospecto/OtherPhysicalLimitation/text())[1]','nvarchar(100)'),''),
                @X.value('(/Prospecto/PhysicalLimitationId/text())[1]','nvarchar(20)')) DiscapacidadProspecto
            FROM dbo.ACA_BECA_TIPO T
            CROSS APPLY dbo.ACA_FN_BECA_VERSION_DISPONIBLE(T.CORR_BECA,@CorrEmpresa,@Anio,@Numero,CONVERT(date,GETDATE())) DISP
            JOIN dbo.ACA_PROSPECTO_BECA_FORMULARIO_VERSION FV ON FV.CORR_FORMULARIO_VERSION=DISP.CORR_FORMULARIO_VERSION AND FV.CORR_EMPRESA=T.CORR_EMPRESA
            WHERE T.ESTADO_BECA='ACTIVA' AND T.CORR_EMPRESA=@CorrEmpresa ORDER BY T.NOMBRE_BECA FOR JSON PATH);
    IF @Operacion IN ('BORRADOR','INICIO')
    BEGIN
        EXEC dbo.ACA_SP_BECA_ADMISION_ALINEAR @InformationId,@CorrEmpresa,@Periodo,@Anio,@Numero,@Usuario;
        EXEC dbo.ACA_SP_BECA_ADMISION_BORRADOR @InformationId,@CorrEmpresa,@Borrador OUTPUT;
    END;
    IF @Operacion='INICIO'
    BEGIN
        SELECT TOP(1) @CorrBeca=CORR_BECA,@Version=CORR_FORMULARIO_VERSION FROM dbo.ACA_PROSPECTO_BECA
        WHERE INFORMATION_ID_SIS_ADMISION=@InformationId AND CORR_EMPRESA=@CorrEmpresa AND ACTIVO=1 AND ESTADO_BECA IN ('BORRADOR','ENVIADA')
        ORDER BY CASE WHEN ESTADO_BECA='ENVIADA' THEN 0 ELSE 1 END,ISNULL(FECHA_ACTU,FECHA_CREA) DESC,CORR_PROSPECTO_BECA DESC;
    END;
    IF @Operacion IN ('FORMULARIO','INICIO') AND @CorrBeca IS NOT NULL
        EXEC dbo.ACA_SP_BECA_ADMISION_FORMULARIO @CorrBeca,@CorrEmpresa,@Version,@Formulario OUTPUT;
    IF @Operacion='CONTEXTO' SET @Json=@Contexto;
    ELSE IF @Operacion='TIPOS' SET @Json=@Tipos;
    ELSE IF @Operacion='BORRADOR' SET @Json=@Borrador;
    ELSE IF @Operacion='FORMULARIO' SET @Json=@Formulario;
    ELSE IF @Operacion='INICIO' SET @Json=(SELECT JSON_QUERY(@Contexto) Contexto,JSON_QUERY(@Tipos) Tipos,
        JSON_QUERY(@Borrador) Borrador,JSON_QUERY(@Formulario) Formulario FOR JSON PATH,WITHOUT_ARRAY_WRAPPER);
    ELSE IF @Operacion='PROSPECTO' SET @Json=(SELECT @InformationId CorrProspecto,@InformationId CorrProspectoPersona,
        @X.value('(/Prospecto/Cif/text())[1]','nvarchar(50)') CodigoProspecto,@Periodo CorrPeriodoAcademico,
        @X.value('(/Prospecto/Names/text())[1]','nvarchar(150)') Nombres,
        @X.value('(/Prospecto/FirstLastName/text())[1]','nvarchar(50)') Apellido1,
        @X.value('(/Prospecto/SecondLastName/text())[1]','nvarchar(50)') Apellido2,
        @X.value('(/Prospecto/DUI/text())[1]','nvarchar(25)') Dui,
        @X.value('(/Prospecto/NieNumber/text())[1]','nvarchar(20)') Nie,
        @X.value('(/Prospecto/ResidenceCard/text())[1]','nvarchar(50)') CarnetResidencia,
        @X.value('(/Prospecto/BirthDate/text())[1]','datetime2') FechaNacimiento,
        @X.value('(/Prospecto/CurrentAddress/text())[1]','nvarchar(300)') DireccionActual,
        @X.value('(/Prospecto/PhoneNumber/text())[1]','nvarchar(20)') Telefono,
        @X.value('(/Prospecto/Email/text())[1]','nvarchar(100)') Correo,
        @X.value('(/Prospecto/TypeModality/text())[1]','nvarchar(10)') CodigoPlan,
        @X.value('(/Prospecto/TypeModality/text())[1]','nvarchar(10)') NombrePlan,
        COALESCE(NULLIF(@X.value('(/Prospecto/CareerName/text())[1]','nvarchar(100)'),''),@X.value('(/Prospecto/CareerCode/text())[1]','nvarchar(20)')) NombreCarrera FOR JSON PATH,WITHOUT_ARRAY_WRAPPER);
    ELSE IF @Operacion='INTERES' SET @Json=(SELECT CONVERT(bit,CASE WHEN EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_INTERES
        WHERE INFORMATION_ID_SIS_ADMISION=@InformationId AND CORR_EMPRESA=@CorrEmpresa AND ACTIVO=1)
        OR EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA WHERE INFORMATION_ID_SIS_ADMISION=@InformationId AND CORR_EMPRESA=@CorrEmpresa AND ACTIVO=1 AND ESTADO_BECA IN ('BORRADOR','ENVIADA'))
        THEN 1 ELSE 0 END) Activo FOR JSON PATH,WITHOUT_ARRAY_WRAPPER);
    ELSE IF @Operacion='CARPETA'
    BEGIN
        IF NOT EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA WHERE CORR_PROSPECTO_BECA=@CorrProspectoBeca
            AND INFORMATION_ID_SIS_ADMISION=@InformationId AND CORR_EMPRESA=@CorrEmpresa AND ACTIVO=1 AND ESTADO_BECA='BORRADOR')
            THROW 51004,'La solicitud no pertenece al usuario o no esta en borrador.',1;
        SET @Json=(SELECT B.INFORMATION_ID_SIS_ADMISION InformationId,B.Cif,B.ANIO_ADMISION Anio,B.NUMERO_PERIODO_ADMISION NumeroPeriodo,
            JSON_QUERY(COALESCE((SELECT R.ARCHIVO_RUTA Ruta FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R
                JOIN dbo.ACA_PROSPECTO_BECA BB ON BB.CORR_PROSPECTO_BECA=R.CORR_PROSPECTO_BECA
                WHERE BB.INFORMATION_ID_SIS_ADMISION=@InformationId AND BB.CORR_EMPRESA=@CorrEmpresa AND NULLIF(R.ARCHIVO_RUTA,'') IS NOT NULL FOR JSON PATH),N'[]')) Rutas
            FROM dbo.ACA_PROSPECTO_BECA B WHERE B.CORR_PROSPECTO_BECA=@CorrProspectoBeca FOR JSON PATH,WITHOUT_ARRAY_WRAPPER);
    END
    ELSE THROW 51005,'Consulta de becas no valida.',1;
    SELECT NULLIF(@Json,'') Json;
END;

GO
CREATE OR ALTER PROCEDURE dbo.ACA_SP_BECA_ADMISION_FORMULARIO
    @CorrBeca int, @CorrEmpresa int, @Version int=NULL, @Json nvarchar(max) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Historica bit=CASE WHEN EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA WHERE CORR_EMPRESA=@CorrEmpresa AND CORR_BECA=@CorrBeca AND CORR_FORMULARIO_VERSION=@Version) THEN 1 ELSE 0 END;
    IF @Historica=0
    BEGIN
        DECLARE @Anio int,@Numero int;
        SELECT TOP(1) @Anio=ANIO,@Numero=NUMERO_PERIODO FROM dbo.V_ACA_BECA_ADMISION_PERIODO WHERE ACTIVO=1 ORDER BY ANIO DESC,NUMERO_PERIODO DESC;
        SET @Version=NULL;
        SELECT @Version=CORR_FORMULARIO_VERSION FROM dbo.ACA_FN_BECA_VERSION_DISPONIBLE(@CorrBeca,@CorrEmpresa,@Anio,@Numero,CONVERT(date,GETDATE()));
    END;
    SET @Json=(SELECT T.CORR_BECA CorrBeca,T.CODIGO_BECA CodigoBeca,T.NOMBRE_BECA NombreBeca,
        F.CORR_FORMULARIO_BECA CorrFormularioBeca,F.NOMBRE_FORMULARIO NombreFormulario,
        FV.CORR_FORMULARIO_VERSION CorrFormularioVersion,FV.VERSION_FORMULARIO VersionFormulario,
        JSON_QUERY(COALESCE((SELECT S.CORR_SECCION_BECA CorrSeccionBeca,S.NOMBRE_SECCION NombreSeccion,
            S.DESCRIPCION Descripcion,S.ORDEN Orden,
            JSON_QUERY(COALESCE((SELECT P.CORR_SECCION_BECA CorrSeccionBeca,S.NOMBRE_SECCION NombreSeccion,
                S.DESCRIPCION DescripcionSeccion,S.ORDEN OrdenSeccion,P.CORR_PREGUNTA_BECA CorrPreguntaBeca,
                P.CODIGO_PREGUNTA CodigoPregunta,P.TEXTO_PREGUNTA TextoPregunta,P.AYUDA Ayuda,
                P.TIPO_RESPUESTA TipoRespuesta,P.REQUERIDO Requerido,P.ORDEN Orden,
                ISNULL(PU.PUNTAJE,0) Puntaje,ISNULL(PU.PORCENTAJE,0) Porcentaje,
                JSON_QUERY(COALESCE((SELECT O.CORR_OPCION_BECA CorrOpcionBeca,O.CORR_PREGUNTA_BECA CorrPreguntaBeca,
                    O.TEXTO_OPCION TextoOpcion,O.ORDEN Orden,ISNULL(OP.PUNTAJE,0) Puntaje,ISNULL(OP.PORCENTAJE,0) Porcentaje
                    FROM dbo.ACA_PROSPECTO_BECA_OPCION O OUTER APPLY (
                        SELECT TOP(1) U.PUNTAJE,U.PORCENTAJE FROM dbo.ACA_PROSPECTO_BECA_PUNTAJE U
                        WHERE U.CORR_OPCION_BECA=O.CORR_OPCION_BECA AND U.ACTIVO=1
                        AND U.FECHA_INICIO<=CONVERT(date,GETDATE()) AND (U.FECHA_FIN IS NULL OR U.FECHA_FIN>=CONVERT(date,GETDATE()))
                        ORDER BY U.FECHA_INICIO DESC,U.CORR_PUNTAJE_BECA DESC) OP
                    WHERE O.CORR_PREGUNTA_BECA=P.CORR_PREGUNTA_BECA AND O.ACTIVO=1
                    ORDER BY O.ORDEN,O.CORR_OPCION_BECA FOR JSON PATH),N'[]')) Opciones,
                JSON_QUERY(COALESCE((SELECT D.CORR_PREGUNTA_PADRE CorrPreguntaPadre,D.CORR_OPCION_PADRE CorrOpcionPadre,
                    D.CORR_PREGUNTA_HIJA CorrPreguntaHija FROM dbo.ACA_PROSPECTO_BECA_DEPENDENCIA D
                    WHERE D.CORR_PREGUNTA_HIJA=P.CORR_PREGUNTA_BECA AND D.ACTIVO=1 FOR JSON PATH),N'[]')) Dependencias
                FROM dbo.ACA_PROSPECTO_BECA_PREGUNTA P
                OUTER APPLY (SELECT TOP(1) U.PUNTAJE,U.PORCENTAJE FROM dbo.ACA_PROSPECTO_BECA_PUNTAJE U
                    WHERE U.CORR_PREGUNTA_BECA=P.CORR_PREGUNTA_BECA AND U.CORR_OPCION_BECA IS NULL AND U.ACTIVO=1
                    AND U.FECHA_INICIO<=CONVERT(date,GETDATE()) AND (U.FECHA_FIN IS NULL OR U.FECHA_FIN>=CONVERT(date,GETDATE()))
                    ORDER BY U.FECHA_INICIO DESC,U.CORR_PUNTAJE_BECA DESC) PU
                WHERE P.CORR_SECCION_BECA=S.CORR_SECCION_BECA AND P.ACTIVO=1
                AND EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_PREGUNTA_TIPO PT
                    WHERE PT.CORR_PREGUNTA_BECA=P.CORR_PREGUNTA_BECA AND PT.CORR_BECA=@CorrBeca AND PT.ACTIVO=1)
                ORDER BY P.ORDEN,P.CORR_PREGUNTA_BECA FOR JSON PATH),N'[]')) Preguntas
            FROM dbo.ACA_PROSPECTO_BECA_SECCION S WHERE S.CORR_FORMULARIO_VERSION=FV.CORR_FORMULARIO_VERSION AND S.ACTIVO=1
            AND EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_PREGUNTA P
                JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA_TIPO PT ON PT.CORR_PREGUNTA_BECA=P.CORR_PREGUNTA_BECA AND PT.CORR_BECA=@CorrBeca AND PT.ACTIVO=1
                WHERE P.CORR_SECCION_BECA=S.CORR_SECCION_BECA AND P.ACTIVO=1)
            ORDER BY S.ORDEN,S.CORR_SECCION_BECA FOR JSON PATH),N'[]')) Secciones
        FROM dbo.ACA_BECA_TIPO T
        JOIN dbo.ACA_PROSPECTO_BECA_FORMULARIO_VERSION FV ON FV.CORR_FORMULARIO_VERSION=@Version AND FV.CORR_EMPRESA=T.CORR_EMPRESA
        JOIN dbo.ACA_PROSPECTO_BECA_FORMULARIO F ON F.CORR_FORMULARIO_BECA=FV.CORR_FORMULARIO_BECA AND F.CORR_EMPRESA=FV.CORR_EMPRESA
        WHERE T.CORR_BECA=@CorrBeca AND T.CORR_EMPRESA=@CorrEmpresa AND (T.ESTADO_BECA='ACTIVA' OR @Historica=1)
        AND FV.CORR_FORMULARIO_VERSION=@Version FOR JSON PATH,WITHOUT_ARRAY_WRAPPER);
END;

GO
CREATE OR ALTER PROCEDURE dbo.ACA_SP_BECA_ADMISION_GUARDAR
    @UsuarioId int,@CorrEmpresa int,@InformationId int,@CorrBeca int,@CorrFormularioVersion int,
    @Observacion nvarchar(1000)=NULL,@Respuestas nvarchar(max)=N'<Respuestas/>',@Estacion varchar(50)=NULL
AS
BEGIN
    SET @Estacion=COALESCE(NULLIF(@Estacion,''),CONVERT(varchar(50),HOST_NAME()));
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    DECLARE @Fuente nvarchar(max),@Usuario varchar(100),@Periodo int,@Anio smallint,@Numero tinyint;
    EXEC dbo.ACA_SP_BECA_ADMISION_IDENTIDAD @UsuarioId,@InformationId OUTPUT,@Usuario OUTPUT,@Fuente OUTPUT,@Periodo OUTPUT,@Anio OUTPUT,@Numero OUTPUT,@CorrEmpresa=@CorrEmpresa;
    IF @Periodo IS NULL THROW 51010,'No hay un periodo academico activo en SIS_ADMISION.',1;
    IF @CorrEmpresa<=0 OR @CorrBeca<=0 OR @CorrFormularioVersion<=0 THROW 51011,'La solicitud no contiene empresa, beca o formulario valido.',1;
    DECLARE @X xml,@FuenteXml xml=CONVERT(xml,@Fuente);
    DECLARE @Cif nvarchar(100)=NULLIF(LTRIM(RTRIM(@FuenteXml.value('(/Prospecto/Cif/text())[1]','nvarchar(100)'))),'');
    IF @Cif IS NULL THROW 51026,'Su ficha de SIS_ADMISION no tiene un CIF valido para guardar la beca.',1;
    IF LEN(@Cif)>50 THROW 51027,'El CIF de la ficha supera la longitud admitida para la solicitud.',1;
    BEGIN TRY
        SET @X=CONVERT(xml,@Respuestas);
    END TRY
    BEGIN CATCH
        THROW 51012,'Las respuestas de la solicitud no son validas.',1;
    END CATCH;
    IF @X IS NULL OR @X.exist('/Respuestas')=0 THROW 51012,'Las respuestas de la solicitud no son validas.',1;
    DECLARE @Id int,@Origen int,@Estado varchar(20),@BecaAnterior int,@VersionAnterior int,@Lock int,@Recurso nvarchar(255),@Json nvarchar(max);
    SET @Recurso=CONCAT('BECA_ADMISION:',@CorrEmpresa,':',@InformationId);
    BEGIN TRY
        BEGIN TRANSACTION;
        EXEC @Lock=sys.sp_getapplock @Resource=@Recurso,@LockMode='Exclusive',@LockOwner='Transaction',@LockTimeout=15000;
        IF @Lock<0 THROW 51013,'Otra operacion esta actualizando la solicitud. Intente nuevamente.',1;
        SELECT @Origen=T.CORR_ORIGEN_BECA FROM dbo.ACA_BECA_TIPO T WITH(UPDLOCK,HOLDLOCK)
        WHERE T.CORR_BECA=@CorrBeca AND T.CORR_EMPRESA=@CorrEmpresa AND T.ESTADO_BECA='ACTIVA'
        AND (EXISTS(SELECT 1 FROM dbo.ACA_FN_BECA_VERSION_DISPONIBLE(@CorrBeca,@CorrEmpresa,@Anio,@Numero,CONVERT(date,GETDATE())) V WHERE V.CORR_FORMULARIO_VERSION=@CorrFormularioVersion)
         OR EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA B WHERE B.CORR_EMPRESA=@CorrEmpresa AND B.INFORMATION_ID_SIS_ADMISION=@InformationId AND B.CORR_BECA=@CorrBeca
          AND B.CORR_FORMULARIO_VERSION=@CorrFormularioVersion AND B.ACTIVO=1 AND B.ESTADO_BECA='BORRADOR'));
        IF @Origen IS NULL THROW 51014,'El tipo de beca no tiene un formulario activo valido.',1;
        IF EXISTS(SELECT 1 FROM dbo.ACA_PROSPECTO_BECA WITH(UPDLOCK,HOLDLOCK)
            WHERE INFORMATION_ID_SIS_ADMISION=@InformationId AND CORR_EMPRESA=@CorrEmpresa AND ACTIVO=1 AND ESTADO_BECA='ENVIADA')
            THROW 51015,'Ya envio su documentacion de beca. La solicitud queda en solo lectura.',1;
        SELECT TOP(1) @Id=CORR_PROSPECTO_BECA,@BecaAnterior=CORR_BECA,@VersionAnterior=CORR_FORMULARIO_VERSION
        FROM dbo.ACA_PROSPECTO_BECA WITH(UPDLOCK,HOLDLOCK)
        WHERE INFORMATION_ID_SIS_ADMISION=@InformationId AND CORR_EMPRESA=@CorrEmpresa AND ACTIVO=1 AND ESTADO_BECA='BORRADOR'
        ORDER BY ISNULL(FECHA_ACTU,FECHA_CREA) DESC,CORR_PROSPECTO_BECA DESC;
        IF @Id IS NOT NULL AND (@BecaAnterior<>@CorrBeca OR @VersionAnterior<>@CorrFormularioVersion)
            THROW 51016,'Ya tiene una beca activa en proceso con otro tipo o version de formulario.',1;
        IF @Id IS NULL
        BEGIN
            INSERT dbo.ACA_PROSPECTO_BECA(INFORMATION_ID_SIS_ADMISION,CORR_PROSPECTO,Cif,CORR_BECA,CORR_ORIGEN_BECA,
                CORR_FORMULARIO_VERSION,CORR_PERIODO_ACADEMICO,PERIODO_ID_SIS_ADMISION,ANIO_ADMISION,NUMERO_PERIODO_ADMISION,
                DATOS_ADMISION,ESTADO_BECA,PUNTAJE_TOTAL,PORCENTAJE_TOTAL,OBSERVACION,ACTIVO,CORR_EMPRESA,USUARIO_CREA,ESTACION_CREA,FECHA_CREA,FECHA_SOLICITUD)
            VALUES(@InformationId,NULL,@Cif,@CorrBeca,@Origen,
                @CorrFormularioVersion,NULL,@Periodo,@Anio,@Numero,@FuenteXml,'BORRADOR',0,0,@Observacion,1,@CorrEmpresa,@Usuario,@Estacion,GETDATE(),GETDATE());
            SET @Id=CONVERT(int,SCOPE_IDENTITY());
        END
        ELSE UPDATE dbo.ACA_PROSPECTO_BECA SET DATOS_ADMISION=@FuenteXml,
            Cif=@Cif,OBSERVACION=@Observacion,
            USUARIO_ACTU=@Usuario,ESTACION_ACTU=@Estacion,FECHA_ACTU=GETDATE()
            WHERE CORR_PROSPECTO_BECA=@Id;

        DECLARE @Entrada TABLE(Pregunta int,Opcion int NULL,Texto nvarchar(max),Numero decimal(18,4),Fecha date);
        INSERT @Entrada
        SELECT DISTINCT N.R.value('(CorrPreguntaBeca/text())[1]','int'),
            COALESCE(O.V.value('(text())[1]','int'),N.R.value('(CorrOpcionBeca/text())[1]','int')),
            N.R.value('(RespuestaTexto/text())[1]','nvarchar(max)'),
            N.R.value('(RespuestaNumero/text())[1]','decimal(18,4)'),N.R.value('(RespuestaFecha/text())[1]','date')
        FROM @X.nodes('/Respuestas/Respuesta') N(R) OUTER APPLY N.R.nodes('Opciones/Opcion') O(V);
        IF EXISTS(SELECT 1 FROM @Entrada WHERE Numero<0) THROW 51017,'Los valores numericos de becas no pueden ser negativos.',1;
        IF EXISTS(SELECT 1 FROM @Entrada E WHERE NOT EXISTS(
            SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_PREGUNTA P
            JOIN dbo.ACA_PROSPECTO_BECA_SECCION S ON S.CORR_SECCION_BECA=P.CORR_SECCION_BECA
            JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA_TIPO PT ON PT.CORR_PREGUNTA_BECA=P.CORR_PREGUNTA_BECA
            WHERE P.CORR_PREGUNTA_BECA=E.Pregunta AND P.ACTIVO=1 AND S.ACTIVO=1 AND PT.ACTIVO=1
            AND S.CORR_FORMULARIO_VERSION=@CorrFormularioVersion AND PT.CORR_BECA=@CorrBeca))
            THROW 51018,'Una pregunta no pertenece al formulario activo de esta beca.',1;
        IF EXISTS(SELECT 1 FROM @Entrada E WHERE E.Opcion IS NOT NULL AND NOT EXISTS(
            SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_OPCION O WHERE O.CORR_OPCION_BECA=E.Opcion AND O.CORR_PREGUNTA_BECA=E.Pregunta AND O.ACTIVO=1))
            THROW 51019,'Una opcion no pertenece a la pregunta o no esta activa.',1;
        IF EXISTS(SELECT 1 FROM @Entrada E JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA P ON P.CORR_PREGUNTA_BECA=E.Pregunta
            WHERE E.Numero>10 AND P.CODIGO_PREGUNTA IN('ACA_PROMEDIO_PRIMERO','ACA_PROMEDIO_SEGUNDO','ACA_PROMEDIO_TERCERO','ACA_PAES_AVANZO_NOTA'))
            THROW 51020,'El promedio o calificacion no puede ser mayor a 10.',1;
        IF EXISTS(SELECT E.Pregunta FROM @Entrada E JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA P ON P.CORR_PREGUNTA_BECA=E.Pregunta
            WHERE P.TIPO_RESPUESTA<>'OPCION_MULTIPLE' GROUP BY E.Pregunta HAVING COUNT(*)>1)
            THROW 51021,'Una pregunta de respuesta unica contiene varias respuestas.',1;
        SELECT E.*,P.TEXTO_PREGUNTA,P.TIPO_RESPUESTA,O.TEXTO_OPCION,
            ISNULL(PU.PUNTAJE,0) Puntaje,ISNULL(PU.PORCENTAJE,0) Porcentaje,R.CORR_RESPUESTA_BECA Existente
        INTO #Respuestas FROM @Entrada E
        JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA P ON P.CORR_PREGUNTA_BECA=E.Pregunta
        LEFT JOIN dbo.ACA_PROSPECTO_BECA_OPCION O ON O.CORR_OPCION_BECA=E.Opcion
        OUTER APPLY(SELECT TOP(1) U.PUNTAJE,U.PORCENTAJE FROM dbo.ACA_PROSPECTO_BECA_PUNTAJE U
            WHERE U.CORR_PREGUNTA_BECA=E.Pregunta AND ((U.CORR_OPCION_BECA IS NULL AND E.Opcion IS NULL) OR U.CORR_OPCION_BECA=E.Opcion)
            AND U.ACTIVO=1 AND U.FECHA_INICIO<=CONVERT(date,GETDATE()) AND (U.FECHA_FIN IS NULL OR U.FECHA_FIN>=CONVERT(date,GETDATE()))
            ORDER BY U.FECHA_INICIO DESC,U.CORR_PUNTAJE_BECA DESC) PU
        OUTER APPLY(SELECT TOP(1) RR.CORR_RESPUESTA_BECA FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA RR
            WHERE RR.CORR_PROSPECTO_BECA=@Id AND RR.CORR_PREGUNTA_BECA=E.Pregunta
            AND (P.TIPO_RESPUESTA<>'OPCION_MULTIPLE' OR RR.CORR_OPCION_BECA=E.Opcion OR (RR.CORR_OPCION_BECA IS NULL AND E.Opcion IS NULL))
            ORDER BY RR.CORR_RESPUESTA_BECA) R;
        DECLARE @Conservar TABLE(Id int PRIMARY KEY);
        UPDATE R SET CORR_OPCION_BECA=E.Opcion,
            RESPUESTA_TEXTO=CASE WHEN NULLIF(R.ARCHIVO_RUTA,'') IS NOT NULL THEN R.RESPUESTA_TEXTO ELSE E.Texto END,
            RESPUESTA_NUMERO=E.Numero,RESPUESTA_FECHA=E.Fecha,PUNTAJE_OBTENIDO=E.Puntaje,PORCENTAJE_APLICADO=E.Porcentaje,
            TEXTO_PREGUNTA_HISTORICO=E.TEXTO_PREGUNTA,TEXTO_OPCION_HISTORICO=E.TEXTO_OPCION,
            USUARIO_ACTU=@Usuario,ESTACION_ACTU=@Estacion,FECHA_ACTU=GETDATE()
        OUTPUT inserted.CORR_RESPUESTA_BECA INTO @Conservar
        FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R JOIN #Respuestas E ON E.Existente=R.CORR_RESPUESTA_BECA;
        INSERT dbo.ACA_PROSPECTO_BECA_RESPUESTA(CORR_PROSPECTO_BECA,CORR_PREGUNTA_BECA,CORR_OPCION_BECA,
            RESPUESTA_TEXTO,RESPUESTA_NUMERO,RESPUESTA_FECHA,PUNTAJE_OBTENIDO,PORCENTAJE_APLICADO,
            TEXTO_PREGUNTA_HISTORICO,TEXTO_OPCION_HISTORICO,FECHA_RESPUESTA,CORR_EMPRESA,USUARIO_CREA,ESTACION_CREA,FECHA_CREA)
        OUTPUT inserted.CORR_RESPUESTA_BECA INTO @Conservar
        SELECT @Id,Pregunta,Opcion,Texto,Numero,Fecha,Puntaje,Porcentaje,TEXTO_PREGUNTA,TEXTO_OPCION,GETDATE(),@CorrEmpresa,@Usuario,@Estacion,GETDATE()
        FROM #Respuestas WHERE Existente IS NULL;
        DELETE R FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R
        WHERE R.CORR_PROSPECTO_BECA=@Id AND NULLIF(LTRIM(RTRIM(R.ARCHIVO_RUTA)),'') IS NULL
            AND NOT EXISTS(SELECT 1 FROM @Conservar C WHERE C.Id=R.CORR_RESPUESTA_BECA);
        EXEC dbo.ACA_SP_BECA_ADMISION_RECALCULAR @Id,@CorrEmpresa;
        EXEC dbo.ACA_SP_BECA_ADMISION_RESULTADO @Id,N'Solicitud de beca guardada correctamente.',@Json OUTPUT;
        COMMIT;
        SELECT @Json Json;
    END TRY
    BEGIN CATCH
        IF XACT_STATE()<>0 ROLLBACK;
        THROW;
    END CATCH;
END;

GO
CREATE OR ALTER PROCEDURE dbo.ACA_SP_BECA_ADMISION_ALINEAR
 @InformationId int,@CorrEmpresa int,@PeriodoId int,@Anio smallint,@Numero tinyint,@Usuario varchar(100)
AS
BEGIN
 SET NOCOUNT ON;
 -- La version y el ciclo guardados forman parte del historial. No reubicar respuestas automaticamente.
 RETURN;
END;
GO
