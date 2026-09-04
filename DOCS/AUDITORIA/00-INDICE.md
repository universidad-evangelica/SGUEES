# Documentación auditoría SGUEES

## Entregados

| # | Documento | Archivo |
|---|-----------|---------|
| 01 | Acta de constitución = Acuerdo del Directorio Ejecutivo | `Word/Acuerdos del Directorio Ejecutivo.pdf` |
| 02 | Cronograma Fase 1 / MVP 2027 (tablero vivo) | `Word/02-Cronograma-General-y-Fase-1-SGUEES.xlsx` |
| 03 | Roadmap / hoja de ruta ERP (mapa de oleadas 2025-2028; el % sigue en el Excel 02) | `Word/03-Roadmap-ERP-SGUEES.xlsx` |
| 04 | Organigrama + metodología Scrum + roles (PDF estilo TDR) | `Word/04-Organigrama-y-Metodologia-Scrum-SGUEES.pdf` (+ `.docx` y `Word/organigrama/*.png`) |
| 06 | Diagramas arquitectura / red-datacenter / ER (estilo zonas + SSMS) | `Word/06-Diagramas-Arquitectura-DETALLE.xlsx` + `Word/diagramas/*.png` |

## Pendientes

_(ninguno de la lista inicial)_

Regenerar:

- Cronograma 02: `powershell -ExecutionPolicy Bypass -File "DOCS/AUDITORIA/scripts/Generar-02-Cronograma-Dashboard.ps1"`
- Roadmap 03: `powershell -ExecutionPolicy Bypass -File "DOCS/AUDITORIA/scripts/Generar-03-Roadmap-Excel.ps1"`
- Organigrama / Scrum 04 (PDF): `powershell -ExecutionPolicy Bypass -File "DOCS/AUDITORIA/scripts/Generar-04-Organigrama-Metodologia.ps1"`
- Diagramas 06: `powershell -ExecutionPolicy Bypass -File "DOCS/AUDITORIA/scripts/Generar-06-Diagramas-Arquitectura.ps1"`
