// Integration test - verify all tools are importable and properly configured
import { codeGeneratorTool } from './codeGenerator';
import { codeReviewerTool } from './codeReviewer';
import { codeExecutorTool } from './codeExecutor';
import { githubIntegrationTool } from './githubIntegration';
import { testGeneratorTool } from './testGenerator';
import { knowledgeRetrievalTool } from './knowledgeRetrieval';

console.log('🔍 NeuroCoder AI - Integration Test\n');
console.log('=' .repeat(50));

// Verify all tools are imported
console.log('\n✅ All tools imported successfully!\n');

// Verify tool IDs
const tools = {
  codeGenerator: codeGeneratorTool.id,
  codeReviewer: codeReviewerTool.id,
  codeExecutor: codeExecutorTool.id,
  githubIntegration: githubIntegrationTool.id,
  testGenerator: testGeneratorTool.id,
  knowledgeRetrieval: knowledgeRetrievalTool.id,
};

console.log('📋 Tool IDs:');
Object.entries(tools).forEach(([name, id]) => {
  console.log(`   ${name}: ${id}`);
});

// Verify tool structure
console.log('\n🔧 Tool Structure Verification:');
const verifyTool = (name: string, tool: any) => {
  const hasId = !!tool.id;
  const hasDescription = !!tool.description;
  const hasInputSchema = !!tool.inputSchema;
  const hasOutputSchema = !!tool.outputSchema;
  const hasExecute = typeof tool.execute === 'function';
  
  const status = hasId && hasDescription && hasInputSchema && hasOutputSchema && hasExecute ? '✅' : '❌';
  console.log(`   ${status} ${name}:`);
  console.log(`      - ID: ${hasId ? '✓' : '✗'}`);
  console.log(`      - Description: ${hasDescription ? '✓' : '✗'}`);
  console.log(`      - Input Schema: ${hasInputSchema ? '✓' : '✗'}`);
  console.log(`      - Output Schema: ${hasOutputSchema ? '✓' : '✗'}`);
  console.log(`      - Execute Function: ${hasExecute ? '✓' : '✗'}`);
  
  return hasId && hasDescription && hasInputSchema && hasOutputSchema && hasExecute;
};

const results = {
  codeGenerator: verifyTool('Code Generator', codeGeneratorTool),
  codeReviewer: verifyTool('Code Reviewer', codeReviewerTool),
  codeExecutor: verifyTool('Code Executor', codeExecutorTool),
  githubIntegration: verifyTool('GitHub Integration', githubIntegrationTool),
  testGenerator: verifyTool('Test Generator', testGeneratorTool),
  knowledgeRetrieval: verifyTool('Knowledge Retrieval', knowledgeRetrievalTool),
};

// Final summary
console.log('\n' + '='.repeat(50));
const allPassed = Object.values(results).every(r => r);
if (allPassed) {
  console.log('✅ ALL TESTS PASSED - Tools are ready for use!');
} else {
  console.log('❌ SOME TESTS FAILED - Please check the errors above');
  process.exit(1);
}

console.log('='.repeat(50) + '\n');

export { tools, results };
