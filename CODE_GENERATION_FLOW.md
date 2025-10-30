# 🔄 Code Generation Flow - Complete Overview

**From User Prompt → Validated Code in 5 Steps**

---

## 📋 FLOW DIAGRAM

```
User Request
    ↓
[1] API Route Handler (route.ts)
    ↓
[2] Mastra Context + LLM (createAdvancedMastraContext)
    ↓
[3] Code Generator Tool (codeGenerator.ts)
    ↓
[4] Code Reviewer Tool (codeReviewer.ts)
    ↓
[5] Test Generator Tool (testGenerator.ts)
    ↓
Validated Code + Tests + Review
```

---

## 🔑 KEY FILES & ROLES

### **1. API Route Handler**
**File:** `src/app/api/generate/route.ts`  
**Role:** Orchestrator - Coordinates the entire flow

**Key Responsibilities:**
- ✅ Validates user input (prompt, language)
- ✅ Rate limiting (20 requests/minute per IP)
- ✅ Cache checking (returns cached results)
- ✅ Creates Mastra context with LLM
- ✅ Calls tools in sequence
- ✅ Validates code quality
- ✅ Handles retries on low quality
- ✅ Caches successful results
- ✅ Returns final response

**Flow in route.ts:**
```typescript
POST /api/generate
  ↓
1. Rate limit check (line 447-454)
  ↓
2. Input validation (line 456-472)
  ↓
3. Cache check (line 474-483)
  ↓
4. Create Mastra context (line 487)
  ↓
5. Generate code (line 494-498)
  ↓
6. Validate quality (line 508)
  ↓
7. Retry if needed (line 510-536)
  ↓
8. Review code (line 554-567)
  ↓
9. Generate tests (line 574-584)
  ↓
10. Cache result (line 602-609)
  ↓
11. Return response (line 611-625)
```

---

### **2. Mastra Context Factory**
**Location:** `src/app/api/generate/route.ts` (lines 9-133)  
**Function:** `createAdvancedMastraContext()`

**Role:** LLM Connection Manager

**Key Features:**
- ✅ Connects to Ollama endpoint
- ✅ Retry logic (3 attempts)
- ✅ Timeout handling (25s simple, 45s complex)
- ✅ Complexity detection
- ✅ Fallback for simple prompts
- ✅ Enhanced prompting

**Code Structure:**
```typescript
createAdvancedMastraContext() {
  return {
    llm: {
      generate: async (config) => {
        // Extract prompts
        const systemPrompt = ...
        const userPrompt = ...
        
        // Detect complexity
        const isComplexPrompt = userPrompt.length > 200 || ...
        
        // Retry loop (3 attempts)
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            // Call Ollama with timeout
            const response = await fetch(ollamaUrl, {
              timeout: isComplexPrompt ? 45000 : 25000
            })
            
            return { text: response, model: 'qwen3:8b' }
          } catch (error) {
            // Retry or fallback
          }
        }
      }
    }
  }
}
```

---

### **3. Code Generator Tool**
**File:** `src/mastra/tools/codeGenerator.ts`  
**Role:** Core Code Generation

**Input Schema:**
```typescript
{
  prompt: string,           // User's description
  language: enum,           // python, javascript, typescript, rust, solidity, go
  context?: string,         // Optional existing code context
  projectStructure?: object // Optional project info
}
```

**Output Schema:**
```typescript
{
  code: string,              // Generated code
  language: string,          // Language used
  explanation: string,       // What the code does
  dependencies: string[],    // Required packages
  estimatedComplexity: enum  // simple, medium, complex
}
```

**Key Features:**
- ✅ Language-specific system prompts (lines 6-353)
- ✅ Best practices enforcement
- ✅ Error handling requirements
- ✅ Type safety (for typed languages)
- ✅ Dependency extraction
- ✅ Complexity estimation

**Execution Flow:**
```typescript
execute: async ({ context, prompt, language, projectStructure }) => {
  // 1. Build system prompt with language guidelines
  const systemPrompt = LANGUAGE_PROMPTS[language]
  
  // 2. Build user prompt with context
  let userPrompt = `Generate ${language} code for: ${prompt}`
  
  // 3. Call LLM
  const response = await context.llm.generate({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    maxTokens: 2000
  })
  
  // 4. Extract code from markdown
  const code = extractCodeFromMarkdown(response.text)
  
  // 5. Parse dependencies
  const dependencies = parseDependencies(code, language)
  
  // 6. Estimate complexity
  const complexity = estimateComplexity(code)
  
  return { code, language, explanation, dependencies, complexity }
}
```

