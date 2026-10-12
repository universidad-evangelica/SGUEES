# Investigación: persistencia de notificaciones (SGUEES-TH)

**Alcance:** solo investigación. No se crearon ni modificaron archivos de implementación.

**Fecha de referencia:** post-prueba SignalR (envío automático temporal ya retirado del Hub).

---

## 1. Arquitectura de acceso a datos encontrada

### Hechos comprobados

| Pieza | Hallazgo |
|-------|----------|
| ORM | **No** se usa Entity Framework Core ni Dapper en el flujo principal. |
| Capa de datos | `eFramework` → `BaseRepository<T>` + `CData` (`Microsoft.Data.SqlClient`). |
| Conexión | `IConfiguration` → `ConnectionStrings:defaultConnection` + `DbProvider:defaultProvider`. |
| Lecturas típicas | `objData.GetDataReader("V_NOMBRE_TABLA", xWhere)` → mapeo `FromDataReader` a `*View`. |
| Altas/bajas/cambios simples | `objData.Insert` / `Update` / `Delete` generan SQL dinámico (`CommandType.Text`). |
| Lógica compleja | `objData.ExecCmd` / `GetDataReader` con `CommandType.StoredProcedure` (`PRAL_MTTO_*`, `PRAL_DATA_*`). |
| Resultado API | Envoltura `CResult` (`Result`, `Data`, `ErrorMessage`, etc.). |
| `ApplicationDataContext` | Existe en `SGUEES-API/sguees.api/Data/ApplicationDataContext.cs` pero **casi no es el patrón general**: solo instancia `SEG_SISTEMA_MENU_FAVORITOSService`. El CRUD real vive en `Options/.../*Repository`. |

Fragmento relevante (`CData` — lectura por vista):

```csharp
// SGUEES-API/eFramework/Core/CData.cs
public async Task<DbDataReader> GetDataReader(string vViewName, List<CParameter> xParametros = null, ...)
{
    // CommandType.Text → SELECT sobre la vista
    xQry = objSQLBuilder.toSelect(vViewName, vWhere, xSortingFields);
}
```

Fragmento relevante (repositorio catálogo):

```csharp
// SGUEES-API/sguees.api/Options/General/GEN_BANCO/GEN_BANCORepository.cs
public class GEN_BANCORepository : BaseRepository<GEN_BANCOTable>, IGEN_BANCORepository
{
    private const string _TableName = "GEN_BANCO";
    private const string _ViewName = "V_GEN_BANCO";
    // GetAllAsync → objData.GetDataReader(_ViewName, xWhere)
    // CreateAsync → objData.Insert(_TableName, p, "CORR_BANCO", pWhere)
}
```

DI automático (`Program.cs`):

```csharp
builder.Services.RegisterAssemblyPublicNonGenericClasses()
    .Where(c => c.Name.EndsWith("Repository") || c.Name.EndsWith("Service"))
    .AsPublicImplementedInterfaces(ServiceLifetime.Scoped);
```

### Organización backend típica (mtto / entidad)

```
Options/{Módulo}/{ENTIDAD}/
  {ENTIDAD}Controller.cs
  {ENTIDAD}Service.cs
  I{ENTIDAD}Service.cs
  {ENTIDAD}Repository.cs
  I{ENTIDAD}Repository.cs
  Models/
    {ENTIDAD}Table.cs   // escritura / BaseEntity
    {ENTIDAD}View.cs    // lectura (vista)
    {ENTIDAD}Param.cs   // filtros
```

Namespaces habituales:

- Controllers: `sguees.Controllers` (o namespace del módulo)
- Services / Repositories: `sguees.Services` / `sguees.Repositories`
- Models: `sguees.Models`

Excepción infra SignalR (ya existente):

```
SGUEES-API/sguees.api/Services/Hubs/
  NotificationHub.cs
  INotificationSignalRService.cs
  NotificationSignalRService.cs
  Models/NotificationMessage.cs
```

