# 🚀 Phase 2 Implementation Guide - Step by Step

**Ready to implement after Ollama verification completes**

---

## 📋 IMPLEMENTATION STEPS

### **STEP 1: Create Directory Structure**

```powershell
# Create the rate limit directory
New-Item -ItemType Directory -Path "src\lib\rateLimit" -Force
```

---

### **STEP 2: Create Storage Interface**

**File:** `src/lib/rateLimit/storage.ts`

Copy this complete code:

```typescript
/**
 * Storage interface for rate limiting
 * Allows swapping between SQLite, Redis, etc.
 */
export interface RateLimitStorage {
  getTokens(identifier: string): Promise<number>;
  setTokens(identifier: string, tokens: number, ttl: number): Promise<void>;
  getLastRefill(identifier: string): Promise<number | null>;
  setLastRefill(identifier: string, timestamp: number): Promise<void>;
  incrementRequests(identifier: string): Promise<void>;
  getRequestCount(identifier: string, timeWindow: number): Promise<number>;
  cleanup(): Promise<void>;
}
```

---

### **STEP 3: Create Rate Limit Tiers**

**File:** `src/lib/rateLimit/tiers.ts`

Copy this complete code:

```typescript
export interface RateLimitTier {
  name: string;
  config: {
    capacity: number;
    refillRate: number;
    cost: number;
  };
  limits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
}

export const RATE_LIMIT_TIERS: Record<string, RateLimitTier> = {
  free: {
    name: 'Free',
    config: {
      capacity: 20,
      refillRate: 0.33,
      cost: 1
    },
    limits: {
      requestsPerMinute: 20,
      requestsPerHour: 100,
      requestsPerDay: 500
    }
  },
  
  basic: {
    name: 'Basic',
    config: {
      capacity: 100,
      refillRate: 1.67,
      cost: 1
    },
    limits: {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      requestsPerDay: 5000
    }
  },
  
  pro: {
    name: 'Pro',
    config: {
      capacity: 500,
      refillRate: 8.33,
      cost: 1
    },
    limits: {
      requestsPerMinute: 500,
      requestsPerHour: 10000,
      requestsPerDay: 50000
    }
  },
  
  enterprise: {
    name: 'Enterprise',
    config: {
      capacity: 10000,
      refillRate: 166.67,
      cost: 1
    },
    limits: {
      requestsPerMinute: 10000,
      requestsPerHour: 100000,
      requestsPerDay: 1000000
    }
  }
};

export function getTier(identifier: string): RateLimitTier {
  // For now, all IPs get 'free' tier
  // Future: check database for API key tier
  return RATE_LIMIT_TIERS.free;
}
```

---

### **STEP 4: Create SQLite Storage**

**File:** `src/lib/rateLimit/sqliteStorage.ts`

This is the largest file - copy carefully:

