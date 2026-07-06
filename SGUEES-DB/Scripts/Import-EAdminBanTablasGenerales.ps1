<#
.SYNOPSIS
  Importa tablas generales de Banco desde e-Admin local hacia SGUEES.

.DESCRIPTION
  Origen:  LINFO11\LOCALHOST / e-Admin  (BAN_BANCO, BAN_LINEA_*, BAN_TIPO_*, BAN_CUENTA_*)
  Destino: SGUEES en servidor remoto (GEN_BANCO + tablas BAN_*)

  Mapeo empresa: CORR_EMPRESA origen (default 2) -> destino (default 1)
  Mapeo clase partida (tipos movimiento):
    1 DIARIO  -> 2
    2 CHEQUES -> 3
    5 REMESAS -> 5 (se inserta si no existe)

.EXAMPLE
  cd "c:\Desarrollo GIT\SGUEES\SGUEES-DB\Scripts"
  .\Import-EAdminBanTablasGenerales.ps1
#>
param(
    [string]$LocalServer = 'LINFO11\LOCALHOST',
    [string]$LocalDatabase = 'e-Admin',
    [string]$RemoteServer = '192.168.0.250',
    [string]$RemoteDatabase = 'SGUEES',
    [string]$RemoteUser = 'erp',
    [string]$RemotePassword = 'Uees$$2026',
    [int]$CorrEmpresaOrigen = 2,
    [int]$CorrEmpresaDestino = 1,
    [string]$Usuario = 'erp',
    [string]$Estacion = 'IMPORT_EADMIN_BAN'
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
    foreach ($k in $Params.Keys) {
        $null = $cmd.Parameters.AddWithValue($k, $Params[$k])
    }
    return $cmd.ExecuteScalar()
}

function Invoke-NonQuery {
    param($Connection, [string]$Sql, [hashtable]$Params = @{})
    $cmd = $Connection.CreateCommand()
    $cmd.CommandText = $Sql
    foreach ($k in $Params.Keys) {
        $null = $cmd.Parameters.AddWithValue($k, $Params[$k])
    }
    return $cmd.ExecuteNonQuery()
}

function Invoke-Query {
    param($Connection, [string]$Sql, [hashtable]$Params = @{})
    $cmd = $Connection.CreateCommand()
    $cmd.CommandText = $Sql
    foreach ($k in $Params.Keys) {
        $null = $cmd.Parameters.AddWithValue($k, $Params[$k])
    }
    $adapter = New-Object System.Data.SqlClient.SqlDataAdapter $cmd
    $table = New-Object System.Data.DataTable
    [void]$adapter.Fill($table)
    return ,$table
}

$localCs = "Server=$LocalServer;Database=$LocalDatabase;Integrated Security=True;TrustServerCertificate=True;"
$remoteCs = "Server=$RemoteServer;Database=$RemoteDatabase;User ID=$RemoteUser;Password=$RemotePassword;TrustServerCertificate=True;"

$clasePartidaMap = @{
    1 = 2
    2 = 3
    5 = 5
}

function Get-DbValue {
    param($Row, [string]$Column)
    if ($null -eq $Row -or $Row.IsNull($Column)) { return [DBNull]::Value }
    return $Row[$Column]
}

Write-Host "=== Import BAN tablas generales ===" -ForegroundColor Cyan
Write-Host "Origen : $LocalServer / $LocalDatabase (empresa $CorrEmpresaOrigen)"
Write-Host "Destino: $RemoteServer / $RemoteDatabase (empresa $CorrEmpresaDestino)"

$local = New-SqlConnection $localCs
$remote = New-SqlConnection $remoteCs

