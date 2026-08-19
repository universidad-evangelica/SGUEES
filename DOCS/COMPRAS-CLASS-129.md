# Compras — acceso a CLASS / e-AdminFE en servidor 129

SGUEES vive en **192.168.0.250**. Inventario, proveedores (CLIENTES), órdenes de compra y catálogos legacy están en **192.168.1.129**:

| Base remota   | Contenido típico                          |
|---------------|-------------------------------------------|
| `CLASS_UEES`  | CLIENTES, INVENTARIOS, ORDENCOMPRA, CODIGOS |
| `e-AdminFE`   | GEN_TIPO_DIP, GEN_FORMA_PAGO, FE/JSON     |

**No se restaura CLASS en 250.** SQL Server en 250 usa **linked servers** y consultas de **4 partes**.

## Tabla de instancias (`SYS_INSTANCIA_REMOTA`)

Servidor, usuario, clave y nombre de base **no van hardcodeados** en scripts: se guardan en SGUEES y un SP crea/actualiza los linked servers.

| Columna | Ejemplo |
|---------|---------|
| `CODIGO_INSTANCIA` | `CLASS_UEES`, `EADMINFE` |
| `NOMBRE_LINKED_SERVER` | Nombre fijo en SQL (`CLASS_UEES`, `EADMINFE`) — **no cambiar** (vistas/SP lo usan) |
| `SERVIDOR` | `192.168.1.129` |
| `NOMBRE_BASE_DATOS` | `CLASS_UEES`, `e-AdminFE` |
| `USUARIO_SQL` / `CLAVE_SQL` | Credenciales remotas |

Consulta sin clave (mantenimiento):

```sql
SELECT * FROM V_SYS_INSTANCIA_REMOTA;
```

Tras editar la tabla:

```sql
EXEC dbo.PRAL_ADMIN_SYNC_INSTANCIA_REMOTA;
-- o una sola:
EXEC dbo.PRAL_ADMIN_SYNC_INSTANCIA_REMOTA @CODIGO_INSTANCIA = 'CLASS_UEES';
```

**Seguridad:** `CLAVE_SQL` es sensible; restringir `SELECT`/`UPDATE` en `SYS_INSTANCIA_REMOTA` a administradores BD.

## Configuración inicial (una vez por servidor SGUEES)

Desde `SGUEES-DB/Scripts`:

```powershell
cd "C:\Desarrollo GIT\SGUEES\SGUEES-DB\Scripts"
sqlcmd -S 192.168.0.250 -U erp -d SGUEES -f 65001 -i SETUP_SYS_INSTANCIA_REMOTA.sql
```

Scripts legacy `SETUP_CLASS_UEES_LINKED_SERVER.sql` y `SETUP_E_ADMIN_FE_LINKED_SERVER.sql` redirigen al script unificado.

Verificación:

```sql
-- CLASS
SELECT TOP 1 CLIIDU FROM CLASS_UEES.CLASS_UEES.dbo.CLIENTES;

-- e-AdminFE
SELECT TOP 1 CORR_TIPO_DIP FROM [EADMINFE].[e-AdminFE].dbo.GEN_TIPO_DIP;
```

## Convención de nombres en vistas/SP

| Incorrecto (busca BD local en 250) | Correcto (linked server)        |
|------------------------------------|---------------------------------|
| `[CLASS_UEES].dbo.CLIENTES`        | `[CLASS_UEES].[CLASS_UEES].dbo.CLIENTES` |
| `CLASS_UEES.dbo.ORDENCOMPRA`       | `CLASS_UEES.CLASS_UEES.dbo.ORDENCOMPRA`  |
| `[e-AdminFE].dbo.GEN_TIPO_DIP`     | `[EADMINFE].[e-AdminFE].dbo.GEN_TIPO_DIP` |

La API **no** lleva connection string a CLASS: todo pasa por SGUEES en 250.

## Despliegue pantallas Compras (proveedor, etc.)

Tras linked servers + vistas corregidas:

```powershell
sqlcmd -S 192.168.0.250 -U erp -d SGUEES -f 65001 -i DEPLOY_COMPRAS_LINKED_129.sql
```

## Pantalla Proveedor

- Vista principal: `V_COM_PROVEEDOR` (CLASS CLIENTES + extensión `COM_PROVEEDOR` en SGUEES).
- SP: `PRAL_DATA_COM_PROVEEDOR` / `PRAL_MTTO_COM_PROVEEDOR`.
- Combos: `V_GEN_TIPO_DIP`, `V_GEN_FORMA_PAGO`, `V_COM_ACTIVIDAD_ECONOMICA` (CLASS CODIGOS).

Si falla con *objeto no válido*, revisar linked server y que la vista use nombres de 4 partes.
