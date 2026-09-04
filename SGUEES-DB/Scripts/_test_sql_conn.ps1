$ErrorActionPreference = 'Stop'
$json = Get-Content 'C:\Desarrollo GIT\SGUEES\SGUEES-API\sguees.api\appsettings.json' -Raw | ConvertFrom-Json
$cs = $json.connectionStrings.defaultConnection
$cn = New-Object System.Data.SqlClient.SqlConnection $cs
try {
    $cn.Open()
    Write-Output ("OK ServerVersion=" + $cn.ServerVersion)
    $cmd = $cn.CreateCommand()
    $cmd.CommandText = "SELECT DB_NAME() AS DB, SYSTEM_USER AS USR"
    $r = $cmd.ExecuteReader()
    if ($r.Read()) {
        Write-Output ("DB=" + $r['DB'] + " USR=" + $r['USR'])
    }
    $r.Close()
    $cn.Close()
}
catch {
    Write-Output ("FAIL " + $_.Exception.Message)
    exit 1
}
