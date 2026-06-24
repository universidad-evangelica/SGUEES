<#
.SYNOPSIS
    Elimina CORR_SUSCRIPCION y CORR_CONFI_PAIS de todos los scripts SQL en SGUEES-DB.
    Adapta tablas, vistas, funciones y stored procedures.
#>

param(
    [string]$BasePath = "c:\Desarrollo GIT\SGUEES\SGUEES-DB",
    [switch]$DryRun
)

$totalModified = 0
$totalErrors = 0

function Remove-MultiTenantRefs {
    param([string]$Content, [string]$FileType)
    
    $c = $Content

    # === PARAMETROS / DECLARACIONES ===
    # @CORR_SUSCRIPCION int, (con o sin salto de linea)
    $c = $c -replace '(?mi)^\s*@CORR_SUSCRIPCION\s+int\s*,?\s*\r?\n', ''
    $c = $c -replace '(?mi)^\s*@CORR_CONFI_PAIS\s+int\s*,?\s*\r?\n', ''
    
    # === COLUMNAS EN CREATE TABLE ===
    # [CORR_SUSCRIPCION] [int] NOT NULL CONSTRAINT [DF_...] DEFAULT ((1)),
    $c = $c -replace '(?mi)^\s*\[CORR_SUSCRIPCION\]\s+\[int\][^\r\n]*,?\s*\r?\n', ''
    $c = $c -replace '(?mi)^\s*\[CORR_CONFI_PAIS\]\s+\[int\][^\r\n]*,?\s*\r?\n', ''
    
    # Columnas sin brackets en CREATE TABLE / return table
    $c = $c -replace '(?mi)^\s*CORR_SUSCRIPCION\s+(int|INT)\s*,?\s*\r?\n', ''
    $c = $c -replace '(?mi)^\s*CORR_CONFI_PAIS\s+(int|INT)\s*,?\s*\r?\n', ''

    # === PK/UK CONSTRAINTS - quitar de listas de columnas ===
    # ([CORR_SUSCRIPCION], [CORR_CONFI_PAIS], [CORR_EMPRESA]...) → ([CORR_EMPRESA]...)
    $c = $c -replace '\[CORR_SUSCRIPCION\]\s*,\s*', ''
    $c = $c -replace '\[CORR_CONFI_PAIS\]\s*,\s*', ''
    
    # === WHERE CLAUSES ===
    # WHERE CORR_SUSCRIPCION=@CORR_SUSCRIPCION \n AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS \n AND → WHERE
    $c = $c -replace '(?mi)WHERE\s+CORR_SUSCRIPCION\s*=\s*@CORR_SUSCRIPCION\s*\r?\n\s*AND\s+CORR_CONFI_PAIS\s*=\s*@CORR_CONFI_PAIS\s*\r?\n\s*AND\s+', 'WHERE '
    # WHERE CORR_SUSCRIPCION=@CORR_SUSCRIPCION AND CORR_CONFI_PAIS=@CORR_CONFI_PAIS AND (same line)
    $c = $c -replace '(?mi)WHERE\s+CORR_SUSCRIPCION\s*=\s*@CORR_SUSCRIPCION\s+AND\s+CORR_CONFI_PAIS\s*=\s*@CORR_CONFI_PAIS\s+AND\s+', 'WHERE '
    
    # AND CORR_SUSCRIPCION=@CORR_SUSCRIPCION (linea completa)
    $c = $c -replace '(?mi)^\s*AND\s+CORR_SUSCRIPCION\s*=\s*@CORR_SUSCRIPCION\s*\r?\n', ''
    $c = $c -replace '(?mi)^\s*AND\s+CORR_CONFI_PAIS\s*=\s*@CORR_CONFI_PAIS\s*\r?\n', ''
    
    # Inline: AND CORR_SUSCRIPCION=@CORR_SUSCRIPCION (no al inicio de linea)
    $c = $c -replace '(?i)\s+AND\s+CORR_SUSCRIPCION\s*=\s*@CORR_SUSCRIPCION', ''
    $c = $c -replace '(?i)\s+AND\s+CORR_CONFI_PAIS\s*=\s*@CORR_CONFI_PAIS', ''

    # === JOIN ON CONDITIONS (con alias) ===
    # ON A.CORR_SUSCRIPCION=B.CORR_SUSCRIPCION AND A.CORR_CONFI_PAIS=B.CORR_CONFI_PAIS AND → ON
    $c = $c -replace '(?i)ON\s+\w+\.CORR_SUSCRIPCION\s*=\s*\w+\.CORR_SUSCRIPCION\s+AND\s+\w+\.CORR_CONFI_PAIS\s*=\s*\w+\.CORR_CONFI_PAIS\s+AND\s+', 'ON '
    # ON A.CORR_SUSCRIPCION=B.CORR_SUSCRIPCION AND A.CORR_CONFI_PAIS=B.CORR_CONFI_PAIS (sin AND despues - final de ON)
    $c = $c -replace '(?i)ON\s+\w+\.CORR_SUSCRIPCION\s*=\s*\w+\.CORR_SUSCRIPCION\s+AND\s+\w+\.CORR_CONFI_PAIS\s*=\s*\w+\.CORR_CONFI_PAIS\b', 'ON 1=1'
    
    # AND alias.CORR_SUSCRIPCION=alias.CORR_SUSCRIPCION (restantes en JOINs)
    $c = $c -replace '(?i)\s+AND\s+\w+\.CORR_SUSCRIPCION\s*=\s*\w+\.CORR_SUSCRIPCION', ''
    $c = $c -replace '(?i)\s+AND\s+\w+\.CORR_CONFI_PAIS\s*=\s*\w+\.CORR_CONFI_PAIS', ''
    
    # WHERE alias.CORR_SUSCRIPCION=@CORR_SUSCRIPCION AND alias.CORR_CONFI_PAIS=@CORR_CONFI_PAIS AND
    $c = $c -replace '(?mi)WHERE\s+\w+\.CORR_SUSCRIPCION\s*=\s*@CORR_SUSCRIPCION\s*\r?\n\s*AND\s+\w+\.CORR_CONFI_PAIS\s*=\s*@CORR_CONFI_PAIS\s*\r?\n\s*AND\s+', 'WHERE '
    $c = $c -replace '(?mi)WHERE\s+\w+\.CORR_SUSCRIPCION\s*=\s*@CORR_SUSCRIPCION\s+AND\s+\w+\.CORR_CONFI_PAIS\s*=\s*@CORR_CONFI_PAIS\s+AND\s+', 'WHERE '
    
    # AND alias.CORR_SUSCRIPCION=@CORR_SUSCRIPCION
    $c = $c -replace '(?i)\s+AND\s+\w+\.CORR_SUSCRIPCION\s*=\s*@CORR_SUSCRIPCION', ''
    $c = $c -replace '(?i)\s+AND\s+\w+\.CORR_CONFI_PAIS\s*=\s*@CORR_CONFI_PAIS', ''
    
    # === SELECT COLUMNS (con alias) ===
    # SELECT A.CORR_SUSCRIPCION, (o ,A.CORR_SUSCRIPCION al inicio de linea)
    $c = $c -replace '(?mi)^\s*,?\s*\w*\.?CORR_SUSCRIPCION\s*,?\s*\r?\n', ''
    $c = $c -replace '(?mi)^\s*,?\s*\w*\.?CORR_CONFI_PAIS\s*,?\s*\r?\n', ''
    
    # Inline SELECT: ,CORR_SUSCRIPCION, or ,A.CORR_SUSCRIPCION,
    $c = $c -replace '(?i),\s*\w*\.?CORR_SUSCRIPCION\s*,', ','
    $c = $c -replace '(?i),\s*\w*\.?CORR_CONFI_PAIS\s*,', ','
    $c = $c -replace '(?i),\s*\w*\.?CORR_SUSCRIPCION\b', ''
    $c = $c -replace '(?i),\s*\w*\.?CORR_CONFI_PAIS\b', ''
    $c = $c -replace '(?i)\b\w*\.?CORR_SUSCRIPCION\s*,', ''
    $c = $c -replace '(?i)\b\w*\.?CORR_CONFI_PAIS\s*,', ''
    
    # === GROUP BY (con alias) ===
    # Already handled by inline SELECT patterns above
    
    # === INSERT / VALUES ===
    $c = $c -replace '(?i)CORR_SUSCRIPCION\s*,\s*CORR_CONFI_PAIS\s*,', ''
    $c = $c -replace '(?i)@CORR_SUSCRIPCION\s*,\s*@CORR_CONFI_PAIS\s*,', ''
    # Default values 1,1,
    $c = $c -replace '(?i)\(1\)\s*,\s*\(1\)\s*,', ''
    
    # === SP PARAMETER lines with AddParameter style ===
    $c = $c -replace "(?mi)^\s*MyBase\.AddParameter\(.*CORR_SUSCRIPCION.*\)\s*\r?\n", ''
    $c = $c -replace "(?mi)^\s*MyBase\.AddParameter\(.*CORR_CONFI_PAIS.*\)\s*\r?\n", ''
    
    # === REMAINING: DatosTabla.CORR_SUSCRIPCION, @CORR_SUSCRIPCION in SP params ===
    $c = $c -replace '(?i)DatosTabla\.CORR_SUSCRIPCION\s*,?\s*', ''
    $c = $c -replace '(?i)DatosTabla\.CORR_CONFI_PAIS\s*,?\s*', ''
    
    # === DEFAULT CONSTRAINT names (orphaned) ===
    $c = $c -replace '(?mi)^\s*CONSTRAINT\s+\[DF_\w+_CORR_SUSCRIPCION\]\s+DEFAULT\s+\(\(1\)\)\s*,?\s*\r?\n', ''
    $c = $c -replace '(?mi)^\s*CONSTRAINT\s+\[DF_\w+_CORR_CONFI_PAIS\]\s+DEFAULT\s+\(\(1\)\)\s*,?\s*\r?\n', ''

    # === FillClass params ===
    $c = $c -replace '(?i)ByVal\s+vCORR_SUSCRIPCION\s+As\s+Int32\s*,\s*', ''
    $c = $c -replace '(?i)ByVal\s+vCORR_CONFI_PAIS\s+As\s+Int32\s*,\s*', ''
    
    # === Cleanup: double commas, leading commas, trailing commas ===
    $c = $c -replace ',\s*,', ','
    $c = $c -replace '\(\s*,', '('
    $c = $c -replace ',\s*\)', ')'
    
    # === Cleanup: empty lines created by removals (max 2 consecutive) ===
    $c = $c -replace '(\r?\n){4,}', "`n`n"
    
    return $c
}

