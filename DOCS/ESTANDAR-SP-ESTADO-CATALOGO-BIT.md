# Estándar — SP genérico Activar / Inactivar (estado catálogo `bit`)

**Versión:** 1.2 — julio 2026  
**Alcance:** catálogos maestros con `ESTADO_* bit` — extiende A+ o A+P  
**Plantilla SPA/API:** [plantillas/mtto-a-plus-estado-catalogo.md](./plantillas/mtto-a-plus-estado-catalogo.md)  
**No aplica:** documentos con estado `varchar` (`DI`, `AP`, `AN`)

---

## Idea general

| Capa | Responsabilidad |
|------|-----------------|
| **BD** | SP lee bit actual e **invierte** + auditoría |
| **Repository** | Constantes tabla/PK/campo estado; `ActivarInactivarAsync` inline (como `SolicitarAsync`) |
| **API** | Un endpoint `Put ActivarInactivar` |
| **SPA** | Un método `activar_inactivar()`; xWhere con PK (como `delete`) |

El cliente HTTP **no** envía nombre de tabla ni campo estado — solo la PK del documento.

---

## Objetos BD

| Objeto | Archivo |
|--------|---------|
| SP | `SGUEES-DB/Programmability/Procedures/dbo.PRAL_MTTO_CATALOGO_ESTADO_BIT.sql` |
| Deploy | `SGUEES-DB/Scripts/DEPLOY_SP_CATALOGO_ESTADO_BIT.sql` |

### Parámetros del SP

| Parámetro | Uso |
|-----------|-----|
| `@NOMBRE_TABLA` | Tabla destino |
| `@CAMPO_PK` | PK del registro |
| `@CAMPO_ESTADO` | Campo `bit` |
| `@USA_EMPRESA` | `1` = filtrar por `CORR_EMPRESA` |
| `@CORR_EMPRESA` | Empresa sesión |
| `@CORR_RELATIVO` | Valor de la PK |
| `@SYS_LOGIN_USUARIO` / `@SYS_ESTACION` | Auditoría |
| `@SYS_FILAS_AFECTADAS` | OUTPUT |
| `@SYS_NUMERO_ERROR` | OUTPUT — `0` = OK |
| `@SYS_MENSAJE_ERROR` | OUTPUT |

El SP **no** recibe valor destino: lee el bit en BD y alterna true ↔ false.

### Códigos de error (negocio)

| Código | Significado |
|--------|-------------|
| `0` | Éxito |
| `30001` | PK inválida |
| `30003` | Tabla/campos no válidos |
| `30004` | Falta empresa |
| `30005` | Registro no existe |
| `30006` | Sin filas actualizadas |

---

## API — repository

Ver esqueleto completo en [mtto-a-plus-estado-catalogo.md](./plantillas/mtto-a-plus-estado-catalogo.md).

**Importante:** tras `ExecCmd`, usar `RowsAffected = 1` en éxito (como `SolicitarAsync`). **No** leer `@SYS_FILAS_AFECTADAS` en C# — puede no estar en la colección de parámetros del cliente.

---

## Checklist al adoptar el SP

- [ ] Tabla con `bit` + auditoría estándar
- [ ] Deploy SP en BD destino
- [ ] Constantes en repository (`_TableName`, `_CampoPk`, `_CampoEstado`, `_UsaEmpresa`, `_ViewName`)
- [ ] `ActivarInactivarAsync` inline (no `UpdateAsync` del body)
- [ ] Controller `Put ActivarInactivar` + `ApplyQueryKeys`
- [ ] SPA: `activar_inactivar` + `activarInactivar` en service/repo

---

Ver también: [ESTANDAR-MTTO.md](./ESTANDAR-MTTO.md) · [mtto-api-crud-http.md](./plantillas/mtto-api-crud-http.md)
