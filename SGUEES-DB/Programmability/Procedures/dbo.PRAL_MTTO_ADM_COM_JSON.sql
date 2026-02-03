SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
CREATE PROCEDURE [dbo].[PRAL_MTTO_ADM_COM_JSON]
(
	@TIPO_ACTUALIZA INT,
	@CORR_SUSCRIPCION int=8,
    @CORR_CONFI_PAIS int=1,
	@CORR_EMPRESA int,
	@CORR_TIENDA int,
	@ANIO_PERIODO int,
	@MES_PERIODO int,
	@CORR_DOCUMENTO int OUTPUT,
	@CORR_EMPRESA_FE INT=NULL,
	@CORR_DOCUMENTO_FE int =NULL,
	@SYS_LOGIN_USUARIO Varchar(30),
	@SYS_ESTACION Varchar(50),
	@SYS_FILAS_AFECTADAS int output,
	@SYS_NUMERO_ERROR numeric(38,0) output,
	@SYS_MENSAJE_ERROR nvarchar(4000) output
)
AS
BEGIN

	SET NOCOUNT ON

	EXECUTE [e-AdminFE].dbo.PRAL_MTTO_ADM_COM_JSON 
	@TIPO_ACTUALIZA ,
	@CORR_SUSCRIPCION ,                             
	@CORR_CONFI_PAIS,                              
	@CORR_EMPRESA,                                 
	@CORR_TIENDA ,                                  
	@ANIO_PERIODO ,                                 
	@MES_PERIODO ,                                  
	@CORR_DOCUMENTO OUTPUT,          
	@CORR_EMPRESA_FE,                              
	@CORR_DOCUMENTO_FE,                            
	@SYS_LOGIN_USUARIO,                           
	@SYS_ESTACION,                                
	@SYS_FILAS_AFECTADAS  OUTPUT,
	@SYS_NUMERO_ERROR  OUTPUT,      
	@SYS_MENSAJE_ERROR OUTPUT     

END
GO