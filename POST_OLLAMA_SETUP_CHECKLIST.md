# ✅ Post-Ollama Setup Checklist

**Status:** qwen2.5-coder:7b download at 97% - Almost ready!  
**Next Steps:** Verify setup → Test system → Implement Phase 2

---

## 🎯 IMMEDIATE NEXT STEPS (After Download Completes)

### **Step 1: Verify Setup (2 minutes)**

The setup script should automatically:
1. ✅ Complete model download (97% → 100%)
2. ✅ Verify SHA256 digest
3. ✅ Write manifest
4. ✅ Update .env file
5. ✅ Run test generation
6. ✅ Show "SETUP COMPLETE" message

**Expected output:**
```
pulling 60e05f210007: 100% ▕████████████████████████▏ 4.7 GB
verifying sha256 digest
writing manifest
removing any unused layers
SUCCESS: Model pulled successfully

Step 4: Updating .env file...
Created backup: .env.backup
SUCCESS: .env updated
  OLLAMA_API_URL=http://localhost:11434/api
  MODEL_NAME_AT_ENDPOINT=qwen2.5-coder:7b

Step 5: Testing code generation (30s timeout)...
SUCCESS: Code generation working!
  Generated: XXX characters
  Time: X.XX seconds

=== SETUP COMPLETE ===

Local Ollama is ready and working!
```

---

### **Step 2: Quick Verification Test (5 seconds)**

Run the quick test to confirm everything works:

```powershell
powershell -ExecutionPolicy Bypass -File quick-test.ps1
```

**Expected output:**
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

### **Step 3: Restart Dev Server (1 minute)**

Stop the current server and restart to use local Ollama:

```powershell
# In the terminal running dev server, press Ctrl+C

# Then restart
npm run dev:ui
```

**Expected output:**
```
▲ Next.js 15.5.6 (Turbopack)
- Local:        http://localhost:3001
✓ Ready in 11.4s
```

---

### **Step 4: Test All 6 Languages (2-3 minutes)**

Now test the complete system with all languages:

```powershell
powershell -ExecutionPolicy Bypass -File test-all-languages.ps1
```

**Expected output:**
```
=== TESTING ALL 6 LANGUAGES ===

Testing Python...
  ✓ Code generated (2.3s)
  ✓ Quality score: 95
  ✓ Tests generated

Testing JavaScript...
  ✓ Code generated (1.8s)
  ✓ Quality score: 92
  ✓ Tests generated

Testing TypeScript...
  ✓ Code generated (2.1s)
  ✓ Quality score: 94
  ✓ Tests generated

Testing Rust...
  ✓ Code generated (2.5s)
  ✓ Quality score: 90

Testing Solidity...
  ✓ Code generated (2.2s)
  ✓ Quality score: 88

Testing Go...
  ✓ Code generated (1.9s)
  ✓ Quality score: 91

=== ALL TESTS PASSED ===
Total time: 2m 15s
```

---

## 🚀 PHASE 2: RATE LIMITING IMPLEMENTATION

After verifying everything works, implement Phase 2:

### **Phase 2A: Core Implementation (2 hours)**

#### **Task 1: Create Directory Structure**

```powershell
# Create rate limit directory
New-Item -ItemType Directory -Path "src\lib\rateLimit" -Force
```

#### **Task 2: Create Files (in order)**

**File 1:** `src/lib/rateLimit/storage.ts`
```typescript
// Storage interface - copy from PHASE_2_RATE_LIMITING_DESIGN.md
// Lines: Storage Interface section
```

**File 2:** `src/lib/rateLimit/tiers.ts`
```typescript
// Rate limit tiers - copy from PHASE_2_RATE_LIMITING_DESIGN.md
// Lines: Rate Limit Tiers section
```

**File 3:** `src/lib/rateLimit/sqliteStorage.ts`
```typescript
// SQLite implementation - copy from PHASE_2_RATE_LIMITING_DESIGN.md
// Lines: SQLite Storage Implementation section
```

**File 4:** `src/lib/rateLimit/tokenBucket.ts`
```typescript
// Token bucket algorithm - copy from PHASE_2_RATE_LIMITING_DESIGN.md
// Lines: Token Bucket Algorithm section
```

**File 5:** `src/lib/rateLimit/index.ts`
```typescript
// Main rate limiter - copy from PHASE_2_RATE_LIMITING_DESIGN.md
// Lines: Main Rate Limiter section
```

**File 6:** Update `src/app/api/generate/route.ts`
```typescript
// Replace rate limiting section - copy from PHASE_2_RATE_LIMITING_DESIGN.md
// Lines: Updated Route Handler section
```

---

### **Phase 2B: Testing (1 hour)**

#### **Test 1: Unit Tests**

Create `src/lib/rateLimit/__tests__/tokenBucket.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { TokenBucket } from '../tokenBucket';
import { SQLiteRateLimitStorage } from '../sqliteStorage';

describe('TokenBucket', () => {
  it('should allow requests within limit', async () => {
    const storage = new SQLiteRateLimitStorage(':memory:');
    const bucket = new TokenBucket(storage);
    
    const result = await bucket.consume('test-user', RATE_LIMIT_TIERS.free);
    
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeLessThanOrEqual(20);
  });
  
  it('should block requests over limit', async () => {
    // Test implementation
  });
  
  it('should refill tokens over time', async () => {
    // Test implementation
  });
});
```

