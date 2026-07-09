# Estándar de programación — Mantenimientos SGUEES

Documento oficial para todo el equipo. **Toda pantalla nueva o migración del admin debe seguir este estándar.**

**Onboarding / explicación al equipo:** [GUIA-EQUIPO-MTTO.md](./GUIA-EQUIPO-MTTO.md)  
Módulos de referencia alineados: **gen-banco** (A+), **sc-impacto-economico** (A+P piloto cerrado).  
**Plantillas congeladas (IA y equipo):** `DOCS/plantillas/` — no depender solo del código piloto en vivo.

---

## Regla de oro

> Seguir **`DOCS/plantillas/`** según el tipo de pantalla. Comparar con `gen-banco` o `sc-impacto-economico` solo para dudas puntuales.

**No inventar estructura.** No copiar línea por línea pantallas piloto que pueden cambiar.

**Prompt IA:** `DOCS/PROMPT-MTTO.md`

---

## Tipos de mantenimiento

| Tipo | Cuándo | Plantilla | Referencia viva |
|------|--------|-----------|-----------------|
| **A — Básico** | Una tabla/vista, sin detalle | — | `gen-banco` |
| **B — + lookup** | Form con combos | — | `con-centro-costo` |
| **C — Con detalle** | Encabezado + `*_DETA` | — | `con-partida`, `com-documento` |
| **A+** | Catálogo en memoria, &lt; ~500 filas | [plantillas/mtto-a-plus.md](./plantillas/mtto-a-plus.md) | `gen-banco` |
| **A+P** | Catálogo paginado servidor, auditoría | [plantillas/mtto-a-p-paginado.md](./plantillas/mtto-a-p-paginado.md) | `sc-impacto-economico` |

### Cómo elegir A+ vs A+P

| Criterio | A+ | A+P |
|----------|----|----|
| Filas por empresa | &lt; ~500 | Muchas o crecimiento esperado |
| Carga datos | 1× `consultarMtto` → array | `CustomStore` por página |
| Paginado | Cliente — navegación de páginas; **sin** selector de tamaño ni "Todos" en pager | Servidor (`remoteOperations.paging`) + selector + "Todos" |
| Filter row grid | Cliente, sin API | Cliente, sin API (`filtering: false`) |
| Complejidad hijo | Baja | Media |

**Regla IA:** si no está claro, **preguntar** al usuario antes de elegir plantilla. Ver [PROMPT-MTTO.md](./PROMPT-MTTO.md) sección "Pregunta obligatoria — paginado servidor".

**Nota A+P API:** paginación centralizada en `eFramework` (`GetPagedFromViewAsync`). Ver [ESTANDAR-EFRAMEWORK-PAGING.md](./ESTANDAR-EFRAMEWORK-PAGING.md). Legacy Selection sin migrar puede seguir en memoria C#.

---

## Tipo A+ — Catálogo reforzado (recomendado para la mayoría)

Hijo delgado que extiende `CBaseComponent`. Lógica común en el **padre** y `shared/mtto/`.

| Necesidad | Dónde |
|-----------|--------|
| Layout form / grid defaults | Padre: `mttoFormColCount`, `mttoPageSize`, `mttoPageSizes`, `mttoRemoteOperations` |
| Parche grid tras guardar (sin 2ª petición) | `mttoGridKeyExpr` + `guardarMtto` del padre |
| Mensajes API | `notifyFx` / `notifyApiError` (opt-in `mapearMensajesApi`) |
| Empresa en sesión | `requiereEmpresaSesion` + login API `ErrorCode 4100` |
| CRUD | `consultarMtto`, `guardarMtto`, `rowRemovingMtto` |
| Editar / eliminar grid | `editarClick`, `rowRemovingMtto` — sin columna custom |
| Toast / CSS | Global shell + `sguees-mtto-module.scss` |

**Utilidades:** `SGUEES-SPA/src/app/shared/mtto/`

