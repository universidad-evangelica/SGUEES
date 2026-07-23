# Plantilla mtto A+ — Catálogo simple en memoria

**Versión:** 1.5 — julio 2026  
**Referencia viva:** `General/gen-banco`  
**Contrato HTTP:** [mtto-api-crud-http.md](./mtto-api-crud-http.md)  
**Barra / toolbar:** [mtto-barra-patron.md](./mtto-barra-patron.md) (catálogo = título en barra + Nuevo en grid)  
**Cuándo:** catálogo &lt; ~500 filas por empresa, sin auditoría pesada en grid.

---

## Criterios de elección

- Una tabla / vista `V_*`
- Sin grid detalle hijo
- **No** necesita paginado servidor
- Paginado **solo en cliente**: el grid muestra páginas sobre el array ya cargado; **sin** `PAGE`/`PAGE_SIZE` en API
- El pager **no** muestra selector de tamaño ni "Todos" (`mttoRemoteOperations = false` → `data-grid-mtto` lo oculta automáticamente)

**Con estado activo/inactivo (`bit`):** aplicar también [mtto-a-plus-estado-catalogo.md](./mtto-a-plus-estado-catalogo.md) (toolbar + SP + `activar_inactivar`).  
**Sin estado** o catálogo sin toggle: solo esta plantilla.  
**Muchas filas:** [mtto-a-p-paginado.md](./mtto-a-p-paginado.md) (+ estado catálogo si aplica).

---

## Flags del hijo (CBaseComponent)

```typescript
protected override etiquetaRegistro = 'el registro';
protected override requiereEmpresaSesion = true;  // si aplica empresa
protected override mttoGridKeyExpr = 'CORR_XXX';  // obligatorio para parche sin 2ª petición

// Opcional — override tamaño de página cliente (defaults padre: 20, [20,50,100,200])
// Sin 'all' — la opción "Todos" es solo para A+P (paginado servidor).
protected override mttoPageSize = 5;
protected override mttoPageSizes = [5, 10, 25, 50, 100]; // ignorado en UI si remoteOperations false
protected override mttoRemoteOperations = false;  // default — no cambiar en A+
```

---

## Component TS (esqueleto)

```typescript
export class GenXxxComponent extends CBaseComponent implements OnInit {
  protected override etiquetaRegistro = 'el xxx';
  protected override requiereEmpresaSesion = true;
  protected override mttoGridKeyExpr = 'CORR_XXX';

  ngOnInit(): void {
    this.subTituloVentana = 'Mantenimiento de ...';
    this.consultar();
  }

  fillParam(xCORR_XXX?: number): any {
    return { CORR_XXX: xCORR_XXX ?? 0 };
  }

  override fillData(xModel?: GenXxx): GenXxx { /* mapear campos */ }

  consultar(): void {
    this.consultarMtto({
      load: () => this.service.getAll(this.fillParam()),
    });
  }

  override nuevo(): void {
    if (!this.asegurarEmpresaSesion()) return;
    super.nuevo();
  }

  guardar(): void {
    this.guardarMtto({
      esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
      insert: () => this.service.insert(this.model),
      update: () => this.service.update(this.model),
      // NO onSuccess con consultar() — el padre parchea models[]
    });
  }

  override cancelar(): void {
    super.cancelar((item: any) => item.CORR_XXX === this.modelUpdate.CORR_XXX);
  }

  rowRemoving(e: any): void {
    this.rowRemovingMtto(e, {
      deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_XXX)),
      // NO reload — el padre quita la fila del array
    });
  }

  override bloquear(): void { /* readOnly en editores */ }
  override habilitar(): void { /* quitar readOnly */ }
  override setFocus(): void { /* focus primer campo editable */ }
}
```

---

## HTML (esqueleto)

**Barra:** mínima (título + Guardar/Cancelar en edición). **No** `showDates` ni `btn1`–`btn6` en catálogo.  
**Grid:** `showAdd` / `showRefresh` / `showExport` — Nuevo y Actualizar viven aquí en browse (patrón `com-banco` / `gen-banco`).  
Detalle del patrón: [mtto-barra-patron.md](./mtto-barra-patron.md).

