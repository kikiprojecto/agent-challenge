/**
 * Validates that generated code is NOT a template/placeholder
 * Ensures production-ready, working implementations
 */

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  score: number;
  suggestions: string[];
}

/**
 * Validates code quality to ensure it's not a template
 */
export function validateCodeQuality(code: string, language: string): ValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check for template indicators (CRITICAL)
  const templatePatterns = [
    { pattern: /\/\/\s*TODO/gi, penalty: 30, message: 'Contains TODO comments' },
    { pattern: /\/\*\*[\s\S]*?TODO[\s\S]*?\*\//gi, penalty: 30, message: 'Contains TODO in documentation' },
    { pattern: /Add your logic here/gi, penalty: 40, message: 'Contains placeholder text' },
    { pattern: /Implement functionality/gi, penalty: 40, message: 'Contains implementation placeholder' },
    { pattern: /Your code here/gi, penalty: 40, message: 'Contains code placeholder' },
    { pattern: /placeholder/gi, penalty: 35, message: 'Contains placeholder keyword' },
    { pattern: /\.\.\./g, penalty: 20, message: 'Contains ellipsis (incomplete code)' },
    { pattern: /pass\s*$/gm, penalty: 25, message: 'Contains empty pass statements (Python)' },
  ];

  templatePatterns.forEach(({ pattern, penalty, message }) => {
    if (pattern.test(code)) {
      issues.push(message);
      score -= penalty;
    }
  });

  // Check for actual implementation (lines of real code)
  const linesOfCode = code.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && 
           !trimmed.startsWith('//') && 
           !trimmed.startsWith('#') &&
           !trimmed.startsWith('/*') &&
           !trimmed.startsWith('*') &&
           trimmed !== '{' &&
           trimmed !== '}';
  }).length;

  if (linesOfCode < 10) {
    issues.push('Code too short - likely incomplete or template');
    suggestions.push('Generate more comprehensive implementation with proper logic');
    score -= 20;
  }

  // Language-specific validation
  switch (language.toLowerCase()) {
    case 'python':
      validatePython(code, issues, suggestions, (penalty) => { score -= penalty; });
      break;
    case 'javascript':
    case 'typescript':
      validateJavaScript(code, issues, suggestions, (penalty) => { score -= penalty; });
      break;
    case 'rust':
      validateRust(code, issues, suggestions, (penalty) => { score -= penalty; });
      break;
    case 'solidity':
      validateSolidity(code, issues, suggestions, (penalty) => { score -= penalty; });
      break;
    case 'go':
      validateGo(code, issues, suggestions, (penalty) => { score -= penalty; });
      break;
  }

  // Check for actual logic (not just comments/structure)
  const logicIndicators = ['if ', 'for ', 'while ', 'return ', '= ', '+', '-', '*', '/', 'await ', 'async'];
  const hasLogic = logicIndicators.some(indicator => code.includes(indicator));

  if (!hasLogic) {
    issues.push('No actual logic implementation detected');
    suggestions.push('Add actual business logic, not just function signatures');
    score -= 40;
  }

  // Check for example usage or main function
  const hasExample = code.includes('if __name__') || 
                     code.includes('main()') || 
                     code.includes('Example:') ||
                     code.includes('Usage:');
  
  if (!hasExample && linesOfCode > 20) {
    suggestions.push('Consider adding example usage or main function');
    score -= 5;
  }

  return {
    isValid: score >= 60 && issues.length === 0,
    issues,
    score: Math.max(0, score),
    suggestions
  };
}

/**
 * Python-specific validation
 */
function validatePython(code: string, issues: string[], suggestions: string[], penalize: (n: number) => void): void {
  // Must have function definitions
  if (!code.includes('def ')) {
    issues.push('No function definitions found');
    suggestions.push('Add proper function definitions with def keyword');
    penalize(25);
  }

  // Should have type hints (modern Python)
  if (!code.includes('->') && !code.includes(': ')) {
    suggestions.push('Add type hints for better code quality (PEP 484)');
    penalize(10);
  }

  // Should have docstrings
  if (!code.includes('"""') && !code.includes("'''")) {
    suggestions.push('Add docstrings to functions (PEP 257)');
    penalize(10);
  }

  // Should have error handling
  if (!code.includes('try:') && !code.includes('raise ')) {
    suggestions.push('Add error handling with try-except blocks');
    penalize(5);
  }

  // Check for empty pass statements (template indicator)
  const passCount = (code.match(/^\s*pass\s*$/gm) || []).length;
  if (passCount > 0) {
    issues.push(`Contains ${passCount} empty pass statement(s) - incomplete implementation`);
    penalize(passCount * 15);
  }
}

/**
 * JavaScript/TypeScript-specific validation
 */
