# Plantilla — Patrón de barra mtto (Compras)

**Versión:** 1.0 — julio 2026  
**Referencias vivas:**  
- Proceso: `Shop/com-documento`, `Accounting/con-partida`  
- Catálogo: `Shop/com-banco`, `General/gen-banco`

Un solo componente: **`app-barra-data-mtto`**. No inventar otra barra de título ni botones de negocio en el grid.

---

## Cómo decide la barra (mecanismo)

Default: `layoutMode = 'header-only'`.

| Condición en HTML | Browse | Dónde vive Nuevo / Actualizar |
|-------------------|--------|-------------------------------|
| `showDates` **o** texto en `btn1`–`btn6` | Barra **completa** (proceso) | En la **barra** |
| Sin fechas ni `btn1`–`btn6` | Barra **solo título** (+ subtítulo) | En el **grid** (`showAdd` / `showRefresh`) |

Eso no es un segundo componente: es el mismo `app-barra-data-mtto` según inputs. En edición, Guardar/Cancelar siempre van en la barra.

---

## 1) Proceso / Tipo C / consulta con fechas

**Copiar HTML de barra de** `com-documento`.

```html
<app-barra-data-mtto
  [tituloVentana]="tituloVentana"
  [isBrowse]="isBrowse()"
  [isForm]="isForm()"
  [permiteAdd]="permiteAdd"
  (nuevo)="nuevo()"
  (guardar)="guardar()"
  (cancelar)="cancelar()"
  [showRefresh]="true"
  [showDates]="true"
  (consultar)="consultar()"
  [(FECHA_INICIAL)]="vFECHA_INICIAL"
  [(FECHA_FINAL)]="vFECHA_FINAL"
  [btn1]="btnAplicar"
  [btn1Icon]="'check'"
  [btn1Type]="'success'"
  (btn1Click)="Aplicar()"
  [btn1Width]="100"
  [btn1Mode]="'contained'"
  <!-- btn2…btn4 igual: Icon / Type / Click / Width / Mode en HTML -->
>
</app-barra-data-mtto>

<app-data-grid-mtto
  [isBrowse]="isBrowse()"
  [models]="models"
  [columns]="columns"
  [keyExpr]="..."
  <!-- SIN showAdd / showRefresh — evitan Nuevo duplicado -->
  (editClick)="editarClick($event)"
  ...
/>
```

**TS:** solo textos (mostrar/ocultar), como Compras:

```typescript
refrescarBotones() {
  // Asignar 'Aplicar' / '' según estado o modo browse/form
  this.btnAplicar = ...;
}
```

**Franjas extra de negocio** (ej. Procesos Contables en Partida): preferir proyectarlas en el toolbar del grid con `[toolbarBeforeTemplate]` + `<ng-template>` (HTML del hijo), para no sumar una tercera barra. **No** usar arrays `toolbarButtons` en TS.

---

## 2) Catálogo A+ / A+P

**Copiar** `gen-banco` / `com-banco`.

```html
<app-barra-data-mtto
  [tituloVentana]="tituloVentana"
  [subTituloVentana]="subTituloVentana"
  [isBrowse]="isBrowse()"
  [isForm]="isForm()"
  [permiteAdd]="permiteAdd"
  (nuevo)="nuevo()"
  (guardar)="guardar()"
  (cancelar)="cancelar()"
>
</app-barra-data-mtto>

<app-data-grid-mtto
  [showAdd]="true"
  [showRefresh]="true"
  [showExport]="true"
  (add)="nuevo()"
  (refresh)="consultar()"
  ...
/>
```

No forzar `showDates` ni `btn1` vacíos solo para “llenar” la barra.

---

## Regla de oro

| Hacer | No hacer |
|-------|----------|
| Icono, ancho, modo, `(btnNClick)` en **HTML** de `app-barra-data-mtto` | Arrays `toolbarButtons` en el TS o en el grid |
| Textos de botón en TS (`refrescarBotones`) | Fechas / botones de proceso en `app-data-grid-mtto` |
| Un solo `app-barra-data-mtto` por pantalla | Segunda barra custom solo para el título |
| Proceso: grid **sin** `showAdd` | Nuevo en barra **y** en grid a la vez |
| Catálogo: Nuevo en grid | Inventar `layoutMode` distinto sin necesidad |
| Procesos especiales (Apertura/Cierre): `toolbarBeforeTemplate` + HTML | Arrays de botones en TS / segunda card solo para eso |

---

## Checklist rápido

- [ ] ¿Proceso con fechas o acciones? → barra como `com-documento`; grid sin `showAdd`/`showRefresh`
- [ ] ¿Catálogo A+/A+P? → barra mínima; grid con `showAdd`/`showRefresh`
- [ ] Botones de negocio solo en HTML de la barra (consulta/proceso)
- [ ] Procesos especiales (Apertura/Cierre): `toolbarBeforeTemplate` + HTML, no tercera card
- [ ] TS solo asigna texto (`''` = oculto)
- [ ] Sin arrays `toolbarButtons` en TS para armar la toolbar
