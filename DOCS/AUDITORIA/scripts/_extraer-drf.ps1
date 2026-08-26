$ErrorActionPreference = 'Stop'
$uees = (Get-ChildItem $env:USERPROFILE -Directory | Where-Object { $_.Name -like 'OneDrive - Universidad*' } | Select-Object -First 1).FullName
$th = Join-Path $uees 'SISTEMA GESTION UNIVERSITARIA\ANALISIS DE REQUERIMIENTOS\TALENTO HUMANO'
$outDir = 'C:\Desarrollo GIT\SGUEES\DOCS\AUDITORIA\_extraccion'
$srcDir = 'C:\Desarrollo GIT\SGUEES\DOCS\AUDITORIA\_fuentes'
New-Item -ItemType Directory -Force -Path $outDir, $srcDir | Out-Null

$desc = Get-ChildItem -LiteralPath $th -Filter 'DRF - DESCRIPTOR Y PERFIL DE PUESTO - VF.docx' | Select-Object -First 1
$sel  = Get-ChildItem -LiteralPath $th -Filter 'DRF - SELECCI*N Y CONTRATACI*N DE PERSONAL - VF.docx' | Where-Object { $_.Name -notmatch 'V1' } | Select-Object -First 1
if (-not $sel) { $sel = Get-ChildItem -LiteralPath $th | Where-Object { $_.Name -like 'DRF - SELECCI*VF.docx' -and $_.Name -notlike '*V1*' } | Select-Object -First 1 }

Write-Host "DESC=$($desc.FullName)"
Write-Host "SEL=$($sel.FullName)"

$word = New-Object -ComObject Word.Application
$word.Visible = $false

function Export-Drf($file, $outName) {
    Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $srcDir $outName.Replace('.txt','.docx')) -Force
    $doc = $word.Documents.Open($file.FullName, $false, $true)
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("FILE=$($file.Name)")
    [void]$sb.AppendLine("TABLES=$($doc.Tables.Count)")
    [void]$sb.AppendLine('')
    $i = 0
    foreach ($p in $doc.Paragraphs) {
        $t = ($p.Range.Text -replace '[\r\x07]+','').Trim()
        if ($t.Length -lt 2) { continue }
        [void]$sb.AppendLine($t)
        $i++
        if ($i -ge 250) { [void]$sb.AppendLine('...[truncated paragraphs]...'); break }
    }
    [void]$sb.AppendLine('')
    [void]$sb.AppendLine('=== TABLES ===')
    $maxT = [Math]::Min($doc.Tables.Count, 25)
    for ($t = 1; $t -le $maxT; $t++) {
        $tb = $doc.Tables.Item($t)
        [void]$sb.AppendLine(("--- Table {0} {1}x{2} ---" -f $t, $tb.Rows.Count, $tb.Columns.Count))
        $maxR = [Math]::Min($tb.Rows.Count, 25)
        $maxC = [Math]::Min($tb.Columns.Count, 6)
        for ($r = 1; $r -le $maxR; $r++) {
            $line = New-Object System.Collections.Generic.List[string]
            for ($c = 1; $c -le $maxC; $c++) {
                try {
                    $cell = ($tb.Cell($r, $c).Range.Text -replace '[\r\x07]+', ' ').Trim()
                    if ($cell.Length -gt 120) { $cell = $cell.Substring(0,120) + '...' }
                    $line.Add($cell)
                } catch { $line.Add('') }
            }
            [void]$sb.AppendLine(($line -join ' | '))
        }
    }
    $path = Join-Path $outDir $outName
    [System.IO.File]::WriteAllText($path, $sb.ToString(), [System.Text.UTF8Encoding]::new($true))
    Write-Host "Wrote $path len=$($sb.Length) tables=$($doc.Tables.Count)"
    $doc.Close($false)
}

Export-Drf $desc 'drf-descriptor.txt'
Export-Drf $sel 'drf-seleccion.txt'
$word.Quit()
