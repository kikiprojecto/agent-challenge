# Start Ollama Service
Write-Host "Starting Ollama service..." -ForegroundColor Cyan

$ollamaPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"

if (Test-Path $ollamaPath) {
    Write-Host "Found Ollama at: $ollamaPath" -ForegroundColor Green
    
    # Start Ollama serve
    Write-Host "Starting Ollama serve..." -ForegroundColor Yellow
    & $ollamaPath serve
} else {
    Write-Host "ERROR: Ollama not found at $ollamaPath" -ForegroundColor Red
    exit 1
}
