import { a as customAlphabet, S as SecureJSON, b as asSchema, p as parsePartialJson, f as formatDataStreamPart, M as MessageList, e as embedMany$1 } from './chunk-TJHEGJNW.mjs';
import { t as trace, S as SpanStatusCode } from './trace-api.mjs';
import { u as unionType, s as stringType, i as instanceOfType, c as custom, l as lazyType, b as nullType, n as numberType, d as booleanType, r as recordType, f as arrayType, o as objectType, g as literalType, h as unknownType, j as optionalType, k as ZodObject, e as enumType } from './v3.mjs';
import { b as generateEmptyFromSchema, c as convertSchemaToZod } from './ai-tracing.mjs';
import { MastraMemory } from './@mastra-core-memory.mjs';
import { z as zodToJsonSchema } from './zod-to-json.mjs';
import { c as createTool } from './tools.mjs';

// src/errors/ai-sdk-error.ts
var marker$1 = "vercel.ai.error";
var symbol$1 = Symbol.for(marker$1);
var _a$1;
var _AISDKError = class _AISDKError extends Error {
  /**
   * Creates an AI SDK Error.
   *
   * @param {Object} params - The parameters for creating the error.
   * @param {string} params.name - The name of the error.
   * @param {string} params.message - The error message.
   * @param {unknown} [params.cause] - The underlying cause of the error.
   */
  constructor({
    name: name14,
    message,
    cause
  }) {
    super(message);
    this[_a$1] = true;
    this.name = name14;
    this.cause = cause;
  }
  /**
   * Checks if the given error is an AI SDK Error.
   * @param {unknown} error - The error to check.
   * @returns {boolean} True if the error is an AI SDK Error, false otherwise.
   */
  static isInstance(error) {
    return _AISDKError.hasMarker(error, marker$1);
  }
  static hasMarker(error, marker15) {
    const markerSymbol = Symbol.for(marker15);
    return error != null && typeof error === "object" && markerSymbol in error && typeof error[markerSymbol] === "boolean" && error[markerSymbol] === true;
  }
};
_a$1 = symbol$1;
var AISDKError = _AISDKError;

// src/errors/api-call-error.ts
var name$1 = "AI_APICallError";
var marker2$1 = `vercel.ai.error.${name$1}`;
var symbol2$1 = Symbol.for(marker2$1);
var _a2$1;
var APICallError = class extends AISDKError {
  constructor({
    message,
    url,
    requestBodyValues,
    statusCode,
    responseHeaders,
    responseBody,
    cause,
    isRetryable = statusCode != null && (statusCode === 408 || // request timeout
    statusCode === 409 || // conflict
    statusCode === 429 || // too many requests
    statusCode >= 500),
    // server error
    data
  }) {
    super({ name: name$1, message, cause });
    this[_a2$1] = true;
    this.url = url;
    this.requestBodyValues = requestBodyValues;
    this.statusCode = statusCode;
    this.responseHeaders = responseHeaders;
    this.responseBody = responseBody;
    this.isRetryable = isRetryable;
    this.data = data;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker2$1);
  }
};
_a2$1 = symbol2$1;

// src/errors/get-error-message.ts
function getErrorMessage$1(error) {
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

// src/errors/invalid-argument-error.ts
var name3 = "AI_InvalidArgumentError";
var marker4$1 = `vercel.ai.error.${name3}`;
var symbol4$1 = Symbol.for(marker4$1);
var _a4$1;
var InvalidArgumentError$1 = class InvalidArgumentError extends AISDKError {
  constructor({
    message,
    cause,
    argument
  }) {
    super({ name: name3, message, cause });
    this[_a4$1] = true;
    this.argument = argument;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker4$1);
  }
};
_a4$1 = symbol4$1;

// src/errors/json-parse-error.ts
var name6 = "AI_JSONParseError";
var marker7 = `vercel.ai.error.${name6}`;
var symbol7 = Symbol.for(marker7);
var _a7;
var JSONParseError = class extends AISDKError {
  constructor({ text, cause }) {
    super({
      name: name6,
      message: `JSON parsing failed: Text: ${text}.
Error message: ${getErrorMessage$1(cause)}`,
      cause
    });
    this[_a7] = true;
    this.text = text;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker7);
  }
};
_a7 = symbol7;

// src/errors/type-validation-error.ts
var name12 = "AI_TypeValidationError";
var marker13 = `vercel.ai.error.${name12}`;
var symbol13 = Symbol.for(marker13);
var _a13;
var _TypeValidationError = class _TypeValidationError extends AISDKError {
  constructor({ value, cause }) {
    super({
      name: name12,
      message: `Type validation failed: Value: ${JSON.stringify(value)}.
Error message: ${getErrorMessage$1(cause)}`,
      cause
    });
    this[_a13] = true;
    this.value = value;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker13);
  }
  /**
   * Wraps an error into a TypeValidationError.
   * If the cause is already a TypeValidationError with the same value, it returns the cause.
   * Otherwise, it creates a new TypeValidationError.
   *
   * @param {Object} params - The parameters for wrapping the error.
   * @param {unknown} params.value - The value that failed validation.
   * @param {unknown} params.cause - The original error or cause of the validation failure.
   * @returns {TypeValidationError} A TypeValidationError instance.
   */
  static wrap({
    value,
    cause
  }) {
    return _TypeValidationError.isInstance(cause) && cause.value === value ? cause : new _TypeValidationError({ value, cause });
  }
};
_a13 = symbol13;
var TypeValidationError = _TypeValidationError;

// src/combine-headers.ts

// src/convert-async-iterator-to-readable-stream.ts
function convertAsyncIteratorToReadableStream(iterator) {
  return new ReadableStream({
    /**
     * Called when the consumer wants to pull more data from the stream.
     *
     * @param {ReadableStreamDefaultController<T>} controller - The controller to enqueue data into the stream.
     * @returns {Promise<void>}
     */
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      } catch (error) {
        controller.error(error);
      }
    },
    /**
     * Called when the consumer cancels the stream.
     */
    cancel() {
    }
  });
}

// src/delay.ts
async function delay(delayInMs) {
  return delayInMs == null ? Promise.resolve() : new Promise((resolve2) => setTimeout(resolve2, delayInMs));
}
var createIdGenerator = ({
  prefix,
  size: defaultSize = 16,
  alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  separator = "-"
} = {}) => {
  const generator = customAlphabet(alphabet, defaultSize);
  if (prefix == null) {
    return generator;
  }
  if (alphabet.includes(separator)) {
    throw new InvalidArgumentError$1({
      argument: "separator",
      message: `The separator "${separator}" must not be part of the alphabet "${alphabet}".`
    });
  }
  return (size) => `${prefix}${separator}${generator(size)}`;
};
createIdGenerator();

// src/get-error-message.ts
function getErrorMessage(error) {
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

// src/is-abort-error.ts
function isAbortError(error) {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}

// src/validator.ts
var validatorSymbol = Symbol.for("vercel.ai.validator");
function validator(validate) {
  return { [validatorSymbol]: true, validate };
}
function isValidator(value) {
  return typeof value === "object" && value !== null && validatorSymbol in value && value[validatorSymbol] === true && "validate" in value;
}
function asValidator(value) {
  return isValidator(value) ? value : zodValidator(value);
}
function zodValidator(zodSchema) {
  return validator((value) => {
    const result = zodSchema.safeParse(value);
    return result.success ? { success: true, value: result.data } : { success: false, error: result.error };
  });
}
function safeValidateTypes({
  value,
  schema
}) {
  const validator2 = asValidator(schema);
  try {
    if (validator2.validate == null) {
      return { success: true, value };
    }
    const result = validator2.validate(value);
    if (result.success) {
      return result;
    }
    return {
      success: false,
      error: TypeValidationError.wrap({ value, cause: result.error })
    };
  } catch (error) {
    return {
      success: false,
      error: TypeValidationError.wrap({ value, cause: error })
    };
  }
}
function safeParseJSON({
  text,
  schema
}) {
  try {
    const value = SecureJSON.parse(text);
    if (schema == null) {
      return { success: true, value, rawValue: value };
    }
    const validationResult = safeValidateTypes({ value, schema });
    return validationResult.success ? { ...validationResult, rawValue: value } : validationResult;
  } catch (error) {
    return {
      success: false,
      error: JSONParseError.isInstance(error) ? error : new JSONParseError({ text, cause: error })
    };
  }
}

var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name17 in all)
    __defProp(target, name17, { get: all[name17], enumerable: true });
};

// core/util/prepare-response-headers.ts
function prepareResponseHeaders(headers, {
  contentType,
  dataStreamVersion
}) {
  const responseHeaders = new Headers(headers != null ? headers : {});
  if (!responseHeaders.has("Content-Type")) {
    responseHeaders.set("Content-Type", contentType);
  }
  {
    responseHeaders.set("X-Vercel-AI-Data-Stream", dataStreamVersion);
  }
  return responseHeaders;
}
var UnsupportedModelVersionError = class extends AISDKError {
  constructor() {
    super({
      name: "AI_UnsupportedModelVersionError",
      message: `Unsupported model version. AI SDK 4 only supports models that implement specification version "v1". Please upgrade to AI SDK 5 to use this model.`
    });
  }
};
var name = "AI_InvalidArgumentError";
var marker = `vercel.ai.error.${name}`;
var symbol = Symbol.for(marker);
var _a;
var InvalidArgumentError = class extends AISDKError {
  constructor({
    parameter,
    value,
    message
  }) {
    super({
      name,
      message: `Invalid argument for parameter ${parameter}: ${message}`
    });
    this[_a] = true;
    this.parameter = parameter;
    this.value = value;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker);
  }
};
_a = symbol;
var name2 = "AI_RetryError";
var marker2 = `vercel.ai.error.${name2}`;
var symbol2 = Symbol.for(marker2);
var _a2;
var RetryError = class extends AISDKError {
  constructor({
    message,
    reason,
    errors
  }) {
    super({ name: name2, message });
    this[_a2] = true;
    this.reason = reason;
    this.errors = errors;
    this.lastError = errors[errors.length - 1];
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker2);
  }
};
_a2 = symbol2;

// util/retry-with-exponential-backoff.ts
var retryWithExponentialBackoff = ({
  maxRetries = 2,
  initialDelayInMs = 2e3,
  backoffFactor = 2
} = {}) => async (f) => _retryWithExponentialBackoff(f, {
  maxRetries,
  delayInMs: initialDelayInMs,
  backoffFactor
});
async function _retryWithExponentialBackoff(f, {
  maxRetries,
  delayInMs,
  backoffFactor
}, errors = []) {
  try {
    return await f();
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    if (maxRetries === 0) {
      throw error;
    }
    const errorMessage = getErrorMessage(error);
    const newErrors = [...errors, error];
    const tryNumber = newErrors.length;
    if (tryNumber > maxRetries) {
      throw new RetryError({
        message: `Failed after ${tryNumber} attempts. Last error: ${errorMessage}`,
        reason: "maxRetriesExceeded",
        errors: newErrors
      });
    }
    if (error instanceof Error && APICallError.isInstance(error) && error.isRetryable === true && tryNumber <= maxRetries) {
      await delay(delayInMs);
      return _retryWithExponentialBackoff(
        f,
        { maxRetries, delayInMs: backoffFactor * delayInMs, backoffFactor },
        newErrors
      );
    }
    if (tryNumber === 1) {
      throw error;
    }
    throw new RetryError({
      message: `Failed after ${tryNumber} attempts with non-retryable error: '${errorMessage}'`,
      reason: "errorNotRetryable",
      errors: newErrors
    });
  }
}

