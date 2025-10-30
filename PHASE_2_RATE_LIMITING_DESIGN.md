# 🚦 Phase 2: Advanced Rate Limiting Design

**Goal:** Replace simple in-memory rate limiting with production-ready solution  
**Status:** DESIGN PHASE - Ready to implement after Ollama setup

---

## 🎯 CURRENT STATE vs TARGET STATE

### **Current Implementation (Basic)**
**Location:** `src/app/api/generate/route.ts` (lines 311-441)

```typescript
// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (record.count >= 20) {
    return false;
  }
  
  record.count++;
  return true;
}
```

**Limitations:**
- ❌ Lost on server restart
- ❌ Not shared across instances
- ❌ No persistence
- ❌ No analytics
- ❌ Fixed limits (no tiers)

---

### **Target Implementation (Production)**

**Features:**
- ✅ Persistent storage (Redis or SQLite)
- ✅ Multiple rate limit tiers
- ✅ Token bucket algorithm
- ✅ Analytics and monitoring
- ✅ Configurable limits
- ✅ IP + API key support
- ✅ Graceful degradation

---

## 📋 DESIGN OPTIONS

### **Option 1: Redis-Based (Recommended for Production)**

**Pros:**
- ⚡ Extremely fast (in-memory)
- 🔄 Shared across multiple instances
- 💪 Built-in TTL support
- 📊 Easy analytics
- 🌐 Industry standard

**Cons:**
- 🔧 Requires Redis server
- 💰 Additional infrastructure cost

**Use Case:** Multi-instance production deployment

---

### **Option 2: SQLite-Based (Recommended for This Project)**

**Pros:**
- 📦 No external dependencies
- 💾 Persistent storage
- 🔒 Already using LibSQL
- 🚀 Easy to set up
- 💰 Zero cost

**Cons:**
- 🐌 Slower than Redis
- 🔄 Not ideal for multi-instance

**Use Case:** Single-instance deployment, development, demos

---

### **Option 3: Upstash Redis (Serverless)**

**Pros:**
- ☁️ Serverless (no server management)
- 🌍 Global edge network
- 💰 Free tier available
- 🔄 Multi-instance ready

**Cons:**
- 🌐 Requires internet connection
- 💰 Paid beyond free tier

**Use Case:** Serverless deployments (Vercel, Netlify)

---

## 🎯 RECOMMENDED APPROACH: SQLite + Token Bucket

**Why:**
- ✅ Already using LibSQL in project
- ✅ No new dependencies
- ✅ Persistent across restarts
- ✅ Perfect for single-instance
- ✅ Easy to upgrade to Redis later

---

## 📐 ARCHITECTURE DESIGN

### **File Structure:**

```
src/
├── lib/
│   ├── rateLimit/
│   │   ├── index.ts              # Main rate limiter
│   │   ├── storage.ts            # Storage interface
│   │   ├── sqliteStorage.ts      # SQLite implementation
│   │   ├── redisStorage.ts       # Redis implementation (future)
│   │   ├── tokenBucket.ts        # Token bucket algorithm
│   │   ├── tiers.ts              # Rate limit tiers
│   │   └── analytics.ts          # Usage analytics
│   └── db.ts                     # Database connection (existing)
└── app/
    └── api/
        └── generate/
            └── route.ts          # Updated to use new rate limiter
```

---

## 🔧 IMPLEMENTATION DESIGN

### **1. Storage Interface**
**File:** `src/lib/rateLimit/storage.ts`

```typescript
/**
 * Storage interface for rate limiting
 * Allows swapping between SQLite, Redis, etc.
 */
export interface RateLimitStorage {
  /**
   * Get current token count for identifier
   */
  getTokens(identifier: string): Promise<number>;
  
  /**
   * Set token count for identifier
   */
  setTokens(identifier: string, tokens: number, ttl: number): Promise<void>;
  
  /**
   * Get last refill time
   */
  getLastRefill(identifier: string): Promise<number | null>;
  
  /**
   * Set last refill time
   */
  setLastRefill(identifier: string, timestamp: number): Promise<void>;
  
  /**
   * Increment request counter (for analytics)
   */
  incrementRequests(identifier: string): Promise<void>;
  
  /**
   * Get request count (for analytics)
   */
  getRequestCount(identifier: string, timeWindow: number): Promise<number>;
  
  /**
   * Clean up expired entries
   */
  cleanup(): Promise<void>;
}
```

---

### **2. SQLite Storage Implementation**
**File:** `src/lib/rateLimit/sqliteStorage.ts`

