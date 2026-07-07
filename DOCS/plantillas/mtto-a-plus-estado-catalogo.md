# Plantilla mtto — Estado catálogo (activo/inactivo)

**Versión:** 1.3 — julio 2026  
**Extiende:** [mtto-a-plus.md](./mtto-a-plus.md) **o** [mtto-a-p-paginado.md](./mtto-a-p-paginado.md)  
**Contrato HTTP:** [mtto-api-crud-http.md](./mtto-api-crud-http.md)  
**SP BD:** [../ESTANDAR-SP-ESTADO-CATALOGO-BIT.md](../ESTANDAR-SP-ESTADO-CATALOGO-BIT.md)  
**Referencia viva (piloto):** `SelectionHiring/sc-impacto-economico`

---

## Cuándo usar

Catálogos maestros con **solo dos estados**: activo / inactivo (`bit`).

| Plantilla base | Con estado |
|----------------|------------|
| **A+** — catálogo en memoria | A+ **+** este documento |
| **A+P** — paginado servidor | A+P **+** este documento |

**No usar** para documentos con flujo `DI` / `AP` / `AN` → [mtto-estado-transaccional.md](./mtto-estado-transaccional.md).

---

## Base de datos

| Campo | Tipo | Default |
|-------|------|---------|
| `ESTADO_<ENTIDAD>` | `bit` | `1` (activo) |

Incluir en tabla y vista `V_*`. Columnas auditoría: `USUARIO_ACTU`, `FECHA_ACTU`, `ESTACION_ACTU`.

**SP genérico (una vez por BD):** `PRAL_MTTO_CATALOGO_ESTADO_BIT` — lee el bit actual en BD y lo **invierte** (true ↔ false). Deploy: `SGUEES-DB/Scripts/DEPLOY_SP_CATALOGO_ESTADO_BIT.sql`.

---

## API

| Método | Uso |
|--------|-----|
| `Post` / `Put` | CRUD normal |
| `Put ActivarInactivar` | Cambio de estado vía SP (un solo endpoint) |

Permiso: `|U` (mismo que actualizar). `ApplyQueryKeys` en `ActivarInactivar` — ver [mtto-api-crud-http.md](./mtto-api-crud-http.md).

### Repository — patrón `SolicitarAsync`

Constantes en el repository (no vienen del cliente HTTP):

```csharp
private const string _TableName = "SC_IMPACTO_ECONOMICO";
private const string _ViewName = "V_SC_IMPACTO_ECONOMICO";
private const string _CampoPk = "CORR_IMPACTO_ECONOMICO";
private const string _CampoEstado = "ESTADO_IMPACTO_ECONOMICO";
private const bool _UsaEmpresa = true;
```

```csharp
public async Task<CResult> ActivarInactivarAsync(MI_TABLATable Data, string vLOGIN_SISTEMA, string vESTACION)
{
    CResult objResultado = new();
    try
    {
        var p = new List<CParameter>
        {
            new() { ParameterName = "NOMBRE_TABLA", Value = _TableName, DbType = DbType.String },
            new() { ParameterName = "CAMPO_PK", Value = _CampoPk, DbType = DbType.String },
            new() { ParameterName = "CAMPO_ESTADO", Value = _CampoEstado, DbType = DbType.String },
            new() { ParameterName = "USA_EMPRESA", Value = _UsaEmpresa, DbType = DbType.Boolean },
            new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
            new() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_XXX, DbType = DbType.Int32 },
            new() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = DbType.String },
            new() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? "", DbType = DbType.String },
            new() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.InputOutput },
            new() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.InputOutput },
            new() { ParameterName = "@SYS_MENSAJE_ERROR", Value = "", DbType = DbType.String, Direction = ParameterDirection.InputOutput, Size = 4000 },
        };

        await objData.ExecCmd(CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);

        if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
        {
            var xWhere = new List<CParameter> { /* CORR_EMPRESA + PK */ };
            var readerGet = await objData.GetDataReader(_ViewName, xWhere);
            var response = new List<MIView>().FromDataReader(readerGet).FirstOrDefault();
            readerGet.Close();

            objResultado.Data = response;
            objResultado.Result = true;
            objResultado.RowsAffected = 1;  // igual que SolicitarAsync — no leer @SYS_FILAS_AFECTADAS
            objResultado.CodeHelper = response?.CORR_XXX ?? Data.CORR_XXX;
            objResultado.ErrorCode = 0;
        }
        else { /* leer @SYS_NUMERO_ERROR y @SYS_MENSAJE_ERROR */ }
    }
    catch (Exception e) { /* ... */ }
    finally { objData.objConnection.Close(); }
    return objResultado;
}
```

