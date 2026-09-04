# Diagramas estilo referencia (zonas / datacenter / ER tipo SSMS-Miro).
# Genera PNG + Excel VISUAL. Sin secretos.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root   = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $root 'Word'
$imgDir = Join-Path $outDir 'diagramas'
$outXls = Join-Path $outDir '06-Diagramas-Arquitectura-DETALLE.xlsx'
New-Item -ItemType Directory -Force -Path $outDir, $imgDir | Out-Null

function New-Color([int]$r,[int]$g,[int]$b) { [System.Drawing.Color]::FromArgb(255,$r,$g,$b) }

function Draw-RoundRect($g, $pen, $brush, $x, $y, $w, $h, $radius = 10) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = [Math]::Min($radius * 2, [Math]::Min($w, $h))
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    if ($brush) { $g.FillPath($brush, $path) }
    if ($pen) { $g.DrawPath($pen, $path) }
    $path.Dispose()
}

function Draw-DashedZone($g, $pen, $x, $y, $w, $h, [string]$title, $titleBrush, $titleFont) {
    $old = $pen.DashStyle
    $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    $g.DrawRectangle($pen, $x, $y, $w, $h)
    $pen.DashStyle = $old
    $g.DrawString($title, $titleFont, $titleBrush, ($x + 8), ($y + 4))
}

function Draw-Text($g, $text, $font, $brush, $x, $y) {
    $g.DrawString($text, $font, $brush, [single]$x, [single]$y)
}

function Draw-Center($g, $text, $font, $brush, $x, $y, $w, $h) {
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = 'Center'; $sf.LineAlignment = 'Center'
    $g.DrawString($text, $font, $brush, (New-Object System.Drawing.RectangleF($x,$y,$w,$h)), $sf)
    $sf.Dispose()
}

function Draw-Left($g, $text, $font, $brush, $x, $y, $w, $h) {
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = 'Near'; $sf.LineAlignment = 'Near'
    $g.DrawString($text, $font, $brush, (New-Object System.Drawing.RectangleF($x,$y,$w,$h)), $sf)
    $sf.Dispose()
}

function Draw-Line($g, $pen, $x1,$y1,$x2,$y2) { $g.DrawLine($pen, [single]$x1,[single]$y1,[single]$x2,[single]$y2) }

function Draw-ArrowTo($g, $pen, $brush, $x1,$y1,$x2,$y2) {
    Draw-Line $g $pen $x1 $y1 $x2 $y2
    $ang = [Math]::Atan2(($y2-$y1), ($x2-$x1))
    $sz = 8.0
    $p1 = New-Object System.Drawing.PointF(([single]($x2 - $sz*[Math]::Cos($ang - 0.4))), ([single]($y2 - $sz*[Math]::Sin($ang - 0.4))))
    $p2 = New-Object System.Drawing.PointF([single]$x2, [single]$y2)
    $p3 = New-Object System.Drawing.PointF(([single]($x2 - $sz*[Math]::Cos($ang + 0.4))), ([single]($y2 - $sz*[Math]::Sin($ang + 0.4))))
    $g.FillPolygon($brush, @($p1,$p2,$p3))
}

function Save-Diagram([string]$path, [int]$width, [int]$height, [scriptblock]$draw) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $g.TextRenderingHint = 'ClearTypeGridFit'
    $g.Clear([System.Drawing.Color]::White)
    & $draw $g
    $g.Dispose()
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "PNG $path"
}

# Colors
$cBlue = New-Color 0 51 102
$cGold = New-Color 201 162 39
$cTeal = New-Color 22 160 133
$cBlue2 = New-Color 41 128 185
$cPurple = New-Color 142 68 173
$cAmber = New-Color 243 156 18
$cGreen = New-Color 39 174 96
$cRed = New-Color 192 57 43
$cInk = New-Color 33 37 41
$cMuted = New-Color 90 98 110
$cLine = New-Color 120 130 140
$cSoftP = New-Color 243 229 245
$cSoftG = New-Color 213 245 227
$cSoftB = New-Color 214 234 248
$cSoftA = New-Color 252 243 207
$cSoftR = New-Color 250 219 216
$cCard = New-Color 248 250 252
$cHdr = New-Color 236 240 241
$cZone = New-Color 52 73 94

