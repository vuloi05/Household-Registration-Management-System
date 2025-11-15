# Script để xem logs real-time của backend
Write-Host "🔍 Monitoring backend logs for payment requests..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

$logFile = "backend-output.log"
$errorLogFile = "backend-error.log"

if (-not (Test-Path $logFile)) {
    Write-Host "⚠️ Log file not found: $logFile" -ForegroundColor Red
    Write-Host "Backend may not be running or logs are not being written." -ForegroundColor Yellow
    exit
}

# Xem logs real-time
Get-Content $logFile -Wait -Tail 50 | ForEach-Object {
    if ($_ -match "Payment|payment|Authentication|403|Forbidden|ROLE|authorities|ERROR|Error") {
        Write-Host $_ -ForegroundColor Cyan
    } else {
        Write-Host $_
    }
}

