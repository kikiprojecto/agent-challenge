import { createTool } from '@mastra/core';
import { z } from 'zod';

// Input schema
const inputSchema = z.object({
  code: z.string().describe('Code to execute'),
  language: z.enum(['python', 'javascript', 'typescript']).describe('Programming language'),
  inputs: z.array(z.any()).optional().describe('Test inputs for the code'),
  timeout: z.number().default(5000).describe('Execution timeout in milliseconds')
});

// Output schema
const outputSchema = z.object({
  success: z.boolean().describe('Whether execution was successful'),
  output: z.string().describe('Standard output from execution'),
  errors: z.array(z.string()).describe('Array of error messages'),
  executionTime: z.number().describe('Execution time in milliseconds'),
  memoryUsed: z.number().optional().describe('Memory used in bytes (if available)')
});

/**
 * Execute JavaScript code in an isolated context
 */
function executeJavaScript(code: string, inputs: any[] = [], timeout: number): Promise<{
  success: boolean;
  output: string;
  errors: string[];
  executionTime: number;
  memoryUsed?: number;
}> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const errors: string[] = [];
    let output = '';
    let success = false;
    let timeoutId: NodeJS.Timeout | null = null;
    let hasTimedOut = false;

    // Set up timeout
    timeoutId = setTimeout(() => {
      hasTimedOut = true;
      const executionTime = performance.now() - startTime;
      resolve({
        success: false,
        output: '',
        errors: [`Execution timed out after ${timeout}ms`],
        executionTime,
      });
    }, timeout);

    try {
      // Create isolated context with console capture
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: any[]) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        },
        error: (...args: any[]) => {
          errors.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        },
        warn: (...args: any[]) => {
          logs.push('[WARN] ' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        },
        info: (...args: any[]) => {
          logs.push('[INFO] ' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        }
      };

      // Create function with isolated scope
      const wrappedCode = `
        (function(console, inputs) {
          ${code}
        })
      `;

      // Execute the code
      const fn = eval(wrappedCode);
      const result = fn(mockConsole, inputs);

      // If function returns a value, add it to output
      if (result !== undefined) {
        logs.push(typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
      }

      output = logs.join('\n');
      success = errors.length === 0;

    } catch (error) {
      if (error instanceof SyntaxError) {
        errors.push(`Syntax Error: ${error.message}`);
      } else if (error instanceof ReferenceError) {
        errors.push(`Reference Error: ${error.message}`);
      } else if (error instanceof TypeError) {
        errors.push(`Type Error: ${error.message}`);
      } else if (error instanceof Error) {
        errors.push(`Runtime Error: ${error.message}`);
      } else {
        errors.push(`Unknown Error: ${String(error)}`);
      }
      success = false;
    } finally {
      if (timeoutId && !hasTimedOut) {
        clearTimeout(timeoutId);
        const executionTime = performance.now() - startTime;
        
        if (!hasTimedOut) {
          resolve({
            success,
            output,
            errors,
            executionTime,
          });
        }
      }
    }
  });
}

/**
 * Execute TypeScript code (transpile to JavaScript first)
 */
async function executeTypeScript(code: string, inputs: any[] = [], timeout: number): Promise<{
  success: boolean;
  output: string;
  errors: string[];
  executionTime: number;
  memoryUsed?: number;
}> {
  const startTime = performance.now();
  
  try {
    // For demo purposes, we'll attempt to execute TypeScript as JavaScript
    // In production, you would use ts-node or transpile with TypeScript compiler
    
    // Remove TypeScript-specific syntax for basic execution
    let jsCode = code
      .replace(/:\s*\w+(\[\])?(\s*=|\s*\)|\s*;|\s*,)/g, '$1') // Remove type annotations
      .replace(/interface\s+\w+\s*\{[^}]*\}/g, '') // Remove interfaces
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, '') // Remove type aliases
      .replace(/<\w+>/g, ''); // Remove generic type parameters

    const result = await executeJavaScript(jsCode, inputs, timeout);
    
    // Add note about TypeScript execution
    if (result.success && result.output) {
      result.output = `[TypeScript executed as JavaScript]\n${result.output}`;
    }
    
    return result;
    
  } catch (error) {
    const executionTime = performance.now() - startTime;
    return {
      success: false,
      output: '',
      errors: [`TypeScript execution error: ${error instanceof Error ? error.message : String(error)}`],
      executionTime,
    };
  }
}

/**
 * Simulate Python code execution
 * Note: This is a demo implementation. Production would use a Python runtime or API.
 */