Namespace: `sguees.api.Services.Hubs`.

---

## 2. Convenciones reales del proyecto

### Nombres SQL (hechos)

| Tipo | Convención observada | Ejemplo |
|------|----------------------|---------|
| Tabla | Prefijo módulo + nombre (`SEG_`, `GEN_`, `SC_`, `PLA_`, …) | `SEG_USUARIO`, `GEN_BANCO` |
| Vista | `V_` + nombre tabla | `V_GEN_BANCO`, `V_SEG_FLUJO_TIPO_NOTIFICACION` (vía código repo) |
| SP consulta / datos | `PRAL_DATA_*` | `PRAL_DATA_BAN_CONCILIA_BANCARIA` |
| SP mantenimiento / operación | `PRAL_MTTO_*` | `PRAL_MTTO_GEN_EMPLEADO` |
| PK numérica | `CORR_*` (a menudo + `CORR_EMPRESA`) | `CORR_BANCO`, `CORR_TIPO_NOTIFICACION` |
| PK usuario acceso | `LOGIN_SISTEMA` (varchar) | `SEG_USUARIO` |
| Auditoría | `USUARIO_CREA`, `FECHA_CREA`, `ESTACION_CREA`, `USUARIO_ACTU`, `FECHA_ACTU`, `ESTACION_ACTU` | Casi todos los catálogos |
| Estado bit catálogo | `ESTADO_*` / `ACTIVO` | `ESTADO_BANCO`, `ACTIVO` en tipo notificación flujo |
| Collation usuarios | `Latin1_General_CS_AS` (case-sensitive) en `LOGIN_SISTEMA` | `SEG_USUARIO` |

### Modelos C# (hechos)

- Propiedades en **MAYÚSCULAS_CON_GUION** alineadas a columnas SQL.
- API Controllers: `PropertyNamingPolicy = null` → JSON conserva esos nombres.
- SignalR: configurado con `PayloadSerializerOptions.PropertyNamingPolicy = null` (alineado al API).
- DTO SignalR actual: `NotificationMessage` con `TITULO`, `MENSAJE`.

### Scripts / deploy BD (hechos)

- No hay migraciones EF.
- Fuentes en `SGUEES-DB/`:
  - `Tables/` — DDL de tablas
  - `Views/` — vistas (cuando versionadas ahí)
  - `Stored Procedures/` / `Programmability/Procedures/` — SPs
  - `Scripts/` — scripts idempotentes de deploy (`DEPLOY_*`, `MENU_*`, `ALTER_*`, tablas+vistas juntas)
- Ejecución documentada:  
  `sqlcmd -S <servidor> -d SGUEES -U <usuario> -f 65001 -i <script.sql>`  
  (UTF-8 obligatorio; ver `DOCS/ESTANDAR-MTTO.md`, `DOCS/GUIA-EQUIPO-MTTO.md`).

Ejemplo de script idempotente reciente:

`SGUEES-DB/Scripts/PLA_TIPO_DOCUMENTO_ADJUNTO.sql` — `IF OBJECT_ID ... CREATE TABLE` + `CREATE OR ALTER VIEW` + auditoría estándar.

---

## 3. Objetos SQL / código existentes que podrían reutilizarse

### Relacionados con la palabra “notificación” (hechos)

| Objeto / archivo | Qué es en realidad | ¿Sirve como inbox de usuario? |
|------------------|--------------------|-------------------------------|
| `SEG_FLUJO_TIPO_NOTIFICACION` (API en `Options/Security/SEG_FLUJO_TIPO_NOTIFICACION/`) | **Catálogo** de tipos de notificación de **flujo** (`CORR_TIPO_NOTIFICACION`, `CODIGO_TIPO`, `NOMBRE_TIPO`, `ACTIVO`) | **No** — no guarda mensajes por usuario ni estado de lectura |
| Referencias `CORR_TIPO_NOTIFICACION` en SPs de flujo SC | Configuración de acciones de flujo (quién/cómo notificar en el proceso) | **No** — no es bandeja |
| `SGUEES-SPA/.../sguees-notification.service.ts` | Toast PrimeNG (`MessageService`) para éxito/error UI | **No** — no persistencia ni SignalR |
| Stack SignalR actual (`NotificationHub`, `INotificationSignalRService`, `NotificationMessage`) | Envío en tiempo real por `LOGIN_SISTEMA` | Parcial: **solo realtime**, sin BD |

