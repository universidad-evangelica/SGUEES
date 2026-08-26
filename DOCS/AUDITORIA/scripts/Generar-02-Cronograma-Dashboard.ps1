# Genera Excel dashboard: 02-Cronograma-General-y-Fase-1-SGUEES.xlsx
# Requiere Microsoft Excel. Datos: backlog / ciclo / opciones / drf-cobertura
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$root   = Split-Path $PSScriptRoot -Parent
$csv    = Join-Path $PSScriptRoot 'backlog-sguees.csv'
$csvCiclo = Join-Path $PSScriptRoot 'ciclo-sguees.csv'
$csvOpt = Join-Path $PSScriptRoot 'opciones-sistema.csv'
$csvDrf = Join-Path $PSScriptRoot 'drf-cobertura.csv'
$outDir = Join-Path $root 'Word'
$outXls = Join-Path $outDir '02-Cronograma-General-y-Fase-1-SGUEES.xlsx'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$rows = Import-Csv -Path $csv -Encoding UTF8
$ciclo = Import-Csv -Path $csvCiclo -Encoding UTF8
$opciones = Import-Csv -Path $csvOpt -Encoding UTF8
$drf = Import-Csv -Path $csvDrf -Encoding UTF8

function C([int]$r, [int]$g, [int]$b) { return $r + ($g * 256) + ($b * 65536) }
$Blue   = C 0 51 102
$Gold   = C 201 162 39
$White  = C 255 255 255
$Ink    = C 33 37 41
$Muted  = C 90 98 110
$Card   = C 245 247 250
$Green  = C 39 174 96
$Amber  = C 243 156 18
$Red    = C 192 57 43
$Teal   = C 22 160 133
$Sky    = C 232 242 250
$RowAlt = C 248 250 252
$Blue2  = C 41 128 185
$Purple = C 142 68 173
$Info   = C 52 152 219
$Violet = C 155 89 182
$GrayE  = C 149 165 166
$Pale   = C 200 214 230
$Silver = C 200 200 200
$Line   = C 210 216 222

$xlCenter = -4108
$xlLeft   = -4131
$xlRight  = -4152
$xlSolid  = 1
$xlContinuous = 1
$xlThin = 2
$xlContext = -5002
$xlBar = 57
$xlCol = 51
$xlDoughnut = -4120
$xlUp = -4162
$xlToLeft = -4159
$xlFilterValues = 7

function Set-Fill($Rg, $Color) {
    $Rg.Interior.Pattern = $xlSolid
    $Rg.Interior.Color = $Color
}
function Set-Font($Rg, $Size, $Bold, $Color, $Name = 'Calibri') {
    $Rg.Font.Name = $Name
    $Rg.Font.Size = $Size
    $Rg.Font.Bold = $Bold
    $Rg.Font.Color = $Color
}
function Set-Border($Rg) {
    $Rg.Borders.LineStyle = $xlContinuous
    $Rg.Borders.Weight = $xlThin
    $Rg.Borders.Color = $Line
}

if (Test-Path $outXls) { Remove-Item $outXls -Force }

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$excel.ScreenUpdating = $false
$wb = $excel.Workbooks.Add()
while ($wb.Worksheets.Count -lt 9) { $null = $wb.Worksheets.Add() }

$wsDash  = $wb.Worksheets.Item(1); $wsDash.Name  = '01 Dashboard'
$wsBack  = $wb.Worksheets.Item(2); $wsBack.Name  = '02 Backlog'
$wsFases = $wb.Worksheets.Item(3); $wsFases.Name = '03 Ciclo de vida'
$wsTH    = $wb.Worksheets.Item(4); $wsTH.Name    = '04 Talento Humano'
$wsCF    = $wb.Worksheets.Item(5); $wsCF.Name    = '05 Contabilidad Finanzas'
$wsAC    = $wb.Worksheets.Item(6); $wsAC.Name    = '06 Academico'
$wsCfg   = $wb.Worksheets.Item(7); $wsCfg.Name   = '07 Como actualizar'
$wsOpt   = $wb.Worksheets.Item(8); $wsOpt.Name   = '08 Opciones sistema'
$wsDrf   = $wb.Worksheets.Item(9); $wsDrf.Name   = '09 DRF cobertura'

# ===== CONFIG / LEYENDA =====
$wsCfg.Tab.Color = $Muted
Set-Fill $wsCfg.Range('A1:G2') $Blue
Set-Font $wsCfg.Range('A1') 18 $true $White
$wsCfg.Range('A1').Value2 = 'Como actualizar este tablero'
$wsCfg.Range('A1:G2').Merge()
$wsCfg.Range('A1').VerticalAlignment = $xlCenter

$wsCfg.Range('A4').Value2 = 'Este archivo es el cronograma vivo. Hay dos lecturas de avance que no se mezclan.'
Set-Font $wsCfg.Range('A4') 12 $true $Ink

$txt = @(
    @('A', 'Corte CTD T2 2026 (oficial): proyecto 17% a 2028; fases abiertas 48%; TH 8%; Finanzas 6%; Academico 4%. Se edita en 03 Ciclo de vida.'),
    @('B', 'Avance de modulo: usted escribe el % en 02 Backlog, columna Desarrollo (75%, 80%, etc.). Avance copia ese valor. Si Estado = Por hacer, Avance queda en 0%.'),
    @('C', 'Identificacion DICA (89.5%) NO es avance de modulo. La hoja 09 es el detalle del DRF (que falta / que ya esta); no calcula el % de Desarrollo.'),
    @('D', 'FASE 1 = MVP 2027. Un solo proceso: Identificacion -> Analisis DRF -> Diseno/fundacion -> Desarrollo -> Pruebas -> Implementacion -> Mantenimiento.'),
    @('E', 'El acta del proyecto es el PDF Acuerdos del Directorio Ejecutivo.')
)
$r = 6
foreach ($t in $txt) {
    $wsCfg.Cells.Item($r, 1).Value2 = $t[0]
    $wsCfg.Cells.Item($r, 2).Value2 = $t[1]
    Set-Font $wsCfg.Cells.Item($r, 1) 14 $true $Blue
    Set-Font $wsCfg.Cells.Item($r, 2) 11 $false $Ink
    $wsCfg.Range("B$r").WrapText = $true
    $wsCfg.Rows.Item($r).RowHeight = 36
    $r++
}

Set-Font $wsCfg.Range('A12') 14 $true $Blue
$wsCfg.Range('A12').Value2 = 'Como alimentar el avance (sin regenerar, en Excel)'
$feed = @(
    @('1', 'Hoja 02 Backlog: escriba el % en columna Desarrollo (ejemplo 0.75 o 75%). Avance se actualiza solo. Use 75%, 80% o el valor que corresponda.'),
    @('2', 'Nuevo DRF: en hoja 09 borre la fila RF-00 de ese BacklogID y agregue RF-01, RF-02... (detalle cualitativo; no mueve el %).'),
    @('3', 'Catalogos de apoyo: TipoReq=CAT. No entran al %. TipoReq=FUTURO tampoco (queda en el DRF pero no baja el desarrollo del proceso nucleo).'),
    @('4', 'Nueva pantalla en SGUEES: agregue fila en hoja 08 (Modulo, Ruta, Titulo, Tipo, EstadoSistema, BacklogID).'),
    @('5', 'Procedimiento nuevo: fila en 02 Backlog (ID TH-05 / CF-05 / AC-06...) y filas RF en 09.'),
    @('6', 'Estado Por hacer: Avance queda en 0% aunque Desarrollo tenga otro valor. No use Identificacion DICA como avance de modulo.'),
    @('7', 'Datos > Actualizar todo si una formula queda en cache. No edite las celdas % del Dashboard: son formulas.')
)
$r = 13
foreach ($t in $feed) {
    $wsCfg.Cells.Item($r, 1).Value2 = $t[0]
    $wsCfg.Cells.Item($r, 2).Value2 = $t[1]
    Set-Font $wsCfg.Cells.Item($r, 1) 12 $true $Teal
    Set-Font $wsCfg.Cells.Item($r, 2) 11 $false $Ink
    $wsCfg.Range("B$r").WrapText = $true
    $wsCfg.Rows.Item($r).RowHeight = 32
    $r++
}

