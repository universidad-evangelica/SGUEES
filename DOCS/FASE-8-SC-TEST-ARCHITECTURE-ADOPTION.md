# Fase 8 — SC-TEST Architecture Adoption

**Fecha:** 2026-05-29  
**Alcance:** Adoptar patrón arquitectónico sc-test en layouts reutilizables sin modificar HTML de CRUDs.

---

## Resumen ejecutivo

| Subfase | Estado | Entrega |
|---------|--------|---------|
| 8A Grid header adoption | ✅ | Toolbar unificada en `data-grid-mtto` (título, subtítulo, agregar, refresh, export, search) |
| 8B Barra restructure | ✅ | `layoutMode: 'legacy' \| 'header-only'` (default **header-only**) |
| 8C Grid module card | ✅ | `section.sguees-grid-unified-module.dx-card` — una sola card |
| 8D Subtitle strategy | ✅ | Contexto barra → grid; línea oculta si vacía |
| 8E CRUD compatibility | ✅ | `MttoPageContextService` — eventos `(nuevo)` / `(consultar)` sin rebind |
| 8F sc-test migration audit | 📋 | Documentado abajo; **no implementado** |
| Build | ✅ | `npm run build` |

---

## Problema arquitectónico (confirmado Fase 7)

| SC-TEST | CRUD layouts (pre-Fase 8) |
|---------|---------------------------|
| 1 `dx-data-grid` | `barra-data-mtto` + `data-grid-mtto` |
| 1 `dxo-toolbar` | 2 toolbars |
| 1 `dx-card` | Chrome partido |
| Título/subtítulo en grid | Título en barra, grid sin header |
| Agregar + refresh en grid | Nuevo/refresh en barra (u ocultos) |

---

## Solución Fase 8

### Capa de compatibilidad — `MttoPageContextService`

Barra publica estado y handlers; grid consume sin cambiar HTML de CRUDs:

```
app-barra-data-mtto  ──sync──►  MttoPageContextService  ◄──read──  app-data-grid-mtto
     (nuevo)                         triggerAdd()              (Agregar registro)
     (consultar)                     triggerRefresh()          (Actualizar)
     tituloVentana                   titulo / subtitle
     permiteAdd                      showAdd (disabled)
```

### Modo `header-only` (default)

| Modo | Browse | Edición |
|------|--------|---------|
| **header-only** | Barra oculta; grid unificado sc-test | Barra visible: Guardar / Cancelar |
| **legacy** | Comportamiento Fase 7A (barra + grid) | Igual que antes |

Opt-out legacy sin tocar CRUDs: no disponible por HTML; requiere `[layoutMode]="'legacy'"` cuando un módulo lo necesite.

---

## Responsabilidades migradas

| Responsabilidad | Antes | Después (header-only) |
|-----------------|-------|------------------------|
| Título browse | barra `page-header` | grid toolbar `before` |
| Subtítulo | no usado | grid (desde contexto barra) |
| Agregar registro | barra `optNuevo` | grid `optAdd` → `(nuevo)` vía contexto |
| Refresh | barra opt-in / oculto | grid toolbar (default on en unified) |
| Export / Search | grid toolbar | grid toolbar (sin cambio) |
| Guardar / Cancelar | barra | barra (solo edición) |
| Card encapsulada | barra chrome + grid card | **una** `sguees-grid-unified-module` |

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `layouts/mtto-page-context.service.ts` | **Nuevo** — puente barra ↔ grid |
| `layouts/data-grid-mtto/*` | Toolbar sc-test, inputs 8A, unified card |
| `layouts/barra-data-mtto/*` | `layoutMode`, sync contexto, browse hidden |
| `theme/styles/sguees-enterprise-layout.scss` | Reglas grid unificado standalone |
| `DOCS/FASE-8-SC-TEST-ARCHITECTURE-ADOPTION.md` | Este documento |

---

## API nueva

### data-grid-mtto

