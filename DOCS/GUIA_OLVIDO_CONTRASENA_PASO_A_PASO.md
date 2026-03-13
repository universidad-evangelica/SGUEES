# Guía paso a paso: Olvidé mi contraseña (SGUEES)

Fecha: 9 de marzo de 2026

Esta guía documenta el flujo completo de **solicitud de recuperación** y **restablecimiento de contraseña**, incluyendo validaciones, pruebas y resolución de errores comunes.

---

## 1) Flujo funcional (resumen)

1. Usuario ingresa a `recuperar-contrasena` y escribe su `LOGIN_SISTEMA`.
2. SPA llama al endpoint:
	 - `POST /SEG_USUARIO/solicitar-restablecer-contrasena`
3. API busca usuario, obtiene SMTP desde `COM_PARAMETRO`, genera token y envía correo.
4. Usuario abre enlace recibido en correo (`login` + `token` en query string).
5. SPA muestra formulario con nueva contraseña y confirma.
6. SPA llama al endpoint:
	 - `POST /SEG_USUARIO/restablecer-contrasena`
7. API valida token y aplica cambio de clave.

---

## 2) Dónde está cada parte en código

### Backend (.NET)

- Envío de correo (forgot-password):
	- `SGUEES-API/sguees.api/Options/Security/SEG_USUARIO/SEG_USUARIOService.cs`
	- Método: `SolicitarResetContrasenaAsync`

- Confirmación de restablecimiento:
	- `SGUEES-API/sguees.api/Options/Security/SEG_USUARIO/SEG_USUARIOService.cs`
	- Método: `ConfirmarResetContrasenaAsync`

- Generación/validación de token y URL:
	- `GenerarTokenResetContrasena`
	- `ValidarTokenResetContrasena`
	- `ConstruirUrlReset`

- Controlador (rutas HTTP):
	- `SGUEES-API/sguees.api/Options/Security/SEG_USUARIO/SEG_USUARIOController.cs`
	- Rutas:
		- `solicitar-restablecer-contrasena` / `forgot-password`
		- `restablecer-contrasena` / `reset-password`

- Plantilla HTML del correo:
	- `SGUEES-API/eFramework/Core/CRoutines.cs`
	- Método: `BodyEmailUEES`

### Frontend (Angular)

- Formulario recuperar/restablecer:
	- `SGUEES-SPA/src/app/shared/components/library/reset-password-form/reset-password-form.component.ts`
	- `reset-password-form.component.html`

- Servicio HTTP de autenticación:
	- `SGUEES-SPA/src/app/shared/services/auth.service.ts`
	- Métodos:
		- `resetPassword(loginSistema)`
		- `changePassword(password, recoveryCode, loginSistema)`

---

## 3) Configuración requerida en BD

El envío SMTP se toma de tabla/vista `COM_PARAMETRO` (por empresa).

Campos mínimos requeridos para enviar correo:

- `SERVIDOR_CORREO`
- `PUERTO_CORREO`
- `USA_SSL_CORREO`
- `USUARIO_REMITENTE`
- `CONTRASENA_REMITENTE`
- `CORREO_REMITENTE`

Si faltan datos, el flujo responde mensaje genérico al usuario y registra warning en logs.

---

## 4) Configuración en appsettings

En `appsettings.Development.json`, mantener:

- `AppSetting:clientURL`
- `AppSetting:passwordResetURL`

Ejemplo:

```json
"passwordResetURL": "http://localhost:4200/recuperar-contrasena"
```

> Nota: `passwordResetURL` define a dónde apunta el enlace del correo.

---

## 5) Pasos de prueba local

### 5.1 Levantar API

```powershell
Push-Location "C:\Users\jonathan.avalos\Documents\Desarrollos Git\SGUEES-ORIGINAL\SGUEES-API\sguees.api"
dotnet run --urls=http://localhost:5000/
```

### 5.2 Levantar SPA

```powershell
Push-Location "C:\Users\jonathan.avalos\Documents\Desarrollos Git\SGUEES-ORIGINAL\SGUEES-SPA"
ng serve
```

### 5.3 Solicitar correo de recuperación (prueba API)

```powershell
$body = @{ LOGIN_SISTEMA = "admin" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/SEG_USUARIO/solicitar-restablecer-contrasena" -Method Post -ContentType "application/json" -Body $body
```

### 5.4 Confirmar restablecimiento desde UI

1. Abrir el correo más reciente.
2. Clic en el enlace.
3. Ingresar nueva contraseña y confirmar.
4. Validar toast y login posterior.

---

## 6) Troubleshooting (casos reales encontrados)

### Caso A: “No fue posible restablecer la contraseña”

Posibles causas:

- Token vencido (enlace viejo).
- Token inválido (URL incompleta o alterada).
- API y SPA apuntando a puertos/instancias distintas.
- Error de validación de política de contraseña en SP.

Acción recomendada:

1. Solicitar correo nuevo.
2. Abrir solo el último enlace.
3. Ejecutar inmediatamente.

### Caso B: API no compila por `.pdb`/`.dll` bloqueado

Síntoma:

- `CS2012` o `MSB3021/MSB3027` por archivo en uso.

Solución:

```powershell
Get-Process csuees.api -ErrorAction SilentlyContinue | Stop-Process -Force
dotnet build .\SGUEES-API\sguees.api\csuees.api.csproj
```

### Caso C: Envío de correo no sale para usuario con empresa sin parámetros

Síntoma en logs:

- `No hay configuración de correo para empresa X`

Solución:

- Completar `COM_PARAMETRO` de la empresa correspondiente.

---

## 7) Logs clave para diagnóstico

Mensajes útiles en backend (`SEG_USUARIOService`):

- `[ForgotPassword] Correo de recuperación enviado...`
- `[ForgotPassword] No hay configuración de correo para empresa ...`
- `[ResetPassword] Token inválido o expirado...`
- `[ResetPassword] Falló cambio de clave...`

---

## 8) Recomendaciones operativas

- Mantener sincronizada hora del servidor para evitar expiración prematura de token.
- Usar siempre el enlace más reciente al restablecer.
- Evitar múltiples instancias API/SPA en puertos distintos durante pruebas.
- Documentar qué usuario/correo se usó en cada prueba para rastreo.

---

## 9) Estado final de esta implementación

- Flujo de recuperación funcional.
- Flujo de restablecimiento funcional.
- Mensajería de error mejorada en SPA.
- Trazabilidad de logs mejorada en API.

