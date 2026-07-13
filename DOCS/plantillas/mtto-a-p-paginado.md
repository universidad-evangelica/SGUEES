# Plantilla mtto A+P — Paginado servidor (CustomStore)

**Versión:** 1.5 — julio 2026  
**Referencia viva (piloto):** `SelectionHiring/sc-impacto-economico`  
**Guía equipo:** [../GUIA-EQUIPO-MTTO.md](../GUIA-EQUIPO-MTTO.md)  
**Contrato HTTP PUT/DELETE:** [mtto-api-crud-http.md](./mtto-api-crud-http.md)  
**Barra / toolbar:** [mtto-barra-patron.md](./mtto-barra-patron.md) (mismo patrón catálogo que A+)  
**Cuándo:** catálogo con muchas filas, columnas de auditoría, paginado servidor — **con o sin** estado catálogo `bit`.

---

## Cuándo NO usar A+P

- Catálogo pequeño (&lt; ~500 filas) → usar **A+** (`mtto-a-plus.md`): menos código, una sola carga, mejor para BD.
- Otros módulos legacy pueden seguir paginando en memoria C# hasta migrar el repository.

---

## A+ vs A+P vs A+P híbrido

| Modo | Qué pagina | Filas visibles | Selector |
|------|------------|----------------|----------|
| **A+** | Solo grid (cliente) | `mttoPageSize` (15) | Oculto |
| **A+P clásico** | API = visible | Lo que eliges en el pager | Pager DX (puede verse “pared” de filas) |
| **A+P híbrido (recomendado)** | API por **lote**; grid siempre 15 filas | Siempre `mttoPageSize` | Selector del **pager inferior** (`50` / `100` / `Todos`) = lote API |

Híbrido: el lote pide `PAGE_SIZE` al API; el pager navega el catálogo de 15 en 15. Si la ventana visible cruza dos lotes (ej. skip 90 + take 15 con lote 100), se piden ambos y se unen.

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

## Flags del hijo (híbrido)

```typescript
protected override mttoRemoteOperations = { paging: true, sorting: true, filtering: false };
protected override mttoGridKeyExpr = 'CORR_XXX';
protected override mttoHybridPaging = true;
protected override mttoPageSize = 15;                 // filas visibles (siempre)
protected override mttoApiPageSize = 50;              // lote API default
protected override mttoApiPageSizes = [50, 100, 'all'];
```

`filtering: false` → **filter row del grid es solo en cliente** (sobre la página visible), **sin petición al API**.

Con `mttoHybridPaging`, el **selector del pager** (abajo) elige el lote API; las filas visibles siguen siendo `mttoPageSize` (15). En **A+** el selector permanece oculto.

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
  invalidateMttoPagedStoreCache(this.pagedStoreCacheState);
  this.pagedStoreInflightKey = null;
  this.pagedStoreInflightPromise = null;
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
  pageSize = this.mttoApiPageSize,
  sortField = '',
  sortDesc = false
): any {
  return {
    CORR_XXX: xCORR_XXX ?? 0,
    PAGE: page,
    PAGE_SIZE: pageSize,  // 0 = todos (lote «Todos»)
    SORT_FIELD: sortField,
    SORT_DESC: sortDesc,
  };
}
```

---

## CustomStore load híbrido

`filtering: false` — el filter row es **solo en cliente**. Los lotes se cachean en `mtto-paged-store.helpers.ts` (`loadMttoHybridDisplayPage`).

```typescript
import {
  createMttoPagedStoreCacheState,
  invalidateMttoPagedStoreCache,
  loadMttoHybridDisplayPage,
  resolveMttoHybridLoadPlan,
  syncMttoHybridApiPageSize,
} from 'src/app/shared/mtto/mtto-paged-store.helpers';

private readonly pagedStoreCacheState = createMttoPagedStoreCacheState(
  this.mttoPageSize,
  this.mttoApiPageSize
);

onApiPageSizeChange(apiPageSize: number): void {
  this.mttoApiPageSize = apiPageSize;
  syncMttoHybridApiPageSize(this.pagedStoreCacheState, apiPageSize);
  this.pagedStoreInflightKey = null;
  this.pagedStoreInflightPromise = null;
}

load: async (loadOptions) => {
  const plan = resolveMttoHybridLoadPlan(
    loadOptions,
    this.pagedStoreCacheState,
    this.mttoGridKeyExpr,
    this.mttoPageSize
  );
  return loadMttoHybridDisplayPage(plan, this.pagedStoreCacheState, (apiPage, apiPageSize, sortField, sortDesc) =>
    this.fetchPaged(apiPage, apiPageSize, sortField, sortDesc, loadGeneration)
  );
},
```

**Prohibido** en load: `FILTER_ROW_JSON`, `parseRemoteGridFilters`, `GetDistinctValues`, `[headerFilterLoader]` remoto.

---

## HTML grid (híbrido)

```html
<app-data-grid-mtto
  [models]="models"
  [keyExpr]="mttoGridKeyExpr"
  [remoteOperations]="mttoRemoteOperations"
  [pageSize]="mttoPageSize"
  [hybridPaging]="mttoHybridPaging"
  [apiPageSize]="mttoApiPageSize"
  [apiPageSizes]="mttoApiPageSizes"
  (refresh)="consultar()"
  (apiPageSizeChange)="onApiPageSizeChange($event)"
  ...
/>
```

Sin `[headerFilterLoader]`. El pager inferior muestra `apiPageSizes`; no hace falta toolbar «Lote».

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
| Payload al navegador | Solo filas **visibles** (15); el lote API se cachea en el CustomStore |
| Lectura SQL (A+P) | `OFFSET/FETCH` vía `eFramework.GetPagedFromViewAsync` (tamaño = lote) |
| Memoria API | COUNT + página/lote, no vista completa en C# (salvo lote Todos) |

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

## Checklist A+P (híbrido)

- [ ] `mttoRemoteOperations` con `filtering: false`
- [ ] `mttoHybridPaging = true`
- [ ] `mttoPageSize` = filas visibles (15); `mttoApiPageSize` / `mttoApiPageSizes` = lote
- [ ] `getMttoDataGrid()` implementado
- [ ] `mttoGridKeyExpr` definido
- [ ] CustomStore con `resolveMttoHybridLoadPlan` + `loadMttoHybridDisplayPage`
- [ ] `(apiPageSizeChange)="onApiPageSizeChange($event)"` + `syncMttoHybridApiPageSize`
- [ ] HTML: `[hybridPaging]`, `[apiPageSize]`, `[apiPageSizes]`, `(apiPageSizeChange)` — selector en pager inferior
- [ ] `guardarMtto` / `rowRemovingMtto` sin reload manual
- [ ] API: `ReadPagedViewAsync` + whitelist sort — ver `ESTANDAR-EFRAMEWORK-PAGING.md`
- [ ] CRUD HTTP: [mtto-api-crud-http.md](./mtto-api-crud-http.md) (`CData.Put` + `ApplyQueryKeys`; Delete solo query)
- [ ] Auditoría: `buildAuditGridColumns({ withDateTimeFilter: true })` al final si aplica
- [ ] **Si tiene estado `bit`:** checklist en [mtto-a-plus-estado-catalogo.md](./mtto-a-plus-estado-catalogo.md)
