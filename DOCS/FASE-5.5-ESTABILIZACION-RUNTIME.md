# Fase 5.5 — Estabilización runtime y performance visual

**Fecha:** 2026-05-28  
**Problema:** Compilación OK, pero en `ng serve` algunas pantallas congelaban el navegador («La página no responde»).

---

## Causa raíz detectada (combinación)

No fue un solo bug, sino un **ciclo de layout + change detection** entre:

| Factor | Efecto |
|--------|--------|
| **`columnHidingEnabled` reactivo** | Cada evento `ScreenService` (resize/breakpoint) recalculaba columnas del DataGrid → repaint costoso con virtual scroll + filter row |
| **Breakpoint `medium` incluido** | En viewports ~992–1199px el grid alternaba hiding con frecuencia al ajustar drawer `shrink` |
| **`[width]` dinámico en search panel** | Binding que forzaba re-layout del header panel en cada resize |
| **Altura `calc(100vh - 280px)`** | DevExtreme virtual scroll + drawer shrink recalculan altura en bucle resize ↔ grid ↔ breakpoint |
| **Transiciones CSS globales** | `.dx-button { transition… transform }` y transiciones en filas/grid/drawer `width` → repaints masivos en DOM grande |
| **Drawer `transition: width`** | Reflow continuo del área de contenido mientras el grid mide viewport |
| **Riesgo columnas duplicadas** | `columns.push` sin guard si el componente se reinicializa → layout explosivo |

**Fluent** no fue la causa directa; amplificó el costo de repaint al aumentar nodos/estilos del grid.

---

## Optimizaciones aplicadas

### 1. DataGridMtto (`data-grid-mtto.component.ts/html`)

- `ChangeDetectionStrategy.OnPush`
- Suscripción a `screenChanged` con **`debounceTime(200)`** (no `changed` sin debounce)
- `columnHidingActive` solo cambia si el valor difiere
- **Column hiding responsive solo en x-small / small** (eliminado `medium`)
- Altura por defecto **`670` px** (estable); `calc(100vh…)` solo si se pasa explícitamente o `[dynamicViewportHeight]="true"` con resize debounced 250ms
- `[repaintChangesOnly]="true"`
- `rowRenderingMode="virtual"` en scrolling
- **Guard** `ensureActionColumns()` — no duplica `btnEditar` / `btnEliminar`
- Eliminado binding `[width]` del search panel → **CSS responsive** (`max-width`)

### 2. CSS grid (`sguees-premium-grid.scss`)

- Quitada `transition` en contenedor del grid y en celdas de filas
- Quitado `box-shadow` hover animado en el grid completo
- Search panel: `max-width` por media query

### 3. Micro UX (`sguees-micro-ux.scss`)

- Transiciones de botones **solo** en toolbar/header/barra (no todos los `.dx-button` del grid)

### 4. Drawer / shell

- `fluent-enterprise.scss`: drawer solo `transition: transform` (sin `width`)
- `side-nav-outer-toolbar`: `screenChanged` debounced; `updateDrawer()` con **early return** si no hay cambios
- `side-navigation-menu`: sin transition en ítems del TreeView

---

## Archivos modificados

```
src/app/layouts/data-grid-mtto/data-grid-mtto.component.ts
src/app/layouts/data-grid-mtto/data-grid-mtto.component.html
src/app/layouts/side-nav-outer-toolbar/side-nav-outer-toolbar.component.ts
src/app/theme/styles/sguees-premium-grid.scss
src/app/theme/styles/sguees-micro-ux.scss
src/app/theme/styles/fluent-enterprise.scss
src/app/shared/components/library/side-navigation-menu/side-navigation-menu.component.scss
```

---

## Features visuales reducidas (mínimo, UX premium conservada)

| Antes | Después |
|-------|---------|
| Hover con sombra animada en todo el grid | Sombra estática |
| Transición en hover de filas | Hover instantáneo (color only) |
| Column hiding en tablet medium | Solo móvil / small tablet |
| Search panel width binding JS | CSS max-width |
| Altura viewport dinámica por defecto | 670px fijo; dinámico opt-in |
| Animación width drawer/menú | Solo transform drawer |

**Se mantiene:** Fluent, headers premium, toolbar integrada, hover filas, export, edición, virtual scroll, responsive padding, tema dark/light.

---

## Cómo reactivar altura dinámica (opcional)

En una pantalla concreta si se necesita altura viewport:

```html
<app-data-grid-mtto
  [dynamicViewportHeight]="true"
  ...
>
```

---

## Validación

- `npm run build` → **OK**
- Recomendado manual: `ng serve` → `/gen-pais`, `/com-proveedor` → redimensionar ventana, abrir/cerrar menú, filtrar grid — verificar ausencia de freeze

### DevTools (recomendado)

1. Performance: grabar 10s al redimensionar → no debe haber barras largas continuas de `Layout`/`Recalculate Style`
2. Performance monitor: CPU estable en idle tras carga
3. Angular DevTools: evitar picos de CD en cada pixel de resize

---

## Recomendaciones futuras (opcional)

1. Pantallas con muchos datos: valorar `[dynamicViewportHeight]="false"` y pageSize menor
2. `com-proveedor` y pantallas compuestas: perfilar si `filterSyncEnabled` + muchos tabs generan carga extra
3. Lazy load de módulos de dominio para reducir presión inicial de memoria
4. `UserPanelComponent` / `decodedToken` en constructor (bug QA previo, no freeze pero errores en consola)
5. Si se requiere column hiding en tablet: activar solo bajo `max-width: 991px` vía CSS/adaptive, no toggling frecuente en desktop

---

## Hotfix adicional (freeze al abrir mantenimientos)

**Causa principal confirmada:** en `barra-data-mtto.component.html`, `[options]="btnOptions({...})"` creaba un **objeto nuevo en cada change detection**. DevExtreme reinicializaba los botones del toolbar → eventos de layout → más CD → **bucle infinito** (home no usa barra/grid intensivo).

**Correcciones:**
- `BarraDataMtto`: `OnPush` + opciones cacheadas (`optNuevo`, `optGuardar`, …) reconstruidas solo en `ngOnChanges`
- `DataGridMtto`: sin suscripción a `ScreenService`; `filterSyncEnabled` solo si hay `filterValue`; botones edit/delete con `visible` booleano (no función por fila); `focusedRowEnabled` solo con datos; grid simplificado (sin group panel/toolbar duplicado/filter-panel); `columnResizingMode: 'nextColumn'`

---

*Fase 5.5 — runtime estable sin revertir Fluent ni UX enterprise.*
