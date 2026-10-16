# SGUEES — Contexto para SignalR

Snapshot del estado actual del proyecto (sin SignalR instalado todavía).  
Equivalente a `TuProyecto.API` = `sguees.api`.

---

## 1. Autenticación (resumen)

| Capa | Mecanismo |
|------|-----------|
| **API** | **JWT Bearer** (`Microsoft.AspNetCore.Authentication.JwtBearer`) |
| **SPA** | **JWT** vía `@auth0/angular-jwt`; token en `localStorage` (`token`) |
| **Login / identidad** | Credenciales propias + opcional **Active Directory** (LDAP) para validar usuario; el API emite JWT |
| **Autorización** | Policies por scope (`/ruta\|R/C/U/D`) con `AuthorizationPolicyProvider` + `HasScopeHandler` |

**No usamos:** Cookie auth, Identity UI, OAuth/OpenID Connect externo, ni Azure AD como esquema principal.

### Clave JWT (API)

- Scheme: `JwtBearerDefaults.AuthenticationScheme`
- Firma simétrica: `AppSetting:Token` (appsettings)
- `ValidateIssuer = false`, `ValidateAudience = false`
- Pipeline: `UseAuthentication()` → `UseAuthorization()` → `MapControllers()`

### Implicación para SignalR

WebSockets no envían bien el header `Authorization`. Con JWT hay que pasar el token en:

- query string `access_token` en el negotiate/handshake, **o**
- `accessTokenFactory` en el cliente `@microsoft/signalr`

y en el API, en `AddJwtBearer`, manejar `OnMessageReceived` para hubs.

Hoy **no hay** `AddSignalR`, `MapHub`, ni paquete `@microsoft/signalr` en el SPA.

---

## 2. `sguees.api.csproj`  
Ruta: `SGUEES-API/sguees.api/sguees.api.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>disable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
    <PackageReference Include="NetCore.AutoRegisterDi" Version="2.1.0" />
    <PackageReference Include="MailKit" Version="4.18.1" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
    <PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.23.0" />
    <PackageReference Include="System.DirectoryServices.AccountManagement" Version="8.0.0" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\eFramework\eFramework.csproj" />
    <ProjectReference Include="..\eFrameworkAPI\eFrameworkAPI.csproj" />
  </ItemGroup>
  <!-- Folders omitidos: no relevantes para SignalR -->
</Project>
```

Notas:

- Target: **.NET 8**
- JWT ya referenciado
- **Falta** paquete SignalR cliente solo si se usara desde otro proceso; en ASP.NET Core 8 el server SignalR viene en el shared framework (`Microsoft.AspNetCore.App`) — no hace falta NuGet extra para hubs básicos.

---

## 3. `Program.cs`  
Ruta: `SGUEES-API/sguees.api/Program.cs`

```csharp
using System.Net;
using System.Text;
using sguees.api.framework;
using sguees.api.Policies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using NetCore.AutoRegisterDi;
using sguees.api.Data;
using sguees.api.Shared;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = null;
                    options.JsonSerializerOptions.Converters.Add(new DateTimeConverter());    
                    options.JsonSerializerOptions.Converters.Add(new StringConverter());    
                });

// ... registros DI (DB, storage, AI, Swagger, Repositories/Services) ...

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII
            .GetBytes(builder.Configuration.GetSection("AppSetting:Token").Value)),
            ValidateIssuer = false,
            ValidateAudience = false
    };
});

builder.Services.AddAuthorization();            
builder.Services.AddSingleton<IAuthorizationPolicyProvider, AuthorizationPolicyProvider>();
builder.Services.AddSingleton<IAuthorizationHandler, HasScopeHandler>();

var app = builder.Build();

// ... Swagger / ExceptionHandler ...

var allowedOrigins = builder.Configuration.GetSection("AppSetting:AllowedOrigins").Get<string[]>()
    ?? new[] { builder.Configuration.GetSection("AppSetting:clientURL").Value ?? "http://localhost:4200" };

app.UseCors(options => options.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader());

app.UseMiddleware<RateLimitingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

Notas para SignalR (cuando se implemente):

1. `builder.Services.AddSignalR();`
2. Extender `AddJwtBearer` con `OnMessageReceived` si el path es `/hubs/...`
3. CORS: para WebSockets con credenciales suele hacer falta `.AllowCredentials()` (hoy **no** está; solo origins + any method/header)
4. `app.MapHub<TuHub>("/hubs/...");` después de auth

---

## 4. `package.json` (SPA Angular)  
Ruta: `SGUEES-SPA/package.json`

```json
{
  "name": "angular-app",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build --base-href=./",
    "build:iis": "ng build --configuration production --base-href=/sguees/",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^18.2.0",
    "@angular/cdk": "^18.2.0",
    "@angular/common": "^18.2.0",
    "@angular/compiler": "^18.2.0",
    "@angular/core": "^18.2.0",
    "@angular/forms": "^18.2.0",
    "@angular/platform-browser": "^18.2.0",
    "@angular/platform-browser-dynamic": "^18.2.0",
    "@angular/router": "^18.2.0",
    "@auth0/angular-jwt": "^5.2.0",
    "devextreme": "24.1.17",
    "devextreme-angular": "24.1.17",
    "devextreme-schematics": "1.11.0",
    "exceljs": "3.10.0",
    "file-saver-es": "2.0.5",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.5.23",
    "luxon": "^3.3.0",
    "primeicons": "^7.0.0",
    "primeng": "^17.18.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^18.2.0",
    "@angular-eslint/builder": "^18.2.0",
    "@angular-eslint/eslint-plugin": "^18.2.0",
    "@angular-eslint/eslint-plugin-template": "^18.2.0",
    "@angular-eslint/schematics": "^18.2.0",
    "@angular-eslint/template-parser": "^18.2.0",
    "@angular/cli": "^18.2.0",
    "@angular/compiler-cli": "^18.2.0",
    "@types/jasmine": "~5.1.0",
    "@types/node": "^20.10.4",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "devextreme-cli": "1.11.0",
    "devextreme-themebuilder": "24.1.17",
    "eslint": "^8.56.0",
    "jasmine-core": "~5.1.0",
    "jsonwebtoken": "^9.0.3",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "playwright": "^1.60.0",
    "typescript": "~5.5.0"
  }
}
```

Notas:

- Angular **18**
- JWT cliente: `@auth0/angular-jwt`
- **Falta** dependencia: `@microsoft/signalr`

---

## 5. Checklist rápido si se agrega SignalR

- [ ] API: `AddSignalR` + `MapHub`
- [ ] API: JWT en `OnMessageReceived` para path del hub
- [ ] API: revisar CORS (`AllowCredentials` + origins explícitos)
- [ ] SPA: `npm i @microsoft/signalr`
- [ ] SPA: `accessTokenFactory: () => localStorage.getItem('token')`
