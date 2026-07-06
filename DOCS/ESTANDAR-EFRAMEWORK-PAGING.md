# eFramework — Paginación estándar (A+P)

**Versión:** 1.1 — julio 2026

Paginación y orden **centralizados** en `eFramework`. Los repositories **no** implementan SQL crudo ni `Skip`/`Take` en C#.

**Guía equipo:** [GUIA-EQUIPO-MTTO.md](./GUIA-EQUIPO-MTTO.md)

---

## Método nuevo (no reemplaza `GetDataReader`)

| Método | Ubicación | Uso |
|--------|-----------|-----|
| `CData.GetPagedFromViewAsync<TView>` | `eFramework/Core/CData.cs` | Lectura paginada sobre vista |
| `BaseRepository.ReadPagedViewAsync<TView>` | `eFramework/Data/BaseRepository.cs` | Helper opcional en repos |

**`GetDataReader` no cambia** — catálogos A+ (`GEN_BANCO`, etc.) siguen igual.

---

## Parámetros estándar (único contrato)

| Parámetro | Descripción |
|-----------|-------------|
| `PAGE` | Página 1-based |
| `PAGE_SIZE` | Tamaño; **`0` = todos** (pager `all`) |
| `SORT_FIELD` | Columna — debe estar en **whitelist** del repo |
| `SORT_DESC` | `true` / `false` |

Definidos en `CPagingParameters` (`eFramework/Core/CPagedQuery.cs`).

**No incluir** en el framework: `FILTER_ROW_JSON`, `GetDistinctValues`, `BUSQUEDA`, filtros remotos de grid.

---

## Repository A+P (patrón)

```csharp
private static readonly string[] _AllowedSortFields = { "CORR_XXX", "DESCRIPCION", ... };

public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
{
    var paged = await ReadPagedViewAsync<MIView>(
        "V_MI_TABLA",
        xWhere,
        _AllowedSortFields,
        "CORR_XXX");

    objResultado.Data = paged.PageData;
    objResultado.RowsAffected = paged.TotalRows;
    // ...
}
```

Service `BuildParameters`: solo `CORR_EMPRESA` + los 4 parámetros de paginación/orden.

---

## Piloto

| Entidad | Repo |
|---------|------|
| Impacto económico | `SC_IMPACTO_ECONOMICORepository` (~300 líneas, antes ~1.100) |

---

## Anti-patrones

- SQL `OFFSET/FETCH` en cada repository
- `Skip`/`Take` en memoria tras `GetDataReader` completo
- Copiar `SC_IMPACTO_ECONOMICORepository` legacy con filtros JSON
- Mezclar paginación dentro de `GetDataReader`

---

## Referencias

- Plantilla SPA: `DOCS/plantillas/mtto-a-p-paginado.md`
- Estándar mtto: `DOCS/ESTANDAR-MTTO.md`
