# 🚀 Local Ollama Setup Guide

**Issue:** Remote Ollama endpoint is unstable (connections being closed)  
**Solution:** Set up local Ollama for reliable, fast code generation

---

## 📋 STEP 1: Install Ollama

### **Option A: Using OllamaSetup.exe (You have this)**

1. Run `OllamaSetup.exe`
2. Follow installation wizard
3. Ollama will install to: `C:\Users\<username>\AppData\Local\Programs\Ollama`
4. Service will start automatically

### **Option B: Download Fresh**

```powershell
# Download from official site
Start-Process "https://ollama.com/download/windows"
```

---

## 📋 STEP 2: Verify Ollama is Running

```powershell
# Check if Ollama service is running
Get-Process ollama -ErrorAction SilentlyContinue

# Test the API
Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET
```

**Expected Output:**
```
StatusCode: 200
```

---

## 📋 STEP 3: Pull the Model

### **Recommended Model: qwen2.5-coder:7b**

```powershell
# Pull the model (this will take 5-10 minutes)
ollama pull qwen2.5-coder:7b
```

**Alternative Models:**
```powershell
# Smaller, faster (3.8GB)
ollama pull qwen2.5-coder:3b

# Larger, better quality (14GB)
ollama pull qwen2.5-coder:14b

# Original model from remote (4.7GB)
ollama pull qwen3:8b
```

---

## 📋 STEP 4: Update .env File

```bash
# OLD (Remote - Unstable)
OLLAMA_API_URL=https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnjakkybnxbw.node.k8s.prd.nos.ci/api

# NEW (Local - Stable)
OLLAMA_API_URL=http://localhost:11434/api
MODEL_NAME_AT_ENDPOINT=qwen2.5-coder:7b
```

---

## 📋 STEP 5: Quick Verification Test

Run this PowerShell script:

```powershell
# Test local Ollama
$body = @{
    model = "qwen2.5-coder:7b"
    prompt = "Write a Python function that adds two numbers"
    stream = $false
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:11434/api/generate" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -TimeoutSec 30

$result = $response.Content | ConvertFrom-Json
Write-Host "SUCCESS! Generated $($result.response.Length) characters" -ForegroundColor Green
Write-Host $result.response
```

---

## 🎯 COMPLETE SETUP SCRIPT

Save this as `setup-local-ollama.ps1`:

```powershell
# Complete Local Ollama Setup Script
Write-Host "`n=== LOCAL OLLAMA SETUP ===" -ForegroundColor Cyan

# Step 1: Check if Ollama is installed
Write-Host "`nStep 1: Checking Ollama installation..." -ForegroundColor Yellow
$ollamaPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"

if (Test-Path $ollamaPath) {
    Write-Host "SUCCESS: Ollama is installed" -ForegroundColor Green
} else {
    Write-Host "ERROR: Ollama not found" -ForegroundColor Red
    Write-Host "Please run OllamaSetup.exe first" -ForegroundColor Yellow
    exit 1
}

# Step 2: Check if Ollama service is running
Write-Host "`nStep 2: Checking Ollama service..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "SUCCESS: Ollama service is running" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Ollama service not responding" -ForegroundColor Yellow
    Write-Host "Starting Ollama..." -ForegroundColor Yellow
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

