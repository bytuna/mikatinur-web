$ErrorActionPreference = "Stop"
try {
    Write-Host "--- ISLEM BASLIYOR ---" -ForegroundColor Cyan
    npm run build
    $ANDROID_PATH = "C:\Users\Emir Mirza\AndroidStudioProjects\MikatiNur\app\src\main\assets\risale_web"
    if (Test-Path $ANDROID_PATH) { Remove-Item -Recurse -Force "$ANDROID_PATH\*" }
    else { New-Item -ItemType Directory -Path $ANDROID_PATH -Force }
    Copy-Item -Path "out\*" -Destination $ANDROID_PATH -Recurse
    Write-Host "--- SUCCESS: ISLEM TAMAMLANDI ---" -ForegroundColor Green
} catch {
    Write-Host "--- ERROR: $($_.Exception.Message) ---" -ForegroundColor Red
}
Pause