```typescript
// Flags típicos del hijo
protected override etiquetaRegistro = 'el banco';
protected override requiereEmpresaSesion = true;
protected override mttoGridKeyExpr = 'CORR_BANCO';
protected override mttoPageSize = 5;                    // override opcional
protected override mttoPageSizes = [5, 10, 25, 50, 100];

guardar(): void {
  this.guardarMtto({
    esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
    insert: () => this.service.insert(this.model),
    update: () => this.service.update(this.model),
    // NO onSuccess con consultar() — el padre parchea models[]
  });
}
```

**Plantilla completa:** [plantillas/mtto-a-plus.md](./plantillas/mtto-a-plus.md)

---

## Tipo A+P — Catálogo paginado servidor

Para catálogos grandes o con columnas de auditoría. Ver [plantillas/mtto-a-p-paginado.md](./plantillas/mtto-a-p-paginado.md).

```typescript
protected override mttoRemoteOperations = { paging: true, sorting: true, filtering: false };
protected override mttoGridKeyExpr = 'CORR_XXX';

@ViewChild(DataGridMttoComponent) dataGrid!: DataGridMttoComponent;
protected override getMttoDataGrid() { return this.dataGrid ?? null; }
```

- `filtering: false` → filter row **no** llama al API.
- **Pager "Todos":** grid `resolveActivePageSize` (`'all'` → `0`) + `(pageSizeChange)` → `syncMttoPagedStorePagerSize` → `resolveMttoPagedLoadParams` con `lastPageAll` y `activePageSize` → API `PAGE_SIZE=0`.
- `guardarMtto` / `rowRemovingMtto` → padre parchea `CustomStore`, sin reload.

---

## Estados — catálogo vs transaccional

### Catálogo (activo / inactivo)

| Capa | Estándar |
|------|----------|
| BD | `bit` — ej. `ESTADO_IMPACTO_ECONOMICO` |
| Grid | Badge **verde/rojo** (`createEstadoColumnConfig`) — sin botones en la columna |
| Acción | Toolbar `Activar` / `Desactivar` → un método `activar_inactivar()` → `Put ActivarInactivar` |
| API | SP `PRAL_MTTO_CATALOGO_ESTADO_BIT` (toggle en BD) — ver [ESTANDAR-SP-ESTADO-CATALOGO-BIT.md](./ESTANDAR-SP-ESTADO-CATALOGO-BIT.md) |

**Plantilla:** [plantillas/mtto-a-plus-estado-catalogo.md](./plantillas/mtto-a-plus-estado-catalogo.md)

### Transaccional (workflow)

| Capa | Estándar |
|------|----------|
| BD | `varchar(2)` o `varchar(3)` — `DI`, `AP`, `AN`, … |
| Grid | Texto / lookup de estados |
| Acción | Botones de negocio (Aplicar, Anular…) — **no** Activar/Desactivar genérico |

**Plantilla:** [plantillas/mtto-estado-transaccional.md](./plantillas/mtto-estado-transaccional.md)

```
¿Solo activo/inactivo?  → Catálogo (bit)
¿Varios estados de flujo? → Transaccional (varchar)
```

---

### Cómo elegir el tipo (resumen)

- Una sola tabla `V_MiTabla`, catálogo chico → **A+**.
- Catálogo + activo/inactivo → **A+** o **A+P** + plantilla estado catálogo.
- Muchas filas / auditoría → **A+P**.
- Encabezado + `*_DETA` → **C**.
- Documento con estados de negocio → **C** + estado transaccional.

---

## Flujo de trabajo (tabla + vista)

### Entrada mínima

| Dato | Ejemplo |
|------|---------|
| Tabla(s) | `GEN_BANCO`, `CON_PARTIDA` + `CON_PARTIDA_DETA` |
| Vista(s) | `V_GEN_BANCO`, `V_CON_PARTIDA`, `V_CON_PARTIDA_DETA` |
| Módulo | Bancos, Contabilidad, Compras, General |
| Menú | Sistema, menú (`PROCESO` / `GENERAL`), orden, nombre visible |

### Entregables completos (por pantalla)

