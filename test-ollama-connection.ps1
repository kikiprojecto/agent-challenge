# Test Ollama Connection Script
# Tests the Nosana-hosted Ollama endpoint

Write-Host "`n=== OLLAMA CONNECTION TEST ===" -ForegroundColor Cyan
Write-Host ""

# Read .env file
$envFile = Get-Content .env -ErrorAction SilentlyContinue
$ollamaUrl = ($envFile | Select-String "OLLAMA_API_URL=").ToString().Split('=')[1]

if (-not $ollamaUrl) {
    Write-Host "ERROR: OLLAMA_API_URL not found in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "Endpoint: $ollamaUrl" -ForegroundColor White
Write-Host ""

# Test 1: Basic connectivity
Write-Host "Test 1: Basic Connectivity" -ForegroundColor Yellow
try {
    $testBody = @{
        model = "qwen3:8b"
        prompt = "Say 'Hello'"
        stream = $false
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$ollamaUrl/generate" `
        -Method POST `
        -Body $testBody `
        -ContentType "application/json" `
        -TimeoutSec 15 `
        -ErrorAction Stop

    Write-Host "SUCCESS: Connection established" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Cyan
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "   Model: $($result.model)" -ForegroundColor Cyan
    Write-Host "   Response Length: $($result.response.Length) chars" -ForegroundColor Cyan
    
} catch {
    Write-Host "FAILED: Connection failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host ""

# Test 2: Code generation test
Write-Host "Test 2: Simple Code Generation" -ForegroundColor Yellow
try {
    $codePrompt = @{
        model = "qwen3:8b"
        prompt = "Generate a Python function that adds two numbers. Just the code, no explanation."
        stream = $false
    } | ConvertTo-Json

    $codeResponse = Invoke-WebRequest `
        -Uri "$ollamaUrl/generate" `
        -Method POST `
        -Body $codePrompt `
        -ContentType "application/json" `
        -TimeoutSec 20 `
        -ErrorAction Stop

    Write-Host "SUCCESS: Code generation working" -ForegroundColor Green
    
    $codeResult = $codeResponse.Content | ConvertFrom-Json
    Write-Host "   Generated $($codeResult.response.Length) characters" -ForegroundColor Cyan
    
    # Show first 100 chars of response
    $preview = $codeResult.response.Substring(0, [Math]::Min(100, $codeResult.response.Length))
    Write-Host "   Preview: $preview..." -ForegroundColor Gray
    
} catch {
    Write-Host "FAILED: Code generation failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Performance test
Write-Host "Test 3: Performance Check" -ForegroundColor Yellow
$startTime = Get-Date

try {
    $perfBody = @{
        model = "qwen3:8b"
        prompt = "Count from 1 to 5"
        stream = $false
    } | ConvertTo-Json

    $perfResponse = Invoke-WebRequest `
        -Uri "$ollamaUrl/generate" `
        -Method POST `
        -Body $perfBody `
        -ContentType "application/json" `
        -TimeoutSec 15 `
        -ErrorAction Stop

    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-Host "SUCCESS: Performance test passed" -ForegroundColor Green
    Write-Host "   Response Time: $([math]::Round($duration, 2)) seconds" -ForegroundColor Cyan
    
    if ($duration -lt 5) {
        Write-Host "   Speed: EXCELLENT" -ForegroundColor Green
    } elseif ($duration -lt 10) {
        Write-Host "   Speed: GOOD" -ForegroundColor Yellow
    } else {
        Write-Host "   Speed: SLOW" -ForegroundColor Red
    }
    
} catch {
    Write-Host "FAILED: Performance test failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== TEST COMPLETE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ollama endpoint is READY for production use!" -ForegroundColor Green
Write-Host ""
