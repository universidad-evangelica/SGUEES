# Plantilla mtto A+P — Paginado servidor (CustomStore)

**Versión:** 1.1 — julio 2026  
**Referencia viva (piloto cerrado):** `SelectionHiring/sc-impacto-economico`  
**Guía equipo:** [../GUIA-EQUIPO-MTTO.md](../GUIA-EQUIPO-MTTO.md)  
**Cuándo:** catálogo con muchas filas, columnas de auditoría, o estado catálogo + necesidad de paginar en servidor.

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

```typescript
private configurarDataSource(): void {
  this.models = new CustomStore({
    key: this.mttoGridKeyExpr,
    loadMode: 'processed',
    cacheRawData: false,
    load: async (loadOptions) => {
      const requestedTake = loadOptions.take;
      const pageSize = !requestedTake ? 0 : requestedTake;
      const skipRows = loadOptions.skip || 0;
      const page = pageSize > 0 ? Math.floor(skipRows / pageSize) + 1 : 1;
      const sort = this.getGridSort(loadOptions.sort);

      const response = await lastValueFrom(
        this.service.getAll(this.fillParam(0, page, pageSize, sort?.field ?? '', sort?.desc ?? false))
      );

      if (!response.Result) throw new Error(response.ErrorMessage || '...');

      return {
        data: response.Data || [],
        totalCount: response.RowsAffected || 0,
      };
    },
  });
}
```

**Prohibido** en load: `FILTER_ROW_JSON`, `GetDistinctValues`, header filters remotos.

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
  ...
/>
```

Sin `[headerFilterLoader]`.

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

## Con estado catálogo

Combinar con [mtto-a-plus-estado-catalogo.md](./mtto-a-plus-estado-catalogo.md).

---

## API — capas (piloto impacto)

| Capa | Hacer |
|------|-------|
| Controller | `SetCreateAudit` / `SetUpdateAudit`, `ApplyPrimaryKeyFromQuery` en PUT, `CORR_EMPRESA` desde claim |
| Service | `ValidateEmpresaSesion`, validaciones negocio, `ExistsDescripcionAsync` con `excludeCorr` en update |
| Repository | `ReadPagedViewAsync`, `_AllowedSortFields` |

SPA `update()` — PK numérica en body y query (DevExtreme puede mandar `0` en body).

---

## Checklist A+P

- [ ] `mttoRemoteOperations` con `filtering: false`
- [ ] `getMttoDataGrid()` implementado
- [ ] `mttoGridKeyExpr` definido
- [ ] CustomStore sin filtros remotos en load
- [ ] `guardarMtto` / `rowRemovingMtto` sin reload manual
- [ ] API: `ReadPagedViewAsync` + whitelist sort — ver `ESTANDAR-EFRAMEWORK-PAGING.md`
- [ ] Service SPA `update()` con PK explícita
