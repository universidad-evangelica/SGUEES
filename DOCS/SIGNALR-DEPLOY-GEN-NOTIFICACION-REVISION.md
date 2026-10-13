# Revisión y corrección: `DEPLOY_GEN_NOTIFICACION.sql`

**Alcance:** solo investigación de DDL + corrección del script. No se ejecutó SQL ni se modificó API/Angular.

**Archivo modificado:** `SGUEES-DB/Scripts/DEPLOY_GEN_NOTIFICACION.sql`

---

## 1. Convenciones reales encontradas

### `GEN_EMPRESA` — `SGUEES-DB/Tables/dbo.GEN_EMPRESA.sql`

| Aspecto | Valor |
|---------|--------|
| PK | `CORR_EMPRESA int NOT NULL` |
| Collation nombre | `Latin1_General_CS_AS` en campos varchar |
| FK desde otras GEN | Sí (ej. `GEN_PERSONA_CONTACTO`, `GEN_DIVISION`) |

### `SEG_USUARIO` — `SGUEES-DB/Tables/dbo.SEG_USUARIO.sql`

| Aspecto | Valor |
|---------|--------|
| PK | `LOGIN_SISTEMA varchar(30) COLLATE Latin1_General_CS_AS` |
| `USUARIO_CREA` | `varchar(30) CS_AS NOT NULL` |
| `ESTACION_CREA` | `varchar(50) CS_AS NOT NULL` |
| `FECHA_CREA` | `datetime NOT NULL` — **sin DEFAULT** |
| `USUARIO_ACTU` | `varchar(30) CS_AS NULL` |
| `ESTACION_ACTU` / `FECHA_ACTU` | `varchar(50)` / `datetime` NULL |

### `SEG_USUARIO_EMPRESA` — `SGUEES-DB/Tables/dbo.SEG_USUARIO_EMPRESA.sql`

| Aspecto | Valor |
|---------|--------|
| Columnas | `LOGIN_SISTEMA varchar(30) CS_AS`, `CORR_EMPRESA int`, `POR_DEFECTO int` |
| PK | **`(LOGIN_SISTEMA, CORR_EMPRESA)`** |
| FK existente | Solo a `SEG_USUARIO(LOGIN_SISTEMA)` |
| FK a `GEN_EMPRESA` | **No** en el DDL versionado |

### Auditoría en otras GEN — ejemplos

- `GEN_PERSONA_CONTACTO.sql` / `GEN_TIPO_CONTACTO.sql`: `USUARIO_*` / `ESTACION_*` como `varchar(50)`, fechas `datetime`, a menudo NULL; **sin DEFAULT GETDATE** en los DDL revisados.
- Scripts recientes SC/PLA: `varchar(50)` en auditoría.

### Correlativos por empresa — patrón real (no DDL)

- `eFramework/Core/CSQLBuilder.toInsert`: `ISNULL(MAX(corr),0)+1` filtrado por `WHERE` de empresa (sin `UPDLOCK` en el SQL generado).
- SPs (`PRAL_MTTO_GEN_PERSONA_NATURAL`): `MAX+1` con `UPDLOCK, HOLDLOCK` en transacción.

### Scripts idempotentes de referencia

- `SGUEES-DB/Scripts/PLA_TIPO_DOCUMENTO_ADJUNTO.sql`
- `SGUEES-DB/Scripts/SC_EXPEDIENTE_DOCUMENTO.sql` (`IF OBJECT_ID`, FK/índice por nombre, `CREATE OR ALTER VIEW`)

---

## 2. Script completo corregido

Ver archivo:

`SGUEES-DB/Scripts/DEPLOY_GEN_NOTIFICACION.sql`

Cambios principales respecto a la versión anterior:

1. **FK compuesta** a `SEG_USUARIO_EMPRESA (LOGIN_SISTEMA, CORR_EMPRESA)` — tipos y PK destino lo permiten.
2. **Eliminada** la FK aislada a `SEG_USUARIO` (redundante si existe la compuesta).
3. **Conservada** FK a `GEN_EMPRESA` (porque `SEG_USUARIO_EMPRESA` no tiene FK a empresa en el DDL versionado).
4. Auditoría alineada a `SEG_USUARIO`: `USUARIO_* varchar(30) CS_AS`, `ESTACION_* varchar(50) CS_AS`; `FECHA_CREA` sin DEFAULT.
5. Comprobación de FK/índices por **nombre + `parent_object_id` / `object_id`**.
6. Comentarios de alcance idempotente y de correlativo concurrente.

---

## 3. Decisiones (FK, auditoría, índices, restricciones)

### Foreign keys

