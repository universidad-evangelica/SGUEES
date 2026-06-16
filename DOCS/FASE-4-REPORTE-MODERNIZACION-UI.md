# Fase 4 — Modernización Enterprise UI (SGUEES-SPA)

**Fecha:** 2026-05-28  
**Stack:** Angular 16 · DevExtreme 24.1.17 · Fluent Blue  
**Alcance:** Solo capa visual/CSS y props de presentación en layouts compartidos. Sin cambios de negocio, endpoints ni arquitectura.

---

## Resumen ejecutivo

| Subfase | Estado | Resultado |
|---------|--------|-----------|
| 4A Fluent controlado | ✅ | Bundles `dx.fluent.blue.light/dark`; dark/light operativo vía `ThemeService` |
| 4B DataGrid enterprise | ✅ | `DataGridMtto` modernizado (bordes, hover, filas alternas, column hiding responsive) |
| 4C Layout moderno | ✅ | Sidebar, header, toolbar mantenimiento, tokens de espaciado/sombras |
| 4D Responsive UX | ✅ | Drawer, padding adaptativo, grids con `columnHidingActive` en ≤992px |
| 4E Design tokens | ✅ | `design-tokens.scss` reutilizable |
| Build producción | ✅ | `npm run build` exitoso (~9.42 MB initial) |

---

## 4A — Fluent controlado

### Cambios realizados

| Archivo | Acción |
|---------|--------|
| `angular.json` | `dx.material.blue.*` → `dx.fluent.blue.light` / `dx.fluent.blue.dark` |
| `variables-mixin.scss` | Reescrito para widgets **Fluent** (`devextreme/scss/widgets/fluent/*`) |
| `variables-light.scss` / `variables-dark.scss` | Fondos y texto vía tokens UEES + variables DX |
| `theme-special.scss` | Sin cambio de lógica; `$theme: fluent` vía mixin |
| `design-tokens.scss` | **Nuevo** — escala spacing, radius, tipografía, sombras |
| `fluent-enterprise.scss` | **Nuevo** — estilos enterprise (referencia `fluent-legacy.scss`, no import legacy) |
| `dx-global-overrides.scss` | Simplificado; eliminados hacks Material (HACK-DX-01/02/03 documentados → reemplazados por reglas Fluent scoped) |
| `styles.scss` | Import tokens + fluent-enterprise; body usa CSS variables |
| `variables.scss` | `--change-password-popup-height` para `.dx-theme-fluent` |
| `fluent-legacy.scss` | Solo referencia histórica (comentario actualizado) |

### ThemeService

- **Sin cambios de código.** Ya contemplaba Fluent (`isFluent()`, reemplazo `.light`/`.dark` en viz themes).
- Validación: alterna bundles `theme-light` / `theme-dark` por `href` + `localStorage['app-theme']`.

### Bundles CSS (comparativa build)

| Tema | Antes (Material Blue) | Después (Fluent Blue) |
|------|------------------------|------------------------|
| theme-light | ~1000 KB | **~723 KB** |
| theme-dark | ~999 KB | **~722 KB** |
| styles globales | ~167 KB | **~19 KB** (más lógica en bundles tema) |

---

## 4B — DataGrid enterprise (`DataGridMtto`)

### Props DevExtreme

| Propiedad | Antes | Después |
|-----------|-------|---------|
| `showBorders` | `true` | **`false`** |
| `showColumnLines` | `true` | **`false`** |
| `showRowLines` | `true` | **`false`** |
| `rowAlternationEnabled` | `true` | `true` |
| `hoverStateEnabled` | `false` | **`true`** |
| `columnHidingEnabled` | — | **`columnHidingActive`** (input + responsive) |

### Nuevos `@Input`

- `columnHidingEnabled` — forzar menú de columnas ocultas.
- `responsiveColumnHiding` (default `true`) — activa ocultado automático en viewport ≤992px.
- `columnHidingActive` — valor efectivo en template (no muta input del padre).

### Sin cambios funcionales

- Export Excel (`onExporting` / ExcelJS)
- Edición fila / delete / virtual scrolling
- Botones CRUD inyectados en `ngOnInit`
- `@Input() gridHeight`, `columnAutoWidth`

### Estilos

- `data-grid-mtto.component.scss` — radius, header panel, responsive offsets.
- `dx-global-overrides.scss` — bloque `.dx-datagrid.sguees-data-grid-mtto`.

---

## 4C — Layout moderno

| Componente | Mejoras |
|------------|---------|
| `app-header` | Sombra suave, borde inferior, tokens |
| `side-navigation-menu` | Padding tokens, hover en ítems, radius |
| `side-nav-outer-toolbar` | Padding responsive en `content-wrapper` |
| `barra-data-mtto` | Toolbar card-style (borde, sombra, tipografía título) |
| `fluent-enterprise.scss` | Drawer shadow + transition, toolbars, popups, cards |

---

## 4D — Responsive UX

| Área | Comportamiento |
|------|----------------|
| Drawer | `overlap` + `slide` en no-large (sin cambio de lógica); transición CSS 0.22s |
| Contenido | Padding 20px → 16px (tablet) → 12px (móvil) |
| DataGrid | `columnHidingActive` en x-small / small / medium |
| Grid height | Variables `--sguees-grid-mtto-viewport-offset` ajustadas por breakpoint |