$fTitle = New-Object System.Drawing.Font('Calibri', 18, [System.Drawing.FontStyle]::Bold)
$fSub = New-Object System.Drawing.Font('Calibri', 10)
$fZone = New-Object System.Drawing.Font('Calibri', 9, [System.Drawing.FontStyle]::Bold)
$fBox = New-Object System.Drawing.Font('Calibri', 9, [System.Drawing.FontStyle]::Bold)
$fSmall = New-Object System.Drawing.Font('Calibri', 8)
$fTiny = New-Object System.Drawing.Font('Calibri', 7.5)
$fErH = New-Object System.Drawing.Font('Calibri', 8, [System.Drawing.FontStyle]::Bold)
$fEr = New-Object System.Drawing.Font('Consolas', 7.5)

$brInk = New-Object System.Drawing.SolidBrush $cInk
$brWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$brMuted = New-Object System.Drawing.SolidBrush $cMuted
$brZone = New-Object System.Drawing.SolidBrush $cZone
$brBlue = New-Object System.Drawing.SolidBrush $cBlue
$brLine = New-Object System.Drawing.SolidBrush $cLine

$penLine = New-Object System.Drawing.Pen($cLine, 1.5)
$penThick = New-Object System.Drawing.Pen($cZone, 2.0)
$penRed = New-Object System.Drawing.Pen($cRed, 2.0)
$penTeal = New-Object System.Drawing.Pen($cTeal, 1.8)
$penBlue2 = New-Object System.Drawing.Pen($cBlue2, 1.8)
$penGold = New-Object System.Drawing.Pen($cGold, 1.8)
$penPurple = New-Object System.Drawing.Pen($cPurple, 1.8)
$penGreen = New-Object System.Drawing.Pen($cGreen, 1.8)
$penAmber = New-Object System.Drawing.Pen($cAmber, 1.8)

function Draw-ServiceBox($g, $x,$y,$w,$h, $title, $body, $fill, $border) {
    Draw-RoundRect $g $border (New-Object System.Drawing.SolidBrush $fill) $x $y $w $h 8
    Draw-Text $g $title $fBox $brInk ($x+8) ($y+6)
    if ($body) { Draw-Left $g $body $fTiny $brMuted ($x+8) ($y+24) ($w-14) ($h-30) }
}

function Draw-ServerIcon($g, $x, $y, $label, $sub) {
    # rack-ish rectangle
    $pen = New-Object System.Drawing.Pen($cBlue, 1.5)
    $brush = New-Object System.Drawing.SolidBrush $cSoftB
    Draw-RoundRect $g $pen $brush $x $y 110 70 6
    $g.FillRectangle((New-Object System.Drawing.SolidBrush $cBlue2), ($x+12), ($y+12), 86, 8)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush $cTeal), ($x+12), ($y+24), 86, 8)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush $cGold), ($x+12), ($y+36), 86, 8)
    Draw-Center $g $label $fTiny $brInk $x ($y+72) 110 16
    if ($sub) { Draw-Center $g $sub $fTiny $brMuted $x ($y+86) 110 14 }
}

function Draw-Entity($g, $x, $y, $w, $title, [string[]]$rows) {
    $rowH = 16
    $hdrH = 22
    $h = $hdrH + ($rows.Count * $rowH) + 4
    # header
    $g.FillRectangle((New-Object System.Drawing.SolidBrush $cHdr), $x, $y, $w, $hdrH)
    $g.FillRectangle($brWhite, $x, ($y+$hdrH), $w, ($h-$hdrH))
    $g.DrawRectangle((New-Object System.Drawing.Pen($cLine, 1.2)), $x, $y, $w, $h)
    Draw-Line $g (New-Object System.Drawing.Pen($cLine, 1)) $x ($y+$hdrH) ($x+$w) ($y+$hdrH)
    Draw-Center $g $title $fErH $brInk $x $y $w $hdrH
    for ($i=0; $i -lt $rows.Count; $i++) {
        Draw-Text $g $rows[$i] $fEr $brInk ($x+6) ($y + $hdrH + 2 + $i*$rowH)
    }
    return @{ X=$x; Y=$y; W=$w; H=$h; CX=($x+$w/2); CY=($y+$h/2); Bottom=($y+$h); Right=($x+$w) }
}