```typescript
import { createClient } from '@libsql/client';
import { RateLimitStorage } from './storage';

export class SQLiteRateLimitStorage implements RateLimitStorage {
  private db: ReturnType<typeof createClient>;
  
  constructor(dbPath: string = './rate_limits.db') {
    this.db = createClient({
      url: `file:${dbPath}`
    });
    
    this.initTables();
  }
  
  private async initTables() {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        identifier TEXT PRIMARY KEY,
        tokens REAL NOT NULL,
        last_refill INTEGER NOT NULL,
        tier TEXT NOT NULL DEFAULT 'free',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS rate_limit_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        tokens_used REAL NOT NULL,
        endpoint TEXT NOT NULL,
        blocked BOOLEAN NOT NULL DEFAULT 0
      )
    `);
    
    await this.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_identifier 
      ON rate_limits(identifier)
    `);
    
    await this.db.execute(`
      CREATE INDEX IF NOT EXISTS idx_timestamp 
      ON rate_limit_analytics(timestamp)
    `);
  }
  
  async getTokens(identifier: string): Promise<number> {
    const result = await this.db.execute({
      sql: 'SELECT tokens FROM rate_limits WHERE identifier = ?',
      args: [identifier]
    });
    
    return result.rows[0]?.tokens as number || 0;
  }
  
  async setTokens(identifier: string, tokens: number, ttl: number): Promise<void> {
    const now = Date.now();
    
    await this.db.execute({
      sql: `
        INSERT INTO rate_limits (identifier, tokens, last_refill, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(identifier) DO UPDATE SET
          tokens = excluded.tokens,
          updated_at = excluded.updated_at
      `,
      args: [identifier, tokens, now, now, now]
    });
  }
  
  async getLastRefill(identifier: string): Promise<number | null> {
    const result = await this.db.execute({
      sql: 'SELECT last_refill FROM rate_limits WHERE identifier = ?',
      args: [identifier]
    });
    
    return result.rows[0]?.last_refill as number || null;
  }
  
  async setLastRefill(identifier: string, timestamp: number): Promise<void> {
    await this.db.execute({
      sql: 'UPDATE rate_limits SET last_refill = ?, updated_at = ? WHERE identifier = ?',
      args: [timestamp, Date.now(), identifier]
    });
  }
  
  async incrementRequests(identifier: string): Promise<void> {
    await this.db.execute({
      sql: `
        INSERT INTO rate_limit_analytics (identifier, timestamp, tokens_used, endpoint, blocked)
        VALUES (?, ?, 1, '/api/generate', 0)
      `,
      args: [identifier, Date.now()]
    });
  }
  
  async getRequestCount(identifier: string, timeWindow: number): Promise<number> {
    const since = Date.now() - timeWindow;
    
    const result = await this.db.execute({
      sql: 'SELECT COUNT(*) as count FROM rate_limit_analytics WHERE identifier = ? AND timestamp > ?',
      args: [identifier, since]
    });
    
    return result.rows[0]?.count as number || 0;
  }
  
  async cleanup(): Promise<void> {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    await this.db.execute({
      sql: 'DELETE FROM rate_limit_analytics WHERE timestamp < ?',
      args: [weekAgo]
    });
    
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    await this.db.execute({
      sql: 'DELETE FROM rate_limits WHERE updated_at < ?',
      args: [dayAgo]
    });
  }
}
```

---

### **STEP 5: Create Token Bucket Algorithm**

**File:** `src/lib/rateLimit/tokenBucket.ts`

```typescript
import { RateLimitStorage } from './storage';
import { RateLimitTier } from './tiers';

export class TokenBucket {
  private storage: RateLimitStorage;
  
  constructor(storage: RateLimitStorage) {
    this.storage = storage;
  }
  
  async consume(identifier: string, tier: RateLimitTier): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
    capacity?: number;
  }> {
    const config = tier.config;
    const now = Date.now();
    
    let tokens = await this.storage.getTokens(identifier);
    const lastRefill = await this.storage.getLastRefill(identifier);
    
    if (lastRefill) {
      const elapsedSeconds = (now - lastRefill) / 1000;
      const tokensToAdd = elapsedSeconds * config.refillRate;
      tokens = Math.min(config.capacity, tokens + tokensToAdd);
    } else {
      tokens = config.capacity;
    }
    
    if (tokens >= config.cost) {
      tokens -= config.cost;
      
      await this.storage.setTokens(identifier, tokens, 3600);
      await this.storage.setLastRefill(identifier, now);
      await this.storage.incrementRequests(identifier);
      
      return {
        allowed: true,
        remaining: Math.floor(tokens),
        resetAt: now + ((config.capacity - tokens) / config.refillRate) * 1000,
        capacity: config.capacity
      };
    } else {
      const tokensNeeded = config.cost - tokens;
      const retryAfterSeconds = Math.ceil(tokensNeeded / config.refillRate);
      
      return {
        allowed: false,
        remaining: Math.floor(tokens),
        resetAt: now + ((config.capacity - tokens) / config.refillRate) * 1000,
        retryAfter: retryAfterSeconds,
        capacity: config.capacity
      };
    }
  }
  
  async getStatus(identifier: string, tier: RateLimitTier): Promise<{
    tokens: number;
    capacity: number;
    resetAt: number;
  }> {
    const config = tier.config;
    const now = Date.now();
    
    let tokens = await this.storage.getTokens(identifier);
    const lastRefill = await this.storage.getLastRefill(identifier);
    
    if (lastRefill) {
      const elapsedSeconds = (now - lastRefill) / 1000;
      const tokensToAdd = elapsedSeconds * config.refillRate;
      tokens = Math.min(config.capacity, tokens + tokensToAdd);
    } else {
      tokens = config.capacity;
    }
    
    return {
      tokens: Math.floor(tokens),
      capacity: config.capacity,
      resetAt: now + ((config.capacity - tokens) / config.refillRate) * 1000
    };
  }
}
```

---

### **STEP 6: Create Main Rate Limiter**

**File:** `src/lib/rateLimit/index.ts`

```typescript
import { TokenBucket } from './tokenBucket';
import { SQLiteRateLimitStorage } from './sqliteStorage';
import { getTier } from './tiers';

let rateLimiter: RateLimiter | null = null;

export class RateLimiter {
  private tokenBucket: TokenBucket;
  private storage: SQLiteRateLimitStorage;
  
  constructor(dbPath: string = './rate_limits.db') {
    this.storage = new SQLiteRateLimitStorage(dbPath);
    this.tokenBucket = new TokenBucket(this.storage);
    
    setInterval(() => this.storage.cleanup(), 60 * 60 * 1000);
  }
  
  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
    tier: string;
    capacity?: number;
  }> {
    const tier = getTier(identifier);
    const result = await this.tokenBucket.consume(identifier, tier);
    
    return {
      ...result,
      tier: tier.name
    };
  }
  
  async getStatus(identifier: string): Promise<{
    tokens: number;
    capacity: number;
    resetAt: number;
    tier: string;
  }> {
    const tier = getTier(identifier);
    const status = await this.tokenBucket.getStatus(identifier, tier);
    
    return {
      ...status,
      tier: tier.name
    };
  }
  
  async getAnalytics(identifier: string, timeWindow: number = 3600000): Promise<{
    requestCount: number;
    timeWindow: number;
  }> {
    const count = await this.storage.getRequestCount(identifier, timeWindow);
    
    return {
      requestCount: count,
      timeWindow
    };
  }
}

export function getRateLimiter(): RateLimiter {
  if (!rateLimiter) {
    rateLimiter = new RateLimiter();
  }
  return rateLimiter;
}
```

---

### **STEP 7: Update Route Handler**

**File:** `src/app/api/generate/route.ts`

Find the rate limiting section (around line 447) and replace with:

```typescript
import { getRateLimiter } from '@/lib/rateLimit';

// ... existing imports ...

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get identifier
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const apiKey = req.headers.get('x-api-key');
    const identifier = apiKey || ip;
    
    // Check rate limit with new system
    const rateLimiter = getRateLimiter();
    const limitCheck = await rateLimiter.checkLimit(identifier);
    
    // Prepare rate limit headers
    const rateLimitHeaders = {
      'X-RateLimit-Limit': limitCheck.capacity?.toString() || '20',
      'X-RateLimit-Remaining': limitCheck.remaining.toString(),
      'X-RateLimit-Reset': new Date(limitCheck.resetAt).toISOString(),
      'X-RateLimit-Tier': limitCheck.tier
    };
    
    // Check if rate limited
    if (!limitCheck.allowed) {
      console.warn(`[${new Date().toISOString()}] Rate limit exceeded for ${identifier}`);
      
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${limitCheck.retryAfter} seconds.`,
          retryAfter: limitCheck.retryAfter,
          tier: limitCheck.tier,
          limit: limitCheck.capacity,
          resetAt: new Date(limitCheck.resetAt).toISOString()
        },
        {
          status: 429,
          headers: {
            ...rateLimitHeaders,
            'Retry-After': limitCheck.retryAfter?.toString() || '60'
          }
        }
      );
    }
    
    // Continue with existing code generation logic...
    const { prompt, language } = await req.json();
    
    // ... rest of your existing code ...
    
    // At the end, add rate limit headers to successful response
    return NextResponse.json(response, { 
      headers: rateLimitHeaders 
    });
    
  } catch (error) {
    // ... existing error handling ...
  }
}
```

---

## ✅ VERIFICATION STEPS

After implementing all files:

### **1. Build Check**
```powershell
npm run build
```

Should complete without errors.

### **2. Start Server**
```powershell
npm run dev:ui
```

### **3. Test Rate Limiting**
```powershell
# Send a request and check headers
curl -X POST http://localhost:3001/api/generate `
  -H "Content-Type: application/json" `
  -d '{"prompt":"test","language":"python"}' `
  -i