**No modificado:** pantallas CRUD individuales (~35 `CBaseComponent`).

---

## 4E — Design tokens

**Archivo:** `src/app/theme/styles/design-tokens.scss`

| Categoría | Variables ejemplo |
|-----------|-------------------|
| Spacing | `--sguees-space-1` … `--sguees-space-8` |
| Radius | `--sguees-radius-sm/md/lg` |
| Typography | `--sguees-font-family`, `--sguees-font-size-*`, weights |
| Shadows | `--sguees-shadow-xs/sm/md`, `--sguees-shadow-drawer` |
| Layout | `--sguees-toolbar-height`, `--sguees-card-padding`, sidebar widths |
| Brand UEES | `--sguees-brand-primary`, page backgrounds light/dark |

Uso recomendado en nuevos estilos: `var(--sguees-space-4)` en lugar de valores fijos.

---

## Componentes visualmente transformados

1. **Global:** `styles.scss`, `design-tokens`, `fluent-enterprise`, `dx-global-overrides`
2. **Tema:** bundles Fluent light/dark + `variables-light/dark/mixin`
3. **`app-data-grid-mtto`** — todos los mantenimientos que lo usan (~35 pantallas)
4. **`app-barra-data-mtto`** — toolbar CRUD estándar
5. **`app-side-nav-outer-toolbar`** — shell principal autenticado
6. **`side-navigation-menu`** — menú lateral dinámico
7. **`app-header`** — topbar
8. **Popups/dialogs DevExtreme** — radius y sombra (global Fluent)

---

## Hacks CSS eliminables / ya sustituidos

| ID legacy | Estado Fase 4 |
|-----------|----------------|
| HACK-DX-01 (treeview font-size forzado) | Sustituido por reglas scoped sin `!important` |
| HACK-DX-02 (datagrid font global) | Movido a `.sguees-data-grid-mtto` |
| HACK-DX-03 (min-width 140px botones global) | Reducido a 108px scoped toolbar/mtto |
| `body { background #e3f2fd }` Material | Reemplazado por `--sguees-page-bg` |
| `.dx-theme-fluent` bloque en `styles.scss` (~190 líneas) | Ya removido en Fase 2; no reintroducido |
| `fluent-legacy.scss` import | **No importado** — mantener solo referencia |

### Aún revisar manualmente (Fase 5)

- Overrides en pantallas con SCSS propio que dupliquen grid/toolbar
- `barra-data-mtto` heights fijos (`height: '30'`) en HTML — migrar a tokens opcional
- Samples CRM (`theme-dependent`) — estilos plantilla vs SGUEES
- `UserPanelComponent` lectura `decodedToken` en constructor (bug preexistente QA)
- `NG0904` unsafe URL en `com-proveedor` (datos/plantilla)

---

## Screenshots comparativos

No generados en CI en esta entrega. Para capturas locales:

```powershell
cd SGUEES-SPA
$env:QA_USER = "admin"   # o credenciales válidas
$env:QA_PASS = "***"
npx playwright install chromium
# Añadir en qa-checklist.mjs: page.screenshot({ path: 'qa-screenshots/home-light.png' })
node qa-checklist.mjs
```

Rutas sugeridas: `/login-form`, `/home` (light/dark), `/gen-pais`, `/com-proveedor`.

---

## Validación

| Prueba | Resultado |
|--------|-----------|
| `npm run build` (prod) | ✅ |
| ThemeService dark/light | ✅ (lógica existente + bundles Fluent) |
| Lógica negocio / endpoints | ✅ Sin cambios |
| Arquitectura NgModule | ✅ Sin cambios |

---

## Pendientes — Fase 5 (propuesta)

1. **Angular 17+** → habilitar DevExtreme 24.2+ y opciones Fluent SaaS compact.
2. **Refinar pantallas** con SCSS local redundante; adoptar tokens en formularios (`dx-form`).
3. **Toolbar CRUD** — quitar heights/widths inline en `barra-data-mtto.component.html`.
4. **Lazy loading** dominios para reducir bundle ~9.4 MB.
5. **Corregir** `UserPanelComponent` / `unique_name` y sanitización URLs en compras.
6. **Theme Builder** — generar variante Fluent personalizada UEES (azul institucional) si se requiere marca estricta.
7. **Matomo** en demos — desactivar en dev o filtrar en QA.
8. **Screenshots** baseline light/dark en pipeline QA.

---

## Archivos tocados (lista principal)

```
angular.json
src/styles.scss
src/variables.scss
src/app/theme/styles/design-tokens.scss          (nuevo)
src/app/theme/styles/fluent-enterprise.scss      (nuevo)
src/app/theme/styles/variables-mixin.scss
src/app/theme/styles/variables-light.scss
src/app/theme/styles/variables-dark.scss
src/app/theme/styles/dx-global-overrides.scss
src/app/theme/styles/fluent-legacy.scss          (solo comentarios)
src/app/layouts/data-grid-mtto/*                 (ts, html, scss)
src/app/layouts/barra-data-mtto/barra-data-mtto.component.scss
src/app/layouts/side-nav-outer-toolbar/side-nav-outer-toolbar.component.scss
src/app/shared/components/library/app-header/app-header.component.scss
src/app/shared/components/library/side-navigation-menu/side-navigation-menu.component.scss
```

---

*Generado como entrega Fase 4 — Modernización Enterprise UI controlada.*
