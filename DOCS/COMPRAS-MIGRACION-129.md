# Compras — migración datos SUEES (129) → SGUEES (250)

## Resumen

- **Origen (solo lectura):** `192.168.1.129` / base `SUEES` (CSUEES)
- **Destino:** `192.168.0.250` / base `SGUEES`
- **Regla:** no se modifica nada en 129; linked server `SUEES129` solo consulta.

## Scripts

| Script | Propósito |
|--------|-----------|
| `ADD_SUEES129_INSTANCIA_REMOTA.sql` | Registra instancia + linked server `SUEES129` |
| `PREP_MIGRATE_COM_FROM_SUEES_129.sql` | `COM_TIPO_DOC_FISICO`, `CLA_COM_PROVEEDOR_SECTOR`, `CORR_ACTIVIDAD_ECONOMICA` varchar, `V_GEN_SECTOR` |
| `MIGRATE_COM_DATA_FROM_SUEES_129.sql` | Copia 32 tablas `COM_*` + sectores proveedor |
| `RUN_MIGRATE_COMPRAS_FROM_129.ps1` | Orquestador completo |

## Ejecución

```powershell
cd "C:\Desarrollo GIT\SGUEES\SGUEES-DB\Scripts"
powershell -File RUN_MIGRATE_COMPRAS_FROM_129.ps1
```

## Validación (última corrida)

Todos los conteos **129 = 250** para tablas `COM_*` y `CLA_COM_PROVEEDOR_SECTOR` (~147k filas totales).

Datos que **siguen en 129** vía linked server (no migrados como tablas locales):

- `CLASS_UEES` — CLIENTES, ORDENCOMPRA, CODIGOS
- `e-AdminFE` — GEN_SECTOR, GEN_TIPO_DIP, COM_JSON, DTE

Ver `DOCS/COMPRAS-CLASS-129.md`.

## Cambios CSUEES aplicados en SGUEES

| Área | Cambio |
|------|--------|
| BD | `PRAL_MTTO_COM_PROVEEDOR` — `CORR_ACTIVIDAD_ECONOMICA` varchar(10), `@CORR_SECTOR` |
| API | Módulo `GEN_SECTOR` (lookups compras), `CORR_SECTOR` en proveedor |
| SPA | Campo **Sector** en `com-proveedor` |

## Re-ejecutar sincronización

El script es **destructivo en 250** (borra `COM_*` locales y recarga). Seguro para 129.

```powershell
sqlcmd -S 192.168.0.250 -U erp -d SGUEES -f 65001 -i MIGRATE_COM_DATA_FROM_SUEES_129.sql
```
