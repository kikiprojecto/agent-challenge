import { createTool } from '@mastra/core';
import { z } from 'zod';

// Language-specific system prompts
const LANGUAGE_PROMPTS = {
  python: `You are an expert Python developer. Generate clean, idiomatic Python code following these principles:
- Use PEP 8 style guidelines
- Include type hints (Python 3.9+)
- Implement proper error handling with try-except blocks
- Add comprehensive docstrings (Google or NumPy style)
- Use modern Python features (f-strings, dataclasses, async/await when appropriate)
- Follow SOLID principles and write maintainable code
- Optimize for readability and performance
- Include proper logging where appropriate`,

  javascript: `You are an expert JavaScript developer. Generate modern, clean JavaScript code following these principles:
- Use ES6+ features (arrow functions, destructuring, spread operator)
- Implement proper error handling with try-catch blocks
- Add JSDoc comments for functions and complex logic
- Follow functional programming principles where appropriate
- Use async/await for asynchronous operations
- Optimize for performance and memory efficiency
- Follow industry best practices and design patterns
- Ensure code is compatible with modern browsers/Node.js`,

  typescript: `You are an expert TypeScript developer. Generate type-safe, modern TypeScript code following these principles:
- Use strict TypeScript configuration
- Define explicit types and interfaces
- Implement proper error handling with try-catch blocks
- Add TSDoc comments for public APIs
- Use generics for reusable components
- Follow SOLID principles and design patterns
- Leverage TypeScript utility types (Partial, Pick, Omit, etc.)
- Optimize for type safety, readability, and maintainability
- Use modern ES6+ features`,

  rust: `You are an expert Rust developer. Generate safe, efficient Rust code following these principles:
- Embrace ownership and borrowing principles
- Use Result and Option types for error handling
- Add comprehensive documentation comments (///)
- Follow Rust naming conventions and idioms
- Implement proper error propagation with ? operator
- Use traits and generics for abstraction
- Optimize for memory safety and performance
- Follow the Rust API guidelines
- Include proper lifetime annotations when needed`,

  solidity: `You are an expert Solidity developer. Generate secure, gas-efficient smart contract code following these principles:
- Follow Solidity style guide and best practices
- Implement comprehensive security checks (reentrancy, overflow, access control)
- Use latest stable Solidity version features
- Add NatSpec comments for all public functions
- Optimize for gas efficiency
- Follow checks-effects-interactions pattern
- Use OpenZeppelin libraries when appropriate
- Include proper events for state changes
- Implement access control and modifiers`,

  go: `You are an expert Go developer. Generate idiomatic, efficient Go code following these principles:
- Follow Go conventions and effective Go guidelines
- Implement proper error handling (return error values)
- Add package and function documentation comments
- Use interfaces for abstraction
- Follow the single responsibility principle
- Optimize for simplicity and readability
- Use goroutines and channels appropriately
- Include proper context handling for cancellation
- Follow Go proverbs and best practices`
};

// Input schema
const inputSchema = z.object({
  prompt: z.string().describe('User\'s natural language description of the code to generate'),
  language: z.enum(['python', 'javascript', 'typescript', 'rust', 'solidity', 'go']).describe('Target programming language'),
  context: z.string().optional().describe('Existing code context or related code'),
  projectStructure: z.record(z.any()).optional().describe('Project structure information')
});

// Output schema
const outputSchema = z.object({
  code: z.string().describe('Generated code'),
  language: z.string().describe('Programming language of the generated code'),
  explanation: z.string().describe('Explanation of the generated code'),
  dependencies: z.array(z.string()).describe('List of dependencies required'),
  estimatedComplexity: z.enum(['simple', 'moderate', 'complex']).describe('Estimated complexity of the code')
});

/**
 * Extract code from markdown code blocks
 */
function extractCodeFromMarkdown(text: string): string {
  // Match code blocks with language specifier or without
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
  const matches = [...text.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    // Return the first code block content
    return matches[0][1].trim();
  }
  
  // If no code blocks found, return the original text
  return text.trim();
}

/**
 * Parse dependencies from code based on language
 */
