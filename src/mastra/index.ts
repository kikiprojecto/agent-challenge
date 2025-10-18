import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { neuroCoderAgent } from "./agents";
import { codingWorkflow } from "./workflows/codingWorkflow";
import { ConsoleLogger, LogLevel } from "@mastra/core/logger";
import { server } from "./mcp";

const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel || "info";

/**
 * NeuroCoder AI - Mastra Configuration
 * Nosana Agents 102 Challenge
 * 
 * A complete AI coding assistant with:
 * - 6 specialized tools (generation, review, execution, testing, GitHub, knowledge)
 * - Orchestrated workflow with 7 steps
 * - Self-improvement capabilities
 * - Decentralized infrastructure support
 */
export const mastra = new Mastra({
  agents: {
    neuroCoderAgent
  },
  workflows: {
    codingWorkflow
  },
  mcpServers: {
    server
  },
  storage: new LibSQLStore({
    url: ":memory:"
  }),
  logger: new ConsoleLogger({
    level: LOG_LEVEL,
  }),
});
