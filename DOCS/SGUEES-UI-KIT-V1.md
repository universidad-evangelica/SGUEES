# SGUEES UI Kit V1

**Versión:** 1.0 (Fase 6G)  
**Stack:** Angular 16 · DevExtreme 24 Fluent Blue · SCSS tokens  
**Ubicación código:** `SGUEES-SPA/src/app/theme/styles/design-tokens.scss` + `shared/components/library/`

---

## 1. Typography scale

| Token | Valor | Uso |
|-------|-------|-----|
| `--sguees-font-size-xs` | 11px | Breadcrumbs, eyebrow |
| `--sguees-font-size-sm` | 13px | Subtítulos, filtros, celdas secundarias |
| `--sguees-font-size-base` | 14px | Cuerpo, grid data |
| `--sguees-font-size-md` | 15px | Títulos de sección |
| `--sguees-font-size-lg` | 18px | Header compacto |
| `--sguees-font-size-xl` | 22px | Título de página |
| `--sguees-font-size-2xl` | 26px | Hero / dashboards |

Pesos: `regular` 400 · `medium` 500 · `semibold` 600  
Familia: `--sguees-font-family` (Inter, Segoe UI, system-ui)

---

## 2. Spacing system (escala 4px)

`--sguees-space-1` … `--sguees-space-9` (4px → 48px)

Convenciones:

- Padding de card: `--sguees-card-padding` (= space-5)
- Gap entre módulos: `--sguees-module-gap` (= space-3)
- Toolbar horizontal: `--sguees-toolbar-padding-x`

---

## 3. Button variants

| Contexto | Implementación |
|----------|----------------|
| CRUD barra | `dx-button` vía `BarraDataMtto` con opciones cacheadas (`optNuevo`, etc.) |
| Design system | `app-action-button` (contained / outlined / text) |
| Empty state CTA | Botón pill nativo `.sguees-empty-state__cta` |

**Regla crítica:** no crear objetos `options` inline en templates DevExtreme (ver Fase 5.5).

---

## 4. Cards

| Clase / componente | Uso |
|--------------------|-----|
| `app-section-card` | Secciones con header opcional |
| `.sguees-mtto-chrome` | Barra mantenimiento (header + toolbar) |
| `.sguees-grid-module-card` | Contenedor premium del DataGrid |
| `.content-block.dx-card` | Formularios CRUD (estilos en `sguees-premium-forms.scss`) |

---

## 5. Dialogs

Estilos globales en `sguees-micro-ux.scss`:

- `--sguees-radius-md` en overlay
- `--sguees-shadow-md`
- Padding título/contenido con tokens de espacio

---

## 6. Badges / status

| Componente | Selector |
|------------|----------|
| Status badge | `app-status-badge` |
| Indicadores legacy | `.status-commission`, `.status-indicator-*` en `styles.scss` |

Tokens de fondo: `--sguees-status-success-bg`, `warning`, `danger`, `info`

---

## 7. Tables (DataGrid)

Clase principal: `.sguees-data-grid-mtto`  
Densidad: `.sguees-grid-density-compact`  
Columnas acción: `.sguees-grid-col-actions`

Variables: `--sguees-grid-header-bg`, `--sguees-grid-row-hover`, `--sguees-grid-row-selected`

---

## 8. Forms

Archivo: `sguees-premium-forms.scss`  
Patrón: `.content-block.dx-card.responsive-paddings` + `dx-form`

---

## 9. Shadows

| Token | Uso |
|-------|-----|
| `--sguees-shadow-xs` | Chips, inputs |
| `--sguees-shadow-sm` | Cards módulo, toolbar |
| `--sguees-shadow-md` | Popups |
| `--sguees-shadow-lg` | Modales destacados |
| `--sguees-shadow-drawer` | Navegación lateral |

Dark mode: valores en `sguees-dark-premium.scss`

---

## 10. States

| Estado | Estilo |
|--------|--------|
| Focus | `--sguees-focus-ring` |
| Hover fila grid | `--sguees-grid-row-hover` (sin transition en filas) |
| Selected row | `--sguees-grid-row-selected` |
| Skeleton | `.sguees-skeleton` + tokens `--sguees-skeleton-*` |
| Empty | `app-empty-state` |

---

## Componentes del design system

| Componente | Selector |
|------------|----------|
| Page header | `app-page-header` |
| Section card | `app-section-card` |
| Grid toolbar | `app-grid-toolbar` |
| Search box | `app-search-box` |
| Action button | `app-action-button` |
| Status badge | `app-status-badge` |
| Empty state | `app-empty-state` |

Módulo barrel: `SgueesDesignSystemModule`

---

## Page header — API

```html
<app-page-header
  title="Departamentos"
  subtitle="Catálogo de departamentos por país"
  eyebrow="General"
  [breadcrumbs]="[
    { label: 'Inicio', route: '/home' },
    { label: 'Departamentos' }
  ]"
>
  <!-- acciones proyectadas -->
</app-page-header>
```

Inputs opcionales en `app-barra-data-mtto`: `subtituloVentana`, `eyebrow`, `breadcrumbs`.

---

## Integración mantenimiento (sin tocar cada HTML)

`app-barra-data-mtto` + `app-data-grid-mtto` aplican automáticamente chrome premium a **33 pantallas** CRUD.

Inputs nuevos en grid (opcionales):

- `loading` — skeleton overlay
- `compactDensity` — default `true`
- `showEmptyState`, `emptyCtaLabel`, `(emptyCtaClick)`

---

## Archivos de tema

| Archivo | Rol |
|---------|-----|
| `design-tokens.scss` | Tokens base |
| `sguees-premium-grid.scss` | DataGrid premium |
| `sguees-mtto-module.scss` | Chrome barra + card grid |
| `sguees-dark-premium.scss` | Dark slate/charcoal |
| `sguees-premium-forms.scss` | Formularios |
| `sguees-micro-ux.scss` | Focus, dialogs, skeleton |
