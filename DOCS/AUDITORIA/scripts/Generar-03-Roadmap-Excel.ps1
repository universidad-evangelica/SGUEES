# Genera Excel: 03-Roadmap-ERP-SGUEES.xlsx
# Mapa de oleadas 2025-2028. No es cronograma de %. No usa corte CTD.
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$root   = Split-Path $PSScriptRoot -Parent
$csv    = Join-Path $PSScriptRoot 'roadmap-oleadas.csv'
$outDir = Join-Path $root 'Word'
$outXls = Join-Path $outDir '03-Roadmap-ERP-SGUEES.xlsx'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$rows = Import-Csv -Path $csv -Encoding UTF8

function C([int]$r, [int]$g, [int]$b) { return $r + ($g * 256) + ($b * 65536) }
$Blue   = C 0 51 102
$Gold   = C 201 162 39
$White  = C 255 255 255
$Ink    = C 33 37 41
$Muted  = C 90 98 110
$Card   = C 245 247 250
$Teal   = C 22 160 133
$Blue2  = C 41 128 185
$Purple = C 142 68 173
$GrayE  = C 149 165 166
$Line   = C 210 216 222
$RowAlt = C 248 250 252

$xlSolid = 1
$xlContinuous = 1
$xlThin = 2
$xlCenter = -4108
$xlLeft = -4131

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

$oleadaColor = @{
    'Fundacion'      = $Teal
    'MVP'            = $Gold
    'Expansion'      = $Blue2
    'Sostenibilidad' = $GrayE
}

