# Prueba E2E reporte contabilidad PDF (CON_GASTOS_PRESUPUESTO)
# Uso: .\test-con-reporte-pdf.ps1 -Login admin -Password '***'
param(
    [string]$ApiUrl = 'http://localhost:5000/',
    [string]$Login = 'admin',
    [string]$Password = '',
    [string]$CodigoReporte = 'LIBRO_DIARIO_AUXILIAR',
    [int]$Anio = 2025,
    [int]$Mes = 6
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($Password)) {
    $secure = Read-Host 'Clave' -AsSecureString
    $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}

Write-Host "1) Login $Login ..."
$loginBody = @{ LOGIN_SISTEMA = $Login; CLAVE_USUARIO = $Password; CODIGO_SUITE = 'SGUEES' } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri ($ApiUrl + 'SEG_USUARIO/login') -Method Post -Body $loginBody -ContentType 'application/json'
if (-not $loginResp.Result) { throw "Login fallo: $($loginResp.ErrorMessage)" }
$token = $loginResp.Data
Write-Host '   OK'

Write-Host '2) Definiciones ...'
$headers = @{ Authorization = "Bearer $token" }
$defs = Invoke-RestMethod -Uri ($ApiUrl + 'CON_REPORTE/GetDefiniciones') -Headers $headers
$def = $defs.Data | Where-Object { $_.CODIGO_REPORTE -eq $CodigoReporte } | Select-Object -First 1
if (-not $def) { throw "Reporte $CodigoReporte no encontrado" }
Write-Host "   SP=$($def.STORED_PROCEDURE) RPT=$($def.RPT_FILE) URL=$($def.URL_OPCION) RPT_DISP=$($def.RPT_DISPONIBLE)"

Write-Host '3) Consultar ...'
$consultaBody = @{
    CODIGO_REPORTE = $CodigoReporte
    FECHA_INICIAL = (Get-Date -Year $Anio -Month 1 -Day 1).ToString('yyyy-MM-dd')
    FECHA_FINAL = (Get-Date -Year $Anio -Month $Mes -Day 1).AddMonths(1).AddDays(-1).ToString('yyyy-MM-dd')
    PARTIDA_CIERRE = $false
    PARTIDA_LIQUIDACION = $false
    CUENTA_A_CERO = $false
    CONSOLIDADO = $false
    FOLIADO = $false
    NUMERO_FOLIO = 0
    NIVEL = 3
} | ConvertTo-Json
$consulta = Invoke-RestMethod -Uri ($ApiUrl + 'CON_REPORTE/Consultar') -Method Post -Body $consultaBody -Headers $headers -ContentType 'application/json'
if (-not $consulta.Result) { throw "Consultar fallo: $($consulta.ErrorMessage)" }
Write-Host "   Filas: $($consulta.RowsAffected)"

Write-Host '4) getPDF ...'
$pdfPath = Join-Path $env:TEMP ("con-reporte-$CodigoReporte.pdf")
try {
    Invoke-WebRequest -Uri ($ApiUrl + 'CON_REPORTE/getPDF') -Method Post -Body $consultaBody -Headers $headers -ContentType 'application/json' -OutFile $pdfPath
    $size = (Get-Item $pdfPath).Length
    if ($size -lt 100) {
        $preview = Get-Content $pdfPath -Raw -ErrorAction SilentlyContinue
        if ($preview -match 'ErrorMessage') { throw "getPDF devolvio JSON en lugar de PDF: $preview" }
        throw "PDF sospechosamente pequeno ($size bytes)"
    }
    Write-Host "   OK -> $pdfPath ($size bytes)"
    Write-Host 'Prueba E2E completada.'
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        throw "getPDF 403: el JWT no tiene permiso P en $($def.URL_OPCION). Re-login tras ejecutar MENU_CONTABILIDAD_REPORTES.sql"
    }
    if ($_.Exception.Response) {
        try {
            $sr = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
            $body = $sr.ReadToEnd()
            if ($body) { throw "getPDF fallo: $body" }
        } catch [System.Management.Automation.RuntimeException] {
            throw
        } catch {
            throw $_.Exception.Message
        }
    }
    throw
}

Write-Host ''
Write-Host '5) Probar servicio RPT (401 = JWT requerido, servicio OK)...'
$rptBase = $ApiUrl -replace 'sgueesAPI/?', 'sguees-rpt/api/'
try {
    Invoke-WebRequest -Uri $rptBase -UseBasicParsing -TimeoutSec 15 | Out-Null
    Write-Host "   RPT respondio OK en $rptBase"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) {
        Write-Host "   OK (401): $rptBase — servicio RPT activo, falta token Bearer"
    } elseif ($code -eq 500) {
        Write-Host "   ERROR 500 en $rptBase" -ForegroundColor Red
        Write-Host '   Revise: Crystal runtime 13.0 SP32, pool .NET 4.0, Web.config JWT audience/issuer = apiRptURL del API'
    } else {
        Write-Host "   RPT $rptBase -> HTTP $code"
    }
}
