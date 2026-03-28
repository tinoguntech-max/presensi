# Script export database cbt_smk dari XAMPP
# Jalankan di PowerShell: .\scripts\export-db.ps1

$mysqlDump = "C:\xampp\mysql\bin\mysqldump.exe"
$outputFile = ".\scripts\cbt_smk_export.sql"
$database = "cbt_smk"
$user = "root"

Write-Host "Exporting database $database..." -ForegroundColor Cyan

& $mysqlDump -u $user --databases $database `
  --no-tablespaces `
  --skip-lock-tables `
  --result-file=$outputFile

if ($LASTEXITCODE -eq 0) {
  Write-Host "Export berhasil: $outputFile" -ForegroundColor Green
  $size = (Get-Item $outputFile).Length / 1MB
  Write-Host "Ukuran file: $([math]::Round($size, 2)) MB" -ForegroundColor Green
} else {
  Write-Host "Export gagal!" -ForegroundColor Red
}