// core/prompt/prepare-retries.ts
function prepareRetries({
  maxRetries
}) {
  if (maxRetries != null) {
    if (!Number.isInteger(maxRetries)) {
      throw new InvalidArgumentError({
        parameter: "maxRetries",
        value: maxRetries,
        message: "maxRetries must be an integer"
      });
    }
    if (maxRetries < 0) {
      throw new InvalidArgumentError({
        parameter: "maxRetries",
        value: maxRetries,
        message: "maxRetries must be >= 0"
      });
    }
  }
  const maxRetriesResult = maxRetries != null ? maxRetries : 2;
  return {
    maxRetries: maxRetriesResult,
    retry: retryWithExponentialBackoff({ maxRetries: maxRetriesResult })
  };
}

// core/telemetry/assemble-operation-name.ts
function assembleOperationName({
  operationId,
  telemetry
}) {
  return {
    // standardized operation and resource name:
    "operation.name": `${operationId}${(telemetry == null ? void 0 : telemetry.functionId) != null ? ` ${telemetry.functionId}` : ""}`,
    "resource.name": telemetry == null ? void 0 : telemetry.functionId,
    // detailed, AI SDK specific data:
    "ai.operationId": operationId,
    "ai.telemetry.functionId": telemetry == null ? void 0 : telemetry.functionId
  };
}

// core/telemetry/get-base-telemetry-attributes.ts
function getBaseTelemetryAttributes({
  model,
  settings,
  telemetry,
  headers
}) {
  var _a17;
  return {
    "ai.model.provider": model.provider,
    "ai.model.id": model.modelId,
    // settings:
    ...Object.entries(settings).reduce((attributes, [key, value]) => {
      attributes[`ai.settings.${key}`] = value;
      return attributes;
    }, {}),
    // add metadata as attributes:
    ...Object.entries((_a17 = telemetry == null ? void 0 : telemetry.metadata) != null ? _a17 : {}).reduce(
      (attributes, [key, value]) => {
        attributes[`ai.telemetry.metadata.${key}`] = value;
        return attributes;
      },
      {}
    ),
    // request headers
    ...Object.entries(headers != null ? headers : {}).reduce((attributes, [key, value]) => {
      if (value !== void 0) {
        attributes[`ai.request.headers.${key}`] = value;
      }
      return attributes;
    }, {})
  };
}

// core/telemetry/noop-tracer.ts
var noopTracer = {
  startSpan() {
    return noopSpan;
  },
  startActiveSpan(name17, arg1, arg2, arg3) {
    if (typeof arg1 === "function") {
      return arg1(noopSpan);
    }
    if (typeof arg2 === "function") {
      return arg2(noopSpan);
    }
    if (typeof arg3 === "function") {
      return arg3(noopSpan);
    }
  }
};
var noopSpan = {
  spanContext() {
    return noopSpanContext;
  },
  setAttribute() {
    return this;
  },
  setAttributes() {
    return this;
  },
  addEvent() {
    return this;
  },
  addLink() {
    return this;
  },
  addLinks() {
    return this;
  },
  setStatus() {
    return this;
  },
  updateName() {
    return this;
  },
  end() {
    return this;
  },
  isRecording() {
    return false;
  },
  recordException() {
    return this;
  }
};
var noopSpanContext = {
  traceId: "",
  spanId: "",
  traceFlags: 0
};

// core/telemetry/get-tracer.ts
function getTracer({
  isEnabled = false,
  tracer
} = {}) {
  if (!isEnabled) {
    return noopTracer;
  }
  if (tracer) {
    return tracer;
  }
  return trace.getTracer("ai");
}
function recordSpan({
  name: name17,
  tracer,
  attributes,
  fn,
  endWhenDone = true
}) {
  return tracer.startActiveSpan(name17, { attributes }, async (span) => {
    try {
      const result = await fn(span);
      if (endWhenDone) {
        span.end();
      }
      return result;
    } catch (error) {
      try {
        recordErrorOnSpan(span, error);
      } finally {
        span.end();
      }
      throw error;
    }
  });
}
function recordErrorOnSpan(span, error) {
  if (error instanceof Error) {
    span.recordException({
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });
  } else {
    span.setStatus({ code: SpanStatusCode.ERROR });
  }
}

// core/telemetry/select-telemetry-attributes.ts
function selectTelemetryAttributes({
  telemetry,
  attributes
}) {
  if ((telemetry == null ? void 0 : telemetry.isEnabled) !== true) {
    return {};
  }
  return Object.entries(attributes).reduce((attributes2, [key, value]) => {
    if (value === void 0) {
      return attributes2;
    }
    if (typeof value === "object" && "input" in value && typeof value.input === "function") {
      if ((telemetry == null ? void 0 : telemetry.recordInputs) === false) {
        return attributes2;
      }
      const result = value.input();
      return result === void 0 ? attributes2 : { ...attributes2, [key]: result };
    }
    if (typeof value === "object" && "output" in value && typeof value.output === "function") {
      if ((telemetry == null ? void 0 : telemetry.recordOutputs) === false) {
        return attributes2;
      }
      const result = value.output();
      return result === void 0 ? attributes2 : { ...attributes2, [key]: result };
    }
    return { ...attributes2, [key]: value };
  }, {});
}

// core/util/split-array.ts
function splitArray(array, chunkSize) {
  if (chunkSize <= 0) {
    throw new Error("chunkSize must be greater than 0");
  }
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

// core/embed/embed-many.ts
async function embedMany({
  model,
  values,
  maxRetries: maxRetriesArg,
  abortSignal,
  headers,
  experimental_telemetry: telemetry
}) {
  if (typeof model === "string" || model.specificationVersion !== "v1") {
    throw new UnsupportedModelVersionError();
  }
  const { maxRetries, retry } = prepareRetries({ maxRetries: maxRetriesArg });
  const baseTelemetryAttributes = getBaseTelemetryAttributes({
    model,
    telemetry,
    headers,
    settings: { maxRetries }
  });
  const tracer = getTracer(telemetry);
  return recordSpan({
    name: "ai.embedMany",
    attributes: selectTelemetryAttributes({
      telemetry,
      attributes: {
        ...assembleOperationName({ operationId: "ai.embedMany", telemetry }),
        ...baseTelemetryAttributes,
        // specific settings that only make sense on the outer level:
        "ai.values": {
          input: () => values.map((value) => JSON.stringify(value))
        }
      }
    }),
    tracer,
    fn: async (span) => {
      const maxEmbeddingsPerCall = model.maxEmbeddingsPerCall;
      if (maxEmbeddingsPerCall == null) {
        const { embeddings: embeddings2, usage } = await retry(() => {
          return recordSpan({
            name: "ai.embedMany.doEmbed",
            attributes: selectTelemetryAttributes({
              telemetry,
              attributes: {
                ...assembleOperationName({
                  operationId: "ai.embedMany.doEmbed",
                  telemetry
                }),
                ...baseTelemetryAttributes,
                // specific settings that only make sense on the outer level:
                "ai.values": {
                  input: () => values.map((value) => JSON.stringify(value))
                }
              }
            }),
            tracer,
            fn: async (doEmbedSpan) => {
              var _a17;
              const modelResponse = await model.doEmbed({
                values,
                abortSignal,
                headers
              });
              const embeddings3 = modelResponse.embeddings;
              const usage2 = (_a17 = modelResponse.usage) != null ? _a17 : { tokens: NaN };
              doEmbedSpan.setAttributes(
                selectTelemetryAttributes({
                  telemetry,
                  attributes: {
                    "ai.embeddings": {
                      output: () => embeddings3.map((embedding) => JSON.stringify(embedding))
                    },
                    "ai.usage.tokens": usage2.tokens
                  }
                })
              );
              return { embeddings: embeddings3, usage: usage2 };
            }
          });
        });
        span.setAttributes(
          selectTelemetryAttributes({
            telemetry,
            attributes: {
              "ai.embeddings": {
                output: () => embeddings2.map((embedding) => JSON.stringify(embedding))
              },
              "ai.usage.tokens": usage.tokens
            }
          })
        );
        return new DefaultEmbedManyResult({ values, embeddings: embeddings2, usage });
      }
      const valueChunks = splitArray(values, maxEmbeddingsPerCall);
      const embeddings = [];
      let tokens = 0;
      for (const chunk of valueChunks) {
        const { embeddings: responseEmbeddings, usage } = await retry(() => {
          return recordSpan({
            name: "ai.embedMany.doEmbed",
            attributes: selectTelemetryAttributes({
              telemetry,
              attributes: {
                ...assembleOperationName({
                  operationId: "ai.embedMany.doEmbed",
                  telemetry
                }),
                ...baseTelemetryAttributes,
                // specific settings that only make sense on the outer level:
                "ai.values": {
                  input: () => chunk.map((value) => JSON.stringify(value))
                }
              }
            }),
            tracer,
            fn: async (doEmbedSpan) => {
              var _a17;
              const modelResponse = await model.doEmbed({
                values: chunk,
                abortSignal,
                headers
              });
              const embeddings2 = modelResponse.embeddings;
              const usage2 = (_a17 = modelResponse.usage) != null ? _a17 : { tokens: NaN };
              doEmbedSpan.setAttributes(
                selectTelemetryAttributes({
                  telemetry,
                  attributes: {
                    "ai.embeddings": {
                      output: () => embeddings2.map((embedding) => JSON.stringify(embedding))
                    },
                    "ai.usage.tokens": usage2.tokens
                  }
                })
              );
              return { embeddings: embeddings2, usage: usage2 };
            }
          });
        });
        embeddings.push(...responseEmbeddings);
        tokens += usage.tokens;
      }
      span.setAttributes(
        selectTelemetryAttributes({
          telemetry,
          attributes: {
            "ai.embeddings": {
              output: () => embeddings.map((embedding) => JSON.stringify(embedding))
            },
            "ai.usage.tokens": tokens
          }
        })
      );
      return new DefaultEmbedManyResult({
        values,
        embeddings,
        usage: { tokens }
      });
    }
  });
}
var DefaultEmbedManyResult = class {
  constructor(options) {
    this.values = options.values;
    this.embeddings = options.embeddings;
    this.usage = options.usage;
  }
};
var name4 = "AI_NoObjectGeneratedError";
var marker4 = `vercel.ai.error.${name4}`;
var symbol4 = Symbol.for(marker4);
var _a4;
var NoObjectGeneratedError = class extends AISDKError {
  constructor({
    message = "No object generated.",
    cause,
    text: text2,
    response,
    usage,
    finishReason
  }) {
    super({ name: name4, message, cause });
    this[_a4] = true;
    this.text = text2;
    this.response = response;
    this.usage = usage;
    this.finishReason = finishReason;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker4);
  }
};
_a4 = symbol4;
var dataContentSchema = unionType([
  stringType(),
  instanceOfType(Uint8Array),
  instanceOfType(ArrayBuffer),
  custom(
    // Buffer might not be available in some environments such as CloudFlare:
    (value) => {
      var _a17, _b;
      return (_b = (_a17 = globalThis.Buffer) == null ? void 0 : _a17.isBuffer(value)) != null ? _b : false;
    },
    { message: "Must be a Buffer" }
  )
]);
var jsonValueSchema = lazyType(
  () => unionType([
    nullType(),
    stringType(),
    numberType(),
    booleanType(),
    recordType(stringType(), jsonValueSchema),
    arrayType(jsonValueSchema)
  ])
);

// core/types/provider-metadata.ts
var providerMetadataSchema = recordType(
  stringType(),
  recordType(stringType(), jsonValueSchema)
);
var toolResultContentSchema = arrayType(
  unionType([
    objectType({ type: literalType("text"), text: stringType() }),
    objectType({
      type: literalType("image"),
      data: stringType(),
      mimeType: stringType().optional()
    })
  ])
);