1. **BD** — Vista, SP `PRAL_DATA_*` / `PRAL_MTTO_*` si aplica, script de menú.
2. **API** — Models, Repository, Service, Controller, lookups.
3. **SPA** — Componente, service, routing, models.
4. **Menú** — `SEG_OPCION_SISTEMA`, `SEG_CONFIG_OPCION`, permisos usuario.

---

## Estructura de carpetas (SPA)

```
SGUEES-SPA/src/app/pages/<Modulo>/<prefijo-entidad>/
├── <prefijo-entidad>.component.ts
├── <prefijo-entidad>.component.html
├── <prefijo-entidad>.component.scss      (solo si hace falta)
├── <prefijo-entidad>.service.ts
├── <prefijo-entidad>-routing.module.ts
├── <prefijo-entidad>.module.ts           (si aplica lazy load)
└── models/
    └── <entidad>.ts
```

Registrar la ruta en el `*-routing.module.ts` del módulo padre (ej. `accounting-routing.module.ts`).

---

## API — contrato HTTP CRUD (PUT / DELETE)

Patrón estándar para todos los mttos catálogo. **Documento completo:** [plantillas/mtto-api-crud-http.md](./plantillas/mtto-api-crud-http.md)

| Verbo | SPA | API |
|-------|-----|-----|
| **PUT** (update, ActivarInactivar) | Body + query (`CData.Put` fusiona PK si body trae `0`) | `this.ApplyQueryKeys(Data, nameof(...PK))` |
| **DELETE** | Solo query (`CData.Delete`) | `[FromQuery]` — PK desde fila del grid |

**Prohibido:** `ApplyPrimaryKeyFromQuery` privado por controller.

**Helpers:** `SGUEES-SPA/.../FxAPI/CData.ts` · `SGUEES-API/.../Shared/MttoControllerExtensions.cs`

---

## Grid — columnas de auditoría

Si la vista `V_*` (o el modelo) trae campos de auditoría estándar (`USUARIO_*`, `FECHA_*`, `ESTACION_*`):

| Regla | Detalle |
|-------|---------|
| **Mostrar en grid** | Solo `USUARIO_CREA`, `FECHA_CREA`, `USUARIO_ACTU`, `FECHA_ACTU` |
| **No mostrar** | `ESTACION_CREA`, `ESTACION_ACTU` (y cualquier otro campo técnico de estación) |
| **Orden** | Campos de negocio primero (PK, descripción, estado, lookups); **auditoría al final** |
| **Formato fechas** | `dataType: 'datetime'`, `format: 'dd/MM/yyyy HH:mm'` |
| **Formulario** | No incluir auditoría en `getItems()` de alta/edición (la API la asigna) |

Helper SPA (mismo orden y captions):

```typescript
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';

getColumns(): any[] {
  return [
    { dataField: 'CORR_XXX', caption: 'Corr.', width: 85 },
    { dataField: 'DESCRIPCION', caption: 'Descripción', width: 300 },
    // ... estado, lookups, etc.
    ...buildAuditGridColumns({ withDateTimeFilter: true }), // true en A+P
  ];
}
```

Referencia: `sc-impacto-economico.service.ts` → `getColumns()`.

---

## TypeScript — estructura obligatoria

Extender **`CBaseComponent`**. Usar **4 regiones**:

```typescript
//#region <Declarando Variables>
//#region <Inicializando Opciones>
ngOnInit(): void {
  this.inicializaOpciones();
  this.llenaComboBox();
  this.consultar();
}
//#region <Manejo de Combos>
//#region <Metodos Mtto>
```

### Métodos mtto (tipo A y B)

| Método | Uso |
|--------|-----|
| `fillParam()` | Parámetros para `getAll` / filtros |
| `fillData()` | Mapear modelo API ↔ formulario |
| `guardar()` | Insert/update inline con `take(1)` |
| `bloquear()` | `readOnly` en editores del `dx-form` |
| `habilitar()` | Quitar `readOnly` |
| `setFocus()` | Foco en primer campo editable |

### Métodos del padre (Tipo A+, opt-in)

