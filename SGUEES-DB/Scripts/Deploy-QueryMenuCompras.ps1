param(
    [string]$Server = '192.168.0.250',
    [string]$Database = 'SGUEES',
    [string]$User = 'erp',
    [string]$Password = 'Uees$$2026'
)
& sqlcmd -S $Server -d $Database -U $User -P $Password -f 65001 -W -s "|" -i (Join-Path $PSScriptRoot '_query_menu_compras.sql')
