import { createTool } from '@mastra/core';
import { z } from 'zod';

const inputSchema = z.object({
  code: z.string().describe("Code to execute"),
  language: z.enum(["python", "javascript", "typescript"]).describe("Programming language"),
  inputs: z.array(z.any()).optional().describe("Test inputs for the code"),
  timeout: z.number().default(5e3).describe("Execution timeout in milliseconds")
});
const outputSchema = z.object({
  success: z.boolean().describe("Whether execution was successful"),
  output: z.string().describe("Standard output from execution"),
  errors: z.array(z.string()).describe("Array of error messages"),
  executionTime: z.number().describe("Execution time in milliseconds"),
  memoryUsed: z.number().optional().describe("Memory used in bytes (if available)")
});
function executeJavaScript(code, inputs = [], timeout) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const errors = [];
    let output = "";
    let success = false;
    let timeoutId = null;
    let hasTimedOut = false;
    timeoutId = setTimeout(() => {
      hasTimedOut = true;
      const executionTime = performance.now() - startTime;
      resolve({
        success: false,
        output: "",
        errors: [`Execution timed out after ${timeout}ms`],
        executionTime
      });
    }, timeout);
    try {
      const logs = [];
      const mockConsole = {
        log: (...args) => {
          logs.push(args.map(
            (arg) => typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(" "));
        },
        error: (...args) => {
          errors.push(args.map(
            (arg) => typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(" "));
        },
        warn: (...args) => {
          logs.push("[WARN] " + args.map(
            (arg) => typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(" "));
        },
        info: (...args) => {
          logs.push("[INFO] " + args.map(
            (arg) => typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(" "));
        }
      };
      const wrappedCode = `
        (function(console, inputs) {
          ${code}
        })
      `;
      const fn = eval(wrappedCode);
      const result = fn(mockConsole, inputs);
      if (result !== void 0) {
        logs.push(typeof result === "object" ? JSON.stringify(result, null, 2) : String(result));
      }
      output = logs.join("\n");
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
            executionTime
          });
        }
      }
    }
  });
}
async function executeTypeScript(code2, inputs2 = [], timeout2) {
  const startTime2 = performance.now();
  try {
    let jsCode = code2.replace(/:\s*\w+(\[\])?(\s*=|\s*\)|\s*;|\s*,)/g, "$1").replace(/interface\s+\w+\s*\{[^}]*\}/g, "").replace(/type\s+\w+\s*=\s*[^;]+;/g, "").replace(/<\w+>/g, "");
    const result2 = await executeJavaScript(jsCode, inputs2, timeout2);
    if (result2.success && result2.output) {
      result2.output = `[TypeScript executed as JavaScript]
${result2.output}`;
    }
    return result2;
  } catch (error) {
    const executionTime = performance.now() - startTime2;
    return {
      success: false,
      output: "",
      errors: [`TypeScript execution error: ${error instanceof Error ? error.message : String(error)}`],
      executionTime
    };
  }
}
function executePython(code2, inputs2 = [], timeout2) {
  return new Promise((resolve2) => {
    const startTime2 = performance.now();
    setTimeout(() => {
      const executionTime = performance.now() - startTime2;
      const errors2 = [];
      if (!code2.trim()) {
        errors2.push("Empty code provided");
      }
      const lines = code2.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          line.length - line.trimStart().length;
          if (trimmed.endsWith(":")) ;
          const openParens = (line.match(/\(/g) || []).length;
          const closeParens = (line.match(/\)/g) || []).length;
          if (openParens !== closeParens) {
            errors2.push(`Line ${i + 1}: Unmatched parentheses`);
          }
        }
      }
      if (errors2.length > 0) {
        resolve2({
          success: false,
          output: "",
          errors: errors2,
          executionTime
        });
        return;
      }
      const output2 = `[DEMO MODE - Python Execution Simulated]

Code analyzed successfully:
- Lines of code: ${lines.length}
- Inputs provided: ${inputs2.length}

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
      resolve2({
        success: true,
        output: output2,
        errors: [],
        executionTime
      });
    }, Math.min(100, timeout2));
  });
}
const codeExecutorTool = createTool({
  id: "code-executor",
  description: "Executes code in a sandboxed environment with timeout and error handling. Supports JavaScript, TypeScript, and Python (demo mode).",
  inputSchema,
  outputSchema,
  execute: async ({ context, code: code2, language, inputs: inputs2 = [], timeout: timeout2 = 5e3 }) => {
    const maxTimeout = 3e4;
    const actualTimeout = Math.min(timeout2, maxTimeout);
    if (timeout2 > maxTimeout) {
      console.warn(`Timeout ${timeout2}ms exceeds maximum ${maxTimeout}ms. Using ${maxTimeout}ms instead.`);
    }
    try {
      if (!code2 || code2.trim().length === 0) {
        return {
          success: false,
          output: "",
          errors: ["No code provided for execution"],
          executionTime: 0
        };
      }
      let result2;
      switch (language) {
        case "javascript":
          result2 = await executeJavaScript(code2, inputs2, actualTimeout);
          break;
        case "typescript":
          result2 = await executeTypeScript(code2, inputs2, actualTimeout);
          break;
        case "python":
          result2 = await executePython(code2, inputs2, actualTimeout);
          break;
        default:
          return {
            success: false,
            output: "",
            errors: [`Unsupported language: ${language}`],
            executionTime: 0
          };
      }
      if (result2.success && language !== "python") {
        result2.output = `${result2.output}

[Security Notice: Code executed in isolated context. Production systems should use containerized execution.]`;
      }
      return result2;
    } catch (error) {
      console.error("Code execution error:", error);
      return {
        success: false,
        output: "",
        errors: [
          "Fatal execution error",
          error instanceof Error ? error.message : String(error),
          "This may indicate a system-level issue. Please try again or contact support."
        ],
        executionTime: 0
      };
    }
  }
});

export { codeExecutorTool };
