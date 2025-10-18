import { createWorkflow } from '@mastra/core';
import { codeGeneratorTool } from '../tools/codeGenerator';
import { codeReviewerTool } from '../tools/codeReviewer';
import { codeExecutorTool } from '../tools/codeExecutor';
import { githubIntegrationTool } from '../tools/githubIntegration';
import { testGeneratorTool } from '../tools/testGenerator';
import { knowledgeRetrievalTool } from '../tools/knowledgeRetrieval';

// Workflow state interface
interface WorkflowState {
  prompt: string;
  language: string;
  repository?: string;
  executeTests?: boolean;
  currentStep: number;
  knowledgePatterns?: any;
  generatedCode?: string;
  reviewResults?: any;
  refinementIterations: number;
  maxRefinementIterations: number;
  finalCode?: string;
  reviewScore?: number;
  tests?: string;
  testResults?: any;
  githubPR?: string;
  iterationHistory: Array<{
    iteration: number;
    code: string;
    score: number;
    issues: any[];
  }>;
  recommendations: string[];
  errors: string[];
}

// Workflow result interface
interface WorkflowResult {
  success: boolean;
  finalCode: string;
  reviewScore: number;
  tests: string;
  testResults?: any;
  githubPR?: string;
  iterationHistory: Array<{
    iteration: number;
    code: string;
    score: number;
    issues: any[];
  }>;
  recommendations: string[];
  errors: string[];
  stepsCompleted: string[];
}

/**
 * NeuroCoder AI Coding Workflow
 * Orchestrates the complete coding process from knowledge retrieval to GitHub PR creation
 */