# ===================== 1) ARQUITECTURA (flujo real del proyecto) =====================
# Usuario -> Presentacion (Component->Service->Repository->CData HTTP)
#        -> API (Controller->Service->Repository->eFramework CData ADO)
#        -> SQL Server (vistas / tablas / SP)
$imgArc = Join-Path $imgDir '01-arquitectura.png'
Save-Diagram $imgArc 1500 980 {
    param($g)
    $g.FillRectangle($brBlue, 0, 0, 1500, 64)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush $cGold), 0, 64, 1500, 6)
    Draw-Text $g 'SGUEES  |  Arquitectura de la solucion (como esta armado en el codigo)' $fTitle $brWhite 20 10
    Draw-Text $g 'Flujo real: Usuario  >  Presentacion (Component-Service-Repository)  >  API (Controller-Service-Repository-Framework)  >  Base de datos' $fSub $brWhite 20 40

    Draw-DashedZone $g $penThick 30 85 1440 760 'PLATAFORMA SGUEES (on-premise UEES)' $brZone $fZone

    # ===== USUARIO =====
    Draw-ServiceBox $g 50 160 130 100 'USUARIO' "Navegador`nChrome / Edge`nAbre opcion del`nmenu SGUEES`n(TH·CON·COM·SEG)" $cSoftP $penPurple
    Draw-ArrowTo $g $penThick $brLine 185 210 220 210
    Draw-Center $g 'invoca' $fTiny $brMuted 185 185 35 20

    # ===== CAPA PRESENTACION (FRONTEND) =====
    Draw-DashedZone $g $penTeal 220 110 520 420 'CAPA PRESENTACION  |  SGUEES-SPA (Angular 18 + DevExtreme)  /scuees/' $brZone $fZone

    # Acceso web dentro / junto a presentacion
    Draw-ServiceBox $g 240 145 150 80 'ACCESO WEB' "HTTPS`nwsclass.uees.edu.sv`nIIS + certificado`nCORS permitido" $cSoftP $penPurple
    Draw-ServiceBox $g 405 145 150 80 'JWT (cliente)' "Token en header`nBearer al llamar API`nJwtModule SPA`nPermisos de menu" $cSoftR $penRed

    Draw-Text $g 'Cadena interna del Frontend (pantalla tipica mtto, ej. gen-banco)' $fZone $brZone 240 245

    Draw-ServiceBox $g 240 275 115 90 '1. Component' "*.component.ts`nUI form/grid`nCBaseComponent`nguardarMtto`nconsultar()" $cSoftG $penTeal
    Draw-ArrowTo $g $penLine $brLine 360 320 380 320
    Draw-ServiceBox $g 380 275 115 90 '2. Service' "*.service.ts`nesValido()`ncolumnas form`ncolumnas grid`nllama Repository" $cSoftG $penTeal
    Draw-ArrowTo $g $penLine $brLine 500 320 520 320
    Draw-ServiceBox $g 520 275 115 90 '3. Repository' "*.repository.ts`nGet/Post/Put/`nDelete/Activar`nwrap HTTP" $cSoftG $penTeal
    Draw-ArrowTo $g $penLine $brLine 640 320 660 320
    Draw-ServiceBox $g 660 275 60 90 'CData' "FxAPI`nHttp`nClient" $cSoftG $penTeal

    Draw-ServiceBox $g 240 385 480 55 'Menu dinamico + permisos' "SEG_OPCION_SISTEMA / SEG_CONFIG_OPCION / SEG_USUARIO_OPCION  |  Lookups: AppInfoService.getLookUp" $cCard $penTeal

    Draw-ArrowTo $g $penThick $brLine 745 320 790 320
    Draw-Center $g "peticion`nHTTP+JWT" $fTiny $brMuted 745 285 45 35

    # ===== CAPA SERVICIOS (API) =====
    Draw-DashedZone $g $penBlue2 790 110 420 420 'CAPA SERVICIOS  |  SGUEES-API (.NET 8)  /scc-API/' $brZone $fZone

    Draw-ServiceBox $g 810 145 180 55 'Authorize' "Policy /ruta|R|C|U|D`nJWT validado en API`nHasScopeHandler" $cSoftR $penRed
    Draw-ServiceBox $g 1005 145 185 55 'Dominios' "SEG GEN COM CON`nBAN SC PLA RPT`nControllers por tabla" $cSoftB $penBlue2

    Draw-Text $g 'Cadena interna del Backend (mismo patron en todos los mtto)' $fZone $brZone 810 220

    Draw-ServiceBox $g 810 250 90 100 '4. Controller' "*Controller.cs`nGetAll/Post`nPut/Delete`n[Authorize]" $cSoftB $penBlue2
    Draw-ArrowTo $g $penLine $brLine 905 300 920 300
    Draw-ServiceBox $g 920 250 90 100 '5. Service' "*Service.cs`nreglas negocio`norquesta repo`nrespuesta" $cSoftB $penBlue2
    Draw-ArrowTo $g $penLine $brLine 1015 300 1030 300
    Draw-ServiceBox $g 1030 250 90 100 '6. Repository' "*Repository.cs`nBaseRepository`nSQL / vistas`nSP PRAL_*" $cSoftB $penBlue2
    Draw-ArrowTo $g $penLine $brLine 1125 300 1140 300
    Draw-ServiceBox $g 1140 250 50 100 '7. FW' "eFrame`nwork`nCData`nADO" $cSoftB $penBlue2

    Draw-ServiceBox $g 810 375 380 55 'Patron API real' "Controller -> Service -> Repository -> eFramework.Core.CData (SqlClient / ADO)  |  NO Entity Framework" $cCard $penBlue2

    Draw-ArrowTo $g $penThick $brLine 1215 300 1245 300
    Draw-Center $g 'SQL' $fTiny $brMuted 1215 275 30 20

    # ===== CAPA DATOS =====
    Draw-DashedZone $g $penGold 1245 110 210 420 'CAPA DATOS' $brZone $fZone
    Draw-ServiceBox $g 1260 145 180 120 '8. SQL Server' "Servidor fisico`n192.168.0.250`nBD: SGUEES`n`nTablas GEN_/CON_/…`nVistas V_*`nSP PRAL_DATA_*`nSP PRAL_MTTO_*" $cSoftA $penGold
    Draw-ServiceBox $g 1260 285 180 70 'Auditoria' "USUARIO_CREA/ACTU`nFECHA / ESTACION`nen tablas negocio" $cSoftA $penGold
    Draw-ServiceBox $g 1260 375 180 55 'Scripts' "Repo SGUEES-DB`nUTF-8 / menu" $cCard $penGold

    # ===== Ejemplo concreto + satelites =====
    Draw-DashedZone $g $penLine 50 555 900 130 'EJEMPLO CONCRETO (piloto gen-banco)' $brZone $fZone
    Draw-Left $g "Usuario abre Bancos  ->  GenBancoComponent  ->  GenBancoService  ->  GenBancoRepository  ->  SPA CData.Get('GEN_BANCO','GetAll')`n->  GEN_BANCOController.GetAll [Policy /gen-banco|R]  ->  GEN_BANCOService  ->  GEN_BANCORepository  ->  eFramework CData  ->  SELECT V_GEN_BANCO`nRespuesta JSON vuelve por la misma cadena hasta el grid DevExtreme." $fSmall $brInk 65 585 870 90

    Draw-DashedZone $g $penAmber 970 555 485 130 'INTEGRACIONES (fuera de la cadena mtto)' $brZone $fZone
    Draw-ServiceBox $g 985 585 145 75 'Reportes' "192.168.0.14:9011`nSGUEES-RPT`nCrystal PDF" $cSoftA $penAmber
    Draw-ServiceBox $g 1145 585 145 75 'FE / Legacy' "192.168.1.129`nFE :9000`nCLASS/SUEES" $cCard $penLine
    Draw-ServiceBox $g 1305 585 130 75 'QA / Dev' "wsclass2`nAPI :5000" $cCard $penLine

    Draw-Text $g 'Resumen: Usuario invoca Presentacion; Presentacion (Component->Service->Repository) pide a la API; API (Controller->Service->Repository->Framework) consulta la Base de datos.' $fSmall $brMuted 50 900
    Draw-Text $g 'STI  |  Doc 06  |  Arquitectura detallada segun codigo real  |  Agosto 2026  |  Sin secretos' $fTiny $brMuted 50 925
}

