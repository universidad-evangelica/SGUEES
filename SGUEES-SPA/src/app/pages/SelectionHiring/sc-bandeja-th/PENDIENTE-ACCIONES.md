# Pendiente — Acciones panel Bandeja TH (SPA)

**No conectar todavía.** Grids Requisiciones, Candidatos y Contrataciones ya consumen API.

## Frontera stages (opción A)

| Stage | Estados |
|---|---|
| Candidatos | `POSTULANTE`, `CON_EXPEDIENTE`, `EN_SELECCION`, `NO_APLICA` |
| Contrataciones | Solo `APLICA` → listo para movimiento personal |

`NO_APLICA` se queda en **Candidatos** (cierre del ciclo). No va a Contrataciones.

## Botones visibles (stubs)

| Stage / estado | Botón | Conectar a |
|---|---|---|
| Candidatos · `POSTULANTE` | Asociar expediente | `ScExpedienteCandidatoService.asociarSolicitud` |
| Candidatos · `CON_EXPEDIENTE` | Activar proceso de selección | `ScExpedienteCandidatoService.activarProcesoSeleccion` |
| Candidatos · `EN_SELECCION` | Aplica / No aplica | `ScRequisicionCandidatoService.decide` |
| Contrataciones · `APLICA` | Ejecutar movimiento personal | Standby (proceso contrato) |
| Cualquiera | Ver detalle | Deep link: REQ → `/sc-requisicion-personal?corr=`; Candidato → expediente (permiso R) |

Ver también: `SGUEES-API/.../SC_BANDEJA_TH/PENDIENTE-ACCIONES.md`
