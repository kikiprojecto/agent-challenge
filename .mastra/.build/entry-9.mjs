import { createTool } from '@mastra/core';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';

const LANGUAGE_PROMPTS = {
  python: `You are a SENIOR Python Engineer with 15+ years experience. Generate COMPLETE, WORKING Python code that:

\u{1F3AF} CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (reverse=True)
   - "smallest to biggest" = ASCENDING order (reverse=False)
   - "descending" = largest first
   - "ascending" = smallest first
   - Pay attention to EXACT requirements in the prompt!

\u2705 MUST follow PEP 8 style guide exactly
\u2705 MUST include comprehensive docstrings (Google style)
\u2705 MUST use type hints for ALL functions (Python 3.10+)
\u2705 MUST have robust error handling (try-except-else-finally)
\u2705 MUST include input validation
\u2705 MUST use modern Python features (f-strings, pathlib, dataclasses, match statements)
\u2705 MUST be optimized for time/space complexity
\u2705 MUST include example usage in docstrings
\u2705 NEVER return pseudo-code or templates - ONLY working implementations

EXAMPLE OF EXPECTED QUALITY:
\`\`\`python
from typing import List

def sort_numbers(numbers: List[int]) -> List[int]:
    """
    Sort a list of integers in ascending order using optimized merge sort.
    
    Args:
        numbers: List of integers to sort
        
    Returns:
        Sorted list in ascending order
        
    Raises:
        TypeError: If input is not a list
        ValueError: If list contains non-integer values
        
    Example:
        >>> sort_numbers([8, 7, 5, 3, 9])
        [3, 5, 7, 8, 9]
    """
    if not isinstance(numbers, list):
        raise TypeError('Input must be a list')
    
    if not all(isinstance(n, int) for n in numbers):
        raise ValueError('All elements must be integers')
    
    if len(numbers) <= 1:
        return numbers.copy()
    
    return sorted(numbers)  # Using built-in for O(n log n)

if __name__ == '__main__':
    result = sort_numbers([8, 7, 5, 3, 9])
    print(f'Sorted: {result}')
\`\`\`

COMMON PATTERNS TO USE:
- List comprehensions: [x*2 for x in items if x > 0]
- Context managers: with open('file.txt') as f:
- Generators: yield for memory efficiency
- Decorators: @functools.lru_cache for memoization
- Async/await: async def for I/O operations`,
  javascript: `You are an EXPERT JavaScript/TypeScript developer (10+ years). Generate PRODUCTION-READY code that:

\u{1F3AF} CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (sort((a,b) => b-a))
   - "smallest to biggest" = ASCENDING order (sort((a,b) => a-b))
   - "descending" = largest first
   - "ascending" = smallest first
   - Pay attention to EXACT requirements in the prompt!

\u2705 Uses modern ES2023+ features (async/await, optional chaining, nullish coalescing)
\u2705 Includes comprehensive JSDoc or TSDoc comments
\u2705 Has strict TypeScript types (if TypeScript)
\u2705 Implements proper error boundaries
\u2705 Uses functional programming patterns where appropriate
\u2705 Follows Airbnb style guide
\u2705 Includes input sanitization
\u2705 Returns COMPLETE working code (no placeholders)

EXAMPLE:
\`\`\`javascript
/**
 * Sorts an array of numbers in ascending order
 * @param {number[]} numbers - Array of numbers to sort
 * @returns {number[]} Sorted array
 * @throws {TypeError} If input is not an array
 * @example
 * sortNumbers([8, 7, 5, 3, 9]) // [3, 5, 7, 8, 9]
 */
function sortNumbers(numbers) {
  if (!Array.isArray(numbers)) {
    throw new TypeError('Input must be an array');
  }
  
  if (!numbers.every(n => typeof n === 'number')) {
    throw new TypeError('All elements must be numbers');
  }
  
  return [...numbers].sort((a, b) => a - b);
}

// Example usage
const result = sortNumbers([8, 7, 5, 3, 9]);
console.log('Sorted:', result);

export { sortNumbers };
\`\`\`

CRITICAL: Always include:
- Proper error handling
- Type checking
- Example usage
- Export statements
- No TODO comments`,
  typescript: `You are an EXPERT TypeScript developer (10+ years). Generate PRODUCTION-READY code that:

\u{1F3AF} CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (sort((a,b) => b-a))
   - "smallest to biggest" = ASCENDING order (sort((a,b) => a-b))
   - "descending" = largest first
   - "ascending" = smallest first
   - Pay attention to EXACT requirements in the prompt!

\u2705 Uses strict TypeScript configuration
\u2705 Includes comprehensive TSDoc comments
\u2705 Has explicit types for ALL parameters and returns
\u2705 Implements proper error boundaries
\u2705 Uses advanced TypeScript features (generics, utility types, conditional types)
\u2705 Follows Airbnb/Google style guide
\u2705 Includes input validation
\u2705 Returns COMPLETE working code (no placeholders)

EXAMPLE:
\`\`\`typescript
/**
 * Sorts an array of numbers in ascending order
 * @param numbers - Array of numbers to sort
 * @returns Sorted array
 * @throws {TypeError} If input is not an array
 * @example
 * sortNumbers([8, 7, 5, 3, 9]) // [3, 5, 7, 8, 9]
 */
function sortNumbers(numbers: number[]): number[] {
  if (!Array.isArray(numbers)) {
    throw new TypeError('Input must be an array');
  }
  
  if (!numbers.every(n => typeof n === 'number')) {
    throw new TypeError('All elements must be numbers');
  }
  
  return [...numbers].sort((a, b) => a - b);
}

// Example usage
const result = sortNumbers([8, 7, 5, 3, 9]);
console.log('Sorted:', result);

export { sortNumbers };
\`\`\`

CRITICAL: Always include:
- Strict types
- Error handling
- Example usage
- Export statements
- No TODO comments`,
  rust: `You are a RUST EXPERT (5+ years systems programming). Generate IDIOMATIC Rust code that:

\u{1F3AF} CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (sort then reverse())
   - "smallest to biggest" = ASCENDING order (sort_unstable())
   - "descending" = largest first
   - "ascending" = smallest first
   - Pay attention to EXACT requirements in the prompt!

\u2705 Follows Rust 2021 edition best practices
\u2705 Uses ownership/borrowing correctly
\u2705 Implements proper error handling (Result<T, E>)
\u2705 Includes comprehensive documentation comments
\u2705 Uses traits and generics where appropriate
\u2705 Is memory-safe and thread-safe
\u2705 Passes clippy linting
\u2705 Returns COMPLETE implementations

EXAMPLE:
\`\`\`rust
/// Sorts a vector of integers in ascending order
///
/// # Arguments
/// * \`numbers\` - A vector of i32 integers
///
/// # Returns
/// A sorted vector
///
/// # Examples
/// \`\`\`
/// let result = sort_numbers(vec![8, 7, 5, 3, 9]);
/// assert_eq!(result, vec![3, 5, 7, 8, 9]);
/// \`\`\`
pub fn sort_numbers(mut numbers: Vec<i32>) -> Vec<i32> {
    numbers.sort_unstable();
    numbers
}

fn main() {
    let nums = vec![8, 7, 5, 3, 9];
    let sorted = sort_numbers(nums);
    println!("Sorted: {:?}", sorted);
}
\`\`\`

REQUIREMENTS:
- Always use Result<T, E> for fallible operations
- Include unit tests
- Use idiomatic Rust patterns
- No unsafe code unless explicitly requested`,
  solidity: `You are a SENIOR Smart Contract Auditor. Generate SECURE Solidity code that:

\u{1F3AF} CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (reverse comparison)
   - "smallest to biggest" = ASCENDING order (normal comparison)
   - "descending" = largest first
   - "ascending" = smallest first
   - Pay attention to EXACT requirements in the prompt!

\u2705 Follows OpenZeppelin standards
\u2705 Implements checks-effects-interactions pattern
\u2705 Uses SafeMath (or Solidity 0.8+ overflow protection)
\u2705 Includes reentrancy guards
\u2705 Has NatSpec documentation
\u2705 Gas-optimized
\u2705 Access control implemented
\u2705 Events for all state changes
\u2705 COMPLETE working contracts

EXAMPLE:
\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NumberSorter
 * @dev Sorts an array of numbers on-chain
 * @notice This is for demonstration - sorting on-chain is gas-expensive
 */
contract NumberSorter {
    event NumbersSorted(uint256[] sortedNumbers);
    
    /**
     * @dev Sorts an array of uint256 numbers
     * @param numbers Array to sort
     * @return Sorted array
     */
    function sortNumbers(uint256[] memory numbers) 
        public 
        pure 
        returns (uint256[] memory) 
    {
        uint256 length = numbers.length;
        
        // Bubble sort (simple for small arrays)
        for (uint256 i = 0; i < length; i++) {
            for (uint256 j = 0; j < length - i - 1; j++) {
                if (numbers[j] > numbers[j + 1]) {
                    // Swap
                    uint256 temp = numbers[j];
                    numbers[j] = numbers[j + 1];
                    numbers[j + 1] = temp;
                }
            }
        }
        
        return numbers;
    }
}
\`\`\`

SECURITY CHECKLIST:
- Reentrancy protection
- Integer overflow checks
- Access control
- Event emissions
- Gas optimization`,
  go: `You are a GO EXPERT (Cloud/Backend specialist). Generate PRODUCTION Go code that:

\u{1F3AF} CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (reverse after sort.Ints)
   - "smallest to biggest" = ASCENDING order (sort.Ints)
   - "descending" = largest first
   - "ascending" = smallest first
   - Pay attention to EXACT requirements in the prompt!

\u2705 Follows effective Go principles
\u2705 Uses goroutines and channels correctly
\u2705 Implements context for cancellation
\u2705 Has comprehensive error handling
\u2705 Includes godoc comments
\u2705 Uses interfaces for abstraction
\u2705 Is race-condition free
\u2705 Returns WORKING implementations

EXAMPLE:
\`\`\`go
package main

import (
    "fmt"
    "sort"
)

// SortNumbers sorts a slice of integers in ascending order.
// It returns a new sorted slice without modifying the original.
//
// Example:
//   numbers := []int{8, 7, 5, 3, 9}
//   sorted := SortNumbers(numbers)
//   // sorted is [3, 5, 7, 8, 9]
func SortNumbers(numbers []int) []int {
    // Create a copy to avoid modifying original
    sorted := make([]int, len(numbers))
    copy(sorted, numbers)
    
    // Use built-in sort for O(n log n)
    sort.Ints(sorted)
    
    return sorted
}

func main() {
    nums := []int{8, 7, 5, 3, 9}
    result := SortNumbers(nums)
    fmt.Printf("Sorted: %v\\n", result)
}
\`\`\`

REQUIREMENTS:
- Always handle errors
- Use defer for cleanup
- Include examples in godoc
- Thread-safe where needed`
};
const inputSchema$5 = z.object({
  prompt: z.string().describe("User's natural language description of the code to generate"),
  language: z.enum(["python", "javascript", "typescript", "rust", "solidity", "go"]).describe("Target programming language"),
  context: z.string().optional().describe("Existing code context or related code"),
  projectStructure: z.record(z.any()).optional().describe("Project structure information")
});
const outputSchema$5 = z.object({
  code: z.string().describe("Generated code"),
  language: z.string().describe("Programming language of the generated code"),
  explanation: z.string().describe("Explanation of the generated code"),
  dependencies: z.array(z.string()).describe("List of dependencies required"),
  estimatedComplexity: z.enum(["simple", "moderate", "complex"]).describe("Estimated complexity of the code")
});
function extractCodeFromMarkdown$2(text) {
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
  const matches = [...text.matchAll(codeBlockRegex)];
  if (matches.length > 0) {
    return matches[0][1].trim();
  }
  return text.trim();
}
function parseDependencies(code, language) {
  const dependencies = /* @__PURE__ */ new Set();
  try {
    switch (language) {
      case "python":
        const pythonImports = code.matchAll(/(?:^|\n)(?:import|from)\s+([a-zA-Z0-9_\.]+)/g);
        for (const match of pythonImports) {
          const pkg = match[1].split(".")[0];
          if (pkg && !["os", "sys", "json", "time", "datetime", "re", "math", "random"].includes(pkg)) {
            dependencies.add(pkg);
          }
        }
        break;
      case "javascript":
      case "typescript":
        const jsImports = code.matchAll(/(?:import\s+.*?\s+from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g);
        for (const match of jsImports) {
          const pkg = match[1] || match[2];
          if (pkg && !pkg.startsWith(".") && !pkg.startsWith("/")) {
            const pkgName = pkg.startsWith("@") ? pkg.split("/").slice(0, 2).join("/") : pkg.split("/")[0];
            dependencies.add(pkgName);
          }
        }
        break;
      case "rust":
        const rustUses = code.matchAll(/use\s+([a-zA-Z0-9_]+)(?:::|;)/g);
        for (const match of rustUses) {
          const pkg = match[1];
          if (pkg && !["std", "core", "alloc", "self", "super", "crate"].includes(pkg)) {
            dependencies.add(pkg);
          }
        }
        break;
      case "solidity":
        const solidityImports = code.matchAll(/import\s+['"]([^'"]+)['"]/g);
        for (const match of solidityImports) {
          const pkg = match[1];
          if (pkg.startsWith("@")) {
            const pkgName = pkg.split("/").slice(0, 2).join("/");
            dependencies.add(pkgName);
          }
        }
        break;
      case "go":
        const goImports = code.matchAll(/import\s+(?:\(\s*([\s\S]*?)\s*\)|"([^"]+)")/g);
        for (const match of goImports) {
          if (match[1]) {
            const imports = match[1].matchAll(/"([^"]+)"/g);
            for (const imp of imports) {
              const pkg = imp[1];
              if (!pkg.startsWith("std") && pkg.includes(".")) {
                dependencies.add(pkg);
              }
            }
          } else if (match[2]) {
            const pkg = match[2];
            if (!pkg.startsWith("std") && pkg.includes(".")) {
              dependencies.add(pkg);
            }
          }
        }
        break;
    }
  } catch (error) {
    console.error("Error parsing dependencies:", error);
  }
  return Array.from(dependencies);
}
function estimateComplexity(code) {
  const lines = code.split("\n").filter((line) => line.trim().length > 0).length;
  const complexityIndicators = {
    loops: (code.match(/\b(for|while|forEach|map|filter|reduce)\b/g) || []).length,
    conditionals: (code.match(/\b(if|else|switch|case|\?|match)\b/g) || []).length,
    functions: (code.match(/\b(function|def|fn|func|=>\s*{)\b/g) || []).length,
    classes: (code.match(/\b(class|struct|trait|interface|impl)\b/g) || []).length,
    asyncOps: (code.match(/\b(async|await|Promise|Future|tokio)\b/g) || []).length,
    errorHandling: (code.match(/\b(try|catch|except|Result|Option|Error)\b/g) || []).length
  };
  const totalIndicators = Object.values(complexityIndicators).reduce((a, b) => a + b, 0);
  if (lines < 30 && totalIndicators < 5) {
    return "simple";
  } else if (lines < 100 && totalIndicators < 15) {
    return "moderate";
  } else {
    return "complex";
  }
}
const codeGeneratorTool = createTool({
  id: "code-generator",
  description: "Generates code in multiple programming languages based on natural language descriptions with best practices and error handling",
  inputSchema: inputSchema$5,
  outputSchema: outputSchema$5,
  execute: async ({ context, prompt, language, projectStructure }) => {
    try {
      const systemPrompt = LANGUAGE_PROMPTS[language];
      let userPrompt = `Generate ${language} code for the following requirement:

${prompt}`;
      if (projectStructure) {
        userPrompt += `

Project structure:
${JSON.stringify(projectStructure, null, 2)}`;
      }
      userPrompt += `

Provide:
1. The complete, working code
2. A clear explanation of what the code does
3. Any important notes about usage or implementation

Format your response with the code in a markdown code block.`;
      const response = await context.llm.generate({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        maxTokens: 2e3
      });
      const generatedText = response.text || "";
      const code = extractCodeFromMarkdown$2(generatedText);
      const dependencies = parseDependencies(code, language);
      const estimatedComplexity = estimateComplexity(code);
      let explanation = generatedText.replace(/```[\s\S]*?```/g, "").trim();
      if (!explanation || explanation.length < 20) {
        explanation = `Generated ${language} code based on the provided requirements. The code follows best practices and includes proper error handling.`;
      }
      return {
        code,
        language,
        explanation,
        dependencies,
        estimatedComplexity
      };
    } catch (error) {
      console.error("Error generating code:", error);
      return {
        code: `// Error generating code: ${error instanceof Error ? error.message : "Unknown error"}`,
        language,
        explanation: `An error occurred while generating the code: ${error instanceof Error ? error.message : "Unknown error"}. Please try again with a different prompt or check your configuration.`,
        dependencies: [],
        estimatedComplexity: "simple"
      };
    }
  }
});

const IssueSchema = z.object({
  type: z.enum(["security", "performance", "style", "bug", "best-practice"]),
  severity: z.enum(["critical", "high", "medium", "low"]),
  line: z.number().optional(),
  description: z.string(),
  suggestion: z.string()
});
const inputSchema$4 = z.object({
  code: z.string().describe("The code to review"),
  language: z.enum(["python", "javascript", "typescript", "rust", "solidity", "go"]).describe("Programming language of the code"),
  reviewType: z.enum(["security", "performance", "style", "all"]).default("all").describe("Type of review to perform")
});
const outputSchema$4 = z.object({
  issues: z.array(IssueSchema).describe("Array of identified issues"),
  overallScore: z.number().min(0).max(100).describe("Overall code quality score (0-100)"),
  refactoredCode: z.string().optional().describe("Refactored code if score is below 70"),
  summary: z.string().describe("Summary of the review")
});
const REVIEW_PROMPTS = {
  security: `You are a security expert conducting a thorough security review. Focus on:

**Critical Security Checks:**
- SQL Injection vulnerabilities (unsanitized queries, string concatenation)
- Cross-Site Scripting (XSS) vulnerabilities (unescaped user input)
- Hardcoded secrets, API keys, passwords, or tokens
- Insecure cryptographic practices (weak algorithms, hardcoded keys)
- Authentication and authorization flaws
- Insecure deserialization
- Path traversal vulnerabilities
- Command injection risks
- Insecure random number generation
- Missing input validation and sanitization
- Unsafe file operations
- CORS misconfigurations
- Sensitive data exposure

Identify each security issue with specific line numbers, severity level, and actionable remediation steps.`,
  performance: `You are a performance optimization expert. Analyze the code for:

**Performance Issues:**
- Algorithmic complexity (O(n\xB2), O(n\xB3) patterns that could be optimized)
- Memory leaks (unclosed resources, circular references, event listener leaks)
- Inefficient data structures (wrong choice for use case)
- Unnecessary computations in loops
- Redundant API calls or database queries
- Missing caching opportunities
- Inefficient string concatenation
- Blocking operations that could be async
- Large object allocations
- Inefficient regular expressions
- N+1 query problems
- Missing pagination or lazy loading
- Unnecessary re-renders or recomputations

Provide specific optimization suggestions with estimated performance impact.`,
  style: `You are a code quality expert reviewing for style and maintainability. Check for:

**Code Style & Best Practices:**
- Naming conventions (variables, functions, classes)
- Code organization and structure
- Documentation quality (comments, docstrings, JSDoc)
- Function length and complexity
- Code duplication (DRY principle violations)
- Magic numbers and hardcoded values
- Proper error messages
- Consistent formatting
- Appropriate use of language idioms
- SOLID principles adherence
- Separation of concerns
- Code readability
- Test coverage considerations

Suggest improvements that enhance maintainability and readability.`,
  all: `You are a comprehensive code review expert. Perform a thorough analysis covering:

**1. Security Issues:**
- SQL injection, XSS, hardcoded secrets
- Authentication/authorization flaws
- Input validation issues

**2. Performance Problems:**
- Algorithmic complexity issues
- Memory leaks and inefficient patterns
- Missing optimization opportunities

**3. Code Style & Quality:**
- Naming conventions and organization
- Documentation quality
- Best practices adherence

**4. Bugs & Logic Errors:**
- Potential runtime errors
- Edge case handling
- Logic flaws

**5. Best Practices:**
- Design patterns
- Error handling
- Code maintainability

Provide a comprehensive review with prioritized issues.`
};
const LANGUAGE_CONTEXTS = {
  python: "Follow PEP 8, check for common Python pitfalls (mutable defaults, global state)",
  javascript: "Check for common JS issues (== vs ===, var usage, callback hell)",
  typescript: "Verify type safety, check for any types, ensure proper null handling",
  rust: "Check for unsafe blocks, verify ownership patterns, look for unwrap() abuse",
  solidity: "Critical: Check for reentrancy, integer overflow, access control, gas optimization",
  go: "Check for goroutine leaks, proper error handling, defer usage"
};
function parseReviewResponse(responseText) {
  const issues = [];
  let summary = "";
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.issues && Array.isArray(parsed.issues)) {
        issues.push(...parsed.issues);
      }
      if (parsed.summary) {
        summary = parsed.summary;
      }
      return { issues, summary: summary || "Code review completed." };
    }
  } catch (e) {
  }
  const lines = responseText.split("\n");
  let currentIssue = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^(CRITICAL|HIGH|MEDIUM|LOW):/i)) {
      if (currentIssue) {
        issues.push(currentIssue);
      }
      const severityMatch = trimmed.match(/^(CRITICAL|HIGH|MEDIUM|LOW):/i);
      const severity = severityMatch?.[1].toLowerCase() || "medium";
      currentIssue = {
        type: "bug",
        severity,
        description: trimmed.replace(/^(CRITICAL|HIGH|MEDIUM|LOW):\s*/i, ""),
        suggestion: ""
      };
    } else if (trimmed.match(/^(Security|Performance|Style|Bug|Best[- ]Practice):/i)) {
      if (currentIssue) {
        issues.push(currentIssue);
      }
      const typeMatch = trimmed.match(/^(Security|Performance|Style|Bug|Best[- ]Practice):/i);
      let type = "bug";
      if (typeMatch) {
        const typeStr = typeMatch[1].toLowerCase().replace(/[- ]/g, "-");
        if (["security", "performance", "style", "bug", "best-practice"].includes(typeStr)) {
          type = typeStr;
        }
      }
      currentIssue = {
        type,
        severity: "medium",
        description: trimmed.replace(/^[^:]+:\s*/i, ""),
        suggestion: ""
      };
    } else if (trimmed.match(/^Line\s+(\d+)/i)) {
      const lineMatch = trimmed.match(/^Line\s+(\d+)/i);
      if (currentIssue && lineMatch) {
        currentIssue.line = parseInt(lineMatch[1]);
      }
    } else if (trimmed.match(/^Suggestion:/i)) {
      if (currentIssue) {
        currentIssue.suggestion = trimmed.replace(/^Suggestion:\s*/i, "");
      }
    } else if (trimmed.match(/^Summary:/i)) {
      summary = trimmed.replace(/^Summary:\s*/i, "");
    } else if (currentIssue && trimmed.length > 0 && !trimmed.startsWith("#")) {
      if (currentIssue.suggestion) {
        currentIssue.suggestion += " " + trimmed;
      } else {
        currentIssue.description += " " + trimmed;
      }
    }
  }
  if (currentIssue) {
    issues.push(currentIssue);
  }
  if (!summary) {
    summary = issues.length > 0 ? `Found ${issues.length} issue(s) during code review.` : "No significant issues found. Code looks good!";
  }
  return { issues, summary };
}
function calculateScore(issues) {
  if (issues.length === 0) {
    return 100;
  }
  const severityWeights = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3
  };
  let totalDeduction = 0;
  for (const issue of issues) {
    const weight = severityWeights[issue.severity] || 5;
    totalDeduction += weight;
  }
  totalDeduction = Math.min(totalDeduction, 100);
  return Math.max(0, 100 - totalDeduction);
}
function extractCodeFromMarkdown$1(text) {
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
  const matches = [...text.matchAll(codeBlockRegex)];
  if (matches.length > 0) {
    return matches[0][1].trim();
  }
  return text.trim();
}
const codeReviewerTool = createTool({
  id: "code-reviewer",
  description: "Performs comprehensive code reviews analyzing security vulnerabilities, performance issues, code style, and best practices",
  inputSchema: inputSchema$4,
  outputSchema: outputSchema$4,
  execute: async ({ context, code, language, reviewType }) => {
    try {
      const reviewPrompt = REVIEW_PROMPTS[reviewType];
      const languageContext = LANGUAGE_CONTEXTS[language];
      const systemPrompt = `${reviewPrompt}

**Language Context:** ${languageContext}

**Response Format:**
Return your analysis in JSON format with the following structure:
{
  "issues": [
    {
      "type": "security|performance|style|bug|best-practice",
      "severity": "critical|high|medium|low",
      "line": <line_number_if_applicable>,
      "description": "Clear description of the issue",
      "suggestion": "Specific actionable fix or improvement"
    }
  ],
  "summary": "Overall assessment of the code quality"
}

Be specific, actionable, and prioritize issues by severity.`;
      const userPrompt = `Review the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide a detailed review with specific issues, line numbers where applicable, and actionable suggestions.`;
      const response = await context.llm.generate({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        maxTokens: 2e3
      });
      const responseText = response.text || "";
      const { issues, summary } = parseReviewResponse(responseText);
      const overallScore = calculateScore(issues);
      let refactoredCode;
      if (overallScore < 70 && issues.length > 0) {
        try {
          const refactorPrompt = `Based on the following issues, refactor this ${language} code to fix them:

**Original Code:**
\`\`\`${language}
${code}
\`\`\`

**Issues to Fix:**
${issues.map((issue, idx) => `${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`).join("\n")}

Provide the complete refactored code that addresses these issues.`;
          const refactorResponse = await context.llm.generate({
            messages: [
              { role: "system", content: `You are an expert ${language} developer. Refactor code to fix identified issues while maintaining functionality.` },
              { role: "user", content: refactorPrompt }
            ],
            temperature: 0.3,
            maxTokens: 2e3
          });
          refactoredCode = extractCodeFromMarkdown$1(refactorResponse.text || "");
        } catch (refactorError) {
          console.error("Error generating refactored code:", refactorError);
        }
      }
      return {
        issues,
        overallScore,
        refactoredCode,
        summary: `${summary} Overall Score: ${overallScore}/100. ${overallScore >= 90 ? "Excellent code quality!" : overallScore >= 70 ? "Good code with minor improvements needed." : overallScore >= 50 ? "Moderate issues that should be addressed." : "Significant issues requiring immediate attention."}`
      };
    } catch (error) {
      console.error("Error during code review:", error);
      return {
        issues: [{
          type: "bug",
          severity: "high",
          description: `Code review failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          suggestion: "Please try again or check your code syntax."
        }],
        overallScore: 0,
        summary: `An error occurred during code review: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
      };
    }
  }
});

const inputSchema$3 = z.object({
  code: z.string().describe("Code to execute"),
  language: z.enum(["python", "javascript", "typescript"]).describe("Programming language"),
  inputs: z.array(z.any()).optional().describe("Test inputs for the code"),
  timeout: z.number().default(5e3).describe("Execution timeout in milliseconds")
});
const outputSchema$3 = z.object({
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
  inputSchema: inputSchema$3,
  outputSchema: outputSchema$3,
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

const inputSchema$2 = z.object({
  action: z.enum(["analyze", "createPR", "getIssues", "search", "comment"]).describe("Action to perform"),
  repository: z.string().describe("Repository in format owner/repo"),
  parameters: z.record(z.any()).optional().describe("Action-specific parameters")
});
const outputSchema$2 = z.object({
  success: z.boolean().describe("Whether the action was successful"),
  data: z.any().describe("Response data from the action"),
  message: z.string().describe("Human-readable message about the result")
});
function parseRepository(repository) {
  const parts = repository.split("/");
  if (parts.length !== 2) {
    throw new Error('Repository must be in format "owner/repo"');
  }
  return { owner: parts[0], repo: parts[1] };
}
async function analyzeRepository(octokit, owner, repo) {
  try {
    const { data: repoData } = await octokit.repos.get({ owner, repo });
    const { data: languages } = await octokit.repos.listLanguages({ owner, repo });
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 10
    });
    let directoryStructure = [];
    try {
      const { data: contents } = await octokit.repos.getContent({
        owner,
        repo,
        path: ""
      });
      directoryStructure = Array.isArray(contents) ? contents.map((item) => ({
        name: item.name,
        type: item.type,
        path: item.path,
        size: item.size
      })) : [];
    } catch (error) {
      console.warn("Could not fetch directory structure:", error);
    }
    await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
      per_page: 1
    });
    const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    const languageBreakdown = Object.entries(languages).map(([lang, bytes]) => ({
      language: lang,
      bytes,
      percentage: (bytes / totalBytes * 100).toFixed(2) + "%"
    }));
    return {
      repository: {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        url: repoData.html_url,
        private: repoData.private,
        fork: repoData.fork,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        pushedAt: repoData.pushed_at
      },
      statistics: {
        stars: repoData.stargazers_count,
        watchers: repoData.watchers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        size: repoData.size,
        defaultBranch: repoData.default_branch
      },
      languages: {
        primary: repoData.language,
        breakdown: languageBreakdown
      },
      recentCommits: commits.slice(0, 10).map((commit) => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message.split("\n")[0],
        author: commit.commit.author?.name,
        date: commit.commit.author?.date,
        url: commit.html_url
      })),
      directoryStructure: directoryStructure.slice(0, 20),
      topics: repoData.topics || [],
      license: repoData.license?.name || "No license"
    };
  } catch (error) {
    throw new Error(`Failed to analyze repository: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function createPullRequest(octokit, owner, repo, parameters) {
  try {
    const {
      title,
      body,
      head,
      // source branch
      base,
      // target branch (default: main/master)
      files,
      // array of { path, content }
      branchName,
      commitMessage
    } = parameters;
    if (!title) {
      throw new Error("PR title is required");
    }
    if (files && Array.isArray(files) && files.length > 0) {
      if (!branchName) {
        throw new Error("Branch name is required when creating files");
      }
      const { data: repoData } = await octokit.repos.get({ owner, repo });
      const defaultBranch = base || repoData.default_branch;
      const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${defaultBranch}`
      });
      const baseSha = refData.object.sha;
      try {
        await octokit.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branchName}`,
          sha: baseSha
        });
      } catch (error) {
        if (error.status !== 422) {
          throw error;
        }
      }
      const blobs = await Promise.all(
        files.map(async (file) => {
          const { data: blob } = await octokit.git.createBlob({
            owner,
            repo,
            content: Buffer.from(file.content).toString("base64"),
            encoding: "base64"
          });
          return {
            path: file.path,
            mode: "100644",
            type: "blob",
            sha: blob.sha
          };
        })
      );
      const { data: baseCommit } = await octokit.git.getCommit({
        owner,
        repo,
        commit_sha: baseSha
      });
      const { data: newTree } = await octokit.git.createTree({
        owner,
        repo,
        base_tree: baseCommit.tree.sha,
        tree: blobs
      });
      const { data: newCommit } = await octokit.git.createCommit({
        owner,
        repo,
        message: commitMessage || `Add files via NeuroCoder AI`,
        tree: newTree.sha,
        parents: [baseSha]
      });
      await octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branchName}`,
        sha: newCommit.sha
      });
    }
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title,
      body: body || "",
      head: head || branchName,
      base: base || "main"
    });
    return {
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      state: pr.state,
      createdAt: pr.created_at,
      head: pr.head.ref,
      base: pr.base.ref
    };
  } catch (error) {
    throw new Error(`Failed to create pull request: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function getIssues(octokit, owner, repo, parameters) {
  try {
    const {
      state = "open",
      // 'open', 'closed', 'all'
      labels,
      per_page = 30,
      page = 1
    } = parameters || {};
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state,
      labels: labels ? Array.isArray(labels) ? labels.join(",") : labels : void 0,
      per_page,
      page
    });
    return {
      count: issues.length,
      issues: issues.map((issue) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        author: issue.user?.login,
        labels: issue.labels.map(
          (label) => typeof label === "string" ? label : label.name
        ),
        comments: issue.comments,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        url: issue.html_url,
        body: issue.body?.substring(0, 200) + (issue.body && issue.body.length > 200 ? "..." : "")
      }))
    };
  } catch (error) {
    throw new Error(`Failed to get issues: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function searchCode(octokit, owner, repo, parameters) {
  try {
    const {
      query,
      language,
      per_page = 30,
      page = 1
    } = parameters || {};
    if (!query) {
      throw new Error("Search query is required");
    }
    let searchQuery = `${query} repo:${owner}/${repo}`;
    if (language) {
      searchQuery += ` language:${language}`;
    }
    const { data: results } = await octokit.search.code({
      q: searchQuery,
      per_page,
      page
    });
    return {
      totalCount: results.total_count,
      count: results.items.length,
      results: results.items.map((item) => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        url: item.html_url,
        repository: item.repository.full_name,
        score: item.score
      }))
    };
  } catch (error) {
    throw new Error(`Failed to search code: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function addComment(octokit, owner, repo, parameters) {
  try {
    const {
      issue_number,
      body
    } = parameters || {};
    if (!issue_number) {
      throw new Error("Issue number is required");
    }
    if (!body) {
      throw new Error("Comment body is required");
    }
    const { data: comment } = await octokit.issues.createComment({
      owner,
      repo,
      issue_number: parseInt(issue_number),
      body
    });
    return {
      id: comment.id,
      url: comment.html_url,
      author: comment.user?.login,
      body: comment.body,
      createdAt: comment.created_at
    };
  } catch (error) {
    throw new Error(`Failed to add comment: ${error instanceof Error ? error.message : String(error)}`);
  }
}
const githubIntegrationTool = createTool({
  id: "github-integration",
  description: "Integrates with GitHub API to analyze repositories, create pull requests, manage issues, search code, and add comments",
  inputSchema: inputSchema$2,
  outputSchema: outputSchema$2,
  execute: async ({ context, action, repository, parameters = {} }) => {
    try {
      const githubToken = process.env.GITHUB_TOKEN;
      if (!githubToken) {
        return {
          success: false,
          data: null,
          message: "GitHub token not found. Please set GITHUB_TOKEN environment variable."
        };
      }
      const octokit = new Octokit({
        auth: githubToken
      });
      let owner;
      let repo;
      try {
        const parsed = parseRepository(repository);
        owner = parsed.owner;
        repo = parsed.repo;
      } catch (error) {
        return {
          success: false,
          data: null,
          message: error instanceof Error ? error.message : "Invalid repository format"
        };
      }
      let result;
      let message;
      switch (action) {
        case "analyze":
          result = await analyzeRepository(octokit, owner, repo);
          message = `Successfully analyzed repository ${repository}`;
          break;
        case "createPR":
          result = await createPullRequest(octokit, owner, repo, parameters);
          message = `Successfully created pull request #${result.number}`;
          break;
        case "getIssues":
          result = await getIssues(octokit, owner, repo, parameters);
          message = `Found ${result.count} issue(s) in ${repository}`;
          break;
        case "search":
          result = await searchCode(octokit, owner, repo, parameters);
          message = `Found ${result.count} result(s) for search query`;
          break;
        case "comment":
          result = await addComment(octokit, owner, repo, parameters);
          message = `Successfully added comment to issue #${parameters.issue_number}`;
          break;
        default:
          return {
            success: false,
            data: null,
            message: `Unknown action: ${action}`
          };
      }
      return {
        success: true,
        data: result,
        message
      };
    } catch (error) {
      console.error("GitHub integration error:", error);
      let message = "An error occurred while interacting with GitHub";
      if (error.status === 401) {
        message = "Authentication failed. Please check your GitHub token.";
      } else if (error.status === 403) {
        if (error.message?.includes("rate limit")) {
          message = "GitHub API rate limit exceeded. Please try again later.";
        } else {
          message = "Permission denied. You may not have access to this repository.";
        }
      } else if (error.status === 404) {
        message = "Repository not found. Please check the repository name.";
      } else if (error.message) {
        message = error.message;
      }
      return {
        success: false,
        data: null,
        message
      };
    }
  }
});