# ===================== 2) RED / DATACENTER =====================
# Flujo: SGUEES -> HTTPS/Seguridad (recuadro) -> Firewall/perimetro -> 2 servidores fisicos
$imgRed = Join-Path $imgDir '02-red.png'
Save-Diagram $imgRed 1400 820 {
    param($g)
    $g.FillRectangle($brBlue, 0, 0, 1400, 64)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush $cGold), 0, 64, 1400, 6)
    Draw-Text $g 'SGUEES  |  Diagrama de red e infraestructura (datacenter fisico)' $fTitle $brWhite 20 10
    Draw-Text $g 'Flujo: SGUEES  >  HTTPS / Seguridad  >  Firewall  >  2 servidores fisicos  |  Sin secretos' $fSub $brWhite 20 40

    # 1) SGUEES (no campus)
    Draw-DashedZone $g $penPurple 40 100 250 340 'SGUEES' $brZone $fZone
    Draw-ServiceBox $g 55 140 220 50 'ERP SGUEES' "SPA Angular + API .NET`nModulos de negocio" $cSoftP $penPurple
    Draw-ServiceBox $g 55 205 100 55 'TH' 'Seleccion`nDescriptor' $cSoftG $penTeal
    Draw-ServiceBox $g 170 205 100 55 'Finanzas' 'CON / BAN`nCxP' $cSoftB $penBlue2
    Draw-ServiceBox $g 55 275 100 55 'Compras' 'COM_`nIntegracion' $cSoftA $penAmber
    Draw-ServiceBox $g 170 275 100 55 'Seguridad' 'Usuarios`nPermisos SEG_*' $cSoftP $penPurple
    Draw-ServiceBox $g 55 350 220 60 'Usuarios del sistema' "Acceden al ERP SGUEES`npor navegador (HTTPS)" $cCard $penLine

    Draw-ArrowTo $g $penThick $brLine 295 260 340 260
    Draw-Center $g 'invoca' $fTiny $brMuted 295 235 45 20

    # 2) HTTPS / Seguridad (recuadro aparte, invocado desde SGUEES)
    Draw-DashedZone $g $penBlue2 340 100 240 340 'HTTPS / SEGURIDAD' $brZone $fZone
    Draw-ServiceBox $g 360 145 200 90 'HTTPS / TLS' "Canal cifrado`nCertificados`nwsclass.uees.edu.sv`nPublicacion controlada IIS" $cSoftB $penBlue2
    Draw-ServiceBox $g 360 255 200 100 'Seguridad de aplicacion' "JWT en API`nPermisos SEG_*`nCORS restringido`nAutorizacion por opcion`n(/ruta|R/C/U/D)" $cSoftB $penBlue2
    Draw-Text $g 'Capa invocada por el ERP' $fTiny $brMuted 360 375

    Draw-ArrowTo $g $penThick $brLine 585 260 630 260
    Draw-Center $g 'invoca' $fTiny $brMuted 585 235 45 20

    # 3) Perimetro firewall (invocado desde HTTPS/Seguridad)
    Draw-DashedZone $g $penRed 630 100 220 340 'PERIMETRO / FIREWALL' $brZone $fZone
    Draw-ServiceBox $g 650 160 180 120 'Firewall de borde' "Filtrado de trafico`nReglas de entrada/salida`nSolo puertos publicados`n(HTTPS 443)`nBloqueo acceso directo`na SQL / red interna" $cSoftR $penRed
    Draw-ServiceBox $g 650 310 180 80 'Pasarela al DC' "Despues del firewall`nse alcanza la LAN`ndel datacenter UEES" $cSoftR $penRed

    Draw-ArrowTo $g $penThick $brLine 855 260 900 260
    Draw-Center $g 'invoca' $fTiny $brMuted 855 235 45 20

    # 4) Datacenter: SOLO 2 servidores fisicos (sin "Medidas en DC")
    Draw-DashedZone $g $penGold 900 100 460 340 'DATACENTER UEES  |  2 SERVIDORES FISICOS' $brZone $fZone

    Draw-ServerIcon $g 940 150 'Servidor 1' 'FISICO'
    Draw-ServiceBox $g 1060 145 270 100 'WEB / APLICACION' "Host fisico IIS / wsclass`nSPA  /scuees/`nAPI  /scc-API/  (.NET 8)`nReportes 192.168.0.14:9011`n(servidor fisico asociado)" $cSoftB $penBlue2

    Draw-ServerIcon $g 940 290 'Servidor 2' 'FISICO'
    Draw-ServiceBox $g 1060 285 270 100 'BASE DE DATOS' "Host fisico SQL Server`nIP 192.168.0.250`nBD SGUEES`nSolo red interna DC`nNo publicado a Internet" $cSoftA $penGold

    Draw-Text $g 'LAN interna DC: Servidor 1 (WEB/API)  <->  Servidor 2 (SQL). Ambos fisicos en datacenter UEES.' $fTiny $brMuted 920 410

    # Ambientes
    Draw-DashedZone $g $penLine 40 470 1320 100 'AMBIENTES' $brZone $fZone
    Draw-ServiceBox $g 60 505 400 45 'PRODUCCION' "wsclass.uees.edu.sv  |  SQL fisico 192.168.0.250 / SGUEES" $cSoftA $penGold
    Draw-ServiceBox $g 490 505 400 45 'PRUEBA / QA' "wsclass2.uees.edu.sv  |  Validacion funcional" $cSoftA $penAmber
    Draw-ServiceBox $g 920 505 400 45 'DESARROLLO' "localhost SPA  |  API :5000 (maquina desarrollo)" $cCard $penLine

    Draw-Text $g 'Nota: SGUEES corre on-premise en datacenter UEES sobre 2 servidores fisicos. CLASS/legacy (192.168.1.129) convive aparte mientras se migran procesos.' $fSmall $brMuted 50 740
    Draw-Text $g 'STI  |  Doc 06  |  Red + datacenter fisico + firewall  |  Agosto 2026' $fTiny $brMuted 50 770
}

