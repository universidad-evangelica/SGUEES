# Informe: identidad JWT para notificaciones SignalR (solo investigación)

**Alcance:** lectura del código. No se modificó ningún archivo como parte de esta investigación.

**Fecha de referencia:** investigación sobre rama con Hub `/hubs/notifications` y JWT Bearer existente.

---

## 1. Archivo y método donde se genera el JWT

| Rol | Ruta | Método |
|-----|------|--------|
| Endpoint login | `SGUEES-API/sguees.api/Options/Security/SEG_USUARIO/SEG_USUARIOController.cs` | `Login` → `POST login` (`[AllowAnonymous]`) |
| Orquestación login | `SGUEES-API/sguees.api/Options/Security/SEG_USUARIO/SEG_USUARIOService.cs` | `LoginAsync` |
| Regeneración token | mismo service | `GenerateTokenAsync` |
| **Construcción/firma JWT** | mismo service | **`GenerateToken`** |

**Hecho:** el token de sesión se crea en `GenerateToken` y se asigna a `SEG_USUARIO_LOGINView.TOKEN` en `LoginAsync` / `GenerateTokenAsync`.

**Nota (otro JWT, no sesión):** existe `GenerarTokenResetContrasena` (privado) con claim `TOKEN_TYPE = "PASSWORD_RESET"`. No es el token de login ni el que usa SignalR.

---

## 2. Fragmento relevante (sin secretos)

Archivo: `SGUEES-API/sguees.api/Options/Security/SEG_USUARIO/SEG_USUARIOService.cs` — método `GenerateToken`:

```csharp
public string GenerateToken(SEG_USUARIOView Usuario, string CodigoSuite, List<SEG_USUARIO_PERMISOView> Opciones)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, Usuario.LOGIN_SISTEMA),
        new Claim(ClaimTypes.Name, Usuario.NOMBRE_USUARIO),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim("TIPO_USUARIO", ((int)Usuario.TIPO_USUARIO).ToString()),
        new Claim("CODIGO_SUITE", CodigoSuite),
        new Claim("CORR_EMPRESA", Usuario.CORR_EMPRESA.ToString()),
        new Claim("NOMBRE_EMPRESA", Usuario.NOMBRE_EMPRESA ?? string.Empty),
    };
    var appIdentity = new ClaimsIdentity(claims);
    // ... claims dinámicos: Type = URL_OPCION, Value = PERMISO (C/R/U/D/P) ...
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = appIdentity,
        Expires = DateTime.Now.AddDays(1),
        SigningCredentials = creds
    };
    // CreateToken + WriteToken → string JWT
}
```

- Firma: clave simétrica desde `AppSetting:Token` (valor no documentado aquí).
- Expiración sesión: 1 día.

En `SGUEES-API/sguees.api/Program.cs`: JwtBearer valida esa clave; **no** configura `NameClaimType` ni `RoleClaimType`. Sí tiene `OnMessageReceived` para `access_token` en `/hubs/notifications`.

---

## 3. Tabla de claims

| Claim (tipo en código) | Origen / valor | Propósito |
|------------------------|----------------|-----------|
| `ClaimTypes.NameIdentifier` | `SEG_USUARIOView.LOGIN_SISTEMA` | **Identificador de usuario de acceso** (login) |
| `ClaimTypes.Name` | `SEG_USUARIOView.NOMBRE_USUARIO` | Nombre para mostrar |
| `JwtRegisteredClaimNames.Jti` | `Guid.NewGuid()` | ID único del token |
| `"TIPO_USUARIO"` | `(int)Usuario.TIPO_USUARIO` | Tipo de usuario |
| `"CODIGO_SUITE"` | parámetro `CodigoSuite` | Suite/sistema |
| `"CORR_EMPRESA"` | `Usuario.CORR_EMPRESA` | Empresa de sesión |
| `"NOMBRE_EMPRESA"` | `Usuario.NOMBRE_EMPRESA` | Nombre empresa |
| `URL_OPCION` (dinámico, p. ej. `/seg-usuario`) | `SEG_USUARIO_PERMISOView.URL_OPCION` / `.PERMISO` | Permisos para policies (`HasScopeHandler`) |

**Hechos sobre identificadores:**

- El claim de identidad **no** es un ID numérico de persona/empleado.
- En `SEG_USUARIOView` **no** hay `CORR_PERSONA`, `CORR_EMPLEADO` ni similar; PK de acceso es `LOGIN_SISTEMA`.
- Controllers tratan `ClaimTypes.NameIdentifier` como login (`LOGIN_SISTEMA` / `USUARIO_CREA`).
- **No** se usa `sub` en `GenerateToken`. En reset, el código contempla alias `sub` / `nameid` / URI larga al validar — evidencia de variantes de tipado JWT, no de un claim `sub` en el token de login.

**Config JwtBearer (hecho):** no hay `NameClaimType`, `RoleClaimType`, `MapInboundClaims` explícito ni `IUserIdProvider` custom.

Modelo de usuario: `SGUEES-API/sguees.api/Options/Security/SEG_USUARIO/Models/SEG_USUARIOView.cs`.

---

