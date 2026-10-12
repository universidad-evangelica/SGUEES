# Diseño: persistencia y navegación de notificaciones (SGUEES-TH)

**Alcance:** investigación + propuesta de diseño. **No se implementó nada** (sin DDL, sin API nueva, sin cambios a Hub/Angular/Program.cs).

**Documentos relacionados:**

- `DOCS/SIGNALR-JWT-IDENTIDAD.md` — claims / `LOGIN_SISTEMA`
- `DOCS/SIGNALR-PERSISTENCIA-NOTIFICACIONES-INVESTIGACION.md` — inventario previo
- `DOCS/SIGNALR-PRUEBA-ENVIO-PROPUESTA.md` — prueba SignalR

Leyenda: **[HECHO]** verificado en código/DDL · **[PROPUESTA]** diseño recomendado · **[DUDA]** decisión pendiente

---

## 1. Arquitectura real encontrada

### Backend de datos — **[HECHO]**

| Pieza | Realidad |
|-------|----------|
| Stack | `eFramework.BaseRepository<T>` + `eFramework.Core.CData` + `Microsoft.Data.SqlClient` |
| No usar | EF Core, Dapper (no están el patrón del proyecto) |
| Lectura | Vistas `V_*` vía `GetDataReader` / `ReadPagedViewAsync` (`GetPagedFromViewAsync`) |
| Escritura simple | `Insert` / `Update` / `Delete` (SQL dinámico) |
| Escritura compleja | SP `PRAL_MTTO_*` / `PRAL_DATA_*` con `ExecCmd` / `GetDataReader(StoredProcedure)` |
| Resultado | `CResult` / `CPagedResult<T>` |
| DI | `RegisterAssemblyPublicNonGenericClasses` → clases `*Service` / `*Repository` Scoped |

Referencias:

- `SGUEES-API/eFramework/Core/CData.cs`
- `SGUEES-API/eFramework/Data/BaseRepository.cs`
- `SGUEES-API/sguees.api/Options/General/GEN_BANCO/GEN_BANCORepository.cs`
- `SGUEES-API/sguees.api/Program.cs` (auto-registro)

### Capas Options — **[HECHO]**

Patrón estándar:

```
Options/{Módulo}/{ENTIDAD}/
  Controller + Service + IService + Repository + IRepository
  Models/{ENTIDAD}Table|View|Param
```

### SignalR existente — **[HECHO]**

| Pieza | Valor |
|-------|--------|
| Hub | `sguees.api/Services/Hubs/NotificationHub.cs` + `[Authorize]` |
| Ruta | `/hubs/notifications` |
| Emisor | `INotificationSignalRService.SendToUserAsync(loginSistema, NotificationMessage)` |
| Evento | `ReceiveNotification` |
| DTO actual | `TITULO`, `MENSAJE` (sin `URL_DESTINO` ni id aún) |
| Destinatario runtime | `Clients.User(loginSistema)` = `Context.UserIdentifier` = `LOGIN_SISTEMA` |
| JSON SignalR | `PropertyNamingPolicy = null` (alineado a Controllers) |

### Identidad — **[HECHO]**

- Claim usuario: `ClaimTypes.NameIdentifier` → `LOGIN_SISTEMA`
- Claim empresa: `"CORR_EMPRESA"` (int en JWT)
- Controllers leen ambos desde `User.Claims` (ej. `SEG_USUARIOController`)

### Frontend navegación — **[HECHO]**

- Angular Router (`RouterModule`, `AuthGuardService`)
- Menú: `URL_OPCION` en BD → `path` en side-nav → `this.router.navigate([path])`  
  (`side-nav-outer-toolbar.component.ts`)
- Otras zonas usan `router.navigateByUrl(ruta)` (ej. `recorrido-guia.service.ts`)
- Rutas de módulo ejemplo: `path: 'sc-bandeja-th'` → URL menú `N'/sc-bandeja-th'`  
  (`selection-hiring-routing.module.ts`, `MENU_SC_BANDEJA_TH.sql`)
- `SEG_OPCION_SISTEMA.URL_OPCION`: `nvarchar(4000)` (`dbo.SEG_OPCION_SISTEMA.sql`)

### Lo que NO es bandeja — **[HECHO]**

- `SEG_FLUJO_TIPO_NOTIFICACION`: catálogo de **tipos** de notificación de flujo.
- `sguees-notification.service.ts`: toasts PrimeNG, no persistencia.
- No hay tabla inbox de usuario versionada con este propósito en `SGUEES-DB`.