**Referencia completa:** `SC_IMPACTO_ECONOMICORepository.ActivarInactivarAsync`.

### Controller + Service

```csharp
[HttpPut("ActivarInactivar")]
[Authorize(Policy = "/mi-ruta|U")]
public async Task<IActionResult> ActivarInactivar(MI_TABLATable Data)
{
    this.ApplyQueryKeys(Data, nameof(MI_TABLATable.CORR_XXX));
    Data.CORR_EMPRESA = GetCorrEmpresa();
    var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
    return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
}
```

Service: validar empresa y `CORR_XXX > 0`; **no** mutar descripción ni `UpdateAsync` completo.

---

## SPA — Service / Repository

Mismo patrón que `delete` — solo la PK en `xWhere`:

```typescript
activarInactivar(model: any): Observable<IResult> {
  return this.repo.activarInactivar(model, [
    { Parameter: 'CORR_XXX', Value: model.CORR_XXX },
  ]);
}
```

```typescript
activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
  return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.Url...API);
}
```

---

## SPA — Service columnas (badge)

```typescript
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

const ESTADO_FIELD = 'ESTADO_XXX';

getColumns(): any[] {
  return [
    { dataField: 'CORR_XXX', caption: 'Corr.', width: 85 },
    { dataField: 'DESCRIPCION', caption: 'Descripción', width: 300 },
    createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
    ...buildAuditGridColumns(), // si aplica
  ];
}
```

CSS badge: global `sguees-mtto-module.scss` — **sin** `.scss` por pantalla.

---

## SPA — Component (`activar_inactivar`)

Toolbar muestra **Activar** o **Desactivar** según la fila; **ambos** llaman el mismo método (el SP invierte en BD).

```typescript
protected override mttoCampoEstado = 'ESTADO_XXX';
protected override mttoEstadoDescribeField = 'DESCRIPCION';

activar_inactivar(): void {
  this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
}
```

- `invocarActivarInactivar` — en `CBaseComponent`: fila seleccionada, confirmación, `ejecutarActivarInactivar`, parche grid.
- Requiere `mttoGridKeyExpr` definido (A+ y A+P).

### HTML grid

```html
<app-data-grid-mtto
  [showEstadoToolbar]="true"
  [campoEstado]="mttoCampoEstado"
  [puedeCambiarEstado]="permiteEdit"
  [focusedRowKey]="gridFocusedRowKey"
  (activarInactivar)="activar_inactivar()"
  (focusedRowChanged)="focusedRowChanged($event)"
  [keyExpr]="mttoGridKeyExpr"
  ...
/>
```

- `gridFocusedRowKey` — getter en `CBaseComponent` (restaura foco tras cancelar Nuevo).

- Grid: **solo badge** en columna estado — **sin** botones por fila.
- `buildEstadoToolbarOptions` en `shared/mtto/mtto-grid.helpers.ts`.
- `buildEstadoActionButtons` → **deprecated** (legacy por fila).

---

## Formulario

- Checkbox `ESTADO_*` en alta (default activo) o solo lectura en edición.
- Cambio de estado por **toolbar**, no mezclado con guardar descripción.

---

## Flujo completo

```
Toolbar Activar o Desactivar
  → activar_inactivar()
  → service.activarInactivar(row) + xWhere PK
  → API Put ActivarInactivar + ApplyQueryKeys
  → Repository → SP (toggle bit + auditoría)
  → Relectura V_*
  → Grid parcheado con response.Data
```

---

## Checklist estado catálogo

- [ ] Campo `bit` en BD y vista `V_*`
- [ ] SP `PRAL_MTTO_CATALOGO_ESTADO_BIT` desplegado
- [ ] Repository: constantes tabla/PK/campo estado + `ActivarInactivarAsync` (patrón Solicitar)
- [ ] API `Put ActivarInactivar` + `ApplyQueryKeys` + permiso `|U`
- [ ] `createEstadoColumnConfig` en `getColumns()`
- [ ] `mttoCampoEstado` + `activar_inactivar()` + `invocarActivarInactivar`
- [ ] `[showEstadoToolbar]` + `(activarInactivar)` + `(focusedRowChanged)`
- [ ] Service/repo: `activarInactivar` con xWhere PK (como `delete`)
- [ ] Sin `buildEstadoActionButtons` por fila
- [ ] **No** mezclar con patrón varchar transaccional