Set-Font $wsCfg.Range('A21') 14 $true $Blue
$wsCfg.Range('A21').Value2 = 'Regenerar desde CSV (cuando llegue un lote de DRF)'
$wsCfg.Range('A22').Value2 = 'Edite drf-cobertura.csv y opciones-sistema.csv (UTF-8). Luego:'
$wsCfg.Range('A23').Value2 = 'powershell -ExecutionPolicy Bypass -File "DOCS\AUDITORIA\scripts\Generar-02-Cronograma-Dashboard.ps1"'
Set-Font $wsCfg.Range('A23') 10 $false $Blue
$wsCfg.Range('A23').WrapText = $true
$wsCfg.Rows.Item(23).RowHeight = 28

$wsCfg.Range('A25').Value2 = 'Estados del backlog'
Set-Font $wsCfg.Range('A25') 14 $true $Blue
$estados = @(
    @('Hecho', 'Entregado / en produccion o cerrado'),
    @('En integracion', 'Modulo ya construido (misma tecnologia); se pasa a SGUEES y se valida. Caso: Compras.'),
    @('En desarrollo', 'Hay pantallas o codigo en curso'),
    @('En analisis', 'Proceso definido; diseno/requerimientos abiertos'),
    @('Definicion', 'Solo levantamiento de procedimiento'),
    @('Por hacer', 'Sin trabajo de sistema. Avance de modulo = 0% (no se muestra progreso).')
)
$r = 26
foreach ($e in $estados) {
    $wsCfg.Cells.Item($r, 1).Value2 = $e[0]
    $wsCfg.Cells.Item($r, 2).Value2 = $e[1]
    $r++
}

$wsCfg.Range('A33').Value2 = 'Estados de un RF (hoja 09)'
Set-Font $wsCfg.Range('A33') 14 $true $Blue
$rfEst = @(
    @('Construido', 'Cubre el RF del DRF (100%)'),
    @('Parcial', 'Hay pantalla o flujo, faltan reglas o estados (50%)'),
    @('No iniciado', 'El DRF lo pide y no hay opcion (0%)'),
    @('Sin DRF', 'Aun no se cargo el documento; no entra al promedio')
)
$r = 34
foreach ($e in $rfEst) {
    $wsCfg.Cells.Item($r, 1).Value2 = $e[0]
    $wsCfg.Cells.Item($r, 2).Value2 = $e[1]
    $r++
}

$wsCfg.Columns.Item(1).ColumnWidth = 18
$wsCfg.Columns.Item(2).ColumnWidth = 110
$wsCfg.Range('A1:G40').HorizontalAlignment = $xlLeft

# ===== 08 OPCIONES SISTEMA =====
$wsOpt.Tab.Color = $Blue2
Set-Fill $wsOpt.Range('A1:F3') $Blue
Set-Font $wsOpt.Range('A1') 18 $true $White
$wsOpt.Range('A1').Value2 = 'OPCIONES YA EN SGUEES  |  Inventario de pantallas'
$wsOpt.Range('A1:F1').Merge()
Set-Font $wsOpt.Range('A2') 11 $false $White
$wsOpt.Range('A2').Value2 = 'Fuente: routing SPA. Agregue filas cuando entre una pantalla nueva. Filtro por Modulo o BacklogID.'
$wsOpt.Range('A2:F2').Merge()

$wsOpt.Range('A4').Value2 = 'Total opciones'
Set-Font $wsOpt.Range('A4') 11 $true $Blue
Set-Font $wsOpt.Range('B4') 18 $true $Blue2

$optHdr = @('Modulo','Ruta','Titulo','Tipo','EstadoSistema','BacklogID')
for ($c = 1; $c -le $optHdr.Count; $c++) {
    $cell = $wsOpt.Cells.Item(6, $c)
    $cell.Value2 = $optHdr[$c-1]
    Set-Fill $cell $Blue
    Set-Font $cell 10 $true $White
}
$oi = 0
foreach ($row in $opciones) {
    $r = 7 + $oi
    $wsOpt.Cells.Item($r, 1).Value2 = $row.Modulo
    $wsOpt.Cells.Item($r, 2).Value2 = $row.Ruta
    $wsOpt.Cells.Item($r, 3).Value2 = $row.Titulo
    $wsOpt.Cells.Item($r, 4).Value2 = $row.Tipo
    $wsOpt.Cells.Item($r, 5).Value2 = $row.EstadoSistema
    $wsOpt.Cells.Item($r, 6).Value2 = $row.BacklogID
    $wsOpt.Range("A$r:F$r").Font.Name = 'Calibri'
    $wsOpt.Range("A$r:F$r").Font.Size = 10
    if ($oi % 2 -eq 1) { Set-Fill $wsOpt.Range("A$r:F$r") $RowAlt }
    $oi++
}
$optLast = 6 + $opciones.Count
$loO = $wsOpt.ListObjects.Add(1, $wsOpt.Range("A6:F$optLast"), $null, 1)
$loO.Name = 'tblOpciones'
$loO.TableStyle = 'TableStyleMedium2'
$wsOpt.Range('B4').Formula = '=COUNTA(tblOpciones[Ruta])'
$wsOpt.Columns.Item(1).ColumnWidth = 16
$wsOpt.Columns.Item(2).ColumnWidth = 42
$wsOpt.Columns.Item(3).ColumnWidth = 42
$wsOpt.Columns.Item(4).ColumnWidth = 16
$wsOpt.Columns.Item(5).ColumnWidth = 14
$wsOpt.Columns.Item(6).ColumnWidth = 12
$wsOpt.Activate() | Out-Null
$wsOpt.Range('A6').AutoFilter() | Out-Null
$wsOpt.Application.ActiveWindow.SplitRow = 6
$wsOpt.Application.ActiveWindow.FreezePanes = $true

# ===== 09 DRF COBERTURA =====
$wsDrf.Tab.Color = $Teal
Set-Fill $wsDrf.Range('A1:L3') $Blue
Set-Font $wsDrf.Range('A1') 18 $true $White
$wsDrf.Range('A1').Value2 = 'COBERTURA DRF vs SGUEES  |  Avance tecnico alimentable'
$wsDrf.Range('A1:L1').Merge()
Set-Font $wsDrf.Range('A2') 11 $false $White
$wsDrf.Range('A2').Value2 = 'TH-01 Seleccion VF y TH-02 Descriptor VF cargados. Siguientes DRF: reemplace RF-00 y agregue RF. Puntaje: Construido 100% / Parcial 50% / No iniciado 0%.'
$wsDrf.Range('A2:L2').Merge()

$wsDrf.Range('A4').Value2 = 'Promedio RF con DRF'
$wsDrf.Range('B4').NumberFormat = '0%'
Set-Font $wsDrf.Range('A4') 11 $true $Blue
Set-Font $wsDrf.Range('B4') 18 $true $Teal
$wsDrf.Range('C4').Value2 = 'Construido'
$wsDrf.Range('E4').Value2 = 'Parcial'
$wsDrf.Range('G4').Value2 = 'No iniciado'
$wsDrf.Range('I4').Value2 = 'Sin DRF'
Set-Font $wsDrf.Range('C4:I4') 9 $true $Muted
Set-Font $wsDrf.Range('D4') 14 $true $Green
Set-Font $wsDrf.Range('F4') 14 $true $Amber
Set-Font $wsDrf.Range('H4') 14 $true $Red
Set-Font $wsDrf.Range('J4') 14 $true $GrayE

$areaById = @{}
foreach ($brow in $rows) { $areaById[$brow.ID] = $brow.Area }