function validateJavaScript(code: string, issues: string[], suggestions: string[], penalize: (n: number) => void): void {
  // Must have function definitions
  const hasFunctions = code.includes('function') || code.includes('=>') || code.includes('async ');
  if (!hasFunctions) {
    issues.push('No function definitions found');
    suggestions.push('Add proper function definitions');
    penalize(25);
  }

  // Should have JSDoc or TSDoc
  if (!code.includes('/**') && !code.includes('//')) {
    suggestions.push('Add JSDoc comments for better documentation');
    penalize(10);
  }

  // TypeScript should have types
  if (code.includes('typescript') || code.includes(': ')) {
    if (!code.includes(': ') && !code.includes('<')) {
      suggestions.push('Add TypeScript type annotations');
      penalize(10);
    }
  }

  // Should have error handling
  if (!code.includes('try') && !code.includes('throw ')) {
    suggestions.push('Add error handling with try-catch blocks');
    penalize(5);
  }

  // Should have exports
  if (!code.includes('export') && !code.includes('module.exports')) {
    suggestions.push('Add export statements for reusability');
    penalize(5);
  }
}

/**
 * Rust-specific validation
 */
function validateRust(code: string, issues: string[], suggestions: string[], penalize: (n: number) => void): void {
  // Must have function definitions
  if (!code.includes('fn ')) {
    issues.push('No function definitions found');
    suggestions.push('Add proper function definitions with fn keyword');
    penalize(25);
  }

  // Should have documentation comments
  if (!code.includes('///') && !code.includes('//!')) {
    suggestions.push('Add Rust documentation comments (///)');
    penalize(10);
  }

  // Should use Result for error handling
  if (!code.includes('Result<') && !code.includes('Option<')) {
    suggestions.push('Use Result<T, E> for proper error handling');
    penalize(10);
  }

  // Should have main function or tests
  if (!code.includes('fn main()') && !code.includes('#[test]')) {
    suggestions.push('Add main function or unit tests');
    penalize(5);
  }
}

/**
 * Solidity-specific validation
 */
function validateSolidity(code: string, issues: string[], suggestions: string[], penalize: (n: number) => void): void {
  // Must have contract definition
  if (!code.includes('contract ')) {
    issues.push('No contract definition found');
    suggestions.push('Add proper contract definition');
    penalize(30);
  }

  // Should have SPDX license
  if (!code.includes('SPDX-License-Identifier')) {
    suggestions.push('Add SPDX license identifier');
    penalize(10);
  }

  // Should have pragma
  if (!code.includes('pragma solidity')) {
    issues.push('Missing pragma solidity version');
    penalize(15);
  }

  // Should have NatSpec comments
  if (!code.includes('/**') && !code.includes('@dev')) {
    suggestions.push('Add NatSpec documentation');
    penalize(10);
  }

  // Should have events
  if (!code.includes('event ')) {
    suggestions.push('Add events for state changes');
    penalize(5);
  }
}

/**
 * Go-specific validation
 */
function validateGo(code: string, issues: string[], suggestions: string[], penalize: (n: number) => void): void {
  // Must have package declaration
  if (!code.includes('package ')) {
    issues.push('No package declaration found');
    penalize(20);
  }

  // Must have function definitions
  if (!code.includes('func ')) {
    issues.push('No function definitions found');
    suggestions.push('Add proper function definitions with func keyword');
    penalize(25);
  }

  // Should have godoc comments
  if (!code.includes('//') || !code.match(/\/\/\s*\w+\s+\w+/)) {
    suggestions.push('Add godoc comments for exported functions');
    penalize(10);
  }

  // Should have error handling
  if (!code.includes('error') && !code.includes('err ')) {
    suggestions.push('Add proper error handling');
    penalize(10);
  }

  // Should have main or example
  if (!code.includes('func main()')) {
    suggestions.push('Add main function for executable example');
    penalize(5);
  }
}

/**
 * Enhanced validation with retry suggestion
 */
export function shouldRetryGeneration(validation: ValidationResult): boolean {
  // Retry if score is too low or has critical issues
  return validation.score < 60 || validation.issues.some(issue => 
    issue.includes('placeholder') || 
    issue.includes('TODO') ||
    issue.includes('No function definitions')
  );
}

/**
 * Generate enhanced prompt for retry
 */
export function getEnhancedPrompt(originalPrompt: string, language: string, validation: ValidationResult): string {
  let enhancement = `${originalPrompt}\n\n`;
  
  enhancement += `CRITICAL REQUIREMENTS:\n`;
  enhancement += `✅ Provide COMPLETE, WORKING implementation\n`;
  enhancement += `✅ NO templates, NO TODOs, NO placeholders\n`;
  enhancement += `✅ Include proper error handling\n`;
  enhancement += `✅ Add comprehensive documentation\n`;
  enhancement += `✅ The code must be production-ready and fully functional\n`;
  
  if (validation.suggestions.length > 0) {
    enhancement += `\nIMPROVEMENTS NEEDED:\n`;
    validation.suggestions.forEach(suggestion => {
      enhancement += `- ${suggestion}\n`;
    });
  }
  
  return enhancement;
}
