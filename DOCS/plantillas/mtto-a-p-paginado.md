# Plantilla mtto A+P — Paginado servidor (CustomStore)

**Versión:** 1.4 — julio 2026  
**Referencia viva (piloto):** `SelectionHiring/sc-impacto-economico`  
**Guía equipo:** [../GUIA-EQUIPO-MTTO.md](../GUIA-EQUIPO-MTTO.md)  
**Contrato HTTP PUT/DELETE:** [mtto-api-crud-http.md](./mtto-api-crud-http.md)  
**Cuándo:** catálogo con muchas filas, columnas de auditoría, paginado servidor — **con o sin** estado catálogo `bit`.

---

## Cuándo NO usar A+P

- Catálogo pequeño (&lt; ~500 filas) → usar **A+** (`mtto-a-plus.md`): menos código, una sola carga, mejor para BD.
- Otros módulos legacy pueden seguir paginando en memoria C# hasta migrar el repository.

---

## API — paginación vía eFramework

**No implementar SQL en cada repository.** Usar:

- `CData.GetPagedFromViewAsync<TView>` o `BaseRepository.ReadPagedViewAsync`
- Doc: [ESTANDAR-EFRAMEWORK-PAGING.md](../ESTANDAR-EFRAMEWORK-PAGING.md)

Parámetros: `PAGE`, `PAGE_SIZE` (0 = all), `SORT_FIELD`, `SORT_DESC` + `CORR_EMPRESA`.

Repository A+P:

```csharp
var paged = await ReadPagedViewAsync<MIView>("V_MI_TABLA", xWhere, _AllowedSortFields, "CORR_XXX");
objResultado.Data = paged.PageData;
objResultado.RowsAffected = paged.TotalRows;
```

**Prohibido:** SQL crudo, `Skip`/`Take` en C#, filtros JSON remotos.

---

## Flags del hijo

```typescript
protected override mttoRemoteOperations = { paging: true, sorting: true, filtering: false };
protected override mttoGridKeyExpr = 'CORR_XXX';
// mttoPageSize y mttoPageSizes: heredar del padre (20, [20,50,100,200,'all']) o override
```

`filtering: false` → **filter row del grid es solo en cliente** (sobre la página cargada), **sin petición al API**.

Con `remoteOperations.paging: true`, `data-grid-mtto` muestra el **selector de tamaño de página** y la opción **"Todos"** (`allowedPageSizes` puede incluir `'all'`). En **A+** ese selector permanece oculto.

---

## ViewChild + getMttoDataGrid

```typescript
@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

protected override getMttoDataGrid(): DataGridMttoComponent | null {
  return this.dataGrid ?? null;
}
```

---

## consultar / guardar / delete

```typescript
ngOnInit(): void {
  this.configurarDataSource(); // CustomStore — no consultarMtto al inicio
}

consultar(resetPage = true): void {
  this.refrescarGridMtto(resetPage);
}

guardar(): void {
  this.guardarMtto({
    esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
    insert: () => this.service.insert(this.model),
    update: () => this.service.update(this.model),
    // Padre parchea CustomStore — NO consultar() aquí
  });
}

rowRemoving(e: any): void {
  this.rowRemovingMtto(e, {
    deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_XXX)),
  });
}
```

---

## fillParam para API paginado

```typescript
fillParam(
  xCORR_XXX?: number,
  page = 1,
  pageSize = this.mttoPageSize,
  sortField = '',
  sortDesc = false
): any {
  return {
    CORR_XXX: xCORR_XXX ?? 0,
    PAGE: page,
    PAGE_SIZE: pageSize,  // 0 = todos (opción 'all' del pager)
    SORT_FIELD: sortField,
    SORT_DESC: sortDesc,
  };
}
```

---

## CustomStore load (solo page + sort — sin filtros remotos)

`filtering: false` — el filter row es **solo en cliente** (página cargada). DevExtreme puede llamar `load` al filtrar; usar helper `mtto-paged-store.helpers.ts` para no repetir `GetAll`.

**Pager "Todos":** DevExtreme puede enviar `'all'` o `0`. El grid compartido (`data-grid-mtto`) normaliza a `0` y emite `pageSizeChange`; la pantalla sincroniza caché **antes** del `load` vía `syncMttoPagedStorePagerSize`.

```typescript
import {
  createMttoPagedStoreCacheState,
  invalidateMttoPagedStoreCache,
  rememberMttoPagedServerCache,
  resolveMttoPagedLoadParams,
  syncMttoPagedStorePagerSize,
  tryGetMttoPagedServerCache,
} from 'src/app/shared/mtto/mtto-paged-store.helpers';

private readonly pagedStoreCacheState = createMttoPagedStoreCacheState(this.mttoPageSize);
private pagedStoreInflightKey: string | null = null;
private pagedStoreInflightPromise: Promise<MttoPagedStorePageResult> | null = null;

consultar(resetPage = true): void {
  invalidateMttoPagedStoreCache(this.pagedStoreCacheState);
  this.pagedStoreInflightKey = null;
  this.pagedStoreInflightPromise = null;
  this.refrescarGridMtto(resetPage);
}

onPagerPageSizeChange(pageSize: number): void {
  syncMttoPagedStorePagerSize(this.pagedStoreCacheState, pageSize);
  this.pagedStoreInflightKey = null;
  this.pagedStoreInflightPromise = null;
}

load: async (loadOptions) => {
  const loadGeneration = this.pagedStoreCacheState.loadGeneration;
  const { page, pageSize, sortField, sortDesc, serverKey } = resolveMttoPagedLoadParams(
    loadOptions,
    this.pagedStoreCacheState,
    this.mttoGridKeyExpr,
    this.dataGrid?.activePageSize
  );
  const cached = tryGetMttoPagedServerCache(serverKey, this.pagedStoreCacheState);
  if (cached) return cached;
  // ... GetAll con fillParam(0, page, pageSize, sortField, sortDesc) ...
  rememberMttoPagedServerCache(serverKey, result, this.pagedStoreCacheState, pageSize);
},
```

