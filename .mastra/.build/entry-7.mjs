import { createTool } from '@mastra/core';
import { z } from 'zod';

const PATTERNS = [
  // Authentication Patterns
  {
    code: `const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}`,
    description: "JWT token generation and verification for authentication",
    useCase: "Use for stateless authentication in REST APIs, microservices, or SPAs",
    language: ["javascript", "typescript"],
    tags: ["authentication", "jwt", "token", "security", "auth", "login", "session"]
  },
  {
    code: `from functools import wraps
from flask import request, jsonify
import jwt

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated`,
    description: "Python decorator for JWT authentication middleware",
    useCase: "Use to protect Flask routes requiring authentication",
    language: ["python"],
    tags: ["authentication", "jwt", "decorator", "middleware", "flask", "security", "auth"]
  },
  {
    code: `const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));`,
    description: "Express session management with Redis store",
    useCase: "Use for stateful session management in traditional web applications",
    language: ["javascript", "typescript"],
    tags: ["session", "redis", "express", "authentication", "cookie", "state"]
  },
  // API Patterns
  {
    code: `const express = require('express');
const router = express.Router();

router.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});`,
    description: "RESTful API CRUD endpoints with Express",
    useCase: "Use for building standard REST APIs with proper HTTP methods and status codes",
    language: ["javascript", "typescript"],
    tags: ["rest", "api", "crud", "express", "http", "endpoint", "routes"]
  },
  {
    code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/", status_code=201)
async def create_item(item: Item):
    return {"id": 1, **item.dict()}

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    item = await get_item_from_db(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item`,
    description: "FastAPI REST endpoints with Pydantic validation",
    useCase: "Use for building high-performance Python REST APIs with automatic validation",
    language: ["python"],
    tags: ["rest", "api", "fastapi", "pydantic", "validation", "async", "endpoint"]
  },
  {
    code: `const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql\`
  type User {
    id: ID!
    name: String!
  }
  type Query {
    users: [User!]!
  }
  type Mutation {
    createUser(name: String!): User!
  }
\`;

const resolvers = {
  Query: {
    users: () => User.find()
  },
  Mutation: {
    createUser: (_, { name }) => User.create({ name })
  }
};`,
    description: "GraphQL API setup with Apollo Server",
    useCase: "Use when clients need flexible data fetching with a single endpoint",
    language: ["javascript", "typescript"],
    tags: ["graphql", "api", "apollo", "query", "mutation", "schema"]
  },
  // Data Validation
  {
    code: `import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(18).max(120)
});

function validateUser(data: unknown) {
  try {
    return userSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { errors: error.errors };
    }
    throw error;
  }
}`,
    description: "Zod schema validation for TypeScript",
    useCase: "Use for runtime type validation and parsing of user input or API data",
    language: ["typescript"],
    tags: ["validation", "zod", "schema", "type-safety", "input", "parsing"]
  },
  {
    code: `const Joi = require('joi');

const schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(/^[a-zA-Z0-9]{8,30}$/)
});

function validateInput(data) {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
}`,
    description: "Joi validation for JavaScript objects",
    useCase: "Use for validating request bodies, configuration objects, or user input",
    language: ["javascript", "typescript"],
    tags: ["validation", "joi", "schema", "input", "sanitization"]
  },
  // Error Handling
  {
    code: `class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function errorHandler(err, req, res, next) {
  const { statusCode = 500, message } = err;
  res.status(statusCode).json({
    success: false,
    error: message
  });
}`,
    description: "Custom error classes and centralized error handling",
    useCase: "Use for consistent error handling across your application",
    language: ["javascript", "typescript"],
    tags: ["error", "exception", "middleware", "error-handling", "custom-error"]
  },
  {
    code: `async function withRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}`,
    description: "Retry logic with exponential backoff",
    useCase: "Use for handling transient failures in network requests or external API calls",
    language: ["javascript", "typescript"],
    tags: ["retry", "error-handling", "resilience", "backoff", "async"]
  },
  // Database Operations
  {
    code: `const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUserWithProfile(userData, profileData) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });
    const profile = await tx.profile.create({
      data: { ...profileData, userId: user.id }
    });
    return { user, profile };
  });
}`,
    description: "Database transaction with Prisma",
    useCase: "Use when multiple database operations must succeed or fail together",
    language: ["javascript", "typescript"],
    tags: ["database", "transaction", "prisma", "orm", "atomic", "crud"]
  },
  {
    code: `from sqlalchemy.orm import sessionmaker

def create_user(name, email):
    session = Session()
    try:
        user = User(name=name, email=email)
        session.add(user)
        session.commit()
        return user
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()`,
    description: "SQLAlchemy ORM with transaction handling",
    useCase: "Use for database operations in Python with proper transaction management",
    language: ["python"],
    tags: ["database", "sqlalchemy", "orm", "transaction", "crud", "sql"]
  },
  // File Operations
  {
    code: `const fs = require('fs').promises;

async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(\`File not found: \${filePath}\`);
    }
    throw error;
  }
}`,
    description: "Async file operations for JSON files",
    useCase: "Use for reading and writing configuration files or data persistence",
    language: ["javascript", "typescript"],
    tags: ["file", "io", "json", "async", "filesystem", "read", "write"]
  },
  {
    code: `const fs = require('fs');
const { pipeline } = require('stream');

async function processLargeFile(inputPath, outputPath) {
  const readStream = fs.createReadStream(inputPath);
  const writeStream = fs.createWriteStream(outputPath);
  await pipeline(readStream, writeStream);
}`,
    description: "Stream-based file processing for large files",
    useCase: "Use for processing large files without loading them entirely into memory",
    language: ["javascript", "typescript"],
    tags: ["stream", "file", "performance", "memory", "large-file", "pipeline"]
  },
  // Async Patterns
  {
    code: `async function fetchMultiple(urls) {
  const results = await Promise.all(
    urls.map(url => fetch(url).then(res => res.json()))
  );
  return results;
}`,
    description: "Promise.all for concurrent operations",
    useCase: "Use for parallel requests that all need to complete",
    language: ["javascript", "typescript"],
    tags: ["async", "promise", "concurrent", "parallel", "await", "fetch"]
  },
  {
    code: `import asyncio

async def fetch_all(urls):
    tasks = [fetch_data(url) for url in urls]
    results = await asyncio.gather(*tasks)
    return results`,
    description: "Python asyncio for concurrent operations",
    useCase: "Use for concurrent I/O operations in Python",
    language: ["python"],
    tags: ["async", "asyncio", "concurrent", "await", "parallel", "io"]
  },
  // Security Patterns
  {
    code: `const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);`,
    description: "Express security middleware",
    useCase: "Use to protect Express apps from common vulnerabilities",
    language: ["javascript", "typescript"],
    tags: ["security", "helmet", "rate-limit", "middleware"]
  },
  {
    code: `app.use(cors({
  origin: process.env.ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));`,
    description: "CORS configuration for secure cross-origin requests",
    useCase: "Use to control which domains can access your API",
    language: ["javascript", "typescript"],
    tags: ["cors", "security", "cross-origin", "headers", "api"]
  },
  // Performance Patterns
  {
    code: `const cache = new Map();

function memoize(fn) {
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}`,
    description: "Memoization pattern for caching function results",
    useCase: "Use to cache expensive function calls and improve performance",
    language: ["javascript", "typescript"],
    tags: ["performance", "cache", "memoization", "optimization"]
  },
  {
    code: `const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

async function getCachedData(key, fetchFn) {
  const cached = cache.get(key);
  if (cached) return cached;
  const data = await fetchFn();
  cache.set(key, data);
  return data;
}`,
    description: "Node-cache for in-memory caching with TTL",
    useCase: "Use for caching API responses or database queries",
    language: ["javascript", "typescript"],
    tags: ["cache", "performance", "ttl", "memory", "optimization"]
  },
  // Testing Patterns
  {
    code: `describe('UserService', () => {
  let mockDatabase;
  
  beforeEach(() => {
    mockDatabase = {
      findUser: jest.fn(),
      createUser: jest.fn()
    };
  });
  
  test('should create user', async () => {
    mockDatabase.createUser.mockResolvedValue({ id: 1 });
    const result = await service.createUser({});
    expect(result).toHaveProperty('id');
  });
});`,
    description: "Jest unit testing with mocks",
    useCase: "Use for testing functions with external dependencies",
    language: ["javascript", "typescript"],
    tags: ["testing", "jest", "mock", "unit-test", "tdd"]
  },
  {
    code: `import pytest

@pytest.fixture
def mock_database():
    return Mock()

def test_create_user(mock_database):
    result = service.create_user({'name': 'John'})
    assert result['id'] == 1`,
    description: "Pytest with fixtures",
    useCase: "Use for comprehensive Python unit testing with test fixtures",
    language: ["python"],
    tags: ["testing", "pytest", "mock", "fixture", "unit-test"]
  },
  // Design Patterns
  {
    code: `class Singleton {
  private static instance: Singleton;
  private constructor() {}
  static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}`,
    description: "Singleton design pattern",
    useCase: "Use when you need exactly one instance of a class",
    language: ["typescript", "javascript"],
    tags: ["design-pattern", "singleton", "class", "instance"]
  },
  {
    code: `function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}`,
    description: "Debounce function for rate limiting",
    useCase: "Use for search inputs, resize handlers, or high-frequency events",
    language: ["javascript", "typescript"],
    tags: ["debounce", "performance", "optimization", "event"]
  }
];

const PatternSchema = z.object({
  code: z.string(),
  description: z.string(),
  useCase: z.string(),
  score: z.number()
});
const inputSchema = z.object({
  query: z.string().describe("Search query for code patterns"),
  language: z.string().describe("Programming language context"),
  context: z.string().optional().describe("Additional context for the search"),
  topK: z.number().default(3).describe("Number of results to return")
});
const outputSchema = z.object({
  relevantPatterns: z.array(PatternSchema).describe("Relevant code patterns"),
  recommendations: z.array(z.string()).describe("Contextual recommendations"),
  sourceReferences: z.array(z.string()).describe("Documentation and reference links")
});
function calculateSimilarity(query, pattern, language) {
  const queryWords = query.toLowerCase().split(/\s+/);
  let score = 0;
  if (pattern.language.includes(language.toLowerCase())) {
    score += 10;
  }
  for (const word of queryWords) {
    if (word.length < 3) continue;
    if (pattern.tags.some((tag) => tag.includes(word) || word.includes(tag))) {
      score += 5;
    }
    if (pattern.description.toLowerCase().includes(word)) {
      score += 3;
    }
    if (pattern.useCase.toLowerCase().includes(word)) {
      score += 2;
    }
    if (pattern.code.toLowerCase().includes(word)) {
      score += 1;
    }
  }
  return score;
}
function generateRecommendations(query, language) {
  const recommendations = [];
  const queryLower = query.toLowerCase();
  if (queryLower.includes("auth") || queryLower.includes("login")) {
    recommendations.push("Consider implementing JWT for stateless authentication");
    recommendations.push("Always hash passwords using bcrypt or argon2");
    recommendations.push("Implement rate limiting to prevent brute force attacks");
  }
  if (queryLower.includes("api") || queryLower.includes("endpoint")) {
    recommendations.push("Use proper HTTP status codes (200, 201, 400, 404, 500)");
    recommendations.push("Implement request validation before processing");
    recommendations.push("Add API versioning for backward compatibility");
  }
  if (queryLower.includes("database") || queryLower.includes("db")) {
    recommendations.push("Use transactions for operations that must be atomic");
    recommendations.push("Implement connection pooling for better performance");
    recommendations.push("Add indexes on frequently queried columns");
  }
  if (queryLower.includes("error") || queryLower.includes("exception")) {
    recommendations.push("Create custom error classes for different error types");
    recommendations.push("Log errors with context for easier debugging");
    recommendations.push("Never expose sensitive information in error messages");
  }
  if (queryLower.includes("test")) {
    recommendations.push("Follow the AAA pattern: Arrange, Act, Assert");
    recommendations.push("Mock external dependencies for unit tests");
    recommendations.push("Aim for at least 80% code coverage");
  }
  if (queryLower.includes("performance") || queryLower.includes("optimize")) {
    recommendations.push("Implement caching for frequently accessed data");
    recommendations.push("Use pagination for large datasets");
    recommendations.push("Profile your code to identify bottlenecks");
  }
  if (queryLower.includes("security")) {
    recommendations.push("Sanitize all user inputs to prevent injection attacks");
    recommendations.push("Use HTTPS for all production endpoints");
    recommendations.push("Implement CORS properly to control access");
  }
  if (recommendations.length === 0) {
    recommendations.push("Follow language-specific best practices and conventions");
    recommendations.push("Write comprehensive tests for critical functionality");
    recommendations.push("Document your code and APIs thoroughly");
  }
  return recommendations.slice(0, 5);
}
function getSourceReferences(language, query) {
  const references = [];
  const queryLower = query.toLowerCase();
  switch (language.toLowerCase()) {
    case "javascript":
    case "typescript":
      references.push("https://developer.mozilla.org/en-US/docs/Web/JavaScript");
      references.push("https://www.typescriptlang.org/docs/");
      break;
    case "python":
      references.push("https://docs.python.org/3/");
      references.push("https://realpython.com/");
      break;
  }
  if (queryLower.includes("auth") || queryLower.includes("jwt")) {
    references.push("https://jwt.io/introduction");
  }
  if (queryLower.includes("rest") || queryLower.includes("api")) {
    references.push("https://restfulapi.net/");
  }
  if (queryLower.includes("graphql")) {
    references.push("https://graphql.org/learn/");
  }
  if (queryLower.includes("test")) {
    references.push("https://jestjs.io/docs/getting-started");
    references.push("https://docs.pytest.org/");
  }
  if (queryLower.includes("security")) {
    references.push("https://owasp.org/www-project-top-ten/");
  }
  references.push("https://github.com/");
  references.push("https://stackoverflow.com/");
  return [...new Set(references)];
}
const knowledgeRetrievalTool = createTool({
  id: "knowledge-retrieval",
  description: "Retrieves relevant code patterns, best practices, and recommendations from a curated knowledge base",
  inputSchema,
  outputSchema,
  execute: async ({ context, query, language, context: additionalContext, topK }) => {
    try {
      if (!query || query.trim().length === 0) {
        return {
          relevantPatterns: [],
          recommendations: ["Please provide a search query"],
          sourceReferences: []
        };
      }
      const fullQuery = additionalContext ? `${query} ${additionalContext}` : query;
      const scoredPatterns = PATTERNS.map((pattern) => ({
        pattern,
        score: calculateSimilarity(fullQuery, pattern, language)
      }));
      const topPatterns = scoredPatterns.filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, topK).map((item) => ({
        code: item.pattern.code,
        description: item.pattern.description,
        useCase: item.pattern.useCase,
        score: item.score
      }));
      const recommendations = generateRecommendations(fullQuery);
      const sourceReferences = getSourceReferences(language, fullQuery);
      return {
        relevantPatterns: topPatterns,
        recommendations,
        sourceReferences
      };
    } catch (error) {
      console.error("Error in knowledge retrieval:", error);
      return {
        relevantPatterns: [],
        recommendations: [
          "An error occurred during knowledge retrieval",
          "Please try rephrasing your query or check the language parameter"
        ],
        sourceReferences: [
          "https://developer.mozilla.org/",
          "https://docs.python.org/",
          "https://stackoverflow.com/"
        ]
      };
    }
  }
});

export { knowledgeRetrievalTool };