### No encontrado en `SGUEES-DB` (hecho)

- Ningún archivo de tabla/vista/script con nombre tipo inbox de notificaciones de usuario (búsqueda por `*NOTIFIC*` en `SGUEES-DB` → 0 tablas de bandeja; solo uso de `CORR_TIPO_NOTIFICACION` en flujos).
- No hay en el repo (bajo ese patrón de nombre) una tabla tipo “notificaciones del usuario” versionada como DDL independiente con ese propósito.

### Patrones reutilizables (hechos, como plantilla)

| Patrón | Ejemplo | Uso futuro |
|--------|---------|------------|
| Tabla hija por `LOGIN_SISTEMA` + FK a `SEG_USUARIO` | `SEG_USUARIO_LOGIN_HISTORIAL` | Modelo de destinatario por login |
| Índice por usuario + fecha | `IX_SEG_USUARIO_LOGIN_HISTORIAL_LOGIN_SISTEMA` | Consultas/conteos pendientes |
| CRUD vía `BaseRepository` + vista `V_*` | `GEN_BANCO`, `SEG_FLUJO_TIPO_NOTIFICACION` | Listar / marcar leída |
| Emisor realtime ya listo | `INotificationSignalRService.SendToUserAsync` | Tras persistir, emitir `ReceiveNotification` |

Fragmento `SEG_USUARIO_LOGIN_HISTORIAL` (relación por login):

```sql
-- SGUEES-DB/Tables/dbo.SEG_USUARIO_LOGIN_HISTORIAL.sql
[LOGIN_SISTEMA] [varchar](30) ... NOT NULL,
CONSTRAINT [FK_SEG_USUARIO_LOGIN_HISTORIAL_SEG_USUARIO]
  FOREIGN KEY ([LOGIN_SISTEMA]) REFERENCES [dbo].[SEG_USUARIO] ([LOGIN_SISTEMA])
```

---

## 4. Relación comprobada: usuarios y `LOGIN_SISTEMA`

### Hechos

1. **`SEG_USUARIO.LOGIN_SISTEMA`** es la **clave primaria** del usuario de acceso (`varchar(30)`, collation **CS_AS**).

```sql
-- SGUEES-DB/Tables/dbo.SEG_USUARIO.sql
[LOGIN_SISTEMA] [varchar] (30) COLLATE Latin1_General_CS_AS NOT NULL,
...
CONSTRAINT [PK_SEG_USUARIO] PRIMARY KEY CLUSTERED ([LOGIN_SISTEMA])
```

2. En el JWT de sesión, `ClaimTypes.NameIdentifier` = `Usuario.LOGIN_SISTEMA` (ver `DOCS/SIGNALR-JWT-IDENTIDAD.md` / `SEG_USUARIOService.GenerateToken`).
3. SignalR: `Context.UserIdentifier` = ese mismo valor.
4. **`SEG_USUARIO` no define** en su DDL columnas `CORR_PERSONA` ni `CORR_EMPLEADO`.
5. Otras tablas referencian al usuario **por `LOGIN_SISTEMA`**, no por id de persona, por ejemplo:
   - `SEG_USUARIO_EMPRESA`
   - `SEG_USUARIO_OPCION`
   - `SEG_USUARIO_FOTO`
   - `SEG_USUARIO_LOGIN_HISTORIAL`
   - `SC_UNIDADES_USUARIO`