try {
  $corrMoneda = [int](Invoke-Scalar $remote 'SELECT CORR_MONEDA FROM CON_PARAMETRO WHERE CORR_EMPRESA=@e' @{ e = $CorrEmpresaDestino })
  $now = Get-Date

  # --- Clase partida REMESAS (5) si falta ---
  $existeRemesas = [int](Invoke-Scalar $remote 'SELECT COUNT(*) FROM CON_CLASE_PARTIDA WHERE CORR_EMPRESA=@e AND CORR_CLASE_PARTIDA=5' @{ e = $CorrEmpresaDestino })
  if ($existeRemesas -eq 0) {
    $cp = Invoke-Query $local @"
SELECT TOP 1 CORR_CLASE_PARTIDA, NOMBRE_CLASE_PARTIDA, NOMBRE_CORTO_CLASE,
       CORR_LINEA_AUMENTA, CORR_LINEA_DISMINUYE, ACEPTA_MODIFICACION
FROM CON_CLASE_PARTIDA
WHERE CORR_EMPRESA=@e AND CORR_CLASE_PARTIDA=5
"@ @{ e = $CorrEmpresaOrigen }
    if ($cp.Rows.Count -gt 0) {
      $r = $cp.Rows[0]
      Invoke-NonQuery $remote @"
INSERT INTO CON_CLASE_PARTIDA
(CORR_EMPRESA, CORR_CLASE_PARTIDA, NOMBRE_CLASE_PARTIDA, NOMBRE_CORTO_CLASE,
 CORR_LINEA_AUMENTA, CORR_LINEA_DISMINUYE, ACEPTA_MODIFICACION)
VALUES (@emp, @id, @nom, @corto, @la, @ld, @acepta)
"@ @{
        emp = $CorrEmpresaDestino; id = 5
        nom = [string]$r['NOMBRE_CLASE_PARTIDA']
        corto = [string]$r['NOMBRE_CORTO_CLASE']
        la = [int]$r['CORR_LINEA_AUMENTA']
        ld = [int]$r['CORR_LINEA_DISMINUYE']
        acepta = [bool]$r['ACEPTA_MODIFICACION']
      } | Out-Null
      Write-Host 'CON_CLASE_PARTIDA 5 REMESAS insertada.' -ForegroundColor Green
    }
  }

  # --- GEN_BANCO desde BAN_BANCO ---
  Invoke-NonQuery $remote 'DELETE FROM BAN_CUENTA_BANCARIA WHERE CORR_EMPRESA=@e' @{ e = $CorrEmpresaDestino } | Out-Null
  Invoke-NonQuery $remote 'DELETE FROM GEN_BANCO WHERE CORR_EMPRESA=@e' @{ e = $CorrEmpresaDestino } | Out-Null

  $bancos = Invoke-Query $local 'SELECT CORR_BANCO, NOMBRE_BANCO, NOMBRE_BANCO_CORTO, CLASE_BANCO, CODIGO_TRANSACION_UNI FROM BAN_BANCO ORDER BY CORR_BANCO'
  foreach ($b in $bancos.Select()) {
    Invoke-NonQuery $remote @"
INSERT INTO GEN_BANCO
(CORR_EMPRESA, CORR_BANCO, NOMBRE_BANCO, NOMBRE_BANCO_CORTO, CLASE_BANCO, CODIGO_TRANSACION_UNI,
 USUARIO_CREA, FECHA_CREA, ESTACION_CREA)
VALUES (@emp, @id, @nom, @corto, @clase, @cod, @usr, @fec, @est)
"@ @{
      emp = $CorrEmpresaDestino
      id = [int]$b['CORR_BANCO']
      nom = [string]$b['NOMBRE_BANCO']
      corto = (Get-DbValue $b 'NOMBRE_BANCO_CORTO')
      clase = (Get-DbValue $b 'CLASE_BANCO')
      cod = (Get-DbValue $b 'CODIGO_TRANSACION_UNI')
      usr = $Usuario; fec = $now; est = $Estacion
    } | Out-Null
  }
  Write-Host "GEN_BANCO: $($bancos.Rows.Count) filas." -ForegroundColor Green

  # --- BAN_LINEA_TRABAJO_CONCILIACION ---
  Invoke-NonQuery $remote 'DELETE FROM BAN_TIPO_MOVI_BANCARIO WHERE CORR_EMPRESA=@e' @{ e = $CorrEmpresaDestino } | Out-Null
  Invoke-NonQuery $remote 'DELETE FROM BAN_TIPO_CHEQUE WHERE CORR_EMPRESA=@e' @{ e = $CorrEmpresaDestino } | Out-Null
  Invoke-NonQuery $remote 'DELETE FROM BAN_LINEA_TRABAJO_CONCILIACION WHERE CORR_EMPRESA=@e' @{ e = $CorrEmpresaDestino } | Out-Null

  $lineas = Invoke-Query $local @"
