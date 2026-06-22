# Fase 7B — Grid Module Premium Convergence

**Fecha:** 2026-05-29  
**Referencia visual:** `sc-test` → `.sc-test-grid` + toolbar integrada  
**Alcance:** Evolucionar `data-grid-mtto` sin modificar CRUDs individuales.

---

## Resumen

Se trasladaron los patrones visuales y de toolbar de `sc-test` al componente compartido `app-data-grid-mtto`. Las **33 pantallas** CRUD heredan toolbar premium, contenedor encapsulado y estilos alineados a sc-test.

**Build:** ✅ `npm run build`  
**Rendimiento Fase 5.5:** ✅ Opciones refresh cacheadas; ítems DX nativos (`searchPanel`, `exportButton`); sin objetos inline en template.

---

## Antes / después

| Aspecto | Antes (6C) | Después (7B) |
|---------|------------|--------------|
| Toolbar grid | Solo search panel suelto | `<dxo-toolbar>` con search, export, refresh, column chooser |
| Contenedor | `sguees-grid-module-card` | + `sguees-grid-view-wrap` (patrón sc-test) |
| Search | Placeholder «Buscar registros...» | «Buscar en el listado...» (sc-test) |
| Export | `dxo-export` sin botón toolbar visible | Botón export en toolbar + mismo `onExporting` |
| Refresh grid | No existía | Opcional `[showRefresh]="true"` + `(refresh)` |
| Column chooser | No existía | Opcional `[showColumnChooser]="true"` |
| Cursor filas | Default | `pointer` (sc-test) |
| Header panel | Padding básico | Padding/toolbar alineados sc-test |

**Sin cambios funcionales:** virtual scroll, edición, eliminación, focusedRow, filter row, header filter, columnas acción, summary, export Excel.

---

## Nuevos inputs / outputs

| API | Default | Descripción |
|-----|---------|-------------|
| `showSearch` | `true` | Search panel + ítem toolbar |
| `showRefresh` | `false` | Botón Actualizar (evita duplicar barra en la mayoría de CRUDs) |
| `showExport` | `true` | Export Excel en toolbar |
| `showColumnChooser` | `false` | Selector de columnas (opt-in) |
| `searchPlaceholder` | `'Buscar en el listado...'` | Texto search |
| `(refresh)` | — | Emite al pulsar Actualizar en toolbar grid |

Ejemplo opt-in refresh en grid (sin tocar barra):

```html
<app-data-grid-mtto
  [showRefresh]="true"
  (refresh)="consultar()"
  ...
></app-data-grid-mtto>
```

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `layouts/data-grid-mtto/data-grid-mtto.component.html` | `dxo-toolbar`, contenedor premium |
| `layouts/data-grid-mtto/data-grid-mtto.component.ts` | Inputs 7B, `optRefresh` cacheado, `(refresh)` |
| `layouts/data-grid-mtto/data-grid-mtto.component.scss` | `--enterprise`, `sguees-grid-view-wrap` |
| `theme/styles/sguees-premium-grid.scss` | Toolbar/header panel premium |
| `theme/styles/sguees-mtto-module.scss` | Contenedor `sguees-grid-view-wrap` global |
| `pages/.../sc-test/sc-test.component.html` | Clase compartida `sguees-grid-view-wrap` |

---

## Pantallas beneficiadas (33)

Todas con `<app-data-grid-mtto>`:

**Validación sugerida:** `/gen-pais`, `/gen-depto`, `/sc-tipo-modalidad` (equivalente a «gen-modalidad»).

**General:** gen-depto, gen-pais, gen-municipio, gen-distrito, gen-rubro, gen-sector-economico, gen-tipo-documento, gen-tipo-gasto  

**Accounting:** con-centro-costo, con-area-funcional  

**Security:** seg-usuario, seg-tipo-usuario, profile  

**Payroll:** pla-departamento  

**SelectionHiring:** sc-requisicion-personal, sc-tipo-contratacion, sc-tipo-modalidad, sc-tipo-vacante  

**Shop:** com-banco, com-condicion-pago, com-cotizacion, com-cuadro-comparativo, com-cuadro-comparativo-autoriza, com-cuadro-comparativo-config-autorizaciones, com-documento, com-orden-compra, com-parametro, com-proveedor, com-proveedor-actu, com-soli-cotizacion, com-tipo-doc-fisico, com-tipo-soli-cotiza, com-unidad-medida

---

## Checklist funcional

| Caso | Estado |
|------|--------|
| Export Excel (`Data.xlsx`) | ✅ Mismo handler `onExporting` |
| Editar / eliminar fila | ✅ Columnas acción + `dxo-editing` |
| `focusedRowChanged` | ✅ Sin cambios |
| Virtual scrolling | ✅ `mode="virtual"` |
| Filter row / header filter | ✅ Activos |
| Browse sin inputs nuevos | ✅ Comportamiento equivalente + toolbar visible |

---

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Regresión CD / freeze (Fase 5.5) | `optRefresh` estable; ítems DX por `name` |
| Refresh duplicado barra + grid | `showRefresh` default `false`; opt-in explícito |
| Column chooser confunde usuarios | `showColumnChooser` default `false` |
| Toolbar vacía si todo desactivado | Solo ocurre con overrides manuales |

---

## Screenshots comparativos

No generados en CI. Comparar manualmente:

1. `/sc-test` — referencia  
2. `/gen-depto` — CRUD estándar post-7B  
3. Export, search focus, tema dark  

Carpeta sugerida: `DOCS/screenshots/fase-7b/`.

---

## Próximos pasos opcionales (7C+)

- Activar `[showColumnChooser]="true"` en módulos con muchas columnas
- Mover refresh de barra a grid en Shop (`showRefresh` en barra → grid)
- Pager avanzado estilo sc-test (`showPageSizeSelector`) como input opcional