// core/prompt/content-part.ts
var textPartSchema = objectType({
  type: literalType("text"),
  text: stringType(),
  providerOptions: providerMetadataSchema.optional(),
  experimental_providerMetadata: providerMetadataSchema.optional()
});
var imagePartSchema = objectType({
  type: literalType("image"),
  image: unionType([dataContentSchema, instanceOfType(URL)]),
  mimeType: stringType().optional(),
  providerOptions: providerMetadataSchema.optional(),
  experimental_providerMetadata: providerMetadataSchema.optional()
});
var filePartSchema = objectType({
  type: literalType("file"),
  data: unionType([dataContentSchema, instanceOfType(URL)]),
  filename: stringType().optional(),
  mimeType: stringType(),
  providerOptions: providerMetadataSchema.optional(),
  experimental_providerMetadata: providerMetadataSchema.optional()
});
var reasoningPartSchema = objectType({
  type: literalType("reasoning"),
  text: stringType(),
  providerOptions: providerMetadataSchema.optional(),
  experimental_providerMetadata: providerMetadataSchema.optional()
});
var redactedReasoningPartSchema = objectType({
  type: literalType("redacted-reasoning"),
  data: stringType(),
  providerOptions: providerMetadataSchema.optional(),
  experimental_providerMetadata: providerMetadataSchema.optional()
});
var toolCallPartSchema = objectType({
  type: literalType("tool-call"),
  toolCallId: stringType(),
  toolName: stringType(),
  args: unknownType(),
  providerOptions: providerMetadataSchema.optional(),
  experimental_providerMetadata: providerMetadataSchema.optional()
});
var toolResultPartSchema = objectType({
  type: literalType("tool-result"),
  toolCallId: stringType(),
  toolName: stringType(),
  result: unknownType(),
  content: toolResultContentSchema.optional(),
  isError: booleanType().optional(),
  providerOptions: providerMetadataSchema.optional(),
  experimental_providerMetadata: providerMetadataSchema.optional()
});

// core/prompt/message.ts
var coreSystemMessageSchema = objectType({
  role: literalType("system"),
  content: stringType(),
  providerOptions: providerMetadataSchema.optional(),
  experimental_providerMetadata: providerMetadataSchema.optional()
});
var coreUserMessageSchema = objectType({
  role: literalType("user"),
  content: unionType([
    stringType(),
    arrayType(unionType([textPartSchema, imagePartSchema, filePartSchema]))
  ]),
  providerOptions: providerMetadataSchema.optional(),
  experimental_providerMetadata: providerMetadataSchema.optional()
});
var coreAssistantMessageSchema = objectType({
  role: literalType("assistant"),
  content: unionType([
    stringType(),
    arrayType(
      unionType([
        textPartSchema,
        filePartSchema,
        reasoningPartSchema,
        redactedReasoningPartSchema,
        toolCallPartSchema
      ])
    )
  ]),
  providerOptions: providerMetadataSchema.optional(),
  experimental_providerMetadata: providerMetadataSchema.optional()
});
var coreToolMessageSchema = objectType({
  role: literalType("tool"),
  content: arrayType(toolResultPartSchema),
  providerOptions: providerMetadataSchema.optional(),
  experimental_providerMetadata: providerMetadataSchema.optional()
});
unionType([
  coreSystemMessageSchema,
  coreUserMessageSchema,
  coreAssistantMessageSchema,
  coreToolMessageSchema
]);

// core/generate-object/inject-json-instruction.ts
var DEFAULT_SCHEMA_PREFIX = "JSON schema:";
var DEFAULT_SCHEMA_SUFFIX = "You MUST answer with a JSON object that matches the JSON schema above.";
var DEFAULT_GENERIC_SUFFIX = "You MUST answer with JSON.";
function injectJsonInstruction({
  prompt,
  schema,
  schemaPrefix = schema != null ? DEFAULT_SCHEMA_PREFIX : void 0,
  schemaSuffix = schema != null ? DEFAULT_SCHEMA_SUFFIX : DEFAULT_GENERIC_SUFFIX
}) {
  return [
    prompt != null && prompt.length > 0 ? prompt : void 0,
    prompt != null && prompt.length > 0 ? "" : void 0,
    // add a newline if prompt is not null
    schemaPrefix,
    schema != null ? JSON.stringify(schema) : void 0,
    schemaSuffix
  ].filter((line) => line != null).join("\n");
}

// core/generate-object/generate-object.ts
createIdGenerator({ prefix: "aiobj", size: 24 });

// core/generate-object/stream-object.ts
createIdGenerator({ prefix: "aiobj", size: 24 });

// core/generate-text/generate-text.ts
createIdGenerator({
  prefix: "aitxt",
  size: 24
});
createIdGenerator({
  prefix: "msg",
  size: 24
});

// core/generate-text/output.ts
var output_exports = {};
__export(output_exports, {
  object: () => object,
  text: () => text
});

// core/generate-text/output.ts
var text = () => ({
  type: "text",
  responseFormat: () => ({ type: "text" }),
  injectIntoSystemPrompt({ system }) {
    return system;
  },
  parsePartial({ text: text2 }) {
    return { partial: text2 };
  },
  parseOutput({ text: text2 }) {
    return text2;
  }
});
var object = ({
  schema: inputSchema
}) => {
  const schema = asSchema(inputSchema);
  return {
    type: "object",
    responseFormat: ({ model }) => ({
      type: "json",
      schema: model.supportsStructuredOutputs ? schema.jsonSchema : void 0
    }),
    injectIntoSystemPrompt({ system, model }) {
      return model.supportsStructuredOutputs ? system : injectJsonInstruction({
        prompt: system,
        schema: schema.jsonSchema
      });
    },
    parsePartial({ text: text2 }) {
      const result = parsePartialJson(text2);
      switch (result.state) {
        case "failed-parse":
        case "undefined-input":
          return void 0;
        case "repaired-parse":
        case "successful-parse":
          return {
            // Note: currently no validation of partial results:
            partial: result.value
          };
        default: {
          const _exhaustiveCheck = result.state;
          throw new Error(`Unsupported parse state: ${_exhaustiveCheck}`);
        }
      }
    },
    parseOutput({ text: text2 }, context) {
      const parseResult = safeParseJSON({ text: text2 });
      if (!parseResult.success) {
        throw new NoObjectGeneratedError({
          message: "No object generated: could not parse the response.",
          cause: parseResult.error,
          text: text2,
          response: context.response,
          usage: context.usage,
          finishReason: context.finishReason
        });
      }
      const validationResult = safeValidateTypes({
        value: parseResult.value,
        schema
      });
      if (!validationResult.success) {
        throw new NoObjectGeneratedError({
          message: "No object generated: response did not match schema.",
          cause: validationResult.error,
          text: text2,
          response: context.response,
          usage: context.usage,
          finishReason: context.finishReason
        });
      }
      return validationResult.value;
    }
  };
};