$drfHdr = @('BacklogID','Area','Procedimiento','CodigoRF','TipoReq','Requerimiento','Fuente','Estado','AvanceRF','OpcionSGUEES','Evidencia','Notas')
for ($c = 1; $c -le $drfHdr.Count; $c++) {
    $cell = $wsDrf.Cells.Item(6, $c)
    $cell.Value2 = $drfHdr[$c-1]
    Set-Fill $cell $Blue
    Set-Font $cell 9 $true $White
    $cell.HorizontalAlignment = $xlCenter
}
$di = 0
foreach ($row in $drf) {
    $r = 7 + $di
    $wsDrf.Cells.Item($r, 1).Value2 = $row.BacklogID
    $aid = $row.BacklogID
    if ($areaById.ContainsKey($aid)) { $wsDrf.Cells.Item($r, 2).Value2 = $areaById[$aid] } else { $wsDrf.Cells.Item($r, 2).Value2 = '' }
    $wsDrf.Cells.Item($r, 3).Value2 = $row.Procedimiento
    $wsDrf.Cells.Item($r, 4).Value2 = $row.CodigoRF
    $wsDrf.Cells.Item($r, 5).Value2 = $row.TipoReq
    $wsDrf.Cells.Item($r, 6).Value2 = $row.Requerimiento
    $wsDrf.Cells.Item($r, 7).Value2 = $row.Fuente
    $wsDrf.Cells.Item($r, 8).Value2 = $row.Estado
    $wsDrf.Cells.Item($r, 9).Formula = "=IF(H$r=""Construido"",1,IF(H$r=""Parcial"",0.5,IF(H$r=""No iniciado"",0,"""")))"
    $wsDrf.Cells.Item($r, 9).NumberFormat = '0%'
    $wsDrf.Cells.Item($r, 10).Value2 = $row.OpcionSGUEES
    $wsDrf.Cells.Item($r, 11).Value2 = $row.Evidencia
    $wsDrf.Cells.Item($r, 12).Value2 = $row.Notas
    $wsDrf.Range("A$r:L$r").Font.Name = 'Calibri'
    $wsDrf.Range("A$r:L$r").Font.Size = 9
    $wsDrf.Range("F$r").WrapText = $true
    $wsDrf.Range("K$r:L$r").WrapText = $true
    $wsDrf.Rows.Item($r).RowHeight = 28
    if ($di % 2 -eq 1) { Set-Fill $wsDrf.Range("A$r:L$r") $RowAlt }
    $di++
}
$drfLast = 6 + $drf.Count
$loD = $wsDrf.ListObjects.Add(1, $wsDrf.Range("A6:L$drfLast"), $null, 1)
$loD.Name = 'tblDRF'
$loD.TableStyle = 'TableStyleMedium2'
$wsDrf.Range('B4').Formula = '=IFERROR(AVERAGEIF(tblDRF[TipoReq],"RF",tblDRF[AvanceRF]),0)'
$wsDrf.Range('D4').Formula = '=COUNTIF(tblDRF[Estado],"Construido")'
$wsDrf.Range('F4').Formula = '=COUNTIF(tblDRF[Estado],"Parcial")'
$wsDrf.Range('H4').Formula = '=COUNTIF(tblDRF[Estado],"No iniciado")'
$wsDrf.Range('J4').Formula = '=COUNTIF(tblDRF[Estado],"Sin DRF")'

$drfColor = @{
    'Construido' = $Green
    'Parcial' = $Amber
    'No iniciado' = $Red
    'Sin DRF' = $GrayE
}
foreach ($k in $drfColor.Keys) {
    $fc = $wsDrf.Range("H7:H$drfLast").FormatConditions.Add(1, 3, $k)
    $fc.Interior.Color = $drfColor[$k]
    $fc.Font.Color = $White
    $fc.Font.Bold = $true
}

$wsDrf.Columns.Item(1).ColumnWidth = 12
$wsDrf.Columns.Item(2).ColumnWidth = 24
$wsDrf.Columns.Item(3).ColumnWidth = 28
$wsDrf.Columns.Item(4).ColumnWidth = 11
$wsDrf.Columns.Item(5).ColumnWidth = 12
$wsDrf.Columns.Item(6).ColumnWidth = 62
$wsDrf.Columns.Item(7).ColumnWidth = 28
$wsDrf.Columns.Item(8).ColumnWidth = 14
$wsDrf.Columns.Item(9).ColumnWidth = 11
$wsDrf.Columns.Item(10).ColumnWidth = 32
$wsDrf.Columns.Item(11).ColumnWidth = 38
$wsDrf.Columns.Item(12).ColumnWidth = 42
$wsDrf.Activate() | Out-Null
$wsDrf.Range('A6').AutoFilter() | Out-Null
$wsDrf.Application.ActiveWindow.SplitRow = 6
$wsDrf.Application.ActiveWindow.FreezePanes = $true

# ===== BACKLOG =====
$wsBack.Tab.Color = $Gold
Set-Fill $wsBack.Range('A1:P3') $Blue
Set-Font $wsBack.Range('A1') 20 $true $White
$wsBack.Range('A1').Value2 = 'BACKLOG SGUEES  |  Tablero de procedimientos y avance'
$wsBack.Range('A1:P1').Merge()
Set-Font $wsBack.Range('A2') 11 $false $White
$wsBack.Range('A2').Value2 = 'FASE 1 = MVP 2027. Escriba el % en Desarrollo (75%, 80%...). Avance copia ese valor. Por hacer = Avance 0%. Corte CTD T2 no se pisa.'
$wsBack.Range('A2:P2').Merge()
Set-Font $wsBack.Range('A3') 10 $false $Gold
$wsBack.Range('A3').Value2 = 'Avance de modulo = Desarrollo. Identificacion DICA no cuenta. Hoja 09 = detalle DRF (no calcula este %).'
$wsBack.Range('A3:P3').Merge()

Set-Font $wsBack.Range('A4:P4') 8 $false $Muted
$wsBack.Range('A4').Value2 = 'Cadena: Identificacion (DICA) -> Analisis DRF (STI) -> Diseno -> Desarrollo -> Pruebas -> Implementacion'
$wsBack.Rows.Item(4).RowHeight = 14

$headers = @(
    'ID','Area','Procedimiento','Modulo SGUEES','Fase','Prioridad','Estado',
    'Identificacion','AnalisisDRF','Diseno','Desarrollo','Pruebas','Implementacion','Avance','Evidencia en sistema','Notas'
)
for ($c = 1; $c -le $headers.Count; $c++) {
    $cell = $wsBack.Cells.Item(5, $c)
    $cell.Value2 = $headers[$c-1]
    Set-Fill $cell $Blue
    Set-Font $cell 10 $true $White
    $cell.HorizontalAlignment = $xlCenter
}

$start = 6
$i = 0
foreach ($row in $rows) {
    $r = $start + $i
    $wsBack.Cells.Item($r, 1).Value2 = $row.ID
    $wsBack.Cells.Item($r, 2).Value2 = $row.Area
    $wsBack.Cells.Item($r, 3).Value2 = $row.Procedimiento
    $wsBack.Cells.Item($r, 4).Value2 = $row.Modulo
    $wsBack.Cells.Item($r, 5).Value2 = $row.Fase
    $wsBack.Cells.Item($r, 6).Value2 = $row.Prioridad
    $wsBack.Cells.Item($r, 7).Value2 = $row.Estado
    $wsBack.Cells.Item($r, 8).Formula = ([math]::Round([int]$row.Ident / 100.0, 4)).ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $wsBack.Cells.Item($r, 9).Formula = ([math]::Round([int]$row.Anal / 100.0, 4)).ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $wsBack.Cells.Item($r, 10).Formula = ([math]::Round([int]$row.Diseno / 100.0, 4)).ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $wsBack.Cells.Item($r, 11).Formula = ([math]::Round([int]$row.Dev / 100.0, 4)).ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $wsBack.Cells.Item($r, 12).Formula = ([math]::Round([int]$row.QA / 100.0, 4)).ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $wsBack.Cells.Item($r, 13).Formula = ([math]::Round([int]$row.Impl / 100.0, 4)).ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $wsBack.Cells.Item($r, 14).Formula = "=IF(G$r=""Por hacer"",0,K$r)"
    $wsBack.Cells.Item($r, 15).Value2 = $row.Evidencia
    $wsBack.Cells.Item($r, 16).Value2 = $row.Notas
    $wsBack.Range("H$r`:N$r").NumberFormat = '0%'
    $wsBack.Range("A$r:P$r").Font.Name = 'Calibri'
    $wsBack.Range("A$r:P$r").Font.Size = 10
    $wsBack.Range("A$r:P$r").Font.Color = $Ink
    $wsBack.Range("O$r:P$r").WrapText = $true
    $wsBack.Rows.Item($r).RowHeight = 32
    if ($i % 2 -eq 1) { Set-Fill $wsBack.Range("A$r:P$r") $RowAlt }
    $i++
}
$last = $start + $rows.Count - 1
$endRow = $last

$rngTbl = $wsBack.Range("A5:P$endRow")
$lo = $wsBack.ListObjects.Add(1, $rngTbl, $null, 1)
$lo.Name = 'tblBacklog'
$lo.TableStyle = 'TableStyleMedium2'

try {
    $cf = $wsBack.Range("N$start`:N$endRow").FormatConditions.AddDatabar()
    $cf.BarColor.Color = $Teal
} catch {}

$estColor = @{
    'Hecho' = $Green
    'En integracion' = $Teal
    'En desarrollo' = $Amber
    'En analisis' = $Info
    'Definicion' = $Violet
    'Por hacer' = $GrayE
}
foreach ($k in $estColor.Keys) {
    $fc = $wsBack.Range("G$start`:G$endRow").FormatConditions.Add(1, 3, $k)
    $fc.Interior.Color = $estColor[$k]
    $fc.Font.Color = $White
    $fc.Font.Bold = $true
}

$wsBack.Columns.Item(1).ColumnWidth = 10
$wsBack.Columns.Item(2).ColumnWidth = 24
$wsBack.Columns.Item(3).ColumnWidth = 52
$wsBack.Columns.Item(4).ColumnWidth = 18
$wsBack.Columns.Item(5).ColumnWidth = 18
$wsBack.Columns.Item(6).ColumnWidth = 11
$wsBack.Columns.Item(7).ColumnWidth = 18
foreach ($c in 8..14) { $wsBack.Columns.Item($c).ColumnWidth = 14 }
$wsBack.Columns.Item(15).ColumnWidth = 42
$wsBack.Columns.Item(16).ColumnWidth = 38
$wsBack.Rows.Item(5).RowHeight = 22
$wsBack.Activate() | Out-Null
$wsBack.Range('A5').AutoFilter() | Out-Null
$wsBack.Application.ActiveWindow.SplitRow = 5
$wsBack.Application.ActiveWindow.FreezePanes = $true

# ===== CICLO DE VIDA (CTD julio 2026) =====
$wsFases.Tab.Color = $Teal
Set-Fill $wsFases.Range('A1:L3') $Blue
Set-Font $wsFases.Range('A1') 18 $true $White
$wsFases.Range('A1').Value2 = 'UN SOLO PROCESO  |  Ciclo de vida SGUEES hacia 2028'
$wsFases.Range('A1:L1').Merge()
Set-Font $wsFases.Range('A2') 11 $false $White
$wsFases.Range('A2').Value2 = 'Fuente: Informe CTD julio 2026. Estos % oficiales NO se pisan con el avance tecnico DRF.'
$wsFases.Range('A2:L2').Merge()

$wsFases.Range('A4').Value2 = 'Proyecto total a 2028'
$wsFases.Range('B4').Formula = '0.17'
$wsFases.Range('B4').NumberFormat = '0%'
Set-Font $wsFases.Range('A4') 11 $true $Blue
Set-Font $wsFases.Range('B4') 18 $true $Blue
$wsFases.Range('C4').Value2 = 'Fases abiertas T2 (Ident+Anal+Diseno+Desarrollo)'
$wsFases.Range('E4').Formula = '0.48'
$wsFases.Range('E4').NumberFormat = '0%'
Set-Font $wsFases.Range('E4') 18 $true $Amber

$fHdr = @('ID','Fase del ciclo','Que incluye','Periodo','AvanceT2','Estado','2026 H1','2026 H2','2027 H1','2027 H2','2028 H1','2028 H2')
for ($c = 1; $c -le $fHdr.Count; $c++) {
    $cell = $wsFases.Cells.Item(6, $c)
    $cell.Value2 = $fHdr[$c-1]
    Set-Fill $cell $Blue
    Set-Font $cell 9 $true $White
    $cell.HorizontalAlignment = $xlCenter
}

$ci = 0
foreach ($row in $ciclo) {
    $r = 7 + $ci
    $wsFases.Cells.Item($r, 1).Value2 = $row.ID
    $wsFases.Cells.Item($r, 2).Value2 = $row.Nombre
    $wsFases.Cells.Item($r, 3).Value2 = $row.Incluye
    $wsFases.Cells.Item($r, 4).Value2 = $row.Periodo
    $wsFases.Cells.Item($r, 5).Formula = ([double]$row.Avance).ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $wsFases.Cells.Item($r, 5).NumberFormat = '0%'
    $wsFases.Cells.Item($r, 6).Value2 = $row.Estado
    $flags = @($row.H26a,$row.H26b,$row.H27a,$row.H27b,$row.H28a,$row.H28b)
    for ($g = 0; $g -lt 6; $g++) {
        $cell = $wsFases.Cells.Item($r, 7 + $g)
        if ([int]$flags[$g] -eq 1) {
            $cell.Value2 = ' '
            $col = switch ($row.Estado) {
                'En curso'    { $Amber }
                'Planificado' { $Info }
                default       { $GrayE }
            }
            Set-Fill $cell $col
        } else { Set-Fill $cell $Card }
    }
    $wsFases.Range("C$r").WrapText = $true
    $wsFases.Rows.Item($r).RowHeight = 32
    if ($row.Estado -eq 'En curso') { Set-Font $wsFases.Cells.Item($r, 6) 10 $true $Amber }
    $ci++
}
$cicloLast = 6 + $ciclo.Count
$rngCiclo = $wsFases.Range("A6:L$cicloLast")
$loC = $wsFases.ListObjects.Add(1, $rngCiclo, $null, 1)
$loC.Name = 'tblCiclo'
$loC.TableStyle = 'TableStyleMedium2'
Set-Border $wsFases.Range("A6:L$cicloLast")

$wsFases.Columns.Item(1).ColumnWidth = 8
$wsFases.Columns.Item(2).ColumnWidth = 42
$wsFases.Columns.Item(3).ColumnWidth = 52
$wsFases.Columns.Item(4).ColumnWidth = 14
$wsFases.Columns.Item(5).ColumnWidth = 12
$wsFases.Columns.Item(6).ColumnWidth = 14
for ($c = 7; $c -le 12; $c++) { $wsFases.Columns.Item($c).ColumnWidth = 11 }

$wsFases.Range('A16').Value2 = 'Fundacion tecnica (dentro de Diseno y planificacion, 85%)'
Set-Font $wsFases.Range('A16') 14 $true $Blue
$ftHdr = @('Componente','Que cubre','Estado','Avance')
for ($c = 1; $c -le 4; $c++) {
    $cell = $wsFases.Cells.Item(17, $c)
    $cell.Value2 = $ftHdr[$c-1]
    Set-Fill $cell $Blue
    Set-Font $cell 10 $true $White
}
$ft = @(
    @('Arquitectura SPA + API + BD','Angular 18, .NET 8, SQL 192.168.0.250','En curso','0.85'),
    @('Seguridad y menu','JWT, SEG_*, permisos por opcion','En curso','0.85'),
    @('Estandar de desarrollo','Patron mtto A+/A+P, plantillas STI','En curso','0.80'),
    @('Ambiente productivo','wsclass.uees.edu.sv / scc-API','En curso','0.85'),
    @('Compras (integracion; no cierra Fase 1)','Modulo ya construido; se pasa a SGUEES y se valida','En curso','0.20')
)
for ($i = 0; $i -lt $ft.Count; $i++) {
    $r = 18 + $i
    $wsFases.Cells.Item($r, 1).Value2 = $ft[$i][0]
    $wsFases.Cells.Item($r, 2).Value2 = $ft[$i][1]
    $wsFases.Cells.Item($r, 3).Value2 = $ft[$i][2]
    $wsFases.Cells.Item($r, 4).Formula = $ft[$i][3]
    $wsFases.Cells.Item($r, 4).NumberFormat = '0%'
    $wsFases.Rows.Item($r).RowHeight = 22
}
Set-Border $wsFases.Range('A17:D22')

$wsFases.Range('A24').Value2 = 'MVP 2027 (T1-T2)  =  alcance de la FASE 1 del ERP'
Set-Font $wsFases.Range('A24') 14 $true $Blue
$mvp = @(
    @('Talento Humano','Seleccion y contratacion  |  Descriptor  |  Expediente  |  Planillas (nucleo)'),
    @('Contabilidad y Finanzas','Contabilidad  |  Caja y bancos  |  CxP/Pagos  |  Conciliacion'),
    @('Academico','Admision  |  Socioeconomico  |  Nuevo ingreso  |  Flujo hasta matricula')
)
$wsFases.Cells.Item(25, 1).Value2 = 'Area'
$wsFases.Cells.Item(25, 2).Value2 = 'Procedimientos prioridad A'
Set-Fill $wsFases.Range('A25:B25') $Blue
Set-Font $wsFases.Range('A25:B25') 10 $true $White
for ($i = 0; $i -lt $mvp.Count; $i++) {
    $r = 26 + $i
    $wsFases.Cells.Item($r, 1).Value2 = $mvp[$i][0]
    $wsFases.Cells.Item($r, 2).Value2 = $mvp[$i][1]
    $wsFases.Rows.Item($r).RowHeight = 22
}
Set-Border $wsFases.Range('A25:B28')
$wsFases.Range('A30').Value2 = 'Leyenda Gantt: ambar = en curso  |  azul = planificado  |  gris = pendiente  |  Identificacion DICA no es avance de modulo'
Set-Font $wsFases.Range('A30') 9 $false $Muted

# ===== AREA SHEETS helper =====
function Write-AreaSheet($Ws, $Title, $AreaName, $Color, $Intro) {
    $Ws.Tab.Color = $Color
    Set-Fill $Ws.Range('A1:L3') $Blue
    Set-Font $Ws.Range('A1') 18 $true $White
    $Ws.Range('A1').Value2 = $Title
    $Ws.Range('A1:L1').Merge()
    Set-Font $Ws.Range('A2') 11 $false $White
    $Ws.Range('A2').Value2 = $Intro
    $Ws.Range('A2:L2').Merge()

    Set-Font $Ws.Range('A4') 12 $true $Blue
    $Ws.Range('A4').Value2 = 'Avance tecnico del area'
    $Ws.Range('B4').Formula = "=IFERROR(AVERAGEIFS(tblBacklog[Avance],tblBacklog[Area],""$AreaName"",tblBacklog[Estado],""<>Por hacer""),0)"
    $Ws.Range('B4').NumberFormat = '0%'
    Set-Font $Ws.Range('B4') 18 $true $Color
    $Ws.Range('C4').Value2 = '(promedio de columna Desarrollo; Por hacer no entra)'
    Set-Font $Ws.Range('C4') 9 $false $Muted

    $ah = @('ID','Procedimiento','Modulo','Estado','Identificacion','AnalisisDRF','Diseno','Desarrollo','Pruebas','Implementacion','Avance','Evidencia')
    for ($c = 1; $c -le $ah.Count; $c++) {
        $cell = $Ws.Cells.Item(6, $c)
        $cell.Value2 = $ah[$c-1]
        Set-Fill $cell $Blue
        Set-Font $cell 10 $true $White
    }

    $rr = 7
    foreach ($row in ($script:rows | Where-Object { $_.Area -eq $AreaName })) {
        $Ws.Cells.Item($rr, 1).Value2 = $row.ID
        $Ws.Cells.Item($rr, 2).Value2 = $row.Procedimiento
        $Ws.Cells.Item($rr, 3).Value2 = $row.Modulo
        $Ws.Cells.Item($rr, 4).Value2 = $row.Estado
        $id = $row.ID
        $Ws.Cells.Item($rr, 5).Formula = "=IFERROR(INDEX(tblBacklog[Identificacion],MATCH(""$id"",tblBacklog[ID],0)),0)"
        $Ws.Cells.Item($rr, 6).Formula = "=IFERROR(INDEX(tblBacklog[AnalisisDRF],MATCH(""$id"",tblBacklog[ID],0)),0)"
        $Ws.Cells.Item($rr, 7).Formula = "=IFERROR(INDEX(tblBacklog[Diseno],MATCH(""$id"",tblBacklog[ID],0)),0)"
        $Ws.Cells.Item($rr, 8).Formula = "=IFERROR(INDEX(tblBacklog[Desarrollo],MATCH(""$id"",tblBacklog[ID],0)),0)"
        $Ws.Cells.Item($rr, 9).Formula = "=IFERROR(INDEX(tblBacklog[Pruebas],MATCH(""$id"",tblBacklog[ID],0)),0)"
        $Ws.Cells.Item($rr, 10).Formula = "=IFERROR(INDEX(tblBacklog[Implementacion],MATCH(""$id"",tblBacklog[ID],0)),0)"
        $Ws.Cells.Item($rr, 11).Formula = "=IFERROR(INDEX(tblBacklog[Avance],MATCH(""$id"",tblBacklog[ID],0)),0)"
        $Ws.Cells.Item($rr, 12).Value2 = $row.Evidencia
        $Ws.Range("E$rr`:K$rr").NumberFormat = '0%'
        $Ws.Rows.Item($rr).RowHeight = 28
        $Ws.Range("B$rr").WrapText = $true
        $Ws.Range("L$rr").WrapText = $true
        $rr++
    }
    $lastA = $rr - 1
    Set-Border $Ws.Range("A6:L$lastA")
    $cf2 = $Ws.Range("K7:K$lastA").FormatConditions.AddDatabar()
    $cf2.BarColor.Color = $Color
    $Ws.Columns.Item(1).ColumnWidth = 10
    $Ws.Columns.Item(2).ColumnWidth = 42
    $Ws.Columns.Item(3).ColumnWidth = 16
    $Ws.Columns.Item(4).ColumnWidth = 12
    $Ws.Columns.Item(5).ColumnWidth = 16
    foreach ($c in 6..11) { $Ws.Columns.Item($c).ColumnWidth = 13 }
    $Ws.Columns.Item(12).ColumnWidth = 48
    return $lastA
}

$script:rows = $rows
$thLast = Write-AreaSheet $wsTH 'TALENTO HUMANO  |  FASE 1 MVP 2027' 'Talento Humano' $Teal 'DRF cargados: Seleccion VF y Descriptor VF. Corte CTD T2 oficial TH 8%. El % de Desarrollo se escribe en 02 Backlog.'
$null = Write-AreaSheet $wsCF 'CONTABILIDAD Y FINANZAS  |  FASE 1 MVP 2027' 'Contabilidad y Finanzas' $Blue2 'Escriba el % en 02 Backlog columna Desarrollo. Corte CTD T2 oficial Finanzas 6%. Cargar DRF en hoja 09 como detalle.'
$null = Write-AreaSheet $wsAC 'ACADEMICO  |  FASE 1 MVP 2027' 'Academico' $Purple 'Sin DRF academico aun. Operacion actual en CLASS. Corte CTD T2 oficial Academico 4%.'

$drfBlk = $thLast + 2
$wsTH.Range("A$drfBlk").Value2 = 'Detalle DRF vs sistema (solo RF; CAT no entra al %)'
Set-Font $wsTH.Range("A$drfBlk") 13 $true $Blue
$h = $drfBlk + 1
$thDrfH = @('ID','Procedimiento','RF construidos','RF parciales','RF no iniciados','Avance RF','Catalogos OK','Opciones en sistema')
for ($c = 1; $c -le $thDrfH.Count; $c++) {
    $cell = $wsTH.Cells.Item($h, $c)
    $cell.Value2 = $thDrfH[$c-1]
    Set-Fill $cell $Blue
    Set-Font $cell 9 $true $White
}
$thIds = @(@('TH-01','Seleccion y contratacion'), @('TH-02','Descriptor de puesto'), @('TH-03','Expediente de empleado'), @('TH-04','Planilla (nucleo)'))
for ($i = 0; $i -lt $thIds.Count; $i++) {
    $r = $h + 1 + $i
    $id = $thIds[$i][0]
    $wsTH.Cells.Item($r, 1).Value2 = $id
    $wsTH.Cells.Item($r, 2).Value2 = $thIds[$i][1]
    $wsTH.Cells.Item($r, 3).Formula = "=COUNTIFS(tblDRF[BacklogID],""$id"",tblDRF[TipoReq],""RF"",tblDRF[Estado],""Construido"")"
    $wsTH.Cells.Item($r, 4).Formula = "=COUNTIFS(tblDRF[BacklogID],""$id"",tblDRF[TipoReq],""RF"",tblDRF[Estado],""Parcial"")"
    $wsTH.Cells.Item($r, 5).Formula = "=COUNTIFS(tblDRF[BacklogID],""$id"",tblDRF[TipoReq],""RF"",tblDRF[Estado],""No iniciado"")"
    $wsTH.Cells.Item($r, 6).Formula = "=IFERROR(AVERAGEIFS(tblDRF[AvanceRF],tblDRF[BacklogID],""$id"",tblDRF[TipoReq],""RF""),""Sin DRF"")"
    $wsTH.Cells.Item($r, 6).NumberFormat = '0%'
    $wsTH.Cells.Item($r, 7).Formula = "=COUNTIFS(tblDRF[BacklogID],""$id"",tblDRF[TipoReq],""CAT"",tblDRF[Estado],""Construido"")"
    $wsTH.Cells.Item($r, 8).Formula = "=COUNTIF(tblOpciones[BacklogID],""$id"")"
    $wsTH.Rows.Item($r).RowHeight = 22
}
Set-Border $wsTH.Range("A$h`:H$($h+4)")
try {
    $cfTh = $wsTH.Range("F$($h+1):F$($h+4)").FormatConditions.AddDatabar()
    $cfTh.BarColor.Color = $Teal
} catch {}

$wsCF.Range('A13').Value2 = 'Compras (PL-01) esta En integracion: ya construido en la misma tecnologia; se pasa a SGUEES y se valida. No cierra el ERP. Inventario COM_ en hoja 08. Socioeconomico va en Academico segun CTD julio 2026.'
Set-Font $wsCF.Range('A13') 10 $true $Blue
$wsCF.Range('A13:L13').Merge()
$wsCF.Range('A13').WrapText = $true
$wsCF.Rows.Item(13).RowHeight = 32

# ===== DASHBOARD =====
$wsDash.Tab.Color = $Gold
$wsDash.Activate() | Out-Null
$excel.ActiveWindow.DisplayGridlines = $false
$wsDash.Range('A1:P55').Interior.Color = $White

Set-Fill $wsDash.Range('A1:P4') $Blue
Set-Font $wsDash.Range('A1') 22 $true $White
$wsDash.Range('A1').Value2 = 'SGUEES  |  Fase 1 (MVP 2027)  |  Un solo proceso'
$wsDash.Range('A1:P1').Merge()
$wsDash.Range('A1').VerticalAlignment = $xlCenter
Set-Fill $wsDash.Range('A4:P4') $Gold
Set-Font $wsDash.Range('A2') 12 $false $White
$wsDash.Range('A2').Value2 = 'Alineado al Informe CTD julio 2026  -  Universidad Evangelica de El Salvador  -  STI'
$wsDash.Range('A2:P2').Merge()
Set-Font $wsDash.Range('A3') 10 $false $Pale
$wsDash.Range('A3').Value2 = 'Arriba: corte oficial CTD  |  Centro: DRF consolidado por area + opciones  |  Desarrollo se escribe en 02 Backlog  |  Acta = Acuerdos del Directorio Ejecutivo'
$wsDash.Range('A3:P3').Merge()
$wsDash.Rows.Item(1).RowHeight = 32
$wsDash.Rows.Item(2).RowHeight = 18
$wsDash.Rows.Item(3).RowHeight = 16
$wsDash.Rows.Item(4).RowHeight = 6

$wsDash.Range('A70').Value2 = 'kpi_proyecto'
$wsDash.Range('B70').Formula = "='03 Ciclo de vida'!B4"
$wsDash.Range('A71').Value2 = 'kpi_abiertas'
$wsDash.Range('B71').Formula = "='03 Ciclo de vida'!E4"
$wsDash.Range('A72').Value2 = 'kpi_diseno'
$wsDash.Range('B72').Formula = '=IFERROR(INDEX(tblCiclo[AvanceT2],3),0)'
$wsDash.Range('A73').Value2 = 'kpi_dev'
$wsDash.Range('B73').Formula = '=IFERROR(INDEX(tblCiclo[AvanceT2],4),0)'
$wsDash.Range('A74').Value2 = 'kpi_th'
$wsDash.Range('B74').Formula = '=IFERROR(AVERAGEIFS(tblBacklog[Avance],tblBacklog[Area],"Talento Humano",tblBacklog[Estado],"<>Por hacer"),0)'
$wsDash.Range('A75').Value2 = 'kpi_cf'
$wsDash.Range('B75').Formula = '=IFERROR(AVERAGEIFS(tblBacklog[Avance],tblBacklog[Area],"Contabilidad y Finanzas",tblBacklog[Estado],"<>Por hacer"),0)'
$wsDash.Range('A76').Value2 = 'kpi_ac'
$wsDash.Range('B76').Formula = '=IFERROR(AVERAGEIFS(tblBacklog[Avance],tblBacklog[Area],"Academico",tblBacklog[Estado],"<>Por hacer"),0)'
$wsDash.Range('A77').Value2 = 'kpi_drf_th'
$wsDash.Range('B77').Formula = '=IF(COUNTIFS(tblDRF[Area],"Talento Humano",tblDRF[TipoReq],"RF")=0,"Sin DRF",IFERROR(AVERAGEIFS(tblDRF[AvanceRF],tblDRF[Area],"Talento Humano",tblDRF[TipoReq],"RF"),0))'
$wsDash.Range('A78').Value2 = 'kpi_drf_cf'
$wsDash.Range('B78').Formula = '=IF(COUNTIFS(tblDRF[Area],"Contabilidad y Finanzas",tblDRF[TipoReq],"RF")=0,"Sin DRF",IFERROR(AVERAGEIFS(tblDRF[AvanceRF],tblDRF[Area],"Contabilidad y Finanzas",tblDRF[TipoReq],"RF"),0))'
$wsDash.Range('A79').Value2 = 'kpi_drf_ac'
$wsDash.Range('B79').Formula = '=IF(COUNTIFS(tblDRF[Area],"Academico",tblDRF[TipoReq],"RF")=0,"Sin DRF",IFERROR(AVERAGEIFS(tblDRF[AvanceRF],tblDRF[Area],"Academico",tblDRF[TipoReq],"RF"),0))'
$wsDash.Range('A80').Value2 = 'kpi_opt'
$wsDash.Range('B80').Formula = '=COUNTA(tblOpciones[Ruta])'
$wsDash.Range('B70:B76').NumberFormat = '0%'

$blocks = @(
    @{C1='A'; C2='C'; Lab='PROYECTO A 2028'; F='=B70'; S='Corte CTD T2 (oficial)'; Col=$Blue},
    @{C1='D'; C2='F'; Lab='FASES ABIERTAS T2'; F='=B71'; S='Ident + Anal + Diseno + Desarrollo'; Col=$Amber},
    @{C1='G'; C2='I'; Lab='DISENO / FUNDACION'; F='=B72'; S='Arquitectura, seguridad, estandar'; Col=$Teal},
    @{C1='J'; C2='L'; Lab='DESARROLLO CTD'; F='=B73'; S='Oficial ciclo; no es el % DRF'; Col=$Blue2},
    @{C1='M'; C2='P'; Lab='IDENTIFICACION DICA'; F='=IFERROR(INDEX(tblCiclo[AvanceT2],1),0)'; S='No es avance de modulo'; Col=$Violet}
)
foreach ($b in $blocks) {
    $wsDash.Range("$($b.C1)6:$($b.C2)6").Merge()
    $wsDash.Range("$($b.C1)7:$($b.C2)8").Merge()
    $wsDash.Range("$($b.C1)9:$($b.C2)10").Merge()
    Set-Fill $wsDash.Range("$($b.C1)6:$($b.C2)10") $White
    $wsDash.Range("$($b.C1)6:$($b.C2)10").Borders.Color = $b.Col
    $wsDash.Range("$($b.C1)6:$($b.C2)10").Borders.Weight = 3
    $lab = $wsDash.Range("$($b.C1)6")
    $lab.Value2 = $b.Lab
    Set-Font $lab 9 $true $b.Col
    $lab.HorizontalAlignment = $xlCenter
    $val = $wsDash.Range("$($b.C1)7")
    $val.Formula = $b.F
    $val.NumberFormat = '0%'
    Set-Font $val 28 $true $b.Col
    $val.HorizontalAlignment = $xlCenter
    $val.VerticalAlignment = $xlCenter
    $sub = $wsDash.Range("$($b.C1)9")
    $sub.Value2 = $b.S
    Set-Font $sub 8 $false $Muted
    $sub.HorizontalAlignment = $xlCenter
    $sub.WrapText = $true
}

Set-Font $wsDash.Range('A12') 14 $true $Blue
$wsDash.Range('A12').Value2 = 'Avance tecnico por area (columna Desarrollo del backlog; Por hacer no entra)'
$modK = @(
    @{C1=1; Lab='TALENTO HUMANO'; F='=B74'; Col=$Teal; S='CTD T2 oficial 8%'},
    @{C1=4; Lab='CONTAB. Y FINANZAS'; F='=B75'; Col=$Blue2; S='CTD T2 oficial 6%'},
    @{C1=7; Lab='ACADEMICO'; F='=B76'; Col=$Purple; S='CTD T2 oficial 4%'}
)
foreach ($m in $modK) {
    $c1 = $m.C1
    $c2 = $c1 + 2
    $wsDash.Range($wsDash.Cells.Item(13, $c1), $wsDash.Cells.Item(13, $c2)).Merge()
    $wsDash.Range($wsDash.Cells.Item(14, $c1), $wsDash.Cells.Item(15, $c2)).Merge()
    $top = $wsDash.Cells.Item(13, $c1)
    $top.Value2 = $m.Lab
    Set-Font $top 9 $true $White
    $top.HorizontalAlignment = $xlCenter
    Set-Fill $wsDash.Range($wsDash.Cells.Item(13, $c1), $wsDash.Cells.Item(13, $c2)) $m.Col
    $num = $wsDash.Cells.Item(14, $c1)
    $num.Formula = $m.F
    $num.NumberFormat = '0%'
    Set-Font $num 22 $true $m.Col
    $num.HorizontalAlignment = $xlCenter
    $num.VerticalAlignment = $xlCenter
    Set-Fill $wsDash.Range($wsDash.Cells.Item(14, $c1), $wsDash.Cells.Item(15, $c2)) $Card
    $wsDash.Cells.Item(16, $c1).Value2 = $m.S
    Set-Font $wsDash.Cells.Item(16, $c1) 8 $false $Muted
}

Set-Font $wsDash.Range('J12') 14 $true $Blue
$wsDash.Range('J12').Value2 = 'Kanban backlog'
$kan = @('En desarrollo','En integracion','En analisis','Definicion','Por hacer')
$kanCol = @($Amber, $Teal, $Info, $Violet, $GrayE)
for ($i = 0; $i -lt $kan.Count; $i++) {
    $col = 10 + $i
    $wsDash.Cells.Item(13, $col).Value2 = $kan[$i]
    Set-Fill $wsDash.Cells.Item(13, $col) $kanCol[$i]
    Set-Font $wsDash.Cells.Item(13, $col) 7 $true $White
    $wsDash.Cells.Item(13, $col).HorizontalAlignment = $xlCenter
    $wsDash.Cells.Item(13, $col).WrapText = $true
    $name = $kan[$i]
    $wsDash.Cells.Item(14, $col).Formula = "=COUNTIF(tblBacklog[Estado],""$name"")"
    Set-Font $wsDash.Cells.Item(14, $col) 16 $true $kanCol[$i]
    $wsDash.Cells.Item(14, $col).HorizontalAlignment = $xlCenter
}

Set-Font $wsDash.Range('A18') 14 $true $Blue
$wsDash.Range('A18').Value2 = 'Avance DRF consolidado por area  |  alimente estados en hoja 09'
$tech = @(
    @{C1='A'; C2='C'; Lab='DRF TALENTO HUMANO'; F='=B77'; S='Promedio RF del area'; Col=$Teal; Pct=$true},
    @{C1='D'; C2='F'; Lab='DRF CONTAB. Y FINANZAS'; F='=B78'; S='Sin DRF = no hay RF cargados'; Col=$Blue2; Pct=$true},
    @{C1='G'; C2='I'; Lab='DRF ACADEMICO'; F='=B79'; S='Sin DRF = no hay RF cargados'; Col=$Purple; Pct=$true},
    @{C1='J'; C2='L'; Lab='OPCIONES EN SISTEMA'; F='=B80'; S='Total pantallas hoja 08'; Col=$Violet; Pct=$false}
)
foreach ($b in $tech) {
    $wsDash.Range("$($b.C1)19:$($b.C2)19").Merge()
    $wsDash.Range("$($b.C1)20:$($b.C2)21").Merge()
    $wsDash.Range("$($b.C1)22:$($b.C2)22").Merge()
    Set-Fill $wsDash.Range("$($b.C1)19:$($b.C2)22") $White
    $wsDash.Range("$($b.C1)19:$($b.C2)22").Borders.Color = $b.Col
    $wsDash.Range("$($b.C1)19:$($b.C2)22").Borders.Weight = 3
    $lab = $wsDash.Range("$($b.C1)19")
    $lab.Value2 = $b.Lab
    Set-Font $lab 8 $true $b.Col
    $lab.HorizontalAlignment = $xlCenter
    $val = $wsDash.Range("$($b.C1)20")
    $val.Formula = $b.F
    if ($b.Pct) { $val.NumberFormat = '0%' } else { $val.NumberFormat = '0' }
    Set-Font $val 22 $true $b.Col
    $val.HorizontalAlignment = $xlCenter
    $val.VerticalAlignment = $xlCenter
    $sub = $wsDash.Range("$($b.C1)22")
    $sub.Value2 = $b.S
    Set-Font $sub 8 $false $Muted
    $sub.HorizontalAlignment = $xlCenter
}

Set-Font $wsDash.Range('A24') 12 $true $Blue
$wsDash.Range('A24').Value2 = 'Opciones ya en SGUEES (conteo por modulo)'
$modN = @('Seleccion','Planilla','Contabilidad','Bancos','Compras','General','Seguridad')
for ($i = 0; $i -lt $modN.Count; $i++) {
    $c = $i + 1
    $wsDash.Cells.Item(25, $c).Value2 = $modN[$i]
    Set-Fill $wsDash.Cells.Item(25, $c) $Blue
    Set-Font $wsDash.Cells.Item(25, $c) 8 $true $White
    $wsDash.Cells.Item(25, $c).HorizontalAlignment = $xlCenter
    $name = $modN[$i]
    $wsDash.Cells.Item(26, $c).Formula = "=COUNTIF(tblOpciones[Modulo],""$name"")"
    Set-Font $wsDash.Cells.Item(26, $c) 14 $true $Blue
    $wsDash.Cells.Item(26, $c).HorizontalAlignment = $xlCenter
}
Set-Border $wsDash.Range('A25:G26')
$wsDash.Range('H25').Value2 = 'Detalle en hoja 08'
Set-Font $wsDash.Range('H25') 9 $false $Muted

Set-Font $wsDash.Range('A28') 12 $true $Blue
$wsDash.Range('A28').Value2 = 'Ciclo de vida (corte oficial CTD)'
$stg = @('Identificacion','Analisis DRF','Diseno','Desarrollo','Pruebas','Implementacion','Mantenimiento')
for ($i = 0; $i -lt 7; $i++) {
    $c = $i + 1
    $wsDash.Cells.Item(29, $c).Value2 = $stg[$i]
    Set-Fill $wsDash.Cells.Item(29, $c) $Blue
    Set-Font $wsDash.Cells.Item(29, $c) 8 $true $White
    $wsDash.Cells.Item(29, $c).HorizontalAlignment = $xlCenter
    $idx = $i + 1
    $wsDash.Cells.Item(30, $c).Formula = "=IFERROR(INDEX(tblCiclo[AvanceT2],$idx),0)"
    $wsDash.Cells.Item(30, $c).NumberFormat = '0%'
    Set-Font $wsDash.Cells.Item(30, $c) 14 $true $Blue
    $wsDash.Cells.Item(30, $c).HorizontalAlignment = $xlCenter
}
Set-Border $wsDash.Range('A29:G30')

Set-Font $wsDash.Range('A32') 14 $true $Blue
$wsDash.Range('A32').Value2 = 'Avance por procedimiento (Desarrollo tecnico; detalle editable en 02 y 09)'
$wsDash.Range('A33').Value2 = 'Procedimiento'
$wsDash.Range('B33').Value2 = 'Area'
$wsDash.Range('C33').Value2 = 'Estado'
$wsDash.Range('D33').Value2 = 'Avance'
$wsDash.Range('E33').Value2 = 'DRF'
Set-Fill $wsDash.Range('A33:E33') $Blue
Set-Font $wsDash.Range('A33:E33') 10 $true $White

for ($i = 0; $i -lt $rows.Count; $i++) {
    $r = 34 + $i
    $idx = $i + 1
    $id = $rows[$i].ID
    $wsDash.Cells.Item($r, 1).Formula = "=INDEX(tblBacklog[Procedimiento],$idx)"
    $wsDash.Cells.Item($r, 2).Formula = "=INDEX(tblBacklog[Area],$idx)"
    $wsDash.Cells.Item($r, 3).Formula = "=INDEX(tblBacklog[Estado],$idx)"
    $wsDash.Cells.Item($r, 4).Formula = "=INDEX(tblBacklog[Avance],$idx)"
    $wsDash.Cells.Item($r, 4).NumberFormat = '0%'
    $wsDash.Cells.Item($r, 5).Formula = "=IF(COUNTIFS(tblDRF[BacklogID],""$id"",tblDRF[TipoReq],""RF"")>0,""Cargado"",""Pendiente"")"
    $wsDash.Rows.Item($r).RowHeight = 18
    Set-Font $wsDash.Range("A$r`:E$r") 9 $false $Ink
}
$dashLast = 33 + $rows.Count
Set-Border $wsDash.Range("A33:E$dashLast")
$cf3 = $wsDash.Range("E34:E$dashLast").FormatConditions.Add(1, 3, 'Cargado')
$cf3.Interior.Color = $Green
$cf3.Font.Color = $White
$cf4 = $wsDash.Range("E34:E$dashLast").FormatConditions.Add(1, 3, 'Pendiente')
$cf4.Interior.Color = $GrayE
$cf4.Font.Color = $White
$cf5 = $wsDash.Range("D34:D$dashLast").FormatConditions.AddDatabar()
$cf5.BarColor.Color = $Gold
foreach ($k in $estColor.Keys) {
    $fcE = $wsDash.Range("C34:C$dashLast").FormatConditions.Add(1, 3, $k)
    $fcE.Interior.Color = $estColor[$k]
    $fcE.Font.Color = $White
    $fcE.Font.Bold = $true
}

$wsDash.Range('R18').Value2 = 'Frente'
$wsDash.Range('S18').Value2 = 'Avance'
$wsDash.Range('R19').Value2 = 'Talento Humano'
$wsDash.Range('S19').Formula = '=B74'
$wsDash.Range('R20').Value2 = 'Contabilidad y Finanzas'
$wsDash.Range('S20').Formula = '=B75'
$wsDash.Range('R21').Value2 = 'Academico'
$wsDash.Range('S21').Formula = '=B76'
$wsDash.Range('S19:S21').NumberFormat = '0%'
$wsDash.Columns.Item(18).Hidden = $true
$wsDash.Columns.Item(19).Hidden = $true

$chart = $wsDash.ChartObjects().Add(400, 620, 380, 210).Chart
$chart.SetSourceData($wsDash.Range('R18:S21'))
$chart.ChartType = 57
$chart.HasTitle = $true
$chart.ChartTitle.Text = 'Avance tecnico Fase 1'
$chart.ChartTitle.Font.Size = 12
$chart.ChartTitle.Font.Color = $Blue
$chart.HasLegend = $false
try { $chart.ApplyLayout(1) | Out-Null } catch {}
try { $chart.SeriesCollection(1).Format.Fill.ForeColor.RGB = $Blue } catch {}

$wsDash.Columns.Item(1).ColumnWidth = 22
$wsDash.Columns.Item(2).ColumnWidth = 16
$wsDash.Columns.Item(3).ColumnWidth = 14
$wsDash.Columns.Item(4).ColumnWidth = 16
$wsDash.Columns.Item(5).ColumnWidth = 12
foreach ($c in 6..16) { $wsDash.Columns.Item($c).ColumnWidth = 12 }

$foot = $dashLast + 2
Set-Font $wsDash.Range("A$foot") 9 $false $Muted
$wsDash.Range("A$foot").Value2 = 'STI  |  Ing. Jonathan Avalos  |  Doc 02  |  Corte CTD T2 2026  |  Fase 1 = MVP 2027  |  Alimentar hojas 08 y 09  |  Identificacion DICA no es avance de modulo'
$wsDash.Range("A$foot`:P$foot").Merge()

Set-Font $wsDash.Range('A70:B80') 8 $false $Silver
foreach ($h in 70..80) { $wsDash.Rows.Item($h).Hidden = $true }

$wsDash.PageSetup.Orientation = 2
$wsDash.PageSetup.FitToPagesWide = 1
$wsDash.PageSetup.FitToPagesTall = 1
$wsDash.PageSetup.TopMargin = $excel.InchesToPoints(0.4)
$wsDash.PageSetup.LeftMargin = $excel.InchesToPoints(0.4)

$wb.SaveAs($outXls, 51)
$excel.ScreenUpdating = $true
$wb.Close($true)
$excel.Quit()
[GC]::Collect()
Write-Host "OK $outXls"
Get-Item $outXls | Format-List FullName, Length, LastWriteTime
