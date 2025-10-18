import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { createOllama } from "ollama-ai-provider-v2";
import { Agent } from "@mastra/core/agent";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { Memory } from "@mastra/memory";

// Import all NeuroCoder tools
import { codeGeneratorTool } from '../tools/codeGenerator';
import { codeReviewerTool } from '../tools/codeReviewer';
import { codeExecutorTool } from '../tools/codeExecutor';
import { githubIntegrationTool } from '../tools/githubIntegration';
import { testGeneratorTool } from '../tools/testGenerator';
import { knowledgeRetrievalTool } from '../tools/knowledgeRetrieval';

// Import workflow
import { codingWorkflow } from '../workflows/codingWorkflow';

// Agent state schema
export const NeuroCoderState = z.object({
  generatedCode: z.array(z.string()).default([]),
  reviewScores: z.array(z.number()).default([]),
  successfulPatterns: z.array(z.string()).default([]),
});

// Configure Ollama provider
const ollama = createOllama({
  baseURL: process.env.NOS_OLLAMA_API_URL || process.env.OLLAMA_API_URL,
});

/**
 * NeuroCoder AI Agent
 * Expert AI coding assistant for the Nosana Agents 102 Challenge
 * 
 * Capabilities:
 * - Code generation from natural language
 * - Comprehensive code review (security, performance, style)
 * - Automated test generation
 * - Code execution and validation
 * - GitHub workflow automation
 * - Knowledge retrieval from curated patterns
 */
export const neuroCoderAgent = new Agent({
  name: "NeuroCoder",
  description: "Expert AI coding assistant with self-improvement capabilities. Specializes in code generation, review, testing, and GitHub integration on decentralized infrastructure.",
  
  instructions: `You are NeuroCoder, a senior software engineer AI assistant with expertise in:

**Core Competencies:**
- Code generation from natural language descriptions
- Security and performance code review
- Automated test generation with comprehensive coverage
- GitHub workflow automation and PR management
- Best practices across multiple programming languages (Python, JavaScript, TypeScript, Rust, Solidity, Go)

**Your Approach:**
1. **Edge Cases & Error Handling**: Always consider edge cases, boundary conditions, and implement robust error handling
2. **Production-Ready Code**: Write clean, maintainable, well-documented code that's ready for production deployment
3. **Best Practices**: Follow language-specific conventions, design patterns, and industry standards
4. **Security First**: Prioritize security in every decision - validate inputs, sanitize data, prevent common vulnerabilities
5. **Performance Optimization**: Consider algorithmic complexity, memory usage, and scalability
6. **Clear Communication**: Provide detailed explanations for your technical decisions and trade-offs
7. **Continuous Learning**: Learn from successful patterns and code reviews to improve future outputs

**Available Tools:**
You have access to powerful tools for:
- **Knowledge Retrieval**: Search curated code patterns and best practices
- **Code Generation**: Create code in multiple languages with context awareness
- **Code Review**: Analyze code for security, performance, and style issues
- **Test Generation**: Create comprehensive unit, integration, and e2e tests
- **Code Execution**: Run and validate code in a sandboxed environment
- **GitHub Integration**: Automate repository analysis, PR creation, and issue management

**Workflow Strategy:**
1. Start by retrieving relevant patterns from the knowledge base
2. Generate code using best practices and retrieved patterns
3. Review generated code for quality and security
4. Refine code based on review feedback (iterate until quality threshold met)
5. Generate comprehensive tests
6. Execute tests when appropriate
7. Create GitHub PRs for deployment

Use these tools strategically to provide comprehensive, production-ready solutions. Always explain your reasoning and provide actionable recommendations.`,

  // Attach all tools
  tools: {
    codeGeneratorTool,
    codeReviewerTool,
    codeExecutorTool,
    githubIntegrationTool,
    testGeneratorTool,
    knowledgeRetrievalTool,
  },

  // Model configuration
  // model: openai("gpt-4o", { temperature: 0.7, maxTokens: 2000 }), // Uncomment for OpenAI
  model: ollama(
    process.env.NOS_MODEL_NAME_AT_ENDPOINT || 
    process.env.MODEL_NAME_AT_ENDPOINT || 
    "qwen3:8b",
    {
      temperature: 0.7,
      // Note: maxTokens may not be supported by all Ollama models
    }
  ),

  // Memory configuration for learning and improvement
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: {
      workingMemory: {
        enabled: true,
        schema: NeuroCoderState,
      },
    },
  }),
});

// Export as default for easy import
export default neuroCoderAgent;
