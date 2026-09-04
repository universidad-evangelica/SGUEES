# Doc 04 — Organigrama + Metodologia Scrum + Roles
# Entrega principal: PDF (estilo TDR: portada + contenido + conclusion; SIN indice).
# Tambien regenera PNG propios (no capturas).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$root   = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $root 'Word'
$imgDir = Join-Path $outDir 'organigrama'
$outDoc = Join-Path $outDir '04-Organigrama-y-Metodologia-Scrum-SGUEES.docx'
$outPdf = Join-Path $outDir '04-Organigrama-y-Metodologia-Scrum-SGUEES.pdf'
New-Item -ItemType Directory -Force -Path $outDir, $imgDir | Out-Null

# ---------- PNG helpers (diagramas propios) ----------
function New-Color([int]$r,[int]$g,[int]$b) { [System.Drawing.Color]::FromArgb(255,$r,$g,$b) }
function Draw-RoundRect($g, $pen, $brush, $x, $y, $w, $h, $radius = 12) {
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
function Draw-ShadowBox($g, $x, $y, $w, $h, $fill, $border, $radius = 12) {
    $shadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(35, 0, 0, 0))
    Draw-RoundRect $g $null $shadow ($x+3) ($y+4) $w $h $radius
    Draw-RoundRect $g $border (New-Object System.Drawing.SolidBrush $fill) $x $y $w $h $radius
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
function Draw-VLine($g, $pen, $x, $y1, $y2) { $g.DrawLine($pen, [single]$x, [single]$y1, [single]$x, [single]$y2) }
function Draw-HLine($g, $pen, $x1, $x2, $y) { $g.DrawLine($pen, [single]$x1, [single]$y, [single]$x2, [single]$y) }
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

$cNavy  = New-Color 0 51 102
$cBlue  = New-Color 31 97 141
$cTeal  = New-Color 22 160 133
$cGold  = New-Color 201 162 39
$cSoftB = New-Color 232 242 248
$cSoftT = New-Color 232 248 245
$cSoftG = New-Color 252 246 230
$cSoftP = New-Color 243 229 245
$cSoftR = New-Color 253 236 234
$cCard  = New-Color 255 255 255
$cInk   = New-Color 33 37 41
$cMuted = New-Color 90 98 110
$cLine  = New-Color 170 180 190
$cBg    = New-Color 248 250 252

$fTitle = New-Object System.Drawing.Font('Calibri', 20, [System.Drawing.FontStyle]::Bold)
$fSub   = New-Object System.Drawing.Font('Calibri', 11)
$fHead  = New-Object System.Drawing.Font('Calibri', 10, [System.Drawing.FontStyle]::Bold)
$fBox   = New-Object System.Drawing.Font('Calibri', 9, [System.Drawing.FontStyle]::Bold)
$fSmall = New-Object System.Drawing.Font('Calibri', 8)
$fTiny  = New-Object System.Drawing.Font('Calibri', 7.5)
$brWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$brInk   = New-Object System.Drawing.SolidBrush $cInk
$brMuted = New-Object System.Drawing.SolidBrush $cMuted
$brNavy  = New-Object System.Drawing.SolidBrush $cNavy
$penLine = New-Object System.Drawing.Pen($cLine, 1.6)
$penNavy = New-Object System.Drawing.Pen($cNavy, 1.8)

function Draw-HeaderBar($g, $w, $title, $subtitle) {
    $g.FillRectangle($brNavy, 0, 0, $w, 70)
    $g.FillRectangle((New-Object System.Drawing.SolidBrush $cGold), 0, 70, $w, 5)
    $g.DrawString($title, $fTitle, $brWhite, 24, 12)
    $g.DrawString($subtitle, $fSub, $brWhite, 24, 42)
}
function Draw-RoleCard($g, $x, $y, $w, $h, $title, $body, $fill, $accent) {
    Draw-ShadowBox $g $x $y $w $h $fill $penLine 10
    $g.FillRectangle((New-Object System.Drawing.SolidBrush $accent), $x, $y, 6, $h)
    Draw-Left $g $title $fBox $brInk ($x+14) ($y+8) ($w-22) 18
    if ($body) { Draw-Left $g $body $fTiny $brMuted ($x+14) ($y+28) ($w-22) ($h-36) }
}
function Draw-Leader($g, $x, $y, $w, $h, $text) {
    Draw-ShadowBox $g $x $y $w $h $cNavy $penNavy 12
    Draw-Center $g $text $fHead $brWhite $x $y $w $h
}

$imgOrg = Join-Path $imgDir '01-organigrama-equipos.png'
Save-Diagram $imgOrg 1500 1050 {
    param($g)
    $g.Clear($cBg)
    Draw-HeaderBar $g 1500 'SGUEES  |  Organigrama del equipo de proyecto' 'Equipo para el Analisis del Sistema de Gestion Universitaria UEES'
    Draw-Leader $g 480 95 540 52 "Subgerente Tecnologia Informacion`nLider del proyecto"
    Draw-VLine $g $penLine 750 147 185
    Draw-HLine $g $penLine 165 1335 185
    foreach ($cx in @(165, 555, 945, 1335)) { Draw-VLine $g $penLine $cx 185 210 }
    $top = @(
        @{ X=40;   T='Equipo Academico'; L='Director academico - Lider'; M="• Coordinacion de procesos academicos`n• Tecnico analista y Atencion al estudiante`n• Nuevo Ingreso`n• Director de Proyeccion Social y Becas`n`nParticipacion / consulta:`n• Coordinadora Unidad de egresados`n• Pyxoom (VRIV)`n• Maestrias y Educacion Continua"; A=$cTeal },
        @{ X=430;  T='Equipo Contable y Financiero'; L='Subgerente Contabilidad y Finanzas - Lider'; M="• Atencion financiera estudiante`n• Contador"; A=$cBlue },
        @{ X=820;  T='Equipo Talento Humano'; L='Jefe de TH - Lider'; M="• Encargada de Planillas`n• Encargada de Seleccion y`n  Contratacion de personal"; A=$cGold },
        @{ X=1210; T='Equipo Tecnico TI'; L='Subgerente TI - Lider'; M="• Coordinador de Desarrollo`n• Coordinador de Soporte Tecnico`n• Equipo de desarrollo contratado`n  para el proyecto"; A=$cNavy }
    )
    foreach ($t in $top) {
        Draw-ShadowBox $g $t.X 210 250 42 $t.A $penLine 10
        Draw-Center $g $t.T $fBox $brWhite $t.X 210 250 42
        Draw-RoleCard $g $t.X 262 250 56 $t.L $null $cCard $t.A
        Draw-ShadowBox $g $t.X 328 250 210 $cCard $penLine 10
        Draw-Left $g $t.M $fSmall $brInk ($t.X+12) 340 226 190
    }
    Draw-VLine $g $penLine 750 538 580
    Draw-HLine $g $penLine 390 1110 580
    Draw-VLine $g $penLine 390 580 610
    Draw-VLine $g $penLine 1110 580 610
    $bot = @(
        @{ X=240; T='Equipo Control'; L='Jefe de auditoria - Lider'; M="• Auditor de Sistemas`n• Auditor Administrativo`n• Auditor Academico"; A=(New-Color 192 57 43) },
        @{ X=960; T='Equipo Transformacion Digital'; L='Director desarrollo y TD - Lider'; M="• Consultor externo TD`n• Analista de experiencia`n  de usuario (UX)"; A=(New-Color 142 68 173) }
    )
    foreach ($t in $bot) {
        Draw-ShadowBox $g $t.X 610 300 42 $t.A $penLine 10
        Draw-Center $g $t.T $fBox $brWhite $t.X 610 300 42
        Draw-RoleCard $g $t.X 662 300 52 $t.L $null $cCard $t.A
        Draw-ShadowBox $g $t.X 724 300 120 $cCard $penLine 10
        Draw-Left $g $t.M $fSmall $brInk ($t.X+14) 738 272 100
    }
    Draw-Left $g 'STI  |  Doc 04  |  Organigrama  |  Agosto 2026' $fTiny $brMuted 40 910 600 20
}

$imgScrum = Join-Path $imgDir '02-metodologia-scrum.png'
Save-Diagram $imgScrum 1500 900 {
    param($g)
    $g.Clear($cBg)
    Draw-HeaderBar $g 1500 'SGUEES  |  Metodologia de trabajo: Scrum' 'Como se organiza el desarrollo del Sistema de Gestion Universitaria UEES'
    Draw-RoleCard $g 40 100 700 160 'Que es Scrum en este proyecto' "Es la forma de trabajo del equipo: en lugar de intentar entregar todo de una vez, se avanza en bloques cortos llamados Sprints (mini-metas semanales o quincenales).`n`nCada Sprint tiene un objetivo claro. Al finalizar se revisa lo entregado, se aprende y se planifica el siguiente bloque." $cSoftB $cNavy
    Draw-RoleCard $g 770 100 690 160 'Que es un Sprint' "Periodo corto (normalmente 1 a 4 semanas) en el que el equipo se concentra en cumplir una meta especifica y entregable.`n`nEn SGUEES el Sprint produce incrementos utiles: pantallas, flujos, reportes o validaciones que el area pueda revisar." $cSoftG $cGold
    Draw-ShadowBox $g 40 300 1420 280 $cCard $penLine 14
    Draw-Left $g 'Ciclo de trabajo (repetible)' $fHead $brInk 60 318 400 24
    $steps = @(
        @{ X=70;   T='1. Backlog'; D="Priorizar`nrequerimientos`ncon el area" },
        @{ X=300;  T='2. Planificar'; D="Definir meta`ndel Sprint`ny tareas" },
        @{ X=530;  T='3. Construir'; D="Desarrollo`nSPA + API + BD`nen el Sprint" },
        @{ X=760;  T='4. Revisar'; D="Demo / UAT`ncon usuarios`nclave" },
        @{ X=990;  T='5. Mejorar'; D="Retrospectiva`ny ajuste del`nsiguiente ciclo" },
        @{ X=1220; T='6. Entregar'; D="Incremento`nusable en`nSGUEES" }
    )
    for ($i=0; $i -lt $steps.Count; $i++) {
        $s = $steps[$i]
        Draw-ShadowBox $g $s.X 360 180 160 $cSoftB $penNavy 12
        Draw-Center $g $s.T $fBox $brInk $s.X 372 180 28
        Draw-Center $g $s.D $fSmall $brMuted $s.X 410 180 90
        if ($i -lt $steps.Count - 1) { $g.DrawString('>', $fTitle, $brMuted, ($s.X + 185), 420) }
    }
    Draw-Left $g 'Para que sirve Scrum en SGUEES' $fHead $brInk 40 620 500 24
    $benefits = @(
        @{ X=40;   T='Organizar'; D='El trabajo queda claro: que se hace en este Sprint y que queda para despues.' },
        @{ X=410;  T='Adaptar'; D='Si el negocio cambia prioridades, el siguiente Sprint se reordena sin perder el rumbo.' },
        @{ X=780;  T='Entregar valor'; D='Se entregan resultados parciales utiles en poco tiempo, no solo al final del proyecto.' },
        @{ X=1150; T='Alinear al equipo'; D='Todos saben que hacen, quien valida y cual es el objetivo del bloque actual.' }
    )
    foreach ($b in $benefits) { Draw-RoleCard $g $b.X 655 330 120 $b.T $b.D $cCard $cTeal }
    Draw-Left $g 'STI  |  Doc 04  |  Metodologia Scrum  |  Agosto 2026' $fTiny $brMuted 40 850 600 20
}

$imgRoles = Join-Path $imgDir '03-roles-scrum.png'
Save-Diagram $imgRoles 1500 980 {
    param($g)
    $g.Clear($cBg)
    Draw-HeaderBar $g 1500 'SGUEES  |  Roles Scrum y estructura operativa' 'Product Owner, Scrum Masters, equipos de desarrollo y usuarios clave'
    Draw-Leader $g 500 100 500 50 "Product Owner`n(Subgerente TI)"
    Draw-VLine $g $penLine 750 150 190
    Draw-HLine $g $penLine 220 1280 190
    foreach ($cx in @(220, 750, 1280)) { Draw-VLine $g $penLine $cx 190 220 }
    $branches = @(
        @{ X=40; Title='Frente Academico'; Accent=$cTeal; Fill=$cSoftT; SM='Scrum Master Academico`n(Coordinador de desarrollo)'; Items=@('Equipo de desarrollo Academico','Usuarios clave (Equipo Academico)') },
        @{ X=520; Title='Frente Financiero y TH'; Accent=$cGold; Fill=$cSoftG; SM='Scrum Master Financiero y TH`n(Analista Financiero)'; Items=@('Equipo de desarrollo Financiero','Equipo de desarrollo Talento Humano','Usuarios clave (Financiero y TH)') },
        @{ X=1000; Title='Frente Infraestructura'; Accent=$cBlue; Fill=$cSoftB; SM='Scrum Master Infraestructura`n(Coordinador Infraestructura)'; Items=@('Equipo de Infraestructura','Usuarios clave Development') }
    )
    foreach ($b in $branches) {
        Draw-ShadowBox $g $b.X 220 460 40 $b.Accent $penLine 10
        Draw-Center $g $b.Title $fBox $brWhite $b.X 220 460 40
        Draw-RoleCard $g ($b.X+20) 280 420 70 $b.SM $null $cCard $b.Accent
        $yy = 370
        foreach ($item in $b.Items) {
            Draw-ShadowBox $g ($b.X+40) $yy 380 48 $b.Fill $penLine 10
            Draw-Center $g $item $fSmall $brInk ($b.X+40) $yy 380 48
            $yy += 60
        }
    }
    Draw-HLine $g $penLine 280 1220 620
    Draw-VLine $g $penLine 750 560 620
    Draw-RoleCard $g 180 640 520 90 'Equipo Auditoria Interna (transversal)' "Acompana el proyecto: validacion de controles, trazabilidad y revision de entregables." $cSoftR (New-Color 192 57 43)
    Draw-RoleCard $g 780 640 520 90 'Equipo Transformacion Digital (transversal)' "Aporta vision de experiencia de usuario y acompanamiento de cambio organizacional." $cSoftP (New-Color 142 68 173)
    Draw-ShadowBox $g 40 770 1420 90 $cSoftG $penLine 12
    Draw-Left $g 'Nota operativa' $fHead $brInk 60 788 300 22
    Draw-Left $g 'Los equipos de desarrollo por area estaran conformados por 2 analistas. Los usuarios clave validan en cada Sprint. El Product Owner prioriza el backlog institucional del ERP SGUEES.' $fSmall $brInk 60 818 1380 30
    Draw-Left $g 'STI  |  Doc 04  |  Roles Scrum  |  Agosto 2026' $fTiny $brMuted 40 900 600 20
}

# ---------- WORD + PDF (estilo TDR: portada, contenido, conclusion; SIN indice) ----------
function Apply-Font($sel, [int]$size=11, [bool]$bold=$false, [int]$color=0x003366) {
    $sel.Font.Name = 'Arial'
    $sel.Font.Size = $size
    $sel.Font.Bold = [int]$bold
    $sel.Font.Color = $color
}

$word = $null; $doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Add()

    $doc.PageSetup.TopMargin = 72
    $doc.PageSetup.BottomMargin = 72
    $doc.PageSetup.LeftMargin = 85
    $doc.PageSetup.RightMargin = 72

    $sel = $word.Selection

    # ===== PORTADA =====
    $sel.ParagraphFormat.Alignment = 1
    1..4 | ForEach-Object { $sel.TypeParagraph() | Out-Null }
    Apply-Font $sel 16 $true 0x003366
    $sel.TypeText('SISTEMA DE GESTION UNIVERSITARIA UEES')
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 18 $true 0x003366
    $sel.TypeText('ORGANIGRAMA DEL EQUIPO Y METODOLOGIA SCRUM')
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 12 $false 0x5A626E
    $sel.TypeText('Documento de referencia del proyecto SGUEES')
    1..8 | ForEach-Object { $sel.TypeParagraph() | Out-Null }
    Apply-Font $sel 12 $false 0x003366
    $sel.TypeText('Universidad Evangelica de El Salvador')
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 11 $false 0x003366
    $sel.TypeText('Subgerencia de Tecnologia de la Informacion (STI)')
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 11 $false 0x212529
    $sel.TypeText('San Salvador, 20 de agosto de 2026')
    $sel.InsertBreak(7) | Out-Null

    # ===== INTRO =====
    $sel.ParagraphFormat.Alignment = 0
    $sel.ParagraphFormat.SpaceAfter = 8
    Apply-Font $sel 14 $true 0x003366
    $sel.TypeText('1. Introduccion')
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 11 $false 0x212529
    $sel.TypeText('El presente documento describe la estructura del equipo que participa en el analisis y desarrollo del Sistema de Gestion Universitaria UEES (SGUEES), asi como la metodologia de trabajo adoptada (Scrum) y la asignacion de roles operativos. Sirve como referencia para auditoria, gobierno del proyecto y alineacion entre areas de negocio, STI, Control y Transformacion Digital.')
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null

    # ===== ORGANIGRAMA =====
    Apply-Font $sel 14 $true 0x003366
    $sel.TypeText('2. Organigrama del equipo de proyecto')
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 11 $false 0x212529
    $sel.TypeText('El proyecto se lidera desde la Subgerencia de Tecnologia de la Informacion y se organiza en seis equipos de trabajo. Cada equipo cuenta con un lider de area y roles de ejecucion o consulta segun el dominio.')
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null

    $pic = $sel.InlineShapes.AddPicture($imgOrg, $false, $true)
    $pic.LockAspectRatio = -1
    $pic.Width = 520
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null

    Apply-Font $sel 12 $true 0x003366
    $sel.TypeText('Resumen de equipos')
    $sel.TypeParagraph() | Out-Null

    $equipos = @(
        @('Academico', 'Director academico', 'Procesos academicos, atencion al estudiante, nuevo ingreso, proyeccion social/becas; consulta con egresados, Pyxoom y Educacion Continua.'),
        @('Contable y Financiero', 'Subgerente Contabilidad y Finanzas', 'Atencion financiera al estudiante y contabilidad.'),
        @('Talento Humano', 'Jefe de TH', 'Planillas; seleccion y contratacion de personal.'),
        @('Tecnico TI', 'Subgerente TI', 'Coordinacion de desarrollo y soporte; equipo de desarrollo contratado para el proyecto.'),
        @('Control', 'Jefe de auditoria', 'Auditor de sistemas, administrativo y academico.'),
        @('Transformacion Digital', 'Director desarrollo y TD', 'Consultor externo TD y analista UX.')
    )
    foreach ($e in $equipos) {
        Apply-Font $sel 11 $false 0x212529
        $sel.TypeText(('- Equipo ' + $e[0] + ' (Lider: ' + $e[1] + '). ' + $e[2]))
        $sel.TypeParagraph() | Out-Null
    }
    $sel.InsertBreak(7) | Out-Null

    # ===== SCRUM =====
    Apply-Font $sel 14 $true 0x003366
    $sel.TypeText('3. Metodologia de trabajo: Scrum')
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 11 $false 0x212529
    $sel.TypeText('Scrum es la forma de organizar el desarrollo de SGUEES. En lugar de intentar entregar todo el sistema de una sola vez, el equipo avanza en bloques cortos llamados Sprints (mini-metas semanales o quincenales). Cada Sprint tiene un objetivo claro; al finalizar se revisa lo entregado, se aprende y se planifica el siguiente bloque.')
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 11 $false 0x212529
    $sel.TypeText('Un Sprint es un periodo corto (normalmente de 1 a 4 semanas) en el que el equipo se concentra en cumplir una meta especifica. En SGUEES ese resultado se traduce en incrementos utiles: pantallas, flujos, reportes o validaciones que el area de negocio pueda revisar.')
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null

    $pic = $sel.InlineShapes.AddPicture($imgScrum, $false, $true)
    $pic.LockAspectRatio = -1
    $pic.Width = 520
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null

    Apply-Font $sel 12 $true 0x003366
    $sel.TypeText('Para que sirve Scrum en este proyecto')
    $sel.TypeParagraph() | Out-Null
    foreach ($b in @(
        'Organizar el trabajo de forma clara.',
        'Adaptarse con rapidez cuando cambian las prioridades del negocio.',
        'Entregar resultados parciales utiles en poco tiempo.',
        'Asegurar que todo el equipo conoce que hace y que hacen los demas.'
    )) {
        Apply-Font $sel 11 $false 0x212529
        $sel.TypeText('- ' + $b)
        $sel.TypeParagraph() | Out-Null
    }
    $sel.InsertBreak(7) | Out-Null

    # ===== ROLES =====
    Apply-Font $sel 14 $true 0x003366
    $sel.TypeText('4. Roles Scrum y estructura operativa')
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 11 $false 0x212529
    $sel.TypeText('La operacion Scrum del proyecto se articula bajo un Product Owner (Subgerente TI), Scrum Masters por frente, equipos de desarrollo y usuarios clave. Adicionalmente participan de forma transversal Auditoria Interna y Transformacion Digital.')
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null

    $pic = $sel.InlineShapes.AddPicture($imgRoles, $false, $true)
    $pic.LockAspectRatio = -1
    $pic.Width = 520
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null

    Apply-Font $sel 11 $false 0x212529
    $sel.TypeText('Nota: los equipos de desarrollo por area estaran conformados por 2 analistas. Los usuarios clave validan en cada Sprint; el Product Owner prioriza el backlog institucional.')
    $sel.TypeParagraph() | Out-Null
    $sel.InsertBreak(7) | Out-Null

    # ===== CONCLUSION =====
    Apply-Font $sel 14 $true 0x003366
    $sel.TypeText('5. Conclusion')
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 11 $false 0x212529
    $sel.TypeText('SGUEES se desarrolla con una estructura de equipos clara (Academico, Contable-Financiero, Talento Humano, Tecnico TI, Control y Transformacion Digital) y con una metodologia Scrum que permite entregar valor de forma incremental, con validacion continua de usuarios clave.')
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 11 $false 0x212529
    $sel.TypeText('Esta organizacion facilita la trazabilidad para auditoria, la priorizacion institucional del backlog y la coordinacion entre areas de negocio e infraestructura tecnologica, manteniendo un ritmo de trabajo sostenible hacia el MVP y las siguientes oleadas del ERP.')
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 11 $true 0x003366
    $sel.TypeText('Subgerencia de Tecnologia de la Informacion (STI)')
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 11 $false 0x212529
    $sel.TypeText('Universidad Evangelica de El Salvador')
    $sel.TypeParagraph() | Out-Null
    Apply-Font $sel 11 $false 0x212529
    $sel.TypeText('San Salvador, agosto de 2026')

    foreach ($p in @($outDoc, $outPdf)) {
        if (Test-Path $p) {
            try { Remove-Item $p -Force -ErrorAction Stop } catch {}
        }
    }
    if ((Test-Path $outDoc) -or (Test-Path $outPdf)) {
        $stamp = Get-Date -Format 'HHmmss'
        if (Test-Path $outDoc) { $outDoc = Join-Path $outDir "04-Organigrama-y-Metodologia-Scrum-SGUEES-$stamp.docx" }
        if (Test-Path $outPdf) { $outPdf = Join-Path $outDir "04-Organigrama-y-Metodologia-Scrum-SGUEES-$stamp.pdf" }
    }

    $doc.SaveAs([string]$outDoc)
    $doc.ExportAsFixedFormat([string]$outPdf, 17)
    $doc.Close($false)
}
finally {
    try { if ($word) { $word.Quit() } } catch {}
    [GC]::Collect()
}

Write-Host "OK DOCX $outDoc"
Write-Host "OK PDF  $outPdf"
Get-Item $outPdf, $outDoc -ErrorAction SilentlyContinue | Format-Table Name, Length, LastWriteTime
Get-ChildItem $imgDir | Format-Table Name, Length, LastWriteTime