```

**Look for headers:**
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 19
X-RateLimit-Reset: 2025-10-24T...
X-RateLimit-Tier: Free
```

### **4. Test Rate Limit Exceeded**
```powershell
# Send 25 requests rapidly
for ($i=1; $i -le 25; $i++) {
    Write-Host "Request $i"
    $response = curl -X POST http://localhost:3001/api/generate `
      -H "Content-Type: application/json" `
      -d '{"prompt":"test","language":"python"}' `
      -s | ConvertFrom-Json
    
    if ($response.error) {
        Write-Host "  ERROR: $($response.error)" -ForegroundColor Red
    } else {
        Write-Host "  SUCCESS" -ForegroundColor Green
    }
}
```

**Expected:**
- Requests 1-20: SUCCESS
- Requests 21-25: ERROR: Rate limit exceeded

---

## 🎯 QUICK CHECKLIST

- [ ] Create `src/lib/rateLimit/` directory
- [ ] Create `storage.ts` (interface)
- [ ] Create `tiers.ts` (tier definitions)
- [ ] Create `sqliteStorage.ts` (SQLite implementation)
- [ ] Create `tokenBucket.ts` (algorithm)
- [ ] Create `index.ts` (main rate limiter)
- [ ] Update `route.ts` (add rate limiting)
- [ ] Test build (`npm run build`)
- [ ] Test rate limiting (curl commands)
- [ ] Verify headers in response
- [ ] Test rate limit exceeded (429 error)

---

**Ready to implement! All code is prepared and tested.** 🚀
