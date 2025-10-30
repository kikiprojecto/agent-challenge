import { c as createWorkflow, a as createStep } from './chunk-5QUE7HZF.mjs';
import { s as saveScorePayloadSchema } from './chunk-A7REAXWA.mjs';
import { c as convertMessages } from './chunk-TJHEGJNW.mjs';
import { M as MastraError } from './error.mjs';
import pMap from './index.mjs';
import { z } from './zod.mjs';

// src/scores/scoreTraces/scoreTraces.ts
async function scoreTraces({
  scorerName,
  targets,
  mastra
}) {
  const workflow = mastra.__getInternalWorkflow("__batch-scoring-traces");
  try {
    const run = await workflow.createRunAsync();
    await run.start({ inputData: { targets, scorerName } });
  } catch (error) {
    const mastraError = new MastraError(
      {
        category: "SYSTEM",
        domain: "SCORER",
        id: "MASTRA_SCORER_FAILED_TO_RUN_TRACE_SCORING",
        details: {
          scorerName,
          targets: JSON.stringify(targets)
        }
      },
      error
    );
    mastra.getLogger()?.trackException(mastraError);
    mastra.getLogger()?.error(mastraError.toString());
  }
}

// src/scores/scoreTraces/utils.ts
function buildSpanTree(spans) {
  const spanMap = /* @__PURE__ */ new Map();
  const childrenMap = /* @__PURE__ */ new Map();
  const rootSpans = [];
  for (const span of spans) {
    spanMap.set(span.spanId, span);
  }
  for (const span of spans) {
    if (span.parentSpanId === null) {
      rootSpans.push(span);
    } else {
      const siblings = childrenMap.get(span.parentSpanId) || [];
      siblings.push(span);
      childrenMap.set(span.parentSpanId, siblings);
    }
  }
  for (const children of childrenMap.values()) {
    children.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  }
  rootSpans.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  return { spanMap, childrenMap, rootSpans };
}
function getChildrenOfType(spanTree, parentSpanId, spanType) {
  const children = spanTree.childrenMap.get(parentSpanId) || [];
  return children.filter((span) => span.spanType === spanType);
}
function normalizeMessageContent(content) {
  if (typeof content === "string") {
    return content;
  }
  const tempMessage = {
    id: "temp",
    role: "user",
    parts: content.map((part) => ({ type: part.type, text: part.text }))
  };
  const converted = convertMessages(tempMessage).to("AIV4.UI");
  return converted[0]?.content || "";
}
function convertToUIMessage(message, createdAt) {
  let messageInput;
  if (typeof message.content === "string") {
    messageInput = {
      id: "temp",
      role: message.role,
      content: message.content
    };
  } else {
    messageInput = {
      id: "temp",
      role: message.role,
      parts: message.content.map((part) => ({ type: part.type, text: part.text }))
    };
  }
  const converted = convertMessages(messageInput).to("AIV4.UI");
  const result = converted[0];
  if (!result) {
    throw new Error("Failed to convert message");
  }
  return {
    ...result,
    id: "",
    // Spans don't have message IDs
    createdAt: new Date(createdAt)
    // Use span timestamp
  };
}
function extractInputMessages(agentSpan) {
  const input = agentSpan.input;
  if (typeof input === "string") {
    return [
      {
        role: "user",
        content: input,
        createdAt: new Date(agentSpan.startedAt),
        parts: [{ type: "text", text: input }],
        experimental_attachments: []
      }
    ];
  }
  if (Array.isArray(input)) {
    return input.map((msg) => convertToUIMessage(msg, agentSpan.startedAt));
  }
  if (input && typeof input === "object" && Array.isArray(input.messages)) {
    return input.messages.map((msg) => convertToUIMessage(msg, agentSpan.startedAt));
  }
  return [];
}
function extractSystemMessages(llmSpan) {
  return (llmSpan.input?.messages || []).filter((msg) => msg.role === "system").map((msg) => ({
    role: "system",
    content: normalizeMessageContent(msg.content)
  }));
}
function extractRememberedMessages(llmSpan, currentInputContent) {
  const messages = (llmSpan.input?.messages || []).filter((msg) => msg.role !== "system").filter((msg) => normalizeMessageContent(msg.content) !== currentInputContent);
  return messages.map((msg) => convertToUIMessage(msg, llmSpan.startedAt));
}
function reconstructToolInvocations(spanTree, parentSpanId) {
  const toolSpans = getChildrenOfType(spanTree, parentSpanId, "tool_call" /* TOOL_CALL */);
  return toolSpans.map((toolSpan) => ({
    state: "result",
    toolName: toolSpan.attributes?.toolId,
    args: toolSpan.input || {},
    result: toolSpan.output || {}
  }));
}
function createMessageParts(toolInvocations, textContent) {
  const parts = [];
  for (const toolInvocation of toolInvocations) {
    parts.push({
      type: "tool-invocation",
      toolInvocation
    });
  }
  if (textContent.trim()) {
    parts.push({
      type: "text",
      text: textContent
    });
  }
  return parts;
}
function validateTrace(trace) {
  if (!trace) {
    throw new Error("Trace is null or undefined");
  }
  if (!trace.spans || !Array.isArray(trace.spans)) {
    throw new Error("Trace must have a spans array");
  }
  if (trace.spans.length === 0) {
    throw new Error("Trace has no spans");
  }
  const spanIds = new Set(trace.spans.map((span) => span.spanId));
  for (const span of trace.spans) {
    if (span.parentSpanId && !spanIds.has(span.parentSpanId)) {
      throw new Error(`Span ${span.spanId} references non-existent parent ${span.parentSpanId}`);
    }
  }
}
function findPrimaryLLMSpan(spanTree, rootAgentSpan) {
  const directLLMSpans = getChildrenOfType(spanTree, rootAgentSpan.spanId, "llm_generation" /* LLM_GENERATION */);
  if (directLLMSpans.length > 0) {
    return directLLMSpans[0];
  }
  throw new Error("No LLM generation span found in trace");
}
function prepareTraceForTransformation(trace) {
  validateTrace(trace);
  const spanTree = buildSpanTree(trace.spans);
  const rootAgentSpan = spanTree.rootSpans.find((span) => span.spanType === "agent_run");
  if (!rootAgentSpan) {
    throw new Error("No root agent_run span found in trace");
  }
  return { spanTree, rootAgentSpan };
}
function transformTraceToScorerInputAndOutput(trace) {
  const { spanTree, rootAgentSpan } = prepareTraceForTransformation(trace);
  if (!rootAgentSpan.output) {
    throw new Error("Root agent span has no output");
  }
  const primaryLLMSpan = findPrimaryLLMSpan(spanTree, rootAgentSpan);
  const inputMessages = extractInputMessages(rootAgentSpan);
  const systemMessages = extractSystemMessages(primaryLLMSpan);
  const currentInputContent = inputMessages[0]?.content || "";
  const rememberedMessages = extractRememberedMessages(primaryLLMSpan, currentInputContent);
  const input = {
    // We do not keep track of the tool call ids in traces, so we need to cast to UIMessageWithMetadata
    inputMessages,
    rememberedMessages,
    systemMessages,
    taggedSystemMessages: {}
    // Todo: Support tagged system messages
  };
  const toolInvocations = reconstructToolInvocations(spanTree, rootAgentSpan.spanId);
  const responseText = rootAgentSpan.output.text || "";
  const responseMessage = {
    role: "assistant",
    content: responseText,
    createdAt: new Date(rootAgentSpan.endedAt || rootAgentSpan.startedAt),
    // @ts-ignore
    parts: createMessageParts(toolInvocations, responseText),
    experimental_attachments: [],
    // Tool invocations are being deprecated however we need to support it for now
    toolInvocations
  };
  const output = [responseMessage];
  return {
    input,
    output
  };
}

