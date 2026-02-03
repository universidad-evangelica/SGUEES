# Expiración Periódica de Contraseñas

## Descripción
Sistema que obliga a los usuarios a cambiar su contraseña cada cierto período de tiempo configurado en meses, usando el mismo modal de cambio obligatorio existente.

## Componentes Implementados

### 1. Base de Datos

#### Tabla SEG_PARAMETRO
Nueva tabla para almacenar parámetros de configuración del sistema:
- `CODIGO_PARAMETRO`: Código único del parámetro
- `NOMBRE_PARAMETRO`: Nombre descriptivo
- `VALOR_PARAMETRO`: Valor actual
- `DESCRIPCION`: Descripción detallada
- `TIPO_DATO`: STRING, INT, DECIMAL, BOOLEAN
- `ACTIVO`: Si el parámetro está activo

**Parámetro clave**: `MESES_VIGENCIA_CLAVE` 
- Valor por defecto: `3` (3 meses)
- Para desactivar: `0`

#### Campo nuevo en SEG_USUARIO_LOGIN_HISTORIAL
- `ES_CAMBIO_CLAVE` (bit): Marca si el registro corresponde a un cambio de contraseña
  - `1` = El usuario cambió su contraseña
  - `0` = Login normal

#### Stored Procedures actualizados

**PRAL_MTTO_SEG_USUARIO_LOGIN_HISTORIAL_INSERT**
- Agregado parámetro `@ES_CAMBIO_CLAVE`
- Registra en historial si es cambio de clave

**PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE**
- Actualiza `REQUIERE_CAMBIO_CLAVE = 0` al cambiar contraseña
- Registra automáticamente en historial con `ES_CAMBIO_CLAVE = 1`

**PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE** (Nuevo)
- Valida si la contraseña ha expirado
- Retorna:
  - `REQUIERE_CAMBIO_CLAVE`: Si debe cambiar contraseña
  - `FECHA_ULTIMO_CAMBIO`: Última vez que cambió la contraseña
  - `FECHA_EXPIRACION`: Cuándo expira la contraseña
  - `DIAS_PARA_EXPIRAR`: Días restantes (negativo si ya expiró)
  - `MESES_VIGENCIA`: Configuración actual de meses
  - `MENSAJE`: Mensaje descriptivo para el usuario

### 2. Backend (.NET)

#### Modelo nuevo
**SEG_USUARIO_EXPIRACION_CLAVEView.cs**
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

#### Repositorio actualizado
**ISEG_USUARIORepository** y **SEG_USUARIORepository**
- Nuevo método: `ValidarExpiracionClaveAsync(string loginSistema)`
- Llama al SP `PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE`

#### Servicio actualizado
**SEG_USUARIOService.LoginAsync**
```csharp
// Verificar si es el primer login
bool esPrimerLogin = await _repo.VerificarPrimerLoginAsync(LOGIN_SISTEMA);

// Verificar si la contraseña ha expirado
var validacionExpiracion = await _repo.ValidarExpiracionClaveAsync(LOGIN_SISTEMA);

// Requiere cambio si:
// 1. Es primer login Y tiene usuario AD
// 2. O si la contraseña ha expirado
bool requiereCambio = (esPrimerLogin && adUserExists) || validacionExpiracion.REQUIERE_CAMBIO_CLAVE;

// El flag se envía al frontend en SEG_USUARIO_LOGINView
```

### 3. Frontend (Angular)

**No requiere cambios**, ya que:
- El modal de cambio de contraseña ya existe
- El flag `REQUIERE_CAMBIO_CLAVE` ya se maneja en el login
- La lógica ya obliga al usuario a cambiar contraseña cuando el flag es `true`

## Flujo Completo

