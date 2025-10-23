# 🧪 API Testing Guide

## Quick Test Commands

### 1. Health Check
```bash
curl http://localhost:3000/api/generate
```

### 2. Simple Code Generation (Python)
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"create a function to sort numbers\", \"language\": \"python\"}"
```

### 3. REST API Generation (JavaScript)
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"build a REST API with authentication\", \"language\": \"javascript\"}"
```

### 4. Algorithm Implementation (Rust)
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"implement binary search algorithm\", \"language\": \"rust\"}"
```

### 5. React Component (TypeScript)
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"create a React component for user profile\", \"language\": \"typescript\"}"
```

## PowerShell Commands (Windows)

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/generate" -Method GET
```

### Generate Code
```powershell
$body = @{
    prompt = "create a function to sort numbers"
    language = "python"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/generate" -Method POST -Body $body -ContentType "application/json"
```

## Expected Response Structure

```json
{
  "success": true,
  "code": "# Generated Python code here...",
  "explanation": "This function implements...",
  "dependencies": ["numpy", "pandas"],
  "complexity": "simple",
  "reviewScore": 95,
  "issues": [],
  "tests": "# Test code here...",
  "metadata": {
    "language": "python",
    "processingTime": "4.23",
    "linesOfCode": 25,
    "model": "qwen3:8b",
    "timestamp": 1729665600000
  }
}
```

## Testing Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Python code generation works
- [ ] JavaScript code generation works
- [ ] TypeScript code generation works
- [ ] Rust code generation works
- [ ] Review scores are calculated
- [ ] Tests are generated for high-quality code
- [ ] Caching works (second identical request is faster)
- [ ] Rate limiting triggers after 20 requests
- [ ] Error messages are user-friendly
- [ ] Processing time is under 10 seconds

## Performance Testing

Run this script to test performance:

```bash
# Test 10 requests
for i in {1..10}; do
  echo "Request $i:"
  time curl -X POST http://localhost:3000/api/generate \
    -H "Content-Type: application/json" \
    -d '{"prompt": "create a hello world function", "language": "python"}' \
    -s -o /dev/null -w "Time: %{time_total}s\n"
done
```

## Cache Testing

```bash
# First request (no cache)
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test cache", "language": "python"}' \
  | jq '.metadata.processingTime'

# Second request (should be cached and faster)
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test cache", "language": "python"}' \
  | jq '.cached, .cacheAge'
```

## Rate Limit Testing

```bash
# Send 25 requests rapidly (should hit rate limit)
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/generate \
    -H "Content-Type: application/json" \
    -d '{"prompt": "test", "language": "python"}' \
    -w "Status: %{http_code}\n" \
    -s -o /dev/null
done
```

Expected: First 20 return 200, remaining return 429 (Rate Limit Exceeded)
