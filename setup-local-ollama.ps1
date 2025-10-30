# Complete Local Ollama Setup Script
Write-Host "`n=== LOCAL OLLAMA SETUP ===" -ForegroundColor Cyan

# Step 1: Check if Ollama is installed
Write-Host "`nStep 1: Checking Ollama installation..." -ForegroundColor Yellow
$ollamaPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"

if (Test-Path $ollamaPath) {
    Write-Host "SUCCESS: Ollama is installed at $ollamaPath" -ForegroundColor Green
} else {
    Write-Host "ERROR: Ollama not found" -ForegroundColor Red
    Write-Host "`nPlease install Ollama first:" -ForegroundColor Yellow
    Write-Host "1. Run OllamaSetup.exe" -ForegroundColor Cyan
    Write-Host "2. Or download from: https://ollama.com/download/windows" -ForegroundColor Cyan
    Write-Host "3. Then run this script again" -ForegroundColor Cyan
    exit 1
}

# Step 2: Check if Ollama service is running
Write-Host "`nStep 2: Checking Ollama service..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "SUCCESS: Ollama service is running" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Ollama service not responding" -ForegroundColor Yellow
    Write-Host "Attempting to start Ollama..." -ForegroundColor Yellow
    
    # Try to start Ollama
    try {
        Start-Process $ollamaPath -ArgumentList "serve" -WindowStyle Hidden -ErrorAction Stop
        Write-Host "Waiting for service to start..." -ForegroundColor Cyan
        Start-Sleep -Seconds 5
        
        # Test again
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "SUCCESS: Ollama service started" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Could not start Ollama service" -ForegroundColor Red
        Write-Host "Please start Ollama manually:" -ForegroundColor Yellow
        Write-Host "  1. Open Command Prompt" -ForegroundColor Cyan
        Write-Host "  2. Run: & '$ollamaPath' serve" -ForegroundColor Cyan
        Write-Host "  3. Then run this script again" -ForegroundColor Cyan
        exit 1
    }
}

# Step 3: Check if model exists
Write-Host "`nStep 3: Checking for qwen2.5-coder:7b model..." -ForegroundColor Yellow
try {
    $tagsResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5
    $tags = $tagsResponse.Content | ConvertFrom-Json
    
    $hasModel = $tags.models | Where-Object { $_.name -like "*qwen2.5-coder:7b*" }
    
    if ($hasModel) {
        Write-Host "SUCCESS: Model already installed" -ForegroundColor Green
        Write-Host "Model: $($hasModel.name)" -ForegroundColor Cyan
        Write-Host "Size: $([math]::Round($hasModel.size / 1GB, 2)) GB" -ForegroundColor Cyan
    } else {
        Write-Host "Model not found. Pulling qwen2.5-coder:7b..." -ForegroundColor Yellow
        Write-Host "This will download ~5GB and take 5-10 minutes..." -ForegroundColor Cyan
        Write-Host "Please wait..." -ForegroundColor Cyan
        
        & $ollamaPath pull qwen2.5-coder:7b
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCCESS: Model pulled successfully" -ForegroundColor Green
        } else {
            Write-Host "ERROR: Failed to pull model" -ForegroundColor Red
            Write-Host "Try manually: & '$ollamaPath' pull qwen2.5-coder:7b" -ForegroundColor Yellow
            exit 1
        }
    }
} catch {
    Write-Host "ERROR: Cannot check models" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}

# Step 4: Update .env file
Write-Host "`nStep 4: Updating .env file..." -ForegroundColor Yellow
$envPath = ".env"

if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # Backup original
    $backupPath = ".env.backup"
    Copy-Item $envPath $backupPath -Force
    Write-Host "Created backup: $backupPath" -ForegroundColor Cyan
    
    # Update URLs
    $envContent = $envContent -replace 'OLLAMA_API_URL=.*', 'OLLAMA_API_URL=http://localhost:11434/api'
    $envContent = $envContent -replace 'MODEL_NAME_AT_ENDPOINT=.*', 'MODEL_NAME_AT_ENDPOINT=qwen2.5-coder:7b'
    
    $envContent | Set-Content $envPath -NoNewline
    Write-Host "SUCCESS: .env updated" -ForegroundColor Green
    Write-Host "  OLLAMA_API_URL=http://localhost:11434/api" -ForegroundColor Cyan
    Write-Host "  MODEL_NAME_AT_ENDPOINT=qwen2.5-coder:7b" -ForegroundColor Cyan
} else {
    Write-Host "ERROR: .env file not found" -ForegroundColor Red
    exit 1
}

# Step 5: Quick test
Write-Host "`nStep 5: Testing code generation (30s timeout)..." -ForegroundColor Yellow
try {
    $testBody = @{
        model = "qwen2.5-coder:7b"
        prompt = "Write a Python function that adds two numbers. Just the code, no explanation."
        stream = $false
    } | ConvertTo-Json

    $startTime = Get-Date
    $testResponse = Invoke-WebRequest `
        -Uri "http://localhost:11434/api/generate" `
        -Method POST `
        -Body $testBody `
        -ContentType "application/json" `
        -TimeoutSec 30 `
        -ErrorAction Stop
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    $testResult = $testResponse.Content | ConvertFrom-Json
    Write-Host "SUCCESS: Code generation working!" -ForegroundColor Green
    Write-Host "  Generated: $($testResult.response.Length) characters" -ForegroundColor Cyan
    Write-Host "  Time: $([math]::Round($duration, 2)) seconds" -ForegroundColor Cyan
    
    Write-Host "`nGenerated Code Preview:" -ForegroundColor Yellow
    $preview = $testResult.response.Substring(0, [Math]::Min(300, $testResult.response.Length))
    Write-Host $preview -ForegroundColor Gray
    if ($testResult.response.Length > 300) {
        Write-Host "..." -ForegroundColor Gray
    }
} catch {
    Write-Host "ERROR: Test failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "`nLocal Ollama is ready and working!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Restart your dev server: npm run dev:ui" -ForegroundColor White
Write-Host "  2. Test the connection: npm run test:ollama" -ForegroundColor White
Write-Host "  3. Test all languages: powershell -ExecutionPolicy Bypass -File test-all-languages.ps1" -ForegroundColor White
Write-Host ""