| Input / Output | Default | Descripción |
|----------------|---------|-------------|
| `titulo` | — | Override; si vacío usa contexto |
| `subtitle` | — | Override; si vacío usa contexto |
| `showAdd` | auto | Agregar en toolbar unified |
| `showRefresh` | auto | true en unified |
| `showSearch` / `showExport` | true | Sin cambio |
| `unifiedToolbar` | `null` | null = seguir contexto barra |
| `(add)` | — | Emite + `triggerAdd()` |
| `(refresh)` | — | Emite + `triggerRefresh()` |

### barra-data-mtto

| Input | Default | Descripción |
|-------|---------|-------------|
| `layoutMode` | `'header-only'` | `'legacy'` = Fase 7 |

---

## Compatibilidad preservada (8E)

| Funcionalidad | Mecanismo |
|---------------|-----------|
| Nuevo | `pageContext.triggerAdd()` → `(nuevo)` en barra |
| Refresh | `triggerRefresh()` → `(consultar)` si enlazado |
| Guardar / Cancelar | Barra visible en edición |
| Editar / Eliminar | Columnas acción grid (7C) |
| Export Excel | `onExporting` sin cambios |
| FocusedRow | Sin cambios |
| Virtual scroll | Sin cambios |
| Permisos `permiteAdd` | `optAdd.disabled` (estilo sc-test) |
| Fase 5.5 | `optAdd` / `optRefresh` cacheados; sin objetos inline |

### Pantallas validadas (sin modificar HTML)

- gen-pais, gen-depto, sc-tipo-modalidad, com-proveedor (patrón estándar)

---

## 8D — Subtítulo

- Grid muestra subtítulo solo si `subtitle` / contexto tienen texto.
- `CBaseComponent.subTituloVentana` **no** se enlaza automáticamente (ningún CRUD pasa `[subtitle]`).
- Futuro: binding en `CBaseComponent` template base o wrapper — fuera de alcance Fase 8.

---

## 8F — SC-TEST migration audit (no implementado)

### Factibilidad

| Aspecto | sc-test actual | Migración a layouts |
|---------|----------------|---------------------|
| Grid | Inline `dx-data-grid` | `app-data-grid-mtto` ✅ |
| Header toolbar | Manual | Unified ✅ |
| Alta/edición | `dx-popup` | CRUD usa form inline — **patrón distinto** |
| Acciones fila | Inline columns | `data-grid-mtto` btnAcciones ✅ |
| Scroll | standard | virtual en mtto — mantener virtual |

### Pasos recomendados (futuro)

1. Reemplazar HTML sc-test por `barra-data-mtto` + `data-grid-mtto`.
2. `[layoutMode]="'header-only'"` + popup opcional conservando UX sc-test.
3. Eliminar duplicación `buildGridColumns()` vs servicio columnas.
4. Usar sc-test como regression visual en QA checklist.

---

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Orden init barra/grid | Barra primero en DOM; contexto BehaviorSubject |
| `pageContext.reset()` al destruir barra | Grid destruye después en misma ruta |
| Módulos que dependían de barra browse visible | `layoutMode="legacy"` |
| Subtítulo vacío en todos los CRUD | Solo título en toolbar (OK) |
| com-proveedor `[showRefresh]="true"` | Refresh sigue vía contexto + grid unified |

---

## Screenshots comparativos

No generados en CI. Validar manualmente:

1. `/sc-tipo-modalidad` browse — toolbar única con título + Agregar + Actualizar + search
2. Modo edición — barra Guardar/Cancelar + form
3. `[layoutMode]="'legacy'"` en prueba local — comportamiento Fase 7

Carpeta sugerida: `DOCS/screenshots/fase-8/`.

---

## Próximos pasos recomendados

1. Enlazar `subTituloVentana` desde `CBaseComponent` vía wrapper (1 cambio central).
2. QA Playwright: snapshot sc-tipo-modalidad vs sc-test.
3. Migrar sc-test a layouts (8F).
4. Documentar `layoutMode="legacy"` en UI Kit para módulos Shop complejos.

---

## Criterio de éxito

Al abrir un CRUD estándar **sin cambiar su HTML**:

- Browse: **una card**, **una toolbar** con título, Agregar, Actualizar, export, search (patrón sc-test).
- Edición: barra con Guardar/Cancelar.
- Legacy disponible con `layoutMode="legacy"`.

**Build:** ✅ verificado.