# === PROCESAR ARCHIVOS ===
$types = @("Tables", "Functions", "Views", "Stored Procedures")

foreach ($type in $types) {
    $dir = Join-Path $BasePath $type
    if (!(Test-Path $dir)) { continue }
    
    $files = Get-ChildItem $dir -Filter "*.sql" | Where-Object {
        (Get-Content $_.FullName -Raw) -match 'CORR_SUSCRIPCION|CORR_CONFI_PAIS'
    }
    
    $modified = 0
    foreach ($file in $files) {
        $original = Get-Content $file.FullName -Raw
        $adapted = Remove-MultiTenantRefs -Content $original -FileType $type
        
        if ($adapted -ne $original) {
            if (!$DryRun) {
                Set-Content -Path $file.FullName -Value $adapted -Encoding UTF8 -NoNewline
            }
            $modified++
        }
    }
    
    Write-Host "$type`: $modified archivos modificados de $($files.Count) con referencias"
    $totalModified += $modified
}

# Verificar si quedan referencias
Write-Host "`n=== VERIFICACION ==="
foreach ($type in $types) {
    $dir = Join-Path $BasePath $type
    if (!(Test-Path $dir)) { continue }
    $remaining = Get-ChildItem $dir -Filter "*.sql" | Where-Object {
        (Get-Content $_.FullName -Raw) -match 'CORR_SUSCRIPCION|CORR_CONFI_PAIS'
    }
    if ($remaining.Count -gt 0) {
        Write-Host "PENDIENTE $type`: $($remaining.Count) archivos aun con referencias"
        $remaining | ForEach-Object { 
            $refs = (Get-Content $_.FullName -Raw | Select-String 'CORR_SUSCRIPCION|CORR_CONFI_PAIS' -AllMatches).Matches.Count
            Write-Host "  $($_.Name) ($refs refs)"
        }
        $totalErrors += $remaining.Count
    } else {
        Write-Host "OK $type`: 0 archivos con referencias"
    }
}

Write-Host "`n=== RESUMEN ==="
Write-Host "Total modificados: $totalModified"
Write-Host "Archivos pendientes: $totalErrors"
