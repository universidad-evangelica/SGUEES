# Implementación de Cambio de Contraseña Obligatorio en Primer Login

## ✅ Componentes Implementados

### Backend (.NET)
1. ✅ Tabla `SEG_USUARIO_LOGIN_HISTORIAL` - Auditoría de logins
2. ✅ SP `PRAL_DATA_SEG_USUARIO_PRIMER_LOGIN` - Verifica si es primer login
3. ✅ SP `PRAL_MTTO_SEG_USUARIO_LOGIN_HISTORIAL_INSERT` - Registra historial
4. ✅ Repository: `VerificarPrimerLoginAsync()` y `RegistrarLoginHistorialAsync()`
5. ✅ Service: Login devuelve `REQUIERE_CAMBIO_CLAVE = true/false`
6. ✅ Service: `CambioClave` registra primer login exitoso

### Frontend (Angular)
1. ✅ Componente `change-password-modal` con diseño moderno
2. ✅ Servicio `AuthService` actualizado para detectar flag
3. ✅ Componente `login-form` integrado con modal
4. ✅ Validaciones de contraseña (mínimo 6 caracteres, coincidencia)
5. ✅ Modal no se puede cerrar (obligatorio cambiar contraseña)

## 🎨 Características del Diseño

- **Modal Atractivo**: Gradiente morado (667eea → 764ba2)
- **Iconos Animados**: Icono de llave con animación pulse
- **Campos Modernos**: Inputs con bordes redondeados y efectos focus
- **Botones con Estilo**: Efecto hover con elevación 3D
- **Requisitos Visibles**: Panel amarillo con requisitos de contraseña
- **Nota de Seguridad**: Panel azul informativo
- **Loading States**: Indicador de carga durante el proceso

## 🔄 Flujo Completo

### 1. Admin crea usuario
```sql
-- En la pantalla de usuarios, se crea con contraseña temporal
-- No se registra nada en SEG_USUARIO_LOGIN_HISTORIAL
```

### 2. Usuario intenta login primera vez
```typescript
POST /api/SEG_USUARIO/login
{
  "LOGIN_SISTEMA": "juan.perez",
  "CLAVE_USUARIO": "temporal123",
  "CODIGO_SUITE": "SGUEES"
}

// Respuesta:
{
  "Result": true,
  "Data": {
    "TOKEN": "eyJ0eXAi...",
    "REQUIERE_CAMBIO_CLAVE": true,  // ← FLAG CLAVE
    "LOGIN_SISTEMA": "juan.perez",
    "NOMBRE_USUARIO": "Juan Pérez"
  }
}
```

### 3. Frontend detecta el flag
```typescript
if (response.Data.REQUIERE_CAMBIO_CLAVE) {
  // No guarda el token
  // Muestra modal de cambio de contraseña
  this.showChangePasswordModal = true;
}
```

### 4. Usuario cambia contraseña
```typescript
POST /api/SEG_USUARIO/cambio-clave
{
  "LOGIN_SISTEMA": "juan.perez",
  "NUEVA_CLAVE": "MiNuevaContraseña123",
  "CODIGO_SUITE": "SGUEES"
}

// Backend ejecuta:
// 1. Actualiza la contraseña en SEG_USUARIO
// 2. Registra en SEG_USUARIO_LOGIN_HISTORIAL con EXITOSO = 1
```

### 5. Próximo login
```sql
-- Ya existe registro en historial
-- REQUIERE_CAMBIO_CLAVE = false
-- Usuario ingresa normalmente
```

## 📝 Scripts de Base de Datos

### Ejecutar en SQL Server:
```sql
USE SGUEES;
GO

-- 1. Crear tabla de historial
CREATE TABLE [dbo].[SEG_USUARIO_LOGIN_HISTORIAL] (
    [CORR_LOGIN] INT IDENTITY(1,1) NOT NULL,
    [LOGIN_SISTEMA] VARCHAR(30) COLLATE Latin1_General_CS_AS NOT NULL,
    [FECHA_LOGIN] DATETIME NOT NULL DEFAULT GETDATE(),
    [IP_ADDRESS] VARCHAR(50) COLLATE Latin1_General_CS_AS NULL,
    [NAVEGADOR] VARCHAR(255) COLLATE Latin1_General_CS_AS NULL,
    [CODIGO_SUITE] VARCHAR(20) COLLATE Latin1_General_CS_AS NULL,
    [EXITOSO] BIT NOT NULL DEFAULT 1,
    [MENSAJE] VARCHAR(500) COLLATE Latin1_General_CS_AS NULL,
    
    CONSTRAINT [PK_SEG_USUARIO_LOGIN_HISTORIAL] PRIMARY KEY CLUSTERED ([CORR_LOGIN] ASC),
    CONSTRAINT [FK_SEG_USUARIO_LOGIN_HISTORIAL_SEG_USUARIO] 
        FOREIGN KEY ([LOGIN_SISTEMA]) 
        REFERENCES [dbo].[SEG_USUARIO] ([LOGIN_SISTEMA])
);
GO

-- 2. Crear SP para insertar historial
-- (Ver archivo PRAL_MTTO_SEG_USUARIO_LOGIN_HISTORIAL_INSERT.sql)

-- 3. Crear SP para verificar primer login
-- (Ver archivo PRAL_DATA_SEG_USUARIO_PRIMER_LOGIN.sql)
```

## 🚀 Cómo Probar

### 1. Compilar Backend
```powershell
cd "c:\Users\jonathan.avalos\Documents\Desarrollos Git\SGUEES\SGUEES-API"
dotnet build sguees-api.sln
dotnet run --project sguees.api
```

