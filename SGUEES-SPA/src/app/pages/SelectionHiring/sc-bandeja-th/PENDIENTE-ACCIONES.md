# Pendiente — Acciones panel Bandeja TH (SPA)

**No conectar todavía.** Grids Requisiciones y Candidatos ya consumen API.
Siguiente fase: detalle de acciones del panel derecho.

## Botones ya visibles (solo stubs con notify)

| Estado ciclo | Botón | Conectar a |
|---|---|---|
| `POSTULANTE` | Asociar expediente | `ScExpedienteCandidatoService.asociarSolicitud` |
| `CON_EXPEDIENTE` | Activar proceso de selección | `ScExpedienteCandidatoService.activarProcesoSeleccion` (estado 2 → todas las req. del expediente) |
| `EN_SELECCION` + decisión `PENDIENTE` | Aplica / No aplica | `ScRequisicionCandidatoService.decide` |
| Cualquiera | Ver detalle | Deep link según ciclo (`/sc-solicitud-empleo`, `/sc-expediente-candidato`, `/sc-requisicion-personal`) |
| Candidato | Historial | Lazy load ciclo candidato (hoy solo bitácora de requisición) |

## Stage Contrato

Aún mock / sin API. Carpeta API: `SC_BANDEJA_TH_CONTRATO/`.

Ver también: `SGUEES-API/sguees.api/Options/SelectionHiring/SC_BANDEJA_TH/PENDIENTE-ACCIONES.md`