# ===================== 3) ER estilo SSMS/Miro =====================
$imgEr = Join-Path $imgDir '03-er-dominios.png'
Save-Diagram $imgEr 1400 980 {
    param($g)
    $g.FillRectangle($brBlue, 0, 0, 1400, 64)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush $cGold), 0, 64, 1400, 6)
    Draw-Text $g 'SGUEES  |  Modelo ER (vista tipo SQL Server / diagramas de entidad)' $fTitle $brWhite 20 10
    Draw-Text $g 'Recorte de entidades clave del nucleo. El modelo completo esta en SGUEES-DB (Tables/Views/SP).' $fSub $brWhite 20 40

    # subtle grid
    $gridPen = New-Object System.Drawing.Pen((New-Color 235 238 242), 1)
    for ($gx=0; $gx -lt 1400; $gx += 40) { $g.DrawLine($gridPen, $gx, 70, $gx, 980) }
    for ($gy=70; $gy -lt 980; $gy += 40) { $g.DrawLine($gridPen, 0, $gy, 1400, $gy) }

    $eEmp = Draw-Entity $g 580 120 220 'GEN_EMPRESA' @(
        'PK  CORR_EMPRESA',
        '    NOMBRE_EMPRESA',
        '    TAMANIO_EMPRESA'
    )

    $eUsr = Draw-Entity $g 60 120 240 'SEG_USUARIO' @(
        'PK  LOGIN_SISTEMA',
        '    NOMBRE_USUARIO',
        '    CLAVE / ESTADO',
        '    (auth JWT)'
    )

    $eOpc = Draw-Entity $g 60 280 260 'SEG_OPCION_SISTEMA' @(
        'PK  CODIGO_OPCION',
        '    NOMBRE_OPCION',
        '    URL_OPCION'
    )

    $eUo = Draw-Entity $g 60 440 280 'SEG_USUARIO_OPCION' @(
        'PK  LOGIN_SISTEMA (FK)',
        'PK  CODIGO_SISTEMA',
        'PK  CODIGO_MENU',
        'PK  CODIGO_OPCION (FK)',
        '    NUEVO / MODIFICAR',
        '    ELIMINAR / IMPRIMIR'
    )

    $ePart = Draw-Entity $g 380 320 280 'CON_PARTIDA' @(
        'PK  CORR_EMPRESA (FK)',
        'PK  ANIO_PERIODO',
        'PK  MES_PERIODO',
        'PK  CORR_CLASE_PARTIDA',
        'PK  CORR_PARTIDA',
        '    FECHA_PARTIDA',
        '    ESTADO_PARTIDA'
    )

    $ePd = Draw-Entity $g 380 520 300 'CON_PARTIDA_DETA' @(
        'PK  ... + CORR_PARTIDA_DETA',
        'FK  -> CON_PARTIDA',
        'FK  CUENTA_CONTABLE',
        'FK  CORR_CENTRO_COSTO',
        '    MONTO_CARGO / ABONO'
    )

    $eDesc = Draw-Entity $g 760 320 280 'SC_DESCRIPTOR_PUESTO' @(
        'PK  CORR_EMPRESA (FK)',
        'PK  CORR_DESCRIPTOR_PUESTO',
        'FK  CORR_PUESTO -> PLA_PUESTO',
        'FK  CORR_UNIDAD',
        '    FORMATO / VERSION',
        '    ESTADO_DESCRIPTOR'
    )

    $eReq = Draw-Entity $g 760 520 300 'SC_REQUISICION_PERSONAL' @(
        'PK  CORR_EMPRESA (FK)',
        'PK  CORR_REQUISICION',
        'FK  CORR_PUESTO',
        '    CORR_DESCRIPTOR',
        '    ESTADO_REQUISICION',
        '    SUELDO_PLAZA'
    )

    $ePuesto = Draw-Entity $g 1100 320 240 'PLA_PUESTO' @(
        'PK  CORR_EMPRESA (FK)',
        'PK  CORR_PUESTO',
        '    NOMBRE_PUESTO',
        '    (nucleo planilla)'
    )

    $eCta = Draw-Entity $g 1100 120 240 'CON_CATALOGO_CUENTA' @(
        'PK  CORR_EMPRESA (FK)',
        'PK  CUENTA_CONTABLE',
        '    NOMBRE_CUENTA'
    )

    $eDoc = Draw-Entity $g 380 120 260 'COM_DOCUMENTO' @(
        'PK  CORR_EMPRESA (FK)',
        'PK  CORR_DOCUMENTO',
        '    ESTADO / TOTALES',
        '    (compras)'
    )

    # Relationships (simplified crow feet as labels)
    Draw-ArrowTo $g $penLine $brLine $eUsr.Right 160 580 150
    Draw-Text $g '1' $fTiny $brMuted 520 140
    Draw-ArrowTo $g $penLine $brLine 190 280 190 435
    Draw-Text $g '1:N permisos' $fTiny $brMuted 200 360
    Draw-ArrowTo $g $penLine $brLine 320 300 60 470
    Draw-ArrowTo $g $penLine $brLine 690 160 520 320
    Draw-Text $g '1:N' $fTiny $brMuted 700 240
    Draw-ArrowTo $g $penLine $brLine 520 450 520 515
    Draw-Text $g '1:N detalle' $fTiny $brMuted 530 480
    Draw-ArrowTo $g $penLine $brLine 1040 160 1100 160
    Draw-ArrowTo $g $penLine $brLine 900 160 900 315
    Draw-ArrowTo $g $penLine $brLine 1040 360 1095 360
    Draw-Text $g 'FK puesto' $fTiny $brMuted 1045 340
    Draw-ArrowTo $g $penLine $brLine 900 450 900 515
    Draw-Text $g 'usa descriptor' $fTiny $brMuted 910 485
    Draw-ArrowTo $g $penLine $brLine 1220 320 1220 200
    Draw-Text $g 'FK cuenta' $fTiny $brMuted 1230 260
    Draw-ArrowTo $g $penLine $brLine 680 450 1100 380

    Draw-RoundRect $g $penGold (New-Object System.Drawing.SolidBrush $cSoftA) 60 720 1280 90 10
    Draw-Left $g "Convencion (como en SSMS / ER clasico):`n• PK = llave primaria   • FK = llave foranea   • 1:N = encabezado a detalle (PARTIDA->DETA, DOCUMENTO->DETA, USUARIO->USUARIO_OPCION)`n• Casi todas las entidades de negocio llevan CORR_EMPRESA (multi-empresa).`n• Este diagrama es un recorte del nucleo (SEG/CON/COM/SC/PLA). Para el modelo fisico completo: Database Diagrams en SSMS sobre SGUEES o scripts en SGUEES-DB/Tables." $fSmall $brInk 75 735 1250 70

    Draw-Text $g 'STI  |  Doc 06  |  ER nucleo SGUEES  |  Agosto 2026' $fTiny $brMuted 60 840
}

