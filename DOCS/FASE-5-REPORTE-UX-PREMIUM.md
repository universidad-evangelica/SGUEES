# Fase 5 — UX Premium + Design System SGUEES

**Fecha:** 2026-05-28  
**Stack:** Angular 16 · DevExtreme 24.1.17 · Fluent Blue  
**Alcance:** UX visual, layouts compartidos, design system reutilizable. Sin cambios de negocio, endpoints ni arquitectura.

---

## Resumen ejecutivo

| Subfase | Estado | Entrega principal |
|---------|--------|-------------------|
| 5A DataGrid premium | ✅ | Toolbar integrada, search/filtros, acciones text, empty state opcional |
| 5B Toolbar premium | ✅ | `app-page-header`, subtítulo, `btnOptions()`, spacing responsive |
| 5C Sidebar premium | ✅ | Active/hover, transiciones, padding tokens |
| 5D Forms premium | ✅ | Estilos globales `.content-block.dx-card` + `dx-form` |
| 5E Design System | ✅ | 7 componentes + `SgueesDesignSystemModule` |
| 5F Micro UX | ✅ | `sguees-micro-ux.scss` (transitions, focus, dialogs, skeleton) |
| 5G Responsive | ✅ | Toolbar/grid/forms adaptativos |
| Build | ✅ | `npm run build` |

---

## 5A — DataGridMtto premium

### Cambios DevExtreme (sin tocar export/edición/virtual scroll)

- `dxo-toolbar`: searchPanel, exportButton, columnChooserButton
- `dxo-search-panel`: placeholder «Buscar registros…», ancho responsive (280 / 200px)
- Columnas acción: `cssClass: sguees-grid-col-actions`, `stylingMode: 'text'`, ancho 48px
- Empty state opcional: `@Input() showEmptyState` (default **false** para no alterar flujos de carga)

### Estilos

- `sguees-premium-grid.scss` — headers, hover con accent, panel de filtros, toolbar integrada
- `data-grid-mtto.component.scss` — shell + accesibilidad cuando lista vacía

---

## 5B — BarraDataMtto premium

| Mejora | Detalle |
|--------|---------|
| `@Input() subtituloVentana` | Subtítulo contextual opcional |
| `app-page-header` | Título + subtítulo con jerarquía |
| `btnOptions()` | Altura 36px, `stylingMode` consistente (sin `height: '30'` fijos) |
| Divisor | `.sguees-toolbar-divider` con token de borde |
| Responsive | Wrap de ítems toolbar en móvil |

---

## 5C — Sidebar premium

- Ítems: padding, radius, hover y **selected** con `color-mix` accent
- Transición drawer/menú en `fluent-enterprise.scss`
- Iconografía 24px alineada (estilos previos conservados)

---

## 5D — Forms premium

**Archivo:** `sguees-premium-forms.scss`

Aplica automáticamente a patrones existentes:

- `.content-block.dx-card.responsive-paddings` — card con borde/sombra/padding tokens
- `.dx-form` dentro de cards — labels, spacing vertical, focus ring en editores

**Sin modificar** los ~35 HTML de mantenimiento individualmente.

---

## 5E — Design System SGUEES (nuevos componentes)

| Componente | Selector | Uso |
|------------|----------|-----|
| PageHeader | `app-page-header` | Título, subtítulo, proyección de acciones |
| SectionCard | `app-section-card` | Secciones con header opcional |
| GridToolbar | `app-grid-toolbar` | Contenedor de acciones de grid |
| SearchBox | `app-search-box` | `dx-text-box` modo search outlined |
| ActionButton | `app-action-button` | Botón DX con altura token |
| StatusBadge | `app-status-badge` | Badges success/warning/danger/info/neutral |
| EmptyState | `app-empty-state` | Estado vacío con icono DevExtreme |

**Barrel:** `SgueesDesignSystemModule`  
`src/app/shared/components/library/sguees-design-system.module.ts`

### Integración inmediata

