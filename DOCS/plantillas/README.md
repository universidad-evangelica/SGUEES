# Plantillas congeladas — Mantenimientos SGUEES

**Versión del paquete:** 1.2 — julio 2026

Estas plantillas son la **fuente de verdad para IA y programadores** al crear o migrar pantallas.  
**No copiar línea por línea** `gen-banco` ni `sc-impacto-economico` en código vivo: esas pantallas son **piloto** y pueden cambiar.

**Para explicar el estándar al equipo:** [../GUIA-EQUIPO-MTTO.md](../GUIA-EQUIPO-MTTO.md)

| Archivo | Cuándo usarlo |
|---------|----------------|
| [mtto-a-plus.md](./mtto-a-plus.md) | Catálogo simple, datos en memoria, paginado cliente |
| [mtto-a-plus-estado-catalogo.md](./mtto-a-plus-estado-catalogo.md) | Catálogo activo/inactivo — toolbar v1.1 + badge verde/rojo |
| [mtto-a-p-paginado.md](./mtto-a-p-paginado.md) | Catálogo grande, paginado servidor, auditoría en grid |
| [mtto-api-crud-http.md](./mtto-api-crud-http.md) | **PUT/DELETE** — `CData.Put` + `ApplyQueryKeys` (todos los mttos) |
| [mtto-estado-transaccional.md](./mtto-estado-transaccional.md) | Documentos/partidas — estado `varchar`, flujo propio |

**Documento maestro:** [../ESTANDAR-MTTO.md](../ESTANDAR-MTTO.md)  
**Prompt IA:** [../PROMPT-MTTO.md](../PROMPT-MTTO.md)

### Referencias vivas (solo comparar)

| Piloto | Tipo |
|--------|------|
| `SGUEES-SPA/.../General/gen-banco` | A+ |
| `SGUEES-SPA/.../SelectionHiring/sc-impacto-economico` | A+P + estado catálogo |

### Versionado

Al cambiar el estándar, incrementar versión en el encabezado de cada plantilla afectada (v1.1, v2.0) sin borrar la anterior hasta migrar el equipo.
