# Plantilla mtto — Estado catálogo (activo/inactivo)

**Versión:** 1.1 — julio 2026  
**Extiende:** [mtto-a-plus.md](./mtto-a-plus.md) o [mtto-a-p-paginado.md](./mtto-a-p-paginado.md)  
**Referencia viva (piloto cerrado):** `SelectionHiring/sc-impacto-economico`  
**Guía equipo:** [../GUIA-EQUIPO-MTTO.md](../GUIA-EQUIPO-MTTO.md)

---

## Cuándo usar

Catálogos maestros con **solo dos estados**: activo / inactivo.

**No usar** para documentos, partidas u opciones con flujo (`DI`, `AP`, `AN`…) → ver [mtto-estado-transaccional.md](./mtto-estado-transaccional.md).

---

## Base de datos

| Campo | Tipo | Default |
|-------|------|---------|
| `ESTADO_<ENTIDAD>` | `bit` | `1` (activo) |

Incluir en tabla y vista `V_*`.

---

## API

| Método | Uso |
|--------|-----|
| `Post` / `Put` | CRUD normal; estado en insert según negocio |
| `Put Activar` | Pone `ESTADO_* = true` |
| `Put Desactivar` | Pone `ESTADO_* = false` |

Permisos: mismos del mantenimiento (`|U` para activar/desactivar).

---

## Service — columna grid (badge verde/rojo)

```typescript
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

const ESTADO_FIELD = 'ESTADO_XXX';

getColumns(): any[] {
  return [
    { dataField: 'CORR_XXX', caption: 'Corr.', width: 85 },
    { dataField: 'DESCRIPCION', caption: 'Descripción', width: 300 },
    createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
    // columnas auditoría opcionales...
  ];
}
```

CSS badge: global en `sguees-mtto-module.scss` (`.estado-badge--activo` / `--inactivo`). **Sin** `.scss` por pantalla.

---

## Component — activar / desactivar (v1.1 — toolbar)

Botones **Activar** / **Desactivar** en toolbar del grid, junto a **Agregar**, sobre la **fila seleccionada** (`focusedRowChanged`).

```typescript
protected override mttoCampoEstado = 'ESTADO_XXX';
protected override mttoEstadoDescribeField = 'DESCRIPCION';

onActivarToolbar(): void {
  const row = this.obtenerFilaSeleccionada();
  if (!row) {
    this.notificarSeleccionRequerida();
    return;
  }
  this.confirmaAccion('Activar registro', `¿Desea activar "${row.DESCRIPCION}"?`,
    () => this.cambiarEstado(row, true));
}

onDesactivarToolbar(): void {
  const row = this.obtenerFilaSeleccionada();
  if (!row) {
    this.notificarSeleccionRequerida();
    return;
  }
  this.confirmaAccion('Desactivar registro', `¿Desea desactivar "${row.DESCRIPCION}"?`,
    () => this.cambiarEstado(row, false));
}

private cambiarEstado(row: any, activo: boolean): void {
  const request = { ...row, [ESTADO_FIELD]: activo };
  this.ejecutarCambioEstado({
    activar: () => this.service.activar(request),
    desactivar: () => this.service.desactivar(request),
    activo,
  });
}
```

HTML grid:

```html
<app-data-grid-mtto
  [showEstadoToolbar]="true"
  [campoEstado]="mttoCampoEstado"
  [puedeCambiarEstado]="permiteEdit"
  (activarEstado)="onActivarToolbar()"
  (desactivarEstado)="onDesactivarToolbar()"
  (focusedRowChanged)="focusedRowChanged($event)"
  ...
>
```

- Grid: **solo badge** verde/rojo en columna estado — **sin** botones por fila.
- Helper: `buildEstadoToolbarOptions` en `shared/mtto/mtto-grid.helpers.ts`.
- `buildEstadoActionButtons` queda **deprecated** (solo legacy).

### Legacy v1.0 — botones en fila (no usar en pantallas nuevas)

`[customButtons]="buildEstadoActionButtons(...)"` — deprecado.

---

## Formulario

- Checkbox `ESTADO_*` en alta (default activo) o solo lectura en edición
- Cambio de estado preferentemente por toolbar/acción, no mezclado con guardar descripción

---

## Checklist estado catálogo

- [ ] Campo `bit` en BD y vista
- [ ] `createEstadoColumnConfig` en `getColumns()`
- [ ] API `Activar` / `Desactivar`
- [ ] `showEstadoToolbar` + `campoEstado` en grid (sin `customButtons` por fila)
- [ ] `(focusedRowChanged)` enlazado al padre
- [ ] `obtenerFilaSeleccionada()` antes de confirmar
- [ ] Sin `.scss` local para badges
- [ ] **No** mezclar con patrón varchar transaccional