- `BarraDataMtto` → `app-page-header`
- `DataGridMtto` → `app-empty-state` (opt-in)

---

## 5F — Micro UX

`sguees-micro-ux.scss`:

- Transiciones botones y popups
- Focus ring (`--sguees-focus-ring`)
- Diálogos: radius + sombra + padding título/contenido
- Clase `.sguees-skeleton` preparada para loaders futuros

---

## 5G — Responsive enterprise

| Área | Comportamiento |
|------|----------------|
| DataGrid | `columnHidingActive` ≤992px; search panel más estrecho en móvil |
| Barra | Toolbar wrap en ≤575px |
| Forms | Padding card reducido tablet/móvil |
| Layout shell | Padding `content-wrapper` (Fase 4, reforzado) |

---

## Tokens ampliados (`design-tokens.scss`)

- Motion: `--sguees-transition-fast`, `--sguees-transition-base`
- Focus: `--sguees-focus-ring`
- Grid: `--sguees-grid-row-alt`, hover con accent
- Forms: `--sguees-form-padding`, `--sguees-form-field-gap`
- Status: `--sguees-status-*-bg`

---

## Pantallas beneficiadas automáticamente

Todo mantenimiento que usa **`app-barra-data-mtto`** + **`app-data-grid-mtto`** (~**70** referencias en templates `pages/`), incluyendo:

- General: `gen-pais`, `gen-depto`, `gen-municipio`, …
- Shop/Compras: `com-proveedor`, `com-documento`, `com-cuadro-comparativo`, …
- Security, Accounting, Payroll, SelectionHiring (módulos con patrón CRUD estándar)

Formularios en modo edición: beneficio visual vía CSS global en `.content-block.dx-card`.

---

## Componentes refinados (existentes)

1. `app-data-grid-mtto` (ts, html, scss)
2. `app-barra-data-mtto` (ts, html, scss)
3. `side-navigation-menu`
4. `app-header` (estilos previos Fase 4)
5. `side-nav-outer-toolbar` (padding responsive)
6. Estilos globales: `design-tokens`, `sguees-premium-grid`, `sguees-premium-forms`, `sguees-micro-ux`, `fluent-enterprise`

---

## Mejoras visuales detectadas

- Jerarquía clara título/subtítulo en barra de mantenimiento
- Grid sin bordes duros; hover y selección más sutiles
- Toolbar de grid unificada (búsqueda + export + column chooser)
- Menú lateral con estado activo legible
- Formularios en card con sombra y labels más legibles
- Botones con micro-feedback (scale active) y focus accesible

---

## Pendientes opcionales (futuro)

1. Activar `[showEmptyState]="true"` en grids donde el array vacío es estado estable (post-carga)
2. Adoptar `app-section-card` en pantallas compuestas (proveedor, documentos)
3. Reemplazar botones sueltos por `app-action-button` en nuevas pantallas
4. `UserPanelComponent` — inicializar `nameUser` fuera del constructor (bug QA)
5. `NG0904` en `com-proveedor` — sanitizar URLs de recursos
6. Theme Builder Fluent con paleta UEES exacta
7. Skeleton loaders en `CBaseComponent` durante `loadingVisible`
8. Screenshots baseline en pipeline QA

---

## Validación

```
npm run build  → OK (9.43 MB initial)
```

---

## Archivos nuevos

```
src/app/theme/styles/sguees-premium-grid.scss
src/app/theme/styles/sguees-premium-forms.scss
src/app/theme/styles/sguees-micro-ux.scss
src/app/shared/components/library/page-header/*
src/app/shared/components/library/section-card/*
src/app/shared/components/library/grid-toolbar/*
src/app/shared/components/library/search-box/*
src/app/shared/components/library/action-button/*
src/app/shared/components/library/status-badge/*
src/app/shared/components/library/empty-state/*
src/app/shared/components/library/sguees-design-system.module.ts
```

---

*Entrega Fase 5 — UX Premium + Design System Enterprise SGUEES.*
