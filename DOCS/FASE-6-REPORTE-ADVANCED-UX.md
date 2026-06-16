# Fase 6 — Advanced Enterprise UX

**Fecha:** 2026-05-28  
**Proyecto:** SGUEES-SPA  
**Restricciones respetadas:** Angular 16 sin upgrade · DevExtreme conservado · sin cambios de negocio/endpoints · sin objetos DX inline en templates (Fase 5.5)

---

## Resumen ejecutivo

| Subfase | Estado | Entrega |
|---------|--------|---------|
| 6A Advanced page header | ✅ | Breadcrumbs, eyebrow, acciones responsive, tipografía |
| 6B Premium grid container | ✅ | `sguees-mtto-chrome` + `sguees-grid-module-card` |
| 6C Advanced DataGrid UX | ✅ | Densidad compacta, headers, sticky search panel, acciones, skeleton |
| 6D Empty states premium | ✅ | Icon circle, CTA, dark/light vía tokens |
| 6E Search experience | ✅ | Search panel DX + `app-search-box` estilizado |
| 6F Dark mode premium | ✅ | `sguees-dark-premium.scss` en bundle dark |
| 6G UI Kit V1 | ✅ | `DOCS/SGUEES-UI-KIT-V1.md` |
| 6H Performance visual | ✅ | Sin transitions en filas; OnPush; opciones cacheadas |

---

## Mejoras premium visibles

1. **Módulo CRUD unificado** — barra y grid se ven como una sola tarjeta (esquinas superiores en barra, inferiores en grid).
2. **Jerarquía de página** — breadcrumbs opcionales, eyebrow de módulo, subtítulo descriptivo.
3. **Grid menos “DevExtreme default”** — sin bordes de rejilla, headers uppercase con acento, hover/selección con brand color.
4. **Búsqueda redondeada** — search panel con fondo sutil, focus ring, ancho máximo 320px.
5. **Toolbar agrupada** — acciones primarias `before`, fechas/refresh `after`, responsive wrap.
6. **Empty state** — iconografía en círculo, mensaje contextual, CTA pill opcional.
7. **Dark mode** — fondos `#0f1419` / `#161b22` (slate), sin negro puro; sombras más profundas.
8. **Skeleton preparado** — overlay en card al usar `[loading]="true"` sin sustituir load panel DX.

---

## Componentes refinados

| Componente / archivo | Cambios |
|----------------------|---------|
| `page-header` | `breadcrumbs`, `eyebrow`, layout acciones |
| `empty-state` | CTA, icon wrap, tokens adaptativos |
| `search-box` | Estilos pill, focus, responsive width |
| `barra-data-mtto` | `sguees-mtto-chrome`, inputs breadcrumb/eyebrow, toolbar agrupada |
| `data-grid-mtto` | Card contenedor, `loading`, `compactDensity`, empty CTA |
| `design-tokens.scss` | Superficies, search, grid, skeleton |
| `sguees-premium-grid.scss` | Headers, sticky header-panel, filtros, acciones |
| `sguees-mtto-module.scss` | Chrome módulo (nuevo import global) |
| `sguees-dark-premium.scss` | Paleta dark premium |
| `sguees-micro-ux.scss` | Skeleton con tokens dark/light |

---

## Módulos beneficiados automáticamente (33 pantallas)

Todas las que usan `app-barra-data-mtto` + `app-data-grid-mtto`:

**General:** gen-depto, gen-pais, gen-municipio, gen-distrito, gen-rubro, gen-sector-economico, gen-tipo-documento, gen-tipo-gasto  

**Accounting:** con-centro-costo, con-area-funcional  

**Security:** seg-usuario, seg-tipo-usuario, profile  

**Payroll:** pla-departamento  

**SelectionHiring:** sc-requisicion-personal, sc-tipo-contratacion, sc-tipo-modalidad, sc-tipo-vacante  

**Shop:** com-banco, com-condicion-pago, com-cotizacion, com-cuadro-comparativo, com-cuadro-comparativo-autoriza, com-cuadro-comparativo-config-autorizaciones, com-documento, com-orden-compra, com-parametro, com-proveedor, com-proveedor-actu, com-soli-cotizacion, com-tipo-doc-fisico, com-tipo-soli-cotiza, com-unidad-medida

**Formularios** en `.content-block.dx-card` siguen con estilos Fase 5D sin cambio por pantalla.

---

## Funcionalidad preservada (6C)

| Capacidad | Estado |
|-----------|--------|
| Export Excel (`onExporting` + exceljs) | ✅ Sin cambios |
| Edición / eliminación fila | ✅ `dxo-editing` + columnas acción |
| Virtual scrolling | ✅ `dxo-scrolling mode="virtual"` |
| Filtros / header filter | ✅ Visibles, estilos refinados |
| Runtime estable (5.5) | ✅ OnPush + opciones cacheadas en barra |

---

## Cómo probar

```bash
cd SGUEES-SPA
npm run build
ng serve
```

Rutas sugeridas:

- `/gen-depto` — CRUD típico General
- `/gen-pais` — segundo catálogo
- Alternar tema dark en header — verificar contraste slate

**Checklist anti-freeze:**

1. Entrar a mantenimiento browse — CPU estable, sin “página no responde”.
2. Clic Nuevo / Cancelar — toolbar actualiza sin lag.
3. Exportar Excel — descarga `Data.xlsx`.
4. Scroll virtual con muchos registros — fluido.

---

## Screenshots comparativos

No se generaron capturas automáticas en este entorno CI. Para comparativa manual:

1. Rama/commit anterior a Fase 6 vs actual en `gen-depto`.
2. Capturar: header+toolbar, grid con fila seleccionada, search focus, empty state (`[showEmptyState]="true"` en prueba), tema dark.

Guardar en `DOCS/screenshots/fase-6/` si el equipo desea historial visual.

---

## Futuras mejoras opcionales

| Mejora | Notas |
|--------|-------|
| Breadcrumbs por ruta | Resolver desde `Router` en `CBaseComponent` |
| `loading` enlazado a `loadingVisible` | Por pantalla, sin tocar todas a la vez |
| `showEmptyState` por defecto | Tras validar flujos de carga en cada módulo |
| Column chooser / group panel | Solo si se garantiza performance |
| `app-search-box` en toolbar custom | Reemplazar search panel DX donde aplique |
| Status badges en columnas | `cellTemplate` + `app-status-badge` por dominio |
| Reducir bundle initial | Lazy routes adicionales (fuera de alcance UI) |
| Fix `UserPanelComponent` unique_name | Error QA consola en home |
| Fix `NG0904` com-proveedor | URL recursos |

---

## Archivos nuevos / importados

```
src/app/theme/styles/sguees-mtto-module.scss   → styles.scss
src/app/theme/styles/sguees-dark-premium.scss  → variables-dark.scss
DOCS/SGUEES-UI-KIT-V1.md
DOCS/FASE-6-REPORTE-ADVANCED-UX.md
```

---

## Regla de oro (mantener en PRs futuros)

```typescript
// ❌ Nunca en template DevExtreme
[options]="{ icon: 'plus', onClick: handler }"

// ✅ Cachear en componente (OnPush)
optNuevo = { icon: 'plus', onClick: this.OnNuevo.bind(this), visible: true };
```