### 2. Compilar Frontend
```powershell
cd "c:\Users\jonathan.avalos\Documents\Desarrollos Git\SGUEES\SGUEES-SPA"
npm install
ng serve --open
```

### 3. Crear Usuario de Prueba (SQL)
```sql
INSERT INTO SEG_USUARIO (
    LOGIN_SISTEMA, 
    CLAVE_USUARIO,  -- Hash de "temporal123"
    NOMBRE_USUARIO,
    ESTADO_USUARIO,
    CORR_TIPO_USUARIO
) VALUES (
    'usuario.prueba',
    '5F4DCC3B5AA765D61D8327DEB882CF99',  -- MD5 de "password"
    'Usuario de Prueba',
    'A',
    1
);

-- Verificar que NO existe en historial
SELECT * FROM SEG_USUARIO_LOGIN_HISTORIAL 
WHERE LOGIN_SISTEMA = 'usuario.prueba';
-- Debe retornar 0 filas
```

### 4. Probar Login
1. Ir a `http://localhost:4200/`
2. Ingresar:
   - Usuario: `usuario.prueba`
   - Contraseña: `password`
3. **Resultado Esperado**: Aparece modal morado de cambio de contraseña
4. Ingresar nueva contraseña (mínimo 6 caracteres)
5. Confirmar contraseña
6. Click en "Cambiar Contraseña"
7. **Resultado Esperado**: Modal se cierra y redirige al home

### 5. Verificar Segundo Login
```sql
-- Verificar que ahora existe en historial
SELECT * FROM SEG_USUARIO_LOGIN_HISTORIAL 
WHERE LOGIN_SISTEMA = 'usuario.prueba';
-- Debe retornar 1 fila con EXITOSO = 1
```

6. Cerrar sesión e iniciar sesión nuevamente
7. **Resultado Esperado**: Login normal, SIN modal de cambio de contraseña

## 🎨 Personalización del Diseño

### Colores del Modal (SCSS)
```scss
// Gradiente principal
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Cambiar a azul:
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

// Cambiar a verde:
background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
```

### Icono del Modal
```html
<!-- Actual: Llave -->
<i class="dx-icon dx-icon-key"></i>

<!-- Alternativas: -->
<i class="dx-icon dx-icon-lock"></i>
<i class="dx-icon dx-icon-user"></i>
<i class="dx-icon dx-icon-favorites"></i>
```

## 📊 Estado de Collations

### ⚠️ Nota Importante
Se decidió NO cambiar el collation de 16 columnas críticas que usan `Modern_Spanish_CI_AS` para evitar riesgos en FK e índices existentes. La tabla nueva `SEG_USUARIO_LOGIN_HISTORIAL` usa `Latin1_General_CS_AS` para coincidir con `SEG_USUARIO.LOGIN_SISTEMA`.

### Columnas que mantienen Modern_Spanish_CI_AS:
- SEG_CONFIG_OPCION (CODIGO_SISTEMA, CODIGO_MENU, CODIGO_OPCION)
- SEG_MENU_SISTEMA (CODIGO_MENU)
- SEG_OPCION_SISTEMA (CODIGO_OPCION, URL_OPCION)
- SEG_OPCION_SISTEMA_SUITE (CODIGO_OPCION, CODIGO_SUITE)
- SEG_SISTEMA (CODIGO_SISTEMA)
- SEG_SUITE (CODIGO_SUITE)
- SEG_TIPO_USUARIO_OPCION (CODIGO_SISTEMA, CODIGO_MENU, CODIGO_OPCION)
- SEG_USUARIO_FOTO (CLASE_FOTO)
- SEG_USUARIO_OPCION (CODIGO_SISTEMA, CODIGO_MENU, CODIGO_OPCION)

## 🐛 Troubleshooting

### Error: "Modal no aparece"
- Verificar que el backend devuelve `REQUIERE_CAMBIO_CLAVE: true`
- Abrir DevTools → Network → Ver respuesta del endpoint `/login`

### Error: "No se puede cambiar la contraseña"
- Verificar que el endpoint `/cambio-clave` existe en el backend
- Verificar que el SP `PRAL_MTTO_SEG_USUARIO_LOGIN_HISTORIAL_INSERT` existe

### Error: "Modal aparece siempre"
- Verificar que existe registro en `SEG_USUARIO_LOGIN_HISTORIAL`
- Ejecutar: `SELECT * FROM SEG_USUARIO_LOGIN_HISTORIAL WHERE LOGIN_SISTEMA = 'tu_usuario'`

### Error de compilación Angular
```powershell
# Limpiar caché
cd SGUEES-SPA
rm -rf node_modules
rm package-lock.json
npm install
ng serve
```

## 📚 Archivos Modificados

### Backend
- `SEG_USUARIOService.cs` - LoginAsync y CambioClave
- `SEG_USUARIORepository.cs` - Nuevos métodos async
- `ISEG_USUARIORepository.cs` - Interfaces
- `SEG_USUARIO_LOGINView.cs` - Propiedad REQUIERE_CAMBIO_CLAVE

### Frontend
- `auth.service.ts` - Lógica de detección de flag
- `login-form.component.ts` - Integración con modal
- `login-form.component.html` - Inclusión del modal
- **NUEVOS**:
  - `change-password-modal.component.ts`
  - `change-password-modal.component.html`
  - `change-password-modal.component.scss`

### Base de Datos
- `SEG_USUARIO_LOGIN_HISTORIAL` (tabla)
- `PRAL_MTTO_SEG_USUARIO_LOGIN_HISTORIAL_INSERT` (SP)
- `PRAL_DATA_SEG_USUARIO_PRIMER_LOGIN` (SP)

---

**Implementado por:** GitHub Copilot  
**Fecha:** 26 de enero de 2026  
**Versión:** 1.0