export const codingWorkflow = createWorkflow({
  name: 'neurocoder-coding-workflow',
  description: 'Complete AI-powered coding workflow with knowledge retrieval, generation, review, testing, and GitHub integration',
  
  triggerSchema: {
    prompt: {
      type: 'string',
      description: 'User prompt describing what code to generate',
      required: true
    },
    language: {
      type: 'string',
      description: 'Programming language (python, javascript, typescript, rust, solidity, go)',
      required: true
    },
    repository: {
      type: 'string',
      description: 'GitHub repository in format owner/repo (optional)',
      required: false
    },
    executeTests: {
      type: 'boolean',
      description: 'Whether to execute generated tests',
      required: false,
      default: false
    }
  },
})
  // STEP 1: Knowledge Retrieval
  .step('retrieve-knowledge', {
    description: 'Retrieve relevant code patterns and best practices from knowledge base',
  })
  .then(async (context: any) => {
    console.log('🔍 Step 1: Retrieving relevant knowledge patterns...');
    
    try {
      const { prompt, language } = context.machineContext;
      
      const knowledgeResult = await knowledgeRetrievalTool.execute(context, {
        query: prompt,
        language,
        topK: 5
      });
      
      console.log(`✅ Retrieved ${knowledgeResult.relevantPatterns.length} relevant patterns`);
      
      return {
        knowledgePatterns: knowledgeResult.relevantPatterns,
        recommendations: knowledgeResult.recommendations,
        currentStep: 1,
        stepsCompleted: ['retrieve-knowledge']
      };
    } catch (error) {
      console.error('❌ Error in knowledge retrieval:', error);
      return {
        knowledgePatterns: [],
        recommendations: ['Failed to retrieve knowledge patterns'],
        errors: [`Knowledge retrieval error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        currentStep: 1,
        stepsCompleted: []
      };
    }
  })
  
  // STEP 2: Code Generation
  .step('generate-code', {
    description: 'Generate code based on prompt and retrieved patterns',
  })
  .then(async (context: any) => {
    console.log('⚙️ Step 2: Generating code...');
    
    try {
      const { prompt, language } = context.machineContext;
      const { knowledgePatterns, recommendations } = context.stepResults['retrieve-knowledge'];
      
      // Build context from knowledge patterns
      let codeContext = '';
      if (knowledgePatterns && knowledgePatterns.length > 0) {
        codeContext = 'Relevant patterns:\n' + 
          knowledgePatterns.map((p: any, i: number) => 
            `${i + 1}. ${p.description}\n${p.useCase}`
          ).join('\n\n');
      }
      
      const generationResult = await codeGeneratorTool.execute(context, {
        prompt,
        language,
        context: codeContext
      });
      
      console.log('✅ Code generated successfully');
      
      return {
        generatedCode: generationResult.code,
        codeExplanation: generationResult.explanation,
        dependencies: generationResult.dependencies,
        complexity: generationResult.estimatedComplexity,
        currentStep: 2,
        stepsCompleted: ['retrieve-knowledge', 'generate-code']
      };
    } catch (error) {
      console.error('❌ Error in code generation:', error);
      return {
        generatedCode: '',
        errors: [`Code generation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        currentStep: 2,
        stepsCompleted: ['retrieve-knowledge']
      };
    }
  })
  
  // STEP 3: Code Review
  .step('review-code', {
    description: 'Review generated code for quality, security, and best practices',
  })
  .then(async (context: any) => {
    console.log('🔎 Step 3: Reviewing generated code...');
    
    try {
      const { language } = context.machineContext;
      const { generatedCode } = context.stepResults['generate-code'];
      
      if (!generatedCode) {
        throw new Error('No code to review');
      }
      
      const reviewResult = await codeReviewerTool.execute(context, {
        code: generatedCode,
        language,
        reviewType: 'all'
      });
      
      console.log(`✅ Code reviewed - Score: ${reviewResult.overallScore}/100`);
      console.log(`   Issues found: ${reviewResult.issues.length}`);
      
      return {
        reviewResults: reviewResult,
        reviewScore: reviewResult.overallScore,
        reviewIssues: reviewResult.issues,
        reviewSummary: reviewResult.summary,
        needsRefinement: reviewResult.overallScore < 85,
        currentStep: 3,
        stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code']
      };
    } catch (error) {
      console.error('❌ Error in code review:', error);
      return {
        reviewScore: 0,
        reviewIssues: [],
        needsRefinement: false,
        errors: [`Code review error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        currentStep: 3,
        stepsCompleted: ['retrieve-knowledge', 'generate-code']
      };
    }
  })
  
  // STEP 4: Refinement (Conditional)
  .step('refine-code', {
    description: 'Refine code based on review feedback if score < 85',
  })
  .then(async (context) => {
    const { needsRefinement, reviewScore, reviewIssues } = context.stepResults['review-code'];
    const { generatedCode } = context.stepResults['generate-code'];
    
    if (!needsRefinement || reviewScore >= 85) {
      console.log('✅ Code quality acceptable, skipping refinement');
      return {
        finalCode: generatedCode,
        finalReviewScore: reviewScore,
        refinementIterations: 0,
        iterationHistory: [{
          iteration: 0,
          code: generatedCode,
          score: reviewScore,
          issues: reviewIssues
        }],
        currentStep: 4,
        stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code', 'refine-code']
      };
    }
    
    console.log('🔄 Step 4: Refining code based on review feedback...');
    
    const maxIterations = 3;
    let currentCode = generatedCode;
    let currentScore = reviewScore;
    const iterationHistory: any[] = [{
      iteration: 0,
      code: generatedCode,
      score: reviewScore,
      issues: reviewIssues
    }];
    
    try {
      const { prompt, language } = context.machineContext;
      
      for (let i = 1; i <= maxIterations; i++) {
        console.log(`   Refinement iteration ${i}/${maxIterations}...`);
        
        // Build refinement prompt with feedback
        const feedbackPrompt = `${prompt}\n\nPrevious code had issues (score: ${currentScore}/100):\n` +
          reviewIssues.slice(0, 5).map((issue: any) => 
            `- [${issue.severity}] ${issue.description}: ${issue.suggestion}`
          ).join('\n') +
          '\n\nPlease generate improved code addressing these issues.';
        
        // Regenerate code
        const refinedResult = await codeGeneratorTool.execute(context, {
          prompt: feedbackPrompt,
          language
        });
        
        currentCode = refinedResult.code;
        
        // Re-review
        const newReviewResult = await codeReviewerTool.execute(context, {
          code: currentCode,
          language,
          reviewType: 'all'
        });
        
        currentScore = newReviewResult.overallScore;
        
        iterationHistory.push({
          iteration: i,
          code: currentCode,
          score: currentScore,
          issues: newReviewResult.issues
        });
        
        console.log(`   Iteration ${i} score: ${currentScore}/100`);
        
        // Stop if score is good enough
        if (currentScore >= 85) {
          console.log('✅ Code quality improved to acceptable level');
          break;
        }
      }
      
      return {
        finalCode: currentCode,
        finalReviewScore: currentScore,
        refinementIterations: iterationHistory.length - 1,
        iterationHistory,
        currentStep: 4,
        stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code', 'refine-code']
      };
    } catch (error) {
      console.error('❌ Error in code refinement:', error);
      return {
        finalCode: generatedCode,
        finalReviewScore: reviewScore,
        refinementIterations: 0,
        iterationHistory,
        errors: [`Code refinement error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        currentStep: 4,
        stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code']
      };
    }
  })
  
  // STEP 5: Test Generation
  .step('generate-tests', {
    description: 'Generate comprehensive tests for the final code',
  })
  .then(async (context) => {
    console.log('🧪 Step 5: Generating tests...');
    
    try {
      const { language } = context.machineContext;
      const { finalCode } = context.stepResults['refine-code'];
      
      if (!finalCode) {
        throw new Error('No code available for test generation');
      }
      
      const testResult = await testGeneratorTool.execute(context, {
        code: finalCode,
        language: language === 'rust' || language === 'solidity' || language === 'go' 
          ? 'javascript' // Fallback for unsupported languages
          : language,
        testType: 'unit',
        coverage: 'comprehensive'
      });
      
      console.log(`✅ Generated ${testResult.testCases.length} test cases`);
      console.log(`   Estimated coverage: ${testResult.coverage}`);
      
      return {
        tests: testResult.testCode,
        testCases: testResult.testCases,
        testCoverage: testResult.coverage,
        testFramework: testResult.framework,
        testRecommendations: testResult.recommendations,
        currentStep: 5,
        stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code', 'refine-code', 'generate-tests']
      };
    } catch (error) {
      console.error('❌ Error in test generation:', error);
      return {
        tests: '',
        testCases: [],
        errors: [`Test generation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        currentStep: 5,
        stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code', 'refine-code']
      };
    }
  })
  
  // STEP 6: Test Execution (Optional)
  .step('execute-tests', {
    description: 'Execute generated tests (optional)',
  })
  .then(async (context) => {
    const { executeTests, language } = context.machineContext;
    
    if (!executeTests) {
      console.log('⏭️  Step 6: Skipping test execution (not requested)');
      return {
        testResults: null,
        testsExecuted: false,
        currentStep: 6,
        stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code', 'refine-code', 'generate-tests', 'execute-tests']
      };
    }
    
    console.log('▶️  Step 6: Executing tests...');
    
    try {
      const { finalCode } = context.stepResults['refine-code'];
      const { tests } = context.stepResults['generate-tests'];
      
      // Only execute for supported languages
      if (!['javascript', 'typescript', 'python'].includes(language)) {
        console.log('⚠️  Test execution not supported for this language');
        return {
          testResults: null,
          testsExecuted: false,
          currentStep: 6,
          stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code', 'refine-code', 'generate-tests', 'execute-tests']
        };
      }
      
      // Execute the code
      const codeExecutionResult = await codeExecutorTool.execute(context, {
        code: finalCode,
        language,
        timeout: 10000
      });
      
      // Execute the tests
      const testExecutionResult = await codeExecutorTool.execute(context, {
        code: tests,
        language,
        timeout: 10000
      });
      
      console.log(`✅ Tests executed - Success: ${testExecutionResult.success}`);
      
      return {
        testResults: {
          codeExecution: codeExecutionResult,
          testExecution: testExecutionResult
        },
        testsExecuted: true,
        currentStep: 6,
        stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code', 'refine-code', 'generate-tests', 'execute-tests']
      };
    } catch (error) {
      console.error('❌ Error in test execution:', error);
      return {
        testResults: null,
        testsExecuted: false,
        errors: [`Test execution error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        currentStep: 6,
        stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code', 'refine-code', 'generate-tests']
      };
    }
  })
  
  // STEP 7: GitHub Integration (Optional)
  .step('github-integration', {
    description: 'Create GitHub PR with code and tests (optional)',
  })
  .then(async (context) => {
    const { repository, prompt } = context.machineContext;
    
    if (!repository) {
      console.log('⏭️  Step 7: Skipping GitHub integration (no repository provided)');
      return {
        githubPR: null,
        prCreated: false,
        currentStep: 7,
        stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code', 'refine-code', 'generate-tests', 'execute-tests', 'github-integration']
      };
    }
    
    console.log('🐙 Step 7: Creating GitHub PR...');
    
    try {
      const { finalCode } = context.stepResults['refine-code'];
      const { tests } = context.stepResults['generate-tests'];
      const { finalReviewScore } = context.stepResults['refine-code'];
      
      // Create a branch name from prompt
      const branchName = `neurocoder-${Date.now()}`;
      
      // Prepare PR body
      const prBody = `## NeuroCoder AI Generated Code

**Prompt:** ${prompt}

**Code Quality Score:** ${finalReviewScore}/100

### Generated Files
- Main code implementation
- Comprehensive test suite

### Review Summary
This code was generated and reviewed by NeuroCoder AI with automated quality checks.

---
*Generated by NeuroCoder AI*`;
      
      // Create PR
      const prResult = await githubIntegrationTool.execute(context, {
        action: 'createPR',
        repository,
        parameters: {
          title: `feat: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
          body: prBody,
          branchName,
          files: [
            { path: 'generated-code.js', content: finalCode },
            { path: 'generated-tests.test.js', content: tests }
          ],
          commitMessage: 'Add AI-generated code and tests'
        }
      });
      
      if (prResult.success) {
        console.log(`✅ PR created: ${prResult.data.url}`);
        return {
          githubPR: prResult.data.url,
          prNumber: prResult.data.number,
          prCreated: true,
          currentStep: 7,
          stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code', 'refine-code', 'generate-tests', 'execute-tests', 'github-integration']
        };
      } else {
        throw new Error(prResult.message);
      }
    } catch (error) {
      console.error('❌ Error in GitHub integration:', error);
      return {
        githubPR: null,
        prCreated: false,
        errors: [`GitHub integration error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        currentStep: 7,
        stepsCompleted: ['retrieve-knowledge', 'generate-code', 'review-code', 'refine-code', 'generate-tests', 'execute-tests']
      };
    }
  })
  
  // Final step: Compile results
  .step('compile-results', {
    description: 'Compile all workflow results into final output',
  })
  .then(async (context) => {
    console.log('📊 Compiling final results...');
    
    const knowledgeStep = context.stepResults['retrieve-knowledge'] || {};
    const generateStep = context.stepResults['generate-code'] || {};
    const reviewStep = context.stepResults['review-code'] || {};
    const refineStep = context.stepResults['refine-code'] || {};
    const testStep = context.stepResults['generate-tests'] || {};
    const executeStep = context.stepResults['execute-tests'] || {};
    const githubStep = context.stepResults['github-integration'] || {};
    
    // Collect all errors
    const allErrors: string[] = [
      ...(knowledgeStep.errors || []),
      ...(generateStep.errors || []),
      ...(reviewStep.errors || []),
      ...(refineStep.errors || []),
      ...(testStep.errors || []),
      ...(executeStep.errors || []),
      ...(githubStep.errors || [])
    ];
    
    // Collect all recommendations
    const allRecommendations: string[] = [
      ...(knowledgeStep.recommendations || []),
      ...(testStep.testRecommendations || [])
    ];
    
    const result: WorkflowResult = {
      success: allErrors.length === 0 && !!refineStep.finalCode,
      finalCode: refineStep.finalCode || generateStep.generatedCode || '',
      reviewScore: refineStep.finalReviewScore || reviewStep.reviewScore || 0,
      tests: testStep.tests || '',
      testResults: executeStep.testResults,
      githubPR: githubStep.githubPR,
      iterationHistory: refineStep.iterationHistory || [],
      recommendations: allRecommendations,
      errors: allErrors,
      stepsCompleted: githubStep.stepsCompleted || []
    };
    
    console.log('✅ Workflow completed successfully!');
    console.log(`   Final code quality: ${result.reviewScore}/100`);
    console.log(`   Refinement iterations: ${result.iterationHistory.length - 1}`);
    console.log(`   Tests generated: ${testStep.testCases?.length || 0}`);
    console.log(`   Steps completed: ${result.stepsCompleted.length}/7`);
    
    return result;
  });
