import { createTool } from '@mastra/core';
import { z } from 'zod';

// Language-specific system prompts
const LANGUAGE_PROMPTS = {
  python: `You are a SENIOR Python Engineer with 15+ years experience. Generate COMPLETE, WORKING Python code that:

🎯 CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (reverse=True)
   - "smallest to biggest" = ASCENDING order (reverse=False)
   - "descending" = largest first
   - "ascending" = smallest first
   - Pay attention to EXACT requirements in the prompt!

✅ MUST follow PEP 8 style guide exactly
✅ MUST include comprehensive docstrings (Google style)
✅ MUST use type hints for ALL functions (Python 3.10+)
✅ MUST have robust error handling (try-except-else-finally)
✅ MUST include input validation
✅ MUST use modern Python features (f-strings, pathlib, dataclasses, match statements)
✅ MUST be optimized for time/space complexity
✅ MUST include example usage in docstrings
✅ NEVER return pseudo-code or templates - ONLY working implementations

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

🎯 CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (sort((a,b) => b-a))
   - "smallest to biggest" = ASCENDING order (sort((a,b) => a-b))
   - "descending" = largest first
   - "ascending" = smallest first
   - Pay attention to EXACT requirements in the prompt!

✅ Uses modern ES2023+ features (async/await, optional chaining, nullish coalescing)
✅ Includes comprehensive JSDoc or TSDoc comments
✅ Has strict TypeScript types (if TypeScript)
✅ Implements proper error boundaries
✅ Uses functional programming patterns where appropriate
✅ Follows Airbnb style guide
✅ Includes input sanitization
✅ Returns COMPLETE working code (no placeholders)

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

🎯 CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (sort((a,b) => b-a))
   - "smallest to biggest" = ASCENDING order (sort((a,b) => a-b))
   - "descending" = largest first
   - "ascending" = smallest first
   - Pay attention to EXACT requirements in the prompt!

✅ Uses strict TypeScript configuration
✅ Includes comprehensive TSDoc comments
✅ Has explicit types for ALL parameters and returns
✅ Implements proper error boundaries
✅ Uses advanced TypeScript features (generics, utility types, conditional types)
✅ Follows Airbnb/Google style guide
✅ Includes input validation
✅ Returns COMPLETE working code (no placeholders)

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

🎯 CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (sort then reverse())
   - "smallest to biggest" = ASCENDING order (sort_unstable())
   - "descending" = largest first
   - "ascending" = smallest first
   - Pay attention to EXACT requirements in the prompt!

✅ Follows Rust 2021 edition best practices
✅ Uses ownership/borrowing correctly
✅ Implements proper error handling (Result<T, E>)
✅ Includes comprehensive documentation comments
✅ Uses traits and generics where appropriate
✅ Is memory-safe and thread-safe
✅ Passes clippy linting
✅ Returns COMPLETE implementations

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

🎯 CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (reverse comparison)
   - "smallest to biggest" = ASCENDING order (normal comparison)
   - "descending" = largest first
   - "ascending" = smallest first
   - Pay attention to EXACT requirements in the prompt!

✅ Follows OpenZeppelin standards
✅ Implements checks-effects-interactions pattern
✅ Uses SafeMath (or Solidity 0.8+ overflow protection)
✅ Includes reentrancy guards
✅ Has NatSpec documentation
✅ Gas-optimized
✅ Access control implemented
✅ Events for all state changes
✅ COMPLETE working contracts

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

🎯 CRITICAL: READ THE USER'S REQUEST CAREFULLY!
   - "biggest to smallest" = DESCENDING order (reverse after sort.Ints)
   - "smallest to biggest" = ASCENDING order (sort.Ints)
   - "descending" = largest first
   - "ascending" = smallest first
   - Pay attention to EXACT requirements in the prompt!

✅ Follows effective Go principles
✅ Uses goroutines and channels correctly
✅ Implements context for cancellation
✅ Has comprehensive error handling
✅ Includes godoc comments
✅ Uses interfaces for abstraction
✅ Is race-condition free
✅ Returns WORKING implementations

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
