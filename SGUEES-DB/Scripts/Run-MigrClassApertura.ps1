param(
    [string]$Server = '192.168.0.250',
    [string]$Database = 'SGUEES',
    [int]$Anio = 2026,
    [int]$Mes = 7,
    [int]$MesPartida = 8,
    [ValidateSet('PREVIEW', 'EJECUTAR', 'LIMPIAR', 'DEPLOY_ONLY')]
    [string]$Modo = 'PREVIEW',
    [int]$Aplicar = 1,
    [string]$AppSettingsPath = 'C:\Desarrollo GIT\SGUEES\SGUEES-API\sguees.api\appsettings.json'
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path $AppSettingsPath)) {
    throw "No se encontro appsettings: $AppSettingsPath"
}

$json = Get-Content $AppSettingsPath -Raw | ConvertFrom-Json
$cs = $json.connectionStrings.defaultConnection
$user = 'erp'
$password = 'Uees$$2026'
if ($cs -match 'uid=([^;]+);pwd=([^;]+);database=([^;]+)') {
    $user = $Matches[1]
    $password = $Matches[2]
}

function Invoke-SqlFile {
    param([string]$FilePath)
    Push-Location $scriptDir
    try {
        & sqlcmd -S $Server -U $user -P $password -d $Database -f 65001 -b -i $FilePath
        if ($LASTEXITCODE -ne 0) { throw "sqlcmd fallo en $FilePath (exit $LASTEXITCODE)" }
    }
    finally {
        Pop-Location
    }
}

function Invoke-SqlQuery {
    param([string]$Query, [string]$OutFile)
    $args = @('-S', $Server, '-U', $user, '-P', $password, '-d', $Database, '-f', '65001', '-b', '-Q', $Query)
    if ($OutFile) {
        & sqlcmd @args -o $OutFile
    } else {
        & sqlcmd @args
    }
    if ($LASTEXITCODE -ne 0) { throw "sqlcmd fallo (exit $LASTEXITCODE)" }
}

Write-Host "=== DEPLOY SPs ==="
Invoke-SqlFile -FilePath (Join-Path $scriptDir 'DEPLOY_MIGR_CLASS_APERTURA.sql')

if ($Modo -eq 'DEPLOY_ONLY') {
    Write-Host 'Deploy completado.'
    exit 0
}

$query = @"
DECLARE @P INT, @E NUMERIC(38,0), @M NVARCHAR(4000), @F INT;
EXEC dbo.PRAL_MIGR_CLASS_APERTURA_COMPLETA
     @ANIO = $Anio,
     @MES = $Mes,
     @MES_PARTIDA = $MesPartida,
     @CIERRE = 0,
     @CORR_EMPRESA = 1,
     @MODO = '$Modo',
     @APLICAR = $Aplicar,
     @CORR_PARTIDA = @P OUTPUT,
     @SYS_NUMERO_ERROR = @E OUTPUT,
     @SYS_MENSAJE_ERROR = @M OUTPUT,
     @SYS_FILAS_AFECTADAS = @F OUTPUT;
SELECT @P AS CORR_PARTIDA, @E AS ERROR_NUM, @M AS MENSAJE, @F AS FILAS;
"@

$outFile = Join-Path $scriptDir "_migr_apertura_run.txt"
Write-Host "=== MODO: $Modo | Corte: $Mes/$Anio | Partida: $MesPartida/$Anio ==="
Invoke-SqlQuery -Query $query -OutFile $outFile
Get-Content $outFile
Write-Host "Salida completa: $outFile"
