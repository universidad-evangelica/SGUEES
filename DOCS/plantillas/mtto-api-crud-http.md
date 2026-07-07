# Plantilla — Contrato HTTP CRUD mtto (SPA + API)

**Versión:** 1.3 — julio 2026  
**Aplica a:** A+, A+P y estado catálogo  
**Helpers:** `CData.Put` (SPA) · `MttoControllerExtensions.ApplyQueryKeys` (API)

---

## Resumen por verbo

| Verbo | SPA (`CData`) | Qué viaja | PK |
|-------|---------------|-----------|-----|
| **GET** | `Get` | Solo query | En query |
| **POST** | `Post` | Solo body | Se genera en servidor |
| **PUT** | `Put` | **Body + query** (`xWhere`) | Query + body (framework unifica) |
| **DELETE** | `Delete` | **Solo query** | En query — **no hay body** |

---

## PUT — actualizar / activar-inactivar (estado catálogo)

### Problema que evita el estándar

El SPA envía:

```
PUT MI_CONTROLLER/?CORR_XXX=42
Body: { "CORR_XXX": 0, "DESCRIPCION": "...", ... }
```

El `0` en el body es común (default de `int` en JSON). La PK real está en el query.

### SPA — service (patrón único, igual A+ y A+P)

```typescript
update(model: any): Observable<IResult> {
  return this.repo.update(model, [{ Parameter: 'CORR_XXX', Value: model.CORR_XXX }]);
}

activarInactivar(model: any): Observable<IResult> {
  return this.repo.activarInactivar(model, [{ Parameter: 'CORR_XXX', Value: model.CORR_XXX }]);
}
```

**Estado catálogo:** un solo endpoint `ActivarInactivar` (el SP invierte el bit en BD). Ver [mtto-a-plus-estado-catalogo.md](./mtto-a-plus-estado-catalogo.md).

**No** duplicar lógica de PK en cada service — `CData.Put` fusiona `xWhere` al body si el campo viene en `0` o vacío.

### SPA — repository (sin cambios)

```typescript
update(model: any, xWhere: IParam[]): Observable<IResult> {
  return this.objData.Put(model, this.xController, '', xWhere, environment.Url...API);
}
```

### API — controller

```csharp
using sguees.api.Shared;

[HttpPut]
[Authorize(Policy = "/mi-ruta|U")]
public async Task<IActionResult> Put(MI_TABLATable Data)
{
    this.ApplyQueryKeys(Data, nameof(MI_TABLATable.CORR_XXX));
    SetUpdateAudit(Data);
    // ...
}

[HttpPut("ActivarInactivar")]
public async Task<IActionResult> ActivarInactivar(MI_TABLATable Data)
{
    this.ApplyQueryKeys(Data, nameof(MI_TABLATable.CORR_XXX));
    Data.CORR_EMPRESA = GetCorrEmpresa();
    // ...
}
```

**Delete** no usa `ApplyQueryKeys` — solo `[FromQuery]`.

**Prohibido:** métodos privados `ApplyPrimaryKeyFromQuery` por pantalla.

### API — service (estado catálogo)

- Validar `CORR_XXX > 0`.
- **No** `UpdateAsync` completo ni mutar `ESTADO_*` en service — el SP lo resuelve en BD.

---

## DELETE — eliminar

### Solo query — no usa `ApplyQueryKeys`

```csharp
[HttpDelete]
[Authorize(Policy = "/mi-ruta|D")]
public async Task<IActionResult> Delete([FromQuery] MI_TABLATable Data)
{
    Data.CORR_EMPRESA = GetCorrEmpresa();
    // ...
}
```

### SPA

```typescript
delete(param: any): Observable<IResult> {
  return this.repo.delete([{ Parameter: 'CORR_XXX', Value: param.CORR_XXX }]);
}

// En el componente (fila del grid):
rowRemoving(e: any): void {
  this.rowRemovingMtto(e, {
    deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_XXX)),
  });
}
```

La PK sale de **`e.data`** (fila del grid). Si llega `0`, el API debe rechazar — no hay body de respaldo.

---

## Checklist CRUD HTTP

- [ ] Service `update` con `xWhere` PK (patrón gen-banco)
- [ ] Si estado `bit`: `activarInactivar` con xWhere PK (como `delete`)
- [ ] Controller PUT y `ActivarInactivar`: `this.ApplyQueryKeys(Data, nameof(...))`
- [ ] Controller Delete: `[FromQuery]` — sin `ApplyQueryKeys`
- [ ] **No** `ApplyPrimaryKeyFromQuery` privado por controller
- [ ] Service API valida PK `> 0` en escrituras

---

Ver también: [mtto-a-plus.md](./mtto-a-plus.md) · [mtto-a-p-paginado.md](./mtto-a-p-paginado.md) · [ESTANDAR-MTTO.md](../ESTANDAR-MTTO.md)
