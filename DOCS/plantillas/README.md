# Plantillas congeladas — Mantenimientos SGUEES



**Versión del paquete:** 1.3 — julio 2026



Estas plantillas son la **fuente de verdad para IA y programadores** al crear o migrar pantallas.  

**No copiar línea por línea** `gen-banco` ni `sc-impacto-economico` en código vivo: esas pantallas son **piloto** y pueden cambiar.



**Para explicar el estándar al equipo:** [../GUIA-EQUIPO-MTTO.md](../GUIA-EQUIPO-MTTO.md)



| Archivo | Cuándo usarlo |

|---------|----------------|

| [mtto-a-plus.md](./mtto-a-plus.md) | Catálogo simple, datos en memoria, paginado cliente |

| [mtto-a-p-paginado.md](./mtto-a-p-paginado.md) | Catálogo grande, paginado servidor, auditoría en grid |

| [mtto-a-plus-estado-catalogo.md](./mtto-a-plus-estado-catalogo.md) | **Extensión** activo/inactivo (`bit`) — combinar con **A+** o **A+P** |

| [mtto-api-crud-http.md](./mtto-api-crud-http.md) | **PUT/DELETE** — `CData.Put` + `ApplyQueryKeys` (todos los mttos) |

| [mtto-estado-transaccional.md](./mtto-estado-transaccional.md) | Documentos/partidas — estado `varchar`, flujo propio |



**SP estado catálogo:** [../ESTANDAR-SP-ESTADO-CATALOGO-BIT.md](../ESTANDAR-SP-ESTADO-CATALOGO-BIT.md)



**Documento maestro:** [../ESTANDAR-MTTO.md](../ESTANDAR-MTTO.md)  

**Prompt IA:** [../PROMPT-MTTO.md](../PROMPT-MTTO.md)



### Referencias vivas (solo comparar)



| Piloto | Tipo |

|--------|------|

| `SGUEES-SPA/.../General/gen-banco` | A+ |

| `SGUEES-SPA/.../SelectionHiring/sc-impacto-economico` | A+P + estado catálogo |



### Estado catálogo en las dos plantillas base



Tanto **A+** como **A+P** pueden tener campo `ESTADO_* bit`. La plantilla base no cambia; se **añade** [mtto-a-plus-estado-catalogo.md](./mtto-a-plus-estado-catalogo.md) como extensión opcional.



### Versionado



Al cambiar el estándar, incrementar versión en el encabezado de cada plantilla afectada (v1.3, v2.0) sin borrar la anterior hasta migrar el equipo.