| FK | Decisión |
|----|----------|
| `FK_GEN_NOTIFICACION_GEN_EMPRESA` | **Sí** — garantiza empresa válida |
| `FK_GEN_NOTIFICACION_SEG_USUARIO_EMPRESA` | **Sí** — `(LOGIN_SISTEMA, CORR_EMPRESA)` → PK de `SEG_USUARIO_EMPRESA`; garantiza pertenencia usuario–empresa |
| `FK_GEN_NOTIFICACION_SEG_USUARIO` | **No** — redundante: el par en `SEG_USUARIO_EMPRESA` ya exige login existente vía su FK |

Orden de columnas en la FK compuesta: `(LOGIN_SISTEMA, CORR_EMPRESA)` para coincidir con la PK destino.

### Auditoría

| Campo | Tipo elegido | Justificación |
|-------|--------------|---------------|
| `USUARIO_CREA` / `USUARIO_ACTU` | `varchar(30) CS_AS` | Igual que `SEG_USUARIO` (valores = login) |
| `ESTACION_CREA` / `ESTACION_ACTU` | `varchar(50) CS_AS` | Igual que `SEG_USUARIO` |
| `FECHA_CREA` | `datetime NOT NULL` **sin DEFAULT** | Igual que `SEG_USUARIO`; la app/SP asigna la fecha |
| `FECHA_ACTU` | `datetime NULL` | Estándar |

### Lectura

- `LEIDA bit NOT NULL DEFAULT 0`
- `URL_DESTINO nvarchar(500) NULL`
- `CK_GEN_NOTIFICACION_LECTURA`: no leída ⇒ `FECHA_LECTURA` NULL; leída ⇒ `FECHA_LECTURA` NOT NULL

### Índices

| Índice | Uso futuro |
|--------|------------|
| `PK (CORR_EMPRESA, CORR_NOTIFICACION)` | Seek al marcar leída + filtro adicional `LOGIN_SISTEMA` |
| `IX_GEN_NOTIFICACION_EMPRESA_LOGIN_FECHA` | Listado por empresa/usuario ordenado por fecha DESC |
| `IX_GEN_NOTIFICACION_EMPRESA_LOGIN_NOLEIDA` (filtrado `LEIDA=0`) | Contador / listado de pendientes |

No se añadió un tercer índice solo para “marcar leída”: la PK + predicado `LOGIN_SISTEMA` basta.

### PK / correlativo

`PK (CORR_EMPRESA, CORR_NOTIFICACION)` con `CORR_NOTIFICACION int` **sin IDENTITY** — permite el mismo número en empresas distintas.

---

## 4. Limitaciones de idempotencia que permanecen

El script **sí** cubre:

- Crear tabla solo si no existe.
- Agregar FKs/índices solo si faltan (por nombre + objeto dueño).
- `CREATE OR ALTER VIEW` de la vista.

El script **no** cubre (a propósito, sin migración compleja):

- Si `GEN_NOTIFICACION` ya existe con columnas distintas, tipos incorrectos o sin PK/CHECK: **no** se altera el esquema de columnas.
- No elimina una FK antigua errónea (p. ej. solo a `SEG_USUARIO` de una versión previa del script) si ya estuviera creada con otro nombre.
- No rellena ni corrige datos existentes incompatibles con el nuevo CHECK o las nuevas FKs (el `ALTER TABLE ADD CONSTRAINT` fallaría si hay huérfanos).
- No crea `SEG_USUARIO_EMPRESA` / `GEN_EMPRESA` si faltaran (prerrequisito del entorno).

---

## 5. Responsabilidad exacta del backend futuro (correlativo)

El DDL **no** reserva correlativos.

El backend (o un SP futuro, fuera de este paso) deberá:

1. Abrir una **transacción**.
2. Calcular el siguiente `CORR_NOTIFICACION` **por `CORR_EMPRESA`** con protección de concurrencia (p. ej. `MAX(...) + 1` sobre la tabla **con** `UPDLOCK, HOLDLOCK` / estrategia equivalente segura — **no** `MAX+1` sin bloqueo ni transacción).
3. Insertar la fila con ese correlativo, `CORR_EMPRESA`, `LOGIN_SISTEMA`, título, mensaje, `URL_DESTINO`, auditoría y `LEIDA = 0`.
4. Confirmar la transacción.
5. Solo entonces invocar SignalR (`INotificationSignalRService`), best-effort.

Referencia de patrón concurrente seguro ya usado en el proyecto: `PRAL_MTTO_GEN_PERSONA_NATURAL` (`UPDLOCK, HOLDLOCK`).

---

## 6. Confirmaciones

- Script **no ejecutado** contra ningún servidor.
- No se modificó ningún archivo aparte de `DEPLOY_GEN_NOTIFICACION.sql` y este informe `.md`.
- No se implementó API, SP de mtto/consulta ni frontend.
