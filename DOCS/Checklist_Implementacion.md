# ✅ Checklist: Implementación del Sistema de Expiración de Contraseñas

## 📋 CAMBIOS EN BASE DE DATOS

### Paso 1: Tabla SEG_PARAMETRO ✓
```sql
-- Crear tabla (si no existe)
-- Columnas: CORR_EMPRESA, CANTIDA_MESES_EXPIRA_CONTRASEÑA
```
**Status**: ⏳ Por ejecutar
**Archivo**: `Cambios_Sistema_Expiracion_Contrasena.sql` (Paso 1)

---

### Paso 2: Columna FECHA_CAMBIO_CLAVE en SEG_USUARIO ✓
```sql
-- Agregar columna FECHA_CAMBIO_CLAVE DATETIME NULL
-- Inicializar con FECHA_CREACION para usuarios existentes
```
**Status**: ⏳ Por ejecutar
**Archivo**: `Cambios_Sistema_Expiracion_Contrasena.sql` (Paso 2)

---

### Paso 3: Insertar Datos en SEG_PARAMETRO ✓
```sql
-- Para cada empresa: insertar CANTIDA_MESES_EXPIRA_CONTRASEÑA = 6 (6 meses por defecto)
```
**Status**: ⏳ Por ejecutar
**Archivo**: `Cambios_Sistema_Expiracion_Contrasena.sql` (Paso 3)

---

### Paso 4: Actualizar SP PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE ✓
```sql
-- Agregar en UPDATE:
--   FECHA_CAMBIO_CLAVE = GETDATE()
--   FLAG_PRIMER_LOGIN = 0
```
**Status**: ✅ Ya actualizado
**Archivo**: `SGUEES-DB/Programmability/Procedures/dbo.PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE.sql`

---

### Paso 5: Crear/Actualizar SP PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE ✓
```sql
-- Este SP valida si una contraseña ha expirado
-- Usa: FECHA_CAMBIO_CLAVE + CANTIDA_MESES_EXPIRA_CONTRASEÑA
```
**Status**: ✅ Archivo creado
**Archivo**: `SGUEES-DB/Stored Procedures/PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE.sql`

---

## 💻 CAMBIOS EN CÓDIGO C#

### API - SEG_USUARIORepository ✓
**Status**: ✅ Sin cambios (ya funcional)

### API - SEG_USUARIOService ✓
**Status**: ✅ Sin cambios en interfaz (ya llama al SP correctamente)

### Interfaz - ISEG_USUARIORepository ✓
**Status**: ✅ Sin cambios

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

1. **Ejecutar scripts SQL** (en este orden):
   ```
   ├─ Cambios_Sistema_Expiracion_Contrasena.sql
   ├─ PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE.sql (verificar)
   ├─ PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE.sql
   └─ Verificar integridad
   ```

2. **Compilar proyecto API**
   - No hay cambios en la interfaz pública
   - Los métodos ya existen y funcionan

3. **Desplegar aplicación**

4. **Pruebas**

---

## 🧪 VALIDACIONES RÁPIDAS

### Verificar tabla SEG_PARAMETRO
```sql
SELECT * FROM SEG_PARAMETRO
```
Debe retornar al menos 1 registro por empresa

### Verificar columna FECHA_CAMBIO_CLAVE
```sql
SELECT COUNT(*) FROM SEG_USUARIO WHERE FECHA_CAMBIO_CLAVE IS NOT NULL
```
Debe retornar todos los usuarios (inicializado con FECHA_CREACION)

### Verificar SP de expiración
```sql
EXEC PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE @LOGIN_SISTEMA = 'admin'
```
Debe retornar resultado con: LOGIN_SISTEMA, REQUIERE_CAMBIO_CLAVE, DIAS_PARA_EXPIRAR, etc.

