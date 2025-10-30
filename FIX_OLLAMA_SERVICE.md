# 🔧 Fix Ollama Service - Quick Guide

**Problem:** Ollama service stopped after model download  
**Solution:** Start Ollama service manually

---

## ✅ SOLUTION (Choose One)

### **Option 1: Start in New Terminal (Recommended)**

1. **Open a NEW PowerShell terminal** (keep current one open)
2. **Navigate to project:**
   ```powershell
   cd "C:\Users\L O G i N\Documents\Projects\agent-challenge"
   ```
3. **Start Ollama:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File start-ollama.ps1
   ```
4. **Leave this terminal running** (don't close it)
5. **Go back to your original terminal** and run:
   ```powershell
   powershell -ExecutionPolicy Bypass -File quick-test.ps1
   ```

---

### **Option 2: Start in Background**

**In your current terminal, run:**

```powershell
Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File start-ollama.ps1" -WindowStyle Minimized
```

**Wait 5 seconds, then test:**

```powershell
Start-Sleep -Seconds 5
powershell -ExecutionPolicy Bypass -File quick-test.ps1
```

---

### **Option 3: Manual Command**

**In a NEW terminal window:**

```powershell
& "C:\Users\L O G i N\AppData\Local\Programs\Ollama\ollama.exe" serve
```

**Leave it running, then in your original terminal:**

```powershell
powershell -ExecutionPolicy Bypass -File quick-test.ps1
```

---

## 🎯 EXPECTED RESULT

After starting Ollama, the quick test should show:

```
=== QUICK OLLAMA TEST (5s) ===

Test 1: Ping (2s timeout)...
  ✓ SUCCESS: Endpoint reachable (200)

Test 2: Quick generation (5s timeout)...
  ✓ SUCCESS: Generation working
  Response time: 1.8s
  Speed: EXCELLENT

=== ALL TESTS PASSED ===
```

---

## 🔍 VERIFY OLLAMA IS RUNNING

**Check if Ollama is running:**

```powershell
Get-Process ollama -ErrorAction SilentlyContinue
```

**Should show:**
```
Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
-------  ------    -----      -----     ------     --  -- -----------
    xxx      xx   xxxxx      xxxxx       x.xx   xxxx   x ollama
```

---

## ⚠️ TROUBLESHOOTING

### **If Ollama won't start:**

**Check if port 11434 is in use:**

```powershell
netstat -ano | findstr :11434
```

**If something is using it, kill the process:**

```powershell
# Find the PID from netstat output
taskkill /F /PID <PID>
```

**Then start Ollama again.**

---

### **If still not working:**

**Restart your computer** - This will:
- Clear any stuck processes
- Reset network ports
- Start fresh

**After restart:**

```powershell
cd "C:\Users\L O G i N\Documents\Projects\agent-challenge"
powershell -ExecutionPolicy Bypass -File start-ollama.ps1
```

---

## 📝 QUICK REFERENCE

**Start Ollama:**
```powershell
powershell -ExecutionPolicy Bypass -File start-ollama.ps1
```

**Test Ollama:**
```powershell
powershell -ExecutionPolicy Bypass -File quick-test.ps1
```

**Check if running:**
```powershell
Get-Process ollama
```

**Stop Ollama:**
```powershell
Stop-Process -Name ollama -Force
```

---

## ✅ NEXT STEPS AFTER FIX

Once quick-test.ps1 passes:

1. **Restart dev server:**
   ```powershell
   npm run dev:ui
   ```

2. **Test all languages:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File test-all-languages.ps1
   ```

3. **Implement Phase 2:**
   Follow `PHASE_2_IMPLEMENTATION_GUIDE.md`

---

**The service just needs to be started manually. Use Option 1 (new terminal) for easiest fix!** 🚀