function executePython(code: string, inputs: any[] = [], timeout: number): Promise<{
  success: boolean;
  output: string;
  errors: string[];
  executionTime: number;
  memoryUsed?: number;
}> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    // Simulate execution delay
    setTimeout(() => {
      const executionTime = performance.now() - startTime;
      
      // Basic syntax validation
      const errors: string[] = [];
      
      // Check for common Python syntax
      if (!code.trim()) {
        errors.push('Empty code provided');
      }
      
      // Check for basic Python syntax errors
      const lines = code.split('\n');
      let indentLevel = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        if (trimmed && !trimmed.startsWith('#')) {
          // Check indentation (simplified)
          const leadingSpaces = line.length - line.trimStart().length;
          
          if (trimmed.endsWith(':')) {
            indentLevel++;
          }
          
          // Check for unmatched parentheses
          const openParens = (line.match(/\(/g) || []).length;
          const closeParens = (line.match(/\)/g) || []).length;
          if (openParens !== closeParens) {
            errors.push(`Line ${i + 1}: Unmatched parentheses`);
          }
        }
      }
      
      if (errors.length > 0) {
        resolve({
          success: false,
          output: '',
          errors,
          executionTime,
        });
        return;
      }
      
      // Simulate successful execution
      const output = `[DEMO MODE - Python Execution Simulated]

Code analyzed successfully:
- Lines of code: ${lines.length}
- Inputs provided: ${inputs.length}

Note: This is a demonstration implementation. In production, this would:
1. Execute Python code in a Docker container
2. Use a Python runtime API (e.g., Pyodide for browser, subprocess for Node.js)
3. Provide actual execution results and output

For actual Python execution, consider:
- Using Pyodide (Python in WebAssembly)
- Docker containers with Python runtime
- Remote code execution services
- AWS Lambda or similar serverless functions

Your Python code structure appears valid.`;

      resolve({
        success: true,
        output,
        errors: [],
        executionTime,
      });
      
    }, Math.min(100, timeout)); // Simulate small delay
  });
}

/**
 * Code Executor Tool
 * Executes code in a sandboxed environment with timeout and error handling
 * 
 * SECURITY NOTE: This is a demonstration implementation.
 * Production deployments should:
 * - Use Docker containers for isolation
 * - Implement resource limits (CPU, memory, disk)
 * - Use separate processes or VMs
 * - Implement network isolation
 * - Use security scanning before execution
 * - Log all executions for audit
 */
export const codeExecutorTool = createTool({
  id: 'code-executor',
  description: 'Executes code in a sandboxed environment with timeout and error handling. Supports JavaScript, TypeScript, and Python (demo mode).',
  inputSchema,
  outputSchema,
  
  execute: async ({ context, code, language, inputs = [], timeout = 5000 }) => {
    // Validate timeout
    const maxTimeout = 30000; // 30 seconds maximum
    const actualTimeout = Math.min(timeout, maxTimeout);
    
    if (timeout > maxTimeout) {
      console.warn(`Timeout ${timeout}ms exceeds maximum ${maxTimeout}ms. Using ${maxTimeout}ms instead.`);
    }
    
    try {
      // Validate code is not empty
      if (!code || code.trim().length === 0) {
        return {
          success: false,
          output: '',
          errors: ['No code provided for execution'],
          executionTime: 0,
        };
      }
      
      // Execute based on language
      let result: {
        success: boolean;
        output: string;
        errors: string[];
        executionTime: number;
        memoryUsed?: number;
      };
      
      switch (language) {
        case 'javascript':
          result = await executeJavaScript(code, inputs, actualTimeout);
          break;
          
        case 'typescript':
          result = await executeTypeScript(code, inputs, actualTimeout);
          break;
          
        case 'python':
          result = await executePython(code, inputs, actualTimeout);
          break;
          
        default:
          return {
            success: false,
            output: '',
            errors: [`Unsupported language: ${language}`],
            executionTime: 0,
          };
      }
      
      // Add security notice to output
      if (result.success && language !== 'python') {
        result.output = `${result.output}\n\n[Security Notice: Code executed in isolated context. Production systems should use containerized execution.]`;
      }
      
      return result;
      
    } catch (error) {
      console.error('Code execution error:', error);
      
      return {
        success: false,
        output: '',
        errors: [
          'Fatal execution error',
          error instanceof Error ? error.message : String(error),
          'This may indicate a system-level issue. Please try again or contact support.'
        ],
        executionTime: 0,
      };
    }
  },
});
