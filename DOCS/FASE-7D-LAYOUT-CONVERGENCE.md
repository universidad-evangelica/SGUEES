# Fase 7D — Premium Layout Convergence

**Fecha:** 2026-05-29  
**Alcance:** Contenedor enterprise global vía `side-nav-outer-toolbar`. Sin modificar CRUDs individuales.

---

## Problema detectado

Tras 7A–7C, la diferencia visual entre **sc-test** y CRUDs heredados no estaba en el DataGrid sino en el **layout de página**:

| Aspecto | SC-TEST | CRUDs heredados (gen-pais, gen-depto) |
|---------|---------|--------------------------------------|
| Contenedor externo | `sc-test-view` + `page-padding` | Solo padding genérico del drawer |
| Gutter horizontal | `--page-padding` consistente | Variable / ausente |
| Whitespace superior | Gap `--content-padding` | Grid “pegado” al borde |
| Module card | `dx-card` + `grid-wrap` | Barra/grid sueltos en scroll |
| Jerarquía | Header → toolbar → grid encapsulados | Componentes sin agrupación visual |
| view-wrapper | Propio en sc-test | Solo en algunos Shop (com-proveedor) |

---

## Solución: Enterprise Content Container

### Estructura (side-nav-outer-toolbar)

```html
<dx-scroll-view>
  <div class="sguees-enterprise-shell">
    <div class="sguees-enterprise-content view-wrapper list-page">
      <router-outlet></router-outlet>
    </div>
  </div>
</dx-scroll-view>
```

Todo componente enrutado queda automáticamente dentro del shell premium.

---

## Mejoras aplicadas

### 1. Content container premium

- **`sguees-enterprise-shell`**: fondo `--sguees-page-bg`, padding `--page-padding`, responsive 991/575px
- **`sguees-enterprise-content`**: flex column, gap vertical, anula padding legacy de `.view-wrapper`

### 2. Spacing system

- Padding externo único (elimina doble padding drawer + view-wrapper)
- `gap: 0` en host enrutado; separación solo donde aplica (formulario edición)
- Formulario: `margin-top: var(--sguees-space-4)` tras barra

### 3. Module card experience

- Cluster **barra + grid** sin gap intermedio (`:has(+ app-data-grid-mtto)`)
- Sombra unificada `--sguees-shadow-md` en módulo browse
- Sin bordes/sombras duplicados en card del grid cuando sigue a barra

### 4. Jerarquía visual

```
Shell (page bg + padding)
  └─ Host CRUD
       ├─ Barra (chrome top)
       ├─ Grid (card bottom)     ← browse
       └─ Form card              ← edición (espaciado)
```

### 5. Compatibilidad patrones existentes

- CRUDs **sin** `view-wrapper` (gen-pais, gen-depto): estilos en host directo
- CRUDs **con** `view-wrapper` (com-proveedor): reset padding/margin interno
- **sc-test**: padding externo del shell; card interna conservada

### 6. Dark / light

- `--sguees-page-bg`, `--sguees-surface-card`, `--sguees-border-subtle` en contenedores
- Compatible con bundle `theme-dark` y tokens UI Kit

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `layouts/side-nav-outer-toolbar/*.html` | Shell enterprise + content wrapper |
| `layouts/side-nav-outer-toolbar/*.scss` | Simplificado; padding movido a layout global |
| `theme/styles/sguees-enterprise-layout.scss` | **Nuevo** — reglas de convergencia |
| `theme/styles/fluent-enterprise.scss` | `.content-wrapper` → `.sguees-enterprise-shell` |
| `styles.scss` | Import enterprise layout |

**No modificados:** gen-pais, gen-depto, sc-tipo-modalidad, com-proveedor (HTML).

---

## Pantallas beneficiadas

**Todas** las rutas bajo `side-nav-outer-toolbar` (~33 CRUD + home + sc-test).

Validación obligatoria:

- `/gen-pais`
- `/gen-depto`
- `/sc-tipo-modalidad`
- `/com-proveedor`
- `/sc-test` (referencia)

---

## Riesgos

| Riesgo | Nivel | Mitigación |
|--------|-------|------------|
| `:has()` en navegadores antiguos | Bajo | Fallback: módulo sigue usable sin cluster shadow |
| Doble padding en pantallas Sample con view-wrapper propio | Medio | Reset `padding: 0` en view-wrapper anidado |
| Regresión Fase 5.5 | Medio | Sin transitions nuevas; sin height fijos; sin cambios TS drawer |
| com-proveedor form sin `.content-block` | Bajo | Selector `+ div:has(.dx-form)` |

---

## Screenshots comparativos

No generados automáticamente. Comparar browse en gen-depto vs sc-test tras `ng serve`. Carpeta sugerida: `DOCS/screenshots/fase-7d/`.

---

## Recomendaciones siguientes (7E+)

- Unificar sc-test para usar `barra-data-mtto` + `data-grid-mtto` (eliminar layout custom)
- Deprecar `view-wrapper` en HTML Shop gradualmente (ya no necesario)
- `@Input() moduleLayout` en layouts si algún módulo requiere full-bleed
- QA Playwright: snapshot gen-pais / gen-depto post-layout

---

## Criterio de éxito

Al abrir gen-pais, gen-depto o sc-tipo-modalidad:

- Padding exterior consistente tipo sc-test
- Módulo browse encapsulado (barra + grid como tarjeta única)
- Formulario de edición separado visualmente
- Sin modificar HTML de ningún CRUD individual

**Build:** verificar con `npm run build`.