| Método / propiedad | Uso |
|--------------------|-----|
| `etiquetaRegistro` | Texto para mensajes de empresa y errores API |
| `requiereEmpresaSesion` | Bloquea guardar si no hay `CORR_EMPRESA` en JWT |
| `mttoFormColCount` / `mttoFormColCountByScreen` | Layout responsive del form |
| `mttoPageSize` | Tamaño de página default del grid (default **20**) |
| `mttoPageSizes` | Selector pager (default **20, 50, 100, 200, all**) |
| `mttoRemoteOperations` | `false` = A+; `{ paging, sorting, filtering }` = A+P |
| `mttoGridKeyExpr` | Clave para parchear grid tras guardar/eliminar |
| `getMttoDataGrid()` | Override en A+P para `refrescarGridMtto` |
| `asegurarEmpresaSesion()` | Valida sesión empresa |
| `consultarMtto({ load })` | Consulta A+ con loading |
| `guardarMtto({ ... })` | Guardar; parchea grid si `mttoGridKeyExpr` |
| `rowRemovingMtto(e, { deleteFn })` | Delete grid; parchea sin reload |
| `invocarActivarInactivar(fn)` | Toolbar activar/desactivar catálogo `bit` (un flujo) |
| `ejecutarActivarInactivar({ ... })` | Ejecuta `Put ActivarInactivar` y parchea grid |
| `confirmaAccion(title, message, fn)` | Diálogo Si/No |

### Tipo C — además

- `guardarEncabezadoParaDetalle()` — inserta encabezado si no hay PK y luego guarda línea.
- `detalleRowInserting` / `Updating` / `Removing` — `e.cancel = Promise`.
- `readOnly` condicional por estado (ej. `ESTADO !== 'DI'`).

### Arquitectura padre / detalle (SPA vs API)

| Capa | Padre | Detalle |
|------|-------|---------|
| **SPA** | Una sola pantalla: `component`, `service`, `routing`, `module` | **No** componente ni ruta propia. Modelo en `models/<entidad>-deta.ts`. Service/repository del detalle en subcarpeta del padre o carpeta hermana **sin UI** (ej. `con-partida-deta/`). El grid detalle vive en el HTML/TS del padre. |
| **API** | Controller / Service / Repository del encabezado | Carpeta separada bajo el padre (ej. `CON_PARTIDA/CON_PARTIDA_DETA/`). |
| **Permisos** | Opción de menú y JWT del padre (`/con-partida`) | **Mismos permisos del padre** en el controller del detalle (`/con-partida|R`, `|C`, `|U`, `|D`). Sin menú ni opción propia para el detalle. |

```
SPA (una pantalla)                 API (lógica separada)
──────────────────                 ─────────────────────
con-partida/                       CON_PARTIDA/
├── component / service / routing      ├── CON_PARTIDAController
├── models/con-partida.ts            └── CON_PARTIDA_DETA/
└── models/con-partida-deta.ts           └── CON_PARTIDA_DETAController  ← /con-partida|*
con-partida-deta/  (solo datos, sin UI)
├── *.service.ts
└── *.repository.ts
```

---

## HTML — estructura obligatoria

```html
<app-barra-data-mtto ... />
<dx-form [formData]="model" [items]="items" ...>
  <!-- templates Lookup -->
</dx-form>
<app-data-grid-mtto [dataSource]="models" [columns]="columns" ... />
```

| Hacer | No hacer |
|-------|----------|
| `app-barra-data-mtto` | Toolbar custom sin barra estándar |
| `app-data-grid-mtto` en listado principal | `dx-data-grid` suelto en listado principal |
| `app-data-lookup` en combos | `dx-select-box` con `service.getAll()` |
| Sin `columnAutoWidth` en grid principal | `[columnAutoWidth]="true"` en grid principal |

### Fuera de alcance v1.1 (grid padre)

- **Panel de agrupación** — no soportado en `app-data-grid-mtto` (toolbar unificada DevExtreme 24).
- **Filtros remotos** desde filter row en A+P — usar `filtering: false`; el filter row actúa solo sobre la página cargada.

