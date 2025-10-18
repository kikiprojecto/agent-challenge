import { createTool } from '@mastra/core';
import { z } from 'zod';
import { PATTERNS, KnowledgePattern } from './knowledgeBase';

// Pattern schema
const PatternSchema = z.object({
  code: z.string(),
  description: z.string(),
  useCase: z.string(),
  score: z.number()
});

// Input schema
const inputSchema = z.object({
  query: z.string().describe('Search query for code patterns'),
  language: z.string().describe('Programming language context'),
  context: z.string().optional().describe('Additional context for the search'),
  topK: z.number().default(3).describe('Number of results to return')
});

// Output schema
const outputSchema = z.object({
  relevantPatterns: z.array(PatternSchema).describe('Relevant code patterns'),
  recommendations: z.array(z.string()).describe('Contextual recommendations'),
  sourceReferences: z.array(z.string()).describe('Documentation and reference links')
});

/**
 * Calculate similarity score between query and pattern
 */
function calculateSimilarity(query: string, pattern: KnowledgePattern, language: string): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  let score = 0;
  
  // Language match bonus
  if (pattern.language.includes(language.toLowerCase())) {
    score += 10;
  }
  
  // Check each query word against pattern fields
  for (const word of queryWords) {
    if (word.length < 3) continue;
    
    // Tags match (highest weight)
    if (pattern.tags.some(tag => tag.includes(word) || word.includes(tag))) {
      score += 5;
    }
    
    // Description match
    if (pattern.description.toLowerCase().includes(word)) {
      score += 3;
    }
    
    // Use case match
    if (pattern.useCase.toLowerCase().includes(word)) {
      score += 2;
    }
    
    // Code match (lower weight)
    if (pattern.code.toLowerCase().includes(word)) {
      score += 1;
    }
  }
  
  return score;
}

/**
 * Generate contextual recommendations based on query
 */
function generateRecommendations(query: string, language: string): string[] {
  const recommendations: string[] = [];
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('auth') || queryLower.includes('login')) {
    recommendations.push('Consider implementing JWT for stateless authentication');
    recommendations.push('Always hash passwords using bcrypt or argon2');
    recommendations.push('Implement rate limiting to prevent brute force attacks');
  }
  
  if (queryLower.includes('api') || queryLower.includes('endpoint')) {
    recommendations.push('Use proper HTTP status codes (200, 201, 400, 404, 500)');
    recommendations.push('Implement request validation before processing');
    recommendations.push('Add API versioning for backward compatibility');
  }
  
  if (queryLower.includes('database') || queryLower.includes('db')) {
    recommendations.push('Use transactions for operations that must be atomic');
    recommendations.push('Implement connection pooling for better performance');
    recommendations.push('Add indexes on frequently queried columns');
  }
  
  if (queryLower.includes('error') || queryLower.includes('exception')) {
    recommendations.push('Create custom error classes for different error types');
    recommendations.push('Log errors with context for easier debugging');
    recommendations.push('Never expose sensitive information in error messages');
  }
  
  if (queryLower.includes('test')) {
    recommendations.push('Follow the AAA pattern: Arrange, Act, Assert');
    recommendations.push('Mock external dependencies for unit tests');
    recommendations.push('Aim for at least 80% code coverage');
  }
  
  if (queryLower.includes('performance') || queryLower.includes('optimize')) {
    recommendations.push('Implement caching for frequently accessed data');
    recommendations.push('Use pagination for large datasets');
    recommendations.push('Profile your code to identify bottlenecks');
  }
  
  if (queryLower.includes('security')) {
    recommendations.push('Sanitize all user inputs to prevent injection attacks');
    recommendations.push('Use HTTPS for all production endpoints');
    recommendations.push('Implement CORS properly to control access');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Follow language-specific best practices and conventions');
    recommendations.push('Write comprehensive tests for critical functionality');
    recommendations.push('Document your code and APIs thoroughly');
  }
  
  return recommendations.slice(0, 5);
}

/**
 * Get source references based on language and query
 */
function getSourceReferences(language: string, query: string): string[] {
  const references: string[] = [];
  const queryLower = query.toLowerCase();
  
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'typescript':
      references.push('https://developer.mozilla.org/en-US/docs/Web/JavaScript');
      references.push('https://www.typescriptlang.org/docs/');
      break;
    case 'python':
      references.push('https://docs.python.org/3/');
      references.push('https://realpython.com/');
      break;
  }
  
  if (queryLower.includes('auth') || queryLower.includes('jwt')) {
    references.push('https://jwt.io/introduction');
  }
  
  if (queryLower.includes('rest') || queryLower.includes('api')) {
    references.push('https://restfulapi.net/');
  }
  
  if (queryLower.includes('graphql')) {
    references.push('https://graphql.org/learn/');
  }
  
  if (queryLower.includes('test')) {
    references.push('https://jestjs.io/docs/getting-started');
    references.push('https://docs.pytest.org/');
  }
  
  if (queryLower.includes('security')) {
    references.push('https://owasp.org/www-project-top-ten/');
  }
  
  references.push('https://github.com/');
  references.push('https://stackoverflow.com/');
  
  return [...new Set(references)];
}

/**
 * Knowledge Retrieval Tool
 * RAG-powered tool for retrieving relevant code patterns and best practices
 */
export const knowledgeRetrievalTool = createTool({
  id: 'knowledge-retrieval',
  description: 'Retrieves relevant code patterns, best practices, and recommendations from a curated knowledge base',
  inputSchema,
  outputSchema,
  
  execute: async ({ context, query, language, context: additionalContext, topK }) => {
    try {
      if (!query || query.trim().length === 0) {
        return {
          relevantPatterns: [],
          recommendations: ['Please provide a search query'],
          sourceReferences: []
        };
      }
      
      const fullQuery = additionalContext ? `${query} ${additionalContext}` : query;
      
      const scoredPatterns = PATTERNS.map(pattern => ({
        pattern,
        score: calculateSimilarity(fullQuery, pattern, language)
      }));
      
      const topPatterns = scoredPatterns
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(item => ({
          code: item.pattern.code,
          description: item.pattern.description,
          useCase: item.pattern.useCase,
          score: item.score
        }));
      
      const recommendations = generateRecommendations(fullQuery, language);
      const sourceReferences = getSourceReferences(language, fullQuery);
      
      return {
        relevantPatterns: topPatterns,
        recommendations,
        sourceReferences
      };
      
    } catch (error) {
      console.error('Error in knowledge retrieval:', error);
      
      return {
        relevantPatterns: [],
        recommendations: [
          'An error occurred during knowledge retrieval',
          'Please try rephrasing your query or check the language parameter'
        ],
        sourceReferences: [
          'https://developer.mozilla.org/',
          'https://docs.python.org/',
          'https://stackoverflow.com/'
        ]
      };
    }
  },
});