---

## 2. Convenciones SQL y relaciones comprobadas

### Nombres y tipos — **[HECHO]**

| Concepto | Convención |
|----------|------------|
| Prefijo seguridad | `SEG_` |
| PK numérica | `CORR_*` (`int`, a menudo `IDENTITY` o correlativo por empresa) |
| Empresa | `CORR_EMPRESA int NOT NULL` + FK frecuente a `GEN_EMPRESA` |
| Usuario acceso | `LOGIN_SISTEMA varchar(30) COLLATE Latin1_General_CS_AS` + FK a `SEG_USUARIO` |
| Fechas | `datetime` |
| Flags | `bit` |
| Auditoría | `USUARIO_CREA`, `FECHA_CREA`, `ESTACION_CREA`, `USUARIO_ACTU`, `FECHA_ACTU`, `ESTACION_ACTU` |
| Vista | `V_` + nombre tabla |
| Deploy | Scripts idempotentes en `SGUEES-DB/Scripts/` con `sqlcmd -f 65001` |

### Relaciones empresa + login — **[HECHO]**

| Tabla | PK / vínculo |
|-------|----------------|
| `SEG_USUARIO` | PK `LOGIN_SISTEMA` |
| `SEG_USUARIO_EMPRESA` | PK (`LOGIN_SISTEMA`, `CORR_EMPRESA`) |
| `SC_UNIDADES_USUARIO` | PK (`CORR_EMPRESA`, `CORR_UNIDAD`, `LOGIN_SISTEMA`); FK empresa + FK usuario |
| `SEG_USUARIO_LOGIN_HISTORIAL` | PK `CORR_LOGIN IDENTITY`; FK `LOGIN_SISTEMA`; **sin** `CORR_EMPRESA` |

### Índices por usuario/fecha — **[HECHO]**

Ejemplo real:

```sql
-- SEG_USUARIO_LOGIN_HISTORIAL
CREATE NONCLUSTERED INDEX [IX_SEG_USUARIO_LOGIN_HISTORIAL_LOGIN_SISTEMA]
ON [dbo].[SEG_USUARIO_LOGIN_HISTORIAL] ([LOGIN_SISTEMA], [FECHA_LOGIN] DESC)
```

Bandejas SC usan paginación SQL:

```sql
OFFSET @OFFSET ROWS FETCH NEXT @PAGE_SIZE ROWS ONLY
```

(ej. repositorios `SC_BANDEJA_*`).

Parámetros A+P tipados: `PAGE`, `PAGE_SIZE` (ej. `SC_IMPACTO_ECONOMICOParam`).

### Collation — **[HECHO]**

`LOGIN_SISTEMA` es **case-sensitive** (`Latin1_General_CS_AS`). Coincide con la sensibilidad de `Clients.User` en SignalR. No normalizar con `.ToLower()` al persistir ni al enviar.

---

## 3. Diseño propuesto de la tabla `SEG_NOTIFICACION`

### Nombre — **[PROPUESTA]**

`SEG_NOTIFICACION` — compatible con prefijo Security y con “bandeja de usuario”, **sin** confundir con `SEG_FLUJO_TIPO_NOTIFICACION`.

Vista: `V_SEG_NOTIFICACION`.

### Columnas — **[PROPUESTA]** (tipos alineados a convenciones comprobadas)

| Columna | Tipo SQL propuesto | Nulo | Notas |
|---------|-------------------|------|--------|
| `CORR_EMPRESA` | `int` | NO | Aislamiento multiempresa |
| `CORR_NOTIFICACION` | `int` | NO | Identificador; ver estrategia PK abajo |
| `LOGIN_SISTEMA` | `varchar(30) COLLATE Latin1_General_CS_AS` | NO | Destinatario; FK → `SEG_USUARIO` |
| `TITULO` | `varchar(200)` | NO | Longitud razonable (ajustar si negocio pide más) |
| `MENSAJE` | `varchar(1000)` | NO | Texto corto de bandeja; no documento largo |
| `URL_DESTINO` | `nvarchar(500)` NULL | SÍ | Ruta interna Angular; NULL = sin navegación |
| `FECHA_CREA` | `datetime` | NO | Creación |
| `LEIDA` | `bit` | NO | Default `0` |
| `FECHA_LECTURA` | `datetime` NULL | SÍ | Solo cuando `LEIDA = 1` |
| `USUARIO_CREA` | `varchar(30)` o `varchar(50)` | NO | Login del proceso/sistema que generó (auditoría) |
| `ESTACION_CREA` | `varchar(50)` NULL | SÍ | Estación origen |
| `USUARIO_ACTU` | `varchar(30/50)` NULL | SÍ | Quien marcó leída / última actuación |
| `ESTACION_ACTU` | `varchar(50)` NULL | SÍ | |
| `FECHA_ACTU` | `datetime` NULL | SÍ | |

