# Quick Ollama Endpoint Test
Write-Host "`n=== TESTING OLLAMA ENDPOINT ===" -ForegroundColor Cyan

$remoteUrl = "https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnjakkybnxbw.node.k8s.prd.nos.ci/api"

Write-Host "`nTest 1: Checking /tags endpoint (10s timeout)..." -ForegroundColor Yellow
try {
    $tagsResponse = Invoke-WebRequest -Uri "$remoteUrl/tags" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "SUCCESS: Remote endpoint is reachable" -ForegroundColor Green
    Write-Host "Status Code: $($tagsResponse.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED: Remote endpoint not reachable" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "`nRECOMMENDATION: Use local Ollama instead" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nTest 2: Quick generation test (10s timeout)..." -ForegroundColor Yellow
try {
    $testBody = @{
        model = "qwen3:8b"
        prompt = "Say hello"
        stream = $false
    } | ConvertTo-Json

    $genResponse = Invoke-WebRequest -Uri "$remoteUrl/generate" -Method POST -Body $testBody -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "SUCCESS: Generation endpoint working" -ForegroundColor Green
    Write-Host "Status Code: $($genResponse.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED: Generation endpoint not working" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "`nRECOMMENDATION: Use local Ollama instead" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== REMOTE ENDPOINT IS WORKING ===" -ForegroundColor Green
Write-Host ""
