param(
    [string]$Server = "192.168.0.250",
    [string]$Database = "SGUEES",
    [string]$User = "erp",
    [string]$Password = "Uees`$`$2026",
    [string]$SpDir = "c:\Desarrollo GIT\SGUEES\SGUEES-DB\Stored Procedures"
)

$files = @(
    'dbo.PRAL_IMPR_CON_PARTIDA_CONTABLE.sql',
    'dbo.PRAL_MTTO_CON_PARTIDA.sql',
    'dbo.PRAL_MTTO_CON_PARTIDA_DETA.sql',
    'dbo.PRAL_MTTO_CON_PARTIDA_APLICAR.sql',
    'dbo.PRAL_MTTO_CON_PARTIDA_DESAPLICAR.sql',
    'dbo.PRAL_MTTO_CON_PARTIDA_ANULAR.sql',
    'dbo.PRAL_GENE_PARTIDA_LIQUIDACION.sql',
    'dbo.PRAL_GENE_PARTIDA_CIERRE.sql',
    'dbo.PRAL_GENE_PARTIDA_APERTURA.sql',
    'dbo.PRAL_GENE_CON_PERIODO_CIERRE.sql',
    'dbo.PRAL_GENE_CON_PERIODO_APERTURA.sql'
)

$viewFile = Join-Path (Split-Path $SpDir -Parent) "Views\dbo.V_CON_PARTIDA_APLICAR.sql"

$log = @()
$log += "=== Deploy Partidas Contables SPs ==="
$log += "Server: $Server | Database: $Database"
$log += ""

foreach ($f in $files) {
    $path = Join-Path $SpDir $f
    $log += "--- $f ---"
    if (-not (Test-Path $path)) {
        $log += "MISSING: $path"
        continue
    }
    $out = & sqlcmd -S $Server -d $Database -U $User -P $Password -i $path 2>&1
    if ($LASTEXITCODE -eq 0) {
        $log += "OK"
    } else {
        $log += "FAIL exit=$LASTEXITCODE"
        $log += ($out | Out-String)
    }
}

$log += "--- dbo.V_CON_PARTIDA_APLICAR.sql ---"
if (-not (Test-Path $viewFile)) {
    $log += "MISSING: $viewFile"
} else {
    $out = & sqlcmd -S $Server -d $Database -U $User -P $Password -i $viewFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        $log += "OK"
    } else {
        $log += "FAIL exit=$LASTEXITCODE"
        $log += ($out | Out-String)
    }
}

$logPath = Join-Path (Split-Path $SpDir -Parent) "Scripts\_deploy_partida_result.txt"
$log | Set-Content -Path $logPath -Encoding UTF8
$log | Write-Output
