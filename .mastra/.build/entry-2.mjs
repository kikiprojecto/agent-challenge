import { createTool } from '@mastra/core';
import { z } from 'zod';

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
const inputSchema = z.object({
  prompt: z.string().describe("User's natural language description of the code to generate"),
  language: z.enum(["python", "javascript", "typescript", "rust", "solidity", "go"]).describe("Target programming language"),
  context: z.string().optional().describe("Existing code context or related code"),
  projectStructure: z.record(z.any()).optional().describe("Project structure information")
});
const outputSchema = z.object({
  code: z.string().describe("Generated code"),
  language: z.string().describe("Programming language of the generated code"),
  explanation: z.string().describe("Explanation of the generated code"),
  dependencies: z.array(z.string()).describe("List of dependencies required"),
  estimatedComplexity: z.enum(["simple", "moderate", "complex"]).describe("Estimated complexity of the code")
});
function extractCodeFromMarkdown(text) {
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
  inputSchema,
  outputSchema,
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
      const code = extractCodeFromMarkdown(generatedText);
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

export { codeGeneratorTool };
