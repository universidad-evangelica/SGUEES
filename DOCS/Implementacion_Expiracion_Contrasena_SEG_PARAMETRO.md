# Adaptación de Expiración de Contraseña con Tabla SEG_PARAMETRO

## Fecha: 03 de febrero de 2026

## Resumen de Cambios

Se ha adaptado el sistema de expiración de contraseñas para utilizar la tabla `SEG_PARAMETRO` que almacena la configuración por empresa.

### Tabla SEG_PARAMETRO

```sql
CREATE TABLE [dbo].[SEG_PARAMETRO](
	[CORR_EMPRESA] [INT] NOT NULL,
	[CANTIDAD_MESES_EXPIRA_CONTRASENA] [INT] NULL,
 CONSTRAINT [PK_SEG_PARAMETRO] PRIMARY KEY CLUSTERED 
(
	[CORR_EMPRESA] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
```

## Pasos de Implementación

### 1. Crear/Actualizar la tabla SEG_PARAMETRO

Si la tabla no existe, ejecutar el script anterior. Si ya existe, verificar que tenga la columna necesaria:

```sql
-- Verificar si la tabla existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SEG_PARAMETRO')
BEGIN
    CREATE TABLE [dbo].[SEG_PARAMETRO](
        [CORR_EMPRESA] [INT] NOT NULL,
        [CANTIDAD_MESES_EXPIRA_CONTRASENA] [INT] NULL,
     CONSTRAINT [PK_SEG_PARAMETRO] PRIMARY KEY CLUSTERED 
    (
        [CORR_EMPRESA] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
    ) ON [PRIMARY]
END
GO

-- Si la tabla existe pero falta la columna
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SEG_PARAMETRO') AND name = 'CANTIDAD_MESES_EXPIRA_CONTRASENA')
BEGIN
    ALTER TABLE [dbo].[SEG_PARAMETRO]
    ADD [CANTIDAD_MESES_EXPIRA_CONTRASENA] [INT] NULL
END
GO
```

### 2. Insertar datos iniciales para cada empresa

```sql
-- Insertar configuración por defecto para cada empresa existente
-- Ejemplo: 6 meses de vigencia para la contraseña
INSERT INTO SEG_PARAMETRO (CORR_EMPRESA, CANTIDAD_MESES_EXPIRA_CONTRASENA)
SELECT DISTINCT CORR_EMPRESA, 6
FROM SEG_USUARIO
WHERE NOT EXISTS (
    SELECT 1 FROM SEG_PARAMETRO WHERE SEG_PARAMETRO.CORR_EMPRESA = SEG_USUARIO.CORR_EMPRESA
)
GO
```

### 3. Agregar columna FECHA_CAMBIO_CLAVE a la tabla SEG_USUARIO

Esta columna es necesaria para rastrear cuándo fue el último cambio de contraseña:

```sql
-- Verificar si la columna existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('SEG_USUARIO') AND name = 'FECHA_CAMBIO_CLAVE')
BEGIN
    ALTER TABLE [dbo].[SEG_USUARIO]
    ADD [FECHA_CAMBIO_CLAVE] DATETIME NULL
    
    -- Inicializar con la fecha de creación para usuarios existentes
    UPDATE SEG_USUARIO
    SET FECHA_CAMBIO_CLAVE = FECHA_CREACION
    WHERE FECHA_CAMBIO_CLAVE IS NULL
END
GO
```

### 4. Crear/Actualizar el Stored Procedure

El archivo `PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE.sql` ya ha sido creado en la carpeta `SGUEES-DB/Stored Procedures/`.

Ejecutar ese script en la base de datos.

### 5. Actualizar el Stored Procedure de Cambio de Clave

Asegurarse de que cuando se cambie la contraseña, se actualice la columna `FECHA_CAMBIO_CLAVE`:

