<#
.SYNOPSIS
  Importa BAN_TIPO_MOVI_SEGUN_BANCO desde e-Admin / adminegg local hacia SGUEES.

.DESCRIPTION
  Origen típico:
    - e-Admin   — base reducida (Credomatic + Agrícola en local)
    - adminegg  — base más completa (Promerica, Lafise, Avanz, etc.)

.EXAMPLE
  cd "C:\Desarrollo GIT\SGUEES\SGUEES-DB\Scripts"
  .\IMPORT_BAN_TIPO_MOVI_SEGUN_BANCO.ps1

.EXAMPLE
  .\IMPORT_BAN_TIPO_MOVI_SEGUN_BANCO.ps1 -LocalDatabase adminegg -CorrEmpresaOrigen 1
#>
param(
    [string]$LocalServer = 'LINFO11\LOCALHOST',
    [string]$LocalDatabase = 'e-Admin',
    [string]$RemoteServer = '192.168.0.250',
    [string]$RemoteDatabase = 'SGUEES',
    [string]$RemoteUser = 'erp',
    [string]$RemotePassword = 'Uees$$2026',
    [int]$CorrEmpresaOrigen = 2,
    [int]$CorrEmpresaDestino = 1
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Data

function New-SqlConnection {
    param([string]$ConnectionString)
    $cn = New-Object System.Data.SqlClient.SqlConnection $ConnectionString
    $cn.Open()
    return $cn
}

function Invoke-Scalar {
    param($Connection, [string]$Sql, [hashtable]$Params = @{})
    $cmd = $Connection.CreateCommand()
    $cmd.CommandText = $Sql
    foreach ($k in $Params.Keys) { $null = $cmd.Parameters.AddWithValue($k, $Params[$k]) }
    return $cmd.ExecuteScalar()
}

function Invoke-NonQuery {
    param($Connection, [string]$Sql, [hashtable]$Params = @{})
    $cmd = $Connection.CreateCommand()
    $cmd.CommandText = $Sql
    foreach ($k in $Params.Keys) { $null = $cmd.Parameters.AddWithValue($k, $Params[$k]) }
    return $cmd.ExecuteNonQuery()
}

function Invoke-Query {
    param($Connection, [string]$Sql, [hashtable]$Params = @{})
    $cmd = $Connection.CreateCommand()
    $cmd.CommandText = $Sql
    foreach ($k in $Params.Keys) { $null = $cmd.Parameters.AddWithValue($k, $Params[$k]) }
    $adapter = New-Object System.Data.SqlClient.SqlDataAdapter $cmd
    $table = New-Object System.Data.DataTable
    [void]$adapter.Fill($table)
    return ,$table
}

$localCs = "Server=$LocalServer;Database=$LocalDatabase;Integrated Security=True;TrustServerCertificate=True;"
$remoteCs = "Server=$RemoteServer;Database=$RemoteDatabase;User ID=$RemoteUser;Password=$RemotePassword;TrustServerCertificate=True;"

Write-Host "=== Import BAN_TIPO_MOVI_SEGUN_BANCO ===" -ForegroundColor Cyan
Write-Host "Origen : $LocalServer / $LocalDatabase (empresa $CorrEmpresaOrigen)"
Write-Host "Destino: $RemoteServer / $RemoteDatabase (empresa $CorrEmpresaDestino)"

$local = New-SqlConnection $localCs
$remote = New-SqlConnection $remoteCs

try {
    $bancosOrigen = Invoke-Query $local @"
SELECT B.CORR_BANCO, B.NOMBRE_BANCO, B.CLASE_BANCO, COUNT(*) AS Filas
FROM BAN_TIPO_MOVI_SEGUN_BANCO A
INNER JOIN BAN_BANCO B
  ON A.CORR_SUSCRIPCION = B.CORR_SUSCRIPCION
 AND A.CORR_CONFI_PAIS = B.CORR_CONFI_PAIS
 AND A.CORR_BANCO = B.CORR_BANCO
WHERE A.CORR_EMPRESA = @e
  AND LTRIM(RTRIM(ISNULL(A.CODIGO_MOVIMIENTO, ''))) <> ''
GROUP BY B.CORR_BANCO, B.NOMBRE_BANCO, B.CLASE_BANCO
ORDER BY B.NOMBRE_BANCO
"@ @{ e = $CorrEmpresaOrigen }

    Write-Host "`nBancos en origen ($LocalDatabase):" -ForegroundColor Cyan
    if ($bancosOrigen.Rows.Count -eq 0) {
        Write-Host "  (sin filas — revise CORR_EMPRESA o nombre de base)" -ForegroundColor Yellow
    } else {
        $bancosOrigen | Format-Table -AutoSize
    }

    $rows = Invoke-Query $local @"
SELECT A.CORR_TIPO_MOVIMIENTO, A.CORR_BANCO, A.CODIGO_MOVIMIENTO, A.NOMBRE_MOVIMIENTO_SEGUN_BANCO
FROM BAN_TIPO_MOVI_SEGUN_BANCO A
WHERE A.CORR_SUSCRIPCION = 1 AND A.CORR_CONFI_PAIS = 1 AND A.CORR_EMPRESA = @e
ORDER BY A.CORR_BANCO, A.CODIGO_MOVIMIENTO, A.CORR_TIPO_MOVIMIENTO
"@ @{ e = $CorrEmpresaOrigen }

    $inserted = 0
    $skipped = 0

    foreach ($row in $rows.Select()) {
        $codigo = [string]$row['CODIGO_MOVIMIENTO']
        if ([string]::IsNullOrWhiteSpace($codigo)) {
            $skipped++
            continue
        }

        $exists = [int](Invoke-Scalar $remote @"
SELECT COUNT(*)
FROM BAN_TIPO_MOVI_SEGUN_BANCO
WHERE CORR_EMPRESA=@emp AND CORR_BANCO=@banco AND CORR_TIPO_MOVIMIENTO=@tipo AND CODIGO_MOVIMIENTO=@cod
"@ @{
            emp = $CorrEmpresaDestino
            banco = [int]$row['CORR_BANCO']
            tipo = [int]$row['CORR_TIPO_MOVIMIENTO']
            cod = $codigo.Trim()
        })

        if ($exists -gt 0) {
            $skipped++
            continue
        }

        Invoke-NonQuery $remote @"
INSERT INTO BAN_TIPO_MOVI_SEGUN_BANCO
(CORR_EMPRESA, CORR_TIPO_MOVIMIENTO, CORR_BANCO, CODIGO_MOVIMIENTO, NOMBRE_MOVIMIENTO_SEGUN_BANCO)
VALUES (@emp, @tipo, @banco, @cod, @nom)
"@ @{
            emp = $CorrEmpresaDestino
            tipo = [int]$row['CORR_TIPO_MOVIMIENTO']
            banco = [int]$row['CORR_BANCO']
            cod = $codigo.Trim()
            nom = [string]$row['NOMBRE_MOVIMIENTO_SEGUN_BANCO']
        } | Out-Null
        $inserted++
    }

    # Códigos cortos del extracto Agrícola / Credomatic / Promerica (plantilla conciliación).
    $extras = @(
        @{ Banco = 4; Codigo = 'NCR'; Nombre = 'NOTA DE CARGO'; Tipo = 6 },
        @{ Banco = 4; Codigo = 'REM'; Nombre = 'REMESA'; Tipo = 4 },
        @{ Banco = 4; Codigo = 'TEF'; Nombre = 'TRANSFERENCIA'; Tipo = 2 },
        @{ Banco = 1; Codigo = 'NCR'; Nombre = 'NOTA DE ABONO'; Tipo = 7 },
        @{ Banco = 1; Codigo = 'REM'; Nombre = 'REMESA'; Tipo = 4 },
        @{ Banco = 1; Codigo = 'TEF'; Nombre = 'TRANSFERENCIA'; Tipo = 3 },
        @{ Banco = 8; Codigo = 'REM'; Nombre = 'Remesa deposito'; Tipo = 4 },
        @{ Banco = 8; Codigo = 'NCR'; Nombre = 'Nota de cargo'; Tipo = 6 },
        @{ Banco = 8; Codigo = 'TEF'; Nombre = 'Transferencia recibida'; Tipo = 2 }
    )

    foreach ($x in $extras) {
        $exists = [int](Invoke-Scalar $remote @"
SELECT COUNT(*) FROM BAN_TIPO_MOVI_SEGUN_BANCO
WHERE CORR_EMPRESA=@emp AND CORR_BANCO=@banco AND CORR_TIPO_MOVIMIENTO=@tipo AND CODIGO_MOVIMIENTO=@cod
"@ @{
            emp = $CorrEmpresaDestino
            banco = $x.Banco
            tipo = $x.Tipo
            cod = $x.Codigo
        })
        if ($exists -gt 0) { continue }

        Invoke-NonQuery $remote @"