### Clave primaria — **[PROPUESTA]** (opción recomendada)

```text
PK_SEG_NOTIFICACION (CORR_EMPRESA, CORR_NOTIFICACION)
```

- `CORR_NOTIFICACION`: `IDENTITY(1,1)` **global** *o* correlativo por empresa (como muchos catálogos `CORR_*` + `CORR_EMPRESA`).
- **Recomendación:** `IDENTITY` global + PK compuesta `(CORR_EMPRESA, CORR_NOTIFICACION)` para forzar filtro de empresa en toda operación, *o* PK solo `CORR_NOTIFICACION IDENTITY` + índice único/filtros por empresa+login.

**Preferida para aislamiento:** PK `(CORR_EMPRESA, CORR_NOTIFICACION)` con `CORR_NOTIFICACION INT IDENTITY(1,1)` (IDENTITY sigue siendo único; la empresa va en la PK lógica de negocio).

### FK — **[PROPUESTA]**

```text
FK → SEG_USUARIO (LOGIN_SISTEMA)
FK → GEN_EMPRESA (CORR_EMPRESA)   -- patrón visto en SC_UNIDADES_USUARIO
```

Opcional endurecido: validar en aplicación (o trigger/SP) que el par exista en `SEG_USUARIO_EMPRESA`.

### Auditoría estándar — **[PROPUESTA]**

**Sí incluir** `USUARIO_CREA` / `FECHA_CREA` / `ESTACION_CREA` (+ actu al marcar leída).  
Justificación: es el estándar de casi todos los registros operativos SEG/SC/GEN; facilita soporte y trazabilidad del origen.

### Tipo / origen de evento — **[PROPUESTA]**

| Campo | ¿Incluir en v1? | Justificación |
|-------|-----------------|---------------|
| `CODIGO_ORIGEN` / `TIPO_EVENTO` (`varchar` corto) | **Opcional v1.1** | Útil para filtros y analytics; no bloquea bandeja básica |
| FK a `SEG_FLUJO_TIPO_NOTIFICACION` | **No en v1** | Ese catálogo es de **flujo**, no de bandeja; mezclarlo genera acoplamiento incorrecto |
| Payload JSON extra | **No en v1** | Complejidad; `URL_DESTINO` + título/mensaje bastan |

### Defaults — **[PROPUESTA]**

- `LEIDA = 0`
- `FECHA_CREA = GETDATE()` (o asignado en API)
- `URL_DESTINO` default NULL

---

## 4. Estrategia de aislamiento por `CORR_EMPRESA` + `LOGIN_SISTEMA`

### Regla de oro — **[PROPUESTA]**

Toda lectura/escritura de bandeja del **usuario autenticado** debe filtrar:

```text
CORR_EMPRESA = claim CORR_EMPRESA
AND LOGIN_SISTEMA = claim NameIdentifier
```

Y en marcar leída / get by id:

```text
+ CORR_NOTIFICACION = @id
```

Nunca confiar en `CORR_EMPRESA` / `LOGIN_SISTEMA` enviados por el cliente en el body para **consulta propia**.  
Para **creación** (origen de negocio): el servicio emisor interno fija destinatario y empresa; no es un endpoint público “envíame a quien quiera”.

### Capas de enforcement — **[PROPUESTA]**

| Capa | Mecanismo |
|------|-----------|
| API (listar/contar/marcar) | Controller toma empresa+login **solo del JWT** |
| Repository WHERE | Siempre incluye ambos filtros (+ id al actualizar) |
| SignalR | `Clients.User(LOGIN_SISTEMA)`; el payload debe incluir `CORR_EMPRESA` para que el cliente descarte notificaciones de otra empresa si el JWT cambió |
| SPA | Usa sesión actual (`getCorrEmpresaSesion` / token); no pide “otra empresa” |

### Multi-pestaña / multi-dispositivo — **[HECHO + PROPUESTA]**