### Verificar SP de cambio
```sql
-- Antes de cambio:
SELECT FECHA_CAMBIO_CLAVE FROM SEG_USUARIO WHERE LOGIN_SISTEMA = 'usuario.test'

-- Después de ejecutar PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE:
-- FECHA_CAMBIO_CLAVE debe actualizarse a GETDATE()
```

---

## 📝 RESUMEN VISUAL

```
FLUJO DE EXPIRACIÓN DE CONTRASEÑA
═════════════════════════════════

1. USUARIO HACE LOGIN
        ↓
2. SP ValidarExpiracionClaveAsync() es llamado
        ↓
3. Lee CANTIDA_MESES_EXPIRA_CONTRASEÑA de SEG_PARAMETRO
        ↓
4. Calcula: FECHA_EXPIRACION = FECHA_CAMBIO_CLAVE + MESES
        ↓
5. Compara FECHA_EXPIRACION con HOY
        ├─ Si EXPIRADA: REQUIERE_CAMBIO_CLAVE = true
        ├─ Si POR_EXPIRAR (< 7 días): Mostrar aviso
        └─ Si VIGENTE: Continuar login
        ↓
6. Si REQUIERE_CAMBIO: Mostrar modal de cambio
        ↓
7. USUARIO CAMBIA CONTRASEÑA
        ↓
8. SP PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE actualiza:
        ├─ CLAVE_USUARIO (hash)
        ├─ CLAVE_USUARIO_SAL
        └─ FECHA_CAMBIO_CLAVE = GETDATE()  ← IMPORTANTE
        ↓
9. Login completo, usuario dentro del sistema
```

---

## ⚠️ PUNTOS CRÍTICOS

| Punto | Descripción | Acción |
|-------|-------------|--------|
| **SEG_PARAMETRO** | Debe existir y tener datos para cada empresa | Ejecutar Paso 1-3 |
| **FECHA_CAMBIO_CLAVE** | Debe estar en SEG_USUARIO | Ejecutar Paso 2 |
| **SP Cambio Clave** | Debe actualizar FECHA_CAMBIO_CLAVE | Verificar y actualizar |
| **SP Expiración** | Debe existir y ser funcional | Ejecutar Paso 5 |
| **SEG_PARAMETRO con valor 0** | Significa "no expira" | Configuración válida |

---

## 📞 PREGUNTAS FRECUENTES

**P: ¿Qué pasa si no configuro SEG_PARAMETRO?**
R: Las contraseñas no expirarán. El sistema funcionará pero sin validación de expiración.

**P: ¿Puedo tener diferentes vigencias por empresa?**
R: Sí, cada empresa tiene su propia fila en SEG_PARAMETRO con su CANTIDA_MESES_EXPIRA_CONTRASEÑA.

**P: ¿Qué pasa si CANTIDA_MESES_EXPIRA_CONTRASEÑA = 0 o NULL?**
R: Las contraseñas no expiran para esa empresa.

**P: ¿El código C# necesita cambios?**
R: No, ya está listo. Solo necesita que ejecutes los scripts SQL.

---

## ✅ CHECKLIST FINAL

- [ ] Ejecutar `Cambios_Sistema_Expiracion_Contrasena.sql`
- [ ] Verificar que SEG_PARAMETRO tiene datos
- [ ] Verificar que FECHA_CAMBIO_CLAVE existe en SEG_USUARIO
- [ ] Verificar que PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE actualiza FECHA_CAMBIO_CLAVE
- [ ] Ejecutar PRAL_DATA_SEG_USUARIO_VALIDAR_EXPIRACION_CLAVE.sql
- [ ] Compilar API (sin cambios necesarios)
- [ ] Desplegar aplicación
- [ ] Probar: Usuario hace login y le pide cambiar contraseña si está expirada
- [ ] Probar: Usuario cambia contraseña y se actualiza FECHA_CAMBIO_CLAVE
- [ ] Verificar: Nueva validación de expiración funciona correctamente

---

**Creado**: 03 de febrero de 2026
