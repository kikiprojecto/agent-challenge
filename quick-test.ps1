# Quick 5-Second Ollama Test
Write-Host "`n=== QUICK OLLAMA TEST (5s) ===" -ForegroundColor Cyan

# Determine which endpoint to test
$localUrl = "http://localhost:11434/api"
$remoteUrl = "https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnjakkybnxbw.node.k8s.prd.nos.ci/api"

# Check .env to see which one is configured
$envContent = Get-Content .env -ErrorAction SilentlyContinue
$configuredUrl = ($envContent | Select-String "OLLAMA_API_URL=").ToString().Split('=')[1]

Write-Host "Configured URL: $configuredUrl" -ForegroundColor White

# Determine if local or remote
$isLocal = $configuredUrl -like "*localhost*"
$testUrl = if ($isLocal) { $localUrl } else { $remoteUrl }
$model = if ($isLocal) { "qwen2.5-coder:7b" } else { "qwen3:8b" }

Write-Host "Testing: $testUrl" -ForegroundColor Yellow
Write-Host "Model: $model" -ForegroundColor Yellow

# Quick ping test
Write-Host "`nTest 1: Ping (2s timeout)..." -ForegroundColor Cyan
try {
    $pingResponse = Invoke-WebRequest -Uri "$testUrl/tags" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  SUCCESS: Endpoint reachable ($($pingResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "  FAILED: Endpoint not reachable" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($isLocal) {
        Write-Host "`n  TIP: Start Ollama with: ollama serve" -ForegroundColor Cyan
    } else {
        Write-Host "`n  TIP: Switch to local Ollama for better reliability" -ForegroundColor Cyan
        Write-Host "       Run: powershell -ExecutionPolicy Bypass -File setup-local-ollama.ps1" -ForegroundColor Cyan
    }
    exit 1
}

# Quick generation test
Write-Host "`nTest 2: Quick generation (5s timeout)..." -ForegroundColor Cyan
try {
    $body = @{
        model = $model
        prompt = "hello"
        stream = $false
    } | ConvertTo-Json

    $startTime = Get-Date
    $genResponse = Invoke-WebRequest `
        -Uri "$testUrl/generate" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 5 `
        -ErrorAction Stop
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    $result = $genResponse.Content | ConvertFrom-Json
    Write-Host "  SUCCESS: Generation working" -ForegroundColor Green
    Write-Host "  Response time: $([math]::Round($duration, 2))s" -ForegroundColor Cyan
    Write-Host "  Generated: $($result.response.Length) chars" -ForegroundColor Cyan
    
    if ($duration -lt 2) {
        Write-Host "  Speed: EXCELLENT" -ForegroundColor Green
    } elseif ($duration -lt 4) {
        Write-Host "  Speed: GOOD" -ForegroundColor Yellow
    } else {
        Write-Host "  Speed: SLOW" -ForegroundColor Red
    }
} catch {
    Write-Host "  FAILED: Generation not working" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($isLocal) {
        Write-Host "`n  TIP: Check if model is installed: ollama list" -ForegroundColor Cyan
        Write-Host "       Pull model: ollama pull $model" -ForegroundColor Cyan
    } else {
        Write-Host "`n  TIP: Remote endpoint is unstable" -ForegroundColor Cyan
        Write-Host "       Switch to local: powershell -ExecutionPolicy Bypass -File setup-local-ollama.ps1" -ForegroundColor Cyan
    }
    exit 1
}

Write-Host "`n=== ALL TESTS PASSED ===" -ForegroundColor Green
Write-Host "Ollama is ready for code generation!" -ForegroundColor Green
Write-Host ""
