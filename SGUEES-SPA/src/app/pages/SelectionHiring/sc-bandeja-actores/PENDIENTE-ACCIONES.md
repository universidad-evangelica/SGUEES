# Bandeja actores — recordatorios

## Reglas
- Requisiciones: `SEG_FLUJO_NOTIFICACION` con `LOGIN_SISTEMA_DESTINO` = JWT y `PROCESADO = 0`.
- Candidatos: `EN_SELECCION` + decisión pendiente + jefe activo de la **misma unidad** de la requisición.
- Dictamen Decide: validación de jefatura en API (ya no el creador de la requisición).

## Acciones conectadas
| Botón | Endpoint |
|---|---|
| Aprobar / Devolver / Rechazar | `PUT SC_BANDEJA_ACTORES/AutorizaRequisicion` → SP Autoriza |
| Aplica / No aplica | `POST SC_BANDEJA_ACTORES/DecideCandidato` |

## Menú
Ejecutar `SGUEES-DB/Scripts/MENU_SC_BANDEJA_ACTORES.sql` con `-f 65001` y reingresar sesión.