### Escenario 1: Usuario nuevo (primer login)
1. Usuario hace login → `esPrimerLogin = true`
2. Si tiene `USUARIO_AD` → `REQUIERE_CAMBIO_CLAVE = true`
3. Modal de cambio obligatorio se muestra
4. Al cambiar contraseña → Se registra en historial con `ES_CAMBIO_CLAVE = 1`

### Escenario 2: Contraseña expirada
1. Usuario hace login (ya no es primer login)
2. Sistema valida expiración:
   - Busca último cambio en `SEG_USUARIO_LOGIN_HISTORIAL` donde `ES_CAMBIO_CLAVE = 1`
   - Si no existe, usa `FECHA_CREA` del usuario
   - Calcula: `FECHA_EXPIRACION = FECHA_ULTIMO_CAMBIO + MESES_VIGENCIA`
   - Si `FECHA_EXPIRACION < HOY` → `REQUIERE_CAMBIO_CLAVE = true`
3. Modal de cambio obligatorio se muestra
4. Al cambiar contraseña → Se registra con `ES_CAMBIO_CLAVE = 1` y la fecha se reinicia

### Escenario 3: Contraseña próxima a expirar
1. Usuario hace login
2. Sistema detecta que faltan 7 días o menos
3. `REQUIERE_CAMBIO_CLAVE = false` (aún no obliga)
4. `MENSAJE = "Su contraseña expirará en X días"`
5. **(Opcional futuro)**: Mostrar advertencia en el frontend

## Instalación y Configuración

### Paso 1: Ejecutar script de BD
```bash
# En SQL Server Management Studio
USE SGUEES;
GO

-- Ejecutar el archivo:
SGUEES-DB/Scripts/ADD_PASSWORD_EXPIRATION.sql
```

Esto crea:
- Tabla `SEG_PARAMETRO` (si no existe)
- Campo `ES_CAMBIO_CLAVE` en `SEG_USUARIO_LOGIN_HISTORIAL`
- Parámetro `MESES_VIGENCIA_CLAVE` con valor 3
- Índice para búsquedas rápidas

### Paso 2: Actualizar Stored Procedures
```bash
# Ejecutar en orden:
1. SGUEES-DB/Stored Procedures/dbo.PRAL_MTTO_SEG_USUARIO_LOGIN_HISTORIAL_INSERT.sql
2. SGUEES-DB/Stored Procedures/dbo.PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE.sql
3. SGUEES-DB/Stored Procedures/dbo.PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE.sql
```

### Paso 3: Recompilar Backend
```bash
cd SGUEES-API
dotnet build
```

### Paso 4: Probar

#### Configurar período de expiración
```sql
-- Cambiar a 6 meses
UPDATE SEG_PARAMETRO
SET VALOR_PARAMETRO = '6'
WHERE CODIGO_PARAMETRO = 'MESES_VIGENCIA_CLAVE';

-- Desactivar expiración
UPDATE SEG_PARAMETRO
SET VALOR_PARAMETRO = '0'
WHERE CODIGO_PARAMETRO = 'MESES_VIGENCIA_CLAVE';
```

#### Forzar expiración para pruebas
```sql
-- Ver validación de un usuario
EXEC PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE 
    @LOGIN_SISTEMA = 'usuario.prueba';

-- Simular contraseña antigua (modificar último cambio)
UPDATE SEG_USUARIO_LOGIN_HISTORIAL
SET FECHA_LOGIN = DATEADD(MONTH, -4, GETDATE())
WHERE LOGIN_SISTEMA = 'usuario.prueba'
  AND ES_CAMBIO_CLAVE = 1;

-- Ahora al hacer login, debe pedir cambio de contraseña
```

## Administración

### Ver configuración actual
```sql
SELECT * FROM SEG_PARAMETRO 
WHERE CODIGO_PARAMETRO = 'MESES_VIGENCIA_CLAVE';
```

### Ver historial de cambios de contraseña
```sql
SELECT LOGIN_SISTEMA, FECHA_LOGIN, MENSAJE
FROM SEG_USUARIO_LOGIN_HISTORIAL
WHERE ES_CAMBIO_CLAVE = 1
ORDER BY FECHA_LOGIN DESC;
```

