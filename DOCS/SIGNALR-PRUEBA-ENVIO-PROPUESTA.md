# Propuesta: primera prueba controlada de envío SignalR

**Alcance:** solo investigación / propuesta. No se implementaron cambios en este documento.

**Contexto confirmado:**

- Hub: `/hubs/notifications` con `[Authorize]`.
- Destinatario: `LOGIN_SISTEMA` = `Context.UserIdentifier` = `ClaimTypes.NameIdentifier`.
- Emisor: `INotificationSignalRService` / `NotificationSignalRService` (registro DI automático).
- Evento cliente: `ReceiveNotification`.
- Payload: `NotificationMessage` (`TITULO`, `MENSAJE`).

---

## 1. Cómo invocar `SendToUserAsync`

Contrato actual (`INotificationSignalRService` / `NotificationSignalRService`):

```csharp
Task SendToUserAsync(string loginSistema, NotificationMessage notification);
```

Inyección (DI automático Scoped):

```csharp
private readonly INotificationSignalRService _notifications;

// ...
await _notifications.SendToUserAsync(
    loginSistema, // debe ser exactamente LOGIN_SISTEMA (= Context.UserIdentifier)
    new NotificationMessage
    {
        TITULO = "Prueba SignalR",
        MENSAJE = "Notificación de prueba"
    });
```

Internamente hace:

```csharp
Clients.User(loginSistema).SendAsync("ReceiveNotification", notification);
```

Validaciones existentes:

- `loginSistema` no vacío.
- `notification` no null.

Si el usuario no está conectado al hub, el envío no falla: simplemente no hay clientes que reciban el mensaje.

---

## 2. Forma temporal y segura en desarrollo

**Restricciones pedidas:**

- Sin endpoint público.
- Sin modificar controladores existentes.

### Recomendada: autoenvío en `NotificationHub.OnConnectedAsync` (solo Development)

| Aspecto | Detalle |
|---------|---------|
| Qué | Al conectar con JWT válido, el hub inyecta `INotificationSignalRService` y llama `SendToUserAsync(Context.UserIdentifier, …)`. |
| Por qué es segura | No hay HTTP nuevo; el destinatario sale del JWT ya autenticado (`[Authorize]`); no hay `AllowAnonymous`; no se modifican controllers. |
| Control | Envolver con `if (env.IsDevelopment())` (o `#if DEBUG`) y eliminar tras la prueba. |
| Archivo a tocar | Solo `NotificationHub.cs` (+ inyectar `IHostEnvironment` si se usa el guard de Development). |

### Alternativa (aceptable, no primera opción)

Un **controller nuevo** temporal con `[Authorize]`, sin `AllowAnonymous`, solo en Development.

- Cumple “no modificar controllers existentes”.
- Sí crea un endpoint HTTP (aunque no público anónimo).

### Descartado para esta prueba

- Endpoint anónimo.
- Modificar `SEG_USUARIOController` u otros controllers existentes.
- Hardcodear login en un `IHostedService`.

---

## 3. ¿Angular ya escucha `ReceiveNotification`?

**No.**

Archivo: `SGUEES-SPA/src/app/services/notification-signalr.service.ts`

Hoy solo expone:

- `startConnection()`
- `stopConnection()`

No existe `hubConnection.on('ReceiveNotification', …)`.

---

## 4. Cambios mínimos en SPA (propuesta — no implementar aún)

Solo en `notification-signalr.service.ts`:

1. Tras crear el `HubConnection` (antes o justo después de `start()`), registrar el listener:

```typescript
this.hubConnection.on('ReceiveNotification', (notification: { TITULO?: string; MENSAJE?: string }) => {
  console.log('ReceiveNotification', notification?.TITULO, notification?.MENSAJE);
});
```

2. No loguear:

- token JWT
- URL del hub con query (`access_token`, `id`)
- claims ni identificadores sensibles si no son necesarios para la prueba

Opcional: tipar una interfaz local `{ TITULO: string; MENSAJE: string }` alineada al DTO del backend.

Con eso basta para ver la prueba en la consola del navegador.

---

## 5. Archivos a modificar (cuando se implemente)

| Archivo | Cambio propuesto |
|---------|------------------|
| `SGUEES-API/sguees.api/Services/Hubs/NotificationHub.cs` | Temporal: `OnConnectedAsync` → `SendToUserAsync(Context.UserIdentifier, …)` solo en Development. |
| `SGUEES-SPA/src/app/services/notification-signalr.service.ts` | Temporal: `.on('ReceiveNotification', …)` + `console.log` de `TITULO` / `MENSAJE`. |

**No tocar en esta prueba:**

- `Program.cs`
- Generación / validación JWT
- Controllers existentes
- SQL / historial / campana
- Otros servicios Angular

---

## 6. Flujo de la prueba

1. Login → SignalR conecta (mensaje actual de consola, p. ej. `SignalR is running ✅`).
2. Hub (solo Development) envía a `Context.UserIdentifier` (`LOGIN_SISTEMA`).
3. SPA recibe `ReceiveNotification` y muestra `TITULO` / `MENSAJE` en consola.
4. Revertir la instrumentación del Hub y, si se desea, dejar o quitar el `.on(...)` del SPA.

---

## 7. Nota de casing

`Clients.User(...)` es sensible a mayúsculas/minúsculas.

Usar siempre el `LOGIN_SISTEMA` del JWT (`Context.UserIdentifier`), no una variante `.ToLower()` distinta al valor del claim.