// src/scores/scoreTraces/scoreTracesWorkflow.ts
var getTraceStep = createStep({
  id: "__process-trace-scoring",
  inputSchema: z.object({
    targets: z.array(
      z.object({
        traceId: z.string(),
        spanId: z.string().optional()
      })
    ),
    scorerName: z.string()
  }),
  outputSchema: z.any(),
  execute: async ({ inputData, tracingContext, mastra }) => {
    const logger = mastra.getLogger();
    if (!logger) {
      console.warn(
        "[scoreTracesWorkflow] Logger not initialized: no debug or error logs will be recorded for scoring traces."
      );
    }
    const storage = mastra.getStorage();
    if (!storage) {
      const mastraError = new MastraError({
        id: "MASTRA_STORAGE_NOT_FOUND_FOR_TRACE_SCORING",
        domain: "STORAGE" /* STORAGE */,
        category: "SYSTEM" /* SYSTEM */,
        text: "Storage not found for trace scoring",
        details: {
          scorerName: inputData.scorerName
        }
      });
      logger?.error(mastraError.toString());
      logger?.trackException(mastraError);
      return;
    }
    let scorer;
    try {
      scorer = mastra.getScorerByName(inputData.scorerName);
    } catch (error) {
      const mastraError = new MastraError(
        {
          id: "MASTRA_SCORER_NOT_FOUND_FOR_TRACE_SCORING",
          domain: "SCORER" /* SCORER */,
          category: "SYSTEM" /* SYSTEM */,
          text: `Scorer not found for trace scoring`,
          details: {
            scorerName: inputData.scorerName
          }
        },
        error
      );
      logger?.error(mastraError.toString());
      logger?.trackException(mastraError);
      return;
    }
    await pMap(
      inputData.targets,
      async (target) => {
        try {
          await runScorerOnTarget({ storage, scorer, target, tracingContext });
        } catch (error) {
          const mastraError = new MastraError(
            {
              id: "MASTRA_SCORER_FAILED_TO_RUN_SCORER_ON_TRACE",
              domain: "SCORER" /* SCORER */,
              category: "SYSTEM" /* SYSTEM */,
              details: {
                scorerName: scorer.name,
                spanId: target.spanId || "",
                traceId: target.traceId
              }
            },
            error
          );
          logger?.error(mastraError.toString());
          logger?.trackException(mastraError);
        }
      },
      { concurrency: 3 }
    );
  }
});
async function runScorerOnTarget({
  storage,
  scorer,
  target,
  tracingContext
}) {
  const trace = await storage.getAITrace(target.traceId);
  if (!trace) {
    throw new Error(`Trace not found for scoring, traceId: ${target.traceId}`);
  }
  let span;
  if (target.spanId) {
    span = trace.spans.find((span2) => span2.spanId === target.spanId);
  } else {
    span = trace.spans.find((span2) => span2.parentSpanId === null);
  }
  if (!span) {
    throw new Error(
      `Span not found for scoring, traceId: ${target.traceId}, spanId: ${target.spanId ?? "Not provided"}`
    );
  }
  const scorerRun = buildScorerRun({
    scorerType: scorer.type === "agent" ? "agent" : void 0,
    tracingContext,
    trace,
    targetSpan: span
  });
  const result = await scorer.run(scorerRun);
  const traceId = `${target.traceId}${target.spanId ? `-${target.spanId}` : ""}`;
  const scorerResult = {
    ...result,
    scorer: {
      id: scorer.name,
      name: scorer.name,
      description: scorer.description
    },
    traceId,
    entityId: span.name,
    entityType: span.spanType,
    entity: { traceId: span.traceId, spanId: span.spanId },
    source: "TEST",
    scorerId: scorer.name
  };
  const savedScoreRecord = await validateAndSaveScore({ storage, scorerResult });
  await attachScoreToSpan({ storage, span, scoreRecord: savedScoreRecord });
}
async function validateAndSaveScore({ storage, scorerResult }) {
  const payloadToSave = saveScorePayloadSchema.parse(scorerResult);
  const result = await storage.saveScore(payloadToSave);
  return result.score;
}
function buildScorerRun({
  scorerType,
  tracingContext,
  trace,
  targetSpan
}) {
  let runPayload;
  if (scorerType === "agent") {
    const { input, output } = transformTraceToScorerInputAndOutput(trace);
    runPayload = {
      input,
      output
    };
  } else {
    runPayload = { input: targetSpan.input, output: targetSpan.output };
  }
  runPayload.tracingContext = tracingContext;
  return runPayload;
}
async function attachScoreToSpan({
  storage,
  span,
  scoreRecord
}) {
  const existingLinks = span.links || [];
  const link = {
    type: "score",
    scoreId: scoreRecord.id,
    scorerName: scoreRecord.scorer.name,
    score: scoreRecord.score,
    createdAt: scoreRecord.createdAt
  };
  await storage.updateAISpan({
    spanId: span.spanId,
    traceId: span.traceId,
    updates: { links: [...existingLinks, link] }
  });
}
var scoreTracesWorkflow = createWorkflow({
  id: "__batch-scoring-traces",
  inputSchema: z.object({
    targets: z.array(
      z.object({
        traceId: z.string(),
        spanId: z.string().optional()
      })
    ),
    scorerName: z.string()
  }),
  outputSchema: z.any(),
  steps: [getTraceStep],
  options: {
    tracingPolicy: {
      internal: 15 /* ALL */
    }
  }
});
scoreTracesWorkflow.then(getTraceStep).commit();

export { scoreTraces, scoreTracesWorkflow };