INSERT INTO BAN_TIPO_MOVI_SEGUN_BANCO
(CORR_EMPRESA, CORR_TIPO_MOVIMIENTO, CORR_BANCO, CODIGO_MOVIMIENTO, NOMBRE_MOVIMIENTO_SEGUN_BANCO)
VALUES (@emp, @tipo, @banco, @cod, @nom)
"@ @{
            emp = $CorrEmpresaDestino
            tipo = $x.Tipo
            banco = $x.Banco
            cod = $x.Codigo
            nom = $x.Nombre
        } | Out-Null
        $inserted++
        Write-Host "Extra: banco $($x.Banco) $($x.Codigo) -> tipo $($x.Tipo)" -ForegroundColor Yellow
    }

    Write-Host "Insertados: $inserted | Omitidos: $skipped" -ForegroundColor Green

    $resumen = Invoke-Query $remote @"
SELECT B.CLASE_BANCO, B.NOMBRE_BANCO, COUNT(*) C
FROM BAN_TIPO_MOVI_SEGUN_BANCO A
INNER JOIN GEN_BANCO B ON A.CORR_EMPRESA=B.CORR_EMPRESA AND A.CORR_BANCO=B.CORR_BANCO
WHERE A.CORR_EMPRESA=@e
GROUP BY B.CLASE_BANCO, B.NOMBRE_BANCO
ORDER BY B.NOMBRE_BANCO
"@ @{ e = $CorrEmpresaDestino }
    $resumen | Format-Table -AutoSize

    $ncr = Invoke-Query $remote @"
SELECT B.CLASE_BANCO, A.CODIGO_MOVIMIENTO, A.NOMBRE_MOVIMIENTO_SEGUN_BANCO, A.CORR_TIPO_MOVIMIENTO
FROM BAN_TIPO_MOVI_SEGUN_BANCO A
INNER JOIN GEN_BANCO B ON A.CORR_EMPRESA=B.CORR_EMPRESA AND A.CORR_BANCO=B.CORR_BANCO
WHERE A.CORR_EMPRESA=@e AND A.CODIGO_MOVIMIENTO IN ('NCR','REM','TEF')
ORDER BY B.CLASE_BANCO, A.CODIGO_MOVIMIENTO
"@ @{ e = $CorrEmpresaDestino }
    Write-Host "`nNCR / REM / TEF:" -ForegroundColor Cyan
    $ncr | Format-Table -AutoSize
}
finally {
    if ($local.State -eq 'Open') { $local.Close() }
    if ($remote.State -eq 'Open') { $remote.Close() }
}