6. En auditoría de negocio, el login suele grabarse en `USUARIO_CREA` / `USUARIO_ACTU` (mismo valor textual del claim).

### Inferencia (no confundir con hecho de identidad)

- Una persona/empleado puede existir en otras tablas (`GEN_*` / `SC_*`) con correlativos propios; **no** está demostrado en este informe un vínculo 1:1 obligatorio login ↔ persona dentro de `SEG_USUARIO`.
- Para notificaciones de sistema, el destinatario correcto es **`LOGIN_SISTEMA`**, alineado con SignalR.

---

## 5. Propuesta inicial de persistencia (recomendación — no implementada)

> Lo siguiente es **propuesta de diseño**, no objetos existentes.

### Principios

1. Persistir **antes o junto** al push SignalR (la BD es la fuente de verdad si el usuario está offline).
2. Destinatario: **`LOGIN_SISTEMA`** (FK lógica/recomendada a `SEG_USUARIO`).
3. Reutilizar `INotificationSignalRService` solo para el canal realtime (no mezclar persistencia dentro del Hub).
4. Seguir capas Options (Repository → Service → Controller) + vista `V_*`.
5. Respetar collation CS_AS al filtrar por login (mismo casing que el JWT).

### Capacidades a cubrir

| Capacidad | Enfoque propuesto |
|-----------|-------------------|
| Guardar notificación | Insert en tabla de bandeja |
| Título / mensaje / fecha / leída | Columnas dedicadas + `FECHA_CREA` |
| Listar del usuario | `GetAll` sobre vista filtrada por `LOGIN_SISTEMA` |
| Contar no leídas | Query/SP o conteo en servicio sobre flag de lectura |
| Marcar leída | Update del registro (y auditoría `USUARIO_ACTU` / `FECHA_ACTU` si aplica) |
| Offline | Persistencia independiente de la conexión SignalR |
| Realtime | Tras guardar OK → `SendToUserAsync(login, NotificationMessage)` |

### Forma sugerida del registro (campos mínimos de negocio)

Propuesta de columnas (nombres orientativos, a validar en diseño formal):

- Identificador correlativo (`CORR_*`)
- `LOGIN_SISTEMA` (destinatario)
- `TITULO`, `MENSAJE`
- `FECHA_CREA`
- Indicador de lectura (`LEIDA` bit **o** `FECHA_LECTURA` nullable)
- Auditoría estándar del proyecto si se alinea a catálogos (`USUARIO_CREA`, `ESTACION_CREA`, …)
- Opcional: `CORR_EMPRESA`, tipo/origen, enlace a entidad de negocio

**Duda abierta:** ¿la bandeja es por empresa (`CORR_EMPRESA` en PK) o global por login? Muchas tablas SEG llevan empresa; el JWT también trae `CORR_EMPRESA`. Hay que decidirlo antes del DDL.

### Flujo propuesto (alto nivel)

```
Origen de negocio / API
  → Servicio de notificaciones (nuevo, persistencia)
      → Repository Insert
      → INotificationSignalRService.SendToUserAsync (si hay conexión, opcional/best-effort)
  ← Cliente: lista/conteo vía REST + push ReceiveNotification
```

---

## 6. Archivos y objetos SQL que sería necesario crear (futura implementación)

> Lista **propuesta**. Nombres definitivos de tabla/SP deben acordarse; no existen aún en el repo con este propósito.

### Base de datos (propuesta)

| Entregable | Ubicación típica |
|------------|------------------|
| Script DDL tabla + vista (+ índices por login / no leídas) | `SGUEES-DB/Scripts/DEPLOY_*.sql` y/o `SGUEES-DB/Tables/`, `Views/` |
| SP opcionales (`PRAL_DATA_*` listar/contar, `PRAL_MTTO_*` marcar leída) | `SGUEES-DB/Stored Procedures/` + script deploy |
| Script menú/permisos si hay pantalla | `SGUEES-DB/Scripts/MENU_*.sql` |