---

## Routing module — obligatorio

```typescript
imports: [
  RouterModule.forChild(routes),
  CommonModule,
  DxFormModule,
  DxDataGridModule,
  DataGridMttoModule,
  DataLookupModule,        // si hay lookups
  BarraDataMttoModule,
  // ...otros Dx según pantalla
],
exports: [RouterModule],   // ← obligatorio
```

---

## Permisos y peticiones API

Esta es la regla más importante para no obligar al usuario a tener permisos de pantallas que no usa.

### Concepto base

| Concepto | Descripción | Ejemplo |
|----------|-------------|---------|
| **Opción de menú** | Clave en el JWT al hacer login | `/con-catalogo-cuenta-centro-costo` |
| **Permisos** | Letras en el token | `R` leer, `C` crear, `U` modificar, `D` eliminar, `P` imprimir |
| **SPA** | `urlOpcion` = ruta Angular; `getPermisos()` según el token | `CBaseComponent` lo resuelve en el constructor |
| **API** | `[Authorize(Policy = "/url-opcion|R")]` en cada endpoint | Debe coincidir con `URL_OPCION` en `SEG_OPCION_SISTEMA` |

### Regla de oro de permisos

> **¿Quién consume los datos?** → ese permiso va en el `[Authorize]`.  
> **¿De dónde se leen los datos?** → ese controlador/servicio ejecuta la consulta.

**Prohibido:** llamar `GetAll` / `Get` del catálogo origen con el permiso nativo de esa pantalla (ej. `/con-catalogo-cuenta|R`) cuando el usuario solo tiene permiso de otra opción.

---

### Caso 1 — CRUD de la tabla propia

La pantalla consulta y modifica **su propia** tabla.

| Capa | Regla |
|------|--------|
| **API** | `MI_TABLAController` → `GetAll`, `Get`, `Post`, `Put`, `Delete` |
| **Permiso** | `/mi-ruta-spa\|R`, `\|C`, `\|U`, `\|D` |
| **SPA** | `repository.xController = 'MI_TABLA'` |

```csharp
[HttpGet("GetAll")]
[Authorize(Policy = "/con-catalogo-cuenta-centro-costo|R")]
public async Task<CResult> GetAll(...) { ... }
```

---

### Caso 2 — Detalle (tabla `*_DETA`)

El detalle **no** tiene opción de menú propia.

| Capa | Regla |
|------|--------|
| **API** | `PADRE/PADRE_DETA/PADRE_DETAController` |
| **Permiso** | Siempre el del **padre** (`/con-partida|R`, `\|C`, etc.) |
| **SPA** | Sin componente/ruta propia; repo/service del detalle sin UI |

```csharp
// CON_PARTIDA_DETAController
[Authorize(Policy = "/con-partida|R")]  // no /con-partida-deta
```

---

### Caso 3 — Necesito datos de otra tabla (cross-tabla)

Cuando la pantalla **A** necesita datos de catálogo **B** (cuenta, centro, proveedor, lista, etc.), crear un endpoint en el **controlador de B** con permiso de **A**.

**Nombre del endpoint:** `Get{CAMPO}_{TABLA_ORIGEN}`

| Parte | Significado | Ejemplo |
|-------|-------------|---------|
| `CAMPO` | Campo o concepto que se expone | `CUENTA_CONTABLE`, `CORR_CENTRO_COSTO` |
| `TABLA_ORIGEN` | Código de la opción que **consume** (no la que provee) | `CON_PARTIDA`, `CON_CTA_CENTRO_COSTO` |

```csharp
// En CON_CATALOGO_CUENTAController — datos de cuentas, permiso de partida
[HttpGet("GetCUENTA_CONTABLE_CON_PARTIDA")]
[Authorize(Policy = "/con-partida|R")]
public async Task<CResult> GetCUENTA_CONTABLE_CON_PARTIDA(...) =>
    await _service.GetAllAsync(param);

// En CON_CENTRO_COSTOController — datos de centros, permiso de cta↔centro
[HttpGet("GetCORR_CENTRO_COSTO_CON_CTA_CENTRO_COSTO")]
[Authorize(Policy = "/con-catalogo-cuenta-centro-costo|R")]
public async Task<CResult> GetCORR_CENTRO_COSTO_CON_CTA_CENTRO_COSTO(...) =>
    await _service.GetAllAsync(param);
```