```typescript
import { createClient } from '@libsql/client';

export class SQLiteRateLimitStorage implements RateLimitStorage {
  private db: ReturnType<typeof createClient>;
  
  constructor(dbPath: string) {
    this.db = createClient({
      url: `file:${dbPath}`
    });
    
    this.initTables();
  }
  
  private async initTables() {
    // Create rate_limits table
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
    
    // Create rate_limit_analytics table
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
    
    // Create index for faster lookups
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
    // Remove entries older than 7 days
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    await this.db.execute({
      sql: 'DELETE FROM rate_limit_analytics WHERE timestamp < ?',
      args: [weekAgo]
    });
    
    // Remove unused rate limit entries older than 1 day
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    await this.db.execute({
      sql: 'DELETE FROM rate_limits WHERE updated_at < ?',
      args: [dayAgo]
    });
  }
}
```

---

### **3. Token Bucket Algorithm**
**File:** `src/lib/rateLimit/tokenBucket.ts`

```typescript
import { RateLimitStorage } from './storage';
import { RateLimitTier, getTier } from './tiers';

export interface TokenBucketConfig {
  capacity: number;      // Max tokens in bucket
  refillRate: number;    // Tokens added per second
  cost: number;          // Tokens consumed per request
}

export class TokenBucket {
  private storage: RateLimitStorage;
  
  constructor(storage: RateLimitStorage) {
    this.storage = storage;
  }
  
  /**
   * Check if request is allowed and consume tokens
   */
  async consume(identifier: string, tier: RateLimitTier): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
  }> {
    const config = tier.config;
    const now = Date.now();
    
    // Get current state
    let tokens = await this.storage.getTokens(identifier);
    const lastRefill = await this.storage.getLastRefill(identifier);
    
    // Calculate tokens to add based on time elapsed
    if (lastRefill) {
      const elapsedSeconds = (now - lastRefill) / 1000;
      const tokensToAdd = elapsedSeconds * config.refillRate;
      tokens = Math.min(config.capacity, tokens + tokensToAdd);
    } else {
      // First request - start with full bucket
      tokens = config.capacity;
    }
    
    // Check if enough tokens
    if (tokens >= config.cost) {
      // Consume tokens
      tokens -= config.cost;
      
      await this.storage.setTokens(identifier, tokens, 3600); // 1 hour TTL
      await this.storage.setLastRefill(identifier, now);
      await this.storage.incrementRequests(identifier);
      
      return {
        allowed: true,
        remaining: Math.floor(tokens),
        resetAt: now + ((config.capacity - tokens) / config.refillRate) * 1000
      };
    } else {
      // Not enough tokens - calculate retry time
      const tokensNeeded = config.cost - tokens;
      const retryAfterSeconds = Math.ceil(tokensNeeded / config.refillRate);
      
      return {
        allowed: false,
        remaining: Math.floor(tokens),
        resetAt: now + ((config.capacity - tokens) / config.refillRate) * 1000,
        retryAfter: retryAfterSeconds
      };
    }
  }
  
  /**
   * Get current status without consuming
   */
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

### **4. Rate Limit Tiers**
**File:** `src/lib/rateLimit/tiers.ts`

```typescript
export interface RateLimitTier {
  name: string;
  config: {
    capacity: number;    // Max tokens
    refillRate: number;  // Tokens per second
    cost: number;        // Tokens per request
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
      capacity: 20,      // 20 tokens max
      refillRate: 0.33,  // ~20 per minute
      cost: 1            // 1 token per request
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
      refillRate: 1.67,  // ~100 per minute
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
      refillRate: 8.33,  // ~500 per minute
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
      refillRate: 166.67, // ~10000 per minute
      cost: 1
    },
    limits: {
      requestsPerMinute: 10000,
      requestsPerHour: 100000,
      requestsPerDay: 1000000
    }
  }
};

/**
 * Get tier for identifier (IP or API key)
 * Can be extended to check database for API key tiers
 */
export function getTier(identifier: string): RateLimitTier {
  // For now, all IPs get 'free' tier
  // In future, check API key in database for tier
  
  if (identifier.startsWith('api_')) {
    // Check database for API key tier
    // return RATE_LIMIT_TIERS[apiKey.tier]
  }
  
  return RATE_LIMIT_TIERS.free;
}
```

---

### **5. Main Rate Limiter**
**File:** `src/lib/rateLimit/index.ts`

```typescript
import { TokenBucket } from './tokenBucket';
import { SQLiteRateLimitStorage } from './sqliteStorage';
import { getTier } from './tiers';

