# Mantenimientos SGUEES — Resumen v1.1

**STI / UEES — Julio 2026**  
**Audiencia:** Programadores que crean o migran catálogos

---

## Objetivo

Unificar pantallas de mantenimiento: misma UX, hijo delgado (`CBaseComponent`), plantillas congeladas en `DOCS/plantillas/`, PR con checklist.

**Pilotos de referencia:** `gen-banco` (A+) · `sc-impacto-economico` (A+P cerrado)

---

## Elegir tipo

| Tipo | Cuándo | Carga | Plantilla |
|------|--------|-------|-----------|
| **A+** | &lt; ~500 filas | 1× getAll → array | `mtto-a-plus.md` |
| **A+P** | Muchas filas / auditoría | CustomStore + SQL paginado | `mtto-a-p-paginado.md` |
| **B** | Form con combos | Igual A/A+ | + lookups en estándar |
| **C** | Encabezado + detalle | Partidas, documentos | `con-partida` |

**Activo/inactivo (bit):** + `mtto-a-plus-estado-catalogo.md`  
**Estados DI/AP/AN:** `mtto-estado-transaccional.md` — no usar Activar/Desactivar genérico

---

## Reglas que no se negocian

1. HTML: `app-barra-data-mtto` + `dx-form` + `app-data-grid-mtto` en `.sguees-mtto-view`
2. `mttoGridKeyExpr` obligatorio en catálogos
3. **No** `consultar()` después de guardar — `guardarMtto` parchea el grid
4. Permisos: quien **consume** define `[Authorize]` (no el catálogo origen)
5. PR con `DOCS/CHECKLIST-PR-MTTO.md`

---

## SPA — flags típicos

**A+**
```typescript
protected override mttoGridKeyExpr = 'CORR_XXX';
protected override requiereEmpresaSesion = true;
```

**A+P**
```typescript
protected override mttoRemoteOperations = { paging: true, sorting: true, filtering: false };
@ViewChild(DataGridMttoComponent) dataGrid!: DataGridMttoComponent;
protected override getMttoDataGrid() { return this.dataGrid ?? null; }
```

`filtering: false` = filter row solo sobre la **página cargada**, sin llamar al API.

---

## API A+P — contrato GetAll

| Parámetro | Uso |
|-----------|-----|
| PAGE | Página 1-based |
| PAGE_SIZE | Tamaño (0 = todos) |
| SORT_FIELD / SORT_DESC | Orden (whitelist en repo) |
| CORR_EMPRESA | Desde JWT |

**Repository:** `ReadPagedViewAsync` (eFramework) — no SQL manual ni Skip/Take en C#.

| Capa | Responsabilidad |
|------|-----------------|
| Controller | Authorize, auditoría, PK desde query en PUT |
| Service | Validaciones, empresa sesión, duplicados |
| Repository | Paginación + sort whitelist |

---

## Estado catálogo v1.1

- BD: campo `bit` en vista `V_*`
- Grid: badge verde/rojo (`createEstadoColumnConfig`)
- Toolbar: Activar/Desactivar sobre fila seleccionada (`showEstadoToolbar`)
- API: `Put Activar` / `Put Desactivar` con `|U`

---

## Permisos — regla de oro

> ¿Quién consume? → Policy en `[Authorize]`. ¿De dónde salen datos? → Ese controlador consulta.

Cross-tabla: `GetCAMPO_TABLA_CONSUMIDOR` en controlador **origen**, permiso del **consumidor**.

Tras cambiar permisos en BD: **cerrar sesión y reingresar**.

---

## Fuera de alcance v1.1

- Panel de agrupación en grid padre
- Filtros remotos al API desde filter row
- Agrupamiento servidor

---

## Anti-patrones

| Evitar | Usar |
|--------|------|
| consultar() post-guardar | guardarMtto |
| Repo legacy 1.100 líneas | ReadPagedViewAsync |
| getLookUp para grillas | objData.Get en repo |
| Botones estado por fila | showEstadoToolbar |

---

## Documentación completa

| Documento | Uso |
|-----------|-----|
| `DOCS/GUIA-EQUIPO-MTTO.md` | Onboarding equipo |
| `DOCS/ESTANDAR-MTTO.md` | Reglas completas |
| `DOCS/plantillas/` | Código esqueleto |
| `DOCS/CHECKLIST-PR-MTTO.md` | Antes de PR |
| `DOCS/PROMPT-MTTO.md` | Pedir pantallas a Cursor |

---

## Checklist express (PR)

- [ ] Plantilla correcta
- [ ] CBaseComponent + mttoGridKeyExpr
- [ ] Sin consultar() post-guardar
- [ ] Permisos API = JWT
- [ ] Menú BD si pantalla nueva
- [ ] UTF-8 en textos y SQL

---

*Documento resumido — ver GUIA-EQUIPO-MTTO.md para detalle completo*
