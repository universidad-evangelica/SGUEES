-- Qué hace: deja el estado inicial de las tres solicitudes en los prospectos que ya existen.
-- Cómo lo hace: inserta Ingresado del documento 104 (38), 105 (40) y 106 (47)
--               solo si ese prospecto todavía no tiene fila de ese documento.
-- El usuario ejecuta este script. No cambia la estructura de la tabla.
SET NOCOUNT ON;

INSERT INTO dbo.ACA_PROSPECTO_ESTADO (
    CORR_EMPRESA,
    CORR_PROSPECTO,
    CORR_TIPO_DOCUMENTO,
    CORR_ESTADO,
    USUARIO_CREA,
    ESTACION_CREA,
    FECHA_CREA
)
SELECT
    AA.CORR_EMPRESA,
    P.CORR_PROSPECTO,
    V.CORR_TIPO_DOCUMENTO,
    V.CORR_ESTADO,
    'juanh',
    'SCRIPT',
    GETDATE()
FROM dbo.ACA_PROSPECTO AS P
INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS AS PA
    ON PA.CORR_PERIODO_ACADEMICO = P.CORR_PERIODO_ACADEMICO
INNER JOIN dbo.ACA_AREAS_ACADEMICAS AS AA
    ON AA.CORR_AREA_ACADEMICA = PA.CORR_AREA_ACADEMICA
INNER JOIN (
    VALUES
        (104, 38),
        (105, 40),
        (106, 47)
) AS V (CORR_TIPO_DOCUMENTO, CORR_ESTADO)
    ON 1 = 1
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.ACA_PROSPECTO_ESTADO AS E
    WHERE E.CORR_EMPRESA = AA.CORR_EMPRESA
      AND E.CORR_PROSPECTO = P.CORR_PROSPECTO
      AND E.CORR_TIPO_DOCUMENTO = V.CORR_TIPO_DOCUMENTO
);
GO