SELECT CORR_LINEA, NOMBRE_LINEA_TRABAJO, AUMENTA_DISMINUYE
FROM BAN_LINEA_TRABAJO_CONCILIACION WHERE CORR_EMPRESA=@e ORDER BY CORR_LINEA
"@ @{ e = $CorrEmpresaOrigen }
  foreach ($row in $lineas.Select()) {
    Invoke-NonQuery $remote @"
INSERT INTO BAN_LINEA_TRABAJO_CONCILIACION (CORR_EMPRESA, CORR_LINEA, NOMBRE_LINEA_TRABAJO, AUMENTA_DISMINUYE)
VALUES (@emp, @id, @nom, @aum)
"@ @{
      emp = $CorrEmpresaDestino
      id = [int]$row['CORR_LINEA']
      nom = [string]$row['NOMBRE_LINEA_TRABAJO']
      aum = [int]$row['AUMENTA_DISMINUYE']
    } | Out-Null
  }
  Write-Host "BAN_LINEA_TRABAJO_CONCILIACION: $($lineas.Rows.Count) filas." -ForegroundColor Green

  # --- BAN_TIPO_CHEQUE ---
  $tiposCheque = Invoke-Query $local @"
SELECT CORR_TIPO_CHEQUE, NOMBRE_TIPO_CHEQUE, CUENTA_CONTABLE, CLASE_TIPO_CHEQUE, CONTABILIZAR_LUEGO_DE_IMPRIMIR
FROM BAN_TIPO_CHEQUE WHERE CORR_EMPRESA=@e ORDER BY CORR_TIPO_CHEQUE
"@ @{ e = $CorrEmpresaOrigen }
  foreach ($row in $tiposCheque.Select()) {
    Invoke-NonQuery $remote @"
INSERT INTO BAN_TIPO_CHEQUE
(CORR_EMPRESA, CORR_TIPO_CHEQUE, NOMBRE_TIPO_CHEQUE, CUENTA_CONTABLE, CLASE_TIPO_CHEQUE, CONTABILIZAR_LUEGO_DE_IMPRIMIR)
VALUES (@emp, @id, @nom, @cta, @clase, @conta)
"@ @{
      emp = $CorrEmpresaDestino
      id = [int]$row['CORR_TIPO_CHEQUE']
      nom = [string]$row['NOMBRE_TIPO_CHEQUE']
      cta = (Get-DbValue $row 'CUENTA_CONTABLE')
      clase = (Get-DbValue $row 'CLASE_TIPO_CHEQUE')
      conta = (Get-DbValue $row 'CONTABILIZAR_LUEGO_DE_IMPRIMIR')
    } | Out-Null
  }
  Write-Host "BAN_TIPO_CHEQUE: $($tiposCheque.Rows.Count) filas." -ForegroundColor Green

  # --- BAN_TIPO_MOVI_BANCARIO ---
  $tiposMovi = Invoke-Query $local @"
