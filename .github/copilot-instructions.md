# Instrucciones Copilot para SGUEES

Estas instrucciones ayudan a agentes de IA a trabajar productivamente en este mono-repo. Mantén respuestas concisas y referencia archivos y comandos exactos.

## Visión General de Arquitectura
- **Estructura de la solución:**
  - `SGUEES-API/` — solución .NET para APIs del lado servidor.
    - `eFramework/` y `eFrameworkAPI/` — librerías compartidas/núcleo. Revisa `Core/` y `Data/` para dominio y persistencia.
    - `sguees.api/` — host principal ASP.NET Core. Archivos clave: `Program.cs`, `appsettings*.json`, `web.config`, `Options/`, `Shared/`.
  - `SGUEES-SPA/` — SPA en Angular 12, estructura estándar bajo `src/`.
  - `SGUEES-DB/` — SQL Server: esquema, vistas, funciones y procedimientos almacenados bajo `Functions/`, `Stored Procedures/`, `Tables/`, `Views/`.
- **Flujo de datos:** Angular (`SGUEES-SPA`) consume endpoints REST de ASP.NET Core (`sguees.api`); la API usa `eFramework*` para acceso a datos y opera contra SQL Server vía SP/funciones en `SGUEES-DB`.
- **Configuración:** API se configura en `sguees.api/appsettings.json` y `appsettings.Development.json`. Dev server del frontend en `http://localhost:4200/` (ver `SGUEES-SPA/README.md`).

## Build & Run (Windows PowerShell)
- **Backend (.NET):**
  - Compilar solución:
    ```powershell
    dotnet build "c:\Users\jonathan.avalos\Documents\Desarrollos Git\SGUEES\SGUEES-API\sguees-api.sln"
    ```
  - Ejecutar API (debug/dev):
    ```powershell
    Push-Location "c:\Users\jonathan.avalos\Documents\Desarrollos Git\SGUEES\SGUEES-API\sguees.api"; dotnet run
    ```
  - Configuración: sobreescribe vía `appsettings.Development.json`. Conexiones y feature flags suelen vivir bajo `Options/`.
- **Frontend (Angular 12):**
  - Instalar dependencias:
    ```powershell
    Push-Location "c:\Users\jonathan.avalos\Documents\Desarrollos Git\SGUEES\SGUEES-SPA"; npm install
    ```
  - Servidor de desarrollo:
    ```powershell
    ng serve
    ```
  - Tests: `ng test`; Build: `ng build` (salida en `dist/`).
- **Base de datos (SQL Server):**
  - Scripts DDL/DML en `SGUEES-DB`. Despliegue administrado con Red Gate (`RedGate.ssc`). Cita SP/funciones por ruta de archivo al discutir operaciones.

## Convenciones y Patrones
- **Proyectos:** `eFramework` y `eFrameworkAPI` contienen lógica reusable; evita duplicar modelos o acceso a datos en `sguees.api` si ya existen en `Core/` o `Data/`.
- **Configuración fuerte:** Usa `appsettings.*.json` y opciones tipadas bajo `sguees.api/Options/`. Mantén settings específicos de entorno en `appsettings.Development.json`.
- **Endpoints:** Controladores y hosting mínimo en `sguees.api/Program.cs`. Refiere `Shared/` para DTOs/contratos.
- **Acceso a DB:** Prioriza SP/funciones existentes en `SGUEES-DB` sobre queries ad-hoc. Ejemplo: `SGUEES-DB/Stored Procedures/dbo.PRAL_DATA_SEG_USUARIO.sql`.
- **Angular:** Sigue estándares de Angular CLI (ver `SGUEES-SPA/README.md`). Componentes/servicios/módulos bajo `src/`. Usa `environment.ts` para URLs base de API.

## Testing y Debugging
- **Angular:** `ng test` con Karma. Para e2e, añade el paquete correspondiente antes de `ng e2e`.
- **API:** Ejecuta `dotnet run` localmente y configura logging vía `appsettings.*.json`. Si se usa IIS/IIS Express, aplica `web.config` en `sguees.api/`.
- **DB:** Valida cambios en SP/funciones ejecutando scripts específicos; mantén nombres coherentes con archivos en `SGUEES-DB`.

## Puntos de Integración
- **API ↔ DB:** SP como `dbo.PRAL_GENE_COM_DOCUMENTO_TOTAL.sql` y `dbo.ADM_SP_VALIDA_USUARIO_CLASS.sql` son críticos. Al agregar features, envuelve llamadas a SP en repositorios/servicios bajo `eFramework/Data`.
- **SPA ↔ API:** Configura URLs base y headers de auth en servicios Angular; alinea DTOs con `sguees.api/Shared/`.

## Ejemplos para Agentes
- Nuevo endpoint API: controlador en `sguees.api`, servicio en `eFrameworkAPI/Core` o `Data`, y llamada a SP existente bajo `SGUEES-DB/Stored Procedures/...`.
- Cambiar un flag de configuración: actualiza `sguees.api/appsettings.Development.json` y la clase de opciones en `Options/`.
- Consumir API desde la SPA: crea un `service` Angular bajo `SGUEES-SPA/src/app/services/` y lee la URL base desde `environment.ts`.

## Nota sobre Integración de IA
- Desde este repo local/VS Code no se puede “habilitar un modelo IA para todos los clientes” de forma centralizada; eso requiere configuración de la plataforma externa (proveedor de IA, portal organizacional o gateway/API).
- Alternativas prácticas:
  - En VS Code: instala/activa la extensión del proveedor y selecciona el modelo en ajustes del workspace.
  - En backend: agrega una opción en `sguees.api/Options/` (p. ej. `DefaultAIModel`) y una capa en `eFrameworkAPI` que lea esa bandera para enrutar peticiones al modelo elegido.
  - Con proveedor externo (API): configura claves en variables de entorno y crea servicios que seleccionen el modelo por defecto por tenant.

## Notas
- Mantén cambios mínimos y consistentes con la estructura existente.
- Referencia archivos y rutas explícitamente en propuestas y PRs.
- No introduzcas nuevas capas de acceso a datos si ya existe la abstracción `eFramework`.