---

### **4. Code Reviewer Tool**
**File:** `src/mastra/tools/codeReviewer.ts`  
**Role:** Quality Assurance

**Input Schema:**
```typescript
{
  code: string,
  language: enum,
  reviewType: enum  // 'security', 'performance', 'style', 'all'
}
```

**Output Schema:**
```typescript
{
  issues: Array<{
    type: string,      // 'error', 'warning', 'suggestion'
    severity: string,  // 'high', 'medium', 'low'
    line: number,
    message: string,
    suggestion: string
  }>,
  overallScore: number,  // 0-100
  summary: string
}
```

**Review Categories:**
- ✅ Security vulnerabilities
- ✅ Performance issues
- ✅ Code style violations
- ✅ Best practices
- ✅ Error handling
- ✅ Documentation quality

---

### **5. Test Generator Tool**
**File:** `src/mastra/tools/testGenerator.ts`  
**Role:** Test Creation

**Input Schema:**
```typescript
{
  code: string,
  language: enum,  // Only python, javascript, typescript
  testType: enum,  // 'unit', 'integration', 'e2e'
  coverage: enum   // 'basic', 'comprehensive'
}
```

**Output Schema:**
```typescript
{
  testCode: string,
  framework: string,  // 'pytest', 'jest', 'vitest'
  coverage: number,   // Estimated coverage %
  testCount: number
}
```

---

### **6. Code Validator**
**File:** `src/app/api/generate/route.ts` (lines 135-264)  
**Function:** `validateCodeQuality()`

**Role:** Quality Gate - Ensures no generic templates

**Validation Rules:**
```typescript
validateCodeQuality(code, language) {
  let score = 100
  const issues = []
  
  // Check 1: Not a generic template
  if (code.includes('TODO') || code.includes('FIXME')) {
    score -= 30
    issues.push('Contains TODO/FIXME placeholders')
  }
  
  // Check 2: Has actual implementation
  if (code.includes('pass  # Implementation here')) {
    score -= 40
    issues.push('Contains placeholder implementation')
  }
  
  // Check 3: Sufficient length
  if (code.length < 50) {
    score -= 20
    issues.push('Code too short')
  }
  
  // Check 4: Has proper structure
  if (!hasProperStructure(code, language)) {
    score -= 15
    issues.push('Missing proper structure')
  }
  
  return { score, issues, isValid: score >= 60 }
}
```

**Quality Thresholds:**
- ✅ Score >= 80: Excellent
- ✅ Score >= 60: Acceptable
- ❌ Score < 60: Retry generation

---

### **7. Cache System**
**File:** `src/app/api/generate/route.ts` (lines 266-309)  
**Functions:** `getCachedResult()`, `cacheResult()`

**Role:** Performance Optimization

**Cache Key:**
```typescript
const cacheKey = `${language}:${prompt.toLowerCase().trim()}`
```

**Cache Structure:**
```typescript
{
  code: string,
  language: string,
  explanation: string,
  dependencies: string[],
  estimatedComplexity: string,
  reviewScore: number,
  testCode: string,
  timestamp: number,
  hitCount: number
}
```

**Cache Expiry:** 1 hour (3600000ms)

---

## 🔄 COMPLETE FLOW EXAMPLE

### **User Request:**
```json
POST /api/generate
{
  "prompt": "Create a Python function that sorts a list of numbers",
  "language": "python"
}
```

### **Step-by-Step Execution:**

#### **Step 1: Route Handler (route.ts:443)**
```typescript
// Validate input
if (!prompt || !language) {
  return error(400, 'Invalid input')
}

// Check rate limit
if (!checkRateLimit(ip)) {
  return error(429, 'Rate limit exceeded')
}
```

#### **Step 2: Cache Check (route.ts:474)**
```typescript
const cached = getCachedResult(prompt, language)
if (cached) {
  return cached  // Return immediately
}
```

#### **Step 3: Create Context (route.ts:487)**
```typescript
const context = createAdvancedMastraContext()
// Sets up Ollama connection with retry logic
```

#### **Step 4: Generate Code (route.ts:494)**
```typescript
const genResult = await codeGeneratorTool.execute({
  prompt: prompt.trim(),
  language,
  projectStructure: undefined
} as any)

// Returns:
{
  code: "def sort_numbers(numbers: List[int]) -> List[int]:\n    ...",
  language: "python",
  explanation: "Sorts a list using merge sort...",
  dependencies: ["typing"],
  estimatedComplexity: "simple"
}
```

