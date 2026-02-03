# Cambio Obligatorio de Contraseña al Primer Login

## Descripción
Sistema que obliga a los usuarios a cambiar su contraseña temporal en el primer acceso al sistema.

## Flujo de Implementación

### 1. Base de Datos
- **Campo nuevo**: `REQUIERE_CAMBIO_CLAVE` (bit) en tabla `SEG_USUARIO`
- **Script de migración**: `SGUEES-DB/Scripts/ADD_REQUIERE_CAMBIO_CLAVE.sql`
- **SP actualizado**: `PRAL_MTTO_SEG_USUARIO_CAMBIO_CLAVE` ahora pone el flag en 0 al cambiar contraseña

**Ejecutar el script:**
```sql
-- En SSMS o tu cliente SQL preferido
USE SGUEES;
GO
EXEC sp_executesql N'
-- Script del archivo ADD_REQUIERE_CAMBIO_CLAVE.sql
';
```

### 2. Backend (.NET)

#### Modelos actualizados:
- `SEG_USUARIOView.cs`: Propiedad `REQUIERE_CAMBIO_CLAVE`
- `SEG_USUARIOTable.cs`: Propiedad `REQUIERE_CAMBIO_CLAVE`
- `SEG_USUARIO_LOGINView.cs`: Propiedad `REQUIERE_CAMBIO_CLAVE`

#### Lógica en `SEG_USUARIOService`:
- **`LoginAsync`**: Devuelve el flag `REQUIERE_CAMBIO_CLAVE` en la respuesta
- **`GenerateTokenAsync`**: Incluye el flag en el token de respuesta
- **`CambioClave`**: El SP automáticamente desactiva el flag al cambiar contraseña

#### Crear usuario con contraseña temporal:
Cuando creas un usuario, asigna `REQUIERE_CAMBIO_CLAVE = true`:

```csharp
var nuevoUsuario = new SEG_USUARIOTable
{
    LOGIN_SISTEMA = "nuevo.usuario",
    NOMBRE_USUARIO = "Nuevo Usuario",
    CORREO_ELECTRONICO = "nuevo@uees.edu.sv",
    REQUIERE_CAMBIO_CLAVE = true, // ← Marcar para cambio obligatorio
    // ... otros campos
};
```

### 3. Frontend (Angular)

#### Detectar flag en login:
```typescript
// En tu servicio de autenticación
login(credentials): Observable<any> {
  return this.http.post('/api/SEG_USUARIO/login', credentials)
    .pipe(
      map((response: SEG_USUARIO_LOGINView) => {
        // Guardar token y datos usuario
        localStorage.setItem('token', response.TOKEN);
        localStorage.setItem('user', JSON.stringify(response));
        
        // Verificar si requiere cambio de contraseña
        if (response.REQUIERE_CAMBIO_CLAVE) {
          // Redirigir a pantalla de cambio obligatorio
          this.router.navigate(['/cambio-clave-obligatorio']);
        } else {
          // Ir al home normal
          this.router.navigate(['/home']);
        }
        
        return response;
      })
    );
}
```

#### Guard para forzar el cambio:
```typescript
// cambio-clave.guard.ts
export class CambioClaveGuard implements CanActivate {
  canActivate(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user && user.REQUIERE_CAMBIO_CLAVE) {
      // No permitir navegar a otras rutas hasta cambiar clave
      this.router.navigate(['/cambio-clave-obligatorio']);
      return false;
    }
    
    return true;
  }
}
```

#### Componente de cambio obligatorio:
```typescript
// cambio-clave-obligatorio.component.ts
export class CambioClaveObligatorioComponent implements OnInit {
  
  cambiarClave(form: any) {
    const payload = {
      LOGIN_SISTEMA: this.currentUser.LOGIN_SISTEMA,
      CLAVE_USUARIO_ACTUAL: form.claveActual,
      CLAVE_USUARIO_NUEVA: form.claveNueva,
      CODIGO_SUITE: this.currentUser.CODIGO_SUITE
    };
    
    this.authService.cambiarClave(payload).subscribe(
      (response) => {
        if (response.Result) {
          // Actualizar usuario en localStorage
          this.currentUser.REQUIERE_CAMBIO_CLAVE = false;
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          
          // Redirigir al home
          this.router.navigate(['/home']);
        }
      }
    );
  }
  
  // NO permitir cerrar el modal o cancelar
  // Única opción: cambiar contraseña
}
```

#### Routing:
```typescript
const routes: Routes = [
  {
    path: 'cambio-clave-obligatorio',
    component: CambioClaveObligatorioComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [CambioClaveGuard] // ← Verifica que no requiera cambio
  },
  // ... otras rutas protegidas con el guard
];
```

## Flujo Completo

1. **Admin crea usuario** → `REQUIERE_CAMBIO_CLAVE = 1`
2. **Usuario hace login** → Backend devuelve `REQUIERE_CAMBIO_CLAVE: true`
3. **Frontend detecta flag** → Redirige a pantalla de cambio obligatorio
4. **Guard bloquea navegación** → No puede ir a otras pantallas
5. **Usuario cambia contraseña** → SP pone `REQUIERE_CAMBIO_CLAVE = 0`
6. **Frontend actualiza usuario** → Permite navegar normalmente

## Endpoint API

### Login
```
POST /api/SEG_USUARIO/login
Body: { LOGIN_SISTEMA, CLAVE_USUARIO, CODIGO_SUITE }
Response: {
  ...
  REQUIERE_CAMBIO_CLAVE: true/false
}
```

### Cambio de Clave
```
POST /api/SEG_USUARIO/CambioClave
Body: {
  LOGIN_SISTEMA,
  CLAVE_USUARIO_ACTUAL,
  CLAVE_USUARIO_NUEVA,
  CODIGO_SUITE
}
```

## Notas de Seguridad

- La contraseña temporal debe ser única (ej: LOGIN_SISTEMA o aleatoria)
- Al cambiar contraseña, validar que la nueva cumple políticas de seguridad
- El flag se desactiva automáticamente al cambiar contraseña
- Usuario NO puede evadir el cambio de contraseña mediante guards en el frontend