SELECT CORR_TIPO_MOVIMIENTO, NOMBRE_TIPO_MOVIMIENTO, NOMBRE_TIPO_CORTO, CORR_LINEA, CORR_CLASE_PARTIDA,
       USA_CHEQUE_PROPIO, SUMA_RESTA, CLASE_MOVIMIENTO, CUENTA_CONTABLE_GASTO, NOMBRE_REPORTE
FROM BAN_TIPO_MOVI_BANCARIO WHERE CORR_EMPRESA=@e ORDER BY CORR_TIPO_MOVIMIENTO
"@ @{ e = $CorrEmpresaOrigen }
  foreach ($row in $tiposMovi.Select()) {
    $claseOrig = [int]$row['CORR_CLASE_PARTIDA']
    if (-not $clasePartidaMap.ContainsKey($claseOrig)) {
      throw "CORR_CLASE_PARTIDA $claseOrig sin mapeo para tipo movimiento $($row['CORR_TIPO_MOVIMIENTO'])"
    }
    $claseDest = $clasePartidaMap[$claseOrig]
    Invoke-NonQuery $remote @"
INSERT INTO BAN_TIPO_MOVI_BANCARIO
(CORR_EMPRESA, CORR_TIPO_MOVIMIENTO, NOMBRE_TIPO_MOVIMIENTO, NOMBRE_TIPO_CORTO, CORR_LINEA, CORR_CLASE_PARTIDA,
 USA_CHEQUE_PROPIO, SUMA_RESTA, CLASE_MOVIMIENTO, CUENTA_CONTABLE_GASTO, NOMBRE_REPORTE)
VALUES (@emp, @id, @nom, @corto, @linea, @clase, @cheque, @sr, @cm, @gasto, @rep)
"@ @{
      emp = $CorrEmpresaDestino
      id = [int]$row['CORR_TIPO_MOVIMIENTO']
      nom = [string]$row['NOMBRE_TIPO_MOVIMIENTO']
      corto = [string]$row['NOMBRE_TIPO_CORTO']
      linea = [int]$row['CORR_LINEA']
      clase = $claseDest
      cheque = [bool]$row['USA_CHEQUE_PROPIO']
      sr = [int]$row['SUMA_RESTA']
      cm = [string]$row['CLASE_MOVIMIENTO']
      gasto = (Get-DbValue $row 'CUENTA_CONTABLE_GASTO')
      rep = (Get-DbValue $row 'NOMBRE_REPORTE')
    } | Out-Null
  }
  Write-Host "BAN_TIPO_MOVI_BANCARIO: $($tiposMovi.Rows.Count) filas." -ForegroundColor Green

  # --- BAN_CUENTA_BANCARIA ---
  $cuentas = Invoke-Query $local @"
SELECT CORR_CUENTA_BANCO, NUMERO_CUENTA_BANCO, CORR_BANCO, CUENTA_CONTABLE, NOMBRE_REPORTE, TIPO_CUENTA_BANCO,
       CORR_CENTRO_COSTO, CORR_MONEDA, CODIGO_EMPRESARIAL, CODIGO_EMPRESARIAL_PROV, NO_PERMITE_MODIFICAR,
       VALIDAR_SALDO, PAGA_PLANILLA, VALIDA_FECHA, NOMBRE_CUENTA, NO_PERMITE_CHEQUES, ESTADO_CUENTA,
       USA_TRANSACIONES_UNI, CLASE_CHEQUE