El usuario con permiso de **partida** puede elegir cuentas **sin** tener permiso de Catálogo de Cuentas.

---

### Caso 3a — Combo / lookup en formulario (`app-data-lookup`)

Solo para combos en `dx-form` o celdas de detalle.

**SPA:**

```typescript
this.appInfoService.getLookUp(
  'CON_PARTIDA',              // TABLA_ORIGEN (opción consumidora)
  'CON_CATALOGO_CUENTA',      // controlador que tiene los datos
  'GetCUENTA_CONTABLE',       // método → API: GetCUENTA_CONTABLE_CON_PARTIDA
  where,
  environment.UrlCONTAAPI
);
```

`getLookUp` arma la URL: `{CONTROLADOR}/Get{METODO}_{TABLA_ORIGEN}`.

---

### Caso 3b — Grilla que se llena con datos ajenos (no es lookup)

Para pantallas que cargan un **grid completo** (no combo). **No** usar `getLookUp`.

**SPA — solo en el repository:**

```typescript
// con-catalogo-cuenta-centro-costo.repository.ts
getCatalogoCuentas(): Observable<IResult> {
  return this.objData.Get(
    'CON_CATALOGO_CUENTA',                        // controlador origen
    'GetCUENTA_CONTABLE_CON_CTA_CENTRO_COSTO',    // endpoint con permiso consumidor
    [],
    environment.UrlCONTAAPI
  );
}

getCentrosCosto(): Observable<IResult> {
  return this.objData.Get(
    'CON_CENTRO_COSTO',
    'GetCORR_CENTRO_COSTO_CON_CTA_CENTRO_COSTO',
    [],
    environment.UrlCONTAAPI
  );
}
```

El **componente** llama `this.service.getCatalogoCuentas()` — no `getLookUp`.

---

### Caso 4 — Listas estáticas (`*_LISTA`)

Mismo criterio: permiso del consumidor.

```typescript
getLookUp('GEN_BANCO', 'GEN_LISTA', 'GetCLASE_BANCO', undefined, environment.UrlGENERALAPI);
```

API en `BAN_LISTAController` → `GetCLASE_BANCO_GEN_BANCO` con `[Authorize(Policy = "/gen-banco|R")]`.

---

### Resumen visual

```
┌─────────────────────────────────────────────────────────────┐
│  Usuario tiene permiso: /con-catalogo-cuenta-centro-costo    │
└─────────────────────────────────────────────────────────────┘
         │
         ├── CRUD relación cuenta↔centro
         │      → CON_CATALOGO_CUENTA_CENTRO_COSTO / GetAll, Post, Delete
         │      → Policy: /con-catalogo-cuenta-centro-costo|R/C/D
         │
         ├── Grilla de cuentas (llenar grid)
         │      → CON_CATALOGO_CUENTA / GetCUENTA_CONTABLE_CON_CTA_CENTRO_COSTO
         │      → Policy: /con-catalogo-cuenta-centro-costo|R  ← no /con-catalogo-cuenta
         │
         └── Grilla de centros (llenar grid)
                → CON_CENTRO_COSTO / GetCORR_CENTRO_COSTO_CON_CTA_CENTRO_COSTO
                → Policy: /con-catalogo-cuenta-centro-costo|R  ← no /con-centro-costo
```

---

### Checklist permisos (al crear mtto nuevo)

