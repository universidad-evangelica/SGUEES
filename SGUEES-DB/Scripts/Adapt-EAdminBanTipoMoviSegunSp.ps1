param(
    [string]$SourceDir = "C:\Users\jonathan.avalos\Documents\proyecto para ERP\e-admin\e-Admin.db",
    [string]$DestSpDir = "C:\Desarrollo GIT\SGUEES\SGUEES-DB\Stored Procedures",
    [string]$DestViewDir = "C:\Desarrollo GIT\SGUEES\SGUEES-DB\Views"
)

function Adapt-SgueesBanTipoMoviSegunSql {
    param([string]$Content)

    $c = $Content

    $c = $c -replace '(?m)^\s*@CORR_SUSCRIPCION\s+int(?:=NULL)?,\s*\r?\n', ''
    $c = $c -replace '(?m)^\s*@CORR_CONFI_PAIS\s+int(?:=NULL)?,\s*\r?\n', ''
    $c = $c -replace '(?m)^\s*CORR_SUSCRIPCION int,\s*\r?\n', ''
    $c = $c -replace '(?m)^\s*CORR_CONFI_PAIS int,\s*\r?\n', ''

    $c = $c -replace 'WHERE CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND CORR_EMPRESA=@CORR_EMPRESA', 'WHERE CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace 'WHERE A\.CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND A\.CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND A\.CORR_EMPRESA=@CORR_EMPRESA', 'WHERE A.CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace 'AND CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND CORR_EMPRESA=@CORR_EMPRESA', 'AND CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace 'AND A\.CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND A\.CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND A\.CORR_EMPRESA=@CORR_EMPRESA', 'AND A.CORR_EMPRESA=@CORR_EMPRESA'
    $c = $c -replace 'WHERE\s+CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s*\r?\n\s*AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s*\r?\n', "WHERE`r`n"
    $c = $c -replace 'AND CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s*\r?\n\s*AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s*\r?\n', ''

    $c = $c -replace 'EXEC PRAL_MTTO_ADMIN_BITACORA_SISTEMA 1,@CORR_SUSCRIPCION,@CORR_CONFI_PAIS,@CORR_BITACORA', 'EXEC PRAL_MTTO_ADMIN_BITACORA_SISTEMA 1,@CORR_BITACORA'

    $c = $c -replace '\(CORR_SUSCRIPCION,CORR_CONFI_PAIS,CORR_EMPRESA,', '(CORR_EMPRESA,'
    $c = $c -replace '\(@CORR_SUSCRIPCION,@CORR_CONFI_PAIS,@CORR_EMPRESA,', '(@CORR_EMPRESA,'

    $c = $c -replace '(?m)^\s*SELECT A\.CORR_SUSCRIPCION\s*\r?\n\s*,A\.CORR_CONFI_PAIS\s*\r?\n', 'SELECT '
    $c = $c -replace '(?m)^\s*,?\s*(\w+\.)?CORR_SUSCRIPCION\s*\r?\n\s*,?\s*(\w+\.)?CORR_CONFI_PAIS\s*\r?\n', ''

    $c = $c -replace 'FROM BAN_BANCO\s+WHERE CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND CORR_BANCO=@CORR_BANCO', 'FROM GEN_BANCO WHERE CORR_EMPRESA=@CORR_EMPRESA AND CORR_BANCO=@CORR_BANCO'
    $c = $c -replace '\bBAN_BANCO\b', 'GEN_BANCO'

    $c = $c -replace 'WHERE CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND CORR_EMPRESA=@CORR_EMPRESA\s+AND CORR_TIPO_MOVIMIENTO=@CORR_TIPO_MOVIMIENTO', 'WHERE CORR_EMPRESA=@CORR_EMPRESA AND CORR_TIPO_MOVIMIENTO=@CORR_TIPO_MOVIMIENTO'
    $c = $c -replace 'WHERE CORR_SUSCRIPCION=@CORR_SUSCRIPCION\s+AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS\s+AND CORR_EMPRESA=@CORR_EMPRESA\s+AND CORR_TIPO_MOVIMIENTO=@CORR_TIPO_MOVIMIENTO\s+AND CORR_BANCO=@CORR_BANCO', 'WHERE CORR_EMPRESA=@CORR_EMPRESA AND CORR_TIPO_MOVIMIENTO=@CORR_TIPO_MOVIMIENTO AND CORR_BANCO=@CORR_BANCO'

    return $c
}

function Get-SgueesBanTipoMoviSegunView {
    return @"
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_NULLS ON
GO

CREATE VIEW [dbo].[V_BAN_TIPO_MOVI_SEGUN_BANCO]
AS
SELECT A.CORR_EMPRESA
      ,A.CORR_TIPO_MOVIMIENTO
      ,A.CORR_BANCO
      ,B.NOMBRE_BANCO
      ,A.CODIGO_MOVIMIENTO
      ,A.NOMBRE_MOVIMIENTO_SEGUN_BANCO
FROM dbo.BAN_TIPO_MOVI_SEGUN_BANCO A
INNER JOIN dbo.GEN_BANCO B
  ON A.CORR_EMPRESA = B.CORR_EMPRESA AND A.CORR_BANCO = B.CORR_BANCO
GO
"@
}

$viewFiles = @(
    'Views\dbo.V_BAN_TIPO_MOVI_SEGUN_BANCO.sql'
)

$spFiles = @(
    'Stored Procedures\dbo.PRAL_DATA_BAN_TIPO_MOVI_SEGUN_BANCO.sql',
    'Stored Procedures\dbo.PRAL_MTTO_BAN_TIPO_MOVI_SEGUN_BANCO.sql'
)

foreach ($rel in $viewFiles) {
    $name = Split-Path $rel -Leaf
    $dst = Join-Path $DestViewDir $name
    $adapted = Get-SgueesBanTipoMoviSegunView
    Set-Content -LiteralPath $dst -Value $adapted -Encoding UTF8
    Write-Host "Vista adaptada: $name"
}

foreach ($rel in $spFiles) {
    $src = Join-Path $SourceDir $rel
    $name = Split-Path $rel -Leaf
    $dst = Join-Path $DestSpDir $name
    if (-not (Test-Path -LiteralPath $src)) {
        Write-Warning "No encontrado: $src"
        continue
    }
    $raw = Get-Content -LiteralPath $src -Raw -Encoding UTF8
    $adapted = Adapt-SgueesBanTipoMoviSegunSql -Content $raw
    Set-Content -LiteralPath $dst -Value $adapted -Encoding UTF8
    Write-Host "SP adaptado: $name"
}

Write-Host 'Adaptacion BAN_TIPO_MOVI_SEGUN_BANCO completada.'