```sql
-- En el SP de cambio de clave (PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE)
-- Agregar al UPDATE:
UPDATE SEG_USUARIO
SET 
    CLAVE_USUARIO = @CLAVE_USUARIO,
    CLAVE_USUARIO_SAL = @CLAVE_USUARIO_SAL,
    USUARIO_ACTU = @USUARIO_ACTU,
    FECHA_ACTU = @FECHA_ACTU,
    ESTACION_ACTU = @ESTACION_ACTU,
    FECHA_CAMBIO_CLAVE = GETDATE(),  -- <-- AGREGAR ESTA LÍNEA
    FLAG_PRIMER_LOGIN = 0            -- <-- AGREGAR ESTA LÍNEA
WHERE LOGIN_SISTEMA = @LOGIN_SISTEMA
```

**Nota**: La actualización de `FECHA_CAMBIO_CLAVE` se realiza directamente en el SP de cambio de clave. El historial de login (`SEG_USUARIO_LOGIN_HISTORIAL`) registra el evento pero no necesita una bandera especial, ya que `FECHA_CAMBIO_CLAVE` en `SEG_USUARIO` es suficiente para rastrear cuándo fue el último cambio.

## Funcionamiento del Sistema

### Lógica de Expiración

1. **Obtención de parámetros**: El SP lee `CANTIDAD_MESES_EXPIRA_CONTRASENA` de la tabla `SEG_PARAMETRO` según la empresa del usuario.

2. **Validación**:
   - Si `CANTIDAD_MESES_EXPIRA_CONTRASENA` es NULL o 0: La contraseña no expira
   - Si es > 0: Se calcula la fecha de expiración sumando los meses a `FECHA_CAMBIO_CLAVE`

3. **Estados**:
   - **Expirada** (días <= 0): `REQUIERE_CAMBIO_CLAVE = true`
   - **Por expirar** (días <= 7): `REQUIERE_CAMBIO_CLAVE = false`, pero muestra advertencia
   - **Vigente** (días > 7): `REQUIERE_CAMBIO_CLAVE = false`

### Modelo de Datos (C#)

El modelo `SEG_USUARIO_EXPIRACION_CLAVEView` ya está creado y funciona correctamente:

```csharp
public class SEG_USUARIO_EXPIRACION_CLAVEView
{
    public string LOGIN_SISTEMA { get; set; }
    public bool REQUIERE_CAMBIO_CLAVE { get; set; }
    public DateTime? FECHA_ULTIMO_CAMBIO { get; set; }
    public DateTime? FECHA_EXPIRACION { get; set; }
    public int? DIAS_PARA_EXPIRAR { get; set; }
    public int MESES_VIGENCIA { get; set; }
    public string MENSAJE { get; set; }
}
```

### Integración con el Login

El código actual ya está preparado en `SEG_USUARIOService.cs`:

```csharp
// Verificar si la contraseña ha expirado
var validacionExpiracion = await _repo.ValidarExpiracionClaveAsync(LOGIN_SISTEMA);
_logger.LogInformation($"[LoginAsync] Validación expiración - Requiere cambio: {validacionExpiracion.REQUIERE_CAMBIO_CLAVE}, Días para expirar: {validacionExpiracion.DIAS_PARA_EXPIRAR}");

// También requiere cambio si la contraseña ha expirado
bool requiereCambio = (esPrimerLogin && adUserExists) || validacionExpiracion.REQUIERE_CAMBIO_CLAVE;
```

## Configuración por Empresa

### Consultar configuración actual

```sql
SELECT 
    p.CORR_EMPRESA,
    e.NOMBRE_EMPRESA,
    p.CANTIDAD_MESES_EXPIRA_CONTRASENA,
    CASE 
        WHEN p.CANTIDAD_MESES_EXPIRA_CONTRASENA IS NULL OR p.CANTIDAD_MESES_EXPIRA_CONTRASENA = 0 
        THEN 'No expira'
        ELSE CAST(p.CANTIDA_MESES_EXPIRA_CONTRASEÑA AS VARCHAR) + ' meses'
    END AS VIGENCIA
FROM SEG_PARAMETRO p
LEFT JOIN (SELECT DISTINCT CORR_EMPRESA, NOMBRE_EMPRESA FROM SEG_USUARIO) e 
    ON p.CORR_EMPRESA = e.CORR_EMPRESA
ORDER BY p.CORR_EMPRESA
```

