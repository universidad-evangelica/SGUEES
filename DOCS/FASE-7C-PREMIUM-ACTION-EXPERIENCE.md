# Fase 7C — Premium Action Experience

**Fecha:** 2026-05-29  
**Componente:** `app-data-grid-mtto`  
**Alcance:** Acciones editar/eliminar en grid CRUD (33 módulos), sin tocar pantallas individuales.

---

## Decisión: Opción A — Icon buttons premium

| Criterio | Opción A (icon buttons) | Opción B (overflow …) |
|----------|-------------------------|------------------------|
| sc-test | ✅ Edit + trash visibles | ❌ No usa menú |
| UI Kit (`action-button`) | ✅ `stylingMode: text` + icon | ❌ Sin componente menú fila |
| Fricción UX | 1 clic por acción | 2 clics (abrir + elegir) |
| DevExtreme / Fase 5.5 | ✅ Botones nativos, `visible` booleano | ⚠️ Templates/cellTemplate por fila |
| Responsive | Iconos en columna fija derecha | Menú oculta acciones |

**Conclusión:** Opción A es la consistente con el design system y la referencia sc-test.

---

## Cambios implementados

### Columna acciones unificada

**Antes:** dos columnas (`btnEditar` 48px + `btnEliminar` 48px) al inicio del grid.  
**Después:** una columna `btnAcciones` (104px), **fixed right**, iconos edit + trash.

| Botón | Icono | Evento |
|-------|-------|--------|
| Editar | `edit` | `(editClick)` vía `OneditClick` |
| Eliminar | `trash` | `name: 'delete'` → `(rowRemoving)` + confirmación DX |

### Permisos preservados

- `permiteEditar` / `permiteDele` (boolean o función evaluada a booleano en init — regla Fase 5.5)
- `syncActionButtonsVisibility()` actualiza `visible` si cambian inputs
- Compatibilidad con columnas legacy `btnEditar` / `btnEliminar` si ya existían

### Estilos premium (`sguees-grid-col-actions--premium`)

- Icon buttons 34×34px, radius token
- Hover accent / danger con `color-mix`
- Focus ring accesible
- Header columna «Acciones» uppercase muted

### sc-test

Alineado a las mismas clases CSS y dimensiones que `data-grid-mtto`.

---

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `data-grid-mtto.component.ts` | Columna `btnAcciones`, `syncActionButtonsVisibility` |
| `sguees-premium-grid.scss` | Estilos premium acciones |
| `sc-test.component.ts` | Clases compartidas |

---

## Pantallas beneficiadas

Las **33** que usan `<app-data-grid-mtto>` reciben la nueva columna acciones automáticamente.

Validar: `/gen-pais`, `/gen-depto`, `/sc-tipo-modalidad` — editar, eliminar, permisos desactivados.

---

## Riesgos

| Riesgo | Notas |
|--------|-------|
| Columna fija derecha + muchas columnas | Patrón sc-test; scroll horizontal puede aplicar |
| `permiteEditar` como función por fila | No soportado (limitación preexistente Fase 5.5) |
| Grids con columnas acción custom en servicio | Solo sc-test define la suya; resto usa inyección del layout |

---

## Futuro opcional

- Overflow menu para acciones secundarias (export fila, auditoría) sin reemplazar edit/delete primarios
- `@Input() actionLayout: 'icons' | 'menu'` si un módulo lo requiere