- **[HECHO]** Varias conexiones SignalR con el mismo `LOGIN_SISTEMA` reciben el mismo `Clients.User`.
- **[PROPUESTA]** Una sola fila en BD por notificación; todas las pestañas actualizan contador/listado vía el mismo evento + refresh REST opcional.

---

## 5. Índices y estrategia de paginación

### Índices — **[PROPUESTA]**

1. **Listado / campana (principal):**

```sql
CREATE NONCLUSTERED INDEX IX_SEG_NOTIFICACION_EMPRESA_LOGIN_FECHA
ON dbo.SEG_NOTIFICACION (CORR_EMPRESA, LOGIN_SISTEMA, FECHA_CREA DESC)
INCLUDE (LEIDA, TITULO, URL_DESTINO);  -- INCLUDE ajustar según plan real
```

2. **Contador no leídas:**

```sql
CREATE NONCLUSTERED INDEX IX_SEG_NOTIFICACION_EMPRESA_LOGIN_NOLEIDA
ON dbo.SEG_NOTIFICACION (CORR_EMPRESA, LOGIN_SISTEMA, LEIDA, FECHA_CREA DESC)
WHERE LEIDA = 0;  -- índice filtrado (recomendado si el volumen de leídas crece)
```

Patrón análogo comprobado: índice `(LOGIN_SISTEMA, FECHA_LOGIN DESC)` en historial de login.

### Paginación — **[PROPUESTA]** alineada a A+P / bandejas

| Parámetro | Default sugerido |
|-----------|------------------|
| `PAGE` | 1 |
| `PAGE_SIZE` | 20–50 (tope servidor, ej. 100–200 como `ReadPagedViewAsync` maxPageSize) |
| Orden | `FECHA_CREA DESC`, desempate `CORR_NOTIFICACION DESC` |
| Mecánica | `OFFSET/FETCH` o `GetPagedFromViewAsync` sobre `V_SEG_NOTIFICACION` |

Respuesta: lista + `totalCount` (para pager y badge).

---

## 6. Contratos API propuestos

> **[PROPUESTA]** — no crear aún. Nombres de ruta orientativos.

### Identidad en cada request de bandeja propia

| Dato | Origen |
|------|--------|
| `LOGIN_SISTEMA` | `ClaimTypes.NameIdentifier` |
| `CORR_EMPRESA` | claim `"CORR_EMPRESA"` |
| Estación | `ClientInfoHelper` / patrón existente al actualizar |

### Endpoints (usuario autenticado — su bandeja)

| Método | Ruta propuesta | Acción |
|--------|----------------|--------|
| `GET` | `/SEG_NOTIFICACION` o `/seg-notificacion` | Listado paginado (`PAGE`, `PAGE_SIZE`, opcional `SOLO_NO_LEIDAS`) |
| `GET` | `/SEG_NOTIFICACION/pendientes/count` | Contador `LEIDA = 0` |
| `PUT` | `/SEG_NOTIFICACION/{corr}/leer` | Marca leída (filtra empresa+login+corr) |

Permisos: **[DUDA]** opción de menú dedicada vs política genérica (ej. cualquier usuario autenticado con sesión). Recomendación: `[Authorize]` + policy propia `/seg-notificacion|R` / `|U` si habrá pantalla; para solo campana header, bastaría autenticado + aislamiento por claims.

### Endpoint / servicio de **creación** (interno)

| Enfoque | Descripción |
|---------|-------------|
| **A (recomendado v1)** | Método de servicio `CrearYEnviarAsync(...)` invocado desde otros Services de negocio (sin HTTP público de “broadcast”) |
| **B** | `POST` interno/`[Authorize]` restringido a procesos/admin (más adelante) |

Parámetros de creación (servidor):

- `CORR_EMPRESA`, `LOGIN_SISTEMA` destinatario (validados)
- `TITULO`, `MENSAJE`, `URL_DESTINO?`
- `USUARIO_CREA`, `ESTACION_CREA`

### DTO de lectura / SignalR — **[PROPUESTA]**

Extender el contrato de push (hoy solo título/mensaje) para campana coherente:

```text
CORR_EMPRESA
CORR_NOTIFICACION
TITULO
MENSAJE
URL_DESTINO          -- nullable
FECHA_CREA
LEIDA                -- normalmente false al emitir
```

**[PROPUESTA]** Ampliar `NotificationMessage` (o crear `NotificationMessageView` / DTO de bandeja) en una fase de implementación autorizada; el evento sigue llamándose `ReceiveNotification`.