```html
<div class="sguees-mtto-view">
  <app-barra-data-mtto
    [tituloVentana]="tituloVentana"
    [subTituloVentana]="subTituloVentana"
    [isBrowse]="isBrowse()"
    [isForm]="isForm()"
    [permiteAdd]="permiteAdd"
    (nuevo)="nuevo()"
    (guardar)="guardar()"
    (cancelar)="cancelar()"
  />

  <div class="content-block dx-card responsive-paddings sguees-mtto-form-card" *ngIf="!isBrowse()">
    <dx-form #fData [formData]="model" [colCount]="mttoFormColCount"
      [colCountByScreen]="mttoFormColCountByScreen" [items]="items" />
  </div>

  <app-data-grid-mtto
    [models]="models"
    [columns]="columns"
    [summary]="summary"
    [keyExpr]="mttoGridKeyExpr"
    [pageSize]="mttoPageSize"
    [remoteOperations]="mttoRemoteOperations"
    [showAdd]="true"
    [showRefresh]="true"
    [showExport]="true"
    [permiteEditar]="getPermiteEditar"
    [permiteDele]="getPermiteDele"
    (refresh)="consultar()"
    (add)="nuevo()"
    (rowDblClick)="rowDblClick($event)"
    (rowRemoving)="rowRemoving($event)"
    (editClick)="editarClick($event)"
  />
</div>

<dx-load-panel [(visible)]="loadingVisible" ... />
```

---

## Service — update / delete (estándar HTTP)

Ver [mtto-api-crud-http.md](./mtto-api-crud-http.md).

```typescript
update(model: any): Observable<IResult> {
  return this.repo.update(model, [{ Parameter: 'CORR_XXX', Value: model.CORR_XXX }]);
}

delete(param: any): Observable<IResult> {
  return this.repo.delete([{ Parameter: 'CORR_XXX', Value: param.CORR_XXX }]);
}
```

**API controller:** `ApplyQueryKeys` en `Put`; `Delete` con `[FromQuery]` solamente.

---

## Service — columnas de auditoría (si la vista las trae)

Solo **usuario y fechas** al **final** del grid. **No** `ESTACION_CREA` / `ESTACION_ACTU`. No incluir auditoría en `getItems()` del formulario.

```typescript
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';

getColumns(): any[] {
  return [
    { dataField: 'CORR_XXX', caption: 'Corr.', width: 85 },
    { dataField: 'DESCRIPCION', caption: 'Descripción', width: 300 },
    ...buildAuditGridColumns(),
  ];
}
```

---

## Prohibido

- `p-toast` local, `.scss` propio (salvo excepción documentada)
- `override notifyFx`
- `onSuccess: () => this.consultar()` en `guardarMtto` (doble petición innecesaria)
- `confirmaAccion` en delete del grid (usar `rowRemovingMtto`)
- Columna `btnAcciones` custom para editar/eliminar
- `CustomStore` en A+
- Botones de negocio / fechas en el grid (`toolbarButtons`, etc.) — ver [mtto-barra-patron.md](./mtto-barra-patron.md)
- Segunda barra custom solo para el título

---

## Checklist

- [ ] `mttoGridKeyExpr` definido
- [ ] `guardarMtto` sin reload
- [ ] `rowRemovingMtto` sin reload
- [ ] `(editClick)="editarClick($event)"`
- [ ] Barra mínima + grid `showAdd` / `showRefresh` (patrón catálogo)
- [ ] 4 regiones TS
- [ ] Routing con `exports: [RouterModule]`
- [ ] PUT/DELETE según [mtto-api-crud-http.md](./mtto-api-crud-http.md)
- [ ] Auditoría al final con `buildAuditGridColumns()` si aplica
- [ ] **Si tiene estado `bit`:** checklist en [mtto-a-plus-estado-catalogo.md](./mtto-a-plus-estado-catalogo.md)