### Actualizar configuración de una empresa

```sql
-- Establecer 6 meses de vigencia para la empresa 1
UPDATE SEG_PARAMETRO
SET CANTIDAD_MESES_EXPIRA_CONTRASENA = 6
WHERE CORR_EMPRESA = 1
GO

-- Deshabilitar expiración para la empresa 2
UPDATE SEG_PARAMETRO
SET CANTIDAD_MESES_EXPIRA_CONTRASENA = 0
WHERE CORR_EMPRESA = 2
GO
```

### Consultar usuarios con contraseñas próximas a expirar

```sql
SELECT 
    u.LOGIN_SISTEMA,
    u.NOMBRE_COMPLETO,
    u.CORR_EMPRESA,
    u.FECHA_CAMBIO_CLAVE,
    p.CANTIDAD_MESES_EXPIRA_CONTRASENA,
    DATEADD(MONTH, p.CANTIDAD_MESES_EXPIRA_CONTRASENA, u.FECHA_CAMBIO_CLAVE) AS FECHA_EXPIRACION,
    DATEDIFF(DAY, GETDATE(), DATEADD(MONTH, p.CANTIDAD_MESES_EXPIRA_CONTRASENA, u.FECHA_CAMBIO_CLAVE)) AS DIAS_RESTANTES
FROM SEG_USUARIO u
INNER JOIN SEG_PARAMETRO p ON u.CORR_EMPRESA = p.CORR_EMPRESA
WHERE p.CANTIDAD_MESES_EXPIRA_CONTRASENA > 0
    AND DATEDIFF(DAY, GETDATE(), DATEADD(MONTH, p.CANTIDAD_MESES_EXPIRA_CONTRASENA, ISNULL(u.FECHA_CAMBIO_CLAVE, u.FECHA_CREACION))) <= 30
ORDER BY DIAS_RESTANTES
```

## Pruebas Recomendadas

### 1. Probar SP directamente

```sql
-- Caso 1: Usuario con contraseña vigente
EXEC PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE @LOGIN_SISTEMA = 'usuario.prueba'

-- Caso 2: Forzar expiración (cambiar fecha del último cambio a hace 7 meses)
UPDATE SEG_USUARIO
SET FECHA_CAMBIO_CLAVE = DATEADD(MONTH, -7, GETDATE())
WHERE LOGIN_SISTEMA = 'usuario.prueba'

EXEC PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE @LOGIN_SISTEMA = 'usuario.prueba'
```

### 2. Probar desde la aplicación

1. Configurar una empresa con 1 mes de vigencia
2. Crear un usuario de prueba
3. Cambiar manualmente su `FECHA_CAMBIO_CLAVE` a hace 2 meses
4. Intentar hacer login y verificar que aparezca el modal de cambio de contraseña

## Notas Importantes

1. **Valor 0 o NULL**: Si `CANTIDAD_MESES_EXPIRA_CONTRASENA` es 0 o NULL, las contraseñas no expiran para esa empresa.

2. **Alertas tempranas**: El sistema muestra un mensaje de advertencia cuando faltan 7 días o menos, pero no obliga al cambio hasta que expira.

3. **Primer Login**: El sistema sigue validando el primer login independientemente de la expiración.

4. **Historial**: La columna `FECHA_CAMBIO_CLAVE` mantiene un registro del último cambio, útil para auditorías.

## Ventajas de esta Implementación

✅ **Configuración por empresa**: Cada empresa puede tener su propia política de expiración

✅ **Flexible**: Se puede deshabilitar la expiración poniendo el valor en 0

✅ **Backward compatible**: No rompe funcionalidad existente

✅ **Auditable**: Se registra la fecha de cada cambio de contraseña

✅ **Escalable**: Fácil agregar más parámetros de seguridad a la tabla SEG_PARAMETRO