# Excel embed
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
try {
    $wb = $excel.Workbooks.Add()
    while ($wb.Worksheets.Count -lt 4) { $null = $wb.Worksheets.Add() }
    $map = @(
        @{ N='Diag Arquitectura'; I=$imgArc; T='Arquitectura detallada (zonas)' },
        @{ N='Diag Red DC'; I=$imgRed; T='Red + datacenter fisico + seguridad' },
        @{ N='Diag ER'; I=$imgEr; T='ER tipo SQL Server (nucleo)' },
        @{ N='Como exportar'; I=$null; T='Exportar a PDF' }
    )
    for ($i=0; $i -lt 4; $i++) {
        $ws = $wb.Worksheets.Item($i+1)
        $ws.Name = $map[$i].N
        $excel.ActiveWindow.DisplayGridlines = $false
        $ws.Activate() | Out-Null
        $ws.Range('A1').Value2 = "SGUEES  |  $($map[$i].T)"
        $ws.Range('A1').Font.Bold = $true
        $ws.Range('A1').Font.Size = 14
        $ws.Range('A1').Font.Color = (0+51*256+102*65536)
        $ws.Range('A1:R1').Merge()
        if ($map[$i].I) {
            $ws.Range('A2').Value2 = 'PNG tambien en Word/diagramas/. PDF: Archivo > Exportar > Crear documento PDF (horizontal, hoja activa).'
            $ws.Range('A2').Font.Size = 9
            $ws.Range('A2:R2').Merge()
            $null = $ws.Shapes.AddPicture($map[$i].I, $false, $true, 8, 40, 900, 580)
            $ws.PageSetup.Orientation = 2
            $ws.PageSetup.FitToPagesWide = 1
            $ws.PageSetup.FitToPagesTall = 1
            $ws.PageSetup.Zoom = $false
        } else {
            $ws.Range('A3').Value2 = '1) Abra Diag Arquitectura / Diag Red DC / Diag ER'
            $ws.Range('A4').Value2 = '2) Archivo > Exportar > Crear documento PDF/XPS'
            $ws.Range('A5').Value2 = '3) Orientacion horizontal'
            $ws.Range('A7').Value2 = 'Archivos PNG:'
            $ws.Range('A8').Value2 = $imgArc
            $ws.Range('A9').Value2 = $imgRed
            $ws.Range('A10').Value2 = $imgEr
            $ws.Columns.Item(1).ColumnWidth = 110
            $ws.Range('A8:A10').WrapText = $true
        }
    }
    if (Test-Path $outXls) { Remove-Item $outXls -Force -ErrorAction SilentlyContinue }
    try {
        $wb.SaveAs($outXls, 51)
    } catch {
        $outXls = Join-Path $outDir '06-Diagramas-Arquitectura-DETALLE-nuevo.xlsx'
        $wb.SaveAs($outXls, 51)
        Write-Host "AVISO: archivo anterior bloqueado; guardado como $outXls"
    }
    $wb.Close($true)
} finally {
    try { $excel.Quit() } catch {}
    [GC]::Collect()
}

Write-Host "OK $outXls"
Get-ChildItem $imgDir | Format-Table Name, Length, LastWriteTime