# Step 3: Check if model exists
Write-Host "`nStep 3: Checking for qwen2.5-coder:7b model..." -ForegroundColor Yellow
try {
    $tagsResponse = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5
    $tags = $tagsResponse.Content | ConvertFrom-Json
    
    $hasModel = $tags.models | Where-Object { $_.name -like "*qwen2.5-coder:7b*" }
    
    if ($hasModel) {
        Write-Host "SUCCESS: Model already installed" -ForegroundColor Green
    } else {
        Write-Host "Model not found. Pulling qwen2.5-coder:7b..." -ForegroundColor Yellow
        Write-Host "This will take 5-10 minutes..." -ForegroundColor Cyan
        
        & ollama pull qwen2.5-coder:7b
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCCESS: Model pulled successfully" -ForegroundColor Green
        } else {
            Write-Host "ERROR: Failed to pull model" -ForegroundColor Red
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
    $envContent = Get-Content $envPath
    $newContent = $envContent -replace 'OLLAMA_API_URL=.*', 'OLLAMA_API_URL=http://localhost:11434/api'
    $newContent = $newContent -replace 'MODEL_NAME_AT_ENDPOINT=.*', 'MODEL_NAME_AT_ENDPOINT=qwen2.5-coder:7b'
    $newContent | Set-Content $envPath
    Write-Host "SUCCESS: .env updated" -ForegroundColor Green
} else {
    Write-Host "ERROR: .env file not found" -ForegroundColor Red
    exit 1
}

# Step 5: Quick test
Write-Host "`nStep 5: Testing code generation..." -ForegroundColor Yellow
try {
    $testBody = @{
        model = "qwen2.5-coder:7b"
        prompt = "Write a Python function that adds two numbers"
        stream = $false
    } | ConvertTo-Json

    $testResponse = Invoke-WebRequest `
        -Uri "http://localhost:11434/api/generate" `
        -Method POST `
        -Body $testBody `
        -ContentType "application/json" `
        -TimeoutSec 30 `
        -ErrorAction Stop

    $testResult = $testResponse.Content | ConvertFrom-Json
    Write-Host "SUCCESS: Generated $($testResult.response.Length) characters" -ForegroundColor Green
    Write-Host "`nPreview:" -ForegroundColor Cyan
    Write-Host $testResult.response.Substring(0, [Math]::Min(200, $testResult.response.Length))
    Write-Host "..." -ForegroundColor Gray
} catch {
    Write-Host "ERROR: Test failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "`nLocal Ollama is ready!" -ForegroundColor Green
Write-Host "You can now run: npm run dev:ui" -ForegroundColor Cyan
Write-Host ""
```

---

## ⚡ QUICK 5-SECOND TEST

After setup, run this quick test:

```powershell
# Quick test script
$body = @{model='qwen2.5-coder:7b'; prompt='hello'; stream=$false} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://localhost:11434/api/generate' -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 5
```

**Expected:** Status 200, response in ~2-3 seconds

---

## 📊 COMPARISON: Remote vs Local

| Aspect | Remote Ollama | Local Ollama |
|--------|---------------|--------------|
| **Speed** | 5-10s | 1-3s ⚡ |
| **Reliability** | ❌ Unstable | ✅ Stable |
| **Availability** | ⚠️ Depends on network | ✅ Always available |
| **Privacy** | ⚠️ Data sent to remote | ✅ Fully local |
| **Setup** | ✅ None needed | ⚠️ One-time setup |
| **Disk Space** | ✅ None | ⚠️ ~5GB per model |

---

## 🎯 RECOMMENDED WORKFLOW

### **1. Install Ollama**
```powershell
# Run OllamaSetup.exe
```

### **2. Pull Model**
```powershell
ollama pull qwen2.5-coder:7b
```

### **3. Update .env**
```bash
OLLAMA_API_URL=http://localhost:11434/api
MODEL_NAME_AT_ENDPOINT=qwen2.5-coder:7b
```

### **4. Quick Test**
```powershell
# Test local connection
Invoke-WebRequest -Uri 'http://localhost:11434/api/tags' -Method GET
```

### **5. Restart Server**
```powershell
# Stop current server (Ctrl+C)
npm run dev:ui
```

### **6. Test All Languages**
```powershell
powershell -ExecutionPolicy Bypass -File test-all-languages.ps1
```

---

## 🔧 TROUBLESHOOTING

### **Problem: Ollama service not starting**

```powershell
# Manually start Ollama
ollama serve
```

### **Problem: Port 11434 in use**

```powershell
# Check what's using the port
netstat -ano | findstr :11434

# Kill the process (replace PID)
taskkill /F /PID <PID>
```

### **Problem: Model not found**

```powershell
# List installed models
ollama list

# Pull the model again
ollama pull qwen2.5-coder:7b
```

### **Problem: Slow generation**

```powershell
# Try smaller model
ollama pull qwen2.5-coder:3b

# Update .env
MODEL_NAME_AT_ENDPOINT=qwen2.5-coder:3b
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Ollama installed
- [ ] Service running (http://localhost:11434)
- [ ] Model pulled (qwen2.5-coder:7b)
- [ ] .env updated
- [ ] Quick test passes
- [ ] Server restarted
- [ ] Ready to test all languages

---

## 🚀 NEXT STEPS

After local Ollama is set up:

1. **Restart dev server:**
   ```powershell
   npm run dev:ui
   ```

2. **Test connection:**
   ```powershell
   npm run test:ollama
   ```

3. **Test all languages:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File test-all-languages.ps1
   ```

---

**Local Ollama will be MUCH faster and more reliable than the remote endpoint!** 🚀
