# Pendiente — Acciones del panel (Bandeja TH)

> No implementar aún. Primero alimentar grids; luego conectar acciones.

## Stage Candidatos (siguiente detalle)

Cuando el panel derecho se abre según `ESTADO_CICLO_CANDIDATO`, conectar:

| Estado | Botón | Endpoint existente | Permiso consumidor sugerido |
|---|---|---|---|
| `POSTULANTE` | Asociar expediente | `SC_EXPEDIENTE_CANDIDATO/AsociarSolicitud` | `/sc-bandeja-th\|U` (o reutilizar `/sc-solicitud-empleo\|U`) |
| `CON_EXPEDIENTE` | Activar proceso de selección | `SC_EXPEDIENTE_CANDIDATO/ActivarProcesoSeleccion` | `/sc-bandeja-th\|U` |
| `EN_SELECCION` + `PENDIENTE` | Aplica / No aplica | `SC_REQUISICION_CANDIDATO/Decide` | `/sc-bandeja-th\|U` (solo solicitante de la requisición) |

También:

- Deep link «Ver detalle» → `/sc-solicitud-empleo` o `/sc-expediente-candidato` o `/sc-requisicion-personal` según ciclo.
- Historial lazy del ciclo candidato (hoy solo bitácora de requisición).

## Stage Contrato

Carpeta `SC_BANDEJA_TH_CONTRATO/` reservada. Grid + movimiento personal / contrato pendiente.