## 4. Identificador recomendado para SignalR

**Recomendado:** valor de `ClaimTypes.NameIdentifier` → **`LOGIN_SISTEMA`**.

**Justificación (código):**

1. Es el único claim de identidad de usuario en el JWT de sesión.
2. Toda la API lo usa como “usuario autenticado” (auditoría, menú, perfil).
3. SignalR, sin `IUserIdProvider` custom, usa por defecto `ClaimTypes.NameIdentifier` como `Context.UserIdentifier`.
4. Coincide con `Clients.User(userId)` si `userId == LOGIN_SISTEMA`.

**No usar** para targeting: `ClaimTypes.Name` (nombre visible), `CORR_EMPRESA` (empresa), `Jti` (token), ni asumir ID de persona (no está en el token).

---

## 5. Cómo se obtiene hoy el usuario en la API

**Convención dominante:**

```csharp
User.Claims...SingleOrDefault/FirstOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value
```

Ejemplos:

| Archivo | Uso |
|---------|-----|
| `SEG_USUARIOController.GetMenu` | → `LOGIN_SISTEMA` (incluso `.ToLower()`) |
| `SEG_USUARIOController.GetPerfil` / cambio clave | mismo claim |
| Cientos de controllers mtto | `USUARIO_CREA` / `USUARIO_ACTU` |
| Claims custom | `"CORR_EMPRESA"`, `"CODIGO_SUITE"` |

Excepción menor: `COM_PROVEEDORController` usa `ClaimTypes.Name` (nombre, no login).

Policies: `SGUEES-API/sguees.api/Shared/Policies/HasScopeHandler.cs` lee claims cuyo **Type** es la URL de opción (`/ruta`).

---

## 6. Ajustes necesarios (solo recomendación; no aplicados)

| # | Archivo / lugar | Motivo |
|---|-----------------|--------|
| 1 | `SGUEES-API/sguees.api/Services/Hubs/NotificationHub.cs` | Hub **sin** `[Authorize]`. La conexión puede abrirse sin JWT; `Context.User` puede quedar anónimo. Para identidad fiable: exigir `[Authorize]` (o equivalente en `MapHub`). |
| 2 | (Opcional) `Program.cs` / DI | No hay `IUserIdProvider`. Con el claim actual, el default basta (`UserIdentifier` = `NameIdentifier` = `LOGIN_SISTEMA`). Solo haría falta custom si se quisiera otra clave. |
| 3 | `GenerateToken` / login | **No hace falta** agregar claims para identificar usuario en SignalR: `LOGIN_SISTEMA` ya está. |
| 4 | `NameClaimType` / `RoleClaimType` | **No configurados**; la API HTTP ya resuelve `ClaimTypes.NameIdentifier` en runtime → no hay evidencia de bloqueo por tipado. Verificar en hub que `Context.User.Identity.IsAuthenticated` y el claim existan. |

Ya existente y alineado con SignalR + JWT:

- `Program.cs`: `OnMessageReceived` lee `access_token` para `/hubs/notifications`.
- SPA: `SGUEES-SPA/src/app/services/notification-signalr.service.ts` usa `accessTokenFactory` desde `localStorage('token')`.
- Hub mapeado: `app.MapHub<NotificationHub>("/hubs/notifications")`.

---

## 7. Dudas / limitaciones no resolubles solo con código

1. **Casing de `LOGIN_SISTEMA`:** en menú se usa `.ToLower()`; en el JWT se guarda el valor de BD tal cual. `Clients.User(...)` es sensible a mayúsculas — conviene normalizar criterio al enviar.
2. **Persona vs usuario:** el token no trae ID de persona/empleado. Si el destino de negocio es “persona”, hace falta lookup `LOGIN_SISTEMA` → persona (fuera del JWT actual).
3. **Payload JWT real en wire:** no se inspeccionó un token vivo; el tipado en el wire puede ser URI larga / `nameid` (el reset ya contempla variantes). En HTTP controllers `ClaimTypes.NameIdentifier` funciona; conviene confirmar lo mismo en `Context.User` del hub.
4. **Conexión “OK” ≠ usuario autenticado:** sin `[Authorize]` en el hub, una conexión exitosa no prueba por sí sola que `Context.User` esté poblado.
5. **Multi-pestaña / multi-dispositivo:** varias conexiones pueden compartir el mismo `LOGIN_SISTEMA` / `UserIdentifier`; el diseño de envío individual debe contemplarlo (fase posterior).

---

## Resumen ejecutivo

| Pregunta | Respuesta (hechos) |
|----------|-------------------|
| ¿JWT u otra? | JWT Bearer (login) |
| ¿Claim de usuario? | `ClaimTypes.NameIdentifier` = `LOGIN_SISTEMA` |
| ¿ID persona/empleado en token? | No |
| ¿Convención API? | Leer `NameIdentifier` como login |
| ¿SignalR listo para identidad? | Claim sí; hub sin `[Authorize]`; sin `IUserIdProvider` custom (default OK) |

**Siguiente fase (fuera de este informe):** lectura en hub / `Clients.User` sobre `LOGIN_SISTEMA`, sin tocar la generación del JWT.