### Validaciones API — **[PROPUESTA]**

1. Usuario solo opera sobre su claim login + claim empresa.
2. Marcar leída: 404/403 si el `CORR_NOTIFICACION` no pertenece a ese par.
3. Idempotencia marcar leída: si ya `LEIDA=1`, OK sin error agresivo.
4. Creación: rechazar si el destinatario no tiene acceso a la empresa (`SEG_USUARIO_EMPRESA`) — **[DUDA]** si se exige FK estricta en v1.

---

## 7. Flujo de persistencia y envío SignalR

```text
[Origen de negocio / Service]
        |
        v
[SEG_NOTIFICACIONService.CrearYEnviarAsync]
        |
        +--> Repository.Insert (BD)  ---- si falla --> NO SignalR, error al origen
        |
        +--> (OK) INotificationSignalRService.SendToUserAsync(LOGIN_SISTEMA, dto)
                    |
                    +--> Clients.User → ReceiveNotification  (best-effort)
        |
        v
   return fila creada (CResult)
```

### Reglas — **[PROPUESTA]**

1. **Persistir primero**; la BD es fuente de verdad offline.
2. SignalR **después** del commit/insert exitoso.
3. Si SignalR falla: la notificación **sigue** en BD; el cliente la verá al listar/contar (no revertir insert).
4. No poner lógica de negocio en `NotificationHub`.
5. Multi-dispositivo: un insert + un `Clients.User` alcanza todas las conexiones del login.

---

## 8. Campo `URL_DESTINO` y navegación Angular

### Formato compatible — **[HECHO + PROPUESTA]**

| Aspecto | Evidencia / propuesta |
|---------|----------------------|
| Router | Angular Router — **[HECHO]** |
| Formato menú | Rutas absolutas de app con `/` inicial, ej. `/sc-bandeja-th`, `/sc-movimiento-personal`, `/asistente` — **[HECHO]** en scripts MENU |
| Navegación menú | `router.navigate([path])` — **[HECHO]** |
| Navegación con query/deep link | Preferir `router.navigateByUrl(url)` — **[PROPUESTA]** (ya usado en guía) |
| Longitud BD menú | `URL_OPCION nvarchar(4000)` — **[HECHO]**; para bandeja `nvarchar(500)` suele bastar |

Ejemplos reales de `URL_OPCION` (no inventados):

- `/sc-movimiento-personal`
- `/sc-bandeja-actores`
- `/sc-bandeja-th`
- `/sc-expediente-candidato`
- `/asistente`

### Validación de destinos internos — **[PROPUESTA]**

Al **crear** (servidor) y/o al **navegar** (cliente):

1. Rechazar si contiene esquema (`http:`, `https:`, `//`, `javascript:`).
2. Exigir que empiece por `/`.
3. Opcional v1.1: allowlist contra `SEG_OPCION_SISTEMA.URL_OPCION` o contra rutas conocidas del router.
4. No abrir URLs externas desde la campana.

### Si `URL_DESTINO` es NULL o vacío — **[PROPUESTA]**

- Mostrar notificación (título/mensaje) **sin** acción de navegación (o solo marcar leída / abrir detalle).
- Comportamiento análogo a menú sin `path`: no navegar (`recorrido-guia` ya hace `if (!ruta) return`).

### ¿Transportar `URL_DESTINO` en SignalR? — **[PROPUESTA]**

**Sí.** Motivos:

- Actualizar campana en vivo sin round-trip inmediato.
- Permitir clic inmediato en el toast/item recién llegado.
- Mantener paridad con el registro persistido.

El listado REST sigue siendo la fuente completa (histórico, leídas, paginación).

### Flujo clic — **[PROPUESTA]**

1. Usuario hace clic en la notificación.
2. SPA llama `PUT .../leer` (optimistic UI opcional).
3. Si `URL_DESTINO` tiene valor válido → `router.navigateByUrl(URL_DESTINO)`.
4. Si vacío → solo cierra panel / marca leída.

---

## 9. Archivos y objetos SQL a crear posteriormente

> Solo cuando haya autorización explícita de implementación.

### BD

