import { MCPServer } from "@mastra/mcp"
import { weatherTool } from "../tools";
import { neuroCoderAgent } from "../agents";

export const server = new MCPServer({
  name: "NeuroCoder MCP Server",
  version: "1.0.0",
  tools: { weatherTool },
  agents: { neuroCoderAgent }, // this agent will become tool "ask_neuroCoderAgent"
  // workflows: {
  // codingWorkflow, // this workflow will become tool "run_codingWorkflow"
  // }
});