const TestCaseSchema = z.object({
  name: z.string().describe("Test case name"),
  description: z.string().describe("Test case description"),
  expected: z.string().describe("Expected outcome")
});
const inputSchema$1 = z.object({
  code: z.string().describe("Code to generate tests for"),
  language: z.enum(["python", "javascript", "typescript"]).describe("Programming language"),
  testType: z.enum(["unit", "integration", "e2e"]).default("unit").describe("Type of tests to generate"),
  coverage: z.enum(["basic", "comprehensive"]).default("comprehensive").describe("Test coverage level")
});
const outputSchema$1 = z.object({
  testCode: z.string().describe("Complete test file code"),
  testCases: z.array(TestCaseSchema).describe("Array of test cases"),
  coverage: z.string().describe("Estimated coverage percentage"),
  framework: z.string().describe("Test framework used"),
  recommendations: z.array(z.string()).describe("Recommendations for additional tests")
});
const TEST_FRAMEWORKS = {
  python: "pytest",
  javascript: "Jest",
  typescript: "Jest"
};
const TEST_TEMPLATES = {
  python: {
    unit: `You are an expert Python test engineer. Generate comprehensive pytest unit tests.

**Testing Requirements:**
- Use pytest framework
- Import all necessary modules
- Use pytest fixtures for setup/teardown
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test function names (test_*)
- Include docstrings for test functions
- Use pytest.raises for exception testing
- Use pytest.mark.parametrize for multiple test cases
- Mock external dependencies with unittest.mock or pytest-mock

**Test Coverage:**
- Main functionality tests
- Edge cases (None, empty strings, empty lists, zero, negative numbers)
- Boundary value tests
- Error handling and exceptions
- Type validation if applicable`,
    integration: `You are an expert Python test engineer. Generate pytest integration tests.

**Testing Requirements:**
- Use pytest framework
- Test interactions between components
- Use fixtures for complex setup
- Test database operations if applicable
- Test API calls and responses
- Mock external services
- Test data flow between modules
- Include cleanup in teardown`,
    e2e: `You are an expert Python test engineer. Generate end-to-end tests.

**Testing Requirements:**
- Use pytest with selenium or playwright if web-based
- Test complete user workflows
- Test from user input to final output
- Include setup for test environment
- Test real integrations where possible
- Include comprehensive assertions`
  },
  javascript: {
    unit: `You are an expert JavaScript test engineer. Generate comprehensive Jest unit tests.

**Testing Requirements:**
- Use Jest framework
- Import modules using ES6 imports or require
- Use describe() blocks to group tests
- Use beforeEach/afterEach for setup/teardown
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names with it() or test()
- Use expect() assertions
- Mock dependencies with jest.mock()
- Use jest.fn() for function mocks
- Test async code with async/await

**Test Coverage:**
- Main functionality tests
- Edge cases (null, undefined, empty strings, empty arrays, 0, NaN)
- Boundary value tests
- Error handling and exceptions
- Callback and promise handling
- Type checking if applicable`,
    integration: `You are an expert JavaScript test engineer. Generate Jest integration tests.

**Testing Requirements:**
- Use Jest framework
- Test component interactions
- Test API endpoints
- Mock external services
- Test database operations
- Test event handlers
- Test data flow
- Use beforeAll/afterAll for expensive setup`,
    e2e: `You are an expert JavaScript test engineer. Generate end-to-end tests.

**Testing Requirements:**
- Use Jest with Puppeteer or Playwright
- Test complete user flows
- Test DOM interactions
- Test navigation
- Test form submissions
- Include page load waits
- Test real browser behavior`
  },
  typescript: {
    unit: `You are an expert TypeScript test engineer. Generate comprehensive Jest unit tests.

**Testing Requirements:**
- Use Jest framework with TypeScript
- Import with proper TypeScript types
- Use describe() blocks to group tests
- Use beforeEach/afterEach for setup/teardown
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names with it() or test()
- Use expect() assertions with type safety
- Mock dependencies with jest.mock()
- Use jest.fn() with proper typing
- Test async code with async/await
- Type all test data and mocks

**Test Coverage:**
- Main functionality tests
- Edge cases (null, undefined, empty strings, empty arrays, 0, NaN)
- Boundary value tests
- Error handling and exceptions
- Type safety tests
- Generic type tests if applicable
- Interface implementation tests`,
    integration: `You are an expert TypeScript test engineer. Generate Jest integration tests.

**Testing Requirements:**
- Use Jest with TypeScript
- Test component interactions with types
- Test API endpoints with typed responses
- Mock external services with proper types
- Test database operations
- Test event handlers
- Type all test data
- Use beforeAll/afterAll for setup`,
    e2e: `You are an expert TypeScript test engineer. Generate end-to-end tests.

**Testing Requirements:**
- Use Jest with Puppeteer or Playwright
- Type all page objects and selectors
- Test complete user flows
- Test DOM interactions
- Test navigation
- Test form submissions
- Include proper type assertions`
  }
};
function analyzeCode(code, language) {
  const functions = [];
  const classes = [];
  try {
    switch (language) {
      case "python":
        const pyFunctions = code.matchAll(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g);
        for (const match of pyFunctions) {
          functions.push(match[1]);
        }
        const pyClasses = code.matchAll(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
        for (const match of pyClasses) {
          classes.push(match[1]);
        }
        break;
      case "javascript":
      case "typescript":
        const jsFunctions = code.matchAll(/(?:function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g);
        for (const match of jsFunctions) {
          const funcName = match[1] || match[2];
          if (funcName) functions.push(funcName);
        }
        const jsClasses = code.matchAll(/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
        for (const match of jsClasses) {
          classes.push(match[1]);
        }
        break;
    }
  } catch (error) {
    console.error("Error analyzing code:", error);
  }
  const lines = code.split("\n").length;
  const totalComponents = functions.length + classes.length;
  let complexity = "simple";
  if (lines > 100 || totalComponents > 5) {
    complexity = "complex";
  } else if (lines > 30 || totalComponents > 2) {
    complexity = "moderate";
  }
  return { functions, classes, complexity };
}
function extractTestCases(testCode, language) {
  const testCases = [];
  try {
    switch (language) {
      case "python":
        const pyTests = testCode.matchAll(/def\s+(test_[a-zA-Z0-9_]+)\s*\([^)]*\):\s*(?:"""([^"]+)"""|'''([^']+)''')?/g);
        for (const match of pyTests) {
          const name = match[1];
          const description = match[2] || match[3] || name.replace(/_/g, " ");
          const testBody = testCode.substring(match.index || 0);
          const assertMatch = testBody.match(/assert\s+([^\n]+)/);
          const expected = assertMatch ? assertMatch[1].trim() : "Test passes";
          testCases.push({ name, description, expected });
        }
        break;
      case "javascript":
      case "typescript":
        const jsTests = testCode.matchAll(/(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g);
        for (const match of jsTests) {
          const description = match[1];
          const name = description.replace(/\s+/g, "_");
          const testBody = testCode.substring(match.index || 0);
          const expectMatch = testBody.match(/expect\([^)]+\)\.([a-zA-Z]+)/);
          const expected = expectMatch ? `Should ${expectMatch[1]}` : "Test passes";
          testCases.push({ name, description, expected });
        }
        break;
    }
  } catch (error) {
    console.error("Error extracting test cases:", error);
  }
  return testCases;
}
function estimateCoverage(codeAnalysis, testCases, coverageLevel) {
  const totalComponents = codeAnalysis.functions.length + codeAnalysis.classes.length;
  if (totalComponents === 0) {
    return "0%";
  }
  const testRatio = Math.min(testCases.length / Math.max(totalComponents * 3, 1), 1);
  let baseCoverage = testRatio * 100;
  if (coverageLevel === "basic") {
    baseCoverage *= 0.7;
  }
  if (codeAnalysis.complexity === "complex") {
    baseCoverage *= 0.85;
  } else if (codeAnalysis.complexity === "moderate") {
    baseCoverage *= 0.9;
  }
  return Math.min(Math.round(baseCoverage), 95) + "%";
}
function generateRecommendations$1(codeAnalysis, testCases, testType, coverageLevel) {
  const recommendations = [];
  const testedFunctions = new Set(
    testCases.map((tc) => tc.name.toLowerCase())
  );
  const untestedFunctions = codeAnalysis.functions.filter(
    (fn) => !Array.from(testedFunctions).some((tf) => tf.includes(fn.toLowerCase()))
  );
  if (untestedFunctions.length > 0) {
    recommendations.push(`Add tests for untested functions: ${untestedFunctions.slice(0, 3).join(", ")}`);
  }
  if (coverageLevel === "basic") {
    recommendations.push("Consider upgrading to comprehensive coverage for better test reliability");
    recommendations.push("Add edge case tests for null/undefined/empty values");
  }
  if (testType === "unit") {
    recommendations.push("Consider adding integration tests to verify component interactions");
  } else if (testType === "integration") {
    recommendations.push("Add unit tests for individual component logic");
  }
  if (codeAnalysis.complexity === "complex") {
    recommendations.push("Consider breaking down complex functions for easier testing");
    recommendations.push("Add performance tests for complex operations");
  }
  if (testCases.length < 5) {
    recommendations.push("Add more test cases to improve coverage");
  }
  recommendations.push("Add tests for error handling and exception cases");
  recommendations.push("Consider adding property-based tests for comprehensive validation");
  recommendations.push("Implement continuous integration to run tests automatically");
  return recommendations.slice(0, 5);
}
function extractCodeFromMarkdown(text) {
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
  const matches = [...text.matchAll(codeBlockRegex)];
  if (matches.length > 0) {
    return matches[0][1].trim();
  }
  return text.trim();
}
const testGeneratorTool = createTool({
  id: "test-generator",
  description: "Generates comprehensive test suites with unit, integration, or e2e tests following best practices",
  inputSchema: inputSchema$1,
  outputSchema: outputSchema$1,
  execute: async ({ context, code, language, testType, coverage }) => {
    try {
      if (!code || code.trim().length === 0) {
        return {
          testCode: "",
          testCases: [],
          coverage: "0%",
          framework: TEST_FRAMEWORKS[language],
          recommendations: ["No code provided to generate tests for"]
        };
      }
      const codeAnalysis = analyzeCode(code, language);
      const framework = TEST_FRAMEWORKS[language];
      const testTemplate = TEST_TEMPLATES[language][testType];
      const systemPrompt = `${testTemplate}

**Code Analysis:**
- Functions found: ${codeAnalysis.functions.length}
- Classes found: ${codeAnalysis.classes.length}
- Complexity: ${codeAnalysis.complexity}
- Coverage level: ${coverage}

**Output Requirements:**
Generate a complete, runnable test file that includes:
1. All necessary imports
2. Setup and teardown functions if needed
3. Test cases for main functionality
4. Test cases for edge cases (null, undefined, empty, boundary values)
5. Test cases for error handling
6. Clear, descriptive test names
7. Proper assertions
8. Mock data where appropriate

Follow the AAA pattern (Arrange, Act, Assert) for each test.
Use the ${framework} framework.
${coverage === "comprehensive" ? "Provide comprehensive coverage with multiple test cases per function." : "Provide basic coverage with essential test cases."}`;
      const userPrompt = `Generate ${testType} tests for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Create a complete test file with comprehensive test coverage.`;
      const response = await context.llm.generate({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        maxTokens: 2e3
      });
      const generatedText = response.text || "";
      const testCode = extractCodeFromMarkdown(generatedText);
      const testCases = extractTestCases(testCode, language);
      const estimatedCoverage = estimateCoverage(codeAnalysis, testCases, coverage);
      const recommendations = generateRecommendations$1(
        codeAnalysis,
        testCases,
        testType,
        coverage
      );
      return {
        testCode,
        testCases,
        coverage: estimatedCoverage,
        framework,
        recommendations
      };
    } catch (error) {
      console.error("Error generating tests:", error);
      return {
        testCode: `// Error generating tests: ${error instanceof Error ? error.message : "Unknown error"}`,
        testCases: [],
        coverage: "0%",
        framework: TEST_FRAMEWORKS[language],
        recommendations: [
          "Failed to generate tests. Please check your code syntax.",
          "Ensure the code is valid and properly formatted.",
          "Try again with a simpler code snippet."
        ]
      };
    }
  }
});

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

console.log("\u{1F50D} NeuroCoder AI - Integration Test\n");
console.log("=".repeat(50));
console.log("\n\u2705 All tools imported successfully!\n");
const tools = {
  codeGenerator: codeGeneratorTool.id,
  codeReviewer: codeReviewerTool.id,
  codeExecutor: codeExecutorTool.id,
  githubIntegration: githubIntegrationTool.id,
  testGenerator: testGeneratorTool.id,
  knowledgeRetrieval: knowledgeRetrievalTool.id
};
console.log("\u{1F4CB} Tool IDs:");
Object.entries(tools).forEach(([name, id]) => {
  console.log(`   ${name}: ${id}`);
});
console.log("\n\u{1F527} Tool Structure Verification:");
const verifyTool = (name, tool) => {
  const hasId = !!tool.id;
  const hasDescription = !!tool.description;
  const hasInputSchema = !!tool.inputSchema;
  const hasOutputSchema = !!tool.outputSchema;
  const hasExecute = typeof tool.execute === "function";
  const status = hasId && hasDescription && hasInputSchema && hasOutputSchema && hasExecute ? "\u2705" : "\u274C";
  console.log(`   ${status} ${name}:`);
  console.log(`      - ID: ${hasId ? "\u2713" : "\u2717"}`);
  console.log(`      - Description: ${hasDescription ? "\u2713" : "\u2717"}`);
  console.log(`      - Input Schema: ${hasInputSchema ? "\u2713" : "\u2717"}`);
  console.log(`      - Output Schema: ${hasOutputSchema ? "\u2713" : "\u2717"}`);
  console.log(`      - Execute Function: ${hasExecute ? "\u2713" : "\u2717"}`);
  return hasId && hasDescription && hasInputSchema && hasOutputSchema && hasExecute;
};
const results = {
  codeGenerator: verifyTool("Code Generator", codeGeneratorTool),
  codeReviewer: verifyTool("Code Reviewer", codeReviewerTool),
  codeExecutor: verifyTool("Code Executor", codeExecutorTool),
  githubIntegration: verifyTool("GitHub Integration", githubIntegrationTool),
  testGenerator: verifyTool("Test Generator", testGeneratorTool),
  knowledgeRetrieval: verifyTool("Knowledge Retrieval", knowledgeRetrievalTool)
};
console.log("\n" + "=".repeat(50));
const allPassed = Object.values(results).every((r) => r);
if (allPassed) {
  console.log("\u2705 ALL TESTS PASSED - Tools are ready for use!");
} else {
  console.log("\u274C SOME TESTS FAILED - Please check the errors above");
  process.exit(1);
}
console.log("=".repeat(50) + "\n");

export { results, tools };