| Objeto | Ubicación típica |
|--------|------------------|
| Script deploy tabla + vista + índices | `SGUEES-DB/Scripts/DEPLOY_SEG_NOTIFICACION.sql` |
| DDL tabla (opcional espejo) | `SGUEES-DB/Tables/dbo.SEG_NOTIFICACION.sql` |
| Vista | `V_SEG_NOTIFICACION` |
| SP opcionales | `PRAL_DATA_SEG_NOTIFICACION` (listar/contar), `PRAL_MTTO_SEG_NOTIFICACION` (insert/leer) — o Insert/Update vía `CData` si basta |
| Menú/permisos | Solo si hay pantalla dedicada: `MENU_SEG_NOTIFICACION.sql` |

### API

| Archivo | Rol |
|---------|-----|
| `Options/Security/SEG_NOTIFICACION/Models/*` | Table / View / Param |
| `ISEG_NOTIFICACIONRepository` / `SEG_NOTIFICACIONRepository` | Persistencia |
| `ISEG_NOTIFICACIONService` / `SEG_NOTIFICACIONService` | Orquesta BD + `INotificationSignalRService` |
| `SEG_NOTIFICACIONController` | Listar / contar / marcar leída |
| Ajuste DTO SignalR | Extender `NotificationMessage` o DTO hermano |

### SPA

| Archivo | Rol |
|---------|-----|
| `notification-signalr.service.ts` | Escuchar payload completo; exponer stream/Subject |
| Servicio HTTP bandeja | GET lista/count, PUT leer |
| UI campana (header) | Badge + lista + click navegación |
| Validación cliente `URL_DESTINO` | Guardas anti open-redirect |

### No modificar en el diseño de persistencia (salvo necesidad puntual)

- Generación JWT / login
- `NotificationHub` (seguir delgado)
- Catálogo `SEG_FLUJO_TIPO_NOTIFICACION` como bandeja

---

## 10. Riesgos, decisiones pendientes y recomendaciones

### Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Filtrado incompleto → fuga entre empresas/usuarios | Claims obligatorios en Controller + WHERE compuesto + pruebas |
| Casing `LOGIN_SISTEMA` vs SignalR | Persistir y enviar el valor exacto del JWT (CS_AS) |
| Open redirect vía `URL_DESTINO` | Validar solo rutas internas `/...` |
| Volumen de leídas | Índice filtrado `LEIDA = 0`; paginación |
| SignalR down | Persistencia manda; sync al abrir campana |
| DTO SignalR incompleto hoy | Ampliar payload en la misma iteración que la BD |

### Decisiones pendientes — **[DUDA]**

1. ¿`CORR_NOTIFICACION` IDENTITY global o correlativo por empresa?
2. ¿Permiso de menú dedicado o solo API autenticada para campana?
3. ¿Creación solo vía servicios internos o también HTTP admin?
4. ¿Exigir pertenencia a `SEG_USUARIO_EMPRESA` al insertar?
5. ¿Deep links con query (`/sc-...?corr=`) en v1 o solo rutas de módulo?
6. ¿Retención / purge automático de notificaciones antiguas?
7. ¿Incluir `CODIGO_ORIGEN` en v1 o diferirlo?

### Recomendaciones de arquitectura

1. Tratar **bandeja** (`SEG_NOTIFICACION`) y **tipos de flujo** (`SEG_FLUJO_TIPO_NOTIFICACION`) como dominios separados.
2. Orquestar en **Service** (persistir → SignalR), no en el Hub.
3. Aislar siempre por **`(CORR_EMPRESA, LOGIN_SISTEMA)`**.
4. Extender el evento `ReceiveNotification` con id, empresa, `URL_DESTINO` y fechas para UI en tiempo real.
5. Navegar con `navigateByUrl` y validación de ruta interna.
6. Versionar DDL con script idempotente `sqlcmd -f 65001` en `SGUEES-DB/Scripts`.

---

## Resumen ejecutivo

| Tema | Conclusión |
|------|------------|
| Persistencia | Nueva tabla **`SEG_NOTIFICACION`** (propuesta), no reutilizar catálogo de flujo |
| Aislamiento | **`CORR_EMPRESA` + `LOGIN_SISTEMA`** en toda operación de bandeja |
| Identidad API | Solo desde JWT; cliente no elige “otra” empresa/usuario en consultas propias |
| Realtime | Tras insert OK → `INotificationSignalRService` / `ReceiveNotification` |
| Navegación | `URL_DESTINO` nullable; formato `/ruta-angular`; validar interno; NULL = sin navigate |
| Stack | Mantener `CData` / `BaseRepository` / Options Security |

**Siguiente paso:** autorización explícita para implementar DDL + API + extensión del DTO SignalR + campana SPA en un PR acotado.
