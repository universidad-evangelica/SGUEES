-- =============================================================================
-- Qué hace: prepara el flujo 104 (Solicitud de nuevo ingreso) para poder llamar
--           a PRAL_MTTO_ACA_PROSPECTO_NUEVO_INGRESO_AUTORIZA / EjecutarFlujoProceso.
-- Cómo lo hace:
--   1) Deja cada tipo de documento con el CODIGO_OPCION de menú que ya existe
--      en SEG_OPCION_SISTEMA (FK_SEG_FLUJO_TIPO_DOCUMENTO_OPCION):
--        104 → ACA_PROSPECTO           (Solicitud nuevo ingreso)
--        105 → ACA_PROSPECTO_ECONOMICO (Solicitud socioeconómica)
--        106 → ACA_PROSPECTO_BECA      (Solicitud beca)
--      Así el motor ya no confunde los tres flujos (antes los tres tenían
--      ACA_PROSPECTO).
--   2) Deja la acción inicial del 104 sin notificación obligatoria hasta que
--      haya analistas asignados (actor 7).
--
-- El usuario ejecuta este script en SGUEES ANTES del CREATE del SP Autoriza.
-- No crea tablas ni el SP. Solo ajusta catálogo del flujo.
-- =============================================================================
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @CODIGO_104 VARCHAR(50);
DECLARE @CODIGO_105 VARCHAR(50);
DECLARE @CODIGO_106 VARCHAR(50);
DECLARE @NOTIF_PASO18 VARCHAR(10);

BEGIN TRAN;

-- -----------------------------------------------------------------------------
-- 1) CODIGO_OPCION por tipo = opción de menú ya registrada
-- Qué hace: SEG_FLUJO_TIPO_DOCUMENTO.CODIGO_OPCION tiene FK a SEG_OPCION_SISTEMA.
--           No se inventa un código nuevo; se usan los que ya tiene el menú.
-- -----------------------------------------------------------------------------
UPDATE dbo.SEG_FLUJO_TIPO_DOCUMENTO
SET CODIGO_OPCION = N'ACA_PROSPECTO',
    USUARIO_ACTU = N'juanh',
    ESTACION_ACTU = N'SCRIPT_FLUJO_NI',
    FECHA_ACTU = GETDATE()
WHERE CORR_EMPRESA = 1
  AND CORR_TIPO_DOCUMENTO = 104
  AND CODIGO_OPCION <> N'ACA_PROSPECTO';

UPDATE dbo.SEG_FLUJO_TIPO_DOCUMENTO
SET CODIGO_OPCION = N'ACA_PROSPECTO_ECONOMICO',
    USUARIO_ACTU = N'juanh',
    ESTACION_ACTU = N'SCRIPT_FLUJO_NI',
    FECHA_ACTU = GETDATE()
WHERE CORR_EMPRESA = 1
  AND CORR_TIPO_DOCUMENTO = 105
  AND CODIGO_OPCION <> N'ACA_PROSPECTO_ECONOMICO';

UPDATE dbo.SEG_FLUJO_TIPO_DOCUMENTO
SET CODIGO_OPCION = N'ACA_PROSPECTO_BECA',
    USUARIO_ACTU = N'juanh',
    ESTACION_ACTU = N'SCRIPT_FLUJO_NI',
    FECHA_ACTU = GETDATE()
WHERE CORR_EMPRESA = 1
  AND CORR_TIPO_DOCUMENTO = 106
  AND CODIGO_OPCION <> N'ACA_PROSPECTO_BECA';

SELECT @CODIGO_104 = CODIGO_OPCION FROM dbo.SEG_FLUJO_TIPO_DOCUMENTO WHERE CORR_EMPRESA = 1 AND CORR_TIPO_DOCUMENTO = 104;
SELECT @CODIGO_105 = CODIGO_OPCION FROM dbo.SEG_FLUJO_TIPO_DOCUMENTO WHERE CORR_EMPRESA = 1 AND CORR_TIPO_DOCUMENTO = 105;
SELECT @CODIGO_106 = CODIGO_OPCION FROM dbo.SEG_FLUJO_TIPO_DOCUMENTO WHERE CORR_EMPRESA = 1 AND CORR_TIPO_DOCUMENTO = 106;

PRINT 'Tipo 104 CODIGO_OPCION: ' + ISNULL(@CODIGO_104, '(no encontrado)');
PRINT 'Tipo 105 CODIGO_OPCION: ' + ISNULL(@CODIGO_105, '(no encontrado)');
PRINT 'Tipo 106 CODIGO_OPCION: ' + ISNULL(@CODIGO_106, '(no encontrado)');

-- -----------------------------------------------------------------------------
-- 2) Notificación del primer paso (paso 18, acción 1)
-- Qué hace: sin analistas (actor 7) asignados, la notif SIGUIENTE hace fallar
--           al motor. Se deja NO NOTIFICA (5) para poder probar el envío.
-- -----------------------------------------------------------------------------
UPDATE dbo.SEG_FLUJO_PASO_ACCION_ESTADO
SET CORR_TIPO_NOTIFICACION = 5,
    USUARIO_ACTU = N'juanh',
    ESTACION_ACTU = N'SCRIPT_FLUJO_NI',
    FECHA_ACTU = GETDATE()
WHERE CORR_EMPRESA = 1
  AND CORR_FLUJO_PROCESO = 104
  AND CORR_PASO = 18
  AND CORR_ACCION = 1
  AND CORR_TIPO_NOTIFICACION <> 5;

SELECT @NOTIF_PASO18 = CAST(CORR_TIPO_NOTIFICACION AS VARCHAR(10))
FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO
WHERE CORR_EMPRESA = 1 AND CORR_FLUJO_PROCESO = 104
  AND CORR_PASO = 18 AND CORR_ACCION = 1;

PRINT 'Notificacion paso 18 accion 1: ' + ISNULL(@NOTIF_PASO18, '(no encontrada)');

COMMIT TRAN;
GO

/*
-- Cuando haya analistas de nuevo ingreso (actor 7) asignados, reactivar aviso:
UPDATE dbo.SEG_FLUJO_PASO_ACCION_ESTADO
SET CORR_TIPO_NOTIFICACION = 2, -- SIGUIENTE
    USUARIO_ACTU = N'juanh',
    ESTACION_ACTU = N'SCRIPT_FLUJO_NI',
    FECHA_ACTU = GETDATE()
WHERE CORR_EMPRESA = 1
  AND CORR_FLUJO_PROCESO = 104
  AND CORR_PASO = 18
  AND CORR_ACCION = 1;
*/
