-- Qué hace: crea el usuario de servicio PORTAL_ADMISION para iniciar flujos
--           de admisión (nuevo ingreso, socioeconómico y beca).
-- Cómo lo hace: inserta solo SEG_USUARIO. No asigna empresa ni opciones
--               de menú, así que no abre ninguna vista.
-- La clave es aleatoria (HMAC-SHA512). No sirve para entrar al ERP;
-- el motor de flujo solo exige que el login exista y esté activo.
-- El usuario ejecuta este script.
SET NOCOUNT ON;

IF EXISTS (SELECT 1 FROM dbo.SEG_USUARIO WHERE LOGIN_SISTEMA = 'PORTAL_ADMISION')
BEGIN
    PRINT 'PORTAL_ADMISION ya existe. No se insertó.';
    RETURN;
END

INSERT INTO dbo.SEG_USUARIO (
    LOGIN_SISTEMA,
    NOMBRE_USUARIO,
    CLAVE_USUARIO,
    CLAVE_USUARIO_SAL,
    CORREO_ELECTRONICO,
    TIPO_USUARIO,
    ESTADO_USUARIO,
    IDIOMA,
    USUARIO_CREA,
    FECHA_CREA,
    ESTACION_CREA
)
VALUES (
    'PORTAL_ADMISION',
    'Portal de admisiones',
    0x43363BFFD1BDC11B5866A91C476ABAC14530ABD543079DDBA003BC4D2422924862CC586B98D5B7436119CF19E5B741D1C37A2A1C53AD4A3CC05EE83B8D0DD6B4,
    0xB8FE8B03FCEA0E9DA258AE726217DF2610E73198B7385D82ED51F5C942CF5EE8B59A9300777E96C84158F6B44CD34ABDD8081924F69675C2A631A09562940BC35402E1B7D9C38E339D49B76B8C8134AF576FB49C2CD410C1DAA9B7E53BC2EE0D037B1A5D30CE2A12074FFECB428BDF981467CCCE58C613EB73F3913003B82F4F,
    'portal.admision@uees.edu.sv',
    10,
    1,
    'es-SV',
    'juanh',
    GETDATE(),
    'SCRIPT'
);

PRINT 'Usuario PORTAL_ADMISION creado, sin vistas.';
GO

-- Qué hace: deja en PORTAL_ADMISION la misma clave que juanh.
-- Cómo lo hace: copia hash y sal. El login compara esos dos campos.
-- No asigna vistas. El usuario ya existe; este lote es el que se ejecuta.
UPDATE p
SET p.CLAVE_USUARIO = j.CLAVE_USUARIO,
    p.CLAVE_USUARIO_SAL = j.CLAVE_USUARIO_SAL,
    p.USUARIO_ACTU = 'juanh',
    p.FECHA_ACTU = GETDATE(),
    p.FECHA_CAMBIO_CLAVE = GETDATE(),
    p.ESTACION_ACTU = 'SCRIPT'
FROM dbo.SEG_USUARIO AS p
INNER JOIN dbo.SEG_USUARIO AS j
    ON j.LOGIN_SISTEMA = 'juanh'
WHERE p.LOGIN_SISTEMA = 'PORTAL_ADMISION';

IF @@ROWCOUNT = 1
    PRINT 'Clave de PORTAL_ADMISION igualada a juanh.';
ELSE
    PRINT 'No se actualizó. Revisa que existan PORTAL_ADMISION y juanh.';
GO

-- Qué hace: asigna la empresa 1 a PORTAL_ADMISION.
-- Cómo lo hace: inserta SEG_USUARIO_EMPRESA si aún no existe.
-- No asigna opciones de menú.
IF NOT EXISTS (
    SELECT 1
    FROM dbo.SEG_USUARIO_EMPRESA
    WHERE LOGIN_SISTEMA = 'PORTAL_ADMISION'
      AND CORR_EMPRESA = 1
)
BEGIN
    INSERT INTO dbo.SEG_USUARIO_EMPRESA (LOGIN_SISTEMA, CORR_EMPRESA, POR_DEFECTO)
    VALUES ('PORTAL_ADMISION', 1, 1);
    PRINT 'Empresa 1 asignada a PORTAL_ADMISION.';
END
ELSE
    PRINT 'PORTAL_ADMISION ya tiene la empresa 1.';
GO
