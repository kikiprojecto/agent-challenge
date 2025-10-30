# 🚀 Quick Reference - NeuroCoder AI

---

## 📊 PART 1: CODE GENERATION FLOW

```
User Request (POST /api/generate)
         ↓
    Route Handler (route.ts)
         ↓
    ┌─────────────────────────┐
    │ 1. Rate Limit Check     │ ← Current: Simple in-memory
    │ 2. Input Validation     │   Phase 2: Token bucket + SQLite
    │ 3. Cache Lookup         │
    └─────────────────────────┘
         ↓
    ┌─────────────────────────┐
    │ Mastra Context          │
    │ - Ollama connection     │
    │ - Retry logic (3x)      │
    │ - Timeout: 25s/45s      │
    └─────────────────────────┘
         ↓
    ┌─────────────────────────┐
    │ Code Generator Tool     │
    │ - Language-specific     │
    │ - Best practices        │
    │ - Dependency parsing    │
    └─────────────────────────┘
         ↓
    ┌─────────────────────────┐
    │ Quality Validator       │
    │ - Score 0-100           │
    │ - Retry if < 60         │
    └─────────────────────────┘
         ↓
    ┌─────────────────────────┐
    │ Code Reviewer Tool      │
    │ - Security check        │
    │ - Performance review    │
    │ - Style validation      │
    └─────────────────────────┘
         ↓
    ┌─────────────────────────┐
    │ Test Generator Tool     │
    │ - Unit tests            │
    │ - Only if score >= 70   │
    └─────────────────────────┘
         ↓
    ┌─────────────────────────┐
    │ Cache Result            │
    │ - 1 hour expiry         │
    │ - Key: lang:prompt      │
    └─────────────────────────┘
         ↓
    Response (JSON)
```

---

## 🗂️ KEY FILES

### **1. Route Handler**
```
src/app/api/generate/route.ts
├── Lines 9-133:   createAdvancedMastraContext()
├── Lines 135-264: validateCodeQuality()
├── Lines 266-309: Cache functions
├── Lines 311-441: Rate limiting (CURRENT)
└── Lines 443-668: POST handler
```

### **2. Tools**
```
src/mastra/tools/
├── codeGenerator.ts    - Core code generation
├── codeReviewer.ts     - Quality assurance
└── testGenerator.ts    - Test creation
```

### **3. Phase 2 (TO BE CREATED)**
```
src/lib/rateLimit/
├── index.ts            - Main rate limiter
├── storage.ts          - Storage interface
├── sqliteStorage.ts    - SQLite implementation
├── tokenBucket.ts      - Token bucket algorithm
├── tiers.ts            - Rate limit tiers
└── analytics.ts        - Usage analytics
```

---

## ⚡ PERFORMANCE

| Operation | Time | Cacheable |
|-----------|------|-----------|
| Rate limit check | <1ms | No |
| Cache lookup | <5ms | N/A |
| Code generation | 3-8s | Yes |
| Code review | 2-5s | Yes |
| Test generation | 2-5s | Yes |
| **Total (uncached)** | **7-18s** | - |
| **Total (cached)** | **<10ms** | ⚡ |

---

## 🚦 PHASE 2: RATE LIMITING

### **Current (Simple)**
```typescript
// In-memory Map
const rateLimitMap = new Map();
// 20 requests/minute per IP
// Lost on restart
```

### **Phase 2 (Production)**
```typescript
// SQLite + Token Bucket
const rateLimiter = getRateLimiter();
const result = await rateLimiter.checkLimit(identifier);

// Features:
// ✅ Persistent storage
// ✅ Token bucket algorithm
// ✅ 4 tiers (Free/Basic/Pro/Enterprise)
// ✅ Analytics
// ✅ Standard headers
```

### **Rate Limit Tiers**

| Tier | Requests/Min | Requests/Hour | Requests/Day |
|------|--------------|---------------|--------------|
| **Free** | 20 | 100 | 500 |
| **Basic** | 100 | 1,000 | 5,000 |
| **Pro** | 500 | 10,000 | 50,000 |
| **Enterprise** | 10,000 | 100,000 | 1,000,000 |

### **Response Headers**
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 2025-10-24T11:00:00Z
X-RateLimit-Tier: Free
Retry-After: 30  (on 429 error)
```

---

## 🎯 IMPLEMENTATION PLAN

### **Phase 2A: Core (2 hours)**
1. Create `src/lib/rateLimit/` directory
2. Implement 6 new files
3. Update route handler
4. Add rate limit headers

### **Phase 2B: Testing (1 hour)**
1. Unit tests
2. Integration tests
3. Load testing

### **Phase 2C: Monitoring (30 min)**
1. Analytics endpoint
2. Usage metrics

---

## 📝 QUICK COMMANDS

### **Test Ollama**
```powershell
powershell -ExecutionPolicy Bypass -File quick-test.ps1
```

### **Test All Languages**
```powershell
powershell -ExecutionPolicy Bypass -File test-all-languages.ps1
```

### **Start Dev Server**
```powershell
npm run dev:ui
```

### **Test API**
```powershell
curl -X POST http://localhost:3001/api/generate `
  -H "Content-Type: application/json" `
  -d '{"prompt":"hello world in python","language":"python"}'
```

---

## ✅ STATUS

- ✅ **Phase 1:** Code generation working
- ✅ **TypeScript errors:** Fixed
- ✅ **Ollama connection:** Verified
- ✅ **Build:** Successful
- 🔄 **Ollama local:** Downloading...
- ⏳ **Phase 2:** Design complete, ready to implement

---

**All documentation ready! Ready to implement Phase 2 after Ollama finishes.** 🚀
