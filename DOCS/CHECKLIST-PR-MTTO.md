# Checklist PR — Mantenimientos SGUEES

Copiar en la descripción del Pull Request o usar como guía de revisión.

**PR de:** _______________  
**Pantalla / módulo:** _______________  
**URL opción / JWT:** `/_______________`  
**Tipo mtto:** [ ] A Básico  [ ] B + Lookup  [ ] C Con detalle  [ ] Asignación  [ ] No es mtto estándar

---

## General (todos los tipos mtto)

- [ ] Extiende `CBaseComponent`
- [ ] Regiones TS: Variables → Init → Combos → Mtto
- [ ] `ngOnInit`: `inicializaOpciones()` → `llenaComboBox()` → `consultar()`
- [ ] `fillParam` / `fillData` implementados (si aplica CRUD clásico)
- [ ] `guardar()` inline con `take(1)` y manejo de errores (si aplica)
- [ ] Routing: módulos estándar + **`exports: [RouterModule]`**
- [ ] Textos en español con tildes (UTF-8)
- [ ] No se refactorizó lógica de negocio no relacionada

---

## Permisos API (obligatorio)

- [ ] `URL_OPCION` en BD = ruta Angular = `Policy` en controller (`/mi-ruta|R/C/U/D`)
- [ ] CRUD de tabla propia usa permiso de **esta** opción
- [ ] Si hay detalle: permiso del **padre**, sin menú propio para detalle
- [ ] Datos de otros catálogos: endpoints `GetCAMPO_TABLA_ORIGEN` en controlador **origen**
- [ ] Permiso de esos endpoints = opción **consumidora**, no la del catálogo origen
- [ ] Combos → `getLookUp`; grillas llenadas con datos ajenos → `objData.Get` en **repo** (no `getLookUp`)
- [ ] No se llama `GetAll` nativo de otra pantalla con su permiso propio

---

## Tipo A — Básico

- [ ] `app-barra-data-mtto` + `dx-form` + `app-data-grid-mtto`
- [ ] `bloquear` / `habilitar` / `setFocus`
- [ ] Sin `[columnAutoWidth]="true"` en grid principal

---

## Tipo B — Lookups en formulario (marcar si aplica)

- [ ] Combos con `appInfoService.getLookUp(...)`
- [ ] Endpoints API: `GetCAMPO_TABLA_ORIGEN` creados
- [ ] `[Authorize(Policy = "/url-consumidor|R")]` en API
- [ ] `DataLookupModule` en routing
- [ ] Templates `*Lookup` + `app-data-lookup`
- [ ] `lookupColumns` si el combo tiene varias columnas

---

## Tipo C — Detalle (marcar si aplica)

- [ ] Agregar detalle sin exigir PK de encabezado
- [ ] `guardarEncabezadoParaDetalle()` (patrón `com-documento` / `con-partida`)
- [ ] `detalleRowInserting` / `Updating` / `Removing` con `e.cancel = Promise`
- [ ] Grid detalle separado; `columnAutoWidth=false` en detalle
- [ ] `CON_PADRE_DETA` API con permiso `/url-padre|*`

---

## Asignación / tabla puente (marcar si aplica)

- [ ] CRUD en `CON_TABLA_PUENTE` con permiso de esta opción
- [ ] Grillas de catálogos: repo → controlador origen + `Get*_MI_OPCION`
- [ ] No `getLookUp` para llenar grillas

---

## Base de datos (pantalla nueva o menú)

- [ ] `SEG_OPCION_SISTEMA` — código, nombre NVARCHAR, URL `/ruta`
- [ ] `SEG_OPCION_SISTEMA_SUITE` — suite `SGUEES`
- [ ] `SEG_CONFIG_OPCION` — menú y **orden** correctos
- [ ] `SEG_USUARIO_OPCION` — sin duplicar misma opción en dos menús
- [ ] Script SQL con `sqlcmd -f 65001`

---

## API

- [ ] Controller + Service + Repository + Models
- [ ] Vista `V_*` o SP alineados con tabla
- [ ] Endpoints cross-tabla en controlador correcto (si aplica)

---

## Revisión final

| Revisor | Fecha | Aprobado |
|---------|-------|----------|
| | | [ ] Sí  [ ] Con observaciones |

**Observaciones:**

---

Ver documento completo: [ESTANDAR-MTTO.md](./ESTANDAR-MTTO.md)
