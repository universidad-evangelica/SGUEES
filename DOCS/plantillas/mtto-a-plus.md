# Plantilla mtto A+ — Catálogo simple en memoria

**Versión:** 1.0 — junio 2026  
**Referencia viva:** `General/gen-banco`  
**Cuándo:** catálogo &lt; ~500 filas por empresa, sin activar/desactivar, sin auditoría pesada en grid.

---

## Criterios de elección

- Una tabla / vista `V_*`
- Sin grid detalle hijo
- **No** necesita paginado servidor
- **No** tiene estado activo/inactivo (o no aplica)

Si necesita estado bit + badge → usar también `mtto-a-plus-estado-catalogo.md`.  
Si necesita muchas filas → `mtto-a-p-paginado.md`.

---

## Flags del hijo (CBaseComponent)

```typescript
protected override etiquetaRegistro = 'el registro';
protected override requiereEmpresaSesion = true;  // si aplica empresa
protected override mttoGridKeyExpr = 'CORR_XXX';  // obligatorio para parche sin 2ª petición

// Opcional — override paginación cliente (defaults padre: 20, [20,50,100,200,'all'])
protected override mttoPageSize = 5;
protected override mttoPageSizes = [5, 10, 25, 50, 100];
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

```html
<div class="sguees-mtto-view">
  <app-barra-data-mtto ... (nuevo)="nuevo()" (guardar)="guardar()" (cancelar)="cancelar()" />

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
    [allowedPageSizes]="mttoPageSizes"
    [remoteOperations]="mttoRemoteOperations"
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

## Prohibido

- `p-toast` local, `.scss` propio (salvo excepción documentada)
- `override notifyFx`
- `onSuccess: () => this.consultar()` en `guardarMtto` (doble petición innecesaria)
- `confirmaAccion` en delete del grid (usar `rowRemovingMtto`)
- Columna `btnAcciones` custom para editar/eliminar
- `CustomStore` en A+

---

## Checklist

- [ ] `mttoGridKeyExpr` definido
- [ ] `guardarMtto` sin reload
- [ ] `rowRemovingMtto` sin reload
- [ ] `(editClick)="editarClick($event)"`
- [ ] 4 regiones TS
- [ ] Routing con `exports: [RouterModule]`
