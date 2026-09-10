# Pendiente — Acciones del panel (Bandeja TH)

> No implementar aún. Grids Requisiciones / Candidatos / Contrataciones ya alimentan.

## Frontera de stages (opción A)

| Stage | Incluye |
|---|---|
| Candidatos | `POSTULANTE`, `CON_EXPEDIENTE`, `EN_SELECCION`, `NO_APLICA` |
| Contrataciones | Solo `APLICA` (lista para movimiento personal) |

`NO_APLICA` **permanece en Candidatos** (cierre del ciclo de selección). No va a Contrataciones.

## Stage Candidatos — acciones

| Estado | Botón | Endpoint |
|---|---|---|
| `POSTULANTE` | Asociar expediente | `SC_EXPEDIENTE_CANDIDATO/AsociarSolicitud` |
| `CON_EXPEDIENTE` | Activar proceso de selección | `SC_EXPEDIENTE_CANDIDATO/ActivarProcesoSeleccion` |
| `EN_SELECCION` + `PENDIENTE` | Aplica / No aplica | `SC_REQUISICION_CANDIDATO/Decide` |

## Stage Contrato — acciones

| Estado | Botón | Nota |
|---|---|---|
| `APLICA` | Ejecutar movimiento personal | Standby hasta existir proceso de contrato |

También: deep link «Ver detalle»; historial lazy.