### Ver usuarios con contraseña próxima a expirar
```sql
DECLARE @LOGIN VARCHAR(30);
DECLARE usuario_cursor CURSOR FOR 
    SELECT DISTINCT LOGIN_SISTEMA FROM SEG_USUARIO;

CREATE TABLE #EXPIRACIONES (
    LOGIN_SISTEMA VARCHAR(30),
    REQUIERE_CAMBIO BIT,
    DIAS_PARA_EXPIRAR INT,
    MENSAJE VARCHAR(500)
);

OPEN usuario_cursor;
FETCH NEXT FROM usuario_cursor INTO @LOGIN;

WHILE @@FETCH_STATUS = 0
BEGIN
    INSERT INTO #EXPIRACIONES
    EXEC PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE @LOGIN_SISTEMA = @LOGIN;
    
    FETCH NEXT FROM usuario_cursor INTO @LOGIN;
END

CLOSE usuario_cursor;
DEALLOCATE usuario_cursor;

SELECT * FROM #EXPIRACIONES
WHERE DIAS_PARA_EXPIRAR IS NOT NULL
  AND DIAS_PARA_EXPIRAR <= 30  -- Próximos 30 días
ORDER BY DIAS_PARA_EXPIRAR;

DROP TABLE #EXPIRACIONES;
```

## Mejoras Futuras

1. **Advertencia previa**: Mostrar mensaje en el frontend cuando falten X días
2. **Notificaciones por email**: Enviar correo automático avisando próxima expiración
3. **Historial de intentos**: Registrar intentos fallidos de login
4. **Políticas de complejidad**: Validar fortaleza de contraseñas nuevas
5. **Bloqueo por intentos**: Bloquear usuario después de X intentos fallidos
6. **Dashboard administrativo**: Vista de contraseñas expiradas/próximas a expirar

## Archivos Modificados/Creados

### Base de Datos
- ✅ `SGUEES-DB/Scripts/ADD_PASSWORD_EXPIRATION.sql` (NUEVO)
- ✅ `SGUEES-DB/Stored Procedures/dbo.PRAL_MTTO_SEG_USUARIO_LOGIN_HISTORIAL_INSERT.sql` (MODIFICADO)
- ✅ `SGUEES-DB/Stored Procedures/dbo.PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE.sql` (MODIFICADO)
- ✅ `SGUEES-DB/Stored Procedures/dbo.PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE.sql` (NUEVO)

### Backend
- ✅ `SGUEES-API/sguees.api/Options/Security/SEG_USUARIO/Models/SEG_USUARIO_EXPIRACION_CLAVEView.cs` (NUEVO)
- ✅ `SGUEES-API/sguees.api/Options/Security/SEG_USUARIO/ISEG_USUARIORepository.cs` (MODIFICADO)
- ✅ `SGUEES-API/sguees.api/Options/Security/SEG_USUARIO/SEG_USUARIORepository.cs` (MODIFICADO)
- ✅ `SGUEES-API/sguees.api/Options/Security/SEG_USUARIO/SEG_USUARIOService.cs` (MODIFICADO)

### Frontend
- ⚡ Sin cambios necesarios (usa modal existente)

## Notas Importantes

- La validación de expiración **NO afecta** a usuarios con `USUARIO_AD` si AD está deshabilitado
- Si `MESES_VIGENCIA_CLAVE = 0`, la validación de expiración está **desactivada**
- El campo `REQUIERE_CAMBIO_CLAVE` en la tabla `SEG_USUARIO` se sigue usando para el primer login
- El historial con `ES_CAMBIO_CLAVE = 1` sirve para rastrear cambios de contraseña periódicos
- Los cambios son **retrocompatibles** con la funcionalidad existente de primer login