**Grid compartido (`data-grid-mtto`):** `resolveActivePageSize` convierte `'all'` → `0` y respeta `0` (no usar `||` con pageSize). Emite `@Output() pageSizeChange` al cambiar el pager.

**Prohibido** en load: `FILTER_ROW_JSON`, `parseRemoteGridFilters`, `GetDistinctValues`, `[headerFilterLoader]` remoto.

`data-grid-mtto` con `filtering: false` **no** sincroniza headerFilter al escribir en filter row (evita `GetAll` extra).

---

## HTML grid

```html
<app-data-grid-mtto
  [models]="models"
  [keyExpr]="mttoGridKeyExpr"
  [remoteOperations]="mttoRemoteOperations"
  [pageSize]="mttoPageSize"
  [allowedPageSizes]="mttoPageSizes"
  (refresh)="consultar()"
  (pageSizeChange)="onPagerPageSizeChange($event)"
  ...
/>
```

Sin `[headerFilterLoader]`.

---

## Service — columnas de auditoría

Si `V_*` trae `USUARIO_*`, `FECHA_*`, `ESTACION_*`: en el grid solo **usuario y fechas**, **al final**, sin estación.

```typescript
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

getColumns(): any[] {
  return [
    { dataField: 'CORR_XXX', caption: 'Corr.', width: 100 },
    { dataField: 'DESCRIPCION', caption: 'Descripción', width: 650 },
    createEstadoColumnConfig('ESTADO_XXX', ESTADO_ACTIVO_INACTIVO_LABELS), // si aplica
    ...buildAuditGridColumns({ withDateTimeFilter: true }),
  ];
}
```

Piloto: `sc-impacto-economico.service.ts`.

---

## API — contrato GetAll

| Parámetro | Uso |
|-----------|-----|
| `PAGE` | Número de página (1-based) |
| `PAGE_SIZE` | Tamaño; `0` = devolver todos |
| `SORT_FIELD` / `SORT_DESC` | Orden |
| `CORR_EMPRESA` | Desde token / param |

Respuesta: `Data` = filas de la página, `RowsAffected` = total para el pager.

---

## Rendimiento

| Qué optimiza | Detalle |
|--------------|---------|
| Payload al navegador | Solo filas de la página |
| Lectura SQL (A+P) | `OFFSET/FETCH` vía `eFramework.GetPagedFromViewAsync` |
| Memoria API | COUNT + página, no vista completa en C# |

**Legacy:** otros catálogos A+P pueden seguir en memoria hasta migrar su repository.

---

## Con estado catálogo (`bit`) — opcional

Si el catálogo tiene activo/inactivo, combinar con **[mtto-a-plus-estado-catalogo.md](./mtto-a-plus-estado-catalogo.md)** (misma extensión para A+ y A+P):

- `createEstadoColumnConfig` en `getColumns()`
- `mttoCampoEstado` + `activar_inactivar()` en component
- `[showEstadoToolbar]` + `(activarInactivar)` en grid
- API `Put ActivarInactivar` + SP `PRAL_MTTO_CATALOGO_ESTADO_BIT`

Piloto: `sc-impacto-economico`.

---

## API — capas (piloto impacto)

| Capa | Hacer |
|------|-------|
| Controller | `SetCreateAudit` / `SetUpdateAudit`, `ApplyQueryKeys` en PUT y `ActivarInactivar`, `Delete` con `[FromQuery]` |
| Service | `ValidateEmpresaSesion`, validaciones negocio |
| Repository | `ReadPagedViewAsync`, `_AllowedSortFields`, `ActivarInactivarAsync` si hay estado `bit` |

**Detalle PUT vs DELETE:** [mtto-api-crud-http.md](./mtto-api-crud-http.md)

- **PUT** — body + query; `CData.Put` (SPA) + `ApplyQueryKeys` (API).
- **DELETE** — solo query; PK desde `e.data` del grid. **No** `ApplyQueryKeys`.

---

## Checklist A+P

- [ ] `mttoRemoteOperations` con `filtering: false`
- [ ] `getMttoDataGrid()` implementado
- [ ] `mttoGridKeyExpr` definido
- [ ] CustomStore sin filtros remotos en load
- [ ] `(pageSizeChange)="onPagerPageSizeChange($event)"` + `syncMttoPagedStorePagerSize` + `resolveMttoPagedLoadParams` con `cacheState` y `dataGrid?.activePageSize`
- [ ] `guardarMtto` / `rowRemovingMtto` sin reload manual
- [ ] API: `ReadPagedViewAsync` + whitelist sort — ver `ESTANDAR-EFRAMEWORK-PAGING.md`
- [ ] CRUD HTTP: [mtto-api-crud-http.md](./mtto-api-crud-http.md) (`CData.Put` + `ApplyQueryKeys`; Delete solo query)
- [ ] Auditoría: `buildAuditGridColumns({ withDateTimeFilter: true })` al final si aplica
- [ ] **Si tiene estado `bit`:** checklist en [mtto-a-plus-estado-catalogo.md](./mtto-a-plus-estado-catalogo.md)
