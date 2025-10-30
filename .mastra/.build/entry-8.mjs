import { createTool } from '@mastra/core';
import { z } from 'zod';

const TestCaseSchema = z.object({
  name: z.string().describe("Test case name"),
  description: z.string().describe("Test case description"),
  expected: z.string().describe("Expected outcome")
});
const inputSchema = z.object({
  code: z.string().describe("Code to generate tests for"),
  language: z.enum(["python", "javascript", "typescript"]).describe("Programming language"),
  testType: z.enum(["unit", "integration", "e2e"]).default("unit").describe("Type of tests to generate"),
  coverage: z.enum(["basic", "comprehensive"]).default("comprehensive").describe("Test coverage level")
});
const outputSchema = z.object({
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
function generateRecommendations(codeAnalysis, testCases, testType, coverageLevel) {
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
  inputSchema,
  outputSchema,
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
      const recommendations = generateRecommendations(
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

export { testGeneratorTool };