// Singleton instance
let rateLimiter: RateLimiter | null = null;

export class RateLimiter {
  private tokenBucket: TokenBucket;
  private storage: SQLiteRateLimitStorage;
  
  constructor(dbPath: string = './rate_limits.db') {
    this.storage = new SQLiteRateLimitStorage(dbPath);
    this.tokenBucket = new TokenBucket(this.storage);
    
    // Schedule cleanup every hour
    setInterval(() => this.storage.cleanup(), 60 * 60 * 1000);
  }
  
  /**
   * Check if request is allowed
   */
  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
    tier: string;
  }> {
    const tier = getTier(identifier);
    const result = await this.tokenBucket.consume(identifier, tier);
    
    return {
      ...result,
      tier: tier.name
    };
  }
  
  /**
   * Get current status
   */
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
  
  /**
   * Get analytics for identifier
   */
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

/**
 * Get singleton rate limiter instance
 */
export function getRateLimiter(): RateLimiter {
  if (!rateLimiter) {
    rateLimiter = new RateLimiter();
  }
  return rateLimiter;
}
```

---

### **6. Updated Route Handler**
**File:** `src/app/api/generate/route.ts`

```typescript
import { getRateLimiter } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get identifier (IP or API key)
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const apiKey = req.headers.get('x-api-key');
    const identifier = apiKey || ip;
    
    // Check rate limit
    const rateLimiter = getRateLimiter();
    const limitCheck = await rateLimiter.checkLimit(identifier);
    
    // Add rate limit headers
    const headers = {
      'X-RateLimit-Limit': limitCheck.capacity?.toString() || '20',
      'X-RateLimit-Remaining': limitCheck.remaining.toString(),
      'X-RateLimit-Reset': new Date(limitCheck.resetAt).toISOString(),
      'X-RateLimit-Tier': limitCheck.tier
    };
    
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${limitCheck.retryAfter} seconds.`,
          retryAfter: limitCheck.retryAfter,
          tier: limitCheck.tier
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': limitCheck.retryAfter?.toString() || '60'
          }
        }
      );
    }
    
    // Continue with normal flow...
    const { prompt, language } = await req.json();
    
    // ... rest of the code generation logic ...
    
    // Return with rate limit headers
    return NextResponse.json(response, { headers });
    
  } catch (error) {
    // Error handling...
  }
}
```

---

## 📊 RESPONSE HEADERS

All responses will include:

```
X-RateLimit-Limit: 20           # Max requests in window
X-RateLimit-Remaining: 15       # Remaining requests
X-RateLimit-Reset: 2025-10-24T11:00:00Z  # When limit resets
X-RateLimit-Tier: Free          # User's tier
```

On rate limit exceeded (429):
```
Retry-After: 30                 # Seconds until retry allowed
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### **Phase 2A: Core Implementation**
- [ ] Create `src/lib/rateLimit/` directory
- [ ] Implement storage interface
- [ ] Implement SQLite storage
- [ ] Implement token bucket algorithm
- [ ] Define rate limit tiers
- [ ] Create main rate limiter class
- [ ] Update route handler
- [ ] Add rate limit headers

### **Phase 2B: Testing**
- [ ] Unit tests for token bucket
- [ ] Integration tests for storage
- [ ] Load testing
- [ ] Edge case testing

### **Phase 2C: Monitoring**
- [ ] Analytics dashboard endpoint
- [ ] Usage metrics
- [ ] Alert system for abuse

### **Phase 2D: Documentation**
- [ ] API documentation
- [ ] Rate limit tier comparison
- [ ] Upgrade guide

---

## 📈 MIGRATION PLAN

### **Step 1: Deploy Side-by-Side**
- Keep old rate limiter
- Add new rate limiter
- Log both results
- Compare accuracy

### **Step 2: Gradual Rollout**
- 10% traffic to new limiter
- Monitor for issues
- Increase to 50%
- Increase to 100%

### **Step 3: Remove Old Code**
- Delete old rate limiter
- Clean up unused code
- Update documentation

---

## ✅ READY TO IMPLEMENT

**All design decisions made:**
- ✅ SQLite storage (using existing LibSQL)
- ✅ Token bucket algorithm
- ✅ 4-tier system (Free, Basic, Pro, Enterprise)
- ✅ Analytics included
- ✅ Standard rate limit headers

**Estimated implementation time:** 2-3 hours

**Files to create:** 6 new files in `src/lib/rateLimit/`

**Files to modify:** 1 file (`src/app/api/generate/route.ts`)

**Ready to start as soon as Ollama finishes downloading!** 🚀