// core/util/merge-streams.ts
function mergeStreams(stream1, stream2) {
  const reader1 = stream1.getReader();
  const reader2 = stream2.getReader();
  let lastRead1 = void 0;
  let lastRead2 = void 0;
  let stream1Done = false;
  let stream2Done = false;
  async function readStream1(controller) {
    try {
      if (lastRead1 == null) {
        lastRead1 = reader1.read();
      }
      const result = await lastRead1;
      lastRead1 = void 0;
      if (!result.done) {
        controller.enqueue(result.value);
      } else {
        controller.close();
      }
    } catch (error) {
      controller.error(error);
    }
  }
  async function readStream2(controller) {
    try {
      if (lastRead2 == null) {
        lastRead2 = reader2.read();
      }
      const result = await lastRead2;
      lastRead2 = void 0;
      if (!result.done) {
        controller.enqueue(result.value);
      } else {
        controller.close();
      }
    } catch (error) {
      controller.error(error);
    }
  }
  return new ReadableStream({
    async pull(controller) {
      try {
        if (stream1Done) {
          await readStream2(controller);
          return;
        }
        if (stream2Done) {
          await readStream1(controller);
          return;
        }
        if (lastRead1 == null) {
          lastRead1 = reader1.read();
        }
        if (lastRead2 == null) {
          lastRead2 = reader2.read();
        }
        const { result, reader } = await Promise.race([
          lastRead1.then((result2) => ({ result: result2, reader: reader1 })),
          lastRead2.then((result2) => ({ result: result2, reader: reader2 }))
        ]);
        if (!result.done) {
          controller.enqueue(result.value);
        }
        if (reader === reader1) {
          lastRead1 = void 0;
          if (result.done) {
            await readStream2(controller);
            stream1Done = true;
          }
        } else {
          lastRead2 = void 0;
          if (result.done) {
            stream2Done = true;
            await readStream1(controller);
          }
        }
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      reader1.cancel();
      reader2.cancel();
    }
  });
}

// core/generate-text/stream-text.ts
createIdGenerator({
  prefix: "aitxt",
  size: 24
});
createIdGenerator({
  prefix: "msg",
  size: 24
});
var ClientOrServerImplementationSchema = objectType({
  name: stringType(),
  version: stringType()
}).passthrough();
var BaseParamsSchema = objectType({
  _meta: optionalType(objectType({}).passthrough())
}).passthrough();
var ResultSchema = BaseParamsSchema;
var RequestSchema = objectType({
  method: stringType(),
  params: optionalType(BaseParamsSchema)
});
var ServerCapabilitiesSchema = objectType({
  experimental: optionalType(objectType({}).passthrough()),
  logging: optionalType(objectType({}).passthrough()),
  prompts: optionalType(
    objectType({
      listChanged: optionalType(booleanType())
    }).passthrough()
  ),
  resources: optionalType(
    objectType({
      subscribe: optionalType(booleanType()),
      listChanged: optionalType(booleanType())
    }).passthrough()
  ),
  tools: optionalType(
    objectType({
      listChanged: optionalType(booleanType())
    }).passthrough()
  )
}).passthrough();
ResultSchema.extend({
  protocolVersion: stringType(),
  capabilities: ServerCapabilitiesSchema,
  serverInfo: ClientOrServerImplementationSchema,
  instructions: optionalType(stringType())
});
var PaginatedResultSchema = ResultSchema.extend({
  nextCursor: optionalType(stringType())
});
var ToolSchema = objectType({
  name: stringType(),
  description: optionalType(stringType()),
  inputSchema: objectType({
    type: literalType("object"),
    properties: optionalType(objectType({}).passthrough())
  }).passthrough()
}).passthrough();
PaginatedResultSchema.extend({
  tools: arrayType(ToolSchema)
});
var TextContentSchema = objectType({
  type: literalType("text"),
  text: stringType()
}).passthrough();
var ImageContentSchema = objectType({
  type: literalType("image"),
  data: stringType().base64(),
  mimeType: stringType()
}).passthrough();
var ResourceContentsSchema = objectType({
  /**
   * The URI of this resource.
   */
  uri: stringType(),
  /**
   * The MIME type of this resource, if known.
   */
  mimeType: optionalType(stringType())
}).passthrough();
var TextResourceContentsSchema = ResourceContentsSchema.extend({
  text: stringType()
});
var BlobResourceContentsSchema = ResourceContentsSchema.extend({
  blob: stringType().base64()
});
var EmbeddedResourceSchema = objectType({
  type: literalType("resource"),
  resource: unionType([TextResourceContentsSchema, BlobResourceContentsSchema])
}).passthrough();
ResultSchema.extend({
  content: arrayType(
    unionType([TextContentSchema, ImageContentSchema, EmbeddedResourceSchema])
  ),
  isError: booleanType().default(false).optional()
}).or(
  ResultSchema.extend({
    toolResult: unknownType()
  })
);

// core/tool/mcp/json-rpc-message.ts
var JSONRPC_VERSION = "2.0";
var JSONRPCRequestSchema = objectType({
  jsonrpc: literalType(JSONRPC_VERSION),
  id: unionType([stringType(), numberType().int()])
}).merge(RequestSchema).strict();
var JSONRPCResponseSchema = objectType({
  jsonrpc: literalType(JSONRPC_VERSION),
  id: unionType([stringType(), numberType().int()]),
  result: ResultSchema
}).strict();
var JSONRPCErrorSchema = objectType({
  jsonrpc: literalType(JSONRPC_VERSION),
  id: unionType([stringType(), numberType().int()]),
  error: objectType({
    code: numberType().int(),
    message: stringType(),
    data: optionalType(unknownType())
  })
}).strict();
var JSONRPCNotificationSchema = objectType({
  jsonrpc: literalType(JSONRPC_VERSION)
}).merge(
  objectType({
    method: stringType(),
    params: optionalType(BaseParamsSchema)
  })
).strict();
unionType([
  JSONRPCRequestSchema,
  JSONRPCNotificationSchema,
  JSONRPCResponseSchema,
  JSONRPCErrorSchema
]);

// streams/langchain-adapter.ts
var langchain_adapter_exports = {};
__export(langchain_adapter_exports, {
  mergeIntoDataStream: () => mergeIntoDataStream,
  toDataStream: () => toDataStream,
  toDataStreamResponse: () => toDataStreamResponse
});

// streams/stream-callbacks.ts
function createCallbacksTransformer(callbacks = {}) {
  const textEncoder = new TextEncoder();
  let aggregatedResponse = "";
  return new TransformStream({
    async start() {
      if (callbacks.onStart)
        await callbacks.onStart();
    },
    async transform(message, controller) {
      controller.enqueue(textEncoder.encode(message));
      aggregatedResponse += message;
      if (callbacks.onToken)
        await callbacks.onToken(message);
      if (callbacks.onText && typeof message === "string") {
        await callbacks.onText(message);
      }
    },
    async flush() {
      if (callbacks.onCompletion) {
        await callbacks.onCompletion(aggregatedResponse);
      }
      if (callbacks.onFinal) {
        await callbacks.onFinal(aggregatedResponse);
      }
    }
  });
}

// streams/langchain-adapter.ts
function toDataStreamInternal(stream, callbacks) {
  return stream.pipeThrough(
    new TransformStream({
      transform: async (value, controller) => {
        var _a17;
        if (typeof value === "string") {
          controller.enqueue(value);
          return;
        }
        if ("event" in value) {
          if (value.event === "on_chat_model_stream") {
            forwardAIMessageChunk(
              (_a17 = value.data) == null ? void 0 : _a17.chunk,
              controller
            );
          }
          return;
        }
        forwardAIMessageChunk(value, controller);
      }
    })
  ).pipeThrough(createCallbacksTransformer(callbacks)).pipeThrough(new TextDecoderStream()).pipeThrough(
    new TransformStream({
      transform: async (chunk, controller) => {
        controller.enqueue(formatDataStreamPart("text", chunk));
      }
    })
  );
}
function toDataStream(stream, callbacks) {
  return toDataStreamInternal(stream, callbacks).pipeThrough(
    new TextEncoderStream()
  );
}
function toDataStreamResponse(stream, options) {
  var _a17;
  const dataStream = toDataStreamInternal(
    stream,
    options == null ? void 0 : options.callbacks
  ).pipeThrough(new TextEncoderStream());
  const data = options == null ? void 0 : options.data;
  const init = options == null ? void 0 : options.init;
  const responseStream = data ? mergeStreams(data.stream, dataStream) : dataStream;
  return new Response(responseStream, {
    status: (_a17 = init == null ? void 0 : init.status) != null ? _a17 : 200,
    statusText: init == null ? void 0 : init.statusText,
    headers: prepareResponseHeaders(init == null ? void 0 : init.headers, {
      contentType: "text/plain; charset=utf-8",
      dataStreamVersion: "v1"
    })
  });
}
function mergeIntoDataStream(stream, options) {
  options.dataStream.merge(toDataStreamInternal(stream, options.callbacks));
}
function forwardAIMessageChunk(chunk, controller) {
  if (typeof chunk.content === "string") {
    controller.enqueue(chunk.content);
  } else {
    const content = chunk.content;
    for (const item of content) {
      if (item.type === "text") {
        controller.enqueue(item.text);
      }
    }
  }
}

// streams/llamaindex-adapter.ts
var llamaindex_adapter_exports = {};
__export(llamaindex_adapter_exports, {
  mergeIntoDataStream: () => mergeIntoDataStream2,
  toDataStream: () => toDataStream2,
  toDataStreamResponse: () => toDataStreamResponse2
});
function toDataStreamInternal2(stream, callbacks) {
  const trimStart = trimStartOfStream();
  return convertAsyncIteratorToReadableStream(stream[Symbol.asyncIterator]()).pipeThrough(
    new TransformStream({
      async transform(message, controller) {
        controller.enqueue(trimStart(message.delta));
      }
    })
  ).pipeThrough(createCallbacksTransformer(callbacks)).pipeThrough(new TextDecoderStream()).pipeThrough(
    new TransformStream({
      transform: async (chunk, controller) => {
        controller.enqueue(formatDataStreamPart("text", chunk));
      }
    })
  );
}
function toDataStream2(stream, callbacks) {
  return toDataStreamInternal2(stream, callbacks).pipeThrough(
    new TextEncoderStream()
  );
}
function toDataStreamResponse2(stream, options = {}) {
  var _a17;
  const { init, data, callbacks } = options;
  const dataStream = toDataStreamInternal2(stream, callbacks).pipeThrough(
    new TextEncoderStream()
  );
  const responseStream = data ? mergeStreams(data.stream, dataStream) : dataStream;
  return new Response(responseStream, {
    status: (_a17 = init == null ? void 0 : init.status) != null ? _a17 : 200,
    statusText: init == null ? void 0 : init.statusText,
    headers: prepareResponseHeaders(init == null ? void 0 : init.headers, {
      contentType: "text/plain; charset=utf-8",
      dataStreamVersion: "v1"
    })
  });
}
function mergeIntoDataStream2(stream, options) {
  options.dataStream.merge(toDataStreamInternal2(stream, options.callbacks));
}
function trimStartOfStream() {
  let isStreamStart = true;
  return (text2) => {
    if (isStreamStart) {
      text2 = text2.trimStart();
      if (text2)
        isStreamStart = false;
    }
    return text2;
  };
}

const E_CANCELED = new Error('request for lock canceled');

var __awaiter$2 = function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Semaphore {
    constructor(_value, _cancelError = E_CANCELED) {
        this._value = _value;
        this._cancelError = _cancelError;
        this._queue = [];
        this._weightedWaiters = [];
    }
    acquire(weight = 1, priority = 0) {
        if (weight <= 0)
            throw new Error(`invalid weight ${weight}: must be positive`);
        return new Promise((resolve, reject) => {
            const task = { resolve, reject, weight, priority };
            const i = findIndexFromEnd(this._queue, (other) => priority <= other.priority);
            if (i === -1 && weight <= this._value) {
                // Needs immediate dispatch, skip the queue
                this._dispatchItem(task);
            }
            else {
                this._queue.splice(i + 1, 0, task);
            }
        });
    }
    runExclusive(callback_1) {
        return __awaiter$2(this, arguments, void 0, function* (callback, weight = 1, priority = 0) {
            const [value, release] = yield this.acquire(weight, priority);
            try {
                return yield callback(value);
            }
            finally {
                release();
            }
        });
    }
    waitForUnlock(weight = 1, priority = 0) {
        if (weight <= 0)
            throw new Error(`invalid weight ${weight}: must be positive`);
        if (this._couldLockImmediately(weight, priority)) {
            return Promise.resolve();
        }
        else {
            return new Promise((resolve) => {
                if (!this._weightedWaiters[weight - 1])
                    this._weightedWaiters[weight - 1] = [];
                insertSorted(this._weightedWaiters[weight - 1], { resolve, priority });
            });
        }
    }
    isLocked() {
        return this._value <= 0;
    }
    getValue() {
        return this._value;
    }
    setValue(value) {
        this._value = value;
        this._dispatchQueue();
    }
    release(weight = 1) {
        if (weight <= 0)
            throw new Error(`invalid weight ${weight}: must be positive`);
        this._value += weight;
        this._dispatchQueue();
    }
    cancel() {
        this._queue.forEach((entry) => entry.reject(this._cancelError));
        this._queue = [];
    }
    _dispatchQueue() {
        this._drainUnlockWaiters();
        while (this._queue.length > 0 && this._queue[0].weight <= this._value) {
            this._dispatchItem(this._queue.shift());
            this._drainUnlockWaiters();
        }
    }
    _dispatchItem(item) {
        const previousValue = this._value;
        this._value -= item.weight;
        item.resolve([previousValue, this._newReleaser(item.weight)]);
    }
    _newReleaser(weight) {
        let called = false;
        return () => {
            if (called)
                return;
            called = true;
            this.release(weight);
        };
    }
    _drainUnlockWaiters() {
        if (this._queue.length === 0) {
            for (let weight = this._value; weight > 0; weight--) {
                const waiters = this._weightedWaiters[weight - 1];
                if (!waiters)
                    continue;
                waiters.forEach((waiter) => waiter.resolve());
                this._weightedWaiters[weight - 1] = [];
            }
        }
        else {
            const queuedPriority = this._queue[0].priority;
            for (let weight = this._value; weight > 0; weight--) {
                const waiters = this._weightedWaiters[weight - 1];
                if (!waiters)
                    continue;
                const i = waiters.findIndex((waiter) => waiter.priority <= queuedPriority);
                (i === -1 ? waiters : waiters.splice(0, i))
                    .forEach((waiter => waiter.resolve()));
            }
        }
    }
    _couldLockImmediately(weight, priority) {
        return (this._queue.length === 0 || this._queue[0].priority < priority) &&
            weight <= this._value;
    }
}
function insertSorted(a, v) {
    const i = findIndexFromEnd(a, (other) => v.priority <= other.priority);
    a.splice(i + 1, 0, v);
}
function findIndexFromEnd(a, predicate) {
    for (let i = a.length - 1; i >= 0; i--) {
        if (predicate(a[i])) {
            return i;
        }
    }
    return -1;
}

var __awaiter$1 = function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Mutex {
    constructor(cancelError) {
        this._semaphore = new Semaphore(1, cancelError);
    }
    acquire() {
        return __awaiter$1(this, arguments, void 0, function* (priority = 0) {
            const [, releaser] = yield this._semaphore.acquire(1, priority);
            return releaser;
        });
    }
    runExclusive(callback, priority = 0) {
        return this._semaphore.runExclusive(() => callback(), 1, priority);
    }
    isLocked() {
        return this._semaphore.isLocked();
    }
    waitForUnlock(priority = 0) {
        return this._semaphore.waitForUnlock(1, priority);
    }
    release() {
        if (this._semaphore.isLocked())
            this._semaphore.release();
    }
    cancel() {
        return this._semaphore.cancel();
    }
}

const t=new Uint8Array([0,97,115,109,1,0,0,0,1,48,8,96,3,127,127,127,1,127,96,3,127,127,127,0,96,2,127,127,0,96,1,127,1,127,96,3,127,127,126,1,126,96,3,126,127,127,1,126,96,2,127,126,0,96,1,127,1,126,3,11,10,0,0,2,1,3,4,5,6,1,7,5,3,1,0,1,7,85,9,3,109,101,109,2,0,5,120,120,104,51,50,0,0,6,105,110,105,116,51,50,0,2,8,117,112,100,97,116,101,51,50,0,3,8,100,105,103,101,115,116,51,50,0,4,5,120,120,104,54,52,0,5,6,105,110,105,116,54,52,0,7,8,117,112,100,97,116,101,54,52,0,8,8,100,105,103,101,115,116,54,52,0,9,10,251,22,10,242,1,1,4,127,32,0,32,1,106,33,3,32,1,65,16,79,4,127,32,3,65,16,107,33,6,32,2,65,168,136,141,161,2,106,33,3,32,2,65,137,235,208,208,7,107,33,4,32,2,65,207,140,162,142,6,106,33,5,3,64,32,3,32,0,40,2,0,65,247,148,175,175,120,108,106,65,13,119,65,177,243,221,241,121,108,33,3,32,4,32,0,65,4,106,34,0,40,2,0,65,247,148,175,175,120,108,106,65,13,119,65,177,243,221,241,121,108,33,4,32,2,32,0,65,4,106,34,0,40,2,0,65,247,148,175,175,120,108,106,65,13,119,65,177,243,221,241,121,108,33,2,32,5,32,0,65,4,106,34,0,40,2,0,65,247,148,175,175,120,108,106,65,13,119,65,177,243,221,241,121,108,33,5,32,6,32,0,65,4,106,34,0,79,13,0,11,32,2,65,12,119,32,5,65,18,119,106,32,4,65,7,119,106,32,3,65,1,119,106,5,32,2,65,177,207,217,178,1,106,11,32,1,106,32,0,32,1,65,15,113,16,1,11,146,1,0,32,1,32,2,106,33,2,3,64,32,1,65,4,106,32,2,75,69,4,64,32,0,32,1,40,2,0,65,189,220,202,149,124,108,106,65,17,119,65,175,214,211,190,2,108,33,0,32,1,65,4,106,33,1,12,1,11,11,3,64,32,1,32,2,79,69,4,64,32,0,32,1,45,0,0,65,177,207,217,178,1,108,106,65,11,119,65,177,243,221,241,121,108,33,0,32,1,65,1,106,33,1,12,1,11,11,32,0,32,0,65,15,118,115,65,247,148,175,175,120,108,34,0,65,13,118,32,0,115,65,189,220,202,149,124,108,34,0,65,16,118,32,0,115,11,63,0,32,0,65,8,106,32,1,65,168,136,141,161,2,106,54,2,0,32,0,65,12,106,32,1,65,137,235,208,208,7,107,54,2,0,32,0,65,16,106,32,1,54,2,0,32,0,65,20,106,32,1,65,207,140,162,142,6,106,54,2,0,11,195,4,1,6,127,32,1,32,2,106,33,6,32,0,65,24,106,33,4,32,0,65,40,106,40,2,0,33,3,32,0,32,0,40,2,0,32,2,106,54,2,0,32,0,65,4,106,34,5,32,5,40,2,0,32,2,65,16,79,32,0,40,2,0,65,16,79,114,114,54,2,0,32,2,32,3,106,65,16,73,4,64,32,3,32,4,106,32,1,32,2,252,10,0,0,32,0,65,40,106,32,2,32,3,106,54,2,0,15,11,32,3,4,64,32,3,32,4,106,32,1,65,16,32,3,107,34,2,252,10,0,0,32,0,65,8,106,34,3,32,3,40,2,0,32,4,40,2,0,65,247,148,175,175,120,108,106,65,13,119,65,177,243,221,241,121,108,54,2,0,32,0,65,12,106,34,3,32,3,40,2,0,32,4,65,4,106,40,2,0,65,247,148,175,175,120,108,106,65,13,119,65,177,243,221,241,121,108,54,2,0,32,0,65,16,106,34,3,32,3,40,2,0,32,4,65,8,106,40,2,0,65,247,148,175,175,120,108,106,65,13,119,65,177,243,221,241,121,108,54,2,0,32,0,65,20,106,34,3,32,3,40,2,0,32,4,65,12,106,40,2,0,65,247,148,175,175,120,108,106,65,13,119,65,177,243,221,241,121,108,54,2,0,32,0,65,40,106,65,0,54,2,0,32,1,32,2,106,33,1,11,32,1,32,6,65,16,107,77,4,64,32,6,65,16,107,33,8,32,0,65,8,106,40,2,0,33,2,32,0,65,12,106,40,2,0,33,3,32,0,65,16,106,40,2,0,33,5,32,0,65,20,106,40,2,0,33,7,3,64,32,2,32,1,40,2,0,65,247,148,175,175,120,108,106,65,13,119,65,177,243,221,241,121,108,33,2,32,3,32,1,65,4,106,34,1,40,2,0,65,247,148,175,175,120,108,106,65,13,119,65,177,243,221,241,121,108,33,3,32,5,32,1,65,4,106,34,1,40,2,0,65,247,148,175,175,120,108,106,65,13,119,65,177,243,221,241,121,108,33,5,32,7,32,1,65,4,106,34,1,40,2,0,65,247,148,175,175,120,108,106,65,13,119,65,177,243,221,241,121,108,33,7,32,8,32,1,65,4,106,34,1,79,13,0,11,32,0,65,8,106,32,2,54,2,0,32,0,65,12,106,32,3,54,2,0,32,0,65,16,106,32,5,54,2,0,32,0,65,20,106,32,7,54,2,0,11,32,1,32,6,73,4,64,32,4,32,1,32,6,32,1,107,34,1,252,10,0,0,32,0,65,40,106,32,1,54,2,0,11,11,97,1,1,127,32,0,65,16,106,40,2,0,33,1,32,0,65,4,106,40,2,0,4,127,32,1,65,12,119,32,0,65,20,106,40,2,0,65,18,119,106,32,0,65,12,106,40,2,0,65,7,119,106,32,0,65,8,106,40,2,0,65,1,119,106,5,32,1,65,177,207,217,178,1,106,11,32,0,40,2,0,106,32,0,65,24,106,32,0,65,40,106,40,2,0,16,1,11,255,3,2,3,126,1,127,32,0,32,1,106,33,6,32,1,65,32,79,4,126,32,6,65,32,107,33,6,32,2,66,214,235,130,238,234,253,137,245,224,0,124,33,3,32,2,66,177,169,172,193,173,184,212,166,61,125,33,4,32,2,66,249,234,208,208,231,201,161,228,225,0,124,33,5,3,64,32,3,32,0,41,3,0,66,207,214,211,190,210,199,171,217,66,126,124,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,33,3,32,4,32,0,65,8,106,34,0,41,3,0,66,207,214,211,190,210,199,171,217,66,126,124,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,33,4,32,2,32,0,65,8,106,34,0,41,3,0,66,207,214,211,190,210,199,171,217,66,126,124,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,33,2,32,5,32,0,65,8,106,34,0,41,3,0,66,207,214,211,190,210,199,171,217,66,126,124,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,33,5,32,6,32,0,65,8,106,34,0,79,13,0,11,32,2,66,12,137,32,5,66,18,137,124,32,4,66,7,137,124,32,3,66,1,137,124,32,3,66,207,214,211,190,210,199,171,217,66,126,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,133,66,135,149,175,175,152,182,222,155,158,127,126,66,157,163,181,234,131,177,141,138,250,0,125,32,4,66,207,214,211,190,210,199,171,217,66,126,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,133,66,135,149,175,175,152,182,222,155,158,127,126,66,157,163,181,234,131,177,141,138,250,0,125,32,2,66,207,214,211,190,210,199,171,217,66,126,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,133,66,135,149,175,175,152,182,222,155,158,127,126,66,157,163,181,234,131,177,141,138,250,0,125,32,5,66,207,214,211,190,210,199,171,217,66,126,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,133,66,135,149,175,175,152,182,222,155,158,127,126,66,157,163,181,234,131,177,141,138,250,0,125,5,32,2,66,197,207,217,178,241,229,186,234,39,124,11,32,1,173,124,32,0,32,1,65,31,113,16,6,11,134,2,0,32,1,32,2,106,33,2,3,64,32,2,32,1,65,8,106,79,4,64,32,1,41,3,0,66,207,214,211,190,210,199,171,217,66,126,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,32,0,133,66,27,137,66,135,149,175,175,152,182,222,155,158,127,126,66,157,163,181,234,131,177,141,138,250,0,125,33,0,32,1,65,8,106,33,1,12,1,11,11,32,1,65,4,106,32,2,77,4,64,32,0,32,1,53,2,0,66,135,149,175,175,152,182,222,155,158,127,126,133,66,23,137,66,207,214,211,190,210,199,171,217,66,126,66,249,243,221,241,153,246,153,171,22,124,33,0,32,1,65,4,106,33,1,11,3,64,32,1,32,2,73,4,64,32,0,32,1,49,0,0,66,197,207,217,178,241,229,186,234,39,126,133,66,11,137,66,135,149,175,175,152,182,222,155,158,127,126,33,0,32,1,65,1,106,33,1,12,1,11,11,32,0,32,0,66,33,136,133,66,207,214,211,190,210,199,171,217,66,126,34,0,32,0,66,29,136,133,66,249,243,221,241,153,246,153,171,22,126,34,0,32,0,66,32,136,133,11,77,0,32,0,65,8,106,32,1,66,214,235,130,238,234,253,137,245,224,0,124,55,3,0,32,0,65,16,106,32,1,66,177,169,172,193,173,184,212,166,61,125,55,3,0,32,0,65,24,106,32,1,55,3,0,32,0,65,32,106,32,1,66,249,234,208,208,231,201,161,228,225,0,124,55,3,0,11,244,4,2,3,127,4,126,32,1,32,2,106,33,5,32,0,65,40,106,33,4,32,0,65,200,0,106,40,2,0,33,3,32,0,32,0,41,3,0,32,2,173,124,55,3,0,32,2,32,3,106,65,32,73,4,64,32,3,32,4,106,32,1,32,2,252,10,0,0,32,0,65,200,0,106,32,2,32,3,106,54,2,0,15,11,32,3,4,64,32,3,32,4,106,32,1,65,32,32,3,107,34,2,252,10,0,0,32,0,65,8,106,34,3,32,3,41,3,0,32,4,41,3,0,66,207,214,211,190,210,199,171,217,66,126,124,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,55,3,0,32,0,65,16,106,34,3,32,3,41,3,0,32,4,65,8,106,41,3,0,66,207,214,211,190,210,199,171,217,66,126,124,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,55,3,0,32,0,65,24,106,34,3,32,3,41,3,0,32,4,65,16,106,41,3,0,66,207,214,211,190,210,199,171,217,66,126,124,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,55,3,0,32,0,65,32,106,34,3,32,3,41,3,0,32,4,65,24,106,41,3,0,66,207,214,211,190,210,199,171,217,66,126,124,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,55,3,0,32,0,65,200,0,106,65,0,54,2,0,32,1,32,2,106,33,1,11,32,1,65,32,106,32,5,77,4,64,32,5,65,32,107,33,2,32,0,65,8,106,41,3,0,33,6,32,0,65,16,106,41,3,0,33,7,32,0,65,24,106,41,3,0,33,8,32,0,65,32,106,41,3,0,33,9,3,64,32,6,32,1,41,3,0,66,207,214,211,190,210,199,171,217,66,126,124,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,33,6,32,7,32,1,65,8,106,34,1,41,3,0,66,207,214,211,190,210,199,171,217,66,126,124,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,33,7,32,8,32,1,65,8,106,34,1,41,3,0,66,207,214,211,190,210,199,171,217,66,126,124,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,33,8,32,9,32,1,65,8,106,34,1,41,3,0,66,207,214,211,190,210,199,171,217,66,126,124,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,33,9,32,2,32,1,65,8,106,34,1,79,13,0,11,32,0,65,8,106,32,6,55,3,0,32,0,65,16,106,32,7,55,3,0,32,0,65,24,106,32,8,55,3,0,32,0,65,32,106,32,9,55,3,0,11,32,1,32,5,73,4,64,32,4,32,1,32,5,32,1,107,34,1,252,10,0,0,32,0,65,200,0,106,32,1,54,2,0,11,11,188,2,1,5,126,32,0,65,24,106,41,3,0,33,1,32,0,41,3,0,34,2,66,32,90,4,126,32,0,65,8,106,41,3,0,34,3,66,1,137,32,0,65,16,106,41,3,0,34,4,66,7,137,124,32,1,66,12,137,32,0,65,32,106,41,3,0,34,5,66,18,137,124,124,32,3,66,207,214,211,190,210,199,171,217,66,126,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,133,66,135,149,175,175,152,182,222,155,158,127,126,66,157,163,181,234,131,177,141,138,250,0,125,32,4,66,207,214,211,190,210,199,171,217,66,126,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,133,66,135,149,175,175,152,182,222,155,158,127,126,66,157,163,181,234,131,177,141,138,250,0,125,32,1,66,207,214,211,190,210,199,171,217,66,126,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,133,66,135,149,175,175,152,182,222,155,158,127,126,66,157,163,181,234,131,177,141,138,250,0,125,32,5,66,207,214,211,190,210,199,171,217,66,126,66,31,137,66,135,149,175,175,152,182,222,155,158,127,126,133,66,135,149,175,175,152,182,222,155,158,127,126,66,157,163,181,234,131,177,141,138,250,0,125,5,32,1,66,197,207,217,178,241,229,186,234,39,124,11,32,2,124,32,0,65,40,106,32,2,66,31,131,167,16,6,11]);async function e(){return function(t){const{exports:{mem:e,xxh32:n,xxh64:r,init32:i,update32:a,digest32:o,init64:s,update64:u,digest64:c}}=t;let h=new Uint8Array(e.buffer);function g(t,n){if(e.buffer.byteLength<t+n){const r=Math.ceil((t+n-e.buffer.byteLength)/65536);e.grow(r),h=new Uint8Array(e.buffer);}}function f(t,e,n,r,i,a){g(t);const o=new Uint8Array(t);return h.set(o),n(0,e),o.set(h.subarray(0,t)),{update(e){let n;return h.set(o),"string"==typeof e?(g(3*e.length,t),n=w.encodeInto(e,h.subarray(t)).written):(g(e.byteLength,t),h.set(e,t),n=e.byteLength),r(0,t,n),o.set(h.subarray(0,t)),this},digest:()=>(h.set(o),a(i(0)))}}function y(t){return t>>>0}const b=2n**64n-1n;function d(t){return t&b}const w=new TextEncoder,l=0,p=0n;function x(t,e=l){return g(3*t.length,0),y(n(0,w.encodeInto(t,h).written,e))}function L(t,e=p){return g(3*t.length,0),d(r(0,w.encodeInto(t,h).written,e))}return {h32:x,h32ToString:(t,e=l)=>x(t,e).toString(16).padStart(8,"0"),h32Raw:(t,e=l)=>(g(t.byteLength,0),h.set(t),y(n(0,t.byteLength,e))),create32:(t=l)=>f(48,t,i,a,o,y),h64:L,h64ToString:(t,e=p)=>L(t,e).toString(16).padStart(16,"0"),h64Raw:(t,e=p)=>(g(t.byteLength,0),h.set(t),d(r(0,t.byteLength,e))),create64:(t=p)=>f(88,t,s,u,c,d)}}((await WebAssembly.instantiate(t)).instance)}

// src/index.ts
var updateWorkingMemoryTool = (memoryConfig) => {
  const schema = memoryConfig?.workingMemory?.schema;
  let inputSchema = objectType({
    memory: stringType().describe(`The Markdown formatted working memory content to store. This MUST be a string. Never pass an object.`)
  });
  if (schema) {
    inputSchema = objectType({
      memory: schema instanceof ZodObject ? schema : convertSchemaToZod({ jsonSchema: schema }).describe(
        `The JSON formatted working memory content to store.`
      )
    });
  }
  return createTool({
    id: "update-working-memory",
    description: `Update the working memory with new information. Any data not included will be overwritten.${schema ? " Always pass data as string to the memory field. Never pass an object." : ""}`,
    inputSchema,
    execute: async (params) => {
      const { context, threadId, memory, resourceId } = params;
      if (!threadId || !memory || !resourceId) {
        throw new Error("Thread ID, Memory instance, and resourceId are required for working memory updates");
      }
      let thread = await memory.getThreadById({ threadId });
      if (!thread) {
        thread = await memory.createThread({
          threadId,
          resourceId,
          memoryConfig
        });
      }
      if (thread.resourceId && thread.resourceId !== resourceId) {
        throw new Error(`Thread with id ${threadId} resourceId does not match the current resourceId ${resourceId}`);
      }
      const workingMemory = typeof context.memory === "string" ? context.memory : JSON.stringify(context.memory);
      await memory.updateWorkingMemory({
        threadId,
        resourceId,
        workingMemory,
        memoryConfig
      });
      return { success: true };
    }
  });
};
var __experimental_updateWorkingMemoryToolVNext = (config) => {
  return createTool({
    id: "update-working-memory",
    description: "Update the working memory with new information.",
    inputSchema: objectType({
      newMemory: stringType().optional().describe(
        `The ${config.workingMemory?.schema ? "JSON" : "Markdown"} formatted working memory content to store`
      ),
      searchString: stringType().optional().describe(
        "The working memory string to find. Will be replaced with the newMemory string. If this is omitted or doesn't exist, the newMemory string will be appended to the end of your working memory. Replacing single lines at a time is encouraged for greater accuracy. If updateReason is not 'append-new-memory', this search string must be provided or the tool call will be rejected."
      ),
      updateReason: enumType(["append-new-memory", "clarify-existing-memory", "replace-irrelevant-memory"]).optional().describe(
        "The reason you're updating working memory. Passing any value other than 'append-new-memory' requires a searchString to be provided. Defaults to append-new-memory"
      )
    }),
    execute: async (params) => {
      const { context, threadId, memory, resourceId } = params;
      if (!threadId || !memory || !resourceId) {
        throw new Error("Thread ID, Memory instance, and resourceId are required for working memory updates");
      }
      let thread = await memory.getThreadById({ threadId });
      if (!thread) {
        thread = await memory.createThread({
          threadId,
          resourceId,
          memoryConfig: config
        });
      }
      if (thread.resourceId && thread.resourceId !== resourceId) {
        throw new Error(`Thread with id ${threadId} resourceId does not match the current resourceId ${resourceId}`);
      }
      const workingMemory = context.newMemory || "";
      if (!context.updateReason) context.updateReason = `append-new-memory`;
      if (context.searchString && config.workingMemory?.scope === `resource` && context.updateReason === `replace-irrelevant-memory`) {
        context.searchString = void 0;
      }
      if (context.updateReason === `append-new-memory` && context.searchString) {
        context.searchString = void 0;
      }
      if (context.updateReason !== `append-new-memory` && !context.searchString) {
        return {
          success: false,
          reason: `updateReason was ${context.updateReason} but no searchString was provided. Unable to replace undefined with "${context.newMemory}"`
        };
      }
      const result = await memory.__experimental_updateWorkingMemoryVNext({
        threadId,
        resourceId,
        workingMemory,
        searchString: context.searchString,
        memoryConfig: config
      });
      if (result) {
        return result;
      }
      return { success: true };
    }
  });
};

// src/index.ts
var CHARS_PER_TOKEN = 4;
var DEFAULT_MESSAGE_RANGE = { before: 2, after: 2 };
var DEFAULT_TOP_K = 2;
var isZodObject = (v) => v instanceof ZodObject;
var Memory = class extends MastraMemory {
  constructor(config = {}) {
    super({ name: "Memory", ...config });
    const mergedConfig = this.getMergedThreadConfig({
      workingMemory: config.options?.workingMemory || {
        // these defaults are now set inside @mastra/core/memory in getMergedThreadConfig.
        // In a future release we can remove it from this block - for now if we remove it
        // and someone bumps @mastra/memory without bumping @mastra/core the defaults wouldn't exist yet
        enabled: false,
        template: this.defaultWorkingMemoryTemplate
      }
    });
    this.threadConfig = mergedConfig;
  }
  async validateThreadIsOwnedByResource(threadId, resourceId, config) {
    const resourceScope = typeof config?.semanticRecall === "object" && config?.semanticRecall?.scope === "resource";
    const thread = await this.storage.getThreadById({ threadId });
    if (!thread && !resourceScope) {
      throw new Error(`No thread found with id ${threadId}`);
    }
    if (thread && thread.resourceId !== resourceId) {
      throw new Error(
        `Thread with id ${threadId} is for resource with id ${thread.resourceId} but resource ${resourceId} was queried.`
      );
    }
  }
  checkStorageFeatureSupport(config) {
    if (typeof config.semanticRecall === `object` && config.semanticRecall.scope === `resource` && !this.storage.supports.selectByIncludeResourceScope) {
      throw new Error(
        `Memory error: Attached storage adapter "${this.storage.name || "unknown"}" doesn't support semanticRecall: { scope: "resource" } yet and currently only supports per-thread semantic recall.`
      );
    }
    if (config.workingMemory?.enabled && config.workingMemory.scope === `resource` && !this.storage.supports.resourceWorkingMemory) {
      throw new Error(
        `Memory error: Attached storage adapter "${this.storage.name || "unknown"}" doesn't support workingMemory: { scope: "resource" } yet and currently only supports per-thread working memory. Supported adapters: LibSQL, PostgreSQL, Upstash.`
      );
    }
  }
  async query({
    threadId,
    resourceId,
    selectBy,
    threadConfig
  }) {
    const config = this.getMergedThreadConfig(threadConfig || {});
    if (resourceId) await this.validateThreadIsOwnedByResource(threadId, resourceId, config);
    const vectorResults = [];
    this.logger.debug(`Memory query() with:`, {
      threadId,
      selectBy,
      threadConfig
    });
    this.checkStorageFeatureSupport(config);
    const defaultRange = DEFAULT_MESSAGE_RANGE;
    const defaultTopK = DEFAULT_TOP_K;
    const vectorConfig = typeof config?.semanticRecall === `boolean` ? {
      topK: defaultTopK,
      messageRange: defaultRange
    } : {
      topK: config?.semanticRecall?.topK ?? defaultTopK,
      messageRange: config?.semanticRecall?.messageRange ?? defaultRange
    };
    const resourceScope = typeof config?.semanticRecall === "object" && config?.semanticRecall?.scope === `resource`;
    if (config?.semanticRecall && selectBy?.vectorSearchString && this.vector) {
      const { embeddings, dimension } = await this.embedMessageContent(selectBy.vectorSearchString);
      const { indexName } = await this.createEmbeddingIndex(dimension, config);
      await Promise.all(
        embeddings.map(async (embedding) => {
          if (typeof this.vector === `undefined`) {
            throw new Error(
              `Tried to query vector index ${indexName} but this Memory instance doesn't have an attached vector db.`
            );
          }
          vectorResults.push(
            ...await this.vector.query({
              indexName,
              queryVector: embedding,
              topK: vectorConfig.topK,
              filter: resourceScope ? {
                resource_id: resourceId
              } : {
                thread_id: threadId
              }
            })
          );
        })
      );
    }
    let rawMessages;
    if (selectBy?.pagination) {
      const paginatedResult = await this.storage.getMessagesPaginated({
        threadId,
        resourceId,
        format: "v2",
        selectBy: {
          ...selectBy,
          ...vectorResults?.length ? {
            include: vectorResults.map((r) => ({
              id: r.metadata?.message_id,
              threadId: r.metadata?.thread_id,
              withNextMessages: typeof vectorConfig.messageRange === "number" ? vectorConfig.messageRange : vectorConfig.messageRange.after,
              withPreviousMessages: typeof vectorConfig.messageRange === "number" ? vectorConfig.messageRange : vectorConfig.messageRange.before
            }))
          } : {}
        },
        threadConfig: config
      });
      rawMessages = paginatedResult.messages;
    } else {
      rawMessages = await this.storage.getMessages({
        threadId,
        resourceId,
        format: "v2",
        selectBy: {
          ...selectBy,
          ...vectorResults?.length ? {
            include: vectorResults.map((r) => ({
              id: r.metadata?.message_id,
              threadId: r.metadata?.thread_id,
              withNextMessages: typeof vectorConfig.messageRange === "number" ? vectorConfig.messageRange : vectorConfig.messageRange.after,
              withPreviousMessages: typeof vectorConfig.messageRange === "number" ? vectorConfig.messageRange : vectorConfig.messageRange.before
            }))
          } : {}
        },
        threadConfig: config
      });
    }
    const list = new MessageList({ threadId, resourceId }).add(rawMessages, "memory");
    return {
      get messages() {
        const v1Messages = list.get.all.v1();
        if (selectBy?.last && v1Messages.length > selectBy.last) {
          return v1Messages.slice(v1Messages.length - selectBy.last);
        }
        return v1Messages;
      },
      get uiMessages() {
        return list.get.all.ui();
      },
      get messagesV2() {
        return list.get.all.v2();
      }
    };
  }
  async rememberMessages({
    threadId,
    resourceId,
    vectorMessageSearch,
    config
  }) {
    const threadConfig = this.getMergedThreadConfig(config || {});
    if (resourceId) await this.validateThreadIsOwnedByResource(threadId, resourceId, threadConfig);
    if (!threadConfig.lastMessages && !threadConfig.semanticRecall) {
      return {
        messages: [],
        messagesV2: []
      };
    }
    const messagesResult = await this.query({
      resourceId,
      threadId,
      selectBy: {
        last: threadConfig.lastMessages,
        vectorSearchString: threadConfig.semanticRecall && vectorMessageSearch ? vectorMessageSearch : void 0
      },
      threadConfig: config,
      format: "v2"
    });
    const list = new MessageList({ threadId, resourceId }).add(messagesResult.messagesV2, "memory");
    this.logger.debug(`Remembered message history includes ${messagesResult.messages.length} messages.`);
    return { messages: list.get.all.v1(), messagesV2: list.get.all.v2() };
  }
  async getThreadById({ threadId }) {
    return this.storage.getThreadById({ threadId });
  }
  async getThreadsByResourceId({
    resourceId,
    orderBy,
    sortDirection
  }) {
    return this.storage.getThreadsByResourceId({ resourceId, orderBy, sortDirection });
  }
  async getThreadsByResourceIdPaginated({
    resourceId,
    page,
    perPage,
    orderBy,
    sortDirection
  }) {
    return this.storage.getThreadsByResourceIdPaginated({
      resourceId,
      page,
      perPage,
      orderBy,
      sortDirection
    });
  }
  async saveThread({ thread }) {
    return this.storage.saveThread({ thread });
  }
  async updateThread({
    id,
    title,
    metadata
  }) {
    return this.storage.updateThread({
      id,
      title,
      metadata
    });
  }
  async deleteThread(threadId) {
    await this.storage.deleteThread({ threadId });
  }
  async updateWorkingMemory({
    threadId,
    resourceId,
    workingMemory,
    memoryConfig
  }) {
    const config = this.getMergedThreadConfig(memoryConfig || {});
    if (!config.workingMemory?.enabled) {
      throw new Error("Working memory is not enabled for this memory instance");
    }
    this.checkStorageFeatureSupport(config);
    const scope = config.workingMemory.scope || "thread";
    if (scope === "resource" && resourceId) {
      await this.storage.updateResource({
        resourceId,
        workingMemory
      });
    } else {
      const thread = await this.storage.getThreadById({ threadId });
      if (!thread) {
        throw new Error(`Thread ${threadId} not found`);
      }
      await this.storage.updateThread({
        id: threadId,
        title: thread.title || "Untitled Thread",
        metadata: {
          ...thread.metadata,
          workingMemory
        }
      });
    }
  }
  updateWorkingMemoryMutexes = /* @__PURE__ */ new Map();
  /**
   * @warning experimental! can be removed or changed at any time
   */
  async __experimental_updateWorkingMemoryVNext({
    threadId,
    resourceId,
    workingMemory,
    searchString,
    memoryConfig
  }) {
    const config = this.getMergedThreadConfig(memoryConfig || {});
    if (!config.workingMemory?.enabled) {
      throw new Error("Working memory is not enabled for this memory instance");
    }
    this.checkStorageFeatureSupport(config);
    const mutexKey = memoryConfig?.workingMemory?.scope === `resource` ? `resource-${resourceId}` : `thread-${threadId}`;
    const mutex = this.updateWorkingMemoryMutexes.has(mutexKey) ? this.updateWorkingMemoryMutexes.get(mutexKey) : new Mutex();
    this.updateWorkingMemoryMutexes.set(mutexKey, mutex);
    const release = await mutex.acquire();
    try {
      const existingWorkingMemory = await this.getWorkingMemory({ threadId, resourceId, memoryConfig }) || "";
      const template = await this.getWorkingMemoryTemplate({ memoryConfig });
      let reason = "";
      if (existingWorkingMemory) {
        if (searchString && existingWorkingMemory?.includes(searchString)) {
          workingMemory = existingWorkingMemory.replace(searchString, workingMemory);
          reason = `found and replaced searchString with newMemory`;
        } else if (existingWorkingMemory.includes(workingMemory) || template?.content?.trim() === workingMemory.trim()) {
          return {
            success: false,
            reason: `attempted to insert duplicate data into working memory. this entry was skipped`
          };
        } else {
          if (searchString) {
            reason = `attempted to replace working memory string that doesn't exist. Appending to working memory instead.`;
          } else {
            reason = `appended newMemory to end of working memory`;
          }
          workingMemory = existingWorkingMemory + `
${workingMemory}`;
        }
      } else if (workingMemory === template?.content) {
        return {
          success: false,
          reason: `try again when you have data to add. newMemory was equal to the working memory template`
        };
      } else {
        reason = `started new working memory`;
      }
      workingMemory = template?.content ? workingMemory.replaceAll(template?.content, "") : workingMemory;
      const scope = config.workingMemory.scope || "thread";
      if (scope === "resource" && resourceId) {
        await this.storage.updateResource({
          resourceId,
          workingMemory
        });
        if (reason) {
          return { success: true, reason };
        }
      } else {
        const thread = await this.storage.getThreadById({ threadId });
        if (!thread) {
          throw new Error(`Thread ${threadId} not found`);
        }
        await this.storage.updateThread({
          id: threadId,
          title: thread.title || "Untitled Thread",
          metadata: {
            ...thread.metadata,
            workingMemory
          }
        });
      }
      return { success: true, reason };
    } catch (e) {
      this.logger.error(e instanceof Error ? e.stack || e.message : JSON.stringify(e));
      return { success: false, reason: "Tool error." };
    } finally {
      release();
    }
  }
  chunkText(text, tokenSize = 4096) {
    const charSize = tokenSize * CHARS_PER_TOKEN;
    const chunks = [];
    let currentChunk = "";
    const words = text.split(/\s+/);
    for (const word of words) {
      const wordWithSpace = currentChunk ? " " + word : word;
      if (currentChunk.length + wordWithSpace.length > charSize) {
        chunks.push(currentChunk);
        currentChunk = word;
      } else {
        currentChunk += wordWithSpace;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    return chunks;
  }
  hasher = e();
  // embedding is computationally expensive so cache content -> embeddings/chunks
  embeddingCache = /* @__PURE__ */ new Map();
  firstEmbed;
  async embedMessageContent(content) {
    const key = (await this.hasher).h32(content);
    const cached = this.embeddingCache.get(key);
    if (cached) return cached;
    const chunks = this.chunkText(content);
    if (typeof this.embedder === `undefined`) {
      throw new Error(`Tried to embed message content but this Memory instance doesn't have an attached embedder.`);
    }
    const isFastEmbed = this.embedder.provider === `fastembed`;
    if (isFastEmbed && this.firstEmbed instanceof Promise) {
      await this.firstEmbed;
    }
    const promise = (this.embedder.specificationVersion === `v2` ? embedMany$1 : embedMany)({
      values: chunks,
      maxRetries: 3,
      // @ts-ignore
      model: this.embedder
    });
    if (isFastEmbed && !this.firstEmbed) this.firstEmbed = promise;
    const { embeddings } = await promise;
    const result = {
      embeddings,
      chunks,
      dimension: embeddings[0]?.length
    };
    this.embeddingCache.set(key, result);
    return result;
  }
  async saveMessages({
    messages,
    memoryConfig,
    format = `v1`
  }) {
    const updatedMessages = messages.map((m) => {
      if (MessageList.isMastraMessageV1(m)) {
        return this.updateMessageToHideWorkingMemory(m);
      }
      if (!m.type) m.type = `v2`;
      return this.updateMessageToHideWorkingMemoryV2(m);
    }).filter((m) => Boolean(m));
    const config = this.getMergedThreadConfig(memoryConfig);
    const result = this.storage.saveMessages({
      messages: new MessageList().add(updatedMessages, "memory").get.all.v2(),
      format: "v2"
    });
    if (this.vector && config.semanticRecall) {
      let indexName;
      await Promise.all(
        updatedMessages.map(async (message) => {
          let textForEmbedding = null;
          if (MessageList.isMastraMessageV2(message)) {
            if (message.content.content && typeof message.content.content === "string" && message.content.content.trim() !== "") {
              textForEmbedding = message.content.content;
            } else if (message.content.parts && message.content.parts.length > 0) {
              const joined = message.content.parts.filter((part) => part.type === "text").map((part) => part.text).join(" ").trim();
              if (joined) textForEmbedding = joined;
            }
          } else if (MessageList.isMastraMessageV1(message)) {
            if (message.content && typeof message.content === "string" && message.content.trim() !== "") {
              textForEmbedding = message.content;
            } else if (message.content && Array.isArray(message.content) && message.content.length > 0) {
              const joined = message.content.filter((part) => part.type === "text").map((part) => part.text).join(" ").trim();
              if (joined) textForEmbedding = joined;
            }
          }
          if (!textForEmbedding) return;
          const { embeddings, chunks, dimension } = await this.embedMessageContent(textForEmbedding);
          if (typeof indexName === `undefined`) {
            indexName = this.createEmbeddingIndex(dimension, config).then((result2) => result2.indexName);
          }
          if (typeof this.vector === `undefined`) {
            throw new Error(
              `Tried to upsert embeddings to index ${indexName} but this Memory instance doesn't have an attached vector db.`
            );
          }
          await this.vector.upsert({
            indexName: await indexName,
            vectors: embeddings,
            metadata: chunks.map(() => ({
              message_id: message.id,
              thread_id: message.threadId,
              resource_id: message.resourceId
            }))
          });
        })
      );
    }
    if (format === `v1`) return new MessageList().add(await result, "memory").get.all.v1();
    return result;
  }
  updateMessageToHideWorkingMemory(message) {
    const workingMemoryRegex = /<working_memory>([^]*?)<\/working_memory>/g;
    if (typeof message?.content === `string`) {
      return {
        ...message,
        content: message.content.replace(workingMemoryRegex, ``).trim()
      };
    } else if (Array.isArray(message?.content)) {
      const filteredContent = message.content.filter(
        (content) => content.type !== "tool-call" && content.type !== "tool-result" || content.toolName !== "updateWorkingMemory"
      );
      const newContent = filteredContent.map((content) => {
        if (content.type === "text") {
          return {
            ...content,
            text: content.text.replace(workingMemoryRegex, "").trim()
          };
        }
        return { ...content };
      });
      if (!newContent.length) return null;
      return { ...message, content: newContent };
    } else {
      return { ...message };
    }
  }
  updateMessageToHideWorkingMemoryV2(message) {
    const workingMemoryRegex = /<working_memory>([^]*?)<\/working_memory>/g;
    const newMessage = { ...message, content: { ...message.content } };
    if (newMessage.content.content && typeof newMessage.content.content === "string") {
      newMessage.content.content = newMessage.content.content.replace(workingMemoryRegex, "").trim();
    }
    if (newMessage.content.parts) {
      newMessage.content.parts = newMessage.content.parts.filter((part) => {
        if (part.type === "tool-invocation") {
          return part.toolInvocation.toolName !== "updateWorkingMemory";
        }
        return true;
      }).map((part) => {
        if (part.type === "text") {
          return {
            ...part,
            text: part.text.replace(workingMemoryRegex, "").trim()
          };
        }
        return part;
      });
      if (newMessage.content.parts.length === 0) {
        return null;
      }
    }
    return newMessage;
  }
  parseWorkingMemory(text) {
    if (!this.threadConfig.workingMemory?.enabled) return null;
    const workingMemoryRegex = /<working_memory>([^]*?)<\/working_memory>/g;
    const matches = text.match(workingMemoryRegex);
    const match = matches?.[0];
    if (match) {
      return match.replace(/<\/?working_memory>/g, "").trim();
    }
    return null;
  }
  async getWorkingMemory({
    threadId,
    resourceId,
    memoryConfig
  }) {
    const config = this.getMergedThreadConfig(memoryConfig || {});
    if (!config.workingMemory?.enabled) {
      return null;
    }
    this.checkStorageFeatureSupport(config);
    const scope = config.workingMemory.scope || "thread";
    let workingMemoryData = null;
    if (scope === "resource" && resourceId) {
      const resource = await this.storage.getResourceById({ resourceId });
      workingMemoryData = resource?.workingMemory || null;
    } else {
      const thread = await this.storage.getThreadById({ threadId });
      workingMemoryData = thread?.metadata?.workingMemory;
    }
    if (!workingMemoryData) {
      return null;
    }
    return workingMemoryData;
  }
  /**
   * Gets the working memory template for the current memory configuration.
   * Supports both ZodObject and JSONSchema7 schemas.
   *
   * @param memoryConfig - The memory configuration containing the working memory settings
   * @returns The working memory template with format and content, or null if working memory is disabled
   */
  async getWorkingMemoryTemplate({
    memoryConfig
  }) {
    const config = this.getMergedThreadConfig(memoryConfig || {});
    if (!config.workingMemory?.enabled) {
      return null;
    }
    if (config.workingMemory?.schema) {
      try {
        const schema = config.workingMemory.schema;
        let convertedSchema;
        if (isZodObject(schema)) {
          convertedSchema = zodToJsonSchema(schema);
        } else {
          convertedSchema = schema;
        }
        return { format: "json", content: JSON.stringify(convertedSchema) };
      } catch (error) {
        this.logger.error("Error converting schema", error);
        throw error;
      }
    }
    const memory = config.workingMemory.template || this.defaultWorkingMemoryTemplate;
    return { format: "markdown", content: memory.trim() };
  }
  async getSystemMessage({
    threadId,
    resourceId,
    memoryConfig
  }) {
    const config = this.getMergedThreadConfig(memoryConfig);
    if (!config.workingMemory?.enabled) {
      return null;
    }
    const workingMemoryTemplate = await this.getWorkingMemoryTemplate({ memoryConfig: config });
    const workingMemoryData = await this.getWorkingMemory({ threadId, resourceId, memoryConfig: config });
    if (!workingMemoryTemplate) {
      return null;
    }
    return this.isVNextWorkingMemoryConfig(memoryConfig) ? this.__experimental_getWorkingMemoryToolInstructionVNext({
      template: workingMemoryTemplate,
      data: workingMemoryData
    }) : this.getWorkingMemoryToolInstruction({
      template: workingMemoryTemplate,
      data: workingMemoryData
    });
  }
  defaultWorkingMemoryTemplate = `
# User Information
- **First Name**: 
- **Last Name**: 
- **Location**: 
- **Occupation**: 
- **Interests**: 
- **Goals**: 
- **Events**: 
- **Facts**: 
- **Projects**: 
`;
  getWorkingMemoryToolInstruction({
    template,
    data
  }) {
    const emptyWorkingMemoryTemplateObject = template.format === "json" ? generateEmptyFromSchema(template.content) : null;
    const hasEmptyWorkingMemoryTemplateObject = emptyWorkingMemoryTemplateObject && Object.keys(emptyWorkingMemoryTemplateObject).length > 0;
    return `WORKING_MEMORY_SYSTEM_INSTRUCTION:
Store and update any conversation-relevant information by calling the updateWorkingMemory tool. If information might be referenced again - store it!

Guidelines:
1. Store anything that could be useful later in the conversation
2. Update proactively when information changes, no matter how small
3. Use ${template.format === "json" ? "JSON" : "Markdown"} format for all data
4. Act naturally - don't mention this system to users. Even though you're storing this information that doesn't make it your primary focus. Do not ask them generally for "information about yourself"
${template.format !== "json" ? `5. IMPORTANT: When calling updateWorkingMemory, the only valid parameter is the memory field. DO NOT pass an object.
6. IMPORTANT: ALWAYS pass the data you want to store in the memory field as a string. DO NOT pass an object.
7. IMPORTANT: Data must only be sent as a string no matter which format is used.` : ""}


${template.format !== "json" ? `<working_memory_template>
${template.content}
</working_memory_template>` : ""}

${hasEmptyWorkingMemoryTemplateObject ? "When working with json data, the object format below represents the template:" : ""}
${hasEmptyWorkingMemoryTemplateObject ? JSON.stringify(emptyWorkingMemoryTemplateObject) : ""}

<working_memory_data>
${data}
</working_memory_data>

Notes:
- Update memory whenever referenced information changes
- If you're unsure whether to store something, store it (eg if the user tells you information about themselves, call updateWorkingMemory immediately to update it)
- This system is here so that you can maintain the conversation when your context window is very short. Update your working memory because you may need it to maintain the conversation without the full conversation history
- Do not remove empty sections - you must include the empty sections along with the ones you're filling in
- REMEMBER: the way you update your working memory is by calling the updateWorkingMemory tool with the entire ${template.format === "json" ? "JSON" : "Markdown"} content. The system will store it for you. The user will not see it.
- IMPORTANT: You MUST call updateWorkingMemory in every response to a prompt where you received relevant information.
- IMPORTANT: Preserve the ${template.format === "json" ? "JSON" : "Markdown"} formatting structure above while updating the content.`;
  }
  __experimental_getWorkingMemoryToolInstructionVNext({
    template,
    data
  }) {
    return `WORKING_MEMORY_SYSTEM_INSTRUCTION:
Store and update any conversation-relevant information by calling the updateWorkingMemory tool.

Guidelines:
1. Store anything that could be useful later in the conversation
2. Update proactively when information changes, no matter how small
3. Use ${template.format === "json" ? "JSON" : "Markdown"} format for all data
4. Act naturally - don't mention this system to users. Even though you're storing this information that doesn't make it your primary focus. Do not ask them generally for "information about yourself"
5. If your memory has not changed, you do not need to call the updateWorkingMemory tool. By default it will persist and be available for you in future interactions
6. Information not being relevant to the current conversation is not a valid reason to replace or remove working memory information. Your working memory spans across multiple conversations and may be needed again later, even if it's not currently relevant.

<working_memory_template>
${template.content}
</working_memory_template>

<working_memory_data>
${data}
</working_memory_data>

Notes:
- Update memory whenever referenced information changes
${template.content !== this.defaultWorkingMemoryTemplate ? `- Only store information if it's in the working memory template, do not store other information unless the user asks you to remember it, as that non-template information may be irrelevant` : `- If you're unsure whether to store something, store it (eg if the user tells you information about themselves, call updateWorkingMemory immediately to update it)
`}
- This system is here so that you can maintain the conversation when your context window is very short. Update your working memory because you may need it to maintain the conversation without the full conversation history
- REMEMBER: the way you update your working memory is by calling the updateWorkingMemory tool with the ${template.format === "json" ? "JSON" : "Markdown"} content. The system will store it for you. The user will not see it. 
- IMPORTANT: You MUST call updateWorkingMemory in every response to a prompt where you received relevant information if that information is not already stored.
- IMPORTANT: Preserve the ${template.format === "json" ? "JSON" : "Markdown"} formatting structure above while updating the content.
`;
  }
  isVNextWorkingMemoryConfig(config) {
    if (!config?.workingMemory) return false;
    const isMDWorkingMemory = !(`schema` in config.workingMemory) && (typeof config.workingMemory.template === `string` || config.workingMemory.template) && config.workingMemory;
    return Boolean(isMDWorkingMemory && isMDWorkingMemory.version === `vnext`);
  }
  getTools(config) {
    const mergedConfig = this.getMergedThreadConfig(config);
    if (mergedConfig.workingMemory?.enabled) {
      return {
        updateWorkingMemory: this.isVNextWorkingMemoryConfig(mergedConfig) ? (
          // use the new experimental tool
          __experimental_updateWorkingMemoryToolVNext(mergedConfig)
        ) : updateWorkingMemoryTool(mergedConfig)
      };
    }
    return {};
  }
  /**
   * Updates the metadata of a list of messages
   * @param messages - The list of messages to update
   * @returns The list of updated messages
   */
  async updateMessages({
    messages
  }) {
    if (messages.length === 0) return [];
    return this.storage.updateMessages({ messages });
  }
  /**
   * Deletes one or more messages
   * @param input - Must be an array containing either:
   *   - Message ID strings
   *   - Message objects with 'id' properties
   * @returns Promise that resolves when all messages are deleted
   */
  async deleteMessages(input) {
    let messageIds;
    if (!Array.isArray(input)) {
      throw new Error("Invalid input: must be an array of message IDs or message objects");
    }
    if (input.length === 0) {
      return;
    }
    messageIds = input.map((item) => {
      if (typeof item === "string") {
        return item;
      } else if (item && typeof item === "object" && "id" in item) {
        return item.id;
      } else {
        throw new Error("Invalid input: array items must be strings or objects with an id property");
      }
    });
    const invalidIds = messageIds.filter((id) => !id || typeof id !== "string");
    if (invalidIds.length > 0) {
      throw new Error("All message IDs must be non-empty strings");
    }
    await this.storage.deleteMessages(messageIds);
  }
};

export { Memory };