function parseDependencies(code: string, language: string): string[] {
  const dependencies: Set<string> = new Set();
  
  try {
    switch (language) {
      case 'python':
        // Match: import x, from x import y, import x as y
        const pythonImports = code.matchAll(/(?:^|\n)(?:import|from)\s+([a-zA-Z0-9_\.]+)/g);
        for (const match of pythonImports) {
          const pkg = match[1].split('.')[0];
          if (pkg && !['os', 'sys', 'json', 'time', 'datetime', 're', 'math', 'random'].includes(pkg)) {
            dependencies.add(pkg);
          }
        }
        break;
        
      case 'javascript':
      case 'typescript':
        // Match: import x from 'y', require('y')
        const jsImports = code.matchAll(/(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g);
        for (const match of jsImports) {
          const pkg = match[1] || match[2];
          if (pkg && !pkg.startsWith('.') && !pkg.startsWith('/')) {
            // Extract package name (handle scoped packages)
            const pkgName = pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0];
            dependencies.add(pkgName);
          }
        }
        break;
        
      case 'rust':
        // Match: use crate_name::
        const rustUses = code.matchAll(/use\s+([a-zA-Z0-9_]+)(?:::|;)/g);
        for (const match of rustUses) {
          const pkg = match[1];
          if (pkg && !['std', 'core', 'alloc', 'self', 'super', 'crate'].includes(pkg)) {
            dependencies.add(pkg);
          }
        }
        break;
        
      case 'solidity':
        // Match: import "x" or import 'x'
        const solidityImports = code.matchAll(/import\s+['"]([^'"]+)['"]/g);
        for (const match of solidityImports) {
          const pkg = match[1];
          if (pkg.startsWith('@')) {
            const pkgName = pkg.split('/').slice(0, 2).join('/');
            dependencies.add(pkgName);
          }
        }
        break;
        
      case 'go':
        // Match: import "x" or import ( "x" "y" )
        const goImports = code.matchAll(/import\s+(?:\(\s*([\s\S]*?)\s*\)|"([^"]+)")/g);
        for (const match of goImports) {
          if (match[1]) {
            // Multiple imports
            const imports = match[1].matchAll(/"([^"]+)"/g);
            for (const imp of imports) {
              const pkg = imp[1];
              if (!pkg.startsWith('std') && pkg.includes('.')) {
                dependencies.add(pkg);
              }
            }
          } else if (match[2]) {
            // Single import
            const pkg = match[2];
            if (!pkg.startsWith('std') && pkg.includes('.')) {
              dependencies.add(pkg);
            }
          }
        }
        break;
    }
  } catch (error) {
    console.error('Error parsing dependencies:', error);
  }
  
  return Array.from(dependencies);
}

/**
 * Estimate code complexity based on various metrics
 */
function estimateComplexity(code: string): 'simple' | 'moderate' | 'complex' {
  const lines = code.split('\n').filter(line => line.trim().length > 0).length;
  
  // Count complexity indicators
  const complexityIndicators = {
    loops: (code.match(/\b(for|while|forEach|map|filter|reduce)\b/g) || []).length,
    conditionals: (code.match(/\b(if|else|switch|case|\?|match)\b/g) || []).length,
    functions: (code.match(/\b(function|def|fn|func|=>\s*{)\b/g) || []).length,
    classes: (code.match(/\b(class|struct|trait|interface|impl)\b/g) || []).length,
    asyncOps: (code.match(/\b(async|await|Promise|Future|tokio)\b/g) || []).length,
    errorHandling: (code.match(/\b(try|catch|except|Result|Option|Error)\b/g) || []).length,
  };
  
  const totalIndicators = Object.values(complexityIndicators).reduce((a, b) => a + b, 0);
  
  // Complexity scoring
  if (lines < 30 && totalIndicators < 5) {
    return 'simple';
  } else if (lines < 100 && totalIndicators < 15) {
    return 'moderate';
  } else {
    return 'complex';
  }
}

/**
 * Code Generator Tool
 * Generates code in multiple programming languages based on natural language descriptions
 */
export const codeGeneratorTool = createTool({
  id: 'code-generator',
  description: 'Generates code in multiple programming languages based on natural language descriptions with best practices and error handling',
  inputSchema,
  outputSchema,
  
  execute: async ({ context, prompt, language, projectStructure }) => {
    try {
      // Build the system prompt with language-specific guidelines
      const systemPrompt = LANGUAGE_PROMPTS[language];
      
      // Build the user prompt with all context
      let userPrompt = `Generate ${language} code for the following requirement:\n\n${prompt}`;
      
      if (projectStructure) {
        userPrompt += `\n\nProject structure:\n${JSON.stringify(projectStructure, null, 2)}`;
      }
      
      userPrompt += `\n\nProvide:
1. The complete, working code
2. A clear explanation of what the code does
3. Any important notes about usage or implementation

Format your response with the code in a markdown code block.`;
      
      // Generate code using LLM
      const response = await context.llm.generate({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });
      
      const generatedText = response.text || '';
      
      // Extract code from markdown blocks
      const code = extractCodeFromMarkdown(generatedText);
      
      // Parse dependencies
      const dependencies = parseDependencies(code, language);
      
      // Estimate complexity
      const estimatedComplexity = estimateComplexity(code);
      
      // Extract explanation (text outside code blocks or after code)
      let explanation = generatedText.replace(/```[\s\S]*?```/g, '').trim();
      if (!explanation || explanation.length < 20) {
        explanation = `Generated ${language} code based on the provided requirements. The code follows best practices and includes proper error handling.`;
      }
      
      return {
        code,
        language,
        explanation,
        dependencies,
        estimatedComplexity,
      };
      
    } catch (error) {
      console.error('Error generating code:', error);
      
      // Return a fallback response with error information
      return {
        code: `// Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`,
        language,
        explanation: `An error occurred while generating the code: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again with a different prompt or check your configuration.`,
        dependencies: [],
        estimatedComplexity: 'simple' as const,
      };
    }
  },
});
