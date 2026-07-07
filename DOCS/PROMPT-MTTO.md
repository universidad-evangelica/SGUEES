# Prompt — Crear o migrar mantenimiento SGUEES

**Versión:** 1.3 — julio 2026

Usar este texto al pedir a Cursor (o a un programador) una pantalla nueva o migración.  
**Onboarding equipo:** [GUIA-EQUIPO-MTTO.md](./GUIA-EQUIPO-MTTO.md)

---

## Frase disparadora

> Tengo la tabla `___`, la vista `V___`, módulo `___`, ruta `/___`. Crear mantenimiento según estándar SGUEES.

---

## Instrucciones obligatorias para la IA

1. Leer **`DOCS/ESTANDAR-MTTO.md`** (documento maestro).
2. Elegir plantilla en **`DOCS/plantillas/`** — **no** copiar línea por línea `gen-banco` ni `sc-impacto-economico`.
3. Entregar **BD + API + SPA + menú** si es pantalla nueva.
4. Extender **`CBaseComponent`** con 4 regiones TS.
5. HTML: `app-barra-data-mtto` + `dx-form` + `app-data-grid-mtto` dentro de `.sguees-mtto-view`.
6. **Sin** `p-toast` local, **sin** `.scss` propio, **sin** `override notifyFx`.
7. **`mttoGridKeyExpr`** obligatorio en catálogos.
8. **`guardarMtto`** sin `onSuccess: () => consultar()` (el padre parchea el grid).
9. **`rowRemovingMtto`** sin `reload` manual.
10. **`(editClick)="editarClick($event)"`** — no botones edit custom en columnas.
11. **A+P API:** `ReadPagedViewAsync` — no SQL crudo ni paginación en memoria C#.
12. **Estado catálogo (`bit`):** extensión `mtto-a-plus-estado-catalogo.md` — aplica a **A+ y A+P**; toolbar + `activar_inactivar()` + `Put ActivarInactivar` + SP.
13. **No** panel de agrupación ni filtros remotos en grid padre (fuera de alcance v1.1).
14. **CRUD HTTP** — leer `plantillas/mtto-api-crud-http.md`:
    - **PUT** (update, ActivarInactivar): body + query; service con `xWhere` PK; API `ApplyQueryKeys`.
    - **DELETE**: solo query (`[FromQuery]`); PK desde `e.data` del grid; **sin** `ApplyQueryKeys`.
    - **No** métodos privados `ApplyPrimaryKeyFromQuery` por controller.
15. **Auditoría en grid:** si la vista trae `USUARIO_*` / `FECHA_*` / `ESTACION_*`, mostrar solo usuario y fechas (`USUARIO_CREA`, `FECHA_CREA`, `USUARIO_ACTU`, `FECHA_ACTU`) **al final** de `getColumns()`; **no** `ESTACION_*`. Usar `buildAuditGridColumns()` de `shared/mtto/mtto-grid.helpers.ts`.

---

## Elegir tipo

| Pregunta | Plantilla |
|----------|-----------|
| Catálogo simple, pocas filas, sin activar/desactivar | `plantillas/mtto-a-plus.md` |
| Catálogo + activo/inactivo (`bit`) | `mtto-a-plus.md` **o** `mtto-a-p-paginado.md` + `mtto-a-plus-estado-catalogo.md` |
| Catálogo grande / auditoría en grid / paginado servidor | `mtto-a-p-paginado.md` (+ estado catálogo si aplica) |
| Contrato PUT/DELETE (todos los catálogos) | `plantillas/mtto-api-crud-http.md` |
| Form con combos `getLookUp` | A+ o A+P + sección lookup en `ESTANDAR-MTTO.md` |
| Encabezado + detalle | Tipo C — `con-partida` / `com-documento` |
| Documento con estados DI/AP/AN | `mtto-estado-transaccional.md` — **no** patrón bit |

---

## Estado — regla rápida

```
¿Solo activo / inactivo?
  SÍ → bit + badge + toolbar + `activar_inactivar()` + SP `PRAL_MTTO_CATALOGO_ESTADO_BIT`
  NO → varchar + flujo propio (transaccional)
```

---

## Defaults del padre (override en hijo si hace falta)

| Propiedad | Default |
|-----------|---------|
| `mttoPageSize` | 20 |
| `mttoPageSizes` | 20, 50, 100, 200, all |
| `mttoRemoteOperations` | false (A+) |
| `mttoParchearGridTrasGuardar` | true |

---

## Referencias vivas (solo verificar, no copiar ciego)

| Piloto | Tipo |
|--------|------|
| `General/gen-banco` | A+ |
| `SelectionHiring/sc-impacto-economico` | A+P + estado catálogo |

---

## Checklist final

- [ ] Plantilla correcta aplicada
- [ ] CRUD HTTP: [plantillas/mtto-api-crud-http.md](./plantillas/mtto-api-crud-http.md) (`CData.Put` + `ApplyQueryKeys`; Delete solo query)
- [ ] Auditoría en grid: solo usuario/fechas al final; `buildAuditGridColumns()` si aplica
- [ ] `docs/CHECKLIST-PR-MTTO.md` del tipo correspondiente
- [ ] Compila SPA + API
- [ ] Menú BD si es pantalla nueva
- [ ] UTF-8 en textos y scripts SQL (`sqlcmd -f 65001`)