- [ ] `URL_OPCION` en BD = ruta SPA = clave en JWT = `Policy` en API
- [ ] CRUD propio usa permiso de **esta** opción
- [ ] Detalle usa permiso del **padre**
- [ ] Datos de otros catálogos: endpoint `Get*_{MI_OPCION}` en controlador origen
- [ ] Combos → `getLookUp`; grillas → `objData.Get` en repo (no mezclar)
- [ ] No exigir permisos de pantallas que el usuario no necesita abrir
- [ ] Tras asignar permisos en BD: usuario debe **cerrar sesión y reingresar**

---

## Lookups — SPA + API (combos)

### En el SPA

```typescript
this.appInfoService
  .getLookUp('TABLA_ORIGEN', 'CONTROLADOR', 'GetCAMPO', where, environment.Url...API)
  .pipe(take(1))
  .subscribe({ ... });
```

### En el HTML

```html
<div *dxTemplate="let cellInfo of 'MI_CAMPOLookup'">
  <app-data-lookup
    [setValue]="cellInfo.setValue"
    [model]="mMI_CAMPO"
    [(value)]="cellInfo.value"
    [selectedRowKeys]="selectedLookUpMI_CAMPO"
    [lookupColumns]="miLookupColumns"
  />
</div>
```

Varias columnas en el popup: definir `lookupColumns` con `width` por columna.

### En la API (solo combos)

| Tipo | Controlador | Nombre endpoint | Permiso |
|------|-------------|-----------------|---------|
| Lista estática | `MOD_LISTA` | `GetNOMBRE_CAMPO` | `/url-consumidor\|R` |
| Cross-tabla | Entidad origen (cuenta, centro, etc.) | `GetCAMPO_TABLA_ORIGEN` | `/url-consumidor\|R` |

Ver sección **Permisos y peticiones API** para grillas y detalle.

**Prohibido** en combos: `service.getAll()` directo al catálogo con permiso ajeno.

**Excepción:** datos filtrados en tiempo de ejecución (ej. centros por cuenta en detalle de partida).

---

## Base de datos — menú y seguridad

Toda pantalla nueva debe registrarse en:

| Tabla | Qué guardar |
|-------|-------------|
| `SEG_OPCION_SISTEMA` | `CODIGO_OPCION`, `NOMBRE_OPCION`, `URL_OPCION` |
| `SEG_OPCION_SISTEMA_SUITE` | Vínculo con `SGUEES` |
| `SEG_CONFIG_OPCION` | Sistema, menú, **orden** (`ORDEN_MENU`, `ORDEN_OPCION`) |
| `SEG_USUARIO_OPCION` | Permisos; `CODIGO_MENU` igual que en config |

### Reglas

- Una opción = un `CODIGO_OPCION` = una fila en `SEG_CONFIG_OPCION`.
- `URL_OPCION` con `/` inicial, igual a la ruta Angular.
- La opción principal del menú **no va al final** (revisar `ORDEN_OPCION`).
- No duplicar la misma opción en dos menús para el mismo usuario.
- Tras cambiar menú: **cerrar sesión y volver a entrar**.

### Scripts de referencia

```bash
sqlcmd -S <servidor> -d SGUEES -U <usuario> -f 65001 -i SGUEES-DB/Scripts/MENU_CONTABILIDAD_REORG.sql
sqlcmd -S <servidor> -d SGUEES -U <usuario> -f 65001 -i SGUEES-DB/Scripts/FIX_MENU_UTF8_AND_CONTABILIDAD.sql
```

Usar `MENU_CONTABILIDAD_REORG.sql` como **plantilla idempotente** para otros módulos.

---

## UTF-8 y textos en español

| Ámbito | Regla |
|--------|-------|
| Código fuente | UTF-8 (`.editorconfig`). Tildes reales: `Parámetros`, `Catálogo`, `éxito` |
| BD menú | Columnas `NOMBRE_*` en **NVARCHAR**; literales `N'...'` en SQL |
| Scripts SQL | Siempre `sqlcmd -f 65001` |
| Prohibido | `ParÃ¡metros`, `exito` sin tilde, ASCII “por comodidad” |

---

## Pantallas que NO son mtto estándar

No forzar el patrón completo en:

- Aplicar / Anular / Desaplicar
- Importar Excel
- Reportes e impresiones
- Consultas de solo lectura
- Cierre / apertura de períodos

