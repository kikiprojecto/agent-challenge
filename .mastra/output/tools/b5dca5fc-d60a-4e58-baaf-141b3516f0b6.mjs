import { k as knowledgeRetrievalTool, t as testGeneratorTool, g as githubIntegrationTool, c as codeExecutorTool, a as codeReviewerTool, b as codeGeneratorTool } from '../mastra.mjs';
import 'stream/web';
import 'crypto';
import 'node:url';
import 'node:path';
import 'node:module';
import 'events';
import '@libsql/client';
import 'node:crypto';
import 'path';
import 'util';
import 'buffer';
import 'string_decoder';
import 'stream';
import 'async_hooks';
import 'url';
import 'node:process';

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
