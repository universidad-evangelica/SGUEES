# Revisión: servicio emisor SignalR (sin modificaciones)

**Alcance:** solo análisis del código existente. No se modificó ningún archivo de implementación en esta revisión.

**Fecha de referencia:** post-creación del emisor; última compilación del backend en el paso de creación terminó con **0 errores**.

---

## 1. Contenido completo de los tres archivos

### 1.1 `SGUEES-API/sguees.api/Services/Hubs/Models/NotificationMessage.cs`

```csharp
namespace sguees.api.Services.Hubs
{
	/// <summary>
	/// Payload tipado para notificaciones en tiempo real vía SignalR.
	/// PropertyNamingPolicy = null en Program.cs: se serializa con estos nombres.
	/// </summary>
	public class NotificationMessage
	{
		public string TITULO { get; set; }
		public string MENSAJE { get; set; }
	}
}
```

### 1.2 `SGUEES-API/sguees.api/Services/Hubs/INotificationSignalRService.cs`

```csharp
using System.Threading.Tasks;

namespace sguees.api.Services.Hubs
{
	public interface INotificationSignalRService
	{
		/// <summary>
		/// Envía una notificación al usuario conectado identificado por LOGIN_SISTEMA (Context.UserIdentifier).
		/// </summary>
		Task SendToUserAsync(string loginSistema, NotificationMessage notification);
	}
}
```

### 1.3 `SGUEES-API/sguees.api/Services/Hubs/NotificationSignalRService.cs`

```csharp
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace sguees.api.Services.Hubs
{
	public class NotificationSignalRService : INotificationSignalRService
	{
		public const string ClientMethodName = "ReceiveNotification";

		private readonly IHubContext<NotificationHub> _hubContext;

		public NotificationSignalRService(IHubContext<NotificationHub> hubContext)
		{
			_hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
		}

		public async Task SendToUserAsync(string loginSistema, NotificationMessage notification)
		{
			if (string.IsNullOrWhiteSpace(loginSistema))
			{
				throw new ArgumentException("El LOGIN_SISTEMA destinatario es obligatorio.", nameof(loginSistema));
			}

			if (notification == null)
			{
				throw new ArgumentNullException(nameof(notification));
			}

			await _hubContext.Clients.User(loginSistema).SendAsync(ClientMethodName, notification);
		}
	}
}
```

---

## 2. Verificación de requisitos

| # | Criterio | Resultado | Evidencia |
|---|----------|-----------|-----------|
| 1 | Usa `IHubContext<NotificationHub>` | **Cumple** | Campo `_hubContext` y constructor inyectan `IHubContext<NotificationHub>`. |
| 2 | Recibe `LOGIN_SISTEMA` y usa `Clients.User(loginSistema)` | **Cumple** | Parámetro `loginSistema` en `SendToUserAsync`; envío con `_hubContext.Clients.User(loginSistema)`. |
| 3 | Evento exacto `ReceiveNotification` | **Cumple** | Constante `ClientMethodName = "ReceiveNotification"`; `SendAsync(ClientMethodName, notification)`. |
| 4 | DTO con título y mensaje | **Cumple** | `NotificationMessage.TITULO` y `NotificationMessage.MENSAJE`. |
| 5 | Namespaces y ubicaciones vs convenciones | **Cumple (con nota)** | Ver sección 3. |
| 6 | Auto-registro DI detectará la implementación | **Cumple** | Ver sección 4. |
| 7 | Compilación backend correcta | **Sí** | Ver sección 5. |

---

## 3. Namespaces y ubicaciones (convenciones)

| Pieza | Ubicación | Namespace |
|-------|-----------|-----------|
| Hub existente | `Services/Hubs/NotificationHub.cs` | `sguees.api.Services.Hubs` |
| DTO | `Services/Hubs/Models/NotificationMessage.cs` | `sguees.api.Services.Hubs` |
| Interfaz | `Services/Hubs/INotificationSignalRService.cs` | `sguees.api.Services.Hubs` |
| Implementación | `Services/Hubs/NotificationSignalRService.cs` | `sguees.api.Services.Hubs` |

**Hechos:**

- Quedan junto al Hub bajo `Services/Hubs/`, coherente con infraestructura SignalR.
- Hay un precedente cercano en `Services/Security/ActiveDirectoryService.cs` (servicio transversal fuera de `Options/`).
- Los mtto de dominio suelen usar `namespace sguees.Services` e interfaces `I*Service` en `Options/...`; este emisor es infraestructura de notificaciones, no un mtto de entidad.

**Nota (no bloqueante):** el DTO usa propiedades `TITULO` / `MENSAJE` (estilo UPPER del proyecto) y el mismo namespace del Hub. Con `PropertyNamingPolicy = null` en `Program.cs`, el JSON conserva esos nombres.

---

## 4. Registro automático de dependencias

En `Program.cs`:

```csharp
builder.Services.RegisterAssemblyPublicNonGenericClasses()
            .Where(c => c.Name.EndsWith("Repository") || c.Name.EndsWith("Service") )
            .AsPublicImplementedInterfaces(ServiceLifetime.Scoped);
```

| Condición NetCore.AutoRegisterDi | `NotificationSignalRService` |
|----------------------------------|------------------------------|
| Clase pública no genérica | Sí |
| Nombre termina en `Service` | Sí (`NotificationSignalRService`) |
| Implementa interfaz pública | Sí (`INotificationSignalRService`) |
| Lifetime | Scoped |

**Conclusión:** el registro automático es suficiente. No hace falta tocar `Program.cs` para registrar este servicio. `IHubContext<NotificationHub>` lo provee el framework tras `AddSignalR()` / `MapHub`.

---

## 5. Compilación

En el paso de creación del emisor se ejecutó:

```text
dotnet build SGUEES-API/sguees.api/sguees.api.csproj
```

**Resultado:**

- **0 errores**
- **Compilación correcta** → `sguees.api.dll`
- 1 advertencia previa ajena: `GEN_UNIDADES_PUESTORepository.cs` (CS1998), no relacionada con SignalR

Esta revisión **no** recompiló ni modificó código.

---

## 6. Contrato resumido

| Elemento | Valor |
|----------|--------|
| Interfaz | `INotificationSignalRService` |
| Método | `Task SendToUserAsync(string loginSistema, NotificationMessage notification)` |
| Destinatario SignalR | `Clients.User(loginSistema)` → `LOGIN_SISTEMA` / `Context.UserIdentifier` |
| Evento cliente | `ReceiveNotification` |
| Payload | `{ TITULO, MENSAJE }` |

---

## 7. Fuera de alcance (confirmado)

No hay, en estos tres archivos ni en esta revisión:

- Controladores / endpoints de prueba
- Tablas SQL / historial / campana
- Cambios a JWT, `Program.cs`, Hub o Angular