if (Test-Path $outXls) { Remove-Item $outXls -Force }

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$excel.ScreenUpdating = $false
try {
$wb = $excel.Workbooks.Add()
while ($wb.Worksheets.Count -lt 3) { $null = $wb.Worksheets.Add() }

$wsMap = $wb.Worksheets.Item(1); $wsMap.Name = '01 Mapa'
$wsAlc = $wb.Worksheets.Item(2); $wsAlc.Name = '02 Alcance'
$wsCfg = $wb.Worksheets.Item(3); $wsCfg.Name = '03 Como leerlo'

# ===== 03 COMO LEERLO (primero el consejo) =====
$wsCfg.Tab.Color = $Muted
Set-Fill $wsCfg.Range('A1:G2') $Blue
Set-Font $wsCfg.Range('A1') 18 $true $White
$wsCfg.Range('A1').Value2 = 'Como leer un roadmap (si nunca ha armado uno)'
$wsCfg.Range('A1:G2').Merge()
$wsCfg.Range('A1').VerticalAlignment = $xlCenter

$wsCfg.Range('A4').Value2 = 'Analogia'
Set-Font $wsCfg.Range('A4') 14 $true $Blue
$wsCfg.Range('A5').Value2 = 'El roadmap es el mapa de la carretera. Dice por cuales ciudades pasa el viaje y en que ano. No dice el kilometraje de hoy (eso es el cronograma / Excel 02).'
$wsCfg.Range('A5:F5').Merge(); $wsCfg.Range('A5').WrapText = $true
$wsCfg.Rows.Item(5).RowHeight = 36

$wsCfg.Range('A7').Value2 = 'Que mira en cada hoja'
Set-Font $wsCfg.Range('A7') 14 $true $Blue
$guia = @(
    @('01 Mapa', 'Anos arriba, entregables a la izquierda. La barra de color = en esa ventana de tiempo se trabaja o se entrega. No es un %.'),
    @('02 Alcance', 'Que SI entra al MVP 2027 y que queda para despues. Evita que Compras o un catalogo "cierren" el ERP.'),
    @('03 Esta hoja', 'Reglas para no confundirlo con el tablero de avance.')
)
$r = 8
foreach ($g in $guia) {
    $wsCfg.Cells.Item($r, 1).Value2 = $g[0]
    $wsCfg.Cells.Item($r, 2).Value2 = $g[1]
    Set-Font $wsCfg.Cells.Item($r, 1) 11 $true $Blue
    Set-Font $wsCfg.Cells.Item($r, 2) 11 $false $Ink
    $wsCfg.Range("B$r").WrapText = $true
    $wsCfg.Rows.Item($r).RowHeight = 32
    $r++
}

$wsCfg.Range('A12').Value2 = 'Roadmap vs cronograma'
Set-Font $wsCfg.Range('A12') 14 $true $Blue
Set-Fill $wsCfg.Range('A13:C13') $Blue
Set-Font $wsCfg.Range('A13:C13') 10 $true $White
$wsCfg.Range('A13').Value2 = 'Pregunta'
$wsCfg.Range('B13').Value2 = 'Roadmap (este Excel)'
$wsCfg.Range('C13').Value2 = 'Cronograma (Excel 02)'
$cmp = @(
    @('Que responde', 'Hacia donde va el ERP y en que oleada', 'Cuanto lleva hoy cada procedimiento'),
    @('Unidad', 'Anos / semestres', 'Porcentaje (75%, 80%)'),
    @('Cuando se cambia', 'Cambia el alcance o el horizonte', 'Cada vez que avanza el desarrollo'),
    @('Ejemplo', 'Descriptor entra al MVP 2027', 'Descriptor va 70% esta semana')
)
$r = 14
foreach ($c in $cmp) {
    $wsCfg.Cells.Item($r, 1).Value2 = $c[0]
    $wsCfg.Cells.Item($r, 2).Value2 = $c[1]
    $wsCfg.Cells.Item($r, 3).Value2 = $c[2]
    Set-Font $wsCfg.Range("A$r`:C$r") 10 $false $Ink
    $wsCfg.Rows.Item($r).RowHeight = 22
    $r++
}
Set-Border $wsCfg.Range('A13:C17')

$wsCfg.Range('A19').Value2 = 'Como alimentarlo'
Set-Font $wsCfg.Range('A19') 14 $true $Blue
$feed = @(
    @('1', 'En 01 Mapa, las celdas de semestre se pintan si hay 1 en las columnas H del CSV (o pinte/despinte a mano una celda de la barra).'),
    @('2', 'Para mover un entregable de oleada: cambie la columna Oleada (Fundacion / MVP / Expansion / Sostenibilidad). El color sigue a esa palabra.'),
    @('3', 'Para sacar algo del MVP: paselo a Expansion en 01 y en 02 Alcance.'),
    @('4', 'No ponga % aqui. El % se escribe en 02 Cronograma, columna Desarrollo.'),
    @('5', 'Regenerar: edite roadmap-oleadas.csv y ejecute Generar-03-Roadmap-Excel.ps1 (cierre este archivo antes).')
)
$r = 20
foreach ($t in $feed) {
    $wsCfg.Cells.Item($r, 1).Value2 = $t[0]
    $wsCfg.Cells.Item($r, 2).Value2 = $t[1]
    Set-Font $wsCfg.Cells.Item($r, 1) 12 $true $Teal
    $wsCfg.Range("B$r").WrapText = $true
    $wsCfg.Rows.Item($r).RowHeight = 28
    $r++
}

$wsCfg.Columns.Item(1).ColumnWidth = 28
$wsCfg.Columns.Item(2).ColumnWidth = 62
$wsCfg.Columns.Item(3).ColumnWidth = 48

# ===== 02 ALCANCE =====
$wsAlc.Tab.Color = $Gold
Set-Fill $wsAlc.Range('A1:F3') $Blue
Set-Font $wsAlc.Range('A1') 18 $true $White
$wsAlc.Range('A1').Value2 = 'ALCANCE  |  Que entra al nucleo y que no'
$wsAlc.Range('A1:F1').Merge()
Set-Font $wsAlc.Range('A2') 11 $false $White
$wsAlc.Range('A2').Value2 = 'MVP 2027 = nucleo usable. No es todo el ERP. Compras en integracion no cierra la Fase 1.'
$wsAlc.Range('A2:F2').Merge()

Set-Font $wsAlc.Range('A4') 14 $true $Blue
$wsAlc.Range('A4').Value2 = 'SI entra al MVP (Fase 1)'
$inH = @('Frente','Entregable','Hasta donde llega')
for ($c = 1; $c -le 3; $c++) {
    $wsAlc.Cells.Item(5, $c).Value2 = $inH[$c-1]
    Set-Fill $wsAlc.Cells.Item(5, $c) $Teal
    Set-Font $wsAlc.Cells.Item(5, $c) 10 $true $White
}
$inn = @(
    @('Talento Humano','Seleccion y contratacion; Descriptor; Expediente; Planilla nucleo','Flujos de negocio del nucleo; no nomina completa ni clima'),
    @('Contabilidad y Finanzas','Contabilidad; Caja y bancos; CxP/Pagos; Conciliacion','Ciclos operables; no activo fijo ni impuestos'),
    @('Academico','Admision; Socioeconomico; Nuevo ingreso; Matricula','Flujo de ingreso. CLASS opera mientras no este el modulo'),
    @('Plataforma','Compras','Integracion y validacion. Ya estaba construido')
)
for ($i = 0; $i -lt $inn.Count; $i++) {
    $r = 6 + $i
    $wsAlc.Cells.Item($r, 1).Value2 = $inn[$i][0]
    $wsAlc.Cells.Item($r, 2).Value2 = $inn[$i][1]
    $wsAlc.Cells.Item($r, 3).Value2 = $inn[$i][2]
    $wsAlc.Range("B$r`:C$r").WrapText = $true
    $wsAlc.Rows.Item($r).RowHeight = 32
}
Set-Border $wsAlc.Range('A5:C9')

Set-Font $wsAlc.Range('A11') 14 $true $Blue
$wsAlc.Range('A11').Value2 = 'NO entra al MVP (oleada de expansion 2027-2028)'
$outH = @('Frente','Se programa despues')
for ($c = 1; $c -le 2; $c++) {
    $wsAlc.Cells.Item(12, $c).Value2 = $outH[$c-1]
    Set-Fill $wsAlc.Cells.Item(12, $c) $Blue2
    Set-Font $wsAlc.Cells.Item(12, $c) 10 $true $White
}
$outt = @(
    @('Talento Humano','Nomina completa; Separacion; Capacitacion; Induccion; Evaluacion; Clima; Creacion y traspaso de puestos'),
    @('Contabilidad y Finanzas','Caja chica; Activo fijo; Corte de caja; Inventario; Impuestos; CxC; Facturacion electronica'),
    @('Academico','Notas y curricular; Portales; Egresados; Educacion continua; Equivalencias; Cambio de plan'),
    @('Sostenibilidad','Mantenimiento continuo; analitica / bodega de datos cuando el nucleo ya opere')
)
for ($i = 0; $i -lt $outt.Count; $i++) {
    $r = 13 + $i
    $wsAlc.Cells.Item($r, 1).Value2 = $outt[$i][0]
    $wsAlc.Cells.Item($r, 2).Value2 = $outt[$i][1]
    $wsAlc.Range("B$r").WrapText = $true
    $wsAlc.Rows.Item($r).RowHeight = 28
}
Set-Border $wsAlc.Range('A12:B16')

$wsAlc.Range('A18').Value2 = 'Regla de oro: un catalogo visible o Compras integrado no significa que el ERP este terminado. El MVP cierra un nucleo de procesos, no toda la universidad.'
Set-Font $wsAlc.Range('A18') 11 $true $Blue
$wsAlc.Range('A18:F18').Merge(); $wsAlc.Range('A18').WrapText = $true
$wsAlc.Rows.Item(18).RowHeight = 32
$wsAlc.Columns.Item(1).ColumnWidth = 26
$wsAlc.Columns.Item(2).ColumnWidth = 78
$wsAlc.Columns.Item(3).ColumnWidth = 52

# ===== 01 MAPA =====
$wsMap.Tab.Color = $Gold
$wsMap.Activate() | Out-Null
$excel.ActiveWindow.DisplayGridlines = $false
Set-Fill $wsMap.Range('A1:L4') $Blue
Set-Font $wsMap.Range('A1') 22 $true $White
$wsMap.Range('A1').Value2 = 'SGUEES  |  Hoja de ruta ERP  |  2025-2028'
$wsMap.Range('A1:L1').Merge()
Set-Font $wsMap.Range('A2') 12 $false $White
$wsMap.Range('A2').Value2 = 'Mapa de oleadas. No es porcentaje de avance. El % se escribe en el Excel 02 (columna Desarrollo).'
$wsMap.Range('A2:L2').Merge()
Set-Font $wsMap.Range('A3') 10 $false $Gold
$wsMap.Range('A3').Value2 = 'Lectura: cimientos (2025-26)  ->  nucleo usable MVP (2027)  ->  expansion y operacion (2028). CLASS no se apaga al inicio.'
$wsMap.Range('A3:L3').Merge()
$wsMap.Rows.Item(1).RowHeight = 28
$wsMap.Rows.Item(4).RowHeight = 6
Set-Fill $wsMap.Range('A4:L4') $Gold

$cards = @(
    @{C1='A'; C2='C'; T='FUNDACION'; S='2025-2026  |  cimientos'; Col=$Teal},
    @{C1='D'; C2='F'; T='MVP / FASE 1'; S='2026-2027  |  nucleo usable'; Col=$Gold},
    @{C1='G'; C2='I'; T='EXPANSION'; S='2027-2028  |  resto de procesos'; Col=$Blue2},
    @{C1='J'; C2='L'; T='SOSTENIBILIDAD'; S='2028  |  operar y evolucionar'; Col=$GrayE}
)
foreach ($b in $cards) {
    $wsMap.Range("$($b.C1)6:$($b.C2)6").Merge()
    $wsMap.Range("$($b.C1)7:$($b.C2)8").Merge()
    Set-Fill $wsMap.Range("$($b.C1)6:$($b.C2)8") $White
    $wsMap.Range("$($b.C1)6:$($b.C2)8").Borders.Color = $b.Col
    $wsMap.Range("$($b.C1)6:$($b.C2)8").Borders.Weight = 3
    $lab = $wsMap.Range("$($b.C1)6")
    $lab.Value2 = $b.T
    Set-Font $lab 10 $true $b.Col
    $lab.HorizontalAlignment = $xlCenter
    $sub = $wsMap.Range("$($b.C1)7")
    $sub.Value2 = $b.S
    Set-Font $sub 9 $false $Muted
    $sub.HorizontalAlignment = $xlCenter
    $sub.WrapText = $true
}

Set-Font $wsMap.Range('A10') 14 $true $Blue
$wsMap.Range('A10').Value2 = 'Mapa (barra = esa ventana de tiempo)'

$hdr = @('ID','Frente','Entregable','Oleada','2025 H2','2026 H1','2026 H2','2027 H1','2027 H2','2028 H1','2028 H2','Nota')
for ($c = 1; $c -le $hdr.Count; $c++) {
    $cell = $wsMap.Cells.Item(11, $c)
    $cell.Value2 = $hdr[$c-1]
    Set-Fill $cell $Blue
    Set-Font $cell 9 $true $White
    $cell.HorizontalAlignment = $xlCenter
}

$start = 12
$i = 0
foreach ($row in $rows) {
    $rr = $start + $i
    $wsMap.Cells.Item($rr, 1).Value2 = $row.ID
    $wsMap.Cells.Item($rr, 2).Value2 = $row.Frente
    $wsMap.Cells.Item($rr, 3).Value2 = $row.Entregable
    $wsMap.Cells.Item($rr, 4).Value2 = $row.Oleada
    $flags = @($row.H25b,$row.H26a,$row.H26b,$row.H27a,$row.H27b,$row.H28a,$row.H28b)
    $colOle = $oleadaColor[$row.Oleada]
    if (-not $colOle) { $colOle = $GrayE }
    Set-Font $wsMap.Cells.Item($rr, 4) 9 $true $colOle
    for ($g = 0; $g -lt 7; $g++) {
        $cell = $wsMap.Cells.Item($rr, 5 + $g)
        if ([int]$flags[$g] -eq 1) {
            $cell.Value2 = ' '
            Set-Fill $cell $colOle
        } else {
            Set-Fill $cell $Card
        }
    }
    $wsMap.Cells.Item($rr, 12).Value2 = $row.Nota
    $wsMap.Range("C$rr").WrapText = $true
    $wsMap.Range("L$rr").WrapText = $true
    $wsMap.Rows.Item($rr).RowHeight = 22
    Set-Font $wsMap.Range("A$rr`:C$rr") 9 $false $Ink
    Set-Font $wsMap.Range("L$rr") 8 $false $Muted
    if ($i % 2 -eq 1) { Set-Fill $wsMap.Range("A$rr`:D$rr") $RowAlt }
    $i++
}
$last = $start + $rows.Count - 1
Set-Border $wsMap.Range("A11:L$last")
$lo = $wsMap.ListObjects.Add(1, $wsMap.Range("A11:L$last"), $null, 1)
$lo.Name = 'tblRoadmap'
$lo.TableStyle = 'TableStyleMedium2'

$wsMap.Columns.Item(1).ColumnWidth = 10
$wsMap.Columns.Item(2).ColumnWidth = 24
$wsMap.Columns.Item(3).ColumnWidth = 48
$wsMap.Columns.Item(4).ColumnWidth = 16
foreach ($c in 5..11) { $wsMap.Columns.Item($c).ColumnWidth = 11 }
$wsMap.Columns.Item(12).ColumnWidth = 42
$wsMap.Application.ActiveWindow.SplitRow = 11
$wsMap.Application.ActiveWindow.FreezePanes = $true

$foot = $last + 2
Set-Font $wsMap.Range("A$foot") 9 $false $Muted
$wsMap.Range("A$foot").Value2 = 'STI  |  Ing. Jonathan Avalos  |  Doc 03 Roadmap  |  Agosto 2026  |  El avance % vive en el Excel 02  |  CLASS permanece en convivencia'
$wsMap.Range("A$foot`:L$foot").Merge()

$wsMap.PageSetup.Orientation = 2
$wsMap.PageSetup.FitToPagesWide = 1
$wsMap.PageSetup.FitToPagesTall = 1

$wb.SaveAs($outXls, 51)
} finally {
    try { if ($wb) { $wb.Close($true) } } catch {}
    try { $excel.Quit() } catch {}
    [GC]::Collect()
}
Write-Host "OK $outXls"
Get-Item $outXls | Format-List FullName, Length, LastWriteTime