#### **Test 2: Integration Test**

```powershell
# Test rate limiting with real requests
curl -X POST http://localhost:3001/api/generate `
  -H "Content-Type: application/json" `
  -d '{"prompt":"test","language":"python"}' `
  -i  # Show headers
```

**Check headers:**
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 19
X-RateLimit-Reset: 2025-10-24T14:05:00Z
X-RateLimit-Tier: Free
```

#### **Test 3: Load Test**

```powershell
# Send 25 requests rapidly (should hit limit at 20)
for ($i=1; $i -le 25; $i++) {
    Write-Host "Request $i"
    curl -X POST http://localhost:3001/api/generate `
      -H "Content-Type: application/json" `
      -d '{"prompt":"test","language":"python"}' `
      -s | ConvertFrom-Json | Select-Object -Property error
}
```

**Expected:**
- Requests 1-20: Success
- Requests 21-25: Error "Rate limit exceeded"

---

### **Phase 2C: Monitoring (30 minutes)**

#### **Create Analytics Endpoint**

**File:** `src/app/api/rate-limit/analytics/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getRateLimiter } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const identifier = req.headers.get('x-forwarded-for') || 'unknown';
  const rateLimiter = getRateLimiter();
  
  // Get analytics
  const analytics = await rateLimiter.getAnalytics(identifier, 3600000); // Last hour
  const status = await rateLimiter.getStatus(identifier);
  
  return NextResponse.json({
    identifier,
    currentStatus: status,
    analytics: {
      requestsLastHour: analytics.requestCount,
      timeWindow: '1 hour'
    }
  });
}
```

**Test:**
```powershell
curl http://localhost:3001/api/rate-limit/analytics
```

---

## 📊 IMPLEMENTATION TIMELINE

| Phase | Task | Time | Status |
|-------|------|------|--------|
| **Setup** | Ollama download | 2h | 97% ✅ |
| **Verify** | Quick tests | 5min | ⏳ Next |
| **Test** | All languages | 3min | ⏳ Next |
| **Phase 2A** | Core implementation | 2h | ⏳ Ready |
| **Phase 2B** | Testing | 1h | ⏳ Ready |
| **Phase 2C** | Monitoring | 30min | ⏳ Ready |
| **Total** | | ~5.5h | |

---

## 🎯 PRIORITY ORDER

### **Priority 1: Verify Setup (NEXT)**
1. Wait for download to complete (3% remaining)
2. Run quick-test.ps1
3. Restart dev server
4. Test all 6 languages

### **Priority 2: Implement Phase 2 (AFTER VERIFICATION)**
1. Create rate limit directory
2. Copy code from PHASE_2_RATE_LIMITING_DESIGN.md
3. Update route.ts
4. Test rate limiting

### **Priority 3: Polish & Deploy**
1. Add monitoring
2. Write documentation
3. Deploy to production

---

## 📝 QUICK COMMANDS REFERENCE

```powershell
# After download completes:

# 1. Quick test
powershell -ExecutionPolicy Bypass -File quick-test.ps1

# 2. Restart server
npm run dev:ui

# 3. Test all languages
powershell -ExecutionPolicy Bypass -File test-all-languages.ps1

# 4. Create rate limit directory
New-Item -ItemType Directory -Path "src\lib\rateLimit" -Force

# 5. Test rate limiting
curl -X POST http://localhost:3001/api/generate `
  -H "Content-Type: application/json" `
  -d '{"prompt":"test","language":"python"}' `
  -i
```

---

## ✅ SUCCESS CRITERIA

### **Setup Complete When:**
- ✅ quick-test.ps1 shows "ALL TESTS PASSED"
- ✅ test-all-languages.ps1 completes in 2-3 minutes
- ✅ All 6 languages generate code successfully
- ✅ Response times are 1-3 seconds (not 5-10s)

### **Phase 2 Complete When:**
- ✅ Rate limiting uses SQLite storage
- ✅ Token bucket algorithm working
- ✅ Rate limit headers in responses
- ✅ 429 error on limit exceeded
- ✅ Analytics endpoint working

---

## 🚨 TROUBLESHOOTING

### **If setup script fails:**
```powershell
# Check Ollama service
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" list

# Manually test generation
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" run qwen2.5-coder:7b "hello"
```

### **If tests fail:**
```powershell
# Check .env file
Get-Content .env | Select-String "OLLAMA"

# Should show:
# OLLAMA_API_URL=http://localhost:11434/api
# MODEL_NAME_AT_ENDPOINT=qwen2.5-coder:7b
```

### **If server doesn't use local Ollama:**
```powershell
# Restart server completely
# Stop with Ctrl+C
# Then start again
npm run dev:ui
```

---

## 🎉 READY TO GO!

**Current Status:** 97% complete - Almost there!

**Next Action:** Wait for download to finish, then run verification tests

**After Verification:** Implement Phase 2 rate limiting

**All documentation and code snippets are ready in:**
- `PHASE_2_RATE_LIMITING_DESIGN.md` - Complete implementation guide
- `CODE_GENERATION_FLOW.md` - System architecture
- `QUICK_REFERENCE.md` - Quick commands

**You're fully prepared! Just waiting for that last 3%...** 🚀
