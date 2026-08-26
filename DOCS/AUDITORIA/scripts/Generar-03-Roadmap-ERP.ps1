# Genera 03-Roadmap-ERP-SGUEES.docx (Open XML, sin Word COM).
# Hoja de ruta 2025-2028. NO usa corte CTD.
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$root   = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $root 'Word'
$outDoc = Join-Path $outDir '03-Roadmap-ERP-SGUEES.docx'
$tmp    = Join-Path $env:TEMP ('sguees-roadmap-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $outDir, $tmp, (Join-Path $tmp '_rels'), (Join-Path $tmp 'word'), (Join-Path $tmp 'word\_rels') | Out-Null

function Xml([string]$s) {
    if ($null -eq $s) { return '' }
    return ($s -replace '&','&amp;' -replace '<','&lt;' -replace '>','&gt;')
}

function P([string]$text, [int]$size = 22, [bool]$bold = $false, [string]$color = '212529', [string]$align = 'left', [int]$spaceA = 160, [int]$spaceB = 0) {
    $b = if ($bold) { '<w:b/>' } else { '' }
    $jc = switch ($align) { 'center' { 'center' } 'right' { 'right' } default { 'left' } }
    return @"
<w:p>
  <w:pPr><w:jc w:val="$jc"/><w:spacing w:before="$spaceB" w:after="$spaceA" w:line="276" w:lineRule="auto"/></w:pPr>
  <w:r>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="$size"/><w:szCs w:val="$size"/>$b<w:color w:val="$color"/></w:rPr>
    <w:t xml:space="preserve">$(Xml $text)</w:t>
  </w:r>
</w:p>
"@
}

function Heading([string]$text) { P $text 26 $true '003366' 'left' 160 280 }

function Bullet([string]$text) { P ("- " + $text) 22 $false '212529' 'left' 80 0 }

function Memo([string]$label, [string]$value) {
    return @"
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="5000" w:type="pct"/>
    <w:tblBorders>
      <w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid><w:gridCol w:w="1400"/><w:gridCol w:w="7400"/></w:tblGrid>
  <w:tr>
    <w:tc>
      <w:tcPr><w:tcW w:w="1400" w:type="dxa"/></w:tcPr>
      $(P $label 22 $true '003366' 'left' 40 0)
    </w:tc>
    <w:tc>
      <w:tcPr><w:tcW w:w="7400" w:type="dxa"/></w:tcPr>
      $(P $value 22 $false '212529' 'left' 40 0)
    </w:tc>
  </w:tr>
</w:tbl>
"@
}

function Cell([string]$text, [bool]$hdr = $false) {
    if ($hdr) {
        $shd = '<w:shd w:val="clear" w:color="auto" w:fill="003366"/>'
        $run = P $text 18 $true 'FFFFFF' 'center' 40 40
    } else {
        $shd = '<w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>'
        $run = P $text 18 $false '212529' 'left' 40 40
    }
    return "<w:tc><w:tcPr>$shd<w:tcW w:w=`"0`" w:type=`"auto`"/></w:tcPr>$run</w:tc>"
}

function Tbl([string[]]$headers, [object[]]$rows) {
    $n = $headers.Count
    $grid = ($headers | ForEach-Object { '<w:gridCol w:w="2000"/>' }) -join ''
    $hrow = '<w:tr>' + (($headers | ForEach-Object { Cell $_ $true }) -join '') + '</w:tr>'
    $body = ''
    foreach ($row in $rows) {
        $cells = ''
        for ($i = 0; $i -lt $n; $i++) { $cells += (Cell ([string]$row[$i]) $false) }
        $body += "<w:tr>$cells</w:tr>"
    }
    return @"
<w:tbl>
  <w:tblPr>
    <w:tblW w:w="5000" w:type="pct"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="4" w:space="0" w:color="D2D8DE"/>
      <w:left w:val="single" w:sz="4" w:space="0" w:color="D2D8DE"/>
      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D2D8DE"/>
      <w:right w:val="single" w:sz="4" w:space="0" w:color="D2D8DE"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="D2D8DE"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="D2D8DE"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid>$grid</w:tblGrid>
  $hrow
  $body
</w:tbl>
$(P '' 22 $false '212529' 'left' 120 0)
"@
}

$body = @(
    (P 'UNIVERSIDAD EVANGELICA DE EL SALVADOR' 20 $false '003366' 'center' 80 0)
    (P 'Subgerencia de Tecnologia de la Informacion (STI)' 20 $false '003366' 'center' 80 0)
    (P 'HOJA DE RUTA  |  ROADMAP ERP' 32 $true '003366' 'center' 160 240)
    (P 'Sistema de Gestion Universitaria (SGUEES)' 26 $true 'C9A227' 'center' 280 0)
    (Memo 'Para:' 'Auditoria Interna / Direccion Ejecutiva')
    (Memo 'De:' 'Ing. Jonathan Avalos, Subgerencia de Tecnologia de la Informacion (STI)')
    (Memo 'CC.:' 'Gerencia General')
    (Memo 'Fecha:' 'Miercoles 19 de agosto de 2026')
    (P 'Este documento describe la hoja de ruta del ERP institucional SGUEES: hacia donde va el producto, en que oleadas se entrega y cual es el alcance del MVP. El avance porcentual de cada procedimiento se actualiza en el cronograma vivo (Excel 02). Esta hoja de ruta no replica cortes de otros informes institucionales.')

    (Heading '1. Vision del producto')
    (P 'SGUEES es el sistema integrado de gestion universitaria de la UEES. Sustituye de forma progresiva las limitaciones de CLASS WEB (trazabilidad, mantenimiento del proveedor y capacidad de evolucion), centralizando procesos academicos, financieros y de talento humano en una plataforma propia, segura y sostenible.')
    (P 'La iniciativa busca fortalecer la toma de decisiones basada en datos, mejorar la experiencia del usuario y contar con una arquitectura tecnologica escalable para los proximos diez anos.')

    (Heading '2. Objetivos')
    (Bullet 'Disenar e implementar un sistema integrado que centralice procesos academicos, financieros, de talento humano y planillas, con interoperabilidad y eficiencia.')
    (Bullet 'Contar con una plataforma con enfoque al usuario: procesos mas agiles, accesibles y trazables.')
    (Bullet 'Fortalecer decisiones basadas en datos (tableros e indicadores institucionales).')
    (Bullet 'Construir una arquitectura SPA + API + base de datos, segura y mantenible por STI.')

    (Heading '3. Principios de la hoja de ruta')
    (Tbl @('Principio','Que significa en SGUEES') @(
        @('Migracion incremental','Modulo a modulo. No hay un corte big-bang que apague CLASS de un dia para otro.'),
        @('Convivencia controlada','CLASS y los sistemas actuales siguen en operacion mientras SGUEES sustituye funciones de forma progresiva.'),
        @('Misma tecnologia','SPA (Angular), API (.NET) y SQL Server. Lo ya construido (ejemplo: Compras) se integra y se valida, no se reescribe por moda.'),
        @('Estandar de desarrollo','Pantallas nuevas bajo el patron de mantenimiento STI (catalogos, permisos, menu en BD).'),
        @('Entregas parciales utiles','Trabajo en sprints. Cada oleada deja procesos usables, no un ERP incompleto para despues.'),
        @('Avance en el cronograma vivo','El % de desarrollo de cada procedimiento lo actualiza STI en el Excel 02. Este Word fija la ruta, no el porcentaje semanal.')
    ))

    (Heading '4. Horizonte 2025-2028')
    (P 'Cuando el proyecto se presenta a autoridades y el presupuesto queda aprobado, el orden de las oleadas es el siguiente. Los equipos de negocio (Academico, Contable-Financiero, Talento Humano) y STI avanzan en paralelo; Control valida entrega de requerimientos y procesos.')
    (Tbl @('Oleada','Periodo','Que entrega','Quien valida') @(
        @('Fundacion','2025-2026','Arquitectura, seguridad, estandar, ambientes, identificacion de procedimientos y DRF de prioridad.','STI / usuarios clave'),
        @('MVP (Fase 1)','2026-2027','Nucleo operable: seleccion y descriptor; contabilidad y tesoreria base; flujo de ingreso academico hasta matricula. CLASS permanece donde aun no hay modulo.','Usuarios clave / Control'),
        @('Expansion','2027-2028','Resto de procedimientos priorizados (nomina completa, activo fijo, academia de notas y curricular, portales).','Usuarios clave / Control'),
        @('Sostenibilidad','2028','Puesta en marcha consolidada, mantenimiento, soporte y evolucion (analitica / bodega de datos cuando el nucleo este estable).','STI / Direccion')
    ))

    (Heading '5. Alcance del MVP (Fase 1 del ERP) — horizonte 2027')
    (P 'La Fase 1 no cierra todo el ERP. Cierra un nucleo institucional usable. Compras ya existe en la misma tecnologia: se pasa a SGUEES y se valida (integracion); no se usa como prueba de que el ERP esta terminado.')
    (Tbl @('Frente','Procedimientos del MVP','Notas de alcance') @(
        @('Talento Humano','Seleccion y contratacion; Descriptor y perfil de puesto; Expediente de empleado; Planilla (nucleo)','DRF de seleccion y descriptor ya existen. Falta completar flujos de autorizacion y el resto de contratacion.'),
        @('Contabilidad y Finanzas','Contabilidad; Caja y bancos; Cuentas por pagar / Pagos; Conciliacion bancaria','Base visible (partidas, cheques, catalogos). Los ciclos de negocio se cierran en esta oleada.'),
        @('Academico','Admision; Socioeconomico; Nuevo ingreso; Matricula','Operacion actual en CLASS hasta que el modulo SGUEES reciba el proceso. Becas queda documentada; no es nucleo del primer cierre.'),
        @('Plataforma','Compras (catalogos y documentos)','Estado: en integracion. Misma tecnologia; se valida. No cierra la Fase 1.')
    ))

    (Heading '6. Oleada de expansion (despues del MVP)')
    (P 'El Plan de Trabajo institucional identifica procedimientos que no entran al primer nucleo y se programan a continuacion, segun priorizacion de negocio y capacidad STI:')
    (Tbl @('Frente','Procedimientos posteriores al MVP (no exhaustivo)') @(
        @('Talento Humano','Separacion de personal; Capacitacion; Nomina completa; Induccion; Evaluacion de desempeno; Clima y cultura; Creacion y traspaso de puestos'),
        @('Contabilidad y Finanzas','Caja chica; Activo fijo; Corte de caja; Inventario; Impuestos; Cuentas por cobrar; Facturacion electronica'),
        @('Academico','Seguimiento al estudiante; Egresados y graduacion; Educacion continua; Cambio de plan; Equivalencias; Portales estudiante y docente; Notas y gestion curricular')
    ))

    (Heading '7. Cadena de trabajo de cada procedimiento')
    (P 'Cada procedimiento recorre la misma cadena. No se declara un procedimiento terminado por haber identificado el proceso en DICA ni por existir catalogos de apoyo.')
    (Tbl @('Etapa','Producto','Cuando se considera avanzada') @(
        @('Identificacion','Procedimiento en el manual / DICA','El proceso institucional esta descrito. No es avance de modulo en SGUEES.'),
        @('Analisis (DRF)','Documento de requerimientos funcionales','Hay RF acordados con el area. El % de desarrollo lo pone STI en el cronograma, no el DRF en automatico.'),
        @('Diseno','Modelo de datos, pantallas, flujos, permisos','Hay diseno aplicable a SPA + API + BD.'),
        @('Desarrollo','Opciones en SGUEES','Hay software usable del flujo. El porcentaje (75%, 80%, etc.) se escribe en el Excel 02.'),
        @('Pruebas','UAT con usuarios clave','El area acepta el prototipo funcional.'),
        @('Implementacion','Puesta en marcha y convivencia con CLASS','Usuarios operan en SGUEES para ese proceso.'),
        @('Mantenimiento','Soporte y evolucion','Post puesta en marcha.')
    ))

    (Heading '8. Transicion operativa')
    (P 'Los sistemas actuales permanecen en operacion y con soporte para no cortar la continuidad institucional. Durante el desarrollo se sustituyen funciones especificas. SGUEES alimentara y sincronizara informacion con lo existente mientras dure la convivencia, para no romper integridad de datos. La migracion es controlada: primero el nucleo MVP, despues el resto de oleadas.')

    (Heading '9. Relacion con el cronograma vivo')
    (P 'El documento 02 (Excel) es el tablero de procedimientos y porcentajes. Este documento 03 es la hoja de ruta: oleadas, alcance y reglas. Si un porcentaje cambia, se edita Desarrollo en el backlog; no se reescribe este roadmap salvo cambio de alcance o de horizonte.')
    (Tbl @('Documento','Para que sirve','Que no hace') @(
        @('01 Acta (PDF Directorio)','Mandato y acuerdo institucional','No es cronograma ni % de modulo'),
        @('02 Cronograma (Excel)','Avance por procedimiento, estados, opciones y DRF de apoyo','No redefine las oleadas 2025-2028'),
        @('03 Roadmap (este documento)','Ruta del ERP: MVP, expansion y transicion','No publica un corte porcentual de otros informes; el avance vive en el Excel 02')
    ))

    (Heading '10. Conclusiones')
    (P 'SGUEES se construye por oleadas hasta 2028, con un MVP de nucleo en 2027 (Talento Humano, Contabilidad y Finanzas, flujo academico de ingreso, e integracion de Compras). CLASS no se apaga al inicio de la Fase 1. El detalle de avance lo mantiene STI en el cronograma vivo; esta hoja de ruta fija el rumbo del producto.')
    (P 'Ing. Jonathan Avalos' 22 $false '212529' 'left' 80 480)
    (P 'Subgerencia de Tecnologia de la Informacion (STI)' 20 $true '003366' 'left' 40 0)
    (P 'Universidad Evangelica de El Salvador' 20 $false '212529' 'left' 40 0)
    (P 'San Salvador, agosto de 2026' 20 $false '212529' 'left' 40 0)
) -join [Environment]::NewLine

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    $body
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
"@

$rels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"@

$utf8 = New-Object System.Text.UTF8Encoding $true
[IO.File]::WriteAllText((Join-Path $tmp '[Content_Types].xml'), $contentTypes, $utf8)
[IO.File]::WriteAllText((Join-Path $tmp '_rels\.rels'), $rels, $utf8)
[IO.File]::WriteAllText((Join-Path $tmp 'word\document.xml'), $documentXml, $utf8)

if (Test-Path $outDoc) { Remove-Item $outDoc -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tmp, $outDoc, [System.IO.Compression.CompressionLevel]::Optimal, $false)
Remove-Item $tmp -Recurse -Force
Write-Host "OK $outDoc"
Get-Item $outDoc | Format-List FullName, Length, LastWriteTime
