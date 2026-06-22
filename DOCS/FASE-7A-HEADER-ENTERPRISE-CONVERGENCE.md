# Fase 7A — Header Enterprise Convergence

**Fecha:** 2026-05-28  
**Referencia visual:** `sc-test` → `.sguees-grid-header` (antes `sc-test-grid-header`)  
**Alcance:** Evolucionar `barra-data-mtto` sin modificar los 33+ CRUD individuales.

---

## Resumen

Se unificó la jerarquía del header CRUD con el patrón premium de `sc-test`: título y acciones en la misma fila, tipografía alineada (22px / 14px), meta opcional (eyebrow + breadcrumbs) y toolbar inline sin doble card.

**Compatibilidad:** 100% hacia atrás — ningún HTML de mantenimiento fue modificado.

---

## Análisis comparativo

| Aspecto | sc-test-grid-header | barra-data-mtto (antes 7A) | barra-data-mtto (después 7A) |
|---------|---------------------|----------------------------|------------------------------|
| Título | 22px, weight 400 | 18px compact semibold | 22px enterprise (shared class) |
| Subtítulo | 14px, `--subtitle-text-color` | Token sm secondary | Mismo patrón sc-test |
| Acciones | Misma fila toolbar `after` | Toolbar separado debajo | Toolbar proyectado en fila del header |
| Breadcrumbs | No | Opcional (Fase 6) | Opcional |
| Eyebrow | No | Opcional (Fase 6) | Opcional |
| Responsive | `locateInMenu="auto"` | Wrap móvil | + `locateInMenu` en btn1–6 |

---

## Inputs agregados / refinados

| Input | Tipo | Comportamiento |
|-------|------|----------------|
| `eyebrow` | `string?` | Meta superior; omitir = no se muestra |
| `subtitle` | `string?` | Subtítulo; prioridad sobre `subtituloVentana` |
| `breadcrumbs` | `BreadcrumbItem[]?` | Navegación opcional |
| `subtituloVentana` | `string` | **Mantenido** (alias legacy de subtitle) |

Tipo exportado: `BreadcrumbItem` (`{ label, route? }`).

Ejemplo opt-in (sin tocar pantallas existentes):

```html
<app-barra-data-mtto
  [tituloVentana]="tituloVentana"
  eyebrow="General"
  subtitle="Catálogo de departamentos por país"
  [breadcrumbs]="[{ label: 'Inicio', route: '/home' }, { label: 'Departamentos' }]"
  ...
></app-barra-data-mtto>
```

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `layouts/barra-data-mtto/barra-data-mtto.component.ts` | Inputs, getters, export `BreadcrumbItem` |
| `layouts/barra-data-mtto/barra-data-mtto.component.html` | Layout enterprise: header + toolbar inline |
| `layouts/barra-data-mtto/barra-data-mtto.component.scss` | Toolbar `--inline`, responsive |
| `shared/.../page-header/*` | Variant `enterprise`, proyección acciones |
| `theme/styles/sguees-grid-header.scss` | **Nuevo** — estilos compartidos sc-test/CRUD |
| `theme/styles/sguees-mtto-module.scss` | Chrome enterprise sin doble borde |
| `styles.scss` | Import `sguees-grid-header.scss` |
| `pages/.../sc-test/*` | Migrado a `.sguees-grid-header` (referencia canónica) |

---

## Pantallas beneficiadas (33)

Todas con `<app-barra-data-mtto>` heredan el nuevo layout enterprise automáticamente:

General (8), Accounting (2), Security (3), Payroll (1), SelectionHiring (4), Shop (15).

Eventos preservados: `(nuevo)`, `(guardar)`, `(cancelar)`, `(consultar)`, `btn1Click`–`btn6Click`, fechas, visibilidad por `permiteAdd` / `isBrowse` / `isForm`.

---

## Validación funcional

| Caso | Resultado esperado |
|------|-------------------|
| Browse + `permiteAdd=true` | Botón Nuevo visible |
| Browse + `permiteAdd=false` | Nuevo oculto (`optNuevo.visible`) |
| Form | Guardar + Cancelar visibles |
| Browse | Cancelar oculto |
| Sin subtitle/eyebrow/breadcrumbs | Solo título + toolbar (comportamiento previo visual mejorado) |
| Build prod | ✅ Verificado |

---

## Riesgos detectados

| Riesgo | Nivel | Mitigación |
|--------|-------|------------|
| Toolbar ancho en pantallas con muchos btn1–6 | Medio | `locateInMenu="auto"` en botones extra |
| Regresión CD DevExtreme | Alto | Template `#barraToolbar` + opciones cacheadas (Fase 5.5) |
| Título vacío + solo breadcrumbs | Bajo | `showPageHeader` cubre meta; h1 vacío posible — usar siempre `tituloVentana` |
| sc-test diverge de barra | Bajo | Ambos usan `.sguees-grid-header` global |

---

## Screenshots comparativos

No generados automáticamente. Comparar manualmente:

1. `/sc-test` — referencia original  
2. `/gen-depto` — CRUD estándar post-7A  
3. Tema dark — contraste eyebrow/breadcrumbs  

Sugerencia: capturas en `DOCS/screenshots/fase-7a/`.

---

## Próximos pasos opcionales (7B+)

- Resolver breadcrumbs desde router en `CBaseComponent`
- Pasar `subtitle` por módulo desde metadatos de menú
- Unificar sc-test para usar `app-barra-data-mtto` como POC