### Backend API (propuesta)

| Entregable | Ubicación típica |
|------------|------------------|
| Models `*Table` / `*View` / `*Param` | `Options/Security/<ENTIDAD>/Models/` (módulo Security por cercanía a `SEG_USUARIO`) |
| `I*Repository` / `*Repository` | misma carpeta |
| `I*Service` / `*Service` (persistir + llamar SignalR) | misma carpeta |
| `*Controller` (listar, contar, marcar leída; **crear** si hay API HTTP) | misma carpeta |
| Extender o componer con | `INotificationSignalRService` existente (**no reemplazar**) |

### Frontend (fuera del alcance estricto de persistencia, pero necesario luego)

| Entregable | Nota |
|------------|------|
| Ampliar `notification-signalr.service.ts` | Dejar de solo `console.log`; alimentar campana/store |
| Servicio HTTP de bandeja | Listar / contar / marcar leída |
| UI campana | No existe aún como bandeja persistida |

### No crear / no tocar en el primer diseño de persistencia (recomendación)

- Regenerar JWT o claims nuevos.
- Reutilizar `SEG_FLUJO_TIPO_NOTIFICACION` como tabla de mensajes.
- Poner la persistencia dentro de `NotificationHub` (el Hub debe seguir siendo canal; la orquestación en Service).

---

## 7. Dudas o información que falta por verificar

1. **Nombre oficial** de la tabla/vista/SPs y si el prefijo será `SEG_` u otro módulo.
2. **Alcance por empresa:** ¿PK incluye `CORR_EMPRESA`?
3. **Estado de lectura:** ¿solo bit `LEIDA`, o también `FECHA_LECTURA` / usuario que leyó?
4. **Retención / borrado:** ¿histórico indefinido, archivado, o purge?
5. **Remitente:** ¿solo sistema, o también `LOGIN_SISTEMA` origen?
6. **Tipos / categorías:** ¿reutilizar catálogo `SEG_FLUJO_TIPO_NOTIFICACION` solo como FK opcional de “tipo”, o tipos propios de bandeja?
7. **Tabla real en BD de `SEG_FLUJO_TIPO_NOTIFICACION`:** existe CRUD en API, pero **no** apareció DDL en `SGUEES-DB/Tables` con ese nombre en esta búsqueda; conviene confirmar en el servidor SQL que la tabla/vista existen.
8. **Permisos de menú:** ¿la campana usa opción de menú dedicada o endpoints bajo un permiso genérico?
9. **Orden de operaciones:** ¿falla el HTTP si SignalR falla, o la persistencia manda y el push es best-effort?
10. **Multi-dispositivo:** varias conexiones con el mismo `LOGIN_SISTEMA` — SignalR ya entrega a todas; la bandeja BD es única por login (comportamiento deseado a confirmar).

---

## Resumen ejecutivo

| Tema | Conclusión |
|------|------------|
| Acceso a datos | ADO.NET vía `eFramework.CData` / `BaseRepository`; vistas `V_*` + opcionalmente SP `PRAL_*`. **Sin EF Core.** |
| Identidad destinatario | `LOGIN_SISTEMA` (PK de `SEG_USUARIO`, claim JWT, `UserIdentifier` SignalR). **No** es id de persona/empleado. |
| Inbox existente | **No** hay tabla/bandeja de notificaciones de usuario reutilizable. `SEG_FLUJO_TIPO_NOTIFICACION` es catálogo de flujo. |
| Realtime existente | `INotificationSignalRService` + evento `ReceiveNotification` + DTO `TITULO`/`MENSAJE`. |
| Camino recomendado | Nueva entidad persistente (Options/Security) + script SQL en `SGUEES-DB/Scripts` + servicio que persiste y luego emite por SignalR. |

**Siguiente paso (fuera de este informe):** acordar DDL mínimo y contrato API (listar / contar / marcar leída / crear), luego implementar en un PR acotado.
