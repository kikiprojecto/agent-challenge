import { createTool } from '@mastra/core';
import { z } from 'zod';

const IssueSchema = z.object({
  type: z.enum(["security", "performance", "style", "bug", "best-practice"]),
  severity: z.enum(["critical", "high", "medium", "low"]),
  line: z.number().optional(),
  description: z.string(),
  suggestion: z.string()
});
const inputSchema = z.object({
  code: z.string().describe("The code to review"),
  language: z.enum(["python", "javascript", "typescript", "rust", "solidity", "go"]).describe("Programming language of the code"),
  reviewType: z.enum(["security", "performance", "style", "all"]).default("all").describe("Type of review to perform")
});
const outputSchema = z.object({
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
function extractCodeFromMarkdown(text) {
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
  inputSchema,
  outputSchema,
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
          refactoredCode = extractCodeFromMarkdown(refactorResponse.text || "");
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

export { codeReviewerTool };