FROM BAN_CUENTA_BANCARIA WHERE CORR_EMPRESA=@e ORDER BY CORR_CUENTA_BANCO
"@ @{ e = $CorrEmpresaOrigen }
  foreach ($row in $cuentas.Select()) {
    $moneda = if ($row.IsNull('CORR_MONEDA')) { $corrMoneda } else { [int]$row['CORR_MONEDA'] }
    Invoke-NonQuery $remote @"
INSERT INTO BAN_CUENTA_BANCARIA
(CORR_EMPRESA, CORR_CUENTA_BANCO, NUMERO_CUENTA_BANCO, CORR_BANCO, CUENTA_CONTABLE, NOMBRE_REPORTE,
 TIPO_CUENTA_BANCO, CORR_CENTRO_COSTO, CORR_MONEDA, CODIGO_EMPRESARIAL, CODIGO_EMPRESARIAL_PROV,
 NO_PERMITE_MODIFICAR, VALIDAR_SALDO, PAGA_PLANILLA, VALIDA_FECHA, NOMBRE_CUENTA, NO_PERMITE_CHEQUES,
 ESTADO_CUENTA, USA_TRANSACIONES_UNI, CLASE_CHEQUE)
VALUES
(@emp, @id, @num, @banco, @cta, @rep, @tipo, @cc, @mon, @ce, @cep, @npm, @vs, @pp, @vf, @nom, @npc, @est, @utu, @chq)
"@ @{
      emp = $CorrEmpresaDestino
      id = [int]$row['CORR_CUENTA_BANCO']
      num = $(if ($row.IsNull('NUMERO_CUENTA_BANCO')) { '' } else { [string]$row['NUMERO_CUENTA_BANCO'] })
      banco = [int]$row['CORR_BANCO']
      cta = (Get-DbValue $row 'CUENTA_CONTABLE')
      rep = (Get-DbValue $row 'NOMBRE_REPORTE')
      tipo = [string]$row['TIPO_CUENTA_BANCO']
      cc = (Get-DbValue $row 'CORR_CENTRO_COSTO')
      mon = $moneda
      ce = (Get-DbValue $row 'CODIGO_EMPRESARIAL')
      cep = (Get-DbValue $row 'CODIGO_EMPRESARIAL_PROV')
      npm = [bool]$row['NO_PERMITE_MODIFICAR']
      vs = (Get-DbValue $row 'VALIDAR_SALDO')
      pp = (Get-DbValue $row 'PAGA_PLANILLA')
      vf = (Get-DbValue $row 'VALIDA_FECHA')
      nom = (Get-DbValue $row 'NOMBRE_CUENTA')
      npc = (Get-DbValue $row 'NO_PERMITE_CHEQUES')
      est = (Get-DbValue $row 'ESTADO_CUENTA')
      utu = (Get-DbValue $row 'USA_TRANSACIONES_UNI')
      chq = (Get-DbValue $row 'CLASE_CHEQUE')
    } | Out-Null
  }
  Write-Host "BAN_CUENTA_BANCARIA: $($cuentas.Rows.Count) filas." -ForegroundColor Green

  Write-Host "`n=== Resumen destino ===" -ForegroundColor Cyan
  $resumen = Invoke-Query $remote @"
SELECT 'GEN_BANCO' T, COUNT(*) C FROM GEN_BANCO WHERE CORR_EMPRESA=@e
UNION ALL SELECT 'BAN_LINEA_TRABAJO_CONCILIACION', COUNT(*) FROM BAN_LINEA_TRABAJO_CONCILIACION WHERE CORR_EMPRESA=@e
UNION ALL SELECT 'BAN_TIPO_CHEQUE', COUNT(*) FROM BAN_TIPO_CHEQUE WHERE CORR_EMPRESA=@e
UNION ALL SELECT 'BAN_TIPO_MOVI_BANCARIO', COUNT(*) FROM BAN_TIPO_MOVI_BANCARIO WHERE CORR_EMPRESA=@e
UNION ALL SELECT 'BAN_CUENTA_BANCARIA', COUNT(*) FROM BAN_CUENTA_BANCARIA WHERE CORR_EMPRESA=@e
"@ @{ e = $CorrEmpresaDestino }
  $resumen | Format-Table -AutoSize

  Write-Host "Importacion completada." -ForegroundColor Green
}
finally {
  if ($local.State -eq 'Open') { $local.Close() }
  if ($remote.State -eq 'Open') { $remote.Close() }
}