#### **Step 5: Validate Quality (route.ts:508)**
```typescript
const validation = validateCodeQuality(genResult.code, language)

if (validation.score < 60) {
  // Retry with enhanced prompt
  const enhancedPrompt = getEnhancedPrompt(prompt, language, validation)
  genResult = await codeGeneratorTool.execute({ prompt: enhancedPrompt, ... })
}
```

#### **Step 6: Review Code (route.ts:556)**
```typescript
const reviewResult = await codeReviewerTool.execute({
  code: genResult.code,
  language,
  reviewType: 'all'
} as any)

// Returns:
{
  issues: [],
  overallScore: 95,
  summary: "Excellent code quality"
}
```

#### **Step 7: Generate Tests (route.ts:577)**
```typescript
if (reviewResult.overallScore >= 70) {
  const testResult = await testGeneratorTool.execute({
    code: genResult.code,
    language,
    testType: 'unit',
    coverage: 'basic'
  } as any)
  
  testCode = testResult.testCode
}
```

#### **Step 8: Cache Result (route.ts:602)**
```typescript
cacheResult(prompt, language, {
  ...genResult,
  reviewScore: reviewResult.overallScore,
  testCode
})
```

#### **Step 9: Return Response (route.ts:611)**
```typescript
return NextResponse.json({
  code: genResult.code,
  language: genResult.language,
  explanation: genResult.explanation,
  dependencies: genResult.dependencies,
  estimatedComplexity: genResult.estimatedComplexity,
  review: {
    score: reviewResult.overallScore,
    issues: reviewResult.issues,
    summary: reviewResult.summary
  },
  tests: testCode,
  metadata: {
    cached: false,
    processingTime: 8.5,
    model: 'qwen3:8b'
  }
})
```

---

## 📊 PERFORMANCE METRICS

| Step | Time | Cacheable |
|------|------|-----------|
| Input validation | <1ms | No |
| Rate limit check | <1ms | No |
| Cache lookup | <5ms | N/A |
| Code generation | 3-8s | Yes |
| Quality validation | <10ms | No |
| Code review | 2-5s | Yes |
| Test generation | 2-5s | Yes |
| Cache storage | <10ms | N/A |
| **Total (uncached)** | **7-18s** | - |
| **Total (cached)** | **<10ms** | - |

---

## 🎯 KEY DESIGN DECISIONS

### **1. Sequential Tool Execution**
- Tools run in order: Generate → Review → Test
- Each step depends on previous output
- Allows quality gates and retries

### **2. Quality-First Approach**
- Validates code before review
- Retries on low quality scores
- Only generates tests for good code (score >= 70)

### **3. Intelligent Caching**
- Cache key: `language:prompt`
- 1-hour expiry
- Includes all results (code, review, tests)

### **4. Robust Error Handling**
- Retry logic in LLM calls (3 attempts)
- Fallback for simple prompts
- Graceful degradation (skip tests on error)

### **5. Complexity-Aware Timeouts**
- Simple prompts: 25s timeout
- Complex prompts: 45s timeout
- Prevents unnecessary failures

---

## 🔍 DEBUGGING TIPS

### **Enable Detailed Logging:**
```typescript
// In route.ts, logs show:
console.log(`[${timestamp}] Generating ${language} code...`)
console.log(`[${timestamp}] Validating code quality...`)
console.log(`[${timestamp}] Reviewing generated code...`)
```

### **Check Cache Status:**
```typescript
// Look for cache hit logs
console.log(`[Cache Hit] Returning cached result for: ${prompt}`)
```

### **Monitor Quality Scores:**
```typescript
// Validation scores in logs
console.warn(`[Warning] Generated code failed validation (score: ${score})`)
```

---

## ✅ SUMMARY

**The system is a 5-stage pipeline:**

1. **Route Handler** - Orchestrates everything
2. **Mastra Context** - Manages LLM connection
3. **Code Generator** - Creates the code
4. **Code Reviewer** - Validates quality
5. **Test Generator** - Adds test coverage

**Key Features:**
- ✅ Quality validation with retry
- ✅ Intelligent caching
- ✅ Rate limiting
- ✅ Robust error handling
- ✅ Performance optimization

**Result:** Production-ready code in 7-18 seconds (or <10ms if cached)