Reutilizar servicios y lookups donde aplique; el shell puede ser distinto.

### Mtto especial — asignación (tabla puente)

Ejemplo: **`con-catalogo-cuenta-centro-costo`** (`CON_CATALOGO_CUENTA_CENTRO_COSTO`).

| Aspecto | Regla |
|---------|--------|
| Tabla | Propia (relación cuenta ↔ centro) |
| Pantalla SPA | Una sola carpeta; UI de asignación (no `app-barra-data-mtto` clásico) |
| Cuentas y centros (grillas) | Repo SPA → `CON_CATALOGO_CUENTA` / `CON_CENTRO_COSTO` con `Get*_CON_CTA_CENTRO_COSTO` (permiso `/con-catalogo-cuenta-centro-costo`). **No** usar `getLookUp` ni `GetAll` del catálogo/centro con su permiso propio. |
| CRUD asignación | `CON_CATALOGO_CUENTA_CENTRO_COSTO` — `GetAll` / `Post` / `Delete` con permiso de esta opción |
| Permisos | Usuario solo necesita **`CON_CTA_CENTRO_COSTO`**; no exige permiso de catálogo de cuentas ni de centros de costo |

---

## Módulos — estado de alineación

| Módulo | Estado | Acción |
|--------|--------|--------|
| Bancos | Alineado | Mantener estándar |
| Contabilidad (catálogos + partida) | Alineado | Mantener estándar |
| Compras (catálogos + documento) | Referencia | Mantener estándar |
| Selección y contratación | Legacy | Migrar al tocar; **nada nuevo fuera de estándar** |
| Otros | Revisar caso a caso | Copiar vecino alineado |

---

## Checklist Pull Request

Usar **`docs/CHECKLIST-PR-MTTO.md`** en cada PR que toque pantallas.

El revisor debe rechazar si faltan ítems obligatorios del tipo A, B o C aplicable.

---

## Referencias rápidas

| Necesidad | Archivo |
|-----------|---------|
| **Guía equipo (reunión / onboarding)** | `DOCS/GUIA-EQUIPO-MTTO.md` |
| **Plantillas IA (congeladas)** | `DOCS/plantillas/` |
| **Contrato HTTP PUT/DELETE** | `DOCS/plantillas/mtto-api-crud-http.md` |
| **Prompt crear mtto** | `DOCS/PROMPT-MTTO.md` |
| Mtto A+ | `plantillas/mtto-a-plus.md` + `General/gen-banco` |
| Mtto A+P API | [ESTANDAR-EFRAMEWORK-PAGING.md](./ESTANDAR-EFRAMEWORK-PAGING.md) |
| Estado catálogo (bit) | `plantillas/mtto-a-plus-estado-catalogo.md` |
| Estado transaccional | `plantillas/mtto-estado-transaccional.md` |
| Mtto + lookups | `Accounting/con-centro-costo` |
| Mtto + detalle | `Shop/com-documento`, `Accounting/con-partida` |
| Padre SPA | `FxAPI/CBaseComponent.component.ts` |
| Helpers mtto | `shared/mtto/` |
| Regla Cursor | `.cursor/rules/sguees-mtto-estandar.mdc` |
| Checklist PR | `docs/CHECKLIST-PR-MTTO.md` |

---

## Política de adopción

1. **Hoy:** todo desarrollo nuevo y migraciones del admin → plantilla en `DOCS/plantillas/` + `CBaseComponent`.
2. **Legacy:** migrar pantalla por pantalla al modificarla (tabla + vista); A+ para la mayoría, A+P solo si el catálogo lo justifica.
3. **Revisión:** un responsable valida checklist en PR (`docs/CHECKLIST-PR-MTTO.md`).
4. **Dudas:** elegir plantilla del paquete v1.0; comparar con piloto vivo solo para verificar detalles.

---

*Última actualización: julio 2026 — STI / UEES — v1.2 (A+, A+P, CRUD HTTP, auditoría grid, plantillas)*
